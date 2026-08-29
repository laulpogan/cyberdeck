// AGENTS AND COMMS -- seven components. Two rules: trust is drawn as
// signal quality and never as a badge, and a withheld row keeps its
// place, because silent absence teaches an operator the fleet is smaller
// than it is.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as ag from '../src/components/agents.js';

const still = (html, why) => {
  assert.match(html, /data-motion="still"/);
  if (why) assert.match(html, new RegExp(why));
};

const SIBLINGS = [
  { session_id: 'ses-01', title: 'migrate schema', harness: 'kanpai',
    model: 'opus-5', host: 'dellpromax', context_percent: 82, turns: 41, tool_calls: 96 },
  { session_id: 'ses-02', title: 'run the suite', harness: 'kanpai',
    model: 'opus-5', host: 'dellpromax', context_percent: 12, turns: 4, tool_calls: 6 },
  { session_id: 'ses-03', title: null, harness: 'kanpai', model: 'opus-5',
    host: 'spark', context_percent: null, turns: null, tool_calls: null },
];

test('divergence is drawn against the group\'s own span', () => {
  const html = ag.individuation({ profile: 'opus-5 · kanpai', siblings: SIBLINGS });
  assert.match(html, /DIVERGED · CONTEXT 12%-82%/);
  assert.match(html, /data-diverged="1"/);
  const tight = ag.individuation({ profile: 'p',
    siblings: SIBLINGS.slice(0, 2).map((s) => ({ ...s, context_percent: 40 })) });
  assert.match(tight, /CONVERGENT/);
});

test('an unmeasured worker is not an identical one', () => {
  // No bar, and it says so. Drawn at zero it would read as a fresh worker.
  const html = ag.individuation({ profile: 'p', siblings: SIBLINGS });
  assert.match(html, /CONTEXT UNMEASURED/);
  assert.match(html, /context was not measured/);
  assert.equal((html.match(/data-motion="level"/g) || []).length, 2);
  still(ag.individuation({ profile: 'p', siblings: [] }), 'no sibling was observed');
});

test('a withheld worker does not get to arrive', () => {
  // Redaction is a deliberate hole. An entrance would give the hole the
  // same presence as the workers who are actually there.
  const html = ag.individuation({ profile: 'p',
    siblings: [{ ...SIBLINGS[0], redacted: true }, SIBLINGS[1]] });
  assert.match(html, /this worker is withheld, so it does not arrive/);
  assert.equal((html.match(/data-motion="count"/g) || []).length, 1);
  assert.match(html, /data-redacted="1"/);
  // Its context burn was measured, and stays measured. Redaction hides an
  // identity, not a reading.
  assert.equal((html.match(/data-motion="level"/g) || []).length, 2);
});

test('the divergence word is refused when nothing was measured', () => {
  const html = ag.individuation({ profile: 'p',
    siblings: SIBLINGS.map((s) => ({ ...s, context_percent: null })) });
  assert.match(html, /DIVERGENCE UNMEASURED/);
  assert.doesNotMatch(html, /CONVERGENT/);
});

test('the chain goes dashed at the first part not fitted', () => {
  // A dispatch that fills an absent model with the usual one is how a
  // fleet ends up running something nobody chose.
  const html = ag.dispatch({ workers: [
    { session_id: 'ses-01', harness: 'kanpai', model: 'opus-5',
      host: 'dellpromax', did: 'did:wire:abc' },
    { session_id: 'ses-02', harness: 'kanpai', model: null,
      host: 'spark', did: null }] });
  assert.match(html, /1 OF 2 MANIFESTS COMPLETE/);
  assert.match(html, /no model was fitted/);
  assert.match(html, /no part is ever defaulted/);
});

test('a part after a missing one never reports as fitted', () => {
  // The chain stops where it stops. A later part drawn live implies the
  // dispatch got further than it did.
  const html = ag.dispatch({ workers: [
    { session_id: 'x', harness: null, model: 'opus-5', host: 'spark', did: 'd' }] });
  assert.match(html, /a later part is missing/);
  assert.equal((html.match(/data-motion="count"/g) || []).length, 0);
  still(ag.dispatch({ workers: [] }), 'no worker was offered');
});

test('a withheld part is not a fitted one', () => {
  const html = ag.dispatch({ workers: [
    { session_id: 'x', harness: 'kanpai', model: 'opus-5', host: 'spark',
      did: ag.WITHHELD }] });
  assert.match(html, /0 OF 1 MANIFESTS COMPLETE/);
});

