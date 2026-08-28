// The trinity dial. A ratio drawn as an arc, and the arc IS the ratio.
//
// This began life as a canvas painting: an arc stroked to `ratio`, a tick
// ring, a number in the middle, and a requestAnimationFrame loop growing
// the sweep from zero. It looked correct and could not be audited. Pixels
// carry no attributes, so nothing could ask the picture whether the
// number behind it had been measured, and the growth animation would have
// run just as confidently over a ratio nobody supplied.
//
// Redrawn as SVG, the same picture answers. The arc is an element, the
// element wears a `level` mark, and a ratio with no measurement behind it
// does not sweep to zero -- it declines to sweep, and says why.

import { level, still, attrs } from '../marks.js';

const TAU = Math.PI * 2;
// Three quarters of a turn, opening at the bottom -- the gap is where a
// dial admits it has ends.
const START = Math.PI * 0.75;
const SWEEP = Math.PI * 1.5;
const TICKS = 24;

const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

function arcPath(cx, cy, r, from, to) {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  const large = to - from > Math.PI ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 `
       + `${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/**
 * @param {object} o
 * @param {number|null} o.value    what was observed
 * @param {number|null} o.ceiling  what it is out of
 * @param {boolean} o.measured     whether anybody actually observed it
 * @param {string} o.cite          the payload path the value came from
 * @param {string} o.label         the name of the dial
 * @param {string} [o.reading]     the text in the middle; defaults to value/ceiling
 * @param {string} [o.tone]        'live' | 'warn' | 'unmeasured' -- a token group,
 *                                 never a colour
 */
export function gauge({ value, ceiling, measured, cite, label,
                        reading = null, tone = 'live', size = 170 }) {
  const mark = level(value, ceiling, { measured, cite });
  const moving = mark['data-motion'] === 'level';
  const cx = size / 2;
  const cy = size / 2 + 6;
  const r = size * 0.34;

  // The arc is drawn to its full measured extent in the markup. The mark
  // asks the runtime to draw it *out* to there; with no runtime, or with
  // motion off, the reader still sees the correct ratio rather than an
  // empty ring. Settling is the rendered page.
  const fraction = moving ? Number(mark['data-level']) : 0;

  const ticks = [];
  for (let i = 0; i <= TICKS; i++) {
    const a = START + (SWEEP * i) / TICKS;
    const [x1, y1] = polar(cx, cy, r + 11, a);
    const [x2, y2] = polar(cx, cy, r + 16, a);
    ticks.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" `
             + `x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`);
  }

  const text = reading !== null ? reading
    : (moving ? `${value}/${ceiling}` : 'UNMEASURED');

  return `<figure class="cd-gauge" data-tone="${tone}"${moving ? '' : attrs(still(mark['data-still-reason']))}>
  <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img"
       aria-label="${label}: ${text}">
    <g class="cd-gauge-ticks">${ticks.join('')}</g>
    <path class="cd-gauge-track" d="${arcPath(cx, cy, r, START, START + SWEEP)}"/>
    ${moving
      ? `<path class="cd-gauge-arc"${attrs(mark)} pathLength="1"
             d="${arcPath(cx, cy, r, START, START + SWEEP)}"
             style="stroke-dasharray:1;stroke-dashoffset:${(1 - fraction).toFixed(4)}"/>`
      : `<path class="cd-gauge-arc cd-gauge-absent"
             d="${arcPath(cx, cy, r, START, START + SWEEP * 0.04)}"/>`}
    <text class="cd-gauge-read" x="${cx}" y="${cy + 9}" text-anchor="middle">${text}</text>
  </svg>
  <figcaption>${label}</figcaption>
  ${moving ? '' : `<i class="cd-why">${mark['data-still-reason']}</i>`}
</figure>`;
}
