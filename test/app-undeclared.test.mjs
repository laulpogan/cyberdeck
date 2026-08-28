// The four unconditional marks, checked against the source they are named in.
//
// The app's claim is that removing the evidence stops the motion on the page. That
// claim is only falsifiable if the exceptions are enumerable, so this test reads the
// library and asserts each named entry really is where the list says it is, in the
// element the list says draws it. If upstream converts one of these into a computed
// mark, this test fails and the exemption is deleted -- which is the direction the
// list is supposed to shrink.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { UNCONDITIONAL_MARKS, UNCONDITIONAL_KEYS, expectedFor } from '../app/src/undeclared.js';
import { allComponents } from '../app/src/registry/index.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const source = (file) => readFileSync(`${ROOT}${file}`, 'utf8');
const keys = allComponents().map((component) => component.key);

test('every exemption names a component the registry actually renders', () => {
  const unknown = UNCONDITIONAL_KEYS.filter((key) => !keys.includes(key));
  assert.deepEqual(unknown, [], 'an exemption for a component nobody shows is a free pass');
});

test('each exemption is the mark the named source really writes', () => {
  const drift = [];
  for (const [key, entries] of Object.entries(UNCONDITIONAL_MARKS)) {
    for (const entry of entries) {
      const text = source(entry.file);
      if (!text.includes(entry.written)) {
        drift.push(`${key}: ${entry.file} no longer writes ${entry.written}`);
      }
      // The carrier class is how the browser check finds the mark. If the drawing is
      // renamed and the list is not, the gate would fail on a component that had
      // actually been fixed.
      if (!text.includes(entry.carrier)) {
        drift.push(`${key}: ${entry.file} no longer draws ${entry.carrier}`);
      }
    }
  }
  assert.deepEqual(drift, []);
});

test('the exemptions are four, and they are named one by one', () => {
  // Not a number for the number's sake. The list is the app admitting where its own
  // promise does not hold, and an admission that quietly grows is a lie with a
  // changelog. Any fifth has to be added here, by hand, with a `what`.
  assert.deepEqual([...UNCONDITIONAL_KEYS].sort(), ['glassCell', 'oscillation', 'radar', 'syncRatio'],
    'the exemptions are enumerable');
  for (const [key, entries] of Object.entries(UNCONDITIONAL_MARKS)) {
    for (const entry of entries) {
      assert.ok(entry.what.length > 20, `${key} must say what the mark claims`);
      assert.ok(['count', 'trace', 'traffic', 'cycle', 'level', 'elapsed', 'decay', 'arrive']
        .includes(entry.kind), `${key} names a real mark kind`);
    }
  }
});

test('expectedFor is what the gate reads, and an unnamed specimen expects nothing', () => {
  assert.deepEqual(expectedFor('radar'), [{ kind: 'count', carrier: 'cd-fd-offscope' }]);
  assert.deepEqual(expectedFor('triVision'), [], 'a specimen with no exemption has no licence');
});
