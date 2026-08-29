// DECISION & AUTHORITY -- who may act, and who agreed. The rendering rule the
// whole family obeys: a control that lacks its grant is not a greyed-out button,
// it is inert glass that NAMES the authority it is missing.

export const DECISION_FIXTURES = {
  magi: {
    // Three seats, one subject, and no producer supplies a verdict per seat -- so
    // who spoke is drawn and the agreement itself is ruled unmeasured. A dissent
    // panel that invents a 3-0 out of one collapsed number is the exact failure
    // this component exists to prevent.
    fields: ['seats[].standing', 'collapsedState'],
    model: {
      collapsedState: 'needs_human',
      cite: 'source.per_producer_verdicts()',
      seats: [
        { label: 'SALUD', standing: 'spoke' },
        { label: 'KANPAI', standing: 'spoke' },
        { label: 'HARNESS', standing: 'silent' },
      ],
    },
  },

  glassCell: {
    // The subject supplies nothing about being observed. Fields that pass cross
    // the pane; the ones it blocks stop AGAINST it, and that is a shape rather
    // than a colour. The removal here is an empty pass-list, which is what a
    // producer that never answered looks like on the way in.
    fields: [{ path: 'passed', value: [] }],
    model: {
      passed: [{ field: 'STATE' }, { field: 'ATTEMPT' }, { field: 'LAST HEARTBEAT' }],
      blocked: [
        { field: 'WHAT IT THINKS', why: 'no reader' },
        { field: 'WHO ELSE SAW IT', why: 'not recorded' },
      ],
    },
  },

  keycard: {
    // Authority is a sequence of doors: you get as far as the first one held shut
    // and every door past it is dashed because nobody tried it. An event with no
    // timestamp is drawn UNSTAMPED and loud, because a trace whose order cannot
    // be established is a list.
    // An unreported door state is NOT `not_reached`. That word is earned by a halt
    // the sequence saw; substituting it here would have the showcase report six
    // doors as untried on the strength of nobody having said anything (finding #4).
    fields: [{ path: 'doors[].state', value: 'unknown' }, 'unstamped'],
    model: {
      unstamped: 3,
      doors: [
        { label: 'EFFECTIVE MODE', state: 'open' },
        { label: 'OPERATOR SESSION', state: 'open' },
        { label: 'OPERATOR IDENTITY', state: 'open' },
        { label: 'COMMAND ADAPTER', state: 'shut' },
        { label: 'ORCHESTRATOR VERB', state: 'not_reached' },
        { label: 'SUBJECT PERMIT', state: 'not_reached' },
      ],
    },
  },

  ice: {
    // The layers past the one that stopped you are not layers you beat. Every
    // check after the first missing grant is UNTESTED, and a console that paints
    // those rows green or grey is wrong twice: not reached is its own state.
    fields: [{ path: 'walls[].state', value: 'unknown' }],
    model: {
      walls: [
        { label: 'EFFECTIVE MODE', state: 'open' },
        { label: 'OPERATOR IDENTITY', state: 'open' },
        { label: 'COMMAND ADAPTER', state: 'shut' },
        { label: 'ORCHESTRATOR VERB', state: 'not_reached' },
        { label: 'SUBJECT PERMIT', state: 'not_reached' },
      ],
    },
  },

  gevulot: {
    // A field with no stated contract is not a public one. The honest render of
    // "nobody supplied a visibility contract" is not to paint every field PUBLIC,
    // it is to draw every field UNCONTRACTED and say that sharing this surface
    // shares all of it at once.
    fields: ['fields[].contract'],
    refusalText: 'NO CONTRACT PRODUCER',
    model: {
      producer: 'configuration.visibility_contracts',
      fields: [
        { label: 'SUBJECT ID', contract: 'OPERATOR_ONLY', path: 'sessions[].id' },
        { label: 'HOSTNAME', contract: null, path: 'sessions[].host' },
        { label: 'COMMAND OUTPUT', contract: null, path: 'evidence.output' },
        { label: 'PROVIDER CHARGE', contract: null, path: 'cost_gateway.CLAIMS' },
        { label: 'OPERATOR IDENTITY', contract: 'REDACTABLE', path: 'sessions[].operator' },
      ],
    },
  },

  dominator: {
    // Three verbs against one environment, so the three states stand side by side
    // and the difference is legible without reading the labels. The environment
    // is the measurement: change it and the ladder re-prices itself.
    fields: ['verbs[].permit'],
    refusalText: 'PERMIT UNMEASURED',
    model: {
      env: { mode: 'act-reversible', operator: 'laul', adapter: true, capabilities: ['RETRY'] },
      verbs: [
        { label: 'RETRY ATTEMPT', commandType: 'RETRY', permit: true, irreversible: false, expectedWait: 'ETA 4M', cite: 'orchestrator.commands.retry' },
        { label: 'TERMINATE', commandType: 'TERMINATE', permit: true, irreversible: true, expectedWait: null, cite: 'orchestrator.commands.terminate' },
        { label: 'PURGE EVIDENCE', commandType: 'PURGE', permit: null, irreversible: true, expectedWait: null, cite: 'sessions[].permit.purge' },
      ],
    },
  },

  ladder: {
    // Every verb priced in authority, and the rungs you cannot afford stay on the
    // list: hiding a verb an operator lacks hides the system's shape.
    fields: ['verbs[].permit', 'verbs[].expectedWait'],
    refusalText: 'PERMIT UNMEASURED',
    model: {
      label: 'Command ladder',
      env: { mode: 'act-reversible', operator: 'laul', adapter: true, capabilities: ['RETRY', 'ANNOTATE'] },
      verbs: [
        { label: 'ANNOTATE', commandType: 'ANNOTATE', permit: true, irreversible: false, expectedWait: 'IMMEDIATE', cite: 'orchestrator.commands.annotate' },
        { label: 'RETRY', commandType: 'RETRY', permit: true, irreversible: false, expectedWait: 'ETA 4M', cite: 'orchestrator.commands.retry' },
        { label: 'REASSIGN HOST', commandType: 'REASSIGN', permit: false, irreversible: false, expectedWait: null, cite: 'sessions[].permit.reassign' },
        { label: 'PURGE', commandType: 'PURGE', permit: null, irreversible: true, expectedWait: null, cite: 'sessions[].permit.purge' },
      ],
    },
  },
};
