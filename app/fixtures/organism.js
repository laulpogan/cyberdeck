// THE ORGANISM -- supply, structure, and where the fleet sits.
// A level and a rate never share a glyph, and the boundaries stay
// unsupplied in the fixture because inventing an edge is the failure the
// whole family exists to prevent.

export const organism = {
  'stock-flow': {
    levels: [
      { label: 'QUEUED', value: 14, cite: 'sessions[].state=queued' },
      { label: 'IN FLIGHT', value: 3, cite: 'sessions[].state=working' },
    ],
    rates: [
      { label: 'ADMITTED', value: 6, period: 'HR', cite: 'admission.rate_1h' },
      { label: 'RETRIES', value: null, period: 'HR',
        cite: 'no producer keeps a retry series' },
    ],
  },

  envelope: { position: {} },

  admission: { offered: 9, taken: 4, status: 'PARTIAL', reason: null },

  city: {
    hosts: [
      { host: 'box-1', workers: [
        { state: 'working' }, { state: 'blocked' }, { state: 'working' },
        { state: 'waiting' }, { state: 'working' }] },
      { host: 'box-2', workers: [{ state: 'working' }, { state: 'stalled' }] },
      { host: 'dot-air', workers: [] },
      { host: 'spark-472e', workers: [
        { state: 'working' }, { state: 'queued' }, { state: 'working' }] },
    ],
  },

  garage: {
    loadouts: [
      { model: 'qwen-72b', harness: 'opencode', count: 3,
        proof: { PASS: 12, FAIL: 2 } },
      { model: 'gpt-6', harness: 'claude-code', count: 2, proof: {} },
    ],
  },

  strands: {
    routes: [
      { origin: 'LAB', destination: 'STAGE', carrier: 'runner-1', delivered: true },
      { origin: 'LAB', destination: 'STAGE', carrier: 'runner-3', delivered: true },
      { origin: 'BOX-1', destination: 'STAGE', carrier: 'runner-1', delivered: true },
      { origin: 'STAGE', destination: 'ARCHIVE', carrier: 'runner-2', delivered: false },
    ],
  },

  grid: {
    rows: [
      { task: 'W-2211', state: 'blocked', host: 'box-1', harness: 'opencode',
        model: 'qwen-72b', run: '4419', proof: 'UNSEALED', ctx: '82%' },
      { task: 'W-2212', state: 'working', host: 'box-2', harness: 'claude-code',
        model: 'gpt-6', run: '4420', proof: 'SEALED', ctx: '14%' },
      { task: 'W-2213', state: 'waiting', host: 'spark-472e', harness: 'opencode',
        model: 'qwen-72b', run: '4421', proof: 'UNSEALED', ctx: '31%' },
    ],
  },

  'at-field': {
    writable: false,
    scopes: [
      { label: 'SESSION', count: 1, reach: 'one subject' },
      { label: 'HOST', count: 12, reach: 'one machine' },
      { label: 'FLEET', count: 54, reach: 'every subject' },
      { label: 'EVERYTHING', count: 'ALL', reach: 'everything reachable' },
    ],
  },
};
