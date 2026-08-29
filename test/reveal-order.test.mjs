// Premises then conclusion.
//
// Finding #6: a derived figure -- a balance, a tally, a total -- used to be painted in
// the first frame, over rows that had not arrived yet. The entrance then argued nothing:
// the verdict was already on the glass while its evidence was still fading in. The rule
// now held here: a figure computed from other figures takes the reveal slot one past the
// end of the population it summarises (`count(n, n + 1)`, or `level(..., { order: n,
// total: n + 1 })` when it is a bar).
//
// The runtime turns `data-index`/`data-total` into `span * (index / total)`, with
// `span` non-decreasing in `total`. So an element whose ratio is strictly greater AND
// whose denominator is at least as large starts strictly later -- no timing constants
// are duplicated here, because asserting the two premises is enough to force the
// conclusion without a second implementation of the delay formula.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as a from '../src/components/agents.js';
import * as d from '../src/components/decision.js';
import * as f from '../src/components/field.js';
import * as o from '../src/components/organism.js';
import { brightFor, darkFor } from '../app/fixtures/index.js';

/** Every element of one class that the runtime would animate, as the runtime reads
 * it: attributes are pulled one at a time, because markup attribute order is not a
 * contract and a chained regex silently matches nothing. */
const slots = (html, cls) => {
  const wanted = new RegExp(`class="${cls}[\s"]`);
  return html.split('<')
    .map((chunk) => chunk.slice(0, chunk.indexOf('>') + 1))
    .filter((tag) => wanted.test(tag) && /data-motion=/.test(tag))
    .map((tag) => ({
      kind: (tag.match(/data-motion="([^"]+)"/) || [, ''])[1],
      index: Number((tag.match(/data-index="(\d+)"/) || [, '0'])[1]),
      total: Number((tag.match(/data-total="(\d+)"/) || [, '1'])[1]),
    }))
    .filter((s) => s.kind !== 'still' && s.kind !== '');
};

function entersLast(html, derivedCls, inputCls, label) {
  const inputs = slots(html, inputCls);
  const derived = slots(html, derivedCls);
  assert.equal(derived.length, 1, `${label}: exactly one derived figure`);
  assert.ok(inputs.length > 0, `${label}: the inputs exist -- non-vacuous`);
  assert.ok(inputs.some((s) => s.index > 0),
    `${label}: the inputs are actually sequenced, not all at zero`);
  const [conclusion] = derived;
  const worst = inputs.reduce((m, s) => Math.max(m, s.index / s.total), 0);
  assert.ok(conclusion.total >= inputs[0].total,
    `${label}: the conclusion's population is at least the inputs' (${conclusion.total})`);
  assert.ok(conclusion.index / conclusion.total > worst,
    `${label}: derived ${conclusion.index}/${conclusion.total} must enter after the `
    + `last input (worst input ratio ${worst.toFixed(3)})`);
}

test('the admission balance enters after the crates it is computed from', () => {
  entersLast(o.admission({ offered: 14, taken: 9, status: 'partial', reason: 'r' }),
    'cd-og-gap', 'cd-og-crate', 'admission');
});

test('the chip budget bar enters after the chips it sums', () => {
  // The showcase's own bright model, so the bar is measured rather than UNPRICED:
  // an unpriced panel refuses the bar, and a refusal has no reveal slot to place.
  entersLast(f.chipBudget(brightFor('chipBudget')), 'cd-fd-budget', 'cd-fd-chip',
    'chipBudget');
});

test('the glass-cell tally enters after the sightlines it counts', () => {
  entersLast(d.glassCell({ passed: ['a', 'b', 'c'], blocked: ['d', 'e'] }),
    'cd-dc-tally', 'cd-dc-through', 'glassCell');
});

test('the MAGI contribution line enters after the seats it summarises', () => {
  entersLast(d.magi({ collapsedState: 'needs_human', cite: 'c', seats: [
    { label: 'SALUD', standing: 'spoke' }, { label: 'KANPAI', standing: 'silent' },
    { label: 'HARNESS', standing: 'spoke' },
  ] }), 'cd-dc-tally', 'cd-dc-seat', 'magi');
});

