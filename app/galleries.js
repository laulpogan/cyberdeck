// The two galleries the component registry does not cover: the ten mark
// kinds on /rules, and the drawing primitives on /primitives. Every
// example is produced by calling the real function and printing whatever
// it returned -- refusals and all -- so the page cannot disagree with the
// library about what a mark looks like.

import * as M from '../src/marks.js';
import * as D from '../src/draw.js';
import { wrapped } from '../src/components/card.js';

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Every mark example prints the attributes it actually emitted, using the
// library's own renderer. The printed string IS the contract.
const show = (mark) => `<code class="mark-attrs">${esc(M.attrs(mark).trim())}</code>`;

const chip = (mark, text) => `${chipPlain(mark, text)}${block(show(mark))}`;
const chipPlain = (mark, text) => `<span class="rule-chip"${M.attrs(mark)}>${esc(text)}</span>`;
const block = (s) => `<div class="mark-attrs-line">${s}</div>`;

export function markBays() {
  return [
    { name: 'arrive', question: 'Did this change, and does anyone know when?',
      needs: 'an observed timestamp',
      measured: () => chip(M.arrive(2, 5), 'changed 2S ago'),
      refused: () => chip(M.arrive(null, 5), 'changed?'),
      reason: 'no change was timestamped',
    },
    { name: 'decay', question: 'How stale is this, before I read the number?',
      needs: 'a measured age',
      measured: () => chip(M.decay(4, { window: 12 }), '4S into a 12S window'),
      refused: () => chip(M.decay(null, { window: 12 }), 'age unknown'),
      reason: 'age was not measured',
    },
    { name: 'count', question: 'How many, and in what order were they counted?',
      needs: 'an index inside a real count',
      measured: () => block(show(M.count(0, 5)))
        + [0, 1, 2, 3, 4].map((i) => chipPlain(M.count(i, 5), i)).join(''),
      refused: () => block(show(M.count(null, null)))
        + [0, 1, 2].map(() => chipPlain(M.count(null, null), '?')).join(''),
      reason: 'population was not counted',
    },
    { name: 'level', question: 'How full, drawn rather than printed?',
      needs: 'a measured quantity and a ceiling',
      measured: () => `<span class="rule-bar"${M.attrs(M.level(62, 100,
        { measured: true, cite: 'telemetry.pct' }))}><i style="transform:scaleX(.62)"></i></span>`
        + block(show(M.level(62, 100, { measured: true, cite: 'telemetry.pct' }))),
      refused: () => `<span class="rule-bar is-void"${M.attrs(M.level(null, 100,
        { measured: false, cite: 'telemetry.pct' }))}><i></i></span>`
        + block(show(M.level(null, 100, { measured: false, cite: 'telemetry.pct' }))),
      reason: 'quantity was not measured',
    },
    { name: 'elapsed', question: 'How long, still counting because it is still true?',
      needs: 'a duration and a live source',
      measured: () => `<span class="rule-chip is-clock"${M.attrs(M.elapsed(330, 'live',
        { cite: 'wait.seconds', style: 'lower' }))}><b data-elapsed-text>5m</b> wait</span>`
        + block(show(M.elapsed(330, 'live', { cite: 'wait.seconds', style: 'lower' }))),
      refused: () => `<span class="rule-chip is-clock"${M.attrs(M.elapsed(330, 'stale',
        { cite: 'wait.seconds', style: 'lower' }))}><b data-elapsed-text>5m</b> wait</span>`
        + block(show(M.elapsed(330, 'stale', { cite: 'wait.seconds', style: 'lower' }))),
      reason: 'source is stale; the clock stopped when the feed did',
    },
    { name: 'trace', question: 'Did anything actually travel this path?',
      needs: 'the fact that something did',
      measured: () => miniSvg(`<g${M.attrs(M.trace(true, { cite: 'routes[].delivered' }))}>`
        + D.line(6, 34, 58, 10, { width: 1.6 }) + D.line(58, 10, 114, 34, { width: 1.6 }) + '</g>')
        + block(show(M.trace(true, { cite: 'routes[].delivered' }))),
      refused: () => miniSvg(`<g${M.attrs(M.trace(false, { cite: 'routes[].delivered' }))}>`
        + D.line(6, 34, 114, 34, { width: 1.6, dashed: true }) + '</g>')
        + block(show(M.trace(false, { cite: 'routes[].delivered' }))),
      reason: 'nothing travelled this path',
    },
    { name: 'traffic', question: 'Is this feed live, at its own interval?',
      needs: 'a positive measured period',
      measured: () => chip(M.traffic(3, 'live', { cite: 'oldest_wait_seconds' }), 'TICK 3S'),
      refused: () => chip(M.traffic(3, 'stale', { cite: 'oldest_wait_seconds' }), 'NO CADENCE'),
      reason: 'source is stale, not live',
    },
    { name: 'cycle', question: 'Is this being polled, and is the next poll due?',
      needs: 'a position inside a known interval',
      measured: () => `<span class="rule-bar is-cycle"${M.attrs(M.cycle(0.4, 10, 'live',
        { cite: 'poll.interval' }))}><i style="transform:scaleX(.4)"></i></span>`
        + block(show(M.cycle(0.4, 10, 'live', { cite: 'poll.interval' }))),
      refused: () => `<span class="rule-bar is-void"${M.attrs(M.cycle(40, 10, 'live',
        { cite: 'poll.interval' }))}><i></i></span>`
        + block(show(M.cycle(40, 10, 'live', { cite: 'poll.interval' }))),
      reason: 'poll is overdue',
    },
    { name: 'intent', question: 'Did the operator cause it?',
      needs: 'nothing — they are the producer',
      measured: () => `<button type="button" class="rule-btn"${M.attrs(M.intent('press'))}>PRESS</button>`
        + block(show(M.intent('press'))),
      refused: () => '<span class="rule-reason-inline">intent has no refusal -- the operator is the producer</span>',
      reason: 'the only mark that proves nothing, marked anyway so a review can tell interface response from a claim',
    },
    { name: 'still', question: 'And what does a refusal itself look like?',
      needs: 'a reason',
      measured: () => show(M.still('a legend is not a reading')),
      refused: () => chipPlain(M.still('this one is printed plainly'), 'DECLARED STILL')
        + block(show(M.still('this one is printed plainly'))),
      reason: 'still is not a fallback but a declaration',
    },
  ];
}

