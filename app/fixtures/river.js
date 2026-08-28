// THE RIVER -- time, and how little of it a fleet keeps.
// Most of what these draw is the shape of a hole; the fixtures show which
// recorder each component wanted by supplying exactly that one number.

import { T0, at } from './shared.js';

const EV = [
  { kind: 'gate_passed', at: at(0) },
  { kind: 'retry_authorized', at: at(1) },
  { kind: 'canonical_blocked', at: at(2) },
  { kind: 'operator_retry', at: at(3) },
];

export const river = {
  lanes: {
    cite: 'sessions[].evidence.timeline',
    staleAfter: 900,
    now: T0 + 240000,
    lanes: [
      { id: 'ses-4419', attempt: 4, state: 'running', events: EV },
      { id: 'ses-4420', attempt: 1, state: 'needs_human', events: EV.slice(0, 2) },
      { id: 'ses-4421', attempt: 1, state: 'queued', events: [] },
    ],
  },

  esper: {
    levels: [
      { label: 'SUBJECT', value: 'ses-4419', cite: 'sessions[].id' },
      { label: 'WORK ITEM', value: 'W-2211', cite: 'sessions[].work.id' },
      { label: 'ARTIFACT PATH', value: 'run/4419/proof.json',
        cite: 'evidence.artifact.latest_path' },
      { label: 'ARTIFACT CONTENTS', value: null, floor: true,
        cite: 'no reader; artifacts are paths only' },
    ],
  },

  splice: { attempt: 4, events: 9 },

  oscillation: {
    attempt: 5,
    reason: 'worker exited 1',
    sourceState: 'live',
  },

  deviation: {
    observed: [
      { kind: 'created', at: at(0) },
      { kind: 'gate_passed', at: at(2) },
      { kind: 'canonical_blocked', at: at(4) },
      { kind: 'operator_retry', at: at(7) },
      { kind: 'accepted', at: at(9) },
    ],
  },

  collar: {
    elapsedSeconds: 9400,
    waitingSeconds: 640,
    sourceState: 'live',
  },

  strip: {
    sample: { freshness_ms: 2400 },
    sourceState: 'live',
  },
};
