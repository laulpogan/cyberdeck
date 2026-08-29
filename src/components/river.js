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

import { attrs, count, decay, refusal, still, trace } from '../marks.js';

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

// ---------------------------------------------------------------------
// THE RIVER -- time, and how little of it a fleet keeps.
//
// Every component below is a component about HISTORY, and most producers
// retain almost none: one snapshot, one live attempt, one freshness
// number. No series, no prior snapshot, no expected shape, no deadline.
// So a family built to draw time is mostly a family drawing the shape of
// a hole, and the discipline is that each one draws its OWN hole and
// names the series it wanted -- rather than six charts printing the same
// shrug. A reader learns which recorder to build first.

import { frame, rect, line, text, arc, ring, dot, hatched, axis } from '../draw.js';
import { traffic, elapsed, durationWords } from '../marks.js';
import { card, esc as _esc, W, H } from './card.js';

const PAD = 12;
const SPAN = W - PAD * 2;

const NO_RESOLUTION = 'NO FURTHER RESOLUTION';
const NO_TAPE = 'NO TAPE';

/** Four attempts on one work item is where a human would look. Not a
 * diagnosis and not tuned against anything -- named so it can be argued
 * with. */
export const OSCILLATION_CANDIDATE = 3;

/** ESPER evidence dive -- as deep as the record goes, and no deeper.
 *
 * Blade Runner's ESPER zooms forever and the zoom is the fantasy. The
 * honest dive descends only as far as the producer retains, then draws
 * the floor AS A FRAME rather than leaving it off the end. A viewer that
 * keeps offering another step teaches an operator the detail exists
 * somewhere, which is the one thing ESPER is famous for getting wrong. */
export function esperDive({ levels }) {
  if (!levels || !levels.length) {
    return card('esper', 'ESPER evidence dive', '',
      { refusalWord: 'NO DEPTH MEASURED',
    mark: still('nothing was dived into') });
  }
  const gap = 12;
  const bw = (SPAN - gap * (levels.length - 1)) / levels.length;
  const bh = 52, top = 12;
  const g = [];
  levels.forEach((level, i) => {
    const x = PAD + i * (bw + gap);
    const known = level.value !== null && level.value !== undefined && level.value !== '';
    if (level.floor) {
      g.push(`<g class="cd-riv-floor">${hatched(x, top, bw, bh)}</g>`);
    } else {
      g.push(`<g class="cd-riv-frame" data-known="${known ? 1 : 0}"`
        + `${attrs(trace(known, { cite: level.cite, order: i, total: levels.length }))}>`
        + rect(x, top, bw, bh, { dashed: !known }) + '</g>');
      // The region the next step enlarges, marked inside this one. The
      // leaders are what make the chain a dive rather than a row.
      if (i + 1 < levels.length) {
        g.push(`<g class="cd-riv-crop">`
          + rect(x + bw * .34, top + bh * .3, bw * .3, bh * .3, { width: 1.2 }) + '</g>');
        g.push(`<g class="cd-riv-leader"`
          + `${attrs(trace(known, { cite: level.cite, order: i, total: levels.length }))}>`
          + line(x + bw * .64, top + bh * .3, x + bw + gap, top, { dashed: true })
          + line(x + bw * .64, top + bh * .6, x + bw + gap, top + bh, { dashed: true })
          + '</g>');
      }
    }
    g.push(text(x, top + bh + 12, level.label, { size: 6.5 }));
  });
  // The readout, one row per level, walked down in the order the dive
  // goes -- so the reveal reaches the floor rather than dropping the
  // whole ladder with the floor already on it.
  levels.forEach((level, i) => {
    const y = 96 + i * 25;
    const known = level.value !== null && level.value !== undefined && level.value !== '';
    g.push(`<g class="cd-riv-level" data-floor="${level.floor ? 1 : 0}" `
      + `data-known="${known ? 1 : 0}"${attrs(count(i, levels.length))}>`
      + text(PAD, y, level.label, { size: 7, opacity: '.7' })
      + text(PAD, y + 11, known ? String(level.value)
          : (level.floor ? NO_RESOLUTION : 'UNMEASURED'),
          { size: 9, opacity: known ? null : '.55' })
      + text(W - PAD, y + 11, level.cite, { size: 6, anchor: 'end', opacity: '.45' })
      + '</g>');
  });
  return card('esper', 'ESPER evidence dive',
    frame(W, H, g.join(''), {
      label: 'Each level is a region of the one before it, enlarged, until the '
           + 'last frame is empty: the record stops there.' }),
    { note: 'The zoom stops where the producer stops.' });
}

