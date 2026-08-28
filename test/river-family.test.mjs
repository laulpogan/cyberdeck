// THE RIVER -- six components about history, and a producer that keeps
// almost none of it.
//
// The assertions below are mostly about holes. Each component wants a
// different series, none of them exist, and the thing under test is that
// each one draws its own absence at full size and names the recorder it
// wanted -- rather than six charts printing the same shrug, or worse,
// six charts drawn over invented data.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as r from '../src/components/river.js';

const still = (html, why) => {
  assert.match(html, /data-motion="still"/);
  if (why) assert.match(html, new RegExp(why));
};
const LEVELS = [
  { label: 'SUBJECT', value: 'ses-4419', cite: 'sessions[].id' },
  { label: 'WORK ITEM', value: 'W-2211', cite: 'sessions[].work.id' },
  { label: 'ARTIFACT PATH', value: null, cite: 'sessions[].evidence.artifact' },
  { label: 'ARTIFACT CONTENTS', value: null, floor: true,
    cite: 'no reader; artifacts are paths only' },
];

test('the dive draws its floor as a level, not as a missing level', () => {
  const html = r.esperDive({ levels: LEVELS });
  assert.match(html, /NO FURTHER RESOLUTION/);
  assert.match(html, /data-floor="1"/);
  // Two levels were read, two were not. Only the read ones travel.
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 4);
  assert.match(html, /UNMEASURED/);
});

test('the dive names the producer that stopped, at every level', () => {
  const html = r.esperDive({ levels: LEVELS });
  for (const level of LEVELS) assert.ok(html.includes(level.cite.replace(/</g, '&lt;')
    .replace(/\[/g, '[')), `missing cite ${level.cite}`);
  still(r.esperDive({ levels: [] }), 'nothing was dived into');
});

test('the splice draws the seam whenever anything precedes the reel', () => {
  const four = r.tapeSplice({ attempt: 4, events: 9 });
  assert.match(four, /SEAM/);
  assert.match(four, /NO TAPE/);
  assert.match(four, /this attempt kept no tape/);
  // Attempt one has nothing before it, so no seam is invented.
  const one = r.tapeSplice({ attempt: 1, events: 3 });
  assert.doesNotMatch(one, /&gt;SEAM&lt;|>SEAM</);
  assert.match(one, /ONE REEL, NO SPLICE/);
});

test('the splice refuses a tape it was never told the length of', () => {
  const html = r.tapeSplice({ attempt: null });
  assert.match(html, /UNMEASURED/);
  assert.doesNotMatch(html, /data-motion="trace"/);
});

test('the detector raises a candidate and never a diagnosis', () => {
  const hot = r.oscillation({ attempt: 5, sourceState: 'live' });
  assert.match(hot, /OSCILLATION CANDIDATE/);
  assert.match(hot, /data-candidate="1"/);
  const cool = r.oscillation({ attempt: 2, sourceState: 'live' });
  assert.match(cool, /NO CANDIDATE/);
});

test('the detector does not oscillate over an unmeasured period', () => {
  // The joke, made checkable: a rhythm needs a period and nobody keeps
  // one, so the thing named for hunting stands still.
  const html = r.oscillation({ attempt: 5, sourceState: 'live' });
  assert.match(html, /no interval was measured/);
  assert.doesNotMatch(html, /data-motion="traffic"/);
  // Given a real interval it beats at that interval and no other.
  const measured = r.oscillation({ attempt: 5, sourceState: 'live', period: 12 });
  assert.match(measured, /data-motion="traffic"[^>]*/);
  assert.match(measured, /data-period="12"/);
});

test('the detector leaves amplitude and period at full width', () => {
  const html = r.oscillation({ attempt: 5, sourceState: 'live' });
  assert.match(html, /AMPLITUDE/);
  assert.match(html, /PERIOD/);
  assert.equal((html.match(/UNMEASURED/g) || []).length >= 2, true);
});

test('deviation draws the reference track at the size of the real one', () => {
  const html = r.loopDeviation({ observed: [
    { kind: 'gate_passed' }, { kind: 'retry_authorized' }] });
  assert.match(html, /NO REFERENCE TRACE/);
  assert.match(html, /no reference trace was ever written/);
  assert.match(html, /NO DELTA IS COMPUTED/);
  // The observed events travelled; the reference did not.
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 2);
});

test('deviation draws an empty observed lane as a lane', () => {
  const html = r.loopDeviation({ observed: [] });
  assert.match(html, /NO EVENTS RETAINED/);
  assert.match(html, /NO REFERENCE TRACE/);
});

