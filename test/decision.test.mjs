// DECISION AND AUTHORITY -- seven components about who may act and who
// agreed. The recurring failure they refuse is the confident middle: a
// verdict invented from one number, a checklist painted clear past the
// wall that stopped you, a field called public because nobody said it
// wasn't.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as a from '../src/components/authority.js';
import * as d from '../src/components/decision.js';

const still = (html, why) => {
  assert.match(html, /data-motion="still"/);
  if (why) assert.match(html, new RegExp(why));
};
const ENV = { mode: 'act-reversible', operator: true, adapter: true,
              capabilities: ['task.retry', 'task.abort'] };
const RETRY = { commandType: 'task.retry', label: 'RETRY · ALTERNATE PROFILE',
                permit: true, cite: 'evidence.retry.permitted' };

test('the ladder stops at the first missing authority, never a list', () => {
  // An operator told one thing fixes it and comes back. Being handed four
  // blockers at once is being handed none.
  const observing = a.evaluate(RETRY, { ...ENV, mode: 'observe' });
  assert.equal(observing.state, 'no_grant');
  assert.match(observing.missing, /EFFECTIVE MODE OBSERVE/);
  // The outer block wins even when inner ones would also fail.
  const worse = a.evaluate({ ...RETRY, permit: false },
    { ...ENV, mode: 'observe', operator: false });
  assert.match(worse.missing, /EFFECTIVE MODE/);
});

test('nobody-said and somebody-said-no never share an ink', () => {
  const unknown = a.evaluate({ ...RETRY, permit: null }, ENV);
  const refused = a.evaluate({ ...RETRY, permit: false }, ENV);
  assert.equal(unknown.kind, 'unknown');
  assert.equal(refused.kind, 'refused');
  assert.match(unknown.missing, /PERMIT UNMEASURED/);
  assert.match(refused.missing, /PERMIT WITHHELD/);
});

test('an unconfirmed session is unknown, not a denial', () => {
  // A server render cannot see a session. Saying "no operator" is a guess
  // and saying "granted" is a lie.
  const grant = a.evaluate(RETRY, { ...ENV, operator: null });
  assert.equal(grant.kind, 'unknown');
  assert.match(grant.missing, /SESSION UNCONFIRMED/);
});

test('an irreversible verb takes a ceremony, never one click', () => {
  const grant = a.evaluate({ ...RETRY, irreversible: true }, ENV);
  assert.equal(grant.state, 'ceremony_required');
  assert.match(grant.why, /Two keys and an abort window/);
});

test('only a granted control is a button; the rest are inert glass', () => {
  // A disabled button is still a button and still invites the press.
  const ok = a.control(RETRY, a.evaluate(RETRY, ENV));
  assert.match(ok, /<button type="button"/);
  const no = a.control(RETRY, a.evaluate(RETRY, { ...ENV, adapter: false }));
  assert.doesNotMatch(no, /<button/);
  assert.match(no, /role="note"/);
  assert.match(no, /aria-disabled="true"/);
  assert.match(no, /COMMAND ADAPTER/);
});

test('a control names exactly one missing authority', () => {
  const html = a.control(RETRY, a.evaluate(RETRY, { ...ENV, adapter: false }));
  assert.equal((html.match(/cd-grant-missing/g) || []).length, 1);
});

test('the rungs you cannot afford stay on the list', () => {
  // Hiding a verb an operator lacks authority for hides the system's shape.
  const verbs = [RETRY, { commandType: 'task.abort', label: 'ABORT', permit: true,
      irreversible: true },
    { commandType: 'task.rehome', label: 'REHOME', permit: true }];
  const html = a.ladder({ verbs, env: ENV });
  assert.match(html, /1 OF 3 GRANTED/);
  assert.match(html, /REHOME/);
  assert.match(html, /VERB TASK.REHOME/);
  still(a.ladder({ verbs: [], env: ENV }), 'exposes no verbs');
});

test('an unmeasured wait is named on every control', () => {
  const html = a.dominator({ verbs: [RETRY], env: ENV });
  assert.match(html, /WAIT UNMEASURED/);
  const timed = a.dominator({ verbs: [{ ...RETRY, expectedWait: 'ABOUT 40S' }], env: ENV });
  assert.match(timed, /ABOUT 40S/);
});

const SEATS = [
  { label: 'SALUD', standing: 'spoke' },
  { label: 'KANPAI', standing: 'spoke' },
  { label: 'HARNESS', standing: 'silent' },
];

test('no split is drawn from a single collapsed number', () => {
  // A dissent panel that invents a 3-0 out of one number is the exact
  // failure it exists to prevent.
  const html = d.magi({ seats: SEATS, collapsedState: 'needs_human' });
  assert.match(html, /AGREEMENT UNMEASURED/);
  assert.doesNotMatch(html, /\d-\d/);
  assert.match(html, /2 of 3 producers contributed/);
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 2);
});

