// The marks. Every one of them answers the same question: is there
// evidence for this motion, and if not, what do we say instead?
//
// A mark is a plain object of data attributes. That is the whole
// interface. It carries no animation code, which is what lets a test
// assert honesty without a browser, and what lets the same contract be
// produced by a template, a server, or a React component without three
// implementations drifting apart.
//
// The rule the whole library exists to hold:
//
//     Motion is a measurement or it does not happen.
//
// So there is no default. A number nobody supplied does not animate to
// zero, or to a house tempo, or to a spinner. It is refused, and the
// refusal is written down where a reviewer can read it.

export const SCHEMA = 'cyberdeck.motion/1';

// A pulse is a claim about right now, so it needs a feed that is live --
// not merely readable. `stale` means reached and old.
export const LIVE_STATES = ['live', 'measured_empty', 'stale'];
export const PULSING_STATES = ['live'];
export const ELAPSING_STATES = ['live'];

export const DURATION_STYLES = ['upper', 'lower', 'tenths'];

const num = (value) => {
  const fixed = Number(value).toFixed(3);
  return fixed.replace(/0+$/, '').replace(/\.$/, '') || '0';
};

/** Declared stillness. The reason is the point.
 *
 * An element with no mark and an element whose mark was forgotten render
 * identical HTML, and only one of them is correct. So the correct one
 * says so, and a review can tell them apart. */
export const still = (reason) => ({
  'data-motion': 'still',
  'data-still-reason': String(reason),
});

/** Enter, once, because this changed at a time somebody recorded.
 *
 * "It probably just changed" would fire on every reload and teach an
 * operator that movement means nothing. */
export function arrive(changedAt, now, { window: win = null } = {}) {
  if (changedAt == null || now == null) return still('no change was timestamped');
  const age = Number(now) - Number(changedAt);
  if (age < 0) return still('change is stamped in the future');
  if (win != null && age > Number(win)) return still('older than the arrival window');
  return { 'data-motion': 'arrive', 'data-age': num(age) };
}

/** Settle from flash to rest across the real staleness window. The fade
 * IS the age -- an operator who learns its shape reads staleness off the
 * motion before reading the number. */
export function decay(ageSeconds, { window: win }) {
  if (ageSeconds == null || !win) return still('age was not measured');
  const fraction = Number(ageSeconds) / Number(win);
  // Refused here rather than left for the runtime to notice and skip: a
  // mark that says "animate me" and then quietly does nothing is exactly
  // as unreadable as no mark at all.
  if (fraction >= 1) return still('settled past the window');
  return { 'data-motion': 'decay', 'data-decay': num(Math.max(0, fraction)) };
}

/** Reveal in payload order so the eye can count along. A stagger over a
 * population nobody counted is a rhythm invented to look considered. */
export function count(index, total) {
  if (index == null || total == null || total <= 0) return still('population was not counted');
  if (index < 0 || index >= total) return still('index falls outside the count');
  return {
    'data-motion': 'count',
    'data-index': String(Math.trunc(index)),
    'data-total': String(Math.trunc(total)),
  };
}

/** A measured quantity drawing itself out to its measured extent.
 *
 * `measured` is passed, never inferred from `value != null`, because the
 * caller already knows the difference and an animation that re-derives it
 * is a second opinion waiting to disagree with the first. An unmeasured
 * quantity does not grow to zero: a bar at zero and a bar nobody filled
 * in must never look alike, and motion is the loudest way to confuse them. */
export function level(value, ceiling, { measured, cite, order = null, total = null }) {
  if (!measured || value == null || !ceiling) return still('quantity was not measured');
  const fraction = Math.max(0, Math.min(1, Number(value) / Number(ceiling)));
  const mark = { 'data-motion': 'level', 'data-level': num(fraction), 'data-cite': cite };
  // `order`/`total` are optional and only present when the caller places the bar in
  // the reveal sequence -- a figure computed from other figures passes the position
  // one slot past its last input, so the bar arrives after the evidence it summarises
  // rather than in the same frame as the panel. Omitted, behaviour is unchanged.
  if (order != null && total) {
    mark['data-index'] = String(Math.trunc(order));
    mark['data-total'] = String(Math.trunc(total));
  }
  return mark;
}

/** The shared duration formatter. The runtime renders these too, and two
 * implementations of one format is the drift this library refuses
 * everywhere else -- so the test compares them across a table of values. */
export function durationWords(seconds, style = 'upper') {
  if (seconds == null) return null;
  if (style === 'tenths') return `${Number(seconds).toFixed(1)}S`;
  const s = Math.trunc(seconds);
  if (style === 'lower') {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
  }
  if (s < 60) return `${s}S`;
  if (s < 3600) return `${Math.floor(s / 60)}M`;
  if (s < 86400) {
    return `${Math.floor(s / 3600)}H ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}M`;
  }
  return `${Math.floor(s / 86400)}D ${String(Math.floor((s % 86400) / 3600)).padStart(2, '0')}H`;
}

