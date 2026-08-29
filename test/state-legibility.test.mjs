// A state difference has to survive two things: a monitor with no hue discrimination, and a reader
// who never opens the legend. The library's own rule says so (`river.js`: "Event kinds map to
// shapes, never to colour alone"), and the reference states it from the other direction: on the
// Solari board the clock is red seven-segment and the board is white on black flaps, so "nothing
// about a difference is carried by hue alone here, each ink belongs to a different physical claim"
// (`vault/SPECS.md`).
//
// So each pair below is rendered and compared on two channels only: the **form** of what is drawn
// — shape, stroke width, dash, fill, opacity — with every coordinate stripped, and the **words**
// printed inside the state's own group. A pair that differs in neither is a difference carried by
// CSS colour, and it fails here. Comparing raw markup would never fail: two doors side by side
// differ in `x` for reasons that have nothing to do with their state, which is how the first draft
// of this test passed over the very thing it was written to catch.
import test from 'node:test';
import assert from 'node:assert/strict';

import { keycard } from '../src/components/decision.js';
import { syncRatio } from '../src/components/thread.js';
import { twoState, queueState } from '../src/components/telegraph.js';
import { dispatch } from '../src/components/agents.js';
import { needleField } from '../src/components/field.js';
import { river } from '../src/components/river.js';

const EPOCH = new Date('2026-06-01T09:00:00Z');

const POSITION = /\b(x|y|x1|y1|x2|y2|cx|cy|r|points)="[^"]*"/g;

/** What the drawing *is*, once you stop asking where it is. */
function formOf (markup) {
  const tags = [...markup.matchAll(/<(rect|line|circle|path|polygon)([^>]*)>/g)]
    .map((m) => {
      const attrs = m[2].replace(POSITION, '').replace(/\s+/g, ' ').trim()
        .split(' ').filter((a) => /^(stroke-width|stroke-dasharray|fill|opacity|width)=/.test(a))
        .sort().join(' ');
      return `${m[1]}{${attrs}}`;
    });
  return tags.join(' ');
}

function wordsOf (markup) {
  return [...markup.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1].trim()).join(' | ');
}

/** Pull each state's own group out of one render. */
function statesIn (html, cls) {
  const out = new Map();
  const re = new RegExp(`<g class="${cls}" data-[a-z-]+="([^"]+)"([^>]*)>([\\s\\S]*?)</g>`, 'g');
  for (const m of html.matchAll(re)) {
    const [, state, , inner] = m;
    if (!out.has(state)) out.set(state, { form: formOf(inner), words: wordsOf(inner), all: inner });
  }
  return out;
}

function assertLegible (label, states, { expectWords = false } = {}) {
  const seen = new Map();
  for (const [state, s] of states) {
    const key = `${s.form}::${s.words}`;
    if (seen.has(key)) {
      const other = seen.get(key);
      assert.fail(`${label}: ${state} and ${other} draw the same forms and print the same words — `
        + `the only thing telling them apart is CSS colour, which is the distinction the rule says `
        + `must not live in hue alone`);
    }
    seen.set(key, state);
  }
  if (expectWords) {
    for (const [state, s] of states) {
      assert.ok(s.words, `${label}: the ${state} state prints no word, so its difference must be in form`);
    }
  }
}

test('queueState: three ways to be empty, and only one of them is an all-clear', () => {
  // The faces the old build could not tell apart in words — an all-clear, a queue holding three, a
  // count that never arrived, a board nobody reached — are the states a colour-blind operator must
  // be able to read at a glance, because "clear" and "unknown" are the two answers that change what
  // the operator does next.
  const faces = new Map([
    ['holding work', queueState({ sourceState: 'live', openCount: 3 })],
    ['measured empty', queueState({ sourceState: 'measured_empty', openCount: 0 })],
    ['read, uncounted', queueState({ sourceState: 'live', producer: 'dispatcher', age: '12s' })],
    ['unreached', queueState({ sourceState: 'unavailable', producer: 'dispatcher', age: '4M AGO' })],
  ]);
  const states = new Map([...faces].map(([state, html]) => [state,
    { form: formOf(html), words: wordsOf(html), all: html }]));
  assertLegible('queueState', states, { expectWords: true });
});