/** Tape splice & stitch -- a join you can see.
 *
 * One strip of tape whose break is drawn: retained stock solid, the
 * attempts before it drawn as gaps that were never wound, two strokes
 * across the join the way a physical splice is taped. A continuous strip
 * here would be an edit presented as a recording. */
export function tapeSplice({ attempt, events = 0, cite = 'sessions[].evidence.timeline' }) {
  const prior = Number.isInteger(attempt) ? Math.max(attempt - 1, 0) : null;
  const reels = prior === null ? []
    : [...Array(prior)].map((_, i) => ({ attempt: i + 1, retained: false }))
        .concat([{ attempt, retained: true }]);
  const seam = Boolean(prior);
  const y = 78, g = [];
  if (!reels.length) {
    g.push(`<g class="cd-riv-gap">${hatched(PAD, y - 9, SPAN, 18)}</g>`);
    g.push(text(W / 2, y + 4, 'UNMEASURED', { size: 9.5, anchor: 'middle' }));
  } else {
    const bw = SPAN / reels.length;
    reels.forEach((reel, i) => {
      const x = PAD + i * bw;
      if (reel.retained) {
        g.push(`<g class="cd-riv-stock"`
          + `${attrs(trace(true, { cite, order: i, total: reels.length }))}>`
          + line(x + 2, y, x + bw - 2, y, { width: 3 }) + '</g>');
        g.push(text(x + 16, y + 27, `${events} EVENTS`, { size: 7, opacity: '.6' }));
      } else {
        g.push(`<g class="cd-riv-gap"${attrs(still('this attempt kept no tape'))}>`
          + line(x + 2, y, x + bw - 2, y, { width: 2, dashed: true }) + '</g>');
        g.push(text(x + 2, y - 9, NO_TAPE, { size: 7 }));
      }
      // The seam strokes land where the retained reel starts, so its own
      // label steps clear of them rather than being drawn through.
      g.push(text(x + (seam && i && reel.retained ? 16 : 2), y + 15,
        `A${reel.attempt}`, { size: 8 }));
      if (seam && i && reel.retained) {
        // Two strokes. One line would read as a tick mark.
        g.push('<g class="cd-riv-seam">'
          + line(x - 5, y - 11, x + 3, y + 11, { width: 1.4 })
          + line(x + 3, y - 11, x + 11, y + 11, { width: 1.4 })
          + text(x + 3, y - 20, 'SEAM', { size: 7, anchor: 'middle' }) + '</g>');
      }
    });
  }
  g.push(text(PAD, 130, seam ? 'THE SEAM IS DRAWN' : 'ONE REEL, NO SPLICE', { size: 8 }));
  g.push(text(PAD, 145, seam ? 'the reels before it were not retained'
                             : 'nothing precedes the retained reel',
    { size: 7, opacity: '.6' }));
  return card('splice', 'Tape splice & stitch',
    frame(W, H, g.join(''), {
      label: 'One strip of tape: the retained reel solid, the reels before it '
           + 'drawn as gaps, and the join marked.' }),
    { note: 'A splice you cannot see is an edit presented as a recording.' });
}

/** Oscillation detector -- the question a counter can raise.
 *
 * Wiener's hunting: a loop that overshoots, corrects, overshoots. Retry,
 * fail, retry, fail is that shape and it is the most expensive pattern in
 * an agent fleet. Detecting it needs a series. The attempt counter gives
 * a CANDIDATE; amplitude and period stay unmeasured, drawn as two hatched
 * bands at full width. A candidate drawn as a diagnosis is how a console
 * teaches an operator to stop reading it. */
