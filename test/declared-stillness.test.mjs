/** Finding #10, held shut: an absence drawn in ink is declared in the DOM.
 *
 * A specimen that prints `UNMEASURED`, `DARK`, `NO PROOF HISTORY` and says nothing in the
 * markup has told the reader the truth and told the rack nothing. `DECLARED STILL` reads 0
 * over that drawing, so "we declined on purpose" and "we forgot" are the same bytes, and a
 * pair nobody can tell apart cannot be audited.
 *
 * The rule is one vocabulary. Bespoke attributes (`data-unmeasured`, `data-proof`,
 * `data-claim`) stayed where they were — they are specific and they read well in a diff —
 * but each now travels with a mark, because a dialect spoken by one component is a dialect
 * the honesty rack cannot count.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audit, ABSENCE_WORDS } from '../app/verify/declared-stillness.mjs';
import { coverage } from '../src/components/field.js';
import { brightFor } from '../app/fixtures/index.js';

const rows = audit();

test('every drawn absence is declared in the vocabulary the rack counts', () => {
  const undeclared = rows.filter((r) => r.undeclared).map((r) => `${r.key} (${r.drawn.join(', ')})`);
  assert.deepEqual(undeclared, [],
    'these specimens draw an absence in a DOM that declares nothing');
  const privateOnly = rows.filter((r) => r.privateOnly).map((r) => `${r.key} (${r.privateFlags.join(', ')})`);
  assert.deepEqual(privateOnly, [],
    'these specimens declare an absence only in an attribute of their own invention');
});

test('the instrument that says "declared" is not vacuous', () => {
  // If the vocabulary were empty, or the declaration test too generous, the assertion above
  // would pass over an entirely silent library. Both halves are pinned to something real.
  assert.ok(ABSENCE_WORDS.length >= 20, 'the absence vocabulary is drawn from what the library prints');
  assert.ok(rows.filter((r) => r.drawn.length).length >= 15,
    'enough specimens draw an absence for the rule to be a real constraint');
  assert.ok(rows.some((r) => r.declared), 'somebody declares, so the positive case exists');
});

test('a measured gap is declared as a gap, not as a refusal', () => {
  // The #2 ink split survives the #10 sweep: `coverage` hatches ground the survey says was
  // never flown -- a known absence, which is a measurement -- and a `data-refusal` there
  // would claim the component declined rather than the world came up short. This is the
  // line the sweep crossed on its first pass and the marks test caught.
  const row = rows.find((r) => r.key === 'coverage');
  assert.ok(row?.drawn.includes('UNMEASURED'), 'coverage draws its gap in ink');
  assert.ok(row.declared, 'and declares it');
  const swept = coverage(brightFor('coverage'));
  assert.match(swept, /class="cd-fd-dark"[^>]*data-motion="still"[^>]*data-still-reason=/,
    'the gap carries a plain stillness, motionless because it was measured');
  assert.equal(swept.match(/data-refusal/g), null, 'and never claims a refusal over it');
});
