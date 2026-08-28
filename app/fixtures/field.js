// THE FIELD -- eight ways of looking at a fleet at once.
// Every model here is the measured world; the dark variant is derived by
// nulling the fields named in the registry's controls, never written twice.

import { T0 } from './shared.js';

export const field = {
  scan: {
    subject: {
      name: 'ses-4419',
      identity: 'ses-4419',
      state: 'blocked',
      authority: 'act-reversible',
      blocked: 'canonical_blocked',
      changed_at: T0 - 9000,
      now: T0,
      settled: false,
    },
  },

  'tri-vision': {
    lens: 'health',
    cells: [
      { health: 'ok', cost: 11, authority: 'act' },
      { health: 'warn', cost: 26, authority: 'act', hot: true },
      { health: 'ok', cost: 7, authority: 'observe' },
      { health: 'ok', cost: 14, authority: 'act' },
      { health: 'down', cost: 31, authority: 'act', hot: true },
      { health: 'ok', cost: 9, authority: 'act' },
      { health: 'ok', cost: 12, authority: 'observe' },
      { health: 'ok', cost: 18, authority: 'act' },
      { health: 'ok', cost: 5, authority: 'act', measured: false },
      { health: 'warn', cost: 22, authority: 'act' },
      { health: 'ok', cost: 16, authority: 'observe' },
      { health: 'ok', cost: 8, authority: 'act' },
    ],
  },

  crush: { count: 216, bleeding: [17, 42, 43, 98, 151, 182] },

  coverage: {
    contours: [
      [[0.04, 0.18], [0.3, 0.42], [0.52, 0.3], [0.78, 0.55], [0.98, 0.44]],
      [[0.04, 0.48], [0.26, 0.66], [0.5, 0.52], [0.74, 0.78], [0.98, 0.66]],
      [[0.04, 0.8], [0.32, 0.92], [0.56, 0.74], [0.8, 0.94], [0.98, 0.84]],
    ],
    dark: true,
    endpoints: [
      { id: 'P-01', x: 62, y: 64 },
      { id: 'P-02', x: 138, y: 148 },
    ],
  },

  chips: {
    ceiling: 24,
    chips: [
      { name: 'RADAR', cost: 4, on: true },
      { name: 'NEEDLES', cost: 3, on: true },
      { name: 'TAPE', cost: 6, on: true },
      { name: 'GLOBE', cost: 5, on: false },
      { name: 'CLOCK', cost: 3, on: true },
    ],
  },

  radar: {
    contacts: [
      { age_seconds: 4, window: 60, bearing: -0.62, band: 'fresh' },
      { age_seconds: 26, window: 60, bearing: 1.94, band: 'fresh' },
      { age_seconds: 84, window: 120, bearing: 2.9, band: 'stale' },
      { age_seconds: 17, window: 60, bearing: -2.2, band: 'fresh' },
      { age_seconds: 112, window: 120, bearing: 0.72, band: 'stale' },
    ],
    pollElapsed: 2,
    pollPeriod: 6,
    sourceState: 'live',
  },

  needles: {
    workers: Array.from({ length: 14 }, (_, i) => ({
      bearing: (i * 0.45 + 0.3) % (Math.PI * 2),
      hot: i === 3 || i === 9,
    })),
  },

  'standard-sheet': {
    glyphs: [
      { key: 'working', label: 'WORKING' },
      { key: 'blocked', label: 'BLOCKED' },
      { key: 'needs_you', label: 'NEEDS YOU' },
      { key: 'unmeasured', label: 'UNMEASURED' },
      { key: 'landed', label: 'LANDED' },
      { key: 'draining', label: 'DRAINING' },
    ],
  },
};
