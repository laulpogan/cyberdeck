// The phosphor oscilloscope. One lane per subject, events on a real time
// axis, and a beam that draws each lane once because the lane happened.
//
// As canvas this was a per-frame repaint with the trails faded by
// compositing a translucent black rectangle over the whole picture --
// genuinely the way a phosphor tube behaves, and genuinely unauditable.
// The decay was a constant. Nothing tied it to how old anything was, and
// a lane whose subject was never observed drew exactly like one that
// completed.
//
// In SVG each lane is a path and each event a glyph, so the beam becomes
// what it always was: a `trace`, staggered in the order the lanes are
// read. A lane with no events does not draw, and says so.

import { trace, count, decay, still, attrs } from '../marks.js';

// Event kinds map to shapes, never to colour alone. A reader who cannot
// distinguish the two greens still reads the run.
const GLYPH = {
  gate_passed: 'sealed', accepted: 'sealed',
  canonical_blocked: 'blocked',
  retry_authorized: 'retry', worker_retry_authorized: 'retry', operator_retry: 'retry',
};
const shapeOf = (kind) => GLYPH[kind] || 'mark';

const at = (t) => (t instanceof Date ? t.getTime() : new Date(t).getTime());

function glyph(x, y, kind) {
  const shape = shapeOf(kind);
  if (shape === 'sealed') {
    return `<circle cx="${x}" cy="${y}" r="4.5"/><circle class="cd-riv-ring" cx="${x}" cy="${y}" r="8.5"/>`;
  }
  if (shape === 'blocked') return `<rect x="${x - 3.5}" y="${y - 6}" width="7" height="12"/>`;
  if (shape === 'retry') {
    return `<polygon points="${x},${y - 6} ${x + 5},${y + 5} ${x - 5},${y + 5}"/>`;
  }
  return `<rect x="${x - 2}" y="${y - 4}" width="4" height="8"/>`;
}

/**
 * @param {object} o
 * @param {Array} o.lanes  [{ id, attempt, state, events: [{ at, kind }] }]
 * @param {string} o.cite  the payload path the events came from
 * @param {number} [o.width] drawing width in user units
 * @param {number} [o.staleAfter] seconds after which a finished lane has
 *        settled; drives the `decay` on each lane's trail
 */
export function river({ lanes, cite, width = 900, laneHeight = 66,
                        gutter = 200, staleAfter = null, now = null }) {
  if (!lanes || !lanes.length) {
    return `<figure class="cd-river"${attrs(still('no lanes were observed'))}>
  <i class="cd-why">no lanes were observed</i></figure>`;
  }

  const height = lanes.length * laneHeight + 24;
  const right = width - 26;
  const rows = lanes.map((lane, index) => {
    const y = 20 + index * laneHeight + laneHeight / 2;
    const events = lane.events || [];

    // A lane with nothing on it is drawn as a lane, not omitted -- an
    // absent row and an empty row must not look alike.
    if (events.length < 2) {
      return `<g class="cd-riv-lane" data-state="${lane.state}"${attrs(still('this lane has no run to draw'))}>
        <text class="cd-riv-id" x="12" y="${y - 7}">${lane.id}</text>
        <text class="cd-riv-state" x="12" y="${y + 7}">NO RUN OBSERVED</text>
        <line class="cd-riv-empty" x1="${gutter}" y1="${y}" x2="${right}" y2="${y}"/>
      </g>`;
    }

    const stamps = events.map((e) => at(e.at));
    const t0 = Math.min(...stamps);
    const t1 = Math.max(...stamps);
    const span = Math.max(1, t1 - t0);
    const px = (t) => gutter + ((at(t) - t0) / span) * (right - gutter);

    // The trail fades by the lane's real age, not by a constant. With no
    // clock supplied the fade is refused rather than invented.
    const age = now === null ? null : (at(now) - t1) / 1000;
    const trail = decay(age, { window: staleAfter });

    const segments = events.slice(0, -1).map((e, i) => {
      const blocked = e.kind === 'canonical_blocked';
      return `<line class="cd-riv-seg" data-blocked="${blocked ? 1 : 0}" `
           + `x1="${px(e.at).toFixed(1)}" y1="${y}" `
           + `x2="${px(events[i + 1].at).toFixed(1)}" y2="${y}"/>`;
    }).join('');

    const marks = events.map((e, i) =>
      `<g class="cd-riv-ev" data-kind="${shapeOf(e.kind)}"${attrs(count(i, events.length))}>`
      + glyph(px(e.at).toFixed(1), y, e.kind) + '</g>').join('');

    // The beam. It travels because the run happened; the stagger is the
    // order the lanes are read, so the deck fills top to bottom.
    const beam = trace(true, { cite, order: index, total: lanes.length });

    const awaiting = lane.state === 'needs_human'
      ? `<g class="cd-riv-await"${attrs(still('this lane is waiting on a person'))}>
           <text x="${right}" y="${y - 12}" text-anchor="end">AWAITING OPERATOR</text></g>`
      : '';

    return `<g class="cd-riv-lane" data-state="${lane.state}"${attrs(trail)}>
      <text class="cd-riv-id" x="12" y="${y - 7}">${lane.id}  A${lane.attempt}</text>
      <text class="cd-riv-state" x="12" y="${y + 7}">${String(lane.state).toUpperCase()}</text>
      <g class="cd-riv-run"${attrs(beam)}>${segments}</g>
      ${marks}${awaiting}
    </g>`;
  });

  return `<figure class="cd-river">
  <svg viewBox="0 0 ${width} ${height}" width="100%" role="img"
       aria-label="${lanes.length} lanes on a time axis">
    <g class="cd-riv-axis"><line x1="${right}" y1="8" x2="${right}" y2="${height - 8}"/></g>
    ${rows.join('')}
  </svg>
</figure>`;
}
