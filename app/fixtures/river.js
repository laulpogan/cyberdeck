// THE RIVER -- seven models about time, and the retention a fleet actually
// keeps: one live attempt, one snapshot, one freshness number.
//
// The dark variant of this family is not a hypothetical. It is what most
// producers send: the attempt counter exists, the series behind it does not.

import { NOW_MS, beforeMs, beforeS } from './time.js';

/** One attempt's worth of events, on a millisecond axis, because the lane chart
 * places them with `Date.getTime()`. */
const ATTEMPT = [
  { kind: 'gate_passed', at: beforeMs(240) },
  { kind: 'retry_authorized', at: beforeMs(178) },
  { kind: 'canonical_blocked', at: beforeMs(100) },
  { kind: 'operator_retry', at: beforeMs(39) },
];

const ARTIFACT_FLOOR = {
  label: 'ARTIFACT CONTENTS',
  value: null,
  floor: true,
  cite: 'no reader; artifacts are paths only',
};

export const RIVER_FIXTURES = {
  river: {
    // Three lanes, one of which has nothing on it -- an empty row and an absent
    // row must not look alike, so the empty lane is drawn and says so. The trail
    // fades by each lane's real age, and with no clock supplied the fade is
    // refused rather than invented.
    fields: ['lanes[].events', 'now', 'staleAfter'],
    model: {
      cite: 'sessions[].evidence.timeline',
      now: NOW_MS,
      staleAfter: 900,
      lanes: [
        { id: 'ses-4419', attempt: 4, state: 'running', events: ATTEMPT },
        { id: 'ses-4420', attempt: 1, state: 'needs_human', events: ATTEMPT.slice(0, 2) },
        { id: 'ses-4421', attempt: 1, state: 'queued', events: [] },
      ],
    },
  },

  esperDive: {
    // A dive is as deep as the record goes. The floor is drawn as a frame, not
    // left off the end: a viewer that keeps offering another step teaches an
    // operator that the detail exists somewhere.
    fields: ['levels[].value', 'levels'],
    model: {
      levels: [
        { label: 'SUBJECT', value: 'ses-4419', cite: 'sessions[].id' },
        { label: 'WORK ITEM', value: 'W-2211', cite: 'sessions[].work.id' },
        { label: 'ARTIFACT PATH', value: 'run/4419/proof.json', cite: 'evidence.artifact.latest_path' },
        ARTIFACT_FLOOR,
      ],
    },
  },

  tapeSplice: {
    // The reels before the retained one were not kept, and the seam is drawn
    // where the retention starts. No attempt number and there is no strip to
    // splice at all: one hatched span reading UNMEASURED.
    fields: ['attempt'],
    model: { attempt: 4, events: 9, cite: 'sessions[].evidence.timeline' },
  },

  oscillation: {
    // Four attempts over the threshold makes a CANDIDATE, and amplitude and
    // period stay hatched because nobody instruments them. The beat underneath
    // needs a measured period, which is the field that decides whether the
    // detector that hunts also moves.
    fields: ['period', 'attempt'],
    model: {
      attempt: 5,
      reason: 'worker exited 1',
      sourceState: 'live',
      period: 2,
      cite: 'source.attempt_outcomes(work_id)',
    },
  },

  loopDeviation: {
    // Observed events draw; the reference track is hatched at the same width
    // because nobody wrote it down, and no delta is computed. Removing the
    // population is expressed as an empty list rather than a null, which is what
    // "the recorder retained nothing" actually looks like on the way in.
    fields: [{ path: 'observed', value: [] }],
    model: {
      observed: ATTEMPT.map((event) => ({ kind: event.kind })),
      cite: 'expected_trace(work_id)',
    },
  },

  collar: {
    // Elapsed and waiting, both measured, both still true, so both still
    // counting. No producer supplies the deadline, which is why the ring is open
    // and `REMAINING` is a hatched band rather than a number.
    fields: ['elapsedSeconds', 'waitingSeconds'],
    model: {
      elapsedSeconds: 9400,
      waitingSeconds: 640,
      sourceState: 'live',
      cite: 'evidence.operator.deadline_at',
    },
  },

  stripChart: {
    // The showcase's only over-time instrument, and until now it never drew a line
    // anywhere in this app: the bright model held one sample, so both columns on
    // screen showed hatching and the word `ONE SAMPLE`, and a reader never saw what a
    // strip chart is for (finding #9). The primitive -- `draw.js` `curve` -- already
    // existed with one caller; the component simply never accepted a series.
    //
    // The fabrication is stated plainly: this app has no producer behind
    // `source.snapshot_series(session_id)`, so the twelve points are computed from a
    // deterministic sine of the index at four-minute intervals back from the frozen
    // instant -- no `Math.random`, no `Date.now`, so two captures are the same bytes.
    // Below two points the component still draws no line and says `ONE SAMPLE`, which
    // is what this library believes about single samples and has not changed its mind.
    fields: ['sample', 'samples'],
    model: {
      sample: { freshness_ms: 2400 },
      seriesLane: 'OUTPUT',
      sourceState: 'live',
      cite: 'source.snapshot_series(session_id)',
      samples: Array.from({ length: 12 }, (_, i) => ({
        at: beforeS((11 - i) * 240),
        value: Number((0.5 + 0.34 * Math.sin(i * 0.7)).toFixed(3)),
      })),
    },
  },
};
