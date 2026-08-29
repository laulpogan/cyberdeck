// The fixtures, held to what the brief demands of them.
//
// A fixture set fails in four ways, and each has its own check here: it drifts
// from the dark variant, it reads the clock, it invents a measurement to make a
// component look alive, or it is shaped wrong and the component throws somewhere
// no test looks.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { FIXTURES, FIXTURE_KEYS, brightFor, darkFor, fieldsFor, callFor }
  from '../app/fixtures/index.js';
import { darkOf, hasValue, addedOrChanged, normalizeField, clone } from '../app/fixtures/project.js';
import { allComponents, componentByKey } from '../app/src/registry/index.js';
import { resolveModel, emptyEvidenceState } from '../app/src/evidence.js';

const FIXTURE_DIR = fileURLToPath(new URL('../app/fixtures/', import.meta.url));

const components = allComponents();

test('every registered component has a fixture, and no fixture is orphaned', () => {
  const keys = components.map((c) => c.key).sort();
  assert.deepEqual(keys, [...FIXTURE_KEYS].sort(), 'registry and fixtures cover the same set');
});

test('every declared evidence field actually carries a value in the bright model', () => {
  const offenders = [];
  for (const key of FIXTURE_KEYS) {
    for (const field of fieldsFor(key)) {
      if (!hasValue(brightFor(key), field.path)) offenders.push(`${key}.${field.path}`);
    }
  }
  assert.deepEqual(offenders, [],
    'a field that was never populated cannot be the one that was removed');
});

test('the dark variant is derived, not written: it is exactly the projection', () => {
  for (const key of FIXTURE_KEYS) {
    assert.deepEqual(darkFor(key), darkOf(brightFor(key), fieldsFor(key)), key);
  }
});

test('the dark variant invents nothing: no key, no element, no value appears', () => {
  const offenders = [];
  for (const key of FIXTURE_KEYS) {
    // A `{ path, value }` field is the one way a dark model may differ from null:
    // a producer that is unreachable does not send `null` for its own state, it
    // sends `unavailable`, and a component that gates on it has to be fed the
    // truth rather than a type error. Those substitutions are declared, and only
    // at the path that declared them.
    const allowances = fieldsFor(key).filter((field) => field.value !== null);
    const problems = addedOrChanged(brightFor(key), darkFor(key), '', allowances);
    if (problems.length) offenders.push(`${key}: ${problems.join(', ')}`);
  }
  assert.deepEqual(offenders, [], 'the dark model is a subtraction only');
});

test('the whole fixture set serializes identically twice, in the same process', () => {
  // No replacer array: an array passed to JSON.stringify filters keys at every
  // depth, which would compare a stub of each object instead of the model.
  const once = JSON.stringify(FIXTURES);
  const twice = JSON.stringify(FIXTURES);
  assert.equal(once, twice);
  assert.ok(once.length > 4000, `and it is not empty by accident (${once.length} bytes)`);
});

test('no fixture reads the clock or a random number', () => {
  const forbidden = /Math\.random|Date\.now|new Date\(\s*\)|performance\.now/;
  const offenders = [];
  for (const file of readdirSync(FIXTURE_DIR)) {
    if (!file.endsWith('.js')) continue;
    const source = readFileSync(FIXTURE_DIR + file, 'utf8');
    const comments = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    if (forbidden.test(comments)) offenders.push(file);
  }
  assert.deepEqual(offenders, [],
    'a capture that differs from the one before it for no reviewable reason is not a capture');
});

test('the frozen instant is a literal, so every timestamp in every fixture is a constant', async () => {
  const { NOW_ISO, NOW_MS, NOW_S, beforeMs, beforeS } = await import('../app/fixtures/time.js');
  assert.equal(NOW_ISO, '2026-08-28T09:14:00Z');
  assert.equal(NOW_MS, Date.parse(NOW_ISO));
  assert.equal(beforeMs(60), NOW_MS - 60000);
  assert.equal(beforeS(60), NOW_S - 60);
});

test('every component renders its bright model, and renders its dark one too', () => {
  const failures = [];
  for (const component of components) {
    const key = component.key;
    let bright = null;
    let dark = null;
    try {
      bright = component.fn(brightFor(key));
      dark = component.fn(darkFor(key));
    } catch (error) {
      failures.push(`${key}: ${error.message}`);
      continue;
    }
    for (const [name, html] of [['bright', bright], ['dark', dark]]) {
      if (typeof html !== 'string' || !html.includes('<')) {
        failures.push(`${key} ${name}: returned no markup`);
      }
    }
    assert.ok(!failures.length, failures.join(' | '));
  }
});

test('removing the evidence changes what is on screen, and says why', () => {
  const unchanged = [];
  const undeclared = [];
  const drawnNotDeclared = [];
  for (const component of components) {
    const key = component.key;
    const bright = component.fn(brightFor(key));
    const dark = component.fn(darkFor(key));
    if (fieldsFor(key).length && bright === dark) unchanged.push(key);

    // A refusal that is written in the markup can be found by a review script; a
    // refusal that is only drawn can be found by a person. Both are refusals, but
    // the library's own claim is that the first kind is the point, so the
    // component that only draws one is named here rather than quietly passing.
    const declared = dark.includes('data-motion="still"')
      || dark.includes('data-still-reason');
    if (declared) continue;
    if (component.refusalText) {
      assert.ok(dark.includes(component.refusalText),
        `${key} refuses in words only, and its stated word is not on screen: ${component.refusalText}`);
      drawnNotDeclared.push(key);
      continue;
    }
    undeclared.push(key);
  }
  assert.deepEqual(unchanged, [], 'the dark variant renders something different');
  assert.deepEqual(undeclared, [],
    `drawn-only refusals must name the word they draw: ${drawnNotDeclared.join(', ')} are covered, these are not`);
  assert.ok(drawnNotDeclared.length < components.length,
    'most refusals are declared in the markup, not merely drawn');
});

