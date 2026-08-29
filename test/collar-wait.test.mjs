// A wait with no terminus is drawn in words, not as an extent.
//
// Reference: `barcode-scan-receipt.gif` — a phone scan that says `Product code found! Retrieving
// data, please wait…` and draws no progress bar, no percentage, no remaining-time claim. The app
// knows it does not know how long the lookup takes, and says so; that is the difference between an
// indeterminate wait and a lie about a determinate one.
//
// `collar` is the library's wait component, and it has NO deadline parameter at all — it cites
// `evidence.operator.deadline_at` and never receives one, so the honest face is structural. The
// row in `vault/GAUNTLET.json` was first filed against `dispatch`, which draws a fitted-parts
// chain and has no wait in it: named by resemblance rather than by drawing.
import test from 'node:test';
import assert from 'node:assert/strict';

import { collar } from '../src/components/river.js';

const html = collar({ elapsedSeconds: 9456, waitingSeconds: 12, sourceState: 'live' });

test('the wait area is hatched and says NO DEADLINE SET', () => {
  assert.match(html, /NO DEADLINE SET/, 'the wait stopped naming its own indeterminacy');
  assert.ok(html.includes('url(#cd-hatch'),
    'the wait area went blank: an empty area reads as a quantity of zero and nobody measured zero');
});

test('no extent, percentage, or ETA is offered for a wait nobody can time', () => {
  assert.equal(html.match(/data-motion="level"/g), null,
    'an extent mark claims how much of the wait is left, and no terminus was supplied');
  assert.equal(/%|\bETA\b/.test(html), false,
    'a percentage or ETA appears where the reference would say "please wait" and stop');
});

test('the elapsed count stays a measurement and keeps its mark', () => {
  // The one number here that is true and still moving. The counter is the reason the plate is
  // allowed any motion at all; the wait beside it is not.
  assert.match(html, /data-motion="elapsed"/);
  assert.match(html, /data-elapsed-text>/, 'the elapsed text node the runtime writes into is gone');
  // Shape, not value: the first draft asserted the string the arithmetic should have produced
  // (2h 36m) and the honest build printed 2h 37m, because 9456s rounds up. A pinned figure that
  // disagrees with the formatter is a failing test that says nothing about the drawing.
  assert.match(html, /\d+h \d+m/, 'the elapsed figure lost its duration shape entirely');
});
