// A value that enters the plate is already drawn at its measured value.
//
// The hurricane-loop reference measures one saturated ink sitting at 0.25 of its final extent at
// half the duration — front-loaded, because a new observation step *appears at full reflectivity*
// instead of growing into itself (`vault/SPECS.md`). That claim is about a cell of data, and
// `tracker`'s bands are `trace` reveals of measured waits in arrival order, which is the library's
// licensed reveal kind; demanding a snap-to-length band from a trace-drawn survey would be the
// `mfd` mistake — a reading implying work the drawing cannot host. What the reference does demand
// of `tracker`, in its own dialect, is narrower and checkable: **the printed figure is a
// measurement already taken, so nothing animates it.** No counter climbing to the number, no fade
// bringing it in. `tracker` already honours this — `OLDEST WAIT` and its duration are pushed as
// unmarked text, while the marks sit on the bands, the contacts and the refusals — and this file
// exists so that a later edit which stamps a `count` on the reading, or moves the figure inside a
// marked group, cannot pass as a styling change.
import test from 'node:test';
import assert from 'node:assert/strict';

import { tracker } from '../src/components/telegraph.js';

// 5400 seconds is exactly 1h 30m. The first draft used 9456 and asserted 2H 36M, and the honest
// build "failed": the formatter rounds up, so 9456 s is 2H 37M. That is the second time this exact
// arithmetic has bought a meaningless red (the first was the collar's elapsed figure) — pin a
// figure the input produces exactly, or derive it; never from a mental division.
const html = tracker({ oldestWaitSeconds: 5400, sourceState: 'live' });

/** The interior of every element that carries a mark. */
const markedBlocks = [...html.matchAll(/<g[^>]*data-motion="[^"]+"[^>]*>([\s\S]*?)<\/g>/g)].map((m) => m[1]);

test('the printed wait is a figure, not an event', () => {
  assert.match(html, />\s*\d+[Hh]\s*\d+[Mm]\s*</, 'the duration figure lost its printed form entirely');
  for (const block of markedBlocks) {
    assert.doesNotMatch(block, /OLDEST WAIT/,
      'the label moved inside a marked group, so the reading now arrives instead of being stated');
    assert.doesNotMatch(block, /<text[^>]*>\s*\d+[Hh]\s*\d+[Mm]\s*<\/text>/,
      'the duration itself sits inside an animated group — a measured wait restated as something happening');
  }
});

test('tracker marks the instrument, never the reading', () => {
  // Named, so the exception list is reviewable: `trace` reveals a measured band in arrival order,
  // `traffic` is the recorder's own tick, `refusal`/`still` declare an absence. Anything else that
  // ever appears here is a new kind of motion sitting on this plate, and it has to be argued for.
  const kinds = [...new Set([...html.matchAll(/data-motion="([a-z-]+)"/g)].map((m) => m[1]))];
  const allowed = ['trace', 'traffic', 'refusal', 'still', 'count'];
  const unexpected = kinds.filter((k) => !allowed.includes(k));
  assert.deepEqual(unexpected, [], `tracker grew marks nobody argued for: ${unexpected.join(', ')}`);
  assert.equal(kinds.includes('elapsed'), false,
    'an elapsed counter appeared on a plate whose whole reading is one measured figure');
  assert.equal(kinds.includes('decay'), false,
    'a figure that decays is a figure being spent, and this one was taken already');
});

test('the figure the plate reports is the figure it was given', () => {
  // One hour thirty minutes, spelled out — the plate says so in words the reader can check
  // against the input, rather than drawing a bar whose length has to be trusted.
  assert.match(html, /1H 30M/, 'the reading stopped matching its input, so nothing on this plate is checkable');
});
