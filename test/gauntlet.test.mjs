// The gauntlet's own integrity, and the two motion facts it was written to hold down.
//
// A gap list that can drift is worse than no gap list: it lets a later run report green over a
// component that has quietly stopped resembling the picture it was built from. So every row is
// checked against the vault's records (the eye, the manifest, the measured spec), and the two
// measurements that turned out to be defects in the library are asserted here too, where a
// regression fails in `npm test` rather than only in the browser gate.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { allComponents, COMPONENT_KEYS } from '../app/src/registry/index.js';

const here = (f) => fileURLToPath(new URL(f, import.meta.url));
const GAUNTLET = JSON.parse(readFileSync(here('../vault/GAUNTLET.json'), 'utf8')).gaps;
const EYEBALL = JSON.parse(readFileSync(here('../vault/EYEBALL.json'), 'utf8'));
const MANIFEST = JSON.parse(readFileSync(here('../vault/MANIFEST.json'), 'utf8')).files;
const SPECS = readFileSync(here('../vault/SPECS.md'), 'utf8');
const SPECS_FOR = JSON.parse(readFileSync(here('../vault/SPECS-FOR.json'), 'utf8'));
const TOOL = readFileSync(here('../app/verify/gauntlet.mjs'), 'utf8');
const byName = new Map(Object.values(MANIFEST).map((r) => [r.file.split('/').pop(), r]));
const KEYS = new Set(allComponents().map((c) => c.key));

test('every gap names a component the registry can render, or a route', () => {
  for (const gap of GAUNTLET) {
    if (gap.component) {
      assert.ok(KEYS.has(gap.component), `${gap.id} names ${gap.component}, which is not in the registry`);
    } else {
      assert.ok(gap.route, `${gap.id} names neither a component nor a route`);
      assert.match(gap.route, /^#\//, `${gap.id}'s route needs the hash — the router reads it`);
    }
  }
});

test('no gap is asserted from a picture nobody looked at', () => {
  for (const gap of GAUNTLET) {
    const record = byName.get(gap.reference);
    assert.ok(record, `${gap.id} cites ${gap.reference}, which is not in vault/MANIFEST.json`);
    const seen = EYEBALL[record.file];
    assert.ok(seen && seen.contentVerified,
      `${gap.id} is held against ${gap.reference}, which the eye did not verify`);
  }
});

test('every quoted figure is the figure vault/SPECS.md measured', () => {
  // The numbers on the sheet came out of the GIF frames. Typing a nicer one is how a spec
  // becomes a preference, so each row's sentence has to appear in the generated document.
  const squash = (t) => t.replace(/\s+/g, ' ');
  const specs = squash(SPECS);
  for (const gap of GAUNTLET) {
    const figure = squash(gap.referenceFigure);
    // SPECS writes `travel of the bright head: 0.701 of the frame crossed, 0.46 of the way
    // along at half the duration`; a row may quote a fragment of that sentence, so the test
    // requires a contiguous piece of at least 18 characters, not the whole line.
    const fragments = figure.split(/[;·,]/).map((f) => f.trim()).filter((f) => f.length >= 18);
    assert.ok(fragments.length, `${gap.id} quotes a figure too short to check: ${figure}`);
    for (const frag of fragments) {
      assert.ok(specs.includes(frag), `${gap.id} quotes "${frag}", which vault/SPECS.md does not say`);
    }
  }
});

test('a `for` name in SPECS-FOR resolves to something a person can render', () => {
  // SPECS-FOR is where coverage is counted, so a name that resolves to nothing is not a typo —
  // it is a component counted as spec-held that no page can draw. `level` and `trace` are mark
  // kinds and are legitimate quotients; `rules page` is the one non-component target the vault
  // quotes to. Anything else has to be in the registry.
  const components = new Set(COMPONENT_KEYS);
  const MARK_KINDS = new Set(['arrive', 'decay', 'count', 'level', 'elapsed', 'trace', 'traffic', 'cycle', 'intent', 'still', 'attrs']);
  let held = 0;
  for (const [file, entry] of Object.entries(SPECS_FOR)) {
    if (file === '_about') continue;
    for (const name of entry.for || []) {
      assert.ok(components.has(name) || MARK_KINDS.has(name) || name === 'rules page',
        `${file} is quoted for "${name}", which is not a component in the registry, not a mark kind, `
        + `and not the rules page — a name that resolves to nothing is counted as coverage nobody can render`);
      if (components.has(name)) held += 1;
    }
  }
  assert.ok(held >= 17, `only ${held} component quotients exist across the vault; the count of `
    + `spec-held components is a coverage claim and it went down`);
});

test('every assert kind is implemented by the tool, not wished for', () => {
  for (const gap of GAUNTLET) {
    if (!gap.assert) {
      // A row may go unasserted for exactly two reasons: it is a caution/counter-example (an
      // appearance lesson, not a rate), or the ASSERTION LANGUAGE CANNOT SAY IT — which is the
      // case `tape-sweeps-a-drawn-strip` was registered under, because no mark kind translates a
      // marker along an axis and a fake assert would turn a real capability gap into a green
      // light. The second door stays shut unless the reason is long enough to be a real reason.
      const stated = typeof gap.notHeld === 'string' && gap.notHeld.length >= 80;
      assert.ok(gap.heldAs === 'caution' || gap.heldAs === 'counter-example' || stated,
        `${gap.id} asserts nothing, is held as "${gap.heldAs}", and carries no reason of 80+ `
        + `characters saying why the tool cannot assert it — an unasserted row that shrugs is a `
        + `pass pretending to be a gap`);
      continue;
    }
    assert.ok(TOOL.includes(`a.kind === '${gap.assert.kind}'`),
      `${gap.id} asserts "${gap.assert.kind}", which app/verify/gauntlet.mjs does not implement`);
  }
});

test('a row cannot be both unasserted and counted as a pass', () => {
  // The tool's `held` verdict is what keeps documentation out of the green column. This asserts
  // the tool still says it, rather than asserting my memory of what it says.
  assert.match(TOOL, /verdict: 'held'/);
  assert.match(TOOL, /held, not asserted/);
});

test('the globe turns on elapsed time, not on how many frames the display hands it', () => {
  // Found by the gauntlet: the pin's angle used to advance `2π / (period × 60)` per animation
  // frame, which is a 60 Hz assumption wearing a measurement. Timed against its own declared
  // period, the same mark turned in 1.1s on a compositor with no refresh lock and turns in
  // 4.00s now — the 4s the mark declares.
  const src = readFileSync(here('../src/components/globe.js'), 'utf8');
  assert.match(src, /performance\.now\(\) - t0/,
    'the turn has to be derived from elapsed time');
  assert.doesNotMatch(src, /rot \+= /,
    'the turn must not advance a fixed increment per frame — that ties a measured period to a refresh rate');
});

test('the beam carries its rate in a keyframe, and the reference figure is the reason', () => {
  const src = readFileSync(here('../src/runtime.js'), 'utf8');
  assert.match(src, /\(0 - deg \* 0\.07\) \+ 'deg'/,
    'the tilt keeps 93% of its travel in the first half of the swing, which is what the verified balance measured');
});