const miniSvg = (body) => `<svg class="rule-mini" viewBox="0 0 120 44" width="120" height="44"
  role="img" aria-label="trace example" style="color:var(--cd-signal-data)">${body}</svg>`;

// The primitives: geometry, not readings. Colour is never a literal here
// either -- shapes inherit currentColor and the page sets it from a token.
export function primitiveBays() {
  const bay = (name, note, body, opts = {}) => ({ name, note, body, ...opts });
  return [
    bay('frame', 'The one sized SVG. viewBox + CSS size, so every drawing is legible at 390px and 1440px.',
      D.frame(120, 44, D.rect(4, 4, 112, 36, { dashed: true }) + D.dot(60, 22, 4))),
    bay('hexagon', 'A points string, not an element — point-up or flat-top.',
      miniSvg(`<polygon points="${D.hexagon(60, 22, 16)}" fill="none" stroke="currentColor"/>`)),
    bay('hexCell', 'The comb cell. Dashed is the unmeasured face.',
      miniSvg(D.hexCell(40, 22, 14) + D.hexCell(80, 22, 14, { dashed: true, width: 1.4 }))),
    bay('rect', 'Stroke follows currentColor; dashed means not-reached.',
      miniSvg(D.rect(12, 10, 40, 24) + D.rect(66, 10, 40, 24, { dashed: true }))),
    bay('line', 'The connector. 4-3 dash is the library\'s not-tried rhythm.',
      miniSvg(D.line(8, 12, 112, 12) + D.line(8, 32, 112, 32, { dashed: true }))),
    bay('dot', 'Hollow is declared, not decorative.',
      miniSvg(D.dot(30, 22, 5) + D.dot(60, 22, 5, { hollow: true }) + D.dot(90, 22, 5, { width: 2 }))),
    bay('ring', 'An unfilled circle — the dial face, the exclusion halo.',
      miniSvg(D.ring(60, 22, 14) + D.ring(60, 22, 8, { dashed: true }))),
    bay('arc', 'A stroked arc between two angles, drawn the short way.',
      miniSvg(D.arc(60, 30, 20, Math.PI, Math.PI * 1.9, { width: 2 }))),
    bay('wedge', 'A filled pie slice — the radar sector.',
      miniSvg(D.wedge(60, 34, 24, -Math.PI / 2, -0.5, { opacity: '.35' }))),
    bay('needle', 'Always the same length: direction is measured, magnitude is not.',
      miniSvg(D.needle(34, 22, 12, 0.8) + D.needle(86, 22, 12, -1.9))),
    bay('text', 'SVG text with escaped content; anchors, sizes, opacity.',
      miniSvg(D.text(8, 26, 'AS FAR AS READ', { size: 10 }))),
    bay('hatched', 'The texture of "no instrument reported this". Blank would read as quiet, and quiet is a measurement.',
      miniSvg(D.hatched(12, 8, 96, 28))),
    bay('scanlines', 'A surface, not a reading.',
      miniSvg(D.scanlines(12, 8, 96, 28) + D.rect(12, 8, 96, 28))),
    bay('staticField', 'Grain creeping in from the edges. A seeded LCG, not Math.random, so captures diff.',
      miniSvg(D.staticField(12, 8, 96, 28, { density: 0.55, seed: 419 }))),
    bay('wall', 'One cell per counted thing — returns null when the count is null, because an empty grid for an uncounted board is a lie.',
      (() => { const w = D.wall(24, { columns: 12, r: 4, marked: [3, 9, 14],
        mark: () => '' }); return D.frame(120, 44, w.body); })()),
    bay('curve', 'A line through measured samples. One sample returns null: a chart drawn through one point is the most convincing lie a series can tell.',
      miniSvg(D.curve([[0.05, 0.7], [0.3, 0.2], [0.55, 0.6], [0.8, 0.15], [0.95, 0.45]],
        { width: 112, height: 30 })
        + `<g transform="translate(4,6)">${D.curve([[0.5, 0.5]], { width: 112, height: 30 }) || D.text(40, 20, 'ONE SAMPLE REFUSES', { size: 8 })}</g>`)),
    bay('axis', 'Drawn even with no series — the frame is what tells an operator a recorder was meant to be here.',
      miniSvg(D.axis(112, 36))),
    bay('card', 'The wrapper every bounded specimen shares. The refusal reason is read off the mark, so a card cannot disagree with its own drawing.',
      `<div class="prim-card-demo"><figure class="cd-card" data-specimen="demo" data-motion="still" data-still-reason="a legend is not a reading">
        <figcaption class="cd-card-name">Safe-envelope gauge</figcaption>
        <div class="cd-card-body">${miniSvg(D.ring(60, 22, 12))}</div>
        <i class="cd-why">a legend is not a reading</i></figure></div>`),
    bay('wrapped', 'SVG text does not wrap. Breaking it by character count cuts words in half, which is worse than overflowing because it looks deliberate.',
      miniSvg(`<g style="color:var(--cd-steel-ink)">${wrapped(8, 12,
        'the record stops here and says where', 22, { size: 8 })}</g>`)),
  ];
}
