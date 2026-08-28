// Shared clock for every fixture. One fixed instant, passed explicitly.
// Math.random() and Date.now() are forbidden in this directory: the
// library's own grain generator is a seeded LCG so two captures of one
// payload are the same bytes, and the app's review captures have to hold
// the same bargain.

export const T0 = Date.parse('2026-08-27T09:14:00Z');

/** ISO stamps at N minutes after the fixed instant. */
export const at = (n) => new Date(T0 + n * 60000).toISOString();
