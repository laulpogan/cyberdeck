/** The four places the library marks a drawing as moving without asking anything
 * whether it moved.
 *
 * Every other mark in the library is computed from an argument -- `trace(travelled)`,
 * `count(index, total)`, `traffic(period, state)` -- and a missing argument returns
 * `still(reason)`. These four are written with the answer already in: `trace(true, …)`
 * and `count(0, 1)`. They are not bugs in the sense of drawing the wrong shape; they
 * are the three lines a reader would call a claim -- an axis, a threshold, a sightline
 * -- animating as though something had travelled them, and a marker staggering itself
 * over a population that was never counted because it is one marker.
 *
 * The showcase's whole promise is that pulling the evidence out of a page stops the
 * motion on it, so these had to be named rather than averaged away: with the rack's
 * evidence switch off, `app/verify/index.mjs` fails on any live mark in any specimen
 * not listed here, and fails on a listed specimen carrying a mark this file does not
 * name. `test/app-undeclared.test.mjs` reads the source and asserts the carrier class
 * and the literal mark are really there, so the list cannot grow by drift and cannot
 * shrink by wish.
 *
 * Fixing them upstream means making each one answer to an argument -- a sightline that
 * was observed, an axis a series was plotted against. Until then the app says which
 * four, and where.
 */
export const UNCONDITIONAL_MARKS = {
  radar: [
    { kind: 'count', carrier: 'cd-fd-offscope', file: 'src/components/field.js',
      written: 'count(0, 1)',
      what: 'the off-scope marker staggers itself over a population of one' },
  ],
  oscillation: [
    { kind: 'trace', carrier: 'cd-riv-threshold', file: 'src/components/river.js',
      written: 'trace(true',
      what: 'the threshold line draws itself along its length as though something crossed it' },
  ],
  syncRatio: [
    { kind: 'trace', carrier: 'cd-th-axis', file: 'src/components/thread.js',
      written: 'trace(true',
      what: 'an empty time axis traces itself; the axis is a frame, not a route' },
  ],
  glassCell: [
    { kind: 'trace', carrier: 'cd-dc-sightline', file: 'src/components/decision.js',
      written: 'trace(true',
      what: 'the sightline from blocked seat to verdict draws itself with nothing measured about it' },
  ],
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
