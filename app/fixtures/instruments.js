// The two stand-alone drawings, big enough to be pages rather than cards. Both
// are the library's only ambient loops, and both gate theirs on a measured
// interval from the producer rather than a house tempo.

export const INSTRUMENT_FIXTURES = {
  gauge: {
    // The arc IS the ratio, and the markup carries the full measured extent: with
    // the runtime absent or settled the reader still sees the correct ratio
    // rather than an empty ring. `measured` is an argument, never inferred from
    // value != null, because the caller already knows the difference.
    fields: [{ path: 'measured', value: false }, 'value'],
    model: {
      value: 41,
      ceiling: 60,
      measured: true,
      cite: 'source.proof_sealed_count()',
      label: 'PROOF SEALED',
      tone: 'warn',
      size: 170,
    },
  },

  globe: {
    // The one component that stays canvas, and the reason it argues for itself:
    // the mesh means "this is a globe", only the endpoints mean anything. The turn
    // is the one ambient loop, so it answers to `traffic` -- a live feed AND a
    // measured interval, or the globe holds still. An unattended globe turning
    // over a dead source is the easiest lie to ship, because a turning globe looks
    // like health.
    fields: ['periodSeconds', 'endpoints[].workers', { path: 'sourceState', value: 'unavailable' }],
    model: {
      cite: 'fleet.endpoints',
      periodSeconds: 4,
      sourceState: 'live',
      size: 360,
      endpoints: [
        { id: 'dellpromax', lat: 40.7, lon: -74.0, workers: 4, awaiting: true },
        { id: 'hermes', lat: 51.5, lon: -0.12, workers: 2, awaiting: false },
        { id: 'studio', lat: 35.6, lon: 139.7, workers: 0, awaiting: false },
        { id: 'spark-02', lat: -33.8, lon: 151.2, workers: 1, awaiting: true },
      ],
    },
  },
};