export function oscillation({ attempt, reason = null, sourceState,
                              cite = 'source.attempt_outcomes(work_id)',
                              period = null,
                              threshold = OSCILLATION_CANDIDATE }) {
  const n = Number.isInteger(attempt) ? attempt : 0;
  const candidate = Number.isInteger(attempt) && attempt > threshold;
  const lane = 24, top = 28;
  const step = SPAN / Math.max(n + 1, threshold + 2);
  const g = [line(PAD, top + lane, PAD + SPAN, top + lane, { width: 1 })];
  for (let i = 0; i < n; i++) {
    const x = PAD + (i + 1) * step;
    g.push(`<g class="cd-riv-attempt"${attrs(trace(true, { cite, order: i, total: n }))}>`
      + line(x, top + lane, x, top + 4, { width: 2 }) + '</g>');
  }
  const tx = PAD + (threshold + 0.5) * step;
  // The ticks above are attempts that happened, each with its place in the
  // series, so they may trace. This line is the threshold: a rule somebody set,
  // drawn once, with nothing measured about its length. A rule that animates
  // itself looks like an event.
  g.push(`<g class="cd-riv-threshold"${attrs(still('the threshold is a rule, not a route'))}>`
    + line(tx, top - 6, tx, top + lane + 6, { dashed: true })
    + text(tx + 4, top - 8, `THRESHOLD ${threshold}`, { size: 7 }) + '</g>');
  if (!Number.isInteger(attempt)) {
    g.push('<g class="cd-riv-nocount">' + hatched(PAD, top, SPAN, lane)
      + text(W / 2, top + lane - 8, 'ATTEMPT UNMEASURED', { size: 8, anchor: 'middle' })
      + '</g>');
  }
  let y = top + lane + 22;
  ['AMPLITUDE', 'PERIOD'].forEach((label) => {
    g.push(text(PAD, y - 3, label, { size: 7, opacity: '.8' }));
    g.push('<g class="cd-riv-missing">' + hatched(PAD, y, SPAN, 16)
      + text(W / 2, y + 11, 'UNMEASURED', { size: 8, anchor: 'middle' }) + '</g>');
    y += 32;
  });
  // The joke of this specimen, made checkable: it detects oscillation and
  // it may not oscillate. A rhythm needs a period, nobody keeps one, so
  // the detector that would hunt prettily over an unmeasured period
  // stands still instead.
  //
  // The beat rides the verdict line, NOT the drawing. Wrapping the whole
  // frame in it put every honest attempt tick inside a declared
  // stillness -- motion under a `still` mark, which is the exact lie the
  // marks exist to make findable.
  const beat = traffic(period, sourceState, { cite });
  const verdict = `<div class="cd-riv-osc" data-candidate="${candidate ? 1 : 0}"`
    + `${attrs(beat)}><b>${candidate ? 'OSCILLATION CANDIDATE' : 'NO CANDIDATE'}</b>`
    + `<span>ATTEMPT ${_esc(Number.isInteger(attempt) ? attempt : 'UNMEASURED')}`
    + `${reason ? ' · ' + _esc(reason) : ''}</span></div>`;
  return card('oscillation', 'Oscillation detector',
    frame(W, y + 8, g.join(''), {
      extra: `data-candidate="${candidate ? 1 : 0}"`,
      label: 'One tick per attempt against a visible threshold, over the two '
           + 'bands nobody instruments.' }) + verdict,
    { note: 'A candidate, not a diagnosis.' });
}

/** Loop-trace deviation -- what happened, and the shape nobody wrote down.
 *
 * Westworld's hosts run a loop and the drama is the deviation from it.
 * Deviation needs an expected trace and no producer supplies one, so the
 * reference track renders empty AT THE SAME WIDTH as the observed one --
 * a missing recorder shrunk into a footnote stops being visible. The
 * observed events still draw. Nothing is subtracted from anything. */
