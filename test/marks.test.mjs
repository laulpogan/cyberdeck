// The port is faithful, or this fails.
//
// These marks began as Python in an operations console, where they are
// held by a unit suite and a browser review script across eight pages.
// Rewriting them in JavaScript was an opportunity to quietly change what
// refuses and what does not, so the original's output was captured to
// contract.json and this compares against it case by case. A refusal that
// softens into a default shows up here as a failing string, not as a
// dashboard that lies six months from now.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as marks from '../src/marks.js';

const here = dirname(fileURLToPath(import.meta.url));
const contract = JSON.parse(readFileSync(join(here, 'contract.json'), 'utf8'));

const CALLS = {
  still: ([reason]) => marks.still(reason),
  arrive: ([changed, now, win]) => marks.arrive(changed, now, { window: win }),
  decay: ([age, win]) => marks.decay(age, { window: win }),
  count: ([index, total]) => marks.count(index, total),
  level: ([v, c, measured]) => marks.level(v, c, { measured, cite: 'telemetry.pct' }),
  elapsed: ([s, state, style]) => marks.elapsed(s, state, { cite: 's.wait', style }),
  trace: ([t, order, total]) => marks.trace(t, { cite: 'doors[].state', order, total }),
  traffic: ([p, state]) => marks.traffic(p, state, { cite: 'oldest_wait' }),
  cycle: ([e, p, state]) => marks.cycle(e, p, state, { cite: 'poll.interval' }),
  intent: ([kind]) => marks.intent(kind),
};

test('every mark matches the implementation it was ported from', () => {
  for (const { kind, args, attrs } of contract.cases) {
    assert.equal(marks.attrs(CALLS[kind](args)), attrs,
      `${kind}(${JSON.stringify(args)})`);
  }
});

test('the duration formatter agrees at every magnitude', () => {
  for (const { seconds, style, words } of contract.duration_words) {
    assert.equal(marks.durationWords(seconds, style), words, `${seconds}s as ${style}`);
  }
});

// The properties the contract file cannot express, because they are about
// the shape of the whole set rather than any one case.

test('a refusal always carries a reason a person can read', () => {
  const refusals = contract.cases
    .map(({ kind, args }) => CALLS[kind](args))
    .filter((mark) => mark['data-motion'] === 'still');
  assert.ok(refusals.length > 15, 'the fixture exercises the refusals');
  for (const mark of refusals) {
    const why = mark['data-still-reason'];
    assert.ok(why && why.length > 8, `a reason, not a shrug: ${JSON.stringify(why)}`);
    assert.ok(!/^(null|undefined|error|n\/a)$/i.test(why), `${why} explains nothing`);
  }
});

test('nothing that moves is missing its evidence', () => {
  // This list IS the contract. A new kind that forgets to carry the
  // number it was derived from fails here rather than shipping as a
  // flourish nobody can trace back to a producer.
  const EVIDENCE = {
    arrive: 'data-age',
    decay: 'data-decay',
    count: 'data-index',
    level: 'data-level',
    elapsed: 'data-elapsed-seconds',
    trace: 'data-cite',
    traffic: 'data-period',
    cycle: 'data-spent',
    intent: 'data-intent',
  };
  for (const { kind, args } of contract.cases) {
    const mark = CALLS[kind](args);
    const moving = mark['data-motion'];
    if (moving === 'still') continue;
    assert.ok(EVIDENCE[moving] in mark,
      `${moving} moves without ${EVIDENCE[moving]}`);
  }
});

test('every loop names the producer it is drawn from', () => {
  // An ambient loop is the easiest lie an interface can tell, so the two
  // that repeat have to say where their interval came from.
  for (const kind of ['traffic', 'cycle']) {
    for (const { args } of contract.cases.filter((c) => c.kind === kind)) {
      const mark = CALLS[kind](args);
      if (mark['data-motion'] === 'still') continue;
      assert.ok(mark['data-cite'], `${kind} loops without naming a producer`);
    }
  }
});

test('an unmeasured quantity never animates to a default', () => {
  // The failure this guards is specific: a bar at zero and a bar nobody
  // filled in must not look alike.
  assert.equal(marks.level(null, 100, { measured: true, cite: 'x' })['data-motion'], 'still');
  assert.equal(marks.level(0, 100, { measured: false, cite: 'x' })['data-motion'], 'still');
  assert.equal(marks.level(0, 100, { measured: true, cite: 'x' })['data-level'], '0');
});

test('a stale feed stops the clock and the pulse', () => {
  for (const state of ['stale', 'unavailable', 'measured_empty']) {
    assert.equal(marks.elapsed(500, state, { cite: 'x' })['data-motion'], 'still');
    assert.equal(marks.traffic(2, state, { cite: 'x' })['data-motion'], 'still');
  }
});

test('an overdue poll refuses rather than wrapping', () => {
  // A wrap would erase the finding, which is that the poll never landed.
  assert.equal(marks.cycle(140, 10, 'live', { cite: 'x' })['data-still-reason'],
    'poll is overdue');
});

test('marks are attributes and nothing else', () => {
  // The whole reason the library is framework-agnostic: no mark carries a
  // function, an element, or a duration in milliseconds.
  for (const { kind, args } of contract.cases) {
    for (const [key, value] of Object.entries(CALLS[kind](args))) {
      assert.ok(key.startsWith('data-'), `${key} is not a data attribute`);
      assert.equal(typeof value, 'string', `${key} carries a ${typeof value}`);
    }
  }
});