test('a component with no evidence field refuses structurally, which is a claim too', () => {
  const structural = components.filter((c) => fieldsFor(c.key).length === 0);
  for (const component of structural) {
    const html = component.fn(brightFor(component.key));
    const declared = html.includes('data-still-reason');
    if (!declared) {
      // The two legends that draw their refusal instead of stamping it. Named, not
      // waved through: the standard sheet in the same role does stamp, and the
      // difference is a library gap rather than an app problem.
      assert.ok(component.refusalText && html.includes(component.refusalText),
        `${component.key} has nothing to strip and says its refusal only in words`);
      continue;
    }
    assert.ok(declared, `${component.key} must refuse in its own markup`);
  }
  assert.ok(structural.length >= 2, 'the two legends at least');
});

test('rendering is pure: one model renders the same bytes and is never written to', () => {
  for (const component of components) {
    const key = component.key;
    const model = clone(brightFor(key));
    const before = JSON.stringify(model);
    const first = component.fn(model);
    const second = component.fn(model);
    assert.equal(first, second, `${key} renders differently the second time`);
    assert.equal(JSON.stringify(model), before, `${key} wrote to the model it was handed`);
  }
});

test('copy-to-use is the real call, and the strip control changes one field at a time', () => {
  const forComponent = components[0];
  const key = forComponent.key;
  assert.equal(callFor(key), `${key}(${JSON.stringify(brightFor(key), null, 2)})`);
  // The strip control removes one field, not the whole picture.
  const field = normalizeField(fieldsFor('collar')[0]).path;
  const stripped = resolveModel('collar', { globalOff: false, perKey: { collar: [field] } });
  assert.equal(stripped.elapsedSeconds, null);
  assert.equal(stripped.sourceState, 'live', 'everything else is untouched');
  assert.equal(stripped.cite, brightFor('collar').cite);
});

test('evidence on means the bright model, byte for byte', () => {
  for (const key of FIXTURE_KEYS) {
    assert.deepEqual(resolveModel(key, emptyEvidenceState()), brightFor(key));
  }
});

// --------------------------------------------------------------------------
// Finding #9: a bright model that refuses instead of demonstrating hides the
// component it is supposed to show. The fixture is the app's responsibility, so the
// rule belongs to the app's tests. `stripChart` is the case that proved it: the
// showcase's only over-time instrument drew no line anywhere in this application,
// because its bright model retained one sample and `draw.js` `curve` had no caller in
// the chart that is named after a curve.
const NOT_KINETIC = {
  twoState: 'a two-state glyph: HTML furniture with no event to place',
  queueState: 'a queue read-out: a measured empty is a sentence, not a motion',
  garage: 'a list of parked attempts: rows are records',
  grid: 'a table of fields: a table is read, not watched',
  gevulot: 'a visibility contract: a legal state, not an event',
  dominator: 'a domination chain: three grants beside each other',
  ladder: 'a priced ladder: rungs are prices, and prices do not move themselves',
  dossier: 'a dossier: what happened is written down',
  channel: 'a trust legend: amplitude is drawn, and now says so',
  standardSheet: 'a legend is not a reading',
  syncRatio: 'a total is not a rate',
  redaction: 'a redaction list: the row stays and the mark says what was withheld',
};

test('every bright model demonstrates its component, or says why it cannot', () => {
  const MOVING = /data-motion="(arrive|count|level|elapsed|trace|traffic|cycle|decay|intent)"/;
  const silent = [];
  for (const entry of allComponents()) {
    const key = entry.key;
    const html = entry.fn(brightFor(key));
    if (MOVING.test(html)) {
      assert.ok(!NOT_KINETIC[key], `${key}: listed as not kinetic but it does move`);
      continue;
    }
    if (!NOT_KINETIC[key]) silent.push(key);
  }
  assert.deepEqual(silent, [],
    'these bright models show no motion and state no reason for it: ' + silent.join(', '));
});

test('the strip chart draws a series when one is retained, in the app itself', () => {
  const html = componentByKey('stripChart').fn(brightFor('stripChart'));
  assert.match(html, /<polyline/, 'the line exists on the page, not only in the primitive');
  assert.match(html, /class="cd-riv-series" data-lane="OUTPUT" transform="translate\(/,
    'inside its own lane -- an untranslated curve draws over every label');
  assert.match(html, /12 retained samples on OUTPUT/, 'the note counts what it drew');
  assert.doesNotMatch(html, /ONE SAMPLE/, 'a series is not one sample');
  const dark = componentByKey('stripChart').fn(darkFor('stripChart'));
  assert.doesNotMatch(dark, /<polyline/, 'and the switch takes the line away with the data');
  assert.match(dark, /no sample was retained/, 'saying so, in a refusal');
});

test('a fixture that fabricates says so where the fabrication lives', () => {
  // The app has no producer behind `source.snapshot_series(session_id)`. A demo model
  // is allowed to invent what a producer would send -- once -- but only if the file
  // admits it, and admits the determinism that keeps captures identical.
  const src = readFileSync(fileURLToPath(new URL('../app/fixtures/river.js', import.meta.url)),
    'utf8');
  assert.match(src, /deterministic/, 'states that the series is computed, not measured');
  assert.match(src, /Math\.sin/, 'by a named formula');
  // A *call* to them, not the prose that forbids them -- the comment above the model
  // says "no Math.random", and an assertion that matched the words would have failed
  // for the right reason and taught nobody anything.
  assert.doesNotMatch(src, /Math\.random\s*\(|Date\.now\s*\(/,
    'and nothing that changes between captures is actually invoked');
});
