// THE TELEGRAPH -- one queue of human decisions, across every harness.
//
// The question an owner-operator actually has at 7am is: what is waiting
// on me, and what happens if I keep sleeping. Per-session pings cannot
// answer it and a queue with no human channel cannot either. The form is
// a tape: one strip per decision, read in the order it will hurt, and a
// strip opens in place -- a shutter, not a modal -- onto the four things
// a decision needs. Blocker, consequence of waiting, receipt, and the
// commands priced in authority.
//
// Two rules the family exists to enforce.
//
// CADENCE, NOT A BELL. Alien: Isolation's motion tracker never tells you
// where the thing is; it tells you it is closer than it was. The tick
// interval IS the instrument. Map it onto a measured wait and it means
// something; run it over a wait nobody took and it is the purest fake
// motion a console can produce, so an unmeasured wait gets no cadence.
//
// ALGEDONIC BYPASS. Beer reserved one channel that cannot be snoozed:
// pain straight to the top. Drawn as a path AROUND the notification
// stack rather than a red badge on it, because going around is a
// different shape and a badge is just a louder queue entry.

import { frame, rect, line, dot, ring, arc, text, hatched } from '../draw.js';
import { trace, count, traffic, elapsed, intent, still, refusal, durationWords, attrs }
  from '../marks.js';
import { card, esc, wrapped, W, H } from './card.js';

const PAD = 12;
const SPAN = W - PAD * 2;

/** Wait band -> tick seconds. The tracker tightens; it never loosens on
 * its own, and it never runs at all without a measured wait. */
export const CADENCE = [[0, 8], [60, 5], [900, 3], [3600, 2], [14400, 1]];

/** Tick interval in seconds, or null when there is nothing real to tick.
 *
 * Null is the important return. A queue whose waits are all unmeasured
 * gets a still page and a word saying why -- never a reassuring pulse
 * over numbers nobody has. */
export function cadence(oldestWaitSeconds) {
  if (oldestWaitSeconds === null || oldestWaitSeconds === undefined) return null;
  let interval = CADENCE[0][1];
  for (const [threshold, tick] of CADENCE) {
    if (oldestWaitSeconds >= threshold) interval = tick;
  }
  return interval;
}

/** True when this decision may not be snoozed, deferred, or batched. */
export const algedonic = (item) =>
  item.request_class === 'INCIDENT' || item.severity === 'RED';

/** Motion-tracker cadence -- one instrument, one sound.
 *
 * The sweep is the measured wait: the oldest decision sits at a radius
 * read off its own clock, and closer means older. What is refused is a
 * per-decision ping, which would need a measured urgency nobody supplies.
 * A rhythm invented from a rank is a rhythm an operator learns and is
 * then misled by. */
