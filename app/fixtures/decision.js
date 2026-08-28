// DECISION & AUTHORITY -- who may act, and who agreed.
// The ladder stops at the first missing grant, so the fixtures keep one
// honest blocker standing while the rest of the corridor stays reachable.

export const authorityEnv = {
  mode: 'act-reversible',
  operator: 'op@deck',
  adapter: true,
  capabilities: ['retry', 'discard', 'terminate'],
};

export const decision = {
  magi: {
    collapsedState: 'blocked',
    seats: [
      { label: 'SALUD', standing: 'spoke' },
      { label: 'KANPAI', standing: 'spoke' },
      { label: 'HARNESS', standing: 'silent' },
    ],
  },

  glass: {
    passed: [{}, {}],
    blocked: [{ why: 'subject consent' }, { why: 'no contract' }],
  },

  keycard: {
    unstamped: 0,
    doors: [
      { label: 'EFFECTIVE MODE', state: 'open' },
      { label: 'OPERATOR SESSION', state: 'open' },
      { label: 'OPERATOR IDENTITY', state: 'open' },
      { label: 'COMMAND ADAPTER', state: 'open' },
      { label: 'ORCHESTRATOR VERB', state: 'open' },
      { label: 'SUBJECT PERMIT', state: 'shut' },
      { label: 'ACCEPTANCE CEREMONY', state: 'not_reached' },
    ],
  },

  ice: {
    walls: [
      { label: 'EFFECTIVE MODE', state: 'open' },
      { label: 'OPERATOR IDENTITY', state: 'open' },
      { label: 'SUBJECT PERMIT', state: 'shut' },
      { label: 'ACCEPTANCE CEREMONY', state: 'not_reached' },
      { label: 'SANDBOX ESCAPE', state: 'not_reached' },
    ],
  },

  gevulot: {
    fields: [
      { label: 'SUBJECT ID', path: 'sessions[].id', contract: 'OPERATOR-ONLY' },
      { label: 'CHARGE', path: 'cost_gateway.CLAIMS[provider_charge]',
        contract: 'OPERATOR-ONLY' },
      { label: 'MODEL OUTPUT', path: 'sessions[].output', contract: null },
      { label: 'OPERATOR IDENTITY', path: 'sessions[].operator', contract: null },
      { label: 'HOST PATHS', path: 'sessions[].host_paths', contract: null },
    ],
  },

  dominator: {
    env: authorityEnv,
    verbs: [
      { label: 'RETRY ATTEMPT', commandType: 'retry', permit: true,
        irreversible: false, expectedWait: '~90S to first output',
        cite: 'orchestrator.RETRY' },
      { label: 'DROP CHANGE SET', commandType: 'discard', permit: true,
        irreversible: true, expectedWait: null, cite: 'orchestrator.DISCARD' },
      { label: 'KILL SESSION', commandType: 'terminate', permit: false,
        irreversible: true, expectedWait: null, cite: 'orchestrator.TERMINATE' },
    ],
  },

  ladder: {
    // Capabilities wide enough that the ladder reports each verb's own
    // first missing authority, not the same seam five times.
    env: { mode: 'act-reversible', operator: 'op@deck', adapter: true,
      capabilities: ['retry', 'hold', 'archive', 'purge'] },
    verbs: [
      { label: 'RETRY', commandType: 'retry', permit: true,
        irreversible: false, expectedWait: '~90S', cite: 'orchestrator.RETRY' },
      { label: 'HOLD', commandType: 'hold', permit: null,
        irreversible: false, expectedWait: null, cite: 'orchestrator.HOLD' },
      { label: 'ARCHIVE', commandType: 'archive', permit: false,
        irreversible: false, expectedWait: null, cite: 'orchestrator.ARCHIVE' },
      { label: 'PURGE', commandType: 'purge', permit: true,
        irreversible: true, expectedWait: null, cite: 'orchestrator.PURGE' },
      { label: 'SPAWN', commandType: 'spawn', permit: true,
        irreversible: false, expectedWait: null, cite: 'orchestrator.SPAWN' },
    ],
  },
};