test('the door and wall tallies enter after the doors and walls', () => {
  entersLast(d.keycard({ doors: [
    { label: 'MODE', state: 'open' }, { label: 'ADAPTER', state: 'shut' },
    { label: 'PERMIT', state: 'not_reached' },
  ], unstamped: null }), 'cd-dc-untested', 'cd-dc-door', 'keycard');
  entersLast(d.ice({ walls: [
    { label: 'MODE', state: 'open' }, { label: 'ADAPTER', state: 'shut' },
    { label: 'PERMIT', state: 'not_reached' },
  ] }), 'cd-dc-untested', 'cd-dc-wall', 'ice');
});

test('a derived figure stops moving when its inputs stop existing', () => {
  // The other half of the rule: placing the conclusion is worthless if it keeps
  // animating once the evidence is withdrawn. `count(0, 1)` is technically a slot and
  // practically motion over nothing, which the honesty gate names by element.
  const dark = d.glassCell(darkFor('glassCell'));
  assert.doesNotMatch(dark, /class="cd-dc-tally"[^>]*data-motion="count"/,
    'no reveal over an empty cell');
  assert.match(dark, /class="cd-dc-tally"[^>]*data-motion="still"/, 'it refuses instead');
  assert.match(dark, /data-refusal="1"/, 'nobody looked is a refusal, not a zero');
  assert.match(d.glassCell({ passed: ['a', 'b', 'c'], blocked: [] }),
    /class="cd-dc-tally"[^>]*data-motion="count"/, 'non-vacuous: with a sighting it counts');
});

test('the manifest line enters after the parts -- and refuses when none completed', () => {
  entersLast(a.dispatch({ workers: [
    { session_id: 'a', harness: 'pi', model: 'q', host: 'dell', did: 'did:1' },
    { session_id: 'b', harness: 'codex', model: 'q', host: 'spark', did: 'did:2' },
  ] }), 'cd-ag-manifests', 'cd-ag-part', 'dispatch');
  const incomplete = a.dispatch({ workers: [
    { session_id: 'x', harness: null, model: 'q', host: 'dell', did: 'd' },
  ] });
  assert.match(incomplete, /class="cd-ag-manifests" data-motion="still" data-still-reason="no manifest came in complete/,
    'nothing completed, so the summary does not count up either');
  assert.doesNotMatch(incomplete, /data-motion="count"/,
    'the invariant the older test guards: no counting on a broken chain');
});

// --------------------------------------------------------------------------
// Finding #7: an order claimed and then ignored. `scanOverlay` stamped its leaders
// with `order`/`total` and printed every answer in the 0ms frame, so the scan was a
// hexagon doing calisthenics next to a form that had already answered. `trace` animates
// geometry and no text, so the value carries the same position in the kind that animates
// an element -- same index, same total, one instant.

test('the answers arrive when the leader that claims them reaches them', () => {
  const html = f.scanOverlay(brightFor('scanOverlay'));
  const leaders = slots(html, 'cd-fd-leader');
  const answers = slots(html, 'cd-fd-answer');
  assert.equal(answers.length, leaders.length, 'one reveal per claimed reveal');
  assert.ok(answers.length >= 3, 'non-vacuous: the bright subject is read');
  leaders.forEach((leader, i) => {
    assert.equal(answers[i].index, leader.index, `row ${i}: same index`);
    assert.equal(answers[i].total, leader.total, `row ${i}: same total`);
  });
  const ratios = answers.map((a) => a.index / a.total);
  assert.deepEqual([...ratios].sort((x, y) => x - y), ratios, 'the reveals are in order');
  assert.ok(ratios[ratios.length - 1] > 0, 'and the last one is not on the first frame');
});

test('a field nobody read is printed at once, and does not animate', () => {
  // `NOT READ` at 0ms is a true sentence. Giving it a reveal would be a transition
  // invented to make an absence look like a process.
  const html = f.scanOverlay({ subject: { name: 's-1', state: 'needs_human', settled: true } });
  assert.equal((html.match(/class="cd-fd-answer"/g) || []).length, 0, 'no reveals at all');
  assert.equal((html.match(/NOT READ/g) || []).length, 3, 'three fields, three true sentences');
  assert.match(html, /class="cd-fd-leader" data-known="0" data-motion="still"/);
  const dark = f.scanOverlay(darkFor('scanOverlay'));
  assert.doesNotMatch(dark, /class="cd-fd-answer" data-motion/, 'and the switch leaves none');
});