test('the collar counts up and refuses the countdown', () => {
  const html = r.collar({ elapsedSeconds: 9400, waitingSeconds: 640,
    sourceState: 'live' });
  assert.match(html, /NO DEADLINE SET/);
  assert.match(html, /NO TERMINUS/);
  assert.match(html, /IT COUNTS UP/);
  assert.match(html, /data-motion="elapsed"/);
  assert.match(html, /data-elapsed-seconds="9400"/);
});

test('the collar arc is capped rather than wrapped', () => {
  // A wrapped arc would read as a second lap that nobody measured.
  const long = r.collar({ elapsedSeconds: 60 * 60 * 400, sourceState: 'live' });
  const short = r.collar({ elapsedSeconds: 60 * 60 * 12, sourceState: 'live' });
  const arcOf = (h) => h.match(/<path d="[^"]+"/)[0];
  assert.equal(arcOf(long), arcOf(short));
});

test('the collar stops its clock when the feed stops', () => {
  const html = r.collar({ elapsedSeconds: 9400, sourceState: 'stale' });
  assert.match(html, /the clock stopped when the feed did/);
  assert.doesNotMatch(html, /data-motion="elapsed"/);
  // The elapsed reading is still drawn -- it was measured. It just does
  // not keep counting.
  assert.match(html, /ELAPSED/);
});

test('the collar refuses a dial it has no duration for', () => {
  const html = r.collar({ elapsedSeconds: null, sourceState: 'live' });
  assert.match(html, /UNMEASURED/);
  assert.match(html, /no duration was measured/);
});

test('the strip draws every lane, including the three nobody records', () => {
  const html = r.stripChart({ sample: { freshness_ms: 2400 }, sourceState: 'live' });
  for (const lane of r.STRIP_LANES) assert.ok(html.includes(lane), lane);
  assert.equal((html.match(/NEVER MEASURED/g) || []).length, r.STRIP_LANES.length - 1);
  assert.match(html, /ONE SAMPLE/);
});

test('the strip refuses when nothing was retained at all', () => {
  still(r.stripChart({ sample: null, sourceState: 'live' }),
    'no sample was retained');
});

test('the strip ages a sample that has an instant but no age', () => {
  // freshness is tri-stated: a sample can have an instant and no age.
  const html = r.stripChart({ sample: { freshness_ms: null }, sourceState: 'live' });
  assert.match(html, /no duration was measured/);
  assert.match(html, /UNMEASURED/);
});

// The defect this file exists to keep out: a refusal wrapped around a
// drawing. The oscillation beat once sat on a `<g>` enclosing the whole
// frame, so a period nobody measured stilled the attempt ticks somebody
// counted -- and every one of those ticks then animated inside a
// `data-motion="still"`, which is the exact lie the marks are for.
//
// A string test can catch it: no still-marked element may open before a
// moving mark and close after it.
const nesting = (html) => {
  const tags = html.match(/<[a-z]+[^>]*>|<\/[a-z]+>/g) || [];
  let stillDepth = 0, depth = 0, moving = 0;
  const stack = [];
  for (const tag of tags) {
    if (tag.startsWith('</')) {
      if (stack.length && stack[stack.length - 1] === depth) { stack.pop(); stillDepth--; }
      depth--;
      continue;
    }
    if (/\/>$/.test(tag)) {
      if (stillDepth && /data-motion="(?!still)/.test(tag)) moving++;
      continue;
    }
    depth++;
    if (stillDepth && /data-motion="(?!still)/.test(tag)) moving++;
    if (/data-motion="still"/.test(tag)) { stack.push(depth); stillDepth++; }
  }
  return moving;
};

test('no component hides moving marks inside a declared stillness', () => {
  const cases = [
    r.esperDive({ levels: LEVELS }),
    r.tapeSplice({ attempt: 4, events: 9 }),
    r.oscillation({ attempt: 5, sourceState: 'live' }),
    r.oscillation({ attempt: 5, sourceState: 'live', period: 12 }),
    r.loopDeviation({ observed: [{ kind: 'gate_passed' }] }),
    r.collar({ elapsedSeconds: 9400, sourceState: 'live' }),
    r.collar({ elapsedSeconds: 9400, sourceState: 'stale' }),
    r.stripChart({ sample: { freshness_ms: 2400 }, sourceState: 'live' }),
    r.stripChart({ sample: null, sourceState: 'live' }),
  ];
  for (const html of cases) assert.equal(nesting(html), 0);
});