const FRAGMENTS = [
  { label: 'IF NOBODY ACTS', value: 'the lease expires in 40m',
    cite: 'evidence.operator.do_nothing' },
  { label: 'RETRY PERMIT', value: null, cite: 'evidence.retry.permitted' },
  { label: 'ATTEMPTS SO FAR', value: 4, cite: 'work.attempt' },
  { label: 'BLOCKED BY', value: 'credential expired', cite: 'state_reason' },
];

test('fragments are held apart and compose with nothing', () => {
  const html = ag.oracle({ fragments: FRAGMENTS });
  assert.match(html, /NO FORECAST IS ASSEMBLED/);
  assert.equal((html.match(/a fragment composes with nothing/g) || []).length, 4);
  assert.match(html, /no priors exist to forecast from/);
  assert.doesNotMatch(html, /data-motion="trace"/);
});

test('the space a forecast would occupy is drawn empty, not omitted', () => {
  // Left off the panel it reads as a component that does not forecast,
  // rather than one that refuses to.
  const html = ag.oracle({ fragments: FRAGMENTS });
  assert.match(html, /cd-ag-noforecast/);
  assert.match(html, /outcome_priors/);
  still(ag.oracle({ fragments: [] }), 'no fragment was held');
});

test('the dossier names each part its producer went silent on', () => {
  const html = ag.dossier({ worker: {
    harness: 'kanpai', model: 'opus-5', host: 'dellpromax',
    did: null, session_id: 'ses-01' } });
  assert.match(html, /UNMEASURED/);
  assert.match(html, /data-known="0"/);
  for (const [label] of ag.DOSSIER_ROWS) assert.ok(html.includes(label), label);
  still(ag.dossier({ worker: null }), 'no identity is drawn');
});

test('one helper draws every disc', () => {
  // A sheet that renders its own copy of a mark will disagree with the
  // product without anyone noticing.
  const worker = { harness: 'k', model: 'm', host: 'h', session_id: 's' };
  const shapes = (html) => (html.match(/<circle[^>]*class="cd-ag-(ring|core)"/g) || []).length;
  assert.equal(shapes(ag.dossier({ worker })), 2);
  assert.equal(shapes(ag.redaction({ workers: [worker] })), 2);
  assert.equal(shapes(ag.individuation({ profile: 'p', siblings: [worker] })), 2);
});

test('a withheld disc is struck through, not simply absent', () => {
  const html = ag.disc({ redacted: true });
  assert.match(html, /cd-ag-strike/);
  assert.match(html, /WITHHELD/);
  assert.doesNotMatch(html, /cd-ag-core/);
});

test('trust is a trace, and every class is shown together', () => {
  // One row at a time an operator learns "this looks a bit rough" and
  // never learns the scale.
  const html = ag.channel({});
  for (const [name] of ag.TRUST) assert.ok(html.includes(name), name);
  assert.match(html, /data-noise="0"/);
  assert.match(html, /data-noise="3"/);
  assert.doesNotMatch(html, /badge/i);
});

test('the trace is deterministic, so two captures compare', () => {
  assert.equal(ag.channel({}), ag.channel({}));
});

test('an undeclared trust class is UNATTRIBUTED, never a generous default', () => {
  assert.equal(ag.trustOf(undefined), 'UNATTRIBUTED');
  assert.equal(ag.trustOf('nonsense'), 'UNATTRIBUTED');
  assert.equal(ag.trustOf(' derived '), 'DERIVED');
});

test('a withheld row keeps its place and its measures', () => {
  // A worker that vanished would teach an operator the fleet is smaller
  // than it is, with no way to notice from inside the list.
  const html = ag.redaction({ workers: [
    { title: 'migrate', session_id: 'ses-01', did: 'did:wire:abc', turns: 41 },
    { title: 'audit', session_id: 'ses-02', redacted: true, turns: 9 }] });
  assert.match(html, /1 OF 2 WITHHELD/);
  assert.match(html, /audit/);
  assert.match(html, />9</);
  still(ag.redaction({ workers: [] }), 'no worker was observed');
});

const RECEIPT = {
  receipt_id: 'km-4419-a4', title: 'migrate schema · attempt 4',
  fit: { harness: 'kanpai', model: 'opus-5', profile: 'long-run', host: 'dellpromax' },
  damage: { proof_state: 'failed', terminal: 'worker exited 1', reason: 'credential expired' },
  cost: { amount: null, cite: 'cost_gateway.CLAIMS[provider_charge]' },
};

test('unpriced is a truthful value, not a placeholder', () => {
  // A receipt that guessed would be the first number anyone put in a
  // spreadsheet.
  const html = ag.killmail({ receipt: RECEIPT });
  assert.match(html, /UNPRICED/);
  assert.match(html, /no canonical charge record is supplied/);
  assert.match(html, /data-priced="0"/);
  assert.match(html, /km-4419-a4/);
});

