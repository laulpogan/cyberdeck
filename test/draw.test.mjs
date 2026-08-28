// The primitives are a port, so they are held to the original.
//
// Nineteen shape functions is the whole foundation: every component in
// this library is an arrangement of them, so a primitive that drifts by
// half a pixel or drops a dash pattern is a defect that shows up in fifty
// places and is attributed to none of them. The reference implementation's
// output was captured to draw-contract.json and this compares call by
// call -- including the refusals, which are the parts most likely to be
// quietly softened in a rewrite.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as draw from '../src/draw.js';

const here = dirname(fileURLToPath(import.meta.url));
const contract = JSON.parse(readFileSync(join(here, 'draw-contract.json'), 'utf8'));

const CALLS = {
  dot: ([cx, cy, r, hollow]) => draw.dot(cx, cy, r, { hollow }),
  hexagon: ([cx, cy, r, flat]) => draw.hexagon(cx, cy, r, { flat }),
  hexCell: ([cx, cy, r, dashed, flat]) => draw.hexCell(cx, cy, r, { dashed, flat }),
  rect: ([x, y, w, h, dashed]) => draw.rect(x, y, w, h, { dashed }),
  line: ([x1, y1, x2, y2, dashed]) => draw.line(x1, y1, x2, y2, { dashed }),
  ring: ([cx, cy, r, dashed]) => draw.ring(cx, cy, r, { dashed }),
  arc: ([cx, cy, r, s, e, dashed]) => draw.arc(cx, cy, r, s, e, { dashed }),
  wedge: ([cx, cy, r, s, e]) => draw.wedge(cx, cy, r, s, e),
  needle: ([cx, cy, len, a]) => draw.needle(cx, cy, len, a),
  text: ([x, y, v, size, anchor]) => draw.text(x, y, v, { size, anchor }),
  hatched: ([x, y, w, h]) => draw.hatched(x, y, w, h),
  scanlines: ([x, y, w, h]) => draw.scanlines(x, y, w, h),
  staticField: ([x, y, w, h, density, seed]) =>
    draw.staticField(x, y, w, h, { density, seed }),
  wall: ([count, columns]) => draw.wall(count, { columns }),
  wallMarked: ([count, columns, marked]) => draw.wall(count, { columns, marked }),
  curve: ([samples, width, height, dashed]) =>
    draw.curve(samples, { width, height, dashed }),
  axis: ([width, height, ticks]) => draw.axis(width, height, { ticks }),
  frame: ([w, h, body, cls, label, scale]) =>
    draw.frame(w, h, body, { cls, label: label || null, scale }),
};

// Two prefixes are deliberately renamed for the new home -- the pattern
// ids and the bleed class. Nothing else may differ, so the rename is
// applied narrowly and everywhere, including inside the objects `wall`
// returns, rather than being waved at the top level.
const renamed = (v) => (
  typeof v === 'string' ? v.replace(/\bhive-/g, 'cd-').replace(/\bhv-/g, 'cd-')
  : v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, renamed(x)]))
    : v);

test('every primitive matches the implementation it was ported from', () => {
  let checked = 0;
  for (const { fn, args, out } of contract.cases) {
    assert.deepEqual(CALLS[fn](args), renamed(out),
      `${fn}(${JSON.stringify(args).slice(0, 70)})`);
    checked++;
  }
  assert.ok(checked > 60, `the fixture is still exercising the port (${checked})`);
});

test('an uncounted population has no wall', () => {
  // The refusal this helper exists for. An empty grid reads as a measured
  // zero, so there is no grid.
  assert.equal(draw.wall(null), null);
  assert.equal(draw.wall(undefined), null);
  assert.equal(draw.wall(-1), null);
  // And a counted zero is a wall with nothing in it, which is different.
  assert.deepEqual(draw.wall(0, { columns: 4 }).body, '');
});

test('a series through fewer than two samples is refused', () => {
  const opts = { width: 100, height: 40 };
  assert.equal(draw.curve([], opts), null);
  assert.equal(draw.curve([[0, 0]], opts), null);
  assert.equal(draw.curve(null, opts), null);
  assert.ok(draw.curve([[0, 0], [1, 1]], opts).startsWith('<polyline'));
});

test('an unmeasured density draws no grain at all', () => {
  // Not a clean panel: a clean panel is what a fresh session looks like.
  assert.equal(draw.staticField(0, 0, 50, 50, { density: 0 }), '');
  assert.equal(draw.staticField(0, 0, 50, 50, { density: -1 }), '');
  assert.ok(draw.staticField(0, 0, 50, 50, { density: 0.5 }).length > 0);
});

test('the grain is the same grain every render', () => {
  // A field that reshuffles turns every byte-identical capture into a diff.
  const once = draw.staticField(0, 0, 80, 40, { density: 0.6, seed: 4 });
  const twice = draw.staticField(0, 0, 80, 40, { density: 0.6, seed: 4 });
  assert.equal(once, twice);
  assert.notEqual(once, draw.staticField(0, 0, 80, 40, { density: 0.6, seed: 5 }));
});

test('no primitive names a colour', () => {
  const body = readFileSync(join(here, '..', 'src', 'draw.js'), 'utf8');
  assert.deepEqual(body.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [], []);
  // And everything strokes with currentColor, which is what makes one
  // shape work in both themes without a second copy.
  assert.ok(draw.dot(0, 0, 1).includes('currentColor'));
  assert.ok(draw.rect(0, 0, 1, 1).includes('currentColor'));
});

test('a decorative frame is hidden, a labelled one is announced', () => {
  assert.match(draw.frame(10, 10, ''), /aria-hidden="true"/);
  assert.match(draw.frame(10, 10, '', { label: 'A radar' }), /aria-label="A radar"/);
});

test('what a drawing prints is escaped', () => {
  assert.match(draw.text(0, 0, '<script>x</script>'), /&lt;script&gt;/);
  assert.doesNotMatch(draw.text(0, 0, '<script>x</script>'), /<script>/);
});