export function loopDeviation({ observed = [], cite = 'expected_trace(work_id)' }) {
  const lane = 26, top = 26;
  const g = [text(PAD, top - 6, 'OBSERVED', { size: 7, opacity: '.8' }),
             line(PAD, top + lane, PAD + SPAN, top + lane, { width: 1 })];
  observed.forEach((row, i) => {
    const x = PAD + (i + 0.5) * (SPAN / Math.max(observed.length, 1));
    g.push(`<g class="cd-riv-event"`
      + `${attrs(trace(true, { cite: 'observed[]', order: i, total: observed.length }))}>`
      + line(x, top + lane, x, top + 5, { width: 2 }) + dot(x, top + 4, 2.2) + '</g>');
    g.push(text(x, top + lane + 10,
      String(row.kind || 'unclassified').replace(/_/g, ' ').toUpperCase().slice(0, 12),
      { size: 6.5, anchor: 'middle', opacity: '.8' }));
  });
  if (!observed.length) {
    g.push(text(PAD + 4, top + lane - 9, 'NO EVENTS RETAINED', { size: 8 }));
  }
  const y = top + lane + 34;
  g.push(text(PAD, y - 6, 'EXPECTED', { size: 7, opacity: '.8' }));
  // A refusal, not a gap. The observed events are a measurement with a hole in
  // it; this band is the comparison that could not be computed because nobody
  // wrote the loop down — a fact about the archive, drawn in the refusal ink so
  // it does not read as another unmeasured quantity inside live data.
  g.push(`<g class="cd-riv-noref"${attrs(refusal('no reference trace was ever written'))}>`
    + hatched(PAD, y, SPAN, lane)
    + text(W / 2, y + lane - 9, 'NO REFERENCE TRACE', { size: 8.5, anchor: 'middle' })
    + '</g>');
  g.push(text(PAD, y + lane + 22, 'NO DELTA IS COMPUTED', { size: 8, weight: '600' }));
  g.push(text(PAD, y + lane + 34, cite, { size: 6.5, opacity: '.45' }));
  return card('deviation', 'Loop-trace deviation',
    frame(W, H, g.join(''), {
      label: 'The observed events, and the reference loop drawn at the same '
           + 'size and hatched because nobody wrote it down.' }),
    { note: 'A deviation drawn against an assumed loop measures the assumption.' });
}

/** Collar countdown -- elapsed, because remaining is unknowable.
 *
 * Cyber City Oedo 808's collar counts down to a real instant and that is
 * exactly what makes it mean anything. Nothing here supplies a deadline,
 * so the collar counts UP, the ring is left open, and the countdown is
 * refused. A countdown with an invented terminus is manufactured urgency,
 * and manufactured urgency is how a console trains an operator to ignore
 * it. */
export function collar({ elapsedSeconds = null, waitingSeconds = null,
                         sourceState, cite = 'evidence.operator.deadline_at' }) {
  const cx = 74, cy = 92, r = 44;
  const g = [ring(cx, cy, r, { width: 1 })];
  if (elapsedSeconds !== null && elapsedSeconds !== undefined) {
    // Capped rather than wrapped -- a wrapped arc reads as a second lap
    // that nobody measured.
    const turn = Math.min(Number(elapsedSeconds) / (12 * 3600), 1);
    g.push(`<g class="cd-riv-elapsed"${attrs(trace(true, { cite }))}>`
      + arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.max(turn, .02) * 2 * Math.PI,
            { width: 4 }) + '</g>');
    g.push(text(cx, cy + 2, durationWords(elapsedSeconds, 'upper'),
      { size: 13, anchor: 'middle' }));
    g.push(text(cx, cy + 14, 'ELAPSED', { size: 7, anchor: 'middle', opacity: '.7' }));
  } else {
    g.push(`<g class="cd-riv-nodial">${ring(cx, cy, r, { width: 3, dashed: true })}</g>`);
    g.push(text(cx, cy + 3, 'UNMEASURED', { size: 9, anchor: 'middle' }));
  }
  g.push('<g class="cd-riv-noend">' + ring(cx, cy, r + 10, { width: 1, dashed: true })
    + text(cx, cy + r + 26, 'NO TERMINUS', { size: 7, anchor: 'middle' }) + '</g>');
  g.push(text(PAD, 22, 'IT COUNTS UP', { size: 8, weight: '600' }));
  g.push(text(PAD, 34, cite, { size: 6.5, opacity: '.45' }));
  g.push(text(150, 74, 'REMAINING', { size: 7, opacity: '.7' }));
  g.push(hatched(150, 80, W - PAD - 150, 18));
  g.push(text(155, 93, 'NO DEADLINE SET', { size: 8 }));
  // Elapsed is the one number here that is true and still moving. Written
  // as a static string it is a counter that has stopped, which is the one
  // thing a collar must never look like.
  const tick = elapsed(elapsedSeconds, sourceState, { cite, style: 'lower' });
  const wait = elapsed(waitingSeconds, sourceState, { cite, style: 'lower' });
  const readout = `<div class="cd-riv-readout">
    <span${attrs(tick)}><b data-elapsed-text>${_esc(durationWords(elapsedSeconds, 'lower') || 'UNMEASURED')}</b> elapsed</span>
    <span${attrs(wait)}><b data-elapsed-text>${_esc(durationWords(waitingSeconds, 'lower') || 'UNMEASURED')}</b> in this state</span>
  </div>`;
  return card('collar', 'Collar countdown',
    frame(W, H, g.join(''), {
      label: 'The collar counts up. The ring is left open because no producer '
           + 'supplies a deadline.' }) + readout,
    { note: 'Counting down to an invented instant is manufactured urgency.' });
}