export function tracker({ oldestWaitSeconds = null, sourceState,
                          cite = 'summary.oldest_wait_seconds' }) {
  const oldest = oldestWaitSeconds;
  const tick = cadence(oldest);
  // The reading sits above the sweep, not on it. Drawn over the bands it
  // was unreadable in both states -- and the state that most needs to be
  // read is the one where three refusals stack in the same place.
  const cx = W / 2, cy = 176;
  const bands = [38, 62, 86];
  const g = [];
  bands.forEach((radius, i) => {
    // The bands are the instrument, not a reading, so they travel on the
    // fact that a wait was measured at all. With no wait there is nothing
    // to range against and the dial does not draw itself.
    g.push(`<g class="cd-tg-band"${attrs(trace(oldest !== null, { cite, order: i, total: bands.length }))}>`
      + arc(cx, cy, radius, Math.PI * 1.15, Math.PI * 1.85) + '</g>');
  });
  if (oldest === null) {
    // The refusal and the band that carries it wear the same colour, so a
    // reader does not have to work out which of the two is the reading.
    g.push('<g class="cd-tg-nocontact">'
      + arc(cx, cy, 100, Math.PI * 1.15, Math.PI * 1.85, { dashed: true })
      + text(PAD, 34, 'NO CONTACT', { size: 12 })
      + text(PAD, 48, 'EVERY WAIT IS UNMEASURED', { size: 7, opacity: '.75' })
      + '</g>');
  } else {
    // Radius is the wait against the widest band the dial shows. A longer
    // wait is nearer the operator, which is the direction it reads in.
    const band = CADENCE[CADENCE.length - 1][0] * 3;
    const near = Math.max(.12, 1 - Math.min(Number(oldest) / band, 1));
    const radius = 38 + near * 48;
    const angle = Math.PI * 1.45;
    const px = cx + radius * Math.cos(angle), py = cy + radius * Math.sin(angle);
    g.push(`<g class="cd-tg-contact"${attrs(traffic(tick, sourceState, { cite }))}>`
      + dot(px, py, 5) + ring(px, py, 11) + '</g>');
    g.push(text(PAD, 36, durationWords(oldest, 'upper'), { size: 18 }));
    g.push(text(PAD, 48, 'OLDEST WAIT', { size: 7, opacity: '.75' }));
  }
  g.push(tick ? text(PAD, 64, `TICK ${tick}S`, { size: 8 })
              : `<g class="cd-tg-nocontact">${text(PAD, 64, 'NO CADENCE', { size: 8 })}</g>`);
  // The one thing this instrument will not do. Named on the drawing so a
  // reader cannot mistake its absence for an oversight.
  g.push(text(PAD, H - 6, 'PER-DECISION PING UNMEASURED',
    { size: 7, opacity: '.55' }));
  return card('tracker', 'Motion-tracker cadence',
    frame(W, H, g.join(''), {
      label: 'The oldest measured wait drawn as a contact on a sweep. The '
           + 'tick interval is the cadence computed from that same wait.' }),
    { note: 'The interval is the instrument, not a bell.' });
}

/** What the algedonic path cuts past. Every one is a real filter a
 * notification layer would apply, named so the bypass is arguable rather
 * than a claim that some alerts are simply special. */
export const FILTERS = [
  ['snooze', 'SNOOZE', 'The operator asked not to be told for a while.'],
  ['routing', 'ROLE ROUTING', 'This decision is not addressed to you.'],
  ['quiet', 'QUIET HOURS', 'Outside the hours you agreed to be reached.'],
  ['batch', 'BATCHING', 'Held to be delivered with the next group.'],
];

/** Algedonic bypass -- the signal that goes around the stack.
 *
 * The hierarchy here is the notification stack, and the whole point of
 * the drawing is that the critical line does not pass through any of its
 * boxes. It goes around them. That is a different shape, and it is not a
 * red badge.
 *
 * The count is measured or it is nothing. An unreachable board draws the
 * path and refuses the number: "0 algedonic" over a producer that never
 * answered is the most dangerous zero a console can print. */
export function bypass({ openCount = null, cite = 'items[].request_class' }) {
  const g = [];
  FILTERS.forEach(([key, label], i) => {
    const y = 22 + i * 27;
    g.push(`<g class="cd-tg-filter" data-filter="${key}">`
      + rect(96, y, 150, 18) + text(171, y + 12.5, label, { size: 8, anchor: 'middle' })
      + '</g>');
    g.push(line(80, y + 9, 96, y + 9, { dashed: true }));
    g.push(line(246, y + 9, 276, y + 9, { dashed: true }));
  });
  g.push(text(48, 30, 'QUEUE', { size: 7.5, anchor: 'middle' }));
  g.push(text(280, 30, 'OPERATOR', { size: 7.5 }));
  g.push(`<g class="cd-tg-bypass"${attrs(trace(openCount !== null, { cite }))}>`
    // The curve is held clear of every connector on the way past. Cutting
    // one of them would make the drawing say the opposite of its label.
    + '<path d="M 34 40 C 24 150 170 168 296 150" fill="none" '
    + 'stroke="currentColor" stroke-width="2.5"/>'
    + dot(296, 150, 4)
    // Under the curve, not across it. A label struck through by the line
    // it names is the drawing arguing with itself.
    + text(168, 174, 'ALGEDONIC · PASSES NONE OF THESE',
        { size: 8, anchor: 'middle' })
    + '</g>');
  g.push(text(PAD, 190,
    openCount === null ? 'ALGEDONIC UNCOUNTED' : `${openCount} ALGEDONIC OPEN`,
    { size: 9, weight: '600' }));
  return card('bypass', 'Algedonic bypass',
    frame(W, H, g.join(''), {
      label: 'The critical path drawn around every filter in the '
           + 'notification stack, not through them.' }),
    openCount === null
      ? { note: 'A zero over a producer that never answered is the most '
              + 'dangerous number on the page.' }
      : { note: 'That is what the class means, and why the class is narrow.' });
}

