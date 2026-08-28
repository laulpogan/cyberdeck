// The clock the fixtures are cut against.
//
// Fixed, in the file, because a screenshot review compares captures byte for
// byte and a fixture that reads the current time makes every capture different
// from the one before it for reasons nobody can review. The library's own grain
// generator is a seeded LCG for the same reason (`draw.js` `staticField`).
//
// Two units, because the components disagree and a fixture has to obey the one
// it is fed to: `arrive` compares two stamps and the field family windows that
// age in seconds, while the lane chart places events on a millisecond axis.
// Both are derived from one instant, so a fixture can be honest about "the same
// moment" across both.

export const NOW_ISO = '2026-08-28T09:14:00Z';
export const NOW_MS = Date.parse(NOW_ISO);
export const NOW_S = NOW_MS / 1000;

/** `seconds` before the frozen instant, in whatever unit the caller is in. */
export const beforeMs = (seconds) => NOW_MS - seconds * 1000;
export const beforeS = (seconds) => NOW_S - seconds;
