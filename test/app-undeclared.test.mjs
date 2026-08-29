// Nothing on this page may move without a measurement behind it, and that claim is only
// falsifiable if the exceptions are enumerable. There used to be four; they are fixed, and
// this file is what keeps them fixed.
//
// The earlier version of this test grepped the component's source for the literal mark and
// the carrier class. That assertion was weaker than it looked: once the mark is gone from one
// element and still present on another in the same file, the grep still passes. So this
// version does not read source. It calls the component the registry calls, with the fixture
// the app renders and with that same fixture stripped of its evidence, and reads the mark off
// the element. A licence cannot be granted for a mark that is not there, and a fix cannot
// regress into motion without a red test.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  UNCONDITIONAL_MARKS,
  UNCONDITIONAL_KEYS,
  FIXED_UNCONDITIONAL_MARKS,
  expectedFor,
} from '../app/src/undeclared.js';
import { allComponents, componentByKey } from '../app/src/registry/index.js';
import { brightFor, darkFor } from '../app/fixtures/index.js';

const keys = allComponents().map((component) => component.key);

/** The mark an element carries, read out of the markup the component function returned. */
function markOn(html, carrier) {
  const at = html.indexOf(`class="${carrier}"`);
  if (at === -1) return null;
  const open = html.slice(at, html.indexOf('>', at) + 1);
  const motion = open.match(/data-motion="([^"]*)"/);
  const reason = open.match(/data-still-reason="([^"]*)"/);
  return { motion: motion ? motion[1] : null, reason: reason ? reason[1] : null, carrier };
}

function render(key, model) {
  const component = componentByKey(key);
  assert.ok(component && typeof component.fn === 'function', `${key} is not callable`);
  return component.fn(model);
}

test('the licence list is empty: no specimen is exempt from the rule', () => {
  assert.deepEqual(UNCONDITIONAL_KEYS, [],
    'an exemption has to be re-earned: name the component, the carrier, the literal, and what it animates over');
  for (const key of keys) assert.deepEqual(expectedFor(key), [], `${key} expects a licence`);
});

test('every exemption still names a component the registry renders', () => {
  const unknown = UNCONDITIONAL_KEYS.filter((key) => !keys.includes(key));
  assert.deepEqual(unknown, [], 'an exemption for a component nobody shows is a free pass');
});

for (const [key, fixed] of Object.entries(FIXED_UNCONDITIONAL_MARKS)) {
  test(`${key}: ${fixed.carrier} declares its stillness instead of animating`, () => {
    for (const [label, model] of [['with evidence', brightFor(key)], ['without evidence', darkFor(key)]]) {
      const html = render(key, model);
      const mark = markOn(html, fixed.carrier);
      assert.ok(mark, `${key} stopped drawing ${fixed.carrier} — a refusal has to keep its space (see FILMSTRIP.md §3)`);
      assert.equal(mark.motion, 'still',
        `${key}.${fixed.carrier} carries "${mark.motion}" ${label}; the mark on this element must be a declared refusal`);
      assert.ok(mark.reason && mark.reason.length > 8,
        `${key}.${fixed.carrier} refuses without saying why ${label}`);
      if (label === 'without evidence') {
        assert.equal(mark.reason, fixed.reason,
          `${key}.${fixed.carrier} refuses for a different reason once the evidence is gone: "${mark.reason}"`);
      }
    }
  });
}

test('the marks that stayed behind are the ones with a series behind them', () => {
  // `oscillation` traces its attempt ticks and nothing else: each tick is an outcome that
  // happened, placed in a counted series. `glassCell` traces the fields that crossed the
  // glass. Both are `trace(travelled)` doing the job it exists for.
  const river = render('oscillation', brightFor('oscillation'));
  const ticks = [...river.matchAll(/class="cd-riv-attempt"[^>]*data-motion="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(ticks.length >= 2, 'the attempt ticks are the measured part of this specimen');
  assert.deepEqual([...new Set(ticks)], ['trace'], 'attempt ticks must trace, or the fixture lost its series');

  const glass = render('glassCell', brightFor('glassCell'));
  const crossed = [...glass.matchAll(/class="cd-dc-through"[^>]*data-motion="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(crossed)], ['trace'], 'fields that crossed the glass must trace');
});

test('a refusal is a declaration, not an unmarked element', () => {
  // The four used to be invisible motion; the fix must not turn them into invisible nothing.
  for (const [key, fixed] of Object.entries(FIXED_UNCONDITIONAL_MARKS)) {
    const mark = markOn(render(key, darkFor(key)), fixed.carrier);
    assert.equal(mark.motion, 'still', `${key}.${fixed.carrier} is unmarked — nothing says why it is quiet`);
    assert.ok(mark.reason && mark.reason.length > 8, `${key}.${fixed.carrier} refuses without a reason`);
  }
});
