// The eleven marks, each shown running and each shown refusing.
//
// This module is the page's argument in data form, so it is plain ESM and the
// test can read it: for every kind it holds the sentence the marks module says
// about itself (quoted, not paraphrased -- a page that rewrites a refusal into
// marketing has stopped reporting what the library claims), the arguments that
// make it move, the arguments that make it refuse, and a drawing small enough to
// sit two of side by side.
//
// Nothing here is a component. `src/draw.js` provides the shapes and
// `src/marks.js` provides the attributes, which is exactly the seam the
// components are built on -- so what the page shows is the rule rather than an
// illustration of it, and the refusal in the right-hand column is the real
// `data-still-reason` a reviewer would go and grep for.

import {
  arrive, decay, count, level, elapsed, trace, traffic, cycle, intent, still,
  attrs, durationWords,
} from '../../src/marks.js';
import {
  frame, hexCell, rect, line, dot, ring, arc, wedge, hatched, text,
} from '../../src/draw.js';
import { NOW_S } from '../fixtures/time.js';

const W = 208;
const H = 60;

/** The drawing every row shares: a baseline, so "moved" and "did not move" have
 * something to have moved relative to. */
const stage = (body, label) => frame(W, H, body, { label, fit: 'xMinYMid meet' });

export const MARK_KINDS = [
  {
    kind: 'arrive',
    line: 'Enter, once, because this changed at a time somebody recorded.',
    given: 'changedAt = 40s before the frozen instant · now = that instant · window = 300s',
    refused: 'the same three cells with no timestamp on the change',
    measured: arrive(NOW_S - 40, NOW_S, { window: 300 }),
    refuses: arrive(null, NOW_S, { window: 300 }),
    draw: (mark) => stage([
      hexCell(28, 30, 16, { extra: attrs(mark) }),
      hexCell(74, 30, 16, { extra: attrs(mark) }),
      hexCell(120, 30, 16, { extra: attrs(mark) }),
      text(150, 34, 'cells', { size: 8, opacity: '.6' }),
    ].join(''), 'three cells arriving'),
  },

  {
    kind: 'decay',
    line: 'Settle from flash to rest across the real staleness window. The fade IS the age',
    given: 'age = 4s · window = 15s',
    refused: 'the same line with the age unmeasured',
    measured: decay(4, { window: 15 }),
    refuses: decay(null, { window: 15 }),
    draw: (mark) => stage([
      line(12, 30, 196, 30, { width: 2, extra: attrs(mark) }),
      dot(196, 30, 3, {}),
    ].join(''), 'a value settling'),
  },

  {
    kind: 'count',
    line: 'Reveal in payload order so the eye can count along. A stagger over a population nobody counted is a rhythm invented to look considered.',
    given: 'five cells of a count of five',
    refused: 'the same five cells with no total',
    measured: count(2, 5),
    refuses: count(2, null),
    draw: (mark) => stage([
      [0, 1, 2, 3, 4].map((i) => rect(12 + i * 38, 18, 30, 24, {
        width: 1, extra: attrs(i === 2 ? mark : count(i, mark['data-total'] ? 5 : null)),
      })).join(''),
    ].join(''), 'five cells in payload order'),
  },

  {
    kind: 'level',
    // An HTML row, because a bar is an extent and the runtime scales the `<i>`
    // inside the marked element -- the same `<i>` the components hand it.
    kind_uses_html: true,
    line: 'A measured quantity drawing itself out to its measured extent.',
    given: 'value = 26 · ceiling = 64 · measured = true',
    refused: 'the same box with measured = false',
    measured: level(26, 64, { measured: true, cite: 'hud.channel_budget' }),
    refuses: level(26, 64, { measured: false, cite: 'hud.channel_budget' }),
    draw: (mark) => `<span class="cd-rule-bar"${attrs(mark)}>
  <i style="transform: scaleX(${mark['data-level'] ?? 1})"></i>
</span>`,
    drawRefused: () => stage(rect(0, 0, W, H) + hatched(0, 0, W, H), 'a quantity nobody filled in'),
  },

  {
    kind: 'elapsed',
    line: 'A measured duration that keeps counting, because it is still true.',
    given: 'seconds = 9400 · sourceState = live',
    refused: 'the same counter on a stale feed',
    measured: elapsed(9400, 'live', { cite: 'evidence.operator.deadline_at' }),
    refuses: elapsed(9400, 'stale', { cite: 'evidence.operator.deadline_at' }),
    draw: (mark) => stage([
      ring(40, 30, 20, { extra: attrs(mark) }),
      text(70, 34, durationWords(9400), { size: 12, weight: 'bold', extra: '' }),
    ].join(''), 'a duration still true'),
  },

  {
    kind: 'trace',
    line: 'A path drawn along its own length, because something travelled it.',
    given: 'travelled = true · two paths, ordered',
    refused: 'the same route with nothing having travelled it',
    measured: trace(true, { cite: 'routes[].delivered', order: 0, total: 2 }),
    refuses: trace(false, { cite: 'routes[].delivered', order: 0, total: 2 }),
    draw: (mark) => stage([
      arc(104, 78, 62, Math.PI * 1.18, Math.PI * 1.82, { width: 1.6, extra: attrs(mark) }),
      dot(20, 22, 3, {}),
      dot(188, 22, 3, { hollow: true }),
    ].join(''), 'a route travelled'),
  },

  {
    kind: 'traffic',
    line: 'The one ambient loop, and the strictest gate here.',
    given: 'period = 6s · sourceState = live',
    refused: 'the same pulse on a source that is not live',
    measured: traffic(6, 'live', { cite: 'source.refresh_ms' }),
    refuses: traffic(6, 'stale', { cite: 'source.refresh_ms' }),
    draw: (mark) => stage([
      dot(104, 30, 9, { extra: attrs(mark) }),
      ring(104, 30, 20, { dashed: true, width: 0.8 }),
    ].join(''), 'a pulse at the producer’s interval'),
  },

  {
    kind: 'cycle',
    // The dial rather than the bar: `data-cycle-axis="rotate"` is the geometry
    // that says which poll is due, and it is the kind that refuses loudest.
    line: 'The same loop spent better: a poll indicator running the real clock.',
    given: 'spent = 18s of a 60s period · sourceState = live',
    refused: 'a poll due forty seconds ago that has not landed',
    measured: cycle(18, 60, 'live', { cite: 'source.poll_interval_s' }),
    refuses: cycle(100, 60, 'live', { cite: 'source.poll_interval_s' }),
    draw: (mark) => stage([
      `<g${attrs(mark)} data-cycle-axis="rotate" data-cycle-origin="40 30">`,
      wedge(40, 30, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI / 6, { opacity: '.3' }),
      line(40, 30, 40, 10, { width: 1.6 }),
      '</g>',
      ring(40, 30, 22, { dashed: true, width: 0.8 }),
      text(74, 34, 'one turn per poll', { size: 8, opacity: '.6' }),
    ].join(''), 'a poll spent'),
  },

  {
    kind: 'intent',
    line: 'Operator-caused motion. The operator is the producer, so this one proves nothing -- but it is still marked, so a review can tell interface response apart from a claim about the world.',
    given: 'the press of a button',
    refused: 'nothing refuses: this kind is the only one whose subject is the page',
    measured: intent('press'),
    refuses: intent('press'),
    offNote: 'the operator is the producer: this mark is not a measurement, and the switch does not touch it',
    drawsRefused: true,
    draw: (mark) => `<button type="button" class="cd-rule-intent"${attrs(mark)}>press</button>`,
  },

  {
    kind: 'still',
    line: 'Declared stillness. The reason is the point.',
    given: 'a refusal with its reason named',
    refused: 'the same drawing with the mark forgotten, which is what the reason is for',
    measured: still('the producer sent no reading'),
    refuses: still('the producer sent no reading'),
    offNote: 'a refusal is already a refusal: with nothing supplied this row is what every other row became',
    drawsRefused: true,
    draw: (mark) => stage([
      rect(12, 18, 184, 24, { width: 1, extra: attrs(mark) }),
      text(20, 34, 'refused, and says why', { size: 8 }),
    ].join(''), 'a declared stillness'),
    drawRefused: () => stage([
      rect(12, 18, 184, 24, { width: 1 }),
      text(20, 34, 'unmarked, and unprovable', { size: 8, opacity: '.5' }),
    ].join(''), 'a drawing nobody marked'),
  },

  {
    kind: 'attrs',
    // Not a kind of motion: the helper that lets a mark travel as text, which is
    // what lets a Python server and a React tree produce the same bytes. The page
    // itself is the demonstration -- every specimen here spreads the same object
    // into JSX rather than pasting a string.
    line: 'Render a mark as an HTML attribute string, for templates and servers that build markup as text rather than as elements.',
    given: 'one mark object',
    refused: 'nothing refuses; this is the seam, not a claim',
    measured: trace(true, { cite: 'routes[].delivered' }),
    // The seam still has to obey the rack: what the row demonstrates is how a mark
    // travels as text, not that a mark may keep moving with nothing behind it.
    refuses: trace(false, { cite: 'routes[].delivered' }),
    drawsRefused: true,
    draw: (mark) => stage([
      arc(104, 78, 62, Math.PI * 1.18, Math.PI * 1.82, { width: 1.6, extra: attrs(mark) }),
    ].join(''), 'the same mark, as attributes'),
  },
];

/** The attribute text a visitor would grep for, as the browser sees it. */
export function markText(mark) {
  return attrs(mark).trim();
}
