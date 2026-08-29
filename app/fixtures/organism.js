// THE ORGANISM -- supply, structure, and where the fleet sits. Forrester's rule
// runs through the family: a level and a rate are different kinds of number and
// never wear the same mark, and no rate here is derived from one snapshot.

export const ORGANISM_FIXTURES = {
  stockFlow: {
    // Levels stand; rates hold still. Even a measured rate refuses to animate,
    // because the one way to draw a rate wrong is to let it fill something.
    fields: ['levels[].value', 'rates[].value'],
    model: {
      levels: [
        { label: 'QUEUED', value: 12, cite: 'fleet.counts.queued' },
        { label: 'RUNNING', value: 7, cite: 'fleet.counts.running' },
        { label: 'NEEDS A HUMAN', value: 3, cite: 'items[].open' },
      ],
      rates: [
        { label: 'COMPLETED', value: 41, period: 'HOUR', cite: 'source.throughput_1h' },
        { label: 'SPEND', value: '$3.40', period: 'HOUR', cite: 'cost_gateway.CLAIMS[provider_charge]' },
      ],
    },
  },

  envelope: {
    // Rasmussen: a system drifts toward an edge rather than failing at a limit.
    //
    // Two edges are priced and one is not, which is what a real quarter looks like --
    // and until now this model could not have shown anything else, because the
    // component hardcoded all three walls as unsupplied. An envelope with invented
    // edges is worse than no envelope, so WORKLOAD stays unpriced and says so; the two
    // edges the operator did price draw to their measured extent, which is what a gauge
    // is for. (Finding #9: this bright model was three refusals and a label.)
    fields: ['position', 'boundaries'],
    model: {
      boundaries: [
        // 0.62 became 0.70 so the wall and the position cannot land on the same pixel: two
        // 0.62s in one drawing read as one measurement, and they are not the same measurement.
        ['economic', 'ECONOMIC', 'The spend ceiling nobody has priced.', 0.70],
        ['workload', 'WORKLOAD', 'The load the fleet carries before work waits.', null],
        ['safety', 'SAFETY', 'The point past which failures stop being recoverable.', 0.44],
      ],
      // The position now carries the two numbers the HUD prints side by side — the live value
      // and the limit it is read against — because a dot with no numbers under it was being
      // drawn at the centre of the space, which is a placement the fixture never measured.
      // `12.4 / 20` is the same figure as the extent, in the other direction.
      position: {
        used: 12.4, ceiling: 20, unit: 'aircraft-hours in the quarter',
        cite: 'fleet.demand / fleet.ceiling',
        note: 'fleet aggregate, unmeasured against all three edges',
      },
    },
  },

  admission: {
    // The tilt IS the difference, so a utilisation percentage hiding which side
    // moved has nowhere to hide. With either count missing the beam is not drawn
    // level: level is the picture of a balanced fleet.
    fields: ['offered', 'taken'],
    model: {
      offered: 14,
      taken: 9,
      status: 'PARTIAL',
      reason: 'five crates sat on the dock while the queue believed it was empty',
    },
  },

  city: {
    // One building per host, one lit window per worker, and an empty host drawn
    // dark rather than omitted -- a host that vanished when it emptied would take
    // the evidence of the starvation with it.
    fields: ['hosts[].workers'],
    refusalText: 'DARK',
    model: {
      hosts: [
        { host: 'dellpromax', workers: [{ state: 'running' }, { state: 'running' }, { state: 'waiting' }, { state: 'running' }] },
        { host: 'hermes', workers: [{ state: 'running' }, { state: 'running' }] },
        { host: 'studio', workers: [] },
        { host: 'spark-02', workers: [{ state: 'stalled' }] },
        { host: 'nas', workers: [] },
      ],
    },
  },

  garage: {
    // What the fit has actually produced. An empty column and a column of passes
    // look identical until one of them is named, so the honest empty is the words
    // NO PROOF HISTORY rather than a blank.
    fields: [{ path: 'loadouts[].proof', value: {} }],
    refusalText: 'NO PROOF HISTORY',
    model: {
      loadouts: [
        { model: 'qwen3.8-flash', harness: 'pi', count: 7, proof: { PROVEN: 5, FAILED: 2 } },
        { model: 'hermes-4', harness: 'codex', count: 3, proof: { PROVEN: 3 } },
        { model: 'router:canon', harness: 'http', count: 2, proof: {} },
      ],
    },
  },

  strands: {
    // A strand thickens once per landing on it, so the path everything travels is
    // visibly that path. A route with no delivery stays drawn and dashed: an
    // undelivered strand is the fact.
    fields: ['routes[].delivered'],
    model: {
      routes: [
        { origin: 'dell-local', destination: 'studio', carrier: 'tailscale', delivered: true },
        { origin: 'dell-local', destination: 'studio', carrier: 'tailscale', delivered: true },
        { origin: 'dell-local', destination: 'spark-02', carrier: 'sftp', delivered: false },
        { origin: 'hermes', destination: 'studio', carrier: 'tailscale', delivered: true },
      ],
    },
  },

  grid: {
    // Every subject on one dense grid, and an empty cell is never blank: blank
    // reads as zero or as fine, and the word is what makes it a gap. This is also
    // the widest thing in the library, so it is the page's overflow test.
    fields: ['rows[].proof', 'rows[].ctx', 'rows[].run'],
    refusalText: 'UNMEASURED',
    model: {
      rows: [
        {
          task: 'proof-gate', state: 'running', host: 'dellpromax', harness: 'pi',
          model: 'qwen3.8-flash', run: '4419', proof: 'PARTIAL', ctx: '82%',
        },
        {
          task: 'migration', state: 'waiting', host: 'hermes', harness: 'codex',
          model: 'hermes-4', run: '4420', proof: null, ctx: null,
        },
        {
          task: 'nightly-sweep', state: 'queued', host: 'studio', harness: 'http',
          model: 'router:canon', run: null, proof: null, ctx: null,
        },
      ],
    },
  },

  atField: {
    // Wider scope drawn further out and fainter, so the escalation is read before
    // the numbers are. Where no write route exists none of this is a permission,
    // and the card says so under the drawing rather than letting the rings imply
    // it. The rings travel on the fact that a reach was computed at all.
    fields: ['scopes'],
    model: {
      writable: false,
      cite: 'authority.evaluate',
      scopes: [
        { label: 'SESSION', count: 1, reach: 'the subject in view' },
        { label: 'PROFILE', count: 4, reach: 'workers on this profile' },
        { label: 'HOST', count: 12, reach: 'everything on dellpromax' },
        { label: 'FLEET', count: 54, reach: 'every host, including the ones dark' },
      ],
    },
  },
};
