// THE THREAD -- six components, and the half-detector trap they all sit
// next to. Every one of these wants two channels and is handed one, so
// most of what is asserted here is that the missing half stays visible
// instead of being quietly rounded into a verdict.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as th from '../src/components/thread.js';

const still = (html, why) => {
  assert.match(html, /data-motion="still"/);
  if (why) assert.match(html, new RegExp(why));
};

test('a dark pane renders its own face and never the other pane\'s', () => {
  // The rule the twin deck exists for. A pane quietly showing something
  // else is worse than a dark one.
  const html = th.mfd({ panes: [
    { label: 'RUNTIME', value: 'tool: rg', detail: 'turn 41', cite: 'telemetry' },
    { label: 'TIMELINE', value: null, cite: 'evidence.timeline' }] });
  assert.match(html, /NO PRODUCER/);
  assert.match(html, /this readout has no producer/);
  assert.match(html, /evidence\.timeline/);
  assert.doesNotMatch(html, /NO PRODUCER[\s\S]*NO PRODUCER/);
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 1);
});

test('the deck refuses to be a deck with one pane', () => {
  still(th.mfd({ panes: [{ label: 'RUNTIME', value: 'x' }] }),
    'a twin deck needs two panes');
});

test('one measurable channel does not make a whole verdict', () => {
  // Nothing stamps a last-output instant, so the detector says so rather
  // than reporting SPINNING off the half it can see.
  const html = th.syncRatio({
    output: { known: false }, state: { known: true, moving: false } });
  assert.match(html, /SYNC UNMEASURED/);
  assert.match(html, /NO PRODUCER/);
  assert.doesNotMatch(html, /SPINNING/);
});

test('no lane claims movement it never sampled over time', () => {
  const html = th.syncRatio({
    output: { known: true, moving: true }, state: { known: true, moving: true },
    verdict: 'in_sync' });
  assert.match(html, /ONE SAMPLE/);
  assert.match(html, /no series was retained for this lane/);
  assert.equal((html.match(/data-motion="still"/g) || []).length >= 2, true);
});

test('the ratio track stays dark rather than drawing one point as a curve', () => {
  const html = th.syncRatio({
    output: { known: true }, state: { known: true }, verdict: 'in_sync' });
  assert.match(html, /NO SERIES RETAINED/);
  assert.match(html, /progress_history/);
});

test('the cut is drawn as one hard rule with nothing under it', () => {
  const html = th.hardCut({ changed: 3, inFlight: 'rg --files', attempt: 4,
    branch: 'build/foundation' });
  assert.match(html, /— CUT — ATTEMPT 4 LOST —/);
  assert.match(html, /NOTHING RESUMES BELOW THIS/);
  assert.match(html, /IN FLIGHT/);
  assert.equal((html.match(/data-motion="count"/g) || []).length, 3);
});

test('an unpriced cut is refused, not drawn free', () => {
  // A scar over an empty panel says the cut costs nothing, which is the
  // one claim this component exists to refuse.
  const html = th.hardCut({ changed: null, attempt: null });
  assert.match(html, /CHANGE SET UNMEASURED/);
  assert.match(html, /ATTEMPT UNMEASURED LOST/);
  still(html, 'the cut is unpriced');
});

test('a priced cut with nothing in flight says so rather than drawing nothing', () => {
  const html = th.hardCut({ changed: 0, inFlight: null, attempt: 2 });
  assert.match(html, /NOTHING IN FLIGHT/);
  assert.doesNotMatch(html, /CHANGE SET UNMEASURED/);
});

const QUESTIONS = [
  { question: 'WHAT IS IT DOING', answer: 'rg --files', cite: 'telemetry.last_tool' },
  { question: 'WHEN DID IT LAST MOVE', answer: '4M AGO',
    cite: 'evidence.worker.last_progress_at' },
  { question: 'WHO AUTHORISED IT', answer: null, cite: 'command_log.actor_id' },
  { question: 'WHAT HAS IT COST', answer: null, cite: 'cost_gateway.CLAIMS' },
];

test('a refusal is an answer and gets the same rule as one', () => {
  const html = th.muthur({ answers: QUESTIONS });
  assert.equal((html.match(/UNABLE TO COMPUTE/g) || []).length, 2);
  assert.match(html, /2 OF 4 ANSWERABLE/);
  // Every refusal names the producer that would answer it.
  assert.match(html, /command_log\.actor_id/);
  assert.match(html, /cost_gateway/);
});

