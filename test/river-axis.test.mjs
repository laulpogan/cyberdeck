// The deck shares one axis, because a stack of lanes where no two agree on where
// "now" is cannot carry a playhead, a cross-lane event, or a statement about which
// run started late.
//
// Reference: `scope-envelope-violin.gif` — an audio editor, two named tracks stacked,
// ONE ruler across the top of the whole plate, one playhead over the whole width. The
// gap is finding-named in `vault/GAUNTLET.json` as `river-lanes-share-one-now`: `river`
// used to map each lane's own first and last stamp across the whole plate, so every
// lane's run began at the gutter, ended at the margin, and "now" had one x per lane.
//
// The decisive assertion is the second one. Under the old geometry EVERY lane's first
// segment started at exactly the gutter; under a shared axis only the earliest lane
// does, and the rest start where their own first event actually falls.
import test from 'node:test';
import assert from 'node:assert/strict';

import { river } from '../src/components/river.js';

const GUTTER = 200;
const RIGHT = 900 - 26;
const at = (s) => Date.parse(s);

const lanes = [
  { id: 'lane-a', attempt: 1, state: 'running', events: [
    { at: '2026-01-01T00:00:00Z', kind: 'turn' }, { at: '2026-01-01T00:04:00Z', kind: 'sealed' }] },
  // lane-b begins three minutes into a six-minute deck: half way across the plate.
  { id: 'lane-b', attempt: 1, state: 'running', events: [
    { at: '2026-01-01T00:03:00Z', kind: 'turn' }, { at: '2026-01-01T00:06:00Z', kind: 'sealed' }] },
];

const starts = (html) => [...html.matchAll(/class="cd-riv-seg"[^>]*x1="([0-9.]+)"/g)]
  .map((m) => Number(m[1]));

test('every segment x falls inside the deck, and the ruler spans the same plate', (t) => {
  const html = river({ lanes, cite: 'session.run' });
  const xs = starts(html);
  assert.ok(xs.length >= 2, 'the two runs drew at all');
  for (const x of xs) {
    assert.ok(x >= GUTTER - 0.6 && x <= RIGHT + 0.6, `segment start ${x} is off the plate`);
  }
});

test('a lane that began late starts late on the plate instead of at the gutter', () => {
  const html = river({ lanes, cite: 'session.run' });
  const xs = starts(html);
  assert.ok(Math.abs(xs[0] - GUTTER) < 0.6,
    `the earliest lane should start at the gutter, it started at ${xs[0]}`);
  const expected = GUTTER + ((at('2026-01-01T00:03:00Z') - at('2026-01-01T00:00:00Z'))
    / (at('2026-01-01T00:06:00Z') - at('2026-01-01T00:00:00Z'))) * (RIGHT - GUTTER);
  assert.ok(Math.abs(xs[1] - expected) < 1.5,
    `lane-b starts at ${xs[1]}; on one shared axis its first event sits at ${expected}. `
    + 'A start back at the gutter means the lane was normalised to fill the plate again, '
    + 'which is the geometry the reference refutes.');
});

test('the plate prints the deck it is drawn on', () => {
  const html = river({ lanes, cite: 'session.run' });
  assert.match(html, /class="cd-riv-ruler"/, 'no ruler across the top of the plate');
  assert.match(html, />00:00:00</, 'the deck start is not printed where a reader can see it');
  assert.match(html, />00:06:00</, 'the deck end is not printed');
  assert.match(html, /one shared time axis/, 'the aria-label still claims a private axis per lane');
});

test('the ruler and the now-line are furniture and carry no motion mark', () => {
  // Furniture that moves is chrome motion, and chrome motion needs an operator's mark.
  // The measurement on this deck is the run ink; nothing here may animate.
  const html = river({ lanes, cite: 'session.run', now: '2026-01-01T00:05:30Z' });
  const ruler = html.match(/<g class="cd-riv-ruler">[\s\S]*?<\/g>/)[0];
  assert.equal(ruler.match(/data-motion/g), null, 'the ruler carries a motion mark');
});

test('now is one line, at the x the deck gives it, with its stamp beside it', () => {
  const html = river({ lanes, cite: 'session.run', now: '2026-01-01T00:05:30Z' });
  assert.equal((html.match(/data-now="1"/g) || []).length, 1,
    'a single now must not resolve to one line per lane');
  const x = Number(html.match(/data-now="1"[^>]*>\s*<line x1="([0-9.]+)"/)[1]);
  const expected = GUTTER + ((at('2026-01-01T00:05:30Z') - at('2026-01-01T00:00:00Z'))
    / (at('2026-01-01T00:06:00Z') - at('2026-01-01T00:00:00Z'))) * (RIGHT - GUTTER);
  assert.ok(Math.abs(x - expected) < 1.5, `now sits at ${x}, the deck puts it at ${expected}`);
  assert.match(html, /NOW 00:05:30/);
  assert.equal(html.match(/data-clamped/), null, 'a now inside the deck was marked clamped');
});

test('a now beyond the deck is drawn clamped and says so, not stretched into the plate', () => {
  const html = river({ lanes, cite: 'session.run', now: '2026-01-01T00:30:00Z' });
  assert.match(html, /data-clamped="1"/);
  assert.match(html, /NOW OUTSIDE THE DECK — DRAWN CLAMPED HERE/);
  const x = Number(html.match(/data-now="1"[^>]*>\s*<line x1="([0-9.]+)"/)[1]);
  assert.ok(x <= RIGHT + 0.6, `a clamped now escaped the plate at ${x}`);
});

test('a lane with no run still refuses in its own row, ruler or no ruler', () => {
  const html = river({
    lanes: [lanes[0], { id: 'lane-c', attempt: 2, state: 'needs_human', events: [] }],
    cite: 'session.run',
  });
  assert.match(html, /NO RUN OBSERVED/, 'the empty lane did not draw its emptiness');
  assert.match(html, /data-refusal="1"/, 'the empty lane declares nothing');
  assert.match(html, /AWAITING OPERATOR/,
    'a lane waiting on a person with no run lost the one fact the operator needed');
});
