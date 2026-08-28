// Standalone instruments: the trinity dial and the globe. Neither is a
// card in a family; both carry the same contract -- a mark or a refusal.

export const standalone = {
  gauge: {
    value: 15, ceiling: 18, measured: true,
    cite: 'proof.sealed', label: 'PROOF SEALED', tone: 'live',
  },

  globe: {
    cite: 'sessions[].host',
    periodSeconds: 40,
    sourceState: 'live',
    endpoints: [
      { id: 'box-1', lat: 35.6, lon: 139.7, workers: 12, awaiting: true },
      { id: 'box-2', lat: 51.5, lon: -0.1, workers: 4, awaiting: false },
      { id: 'dot-air', lat: 40.7, lon: -74, workers: 0, awaiting: false },
      { id: 'spark-472e', lat: -33.8, lon: 151.2, workers: 7, awaiting: true },
    ],
  },
};