test('the query list refuses to exist without questions', () => {
  still(th.muthur({ answers: [] }), 'no question list is defined');
});

test('a projection is lifted out of the panel, not badged inside it', () => {
  const html = th.joiOverlay({ rows: [
    { kind: 'observed', label: 'STATE', value: 'running', cite: 'sessions[].state' },
    { kind: 'projected', label: 'ETA', value: '~12M', cite: 'derived from turns' }] });
  assert.match(html, /cd-th-overlay/);
  assert.match(html, /a projection is not a reading/);
  // The observed list is a reading, so it reveals in payload order and carries no
  // stillness; the projected lane is refused at its `<ul>`, and since nothing animates
  // inside a stillness, each of its rows declares that stillness too.
  const canon = html.slice(html.indexOf('cd-th-canon'), html.indexOf('cd-th-overlay'));
  assert.match(canon, /data-motion="count"/, 'an observed row is revealed in order');
  assert.doesNotMatch(canon, /data-motion="still"/, 'and nothing measured is refused');
  const projected = html.slice(html.indexOf('cd-th-overlay'));
  assert.match(projected, /data-motion="still"/, 'the projection lane declares stillness');
  assert.doesNotMatch(projected, /data-motion="count"/, 'and does not reveal anything');
});

test('an empty side of the overlay is drawn, not omitted', () => {
  const html = th.joiOverlay({ rows: [
    { kind: 'observed', label: 'STATE', value: 'running', cite: 'x' }] });
  assert.match(html, /NOTHING/);
});

test('an unmeasured context gets no panel at all', () => {
  // A clean panel is exactly what a fresh session looks like.
  const html = th.contextBurn({ percent: null });
  assert.match(html, /CONTEXT UNMEASURED/);
  assert.match(html, /reads as a fresh one/);
  assert.doesNotMatch(html, /BURNED/);
  still(html, 'context was not measured');
});

test('the burn is a level over a real ceiling, and marks its edge', () => {
  const html = th.contextBurn({ percent: 82, subject: { id: 'ses-4419', state: 'running' } });
  assert.match(html, /data-motion="level"/);
  assert.match(html, /82% BURNED/);
  assert.match(html, new RegExp(`EDGE ${th.BURN_EDGE}%`));
  assert.match(html, /data-past-edge="1"/);
  const under = th.contextBurn({ percent: 20 });
  assert.match(under, /data-past-edge="0"/);
});

test('the grain is deterministic, so two renders are the same bytes', () => {
  // A review captures a page byte for byte. Math.random() here would make
  // every capture a diff.
  assert.equal(th.contextBurn({ percent: 61 }), th.contextBurn({ percent: 61 }));
});

test('no thread component hides moving marks inside a stillness', () => {
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
    th.mfd({ panes: [{ label: 'A', value: 'x', cite: 'a' }, { label: 'B', value: null, cite: 'b' }] }),
    th.syncRatio({ output: { known: false }, state: { known: true } }),
    th.hardCut({ changed: 3, attempt: 4 }), th.hardCut({ changed: null }),
    th.muthur({ answers: QUESTIONS }),
    th.joiOverlay({ rows: [{ kind: 'projected', label: 'ETA', value: '~12M', cite: 'x' }] }),
    th.contextBurn({ percent: 82 }), th.contextBurn({ percent: null }),
  ];
  for (const html of cases) assert.equal(nesting(html), 0);
});

/** The ratio band is the library's clearest unmarked silence, and it sat inside a
 * component whose lanes were both marked: a hatched span with `NO SERIES RETAINED`
 * printed on it and no mark in the DOM, so a script auditing refusals counted zero
 * over a refusal made on purpose. A ratio is a relationship over time, and one
 * sample cannot make one. */
test('the sync ratio declares why it cannot be computed', () => {
  const html = th.syncRatio({ output: { known: true, value: '91%' },
    state: { known: true, value: '4%' }, verdict: 'spinning' });
  assert.match(html, /class="cd-th-ratio"[^>]*data-refusal="1"/);
  assert.match(html, /class="cd-th-ratio"[^>]*data-motion="still"/,
    'a refusal is still a stillness — the honesty counters read the same attribute');
  assert.match(html, /class="cd-th-ratio"[^>]*data-still-reason="a ratio is a relationship over time, and one sample cannot make one"/);
});