test('the bench is known even when nobody on it answered', () => {
  const silent = d.magi({ seats: SEATS.map((s) => ({ ...s, standing: 'unreachable' })) });
  for (const seat of SEATS) assert.ok(silent.includes(seat.label), seat.label);
  assert.match(silent, /0 of 3 producers/);
  assert.match(silent, /UNMEASURED/);
  still(d.magi({ seats: SEATS.slice(0, 2) }), 'needs its full bench');
});

test('the glass draws both halves at the same weight', () => {
  const html = d.glassCell({
    passed: [{ label: 'STATE', path: 'sessions[].state' },
             { label: 'ATTEMPT', path: 'sessions[].work.attempt' }],
    blocked: [{ label: 'OPERATOR RISK', path: 'evidence.operator.risk', why: 'unmeasured' },
              { label: 'COST OF WAITING', path: 'evidence.operator.do_nothing', why: 'withheld' }] });
  assert.match(html, /PASSES 2  ·  BLOCKS 2/);
  assert.equal((html.match(/the glass blocks this one/g) || []).length, 2);
  assert.match(html, /data-why="withheld"/);
});

test('the sightline runs one way and the card says so', () => {
  const html = d.glassCell({ passed: [], blocked: [] });
  assert.match(html, /SEES/);
  assert.match(html, /window\s*in one direction only/);
});

const DOORS = [
  { label: 'EFFECTIVE MODE', state: 'open' },
  { label: 'OPERATOR SESSION', state: 'open' },
  { label: 'OPERATOR IDENTITY', state: 'shut' },
  { label: 'COMMAND ADAPTER', state: 'not_reached' },
  { label: 'SUBJECT PERMIT', state: 'not_reached' },
];

test('every door past the one held shut is drawn untried', () => {
  const html = d.keycard({ doors: DOORS });
  assert.match(html, /HELD AT OPERATOR IDENTITY/);
  assert.match(html, /2 not reached/);
  // Only the doors actually reached travelled.
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 3);
  assert.match(html, /data-state="not_reached"/);
});

test('an unstamped access is loud, because it cannot be ordered', () => {
  // A trace whose order cannot be established is not a trace.
  const html = d.keycard({ doors: DOORS, unstamped: 2 });
  assert.match(html, /UNORDERABLE · 2 EVENTS CARRY NO INSTANT/);
  assert.match(html, /these events carry no instant/);
  const clean = d.keycard({ doors: DOORS });
  assert.doesNotMatch(clean, /UNORDERABLE/);
  still(d.keycard({ doors: [] }), 'no corridor was described');
});

test('untested is neither passed nor standing', () => {
  // Every console that renders a checklist paints the remaining rows
  // green or grey, and both readings are wrong.
  const html = d.ice({ walls: DOORS });
  assert.match(html, /2 WALLS NOT REACHED/);
  assert.match(html, /Untested is neither passed nor standing/);
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 3);
});

test('the wall inset is derived, so no layer is silently dropped', () => {
  // A fixed step ran out of panel at the fifth layer in the reference and
  // stopped drawing the rest, which is the omission this specimen is about.
  const many = d.ice({ walls: [...DOORS, ...DOORS, ...DOORS] });
  assert.equal((many.match(/class="cd-dc-wall"/g) || []).length, 15);
  // Every rect still has positive extent. A floored step sends the
  // innermost ones negative, and a negative rect draws nothing at all --
  // the same silent drop, at a higher wall count.
  const deep = d.ice({ walls: Array.from({ length: 30 }, (_, i) =>
    ({ label: `WALL ${i}`, state: 'not_reached' })) });
  const sizes = [...deep.matchAll(/<rect x="[-\d.]+" y="[-\d.]+" width="([-\d.]+)" height="([-\d.]+)"/g)];
  assert.equal(sizes.length, 30);
  for (const [, w, h] of sizes) {
    assert.ok(Number(w) > 0 && Number(h) > 0, `degenerate rect ${w}x${h}`);
  }
  still(d.ice({ walls: [] }), 'no barrier was described');
});

test('a field with no stated contract is not a public one', () => {
  const fields = [
    { label: 'STATE', path: 'sessions[].state' },
    { label: 'BRANCH', path: 'evidence.git.branch' },
    { label: 'ARTIFACT', path: 'evidence.artifact.latest_path' }];
  const html = d.gevulot({ fields });
  assert.match(html, /NO CONTRACT PRODUCER/);
  assert.doesNotMatch(html, />PUBLIC</);
  assert.equal((html.match(/UNCONTRACTED/g) || []).length, 3);
  assert.match(html, /shares all 3 of them at once/);
});

