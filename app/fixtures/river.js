// THE RIVER -- seven models about time, and the retention a fleet actually
// keeps: one live attempt, one snapshot, one freshness number.
//
// The dark variant of this family is not a hypothetical. It is what most
// producers send: the attempt counter exists, the series behind it does not.

import { NOW_MS, beforeMs } from './time.js';

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
    // Four lanes on one axis and one sample on one of them, drawn as one mark at
    // its own instant. The age of that sample is what the counter runs on, and it
    // is in tenths, so it is visibly alive in a way an hours-long wait is not.
    fields: ['sample'],
    model: {
      sample: { freshness_ms: 2400 },
      sourceState: 'live',
      cite: 'source.snapshot_series(session_id)',
    },
  },
};