/** Acceptance ceremony -- two keys and a window that really runs.
 *
 * The stages are drawn as gates on one run, with the abort window as the
 * only span on it that has a length. An unreached run is drawn whole and
 * entered nowhere: an armed-looking first gate over a seam that does not
 * exist is the cruellest thing this component could do. */
/** Which gate the abort-window bracket is drawn over. The same constant answers
 * "is the window armed", so the geometry cannot disagree with the claim. */
const WINDOW_GATE = 2;

export function ceremony({ stages, windowSeconds,
                           cite = 'ceremony.stages[].reached' }) {
  if (!stages || !stages.length) {
    return card('ceremony', 'Acceptance ceremony', '',
      { refusalWord: 'NO CEREMONY DEFINED',
    mark: still('no ceremony is defined for this verb') });
  }
  const top = 56;
  const step = (SPAN - 28) / Math.max(stages.length - 1, 1);
  const g = [line(PAD + 14, top, PAD + SPAN - 14, top, { width: 1.5, dashed: true })];
  stages.forEach((stage, i) => {
    const x = PAD + 14 + i * step;
    g.push(`<g class="cd-tg-gate" data-reached="${stage.reached ? 1 : 0}"`
      + `${attrs(trace(stage.reached, { cite, order: i, total: stages.length }))}>`
      + line(x, top - 11, x, top + 11, { width: 2 })
      + dot(x, top, 3.4, { hollow: !stage.reached }) + '</g>');
    g.push(text(x, top - 17, stage.label, { size: 6.5, anchor: 'middle' }));
    g.push(text(x, top + 23, String(i + 1),
      { size: 7, anchor: 'middle', opacity: '.7' }));
  });
  // The window is stated before anything is armed. A window an operator
  // learns the length of only after committing is not a window.
  //
  // The bracket is a *dimension*, not a countdown: it says how long the span is, and
  // nothing more. Saying `ABORT WINDOW 10s` over a gate nobody reached announced ten
  // seconds an operator does not have, and a length with no state on it is the same
  // error the collar already refuses (`river.js`: elapsed, because remaining is
  // unknowable). So the bracket carries the state it can prove. If a producer ever
  // supplies an elapsed stamp for an armed window, this is where `cycle(elapsed,
  // windowSeconds, sourceState, ...)` belongs and the bracket will decay and refuse on
  // overrun like every other countdown here -- no such stamp exists in any fixture,
  // which is why it is not drawn pretending to.
  const from = PAD + 14 + step * WINDOW_GATE;
  const openGate = stages[WINDOW_GATE] || null;
  const armed = Boolean(openGate && openGate.reached);
  const unstated = windowSeconds === null || windowSeconds === undefined;
  const windowMark = unstated
    ? refusal('the ceremony defines no abort window length')
    : armed
      ? still('the window is armed, and no elapsed stamp is supplied to count it down')
      : still(`the window is not armed: ${openGate ? openGate.label : `gate ${WINDOW_GATE + 1}`}`
        + ' was not reached');
  const windowWord = unstated
    ? 'WINDOW LENGTH UNREPORTED'
    : `ABORT WINDOW ${windowSeconds}s${armed ? ' · ARMED' : ' · NOT ARMED'}`;
  g.push(`<g class="cd-tg-window"${attrs(windowMark)}>`
    + line(from, top + 34, from + step, top + 34, { width: 2 })
    + line(from, top + 30, from, top + 38, { width: 2 })
    + line(from + step, top + 30, from + step, top + 38, { width: 2 })
    + text(from + step / 2, top + 48, windowWord,
        { size: 8, anchor: 'middle' }) + '</g>');
  stages.forEach((stage, i) => {
    g.push(text(PAD, 132 + i * 17,
      `${i + 1}  ${stage.label}`, { size: 7.5,
        opacity: stage.reached ? null : '.55' }));
    g.push(text(W - PAD, 132 + i * 17, stage.why,
      { size: 6.5, anchor: 'end', opacity: '.45' }));
  });
  const reached = stages.filter((s) => s.reached).length;
  return card('ceremony', 'Acceptance ceremony',
    frame(W, H, g.join(''), {
      label: `${stages.length} gates on one run, and the abort window is the `
           + 'only span on the run with a length.' }),
    reached ? { note: `${reached} of ${stages.length} gates entered.` }
            : { note: 'No stage is reached, so none is drawn armed.' });
}

