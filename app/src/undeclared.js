/** Motion that happens whether or not anything was measured — the licence list.
 *
 * The showcase's promise is that pulling the evidence out of a page stops the motion on it.
 * That promise is only falsifiable if the exceptions are enumerable, so this file used to
 * carry four: `trace(true)` on a threshold line, on a time axis, on a sightline, and
 * `count(0, 1)` on a marker staggering itself over a population of one. They were not wrong
 * shapes. They were claims — a rule, a frame, a geometry, a tally — animating as though
 * something had travelled them, and the honesty counter could not see them because it asks
 * the runtime what it is animating and the runtime answered honestly about animations that
 * were never measurements. `app/verify/FILMSTRIP.md` §2 has the frames: four specimens whose
 * picture still changed with the rack's evidence switch off.
 *
 * **All four are fixed on this branch, and the list is empty.** Each was asked what it would
 * take for the motion to be a measurement, and three of them are geometry that has no
 * business moving:
 *
 * | component | carrier | was | now |
 * | --- | --- | --- | --- |
 * | `radar` | `cd-fd-offscope` | `count(0, 1)` | `still('nothing is off-scope; a tally of nothing is not a count')` |
 * | `oscillation` | `cd-riv-threshold` | `trace(true)` | `still('the threshold is a rule, not a route')` |
 * | `syncRatio` | `cd-th-axis` | `trace(true)` | `still('the axis is a frame; nothing travelled it')` |
 * | `glassCell` | `cd-dc-sightline` | `trace(true)` | `still('the sightline is the asymmetry, not an observation')` |
 *
 * Each became a *declared* refusal rather than an unmarked element, so the refusal is
 * readable in the DOM and counted as `DECLARED STILL` instead of being invisible. The marks
 * that stayed are the ones with something behind them: the attempt ticks in `oscillation`
 * carry `order`/`total` from a series that happened, and the rows in `glassCell` that crossed
 * the glass trace because a field actually came across.
 *
 * Re-granting a licence means naming a component, a carrier class, the file, the literal mark
 * and what it animates over — and `test/app-undeclared.test.mjs` renders the component both
 * with and without its evidence, so a licence cannot be granted for a mark that does not
 * exist, and a fix cannot quietly regress back into motion.
 */
export const UNCONDITIONAL_MARKS = {};

/** What each of the four carries now. The test renders the component and reads the element,
 * so this is a regression guard rather than a story about the past. */
export const FIXED_UNCONDITIONAL_MARKS = {
  radar: {
    carrier: 'cd-fd-offscope', file: 'src/components/field.js',
    was: 'count(0, 1)',
    reason: 'nothing is off-scope; a tally of nothing is not a count',
    why: 'a marker staggered itself over a population of one',
  },
  oscillation: {
    carrier: 'cd-riv-threshold', file: 'src/components/river.js',
    was: 'trace(true)',
    reason: 'the threshold is a rule, not a route',
    why: 'a threshold somebody set drew itself along its length as though crossed',
  },
  syncRatio: {
    carrier: 'cd-th-axis', file: 'src/components/thread.js',
    was: 'trace(true)',
    reason: 'the axis is a frame; nothing travelled it',
    why: 'an empty time axis traced itself; the axis is a frame, not a route',
  },
  glassCell: {
    carrier: 'cd-dc-sightline', file: 'src/components/decision.js',
    was: 'trace(true)',
    reason: 'the sightline is the asymmetry, not an observation',
    why: 'the geometry that states the one-way claim moved as though it were a sighting',
  },
};

/** Just the keys, for a gate that wants to know how many specimens are exempt. */
export const UNCONDITIONAL_KEYS = Object.keys(UNCONDITIONAL_MARKS);

/** What the gate expects to find inside one specimen, as `{kind, carrier}` pairs. */
export function expectedFor(key) {
  return (UNCONDITIONAL_MARKS[key] || []).map((entry) => ({
    kind: entry.kind,
    carrier: entry.carrier,
  }));
}
