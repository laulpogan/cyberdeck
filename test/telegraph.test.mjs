// THE TELEGRAPH -- six components, and the two refusals the family is
// built around: no cadence over an unmeasured wait, and no zero over a
// producer that never answered.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as t from '../src/components/telegraph.js';

const still = (html, why) => {
  assert.match(html, /data-motion="still"/);
  if (why) assert.match(html, new RegExp(why));
};

test('the cadence tightens with the wait and never loosens', () => {
  assert.equal(t.cadence(0), 8);
  assert.equal(t.cadence(30), 8);
  assert.equal(t.cadence(120), 5);
  assert.equal(t.cadence(1000), 3);
  assert.equal(t.cadence(7200), 2);
  assert.equal(t.cadence(90000), 1);
});

test('an unmeasured wait gets no cadence at all', () => {
  // The important return. A pulse over a number nobody has is the purest
  // fake motion this library can produce.
  assert.equal(t.cadence(null), null);
  assert.equal(t.cadence(undefined), null);
  const html = t.tracker({ oldestWaitSeconds: null, sourceState: 'live' });
  assert.match(html, /NO CADENCE/);
  assert.match(html, /NO CONTACT/);
  assert.match(html, /EVERY WAIT IS UNMEASURED/);
  assert.doesNotMatch(html, /data-motion="traffic"/);
});

test('the tracker beats at the measured cadence and nothing else', () => {
  const html = t.tracker({ oldestWaitSeconds: 4000, sourceState: 'live' });
  assert.match(html, /data-motion="traffic"/);
  assert.match(html, /data-period="2"/);
  assert.match(html, /TICK 2S/);
});

test('the tracker stops beating when the feed stops', () => {
  const html = t.tracker({ oldestWaitSeconds: 4000, sourceState: 'stale' });
  assert.match(html, /source is stale, not live/);
  assert.doesNotMatch(html, /data-motion="traffic"/);
  // The reading is still drawn. It was measured; it just does not pulse.
  assert.match(html, /OLDEST WAIT/);
});

test('the tracker refuses the per-decision ping on the drawing', () => {
  const html = t.tracker({ oldestWaitSeconds: 100, sourceState: 'live' });
  assert.match(html, /PER-DECISION PING UNMEASURED/);
});

test('the bypass goes around every filter and names them all', () => {
  const html = t.bypass({ openCount: 2 });
  for (const [, label] of t.FILTERS) assert.ok(html.includes(label), label);
  assert.match(html, /2 ALGEDONIC OPEN/);
  assert.match(html, /PASSES NONE OF THESE/);
  assert.match(html, /data-motion="trace"/);
});

test('the bypass prints no zero over a board nobody counted', () => {
  // The most dangerous number on the page, so it is not drawn.
  const html = t.bypass({ openCount: null });
  assert.match(html, /ALGEDONIC UNCOUNTED/);
  assert.doesNotMatch(html, /\d+ ALGEDONIC OPEN/);
  assert.doesNotMatch(html, /data-motion="trace"/);
  // The path itself is still drawn -- the class exists whether or not
  // anything is in it.
  assert.match(html, /PASSES NONE OF THESE/);
});

const STAGES = [
  { label: 'REVIEW', why: 'read the receipt', reached: false },
  { label: 'FIRST KEY', why: 'operator confirms', reached: false },
  { label: 'SECOND KEY', why: 'a second identity', reached: false },
  { label: 'COMMIT', why: 'the verb leaves', reached: false },
];

test('an unreached ceremony is drawn whole and armed nowhere', () => {
  const html = t.ceremony({ stages: STAGES, windowSeconds: 20 });
  assert.match(html, /ABORT WINDOW 20s/);
  assert.match(html, /No stage is reached/);
  assert.doesNotMatch(html, /data-motion="trace"/);
  for (const stage of STAGES) assert.ok(html.includes(stage.label), stage.label);
});

test('the ceremony states its window before anything is armed', () => {
  // A window an operator learns the length of only after committing is
  // not a window.
  const html = t.ceremony({ stages: STAGES, windowSeconds: 20 });
  assert.ok(html.indexOf('ABORT WINDOW') < html.indexOf('gates entered')
    || !html.includes('gates entered'));
  still(t.ceremony({ stages: [], windowSeconds: 20 }),
    'no ceremony is defined for this verb');
});

test('an entered gate travels and an unentered one does not', () => {
  const half = STAGES.map((s, i) => ({ ...s, reached: i < 2 }));
  const html = t.ceremony({ stages: half, windowSeconds: 20 });
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 2);
  assert.match(html, /2 of 4 gates entered/);
});

const OUTCOMES = [
  { label: 'RETRY', why: 'run it again on the alternate profile', selected: false },
  { label: 'ABANDON', why: 'close the work item unfinished', selected: false },
];

test('the two-state commit preselects nothing', () => {
  const html = t.twoState({ states: OUTCOMES, doNothing: 'The lease expires in 40m.' });
  assert.match(html, /NOTHING IS PRESELECTED/);
  assert.equal((html.match(/data-selected="1"/g) || []).length, 0);
});

test('doing nothing gets its own line, measured or refused', () => {
  const priced = t.twoState({ states: OUTCOMES, doNothing: 'The lease expires in 40m.' });
  assert.match(priced, /IF YOU CHOOSE NEITHER/);
  assert.match(priced, /The lease expires in 40m/);
  const blank = t.twoState({ states: OUTCOMES });
  assert.match(blank, /IF YOU CHOOSE NEITHER/);
  assert.match(blank, /UNMEASURED/);
  assert.match(blank, /no producer states the cost of inaction/);
});