/** Two-state commit -- two outcomes, no default, and the third fact.
 *
 * Doing nothing is not one of the two outcomes; it is the consequence of
 * not choosing, and it gets its own line. A dialog whose cancel quietly
 * means one of the outcomes has three states pretending to be two. */
export function twoState({ states, doNothing = null }) {
  if (!states || states.length !== 2) {
    return card('two-state', 'Two-state commit', '',
      { mark: refusal('a two-state commit needs exactly two outcomes') });
  }
  const g = [];
  states.forEach((state, i) => {
    const x = PAD + i * (SPAN / 2 + 4);
    const w = SPAN / 2 - 4;
    g.push(`<g class="cd-tg-choice" data-selected="${state.selected ? 1 : 0}">`
      + rect(x, 18, w, 62, { dashed: !state.selected,
          width: state.selected ? 2 : 1 })
      + text(x + 9, 40, state.label, { size: 10 })
      + wrapped(x + 9, 54, state.why, 26, { size: 6.5, opacity: '.6' }) + '</g>');
  });
  // Nothing is preselected. The gap between the two boxes is not a
  // default, and neither box is drawn warmer than the other.
  g.push(text(PAD, 104, 'NOTHING IS PRESELECTED', { size: 8, weight: '600' }));
  g.push(text(PAD, 128, 'IF YOU CHOOSE NEITHER', { size: 7, opacity: '.75' }));
  if (doNothing) {
    g.push(rect(PAD, 134, SPAN, 34));
    g.push(text(PAD + 8, 155, doNothing, { size: 8 }));
  } else {
    g.push(hatched(PAD, 134, SPAN, 34));
    g.push(text(W / 2, 155, 'UNMEASURED', { size: 9, anchor: 'middle' }));
    g.push(text(PAD, 182, 'no producer states the cost of inaction',
      { size: 6.5, opacity: '.55' }));
  }
  return card('two-state', 'Two-state commit',
    frame(W, H, g.join(''), {
      label: 'Two outcomes drawn the same weight, and the cost of choosing '
           + 'neither on its own line.' }),
    doNothing ? { note: 'Doing nothing is a third fact, not a third button.' }
              : { note: 'The cost of inaction is the line nobody writes down.' });
}

/** The tape -- one strip per decision, in the order it will hurt.
 *
 * The rank stagger is the ranking being played back, so the eye lands on
 * 01 first because it IS first, not because it is at the top of the DOM.
 * The shutter is `intent`: the operator caused it, so it proves nothing
 * about the fleet and is marked as the interface responding rather than
 * as a claim. */
