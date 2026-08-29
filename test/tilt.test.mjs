// The tilt: an extent measured as an angle, on the arm `admission` draws between two counts.
// The reference that licensed it is `25G2DJC3DOO6R72EAGURMGNK5YW7FRZC.gif`, verified by eye and
// measured in vault/SPECS.md (0.93 of the way over by half the duration, then holding), and the
// browser gate samples the swing frame by frame. What is checkable without a browser is the
// stamp and the number in it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { level } from '../src/marks.js';
import { admission } from '../src/components/organism.js';

test('a tilt carries its axis, its angle, and its pivot', () => {
  const mark = level(3, 4, { measured: true, axis: 'tilt', deg: 19.481, origin: [170, 74],
                             cite: 'offered vs taken' });
  assert.equal(mark['data-motion'], 'level');
  assert.equal(mark['data-level'], '0.75');
  assert.equal(mark['data-level-axis'], 'tilt');
  assert.equal(mark['data-level-deg'], '19.481');
  assert.equal(mark['data-level-origin'], '170 74');
});

test('an unmeasured tilt is a stillness, in the same words as every other unmeasured level', () => {
  const mark = level(null, 1, { measured: false, axis: 'tilt', deg: 12 });
  assert.equal(mark['data-motion'], 'still');
  assert.equal(mark['data-level-deg'], undefined, 'a refusal must not smuggle an angle it denies');
});

test('the arm reports the imbalance, not the clamp', () => {
  // 6 offered against 2 taken is a two-thirds gap, and the arm's travel is capped at 0.34 rad
  // for legibility. The cap is a bound on the drawing; the DOM keeps the number.
  const html = admission({ offered: 6, taken: 2 });
  const attrs = /class="cd-og-arm"([^>]*)>/.exec(html)[1];
  assert.match(attrs, /data-level-axis="tilt"/);
  assert.match(attrs, /data-level="0\.667"/);
  const deg = Number(/data-level-deg="([\d.]+)"/.exec(attrs)[1]);
  assert.ok(deg > 19 && deg < 19.6, `the capped arm should print about 19.5°, got ${deg}`);
});

test('a near-balance reports a small number and the runtime has little to swing', () => {
  const attrs = /class="cd-og-arm"([^>]*)>/.exec(admission({ offered: 40, taken: 38 }))[1];
  assert.match(attrs, /data-level="0\.05"/);
  const deg = Number(/data-level-deg="([\d.]+)"/.exec(attrs)[1]);
  assert.ok(deg > 0 && deg < 3, `a 5% gap should print a couple of degrees, got ${deg}`);
});

test('an exactly balanced fleet stamps a level of zero rather than hiding the bar', () => {
  // A measured zero and an unmeasured quantity must not render alike — the rule `level` exists
  // to keep. Here the zero is visible twice: `data-level="0"`, and an angle the runtime skips.
  const attrs = /class="cd-og-arm"([^>]*)>/.exec(admission({ offered: 5, taken: 5 }))[1];
  assert.match(attrs, /data-level="0"/);
  assert.match(attrs, /data-level-deg="0"/);
});

test('the beam arrives after the crates it summarises', () => {
  // finding #6: a figure computed from other figures enters one slot past its last input.
  const attrs = /class="cd-og-arm"([^>]*)>/.exec(admission({ offered: 6, taken: 2 }))[1];
  const order = Number(/data-index="(\d+)"/.exec(attrs)[1]);
  const total = Number(/data-total="(\d+)"/.exec(attrs)[1]);
  assert.equal(total, order + 1, `order ${order} of ${total} is not one slot past the last crate`);
  // 6 crates drawn on the offered side + 2 on the taken side, both capped at 6 per side.
  assert.equal(order, 8, `${order} is not the number of crates drawn for 6 offered, 2 taken`);
});

test('the runtime owns the tilt axis, and reads the angle out of the mark', () => {
  // The behaviour itself belongs to the browser gate (`app/verify/index.mjs` samples the swing
  // per frame and fails a beam that never moves). What this asserts is the contract the gate
  // depends on: that a third axis exists and takes its angle from the DOM rather than from a
  // constant, which is the difference between a measurement and a decoration.
  const src = readFileSync(fileURLToPath(new URL('../src/runtime.js', import.meta.url)), 'utf8');
  assert.match(src, /axis === 'tilt'/);
  assert.match(src, /getAttribute\('data-level-deg'\)/);
  assert.match(src, /getAttribute\('data-level-origin'\)/);
  assert.match(src, /transformBox\s*=\s*'view-box'/,
    'a pivot given in drawing coordinates needs view-box; fill-box spins the arm about itself');
  // It must animate DOWN to the authored angle, not up from it, or the settled page is not the
  // static export. `'- deg'` as the FROM value and '0deg' as the TO value is the whole trick.
  assert.match(src, /rotate: \[\(0 - deg\)[\s\S]{0,120}'0deg'\]/,
    'a tilt must start from the counter-rotation and end at zero, which is the drawing');
});

test('the front-load is the measured figure, not an easing word', () => {
  // The first draft asked the engine for `ease-out` and the screen returned a straight line:
  // the gauntlet measured 0.48 of the travel done at half the animation's duration, against a
  // reference at 0.93. A named curve is a request; a middle keyframe is a measurement. This
  // asserts the 0.07 — the 7% of the travel left for the settle — so the number cannot quietly
  // drift into a taste, and the reason the number is 7 rather than 50.
  const src = readFileSync(fileURLToPath(new URL('../src/runtime.js', import.meta.url)), 'utf8');
  const m = /rotate: \[\(0 - deg\) \+ 'deg', \(0 - deg \* ([\d.]+)\)[\s\S]{0,60}'0deg'\]/.exec(src);
  assert.ok(m, 'the tilt no longer puts its travel in a middle keyframe');
  const rest = Number(m[1]);
  assert.ok(rest > 0 && rest < 0.25, `the settle carries ${(rest * 100).toFixed(0)}% of the travel`);
});