test('a stated contract is drawn as stated, and counted apart', () => {
  const html = d.gevulot({ fields: [
    { label: 'STATE', path: 'a', contract: 'TEAM' },
    { label: 'BRANCH', path: 'b' }] });
  assert.match(html, /1 OF 2 UNCONTRACTED/);
  assert.match(html, /data-stated="1"/);
  still(d.gevulot({ fields: [] }), 'nothing on this surface is readable');
});

test('no decision component hides moving marks inside a stillness', () => {
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
    a.dominator({ verbs: [RETRY], env: ENV }), a.dominator({ verbs: [], env: ENV }),
    a.ladder({ verbs: [RETRY], env: ENV }),
    d.magi({ seats: SEATS }), d.magi({ seats: [] }),
    d.glassCell({ passed: [{ label: 'A', path: 'a' }],
                  blocked: [{ label: 'B', path: 'b', why: 'unmeasured' }] }),
    d.keycard({ doors: DOORS, unstamped: 2 }), d.keycard({ doors: [] }),
    d.ice({ walls: DOORS }), d.gevulot({ fields: [{ label: 'A', path: 'a' }] }),
  ];
  for (const html of cases) assert.equal(nesting(html), 0);
});

// --------------------------------------------------------------------------
// Finding #4: arithmetic on absence. `ice`/`keycard`/`magi` reported a *result*
// about things nobody reported at all -- `5 WALLS NOT REACHED` and `0 of 3 producers
// contributed` on a panel where every state field was simply absent. A state that
// was never said keeps its own word, its own ink, and its own count.

const UNKNOWN_WALLS = ['EFFECTIVE MODE', 'OPERATOR IDENTITY', 'COMMAND ADAPTER'].map((label) => ({
  label, state: 'unknown',
}));

test('a wall state nobody reported is not a wall you failed to reach', () => {
  const h = d.ice({ walls: UNKNOWN_WALLS });
  assert.match(h, /WALL STATES UNREPORTED/, 'silence gets its own words');
  assert.doesNotMatch(h, /NOT REACHED/, 'and not a fate the sequence never saw');
  assert.match(h, /data-motion="still"[^>]*data-refusal="1"/, 'in refusal ink: nobody said');
  const mixed = d.ice({ walls: [
    { label: 'EFFECTIVE MODE', state: 'open' },
    { label: 'OPERATOR IDENTITY', state: 'not_reached' },
    { label: 'COMMAND ADAPTER', state: 'unknown' },
  ] });
  assert.match(mixed, /1 NOT REACHED · 1 UNREPORTED/, 'the two counts are kept apart');
  assert.match(mixed, /NOT REACHED/, 'and the measured one is still drawn -- non-vacuous');
});

test('an unreported door cannot animate, and never claims the run was made', () => {
  const h = d.keycard({ doors: UNKNOWN_WALLS.map((w) => ({ label: w.label, state: 'unknown' })),
    unstamped: null });
  assert.doesNotMatch(h, /data-motion="trace"/, 'a state nobody said does not arrive');
  assert.match(h, /TURN UNMEASURED/, 'so the header says the turn was never measured');
  assert.match(h, /data-refusal="1"/, 'and the doors carry the refusal');
  assert.equal((h.match(/UNREPORTED/g) || []).length, 1,
    'the absence is stated once -- twice in two inks reads as two facts');
  const real = d.keycard({ doors: [
    { label: 'A', state: 'open' }, { label: 'B', state: 'shut' },
    { label: 'C', state: 'unknown' },
  ], unstamped: null });
  assert.match(real, /HELD AT B/, 'a reported halt is still read as a halt');
  assert.match(real, /data-motion="trace"/, 'and reported doors still animate');
});

test('an unanswered bench is not a bench that voted no', () => {
  const seats = ['SALUD', 'KANPAI', 'HARNESS'].map((label) => ({ label, standing: null }));
  const h = d.magi({ collapsedState: null, cite: 'source.per_producer_verdicts()', seats });
  assert.match(h, /NO PRODUCER STANDING RECORDED/, 'the absence is the finding');
  assert.doesNotMatch(h, /0 of 3/, 'no number reads as a verdict about silence');
  const answered = d.magi({ collapsedState: 'needs_human', cite: 'c', seats: [
    { label: 'SALUD', standing: 'spoke' }, { label: 'KANPAI', standing: null },
    { label: 'HARNESS', standing: 'silent' },
  ] });
  assert.match(answered, /1 of 2 producers contributed/, 'the denominator counts answers');
  assert.match(answered, /· 1 UNRECORDED/, 'and the missing seat is named, not divided in');
});