export function tape({ items, sourceState, cite = 'items[].wait.seconds' }) {
  if (!items || !items.length) {
    // One blank slot on the tape, in the tape's own furniture: rank, title, wait. The
    // rank is a dash rather than a 1 because nothing is ranked, and the wait carries no
    // clock -- an elapsed counter with nothing elapsed is the ambient loop the rule
    // forbids, so the word UNMEASURED sits in its slot instead.
    return card('tape', 'The decision tape',
      `<div class="cd-tg-tape" data-drawing="tape">
        <article class="cd-tg-item">
          <span class="cd-tg-rank">—</span>
          <span class="cd-tg-title">NOTHING IS WAITING ON A PERSON</span>
          <span class="cd-tg-wait"><b>UNMEASURED</b></span>
          <div class="cd-tg-body">
            <p class="cd-tg-blocker">BLOCKER UNMEASURED</p>
            <p class="cd-tg-wait-cost">IF YOU WAIT · UNMEASURED — no producer states the cost</p>
          </div>
        </article>
      </div>`,
      { mark: refusal('no decision is waiting on a person') });
  }
  const strips = items.map((item, i) => {
    const hot = algedonic(item);
    const wait = item.wait_seconds ?? null;
    const clock = elapsed(wait, sourceState, { cite, style: 'upper' });
    const open = i === 0;
    return `<article class="cd-tg-strip" data-severity="${esc(String(item.severity || '').toLowerCase())}" `
      + `data-algedonic="${hot ? 1 : 0}"${attrs(count(i, items.length))}>
      <button type="button" class="cd-tg-head" aria-expanded="${open}"${attrs(intent('press'))}>
        <span class="cd-tg-rank">${String(i + 1).padStart(2, '0')}</span>
        <span class="cd-tg-class">${esc(item.request_class)}</span>
        <span class="cd-tg-title">${esc(item.title)}</span>
        <span class="cd-tg-wait"${attrs(clock)}><b data-elapsed-text>${
          esc(durationWords(wait, 'upper') || 'UNMEASURED')}</b></span>
        ${hot ? '<span class="cd-tg-hot">NO SNOOZE</span>' : ''}
        <span class="cd-tg-shutter" aria-hidden="true"></span>
      </button>
      <div class="cd-tg-body"${open ? '' : ' hidden'}>
        <p class="cd-tg-blocker">${esc(item.blocker || 'BLOCKER UNMEASURED')}</p>
        <p class="cd-tg-wait-cost">IF YOU WAIT · ${
          esc(item.if_you_wait || 'UNMEASURED — no producer states the cost')}</p>
      </div>
    </article>`;
  });
  return card('tape', 'The decision tape',
    `<div class="cd-tg-tape" data-drawing="tape">${strips.join('')}</div>`,
    { note: 'Ranked by the order it will hurt, not by arrival.' });
}

/** The queue's own state -- and the difference between two empties.
 *
 * A board that was measured and holds nothing, and a board nobody could
 * reach, render identical markup unless one of them says so. Only the
 * first is an all-clear. The second draws the producer, the last contact,
 * and the next step, and claims nothing. */
export function queueState({ sourceState, openCount = null,
                             producer = null, age = null }) {
  const counted = ['live', 'measured_empty', 'stale'].includes(sourceState);
  const g = [];
  g.push(rect(PAD, 24, SPAN, 60, { dashed: !counted, width: counted ? 1 : 1.5 }));
  g.push(text(W / 2, 52,
    counted ? 'NO REQUEST NEEDS AN OPERATOR' : 'REQUEST QUEUE UNMEASURED',
    { size: 10, anchor: 'middle' }));
  g.push(text(W / 2, 68,
    counted ? 'the board was measured and nothing is waiting'
            : `SOURCE ${String(sourceState).toUpperCase()} · NO ALL-CLEAR IS CLAIMED`,
    { size: 7, anchor: 'middle', opacity: '.7' }));
  if (counted) {
    g.push(text(PAD, 112, 'OPEN', { size: 7, opacity: '.7' }));
    g.push(text(PAD, 128, String(openCount ?? 0), { size: 16 }));
  } else {
    // Not one numeral. The producer was unreachable, so there is nothing
    // to count and no zero to print.
    g.push(text(PAD, 112, 'OPEN', { size: 7, opacity: '.7' }));
    g.push(hatched(PAD, 118, 74, 18));
    g.push(text(PAD + 37, 131, 'UNCOUNTED', { size: 7, anchor: 'middle' }));
    g.push(text(PAD, 156, 'PRODUCER', { size: 7, opacity: '.7' }));
    g.push(text(PAD, 168, producer || 'UNNAMED', { size: 8 }));
    g.push(text(PAD, 184, `LAST CONTACT ${age || 'UNMEASURED'}`,
      { size: 7, opacity: '.7' }));
  }
  return card('queue', 'The queue, and its two empties',
    frame(W, H, g.join(''), {
      label: counted ? 'A measured board holding nothing.'
                     : 'A board nobody could reach, claiming nothing.' }),
    counted
      ? { note: 'Measured empty is an all-clear. It is allowed to say so.' }
      : { mark: refusal('the board was never reached, so no all-clear is claimed') });
}