/** A measured duration that keeps counting, because it is still true.
 *
 * A wait of five hours measured three seconds ago is five hours and three
 * seconds now; freezing it at render is the less truthful option. Live
 * sources only -- on a stale feed the clock stops, because a counter that
 * still ticks claims somebody is still watching. */
export function elapsed(seconds, sourceState, { cite, style = 'upper', at = null }) {
  if (!ELAPSING_STATES.includes(sourceState)) {
    return still(`source is ${sourceState}; the clock stopped when the feed did`);
  }
  if (seconds == null) return still('no duration was measured');
  const shape = DURATION_STYLES.includes(style) ? style : 'upper';
  const mark = {
    'data-motion': 'elapsed',
    'data-elapsed-seconds': num(seconds),
    'data-style': shape,
    'data-cite': cite,
  };
  if (at != null) mark['data-at'] = num(at);
  return mark;
}

/** A path drawn along its own length, because something travelled it.
 *
 * The refusal is why this is a kind rather than a flourish. Watching a
 * line travel from origin to destination is the most convincing way a
 * screen can say a thing arrived -- so a route that delivered nothing
 * must not draw itself.
 *
 * `travelled` is passed, not guessed from the geometry. `order` and
 * `total` stagger a set so a corridor draws in the order it is walked. */
export function trace(travelled, { cite, order = null, total = null }) {
  if (!travelled) return still('nothing travelled this path');
  const mark = { 'data-motion': 'trace', 'data-cite': cite };
  if (order != null && total) {
    mark['data-index'] = String(Math.trunc(order));
    mark['data-total'] = String(Math.trunc(total));
  }
  return mark;
}

/** The one ambient loop, and the strictest gate here.
 *
 * The period is the producer's own interval, never a house tempo scaled
 * by a reading -- that distinction is the whole difference between an
 * indicator and an ornament. A measured zero is stillness, correctly,
 * because nothing is happening out there either. */
export function traffic(periodSeconds, sourceState, { cite }) {
  if (!PULSING_STATES.includes(sourceState)) return still(`source is ${sourceState}, not live`);
  if (periodSeconds == null) return still('no interval was measured');
  if (Number(periodSeconds) <= 0) return still('measured interval is zero');
  return { 'data-motion': 'traffic', 'data-period': num(periodSeconds), 'data-cite': cite };
}

/** The same loop spent better: a poll indicator running the real clock.
 *
 * An overrun refuses. A poll due forty seconds ago that has not landed is
 * the finding, and a bar that quietly wrapped and started again would
 * erase it. */
export function cycle(spentSeconds, period, sourceState, { cite }) {
  if (!PULSING_STATES.includes(sourceState)) return still(`source is ${sourceState}, not live`);
  if (spentSeconds == null || period == null || Number(period) <= 0) {
    return still('poll interval was not measured');
  }
  const spent = Number(spentSeconds) / Number(period);
  if (spent < 0 || spent > 1) return still('poll is overdue');
  return {
    'data-motion': 'cycle',
    'data-spent': num(spent),
    'data-period': num(period),
    'data-cite': cite,
  };
}

/** Operator-caused motion. The operator is the producer, so this one
 * proves nothing -- but it is still marked, so a review can tell
 * interface response apart from a claim about the world. */
export const intent = (kind = 'hover') => ({
  'data-motion': 'intent',
  'data-intent': String(kind),
});

/** Render a mark as an HTML attribute string, for templates and servers
 * that build markup as text rather than as elements. */
/** A stillness that is a statement about the data source.
 *
 * `still(reason)` covers two different facts, and the drawing has always had to
 * tell them apart by itself: a thing that is legitimately motionless — a rule
 * about who may look, a threshold, a wall — and a thing the library cannot draw
 * because nothing was held to draw it. The first is a reading; the second is the
 * absence of one. Same mark, same dashed stroke the unmeasured gap already uses,
 * so a review script could not tell them and neither could an operator: the ink
 * for "not reached" and the ink for "no data" were the same pixels in seven
 * components.
 *
 * This stamps the same stillness, plus the one bit of information the stylesheet
 * needs: `data-refusal="1"`, which buys a crosshatch, a solid border, and the
 * refusal ink. A measured static quantity keeps the gap-dash and the unknown hue.
 */
export function refusal(reason, { cite = null } = {}) {
  const mark = still(reason);
  if (cite) mark['data-cite'] = cite;
  mark['data-refusal'] = '1';
  return mark;
}

export function attrs(mark) {
  const escape = (v) => String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return Object.entries(mark).map(([k, v]) => ` ${k}="${escape(v)}"`).join('');
}