test('keycard: open, shut and not-reached differ in the drawing itself', () => {
  const states = statesIn(keycard({ doors: [
    { label: 'AIRLOCK', state: 'open', at: 1 },
    { label: 'CORRIDOR', state: 'shut', at: 2 },
    { label: 'REACTOR', state: 'not_reached' },
  ] }), 'cd-dc-door');
  assert.equal(states.size, 3, 'a door state vanished from the trace');
  assertLegible('keycard', states);
  // And name the forms, so the semiotics is pinned rather than merely non-colliding: a future
  // edit that makes all three states "distinct" in some other way must not quietly unify them.
  const forms = [...states.entries()].map(([k, v]) => `${k}=${v.form}`);
  assert.match(states.get('not_reached').form, /stroke-dasharray/,
    'the untried door lost its dash, so absence is now only a hue');
  assert.equal(new Set(forms).size, 3, `door forms collapsed: ${forms.join(' ; ')}`);
});

test('syncRatio: spinning, stalled and unmeasured are named in words, not only in ink', () => {
  // `verdict` is the word's source and `state`/`output` are channels ({ known }), not strings —
  // the first draft passed strings, watched two renders agree, and reported a hue-only defect that
  // was my own call shape. Retracted in place, because a retraction nobody can read is a rumour.
  const seen = new Map();
  for (const verdict of ['spinning', 'stalled', 'unmeasured']) {
    const html = syncRatio({ output: { known: true }, state: { known: true }, verdict });
    const m = html.match(/<g class="cd-th-verdict" data-state="([^"]+)"[^>]*>([\s\S]*?)<\/g>/);
    assert.ok(m, `no verdict block was drawn for verdict=${verdict}`);
    seen.set(verdict, { form: formOf(m[2]), words: wordsOf(m[2]) });
  }
  assertLegible('syncRatio', seen, { expectWords: true });
});

test('twoState: the chosen box and the unchosen one differ in stroke, not warmth', () => {
  const states = statesIn(twoState({ states: [
    { label: 'KEEP IT', why: 'keeps the run', selected: true },
    { label: 'DROP IT', why: 'loses the proof', selected: false },
  ] }), 'cd-tg-choice');
  assert.equal(states.size, 2, 'a choice box vanished');
  assertLegible('two-state commit', states);
});

test('dispatch: a fitted part and a missing part differ in the chain', () => {
  const states = statesIn(dispatch({ workers: [
    { session_id: 'ses-1', harness: 'pi', model: 'qwen3.8-flash', host: 'dellpromax', did: 'did:cd:1' },
    { session_id: 'ses-2', harness: 'pi', model: null, host: 'hermes', did: null },
  ] }), 'cd-ag-part');
  assert.ok(states.size >= 2, `expected fitted and missing parts, saw: ${[...states.keys()]}`);
  assertLegible('dispatch', states);
});

// The lane that owes a person is coloured amber in `components.css` — the same ink-per-state move
// the Solari board makes twice (FINAL CALL red, GATE closed dimmed and lower-case). Colour is
// allowed only because the plate also says it in words; this is the check that it still does.
test('river: a lane that owes a human says so in words, not only in amber', () => {
  const html = river({ lanes: [
    { id: 'run-4419', attempt: 1, state: 'needs_human', events: [{ at: EPOCH, kind: 'gate_passed' }] },
    { id: 'run-4423', attempt: 1, state: 'running', events: [{ at: EPOCH, kind: 'worker_retry_authorized' }] },
  ] });
  assert.match(html, /AWAITING OPERATOR/,
    'the lane that owes a person stopped saying it, leaving hue to carry the whole difference');
  assert.notEqual((html.match(/needs_human/g) || []).length, 0,
    'the state attribute itself disappeared from the markup');
});

test('needleField: a reported health and an unreported one differ beyond opacity', () => {
  const states = statesIn(needleField({ workers: [
    { session_id: 'ses-1', bearing: 12, hot: true },
    { session_id: 'ses-2', bearing: null },
  ] }), 'cd-fd-needle');
  assert.ok(states.size >= 2, `expected known and unknown needles, saw: ${[...states.keys()]}`);
  assertLegible('needleField', states);
});