/** The lanes a strip chart would carry if anything recorded them. They
 * are drawn whether or not they hold data, because four dark lanes on one
 * axis is the fact -- a chart drawing only the lane somebody could fill
 * reads as a chart of everything there is. */
export const STRIP_LANES = ['STATE', 'OUTPUT', 'PROOF', 'HUMAN'];

/** Phosphor strip chart -- four lanes, and the dark on all of them.
 *
 * Cybersyn's strip charts drew a series. One sample is not a series, so
 * the retained sample draws as ONE MARK at its own instant and the rest
 * of the strip stays hatched. A flat line drawn from a single sample is
 * the most common chart lie in software, and it reads as stability. */
export function stripChart({ sample = null, sourceState,
                             cite = 'source.snapshot_series(session_id)',
                             lanes = STRIP_LANES }) {
  const lane = 18, gap = 14, top = 24;
  const g = [];
  let y = top;
  lanes.forEach((label, i) => {
    g.push(text(PAD, y - 4, label, { size: 7, opacity: '.8' }));
    if (i === 0 && sample) {
      // The retained sample sits at the present edge. Everything left of
      // it is hatched, not blank: a blank span reads as a quiet period,
      // and quiet is a measurement.
      g.push(`<g class="cd-riv-dark">${hatched(PAD, y, SPAN - 8, lane)}</g>`);
      g.push(`<g class="cd-riv-sample">`
        + line(PAD + SPAN - 4, y, PAD + SPAN - 4, y + lane, { width: 3 }) + '</g>');
      g.push(text(PAD + SPAN - 10, y + lane - 5, 'ONE SAMPLE',
        { size: 7, anchor: 'end' }));
    } else {
      g.push(`<g class="cd-riv-dark">${hatched(PAD, y, SPAN, lane)}</g>`);
      g.push(text(W / 2, y + lane - 5, 'NEVER MEASURED', { size: 7, anchor: 'middle' }));
    }
    y += lane + gap;
  });
  g.push(`<g class="cd-riv-axis" transform="translate(${PAD},0)">`
    + axis(SPAN, y - gap + 4) + '</g>');
  const age = sample && sample.freshness_ms != null
    ? Number(sample.freshness_ms) / 1000 : null;
  const ticking = elapsed(age, sourceState, { cite, style: 'tenths' });
  const readout = sample
    ? `<div class="cd-riv-readout"><span${attrs(ticking)}>SAMPLED `
      + `<b data-elapsed-text>${_esc(durationWords(age, 'tenths') || 'UNMEASURED')}</b> AGO`
      + `</span></div>`
    : '';
  return card('strip', 'Phosphor strip chart',
    frame(W, H, g.join(''), {
      label: `${lanes.length} lanes on one axis. Only one holds a sample.` })
    + readout,
    sample ? { note: 'One sample is not a series.' }
           : { mark: still('no sample was retained') });
}
