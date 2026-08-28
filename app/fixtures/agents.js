// AGENTS AND COMMS -- who is running, and how much to trust it.
// A withheld row keeps its place in these fixtures, and UNPRICED is a
// truthful value: the cost field stays null because no producer supplies
// one, and the receipt says so in place.

export const agents = {
  disc: {
    worker: { session_id: 'ses-4419', model: 'qwen-72b', harness: 'opencode',
      host: 'box-1', did: 'did:cd:4419' },
  },

  individuation: {
    profile: 'qwen-72b · opencode',
    siblings: [
      { session_id: 'ses-4419', title: 'proof sweep', harness: 'opencode',
        host: 'box-1', turns: 412, tool_calls: 118, context_percent: 82 },
      { session_id: 'ses-4420', title: 'docs pass', harness: 'opencode',
        host: 'box-2', turns: 26, tool_calls: 4, context_percent: 14 },
      { session_id: 'ses-4421', title: 'triage', harness: 'opencode',
        host: 'box-1', turns: 88, tool_calls: 19, context_percent: 46 },
    ],
  },

  dispatch: {
    workers: [
      { session_id: 'ses-4419', harness: 'opencode', model: 'qwen-72b',
        host: 'box-1', did: 'did:cd:4419' },
      { session_id: 'ses-4422', harness: 'opencode', model: 'qwen-72b',
        host: null, did: 'did:cd:4422' },
      { session_id: 'ses-4423', harness: 'claude-code', model: 'gpt-6',
        host: 'spark-472e', did: 'WITHHELD' },
    ],
  },

  oracle: {
    fragments: [
      { label: 'ATTEMPT', value: 5, cite: 'sessions[].attempt' },
      { label: 'LAST FAILURE', value: 'worker exited 1', cite: 'events[].reason' },
      { label: 'DIVERGENCE', value: null, cite: 'no prior snapshot retained' },
      { label: 'SPEND SO FAR', value: null,
        cite: 'cost_gateway.CLAIMS[provider_charge]' },
    ],
  },

  dossier: {
    worker: { session_id: 'ses-4419', harness: 'opencode', model: 'qwen-72b',
      host: 'box-1', did: 'did:cd:4419' },
  },

  channel: {},

  redaction: {
    workers: [
      { session_id: 'ses-4419', title: 'proof sweep', did: 'did:cd:4419',
        turns: 412 },
      { session_id: 'ses-4420', title: 'unknown operator', redacted: true,
        turns: 88 },
      { session_id: 'ses-4421', title: 'triage', did: 'did:cd:4421',
        turns: 57 },
    ],
  },

  killmail: {
    receipt: {
      title: 'ATTEMPT 4 LOST · W-2211',
      receipt_id: 'KM-4419-4',
      fit: { harness: 'opencode', model: 'qwen-72b', profile: 'proof-sweep',
        host: 'box-1' },
      damage: { proof_state: 'UNSEALED', terminal: 'worker exited 1',
        reason: 'canonical_blocked at gate 3' },
      cost: null,
    },
  },
};