test('a commit with a third outcome is not a two-state commit', () => {
  still(t.twoState({ states: [...OUTCOMES, { label: 'LATER', why: '' }] }),
    'exactly two outcomes');
});

const ITEMS = [
  { request_class: 'INCIDENT', severity: 'RED', title: 'Credential expired mid-run',
    wait_seconds: 5400, blocker: 'The worker cannot re-auth without a human.',
    if_you_wait: 'the lease expires and the run is lost' },
  { request_class: 'APPROVAL', severity: 'AMBER', title: 'Publish the ledger diff',
    wait_seconds: 640, blocker: 'Irreversible; needs a second key.' },
  { request_class: 'APPROVAL', severity: 'AMBER', title: 'Extend the poll window',
    wait_seconds: null },
];

test('the tape ranks by the order it will hurt', () => {
  const html = t.tape({ items: ITEMS, sourceState: 'live' });
  assert.equal((html.match(/data-motion="count"/g) || []).length, 3);
  assert.match(html, /data-algedonic="1"/);
  assert.match(html, /NO SNOOZE/);
  assert.match(html, /aria-expanded="true"/);
});

test('an unmeasured wait on a strip does not tick', () => {
  const html = t.tape({ items: ITEMS, sourceState: 'live' });
  assert.equal((html.match(/data-motion="elapsed"/g) || []).length, 2);
  assert.match(html, /no duration was measured/);
});

test('the shutter is marked as the operator, not as the fleet', () => {
  // It proves nothing about the world, so it says so rather than passing
  // for a reading.
  const html = t.tape({ items: ITEMS, sourceState: 'live' });
  assert.match(html, /data-motion="intent"/);
  assert.match(html, /data-intent="press"/);
});

test('an algedonic class is recognised by class or by severity', () => {
  assert.equal(t.algedonic({ request_class: 'INCIDENT' }), true);
  assert.equal(t.algedonic({ severity: 'RED' }), true);
  assert.equal(t.algedonic({ request_class: 'APPROVAL', severity: 'AMBER' }), false);
});

test('a measured empty board is allowed to say all clear', () => {
  const html = t.queueState({ sourceState: 'measured_empty', openCount: 0 });
  assert.match(html, /NO REQUEST NEEDS AN OPERATOR/);
  assert.doesNotMatch(html, /data-motion="still"/);
});

test('an unreached board claims no all-clear and prints no zero', () => {
  // The two empties render identical markup unless one of them says so.
  const html = t.queueState({ sourceState: 'unavailable',
    producer: 'salud_source', age: '4M AGO' });
  assert.match(html, /REQUEST QUEUE UNMEASURED/);
  assert.match(html, /NO ALL-CLEAR IS CLAIMED/);
  assert.match(html, /UNCOUNTED/);
  assert.match(html, /salud_source/);
  still(html, 'the board was never reached');
});

test('no telegraph component hides moving marks inside a stillness', () => {
  const nesting = (html) => {
    const tags = html.match(/<[a-z]+[^>]*>|<\/[a-z]+>/g) || [];
    let depth = 0, stillDepth = 0, moving = 0;
    const stack = [];
    for (const tag of tags) {
      if (tag.startsWith('</')) {
        if (stack.length && stack[stack.length - 1] === depth) { stack.pop(); stillDepth--; }
        depth--; continue;
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
  const cases = [
    t.tracker({ oldestWaitSeconds: 4000, sourceState: 'live' }),
    t.tracker({ oldestWaitSeconds: null, sourceState: 'live' }),
    t.bypass({ openCount: 2 }), t.bypass({ openCount: null }),
    t.ceremony({ stages: STAGES, windowSeconds: 20 }),
    t.twoState({ states: OUTCOMES }),
    t.tape({ items: ITEMS, sourceState: 'live' }),
    t.queueState({ sourceState: 'unavailable' }),
  ];
  for (const html of cases) assert.equal(nesting(html), 0);
});

// --------------------------------------------------------------------------
// Finding #5, once the frames were read correctly: there is no phantom countdown in
// this library -- the panel says `ABORT WINDOW 10s` (a dimension) and the oracle says
// `credential expiry · 3×` (a recurrence count, not seconds). What was real is smaller
// and worth holding: a length printed over a gate nobody reached announced seconds the
// operator does not have. The bracket now carries the state it can prove.
test('the abort window says whether it is open, and never pretends to tick', () => {
  const closed = t.ceremony({ stages: STAGES, windowSeconds: 20 });
  assert.match(closed, /ABORT WINDOW 20s · NOT ARMED/, 'a length nobody armed says so');
  assert.match(closed, /data-motion="still" data-still-reason="the window is not armed: /,
    'and the refusal names the gate that is missing');
  assert.doesNotMatch(closed, /data-motion="cycle"/, 'no elapsed stamp, so nothing counts');

  const open = t.ceremony({
    stages: STAGES.map((s) => ({ ...s, reached: true })), windowSeconds: 20,
  });
  assert.match(open, /ABORT WINDOW 20s · ARMED/, 'armed is a different sentence');
  assert.match(open, /no elapsed stamp is supplied/, 'and it still refuses to tick blind');

  const unstated = t.ceremony({ stages: STAGES, windowSeconds: null });
  assert.match(unstated, /WINDOW LENGTH UNREPORTED/, 'nobody stated a length');
  assert.match(unstated, /class="cd-tg-window"[^>]*data-refusal="1"/,
    'unsaid is refusal ink, not a measured zero');
  assert.doesNotMatch(unstated, /ABORT WINDOW \d+s/, 'and no invented number fills the gap');
});
