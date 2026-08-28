// THE THREAD -- one session, held steady while it changes.
// The recurring trap is the half-detector: every component here wants two
// channels. The fixtures hold one of them back so the refusal shows.

export const thread = {
  mfd: {
    panes: [
      { label: 'RUNTIME', value: '19:23:40', detail: 'wall clock since dispatch',
        cite: 'sessions[].runtime' },
      { label: 'LAST OUTPUT', value: '412 TURNS', detail: 'turn counter, cumulative',
        cite: 'sessions[].turns' },
    ],
  },

  // The measured world here is honest-still: both channels hold one
  // sample and neither is moving, so the verdict is STALLED. The dark
  // variant takes the output channel's witness away, and the verdict
  // drops back to SYNC UNMEASURED -- half a detector.
  sync: {
    output: { known: true },
    state: { known: true },
    verdict: null,
  },

  cut: {
    changed: 6,
    inFlight: true,
    attempt: 4,
    branch: 'ops/4419-proof',
  },

  muthur: {
    answers: [
      { question: 'WHAT IS THIS SESSION', answer: 'ses-4419 · proof sweep',
        cite: 'sessions[].id' },
      { question: 'WHO MAY COMMAND IT', answer: 'act-reversible · op@deck',
        cite: 'authority.evaluate' },
      { question: 'WHAT DID IT LAST PRINT', answer: null,
        cite: 'no producer retains stdout' },
      { question: 'WHAT WILL IT COST TO FINISH', answer: null,
        cite: 'cost_gateway.CLAIMS[provider_charge]' },
      { question: 'WHY IS IT BLOCKED', answer: 'canonical_blocked at gate 3',
        cite: 'sessions[].state_reason' },
    ],
  },

  joi: {
    rows: [
      { label: 'RUNTIME', value: '19:23:40', kind: 'observed', cite: 'sessions[].runtime' },
      { label: 'STATE', value: 'blocked', kind: 'observed', cite: 'sessions[].state' },
      { label: 'PROOF', value: 'UNSEALED', kind: 'observed', cite: 'evidence.proof.state' },
      { label: 'LIKELY NEXT', value: 'retry after gate clears', kind: 'projected',
        cite: 'no producer; inferred from attempt history' },
      { label: 'WILL IT SUCCEED', value: null, kind: 'projected',
        cite: 'source.outcome_priors() — none exists' },
    ],
  },

  burn: {
    percent: 62,
    subject: { id: 'ses-4419', state: 'blocked' },
  },
};
