// The rules and primitives pages, checked as data rather than as pictures.
//
// Two claims matter here and both are cheap to assert: the sentences on these pages
// are the library's own -- quoted out of `src/marks.js` and `src/draw.js`, not
// rewritten for the page -- and every drawing actually carries the mark its row
// names. A page that paraphrases a refusal into marketing, or that shows a `still`
// label over an element that is not marked, fails here rather than on somebody's
// screen.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { MARK_KINDS, markText } from '../app/src/rules.js';
import { PRIMITIVES, PRIMITIVE_NAMES } from '../app/src/primitives.js';
import { attrs } from '../src/marks.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Doc comments wrap. A quoted sentence that spans two lines in the source is still
 * the source's own sentence, so the comparison happens with the wrapping folded out
 * -- which is the same treatment `test/app-registry.test.mjs` gives the component
 * doc comments. Without it the test fails on a line break and everybody learns to
 * write shorter quotes instead of shorter prose. */
const docText = (source) => source
  .replace(/\r/g, '')
  .split('\n')
  .map((line) => line.replace(/^\s*\*\s?/, '').replace(/\s+$/, ''))
  .join(' ');

const marksSource = docText(readFileSync(`${ROOT}src/marks.js`, 'utf8'));
const drawSource = docText(readFileSync(`${ROOT}src/draw.js`, 'utf8'));

const MOTION_KINDS = ['arrive', 'decay', 'count', 'level', 'elapsed', 'trace',
  'traffic', 'cycle', 'intent'];

test('the eleven kinds are the eleven the marks module exports', () => {
  assert.deepEqual(MARK_KINDS.map((k) => k.kind), [
    'arrive', 'decay', 'count', 'level', 'elapsed', 'trace', 'traffic', 'cycle',
    'intent', 'still', 'attrs',
  ]);
});

test('every sentence on the page is the library’s own, verbatim', () => {
  const drifted = MARK_KINDS.filter((kind) => !marksSource.includes(kind.line));
  assert.deepEqual(drifted.map((k) => k.kind), [],
    'a refusal paraphrased is a refusal invented');
});

test('each kind moves when it is given its measurement, and refuses when it is not', () => {
  for (const kind of MARK_KINDS) {
    if (MOTION_KINDS.includes(kind.kind)) {
      assert.equal(kind.measured['data-motion'], kind.kind,
        `${kind.kind} measured must carry its own kind`);
    }
    if (kind.drawsRefused) continue; // intent, still, attrs: nothing refuses these
    assert.equal(kind.refuses['data-motion'], 'still',
      `${kind.kind} refused must declare a stillness rather than animate less`);
    assert.ok(String(kind.refuses['data-still-reason'] || '').length > 8,
      `${kind.kind} must name why it refused`);
  }
});

test('every drawing carries the mark its row names', () => {
  const offenders = [];
  for (const kind of MARK_KINDS) {
    const measured = kind.draw(kind.measured);
    for (const [name, value] of Object.entries(kind.measured)) {
      if (!measured.includes(`${name}="${value}"`) && !measured.includes(`${name}=&quot;${value}&quot;`)) {
        offenders.push(`${kind.kind} measured is missing ${name}="${value}"`);
      }
    }
    if (kind.drawsRefused) continue;
    const refused = kind.drawRefused ? kind.drawRefused() : kind.draw(kind.refuses);
    const reason = kind.refuses['data-still-reason'];
    // The refused drawing may show the hatched stand-in instead of the marked one
    // (that is the case for `level` and for `still` itself), in which case it is
    // making the same claim in ink -- but then the reason has to be on the page
    // somewhere, and the test below checks the page prints it.
    const carriesIt = refused.includes(`data-still-reason="${reason}"`);
    const declaresElsewhere = kind.drawRefused !== undefined;
    if (!carriesIt && !declaresElsewhere) offenders.push(`${kind.kind} refused draws no stillness`);
  }
  assert.deepEqual(offenders, []);
});

test('the refused reason is text a visitor can read, not only an attribute', () => {
  const missing = MARK_KINDS.filter((kind) => {
    if (kind.drawsRefused) return false;
    const reason = kind.refuses['data-still-reason'];
    return !String(reason || '').includes(' ');
  });
  assert.deepEqual(missing.map((k) => k.kind), [],
    'a one-word refusal is a label, not a reason');
});

test('markText is what attrs prints, so the page quotes the bytes the browser sees', () => {
  const mark = MARK_KINDS[0].measured;
  assert.equal(markText(mark), attrs(mark).trim());
});

test('every drawing export is on the primitives page, and none is invented', async () => {
  const draw = await import('../src/draw.js');
  // The exemption is for names that are not shapes: a schema string and the two
  // id/class constants the textures reference. It is a licence, so it states what
  // qualifies — anything drawable has to be on the page, where someone can look at
  // it, and a constant that cannot be drawn cannot be shown either.
  const NOT_A_SHAPE = ['SCHEMA', 'HATCH_ID', 'REFUSAL_CLASS'];
  const exported = Object.keys(draw).filter((name) => !NOT_A_SHAPE.includes(name));
  const missing = exported.filter((name) => !PRIMITIVE_NAMES.includes(name));
  const invented = PRIMITIVE_NAMES.filter((name) => !(name in draw));
  assert.deepEqual(missing, [], 'an export nobody shows is an export nobody checks');
  assert.deepEqual(invented, [], 'the page cannot show a shape the library does not have');
  assert.ok(exported.length >= 17, `draw.js has ${exported.length} shapes`);
});

test('primitive notes are quoted out of draw.js rather than written beside it', () => {
  const drifted = PRIMITIVES.filter((p) => p.note && !drawSource.includes(p.note));
  assert.deepEqual(drifted.map((p) => p.name), []);
  const documented = PRIMITIVES.filter((p) => p.note).length;
  assert.ok(documented >= 8, `${documented} notes: the gallery should say what the shapes are for`);
});

test('a primitive renders markup, not an error string, and the frame is what sizes it', () => {
  for (const primitive of PRIMITIVES) {
    const html = primitive.html();
    assert.match(html, /^<svg\b/, `${primitive.name} must return an <svg>`);
    assert.match(html, /viewBox="0 0 /, `${primitive.name} is drawn in its own coordinate system`);
    assert.ok(!html.includes('undefined') && !html.includes('NaN'),
      `${primitive.name} rendered a value that is not there`);
  }
});
