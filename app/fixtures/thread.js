// THE THREAD -- one session held steady while it changes. Every component here
// wants two channels and is given one, so the bright model is usually the honest
// half-measure the producer actually sends.

export const THREAD_FIXTURES = {
  mfd: {
    // Two panes switched separately. The rule that matters is the dark one: a
    // readout whose producer is silent renders its own unmeasured face and never
    // falls back to the pane that has data.
    fields: ['panes[].value', 'panes'],
    model: {
      panes: [
        {
          label: 'RUNTIME',
          value: '04:12:33',
          detail: 'wall clock on the live attempt',
          cite: 'sessions[].runtime_seconds',
        },
        {
          label: 'TIMELINE',
          value: '9 EVENTS',
          detail: 'retained events, oldest first',
          cite: 'sessions[].evidence.timeline',
        },
      ],
    },
  },

  syncRatio: {
    // Output and state-space, and the fleet typically instruments one of them.
    // A cumulative turn counter is not a rate, so reading it as "still emitting"
    // would fire SPINNING on every finished session -- the output lane stays
    // dark, named, and the verdict is UNMEASURED rather than half a detector
    // reporting as a whole one.
    fields: ['state.known', 'output.known'],
    model: {
      output: { known: false, cite: 'telemetry.output_events' },
      state: { known: true, value: 1, cite: 'sessions[].state_revision' },
      verdict: null,
      ratioCite: 'source.progress_history()',
    },
  },

  hardCut: {
    // The work in flight, struck through by the cut. The scar travels only when
    // the change set it strikes through was measured -- drawn travelling over a
    // hatched panel it would animate a cost nobody counted, inside a card that
    // has already refused.
    fields: ['changed', 'attempt'],
    model: {
      changed: 6,
      inFlight: true,
      attempt: 4,
      branch: 'app/pi',
      cite: 'evidence.git.changed_files',
    },
  },

  muthur: {
    // The fixed list of questions this console may be asked about a subject,
    // each with its answer and field, or its refusal and the producer that would
    // supply it. The refusals get the same prompt and the same rule as the
    // answers: they are answers, and demoting them is how a console starts to
    // look more capable than it is.
    fields: ['answers[].answer'],
    refusalText: 'UNABLE TO COMPUTE',
    model: {
      answers: [
        { question: 'WHAT IS IT DOING NOW', answer: 'waiting on a credential', cite: 'sessions[].state_reason' },
        { question: 'HOW LONG HAS IT WAITED', answer: '1H 30M', cite: 'summary.oldest_wait_seconds' },
        { question: 'WHAT WOULD STOPPING IT COST', answer: 'attempt 4, 6 files', cite: 'evidence.git.changed_files' },
        { question: 'WILL IT FAIL AGAIN', answer: null, cite: 'source.outcome_priors(work_id)' },
        { question: 'WHO ELSE IS ON THIS HOST', answer: null, cite: 'fleet.placement' },
      ],
    },
  },

  joiOverlay: {
    // Observed and projected, at the same weight and clearly not the same thing.
    // A badge reading "inferred" beside an identically weighted number is the
    // failure this rule prevents with a label on it.
    fields: ['rows[].value'],
    model: {
      rows: [
        { label: 'LAST OBSERVED', value: '09:11:52', cite: 'sessions[].heartbeat_at', kind: 'observed' },
        { label: 'ATTEMPT', value: 4, cite: 'sessions[].attempt', kind: 'observed' },
        { label: 'LIKELY BLOCKER', value: 'credential expiry', cite: 'inferred.blocker', kind: 'projected' },
        { label: 'NEXT FAILURE BY', value: null, cite: 'inferred.failure_at', kind: 'projected' },
      ],
    },
  },

  contextBurn: {
    // The working panel closing in from the edges, which is a direction rather
    // than a budget. The grain is a deterministic function of the percentage, so
    // a capture of one payload is the same bytes twice.
    fields: ['percent'],
    model: {
      percent: 82,
      subject: { id: 'ses-4419', state: 'running' },
      edge: 75,
      cite: 'telemetry.context_percent',
    },
  },
};