test('the receipt records the fit and the damage as objects', () => {
  const html = ag.killmail({ receipt: RECEIPT });
  for (const value of Object.values(RECEIPT.fit)) assert.ok(html.includes(value), value);
  for (const value of Object.values(RECEIPT.damage)) assert.ok(html.includes(value), value);
  still(ag.killmail({ receipt: null }), 'no attempt was recorded as lost');
});

test('a priced receipt lights up in place', () => {
  const html = ag.killmail({ receipt: {
    ...RECEIPT, cost: { amount: '$1.42', cite: 'charges[]' } } });
  assert.match(html, /data-priced="1"/);
  assert.match(html, /\$1\.42/);
});

test('no agents component hides moving marks inside a stillness', () => {
  const nesting = (html) => {
    const tags = html.match(/<[a-z0-9]+[^>]*>|<\/[a-z0-9]+>/g) || [];
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
    ag.individuation({ profile: 'p', siblings: SIBLINGS }),
    ag.individuation({ profile: 'p', siblings: [] }),
    // The case the browser probe caught: a withheld worker whose context
    // WAS measured. Refusing its arrival must not still its reading.
    ag.individuation({ profile: 'p',
      siblings: [{ ...SIBLINGS[0], redacted: true }, SIBLINGS[1]] }),
    ag.dispatch({ workers: [{ session_id: 'x', harness: 'k', model: 'm', host: 'h', did: 'd' }] }),
    ag.dispatch({ workers: [] }),
    ag.oracle({ fragments: FRAGMENTS }), ag.oracle({ fragments: [] }),
    ag.dossier({ worker: { harness: 'k' } }), ag.dossier({ worker: null }),
    ag.channel({}), ag.redaction({ workers: [{ title: 'a', redacted: true }] }),
    ag.killmail({ receipt: RECEIPT }), ag.killmail({ receipt: null }),
  ];
  for (const html of cases) assert.equal(nesting(html), 0);
});

/** A priced receipt must not carry a refusal. The cost line used to stamp
 * `no canonical charge record is supplied` on every receipt, so the markup
 * said `data-priced="1"`, printed the amount, and declared in the same tag
 * that no charge record was supplied. The honesty bar reads the DOM, and a
 * reviewer greps it: a refusal that is not true is not a conservative error,
 * it is a second reading of the same fact. */
test('a killmail with a charge record claims the charge it holds', () => {
  const priced = ag.killmail({ receipt: {
    title: 'ATTEMPT LOST', receipt_id: 'km-4419',
    fit: { harness: 'h-1' }, damage: { proof_state: 'PROVEN' },
    cost: { amount: '4.10 ISK', cite: 'cost_gateway.CLAIMS[provider_charge]' },
  } });
  assert.match(priced, /data-priced="1"/);
  assert.match(priced, /4\.10 ISK/);
  assert.doesNotMatch(priced, /data-refusal|data-still-reason/,
    'a refusal is stamped only when it is true');
  const unpriced = ag.killmail({ receipt: { title: 'ATTEMPT LOST', fit: {}, damage: {} } });
  assert.match(unpriced, /data-priced="0"/);
  assert.match(unpriced, /data-refusal="1"[^>]*data-still-reason="no canonical charge record is supplied"|data-still-reason="no canonical charge record is supplied"[^>]*data-refusal="1"/,
    'the unpriced receipt still refuses, in the refusal ink');
});

// Finding #4, same shape: `0 OF 3 MANIFESTS COMPLETE` reported three failures on the
// strength of nobody having said anything about the three sessions. The population is
// measured (the session ids are there); the completion state is not.
test('an unreported manifest is not a failed manifest', () => {
  const silent = ag.dispatch({ workers: ['ses-1', 'ses-2'].map((session_id) => ({
    session_id, harness: null, model: null, host: null, did: null,
  })) });
  assert.match(silent, /MANIFEST STATE UNMEASURED · 2 SESSIONS LISTED/,
    'the measured population is kept, the verdict is not');
  assert.doesNotMatch(silent, /OF 2 MANIFESTS/, 'no fraction scores what was never sent');
  const partial = ag.dispatch({ workers: [
    { session_id: 'ses-1', harness: 'pi', model: 'q', host: 'dell', did: 'did:1' },
    { session_id: 'ses-2', harness: null, model: null, host: null, did: null },
    { session_id: 'ses-3', harness: 'codex', model: null, host: 'spark', did: null },
  ] });
  assert.match(partial, /1 OF 2 MANIFESTS COMPLETE · 1 UNREPORTED/,
    'the denominator counts manifests that were reported on');
});
