// AGENTS & COMMS -- who is running, and how much to trust it. Trust is drawn as
// signal quality rather than a badge, and a withheld row keeps its place: silent
// absence teaches an operator the fleet is smaller than it is.

export const AGENTS_FIXTURES = {
  individuation: {
    // Workers sharing a profile, diverging because their experience diverges.
    // One sibling has burned 82% of its context arguing with a migration and one
    // has barely spoken; the bars are against the GROUP'S own span, so "same" and
    // "different lives" are one glance apart. An unmeasured worker gets no bar and
    // says so -- an unmeasured worker is not an identical one.
    fields: ['siblings[].context_percent'],
    model: {
      profile: 'hermes · migration-sweep',
      cite: 'telemetry.context_percent',
      siblings: [
        {
          session_id: 'ses-4419', title: 'ses-4419', harness: 'pi', host: 'dellpromax',
          model: 'qwen3.8-flash', context_percent: 82, turns: 214, tool_calls: 396,
        },
        {
          session_id: 'ses-4423', title: 'ses-4423', harness: 'pi', host: 'hermes',
          model: 'qwen3.8-flash', context_percent: 12, turns: 18, tool_calls: 22,
        },
        {
          session_id: 'ses-4431', title: 'ses-4431', harness: 'pi', host: 'spark-02',
          model: 'qwen3.8-flash', context_percent: null, turns: null, tool_calls: 4,
        },
      ],
    },
  },

  dispatch: {
    // Every part a manifest needs, fitted or missing, and the chain goes dashed
    // at the first part that is not fitted -- so where it stops is the answer. The
    // quiet default is the failure: a dispatch that fills an absent model with
    // "the usual one" is how a fleet ends up running something nobody chose.
    fields: ['workers[].model', 'workers[].harness', 'workers[].host', 'workers[].did'],
    model: {
      workers: [
        { session_id: 'ses-4419', harness: 'pi', model: 'qwen3.8-flash', host: 'dellpromax', did: 'did:cd:4419' },
        { session_id: 'ses-4423', harness: 'pi', model: 'qwen3.8-flash', host: 'hermes', did: null },
        { session_id: 'ses-4431', harness: 'codex', model: null, host: 'spark-02', did: 'did:cd:4431' },
      ],
    },
  },

  oracle: {
    // Four real facts, held apart. Composing them into "this will fail again"
    // needs priors over outcomes and nothing keeps any, so the space a forecast
    // would occupy is drawn hatched and named -- left off the panel it would read
    // as a component that does not forecast rather than one that refuses to.
    fields: ['fragments[].value'],
    model: {
      seam: 'source.outcome_priors(work_id)',
      fragments: [
        { label: 'ATTEMPT', value: '5 of 5 exhausted', cite: 'sessions[].attempt' },
        { label: 'SAME BLOCKER', value: 'credential expiry · 3×', cite: 'sessions[].state_reason' },
        { label: 'HOST DRIFT', value: 'dellpromax → spark-02', cite: 'fleet.placement' },
        { label: 'LAST SUCCESS ON THIS WORK', value: null, cite: 'source.work_history(work_id)' },
      ],
    },
  },

  dossier: {
    // The disc answers "which exact thing am I about to command" only if a
    // reviewer has been taught to read it, and a row whose producer is silent
    // says so rather than leaving the disc to imply a complete identity.
    fields: ['worker.model', 'worker.host', 'worker.did'],
    refusalText: 'UNMEASURED',
    model: {
      worker: {
        session_id: 'ses-4419', harness: 'pi', model: 'qwen3.8-flash',
        host: 'dellpromax', did: 'did:cd:4419',
      },
    },
  },

  channel: {
    // The four trust classes only teach the scale if they are seen together. This
    // one has no measurement to strip -- it is the legend of the scale, and the
    // UNATTRIBUTED row is the refusal inside it: no producer claimed this.
    fields: [],
    refusalText: 'UNATTRIBUTED',
    model: {
      classes: [
        ['CANONICAL', 0, 'Observed by the canonical producer.'],
        ['DERIVED', 1, 'Computed from canonical evidence, not observed directly.'],
        ['INFERRED', 2, 'A guess with a stated basis. Never an observation.'],
        ['UNATTRIBUTED', 3, 'No producer claimed this. Trust nothing from it.'],
      ],
    },
  },

  redaction: {
    // The row stays and its measures stay; exactly one mark says which part was
    // withheld. Removing the counts is the case where the row would otherwise go
    // quiet and the list would read shorter than the fleet is.
    fields: ['workers[].turns', 'workers[].did'],
    refusalText: 'UNMEASURED',
    model: {
      workers: [
        { session_id: 'ses-4419', title: 'ses-4419', did: 'did:cd:4419', turns: 214 },
        { session_id: 'ses-4423', title: 'ses-4423', redacted: true, turns: 61 },
        { session_id: 'ses-4431', title: 'ses-4431', did: 'did:cd:4431', turns: 18 },
      ],
    },
  },

  killmail: {
    // Every lost attempt gets an immutable record: who, what they were flying,
    // what it was worth. UNPRICED is a truthful value, not a placeholder -- a
    // receipt that guessed would be the first number anyone put in a spreadsheet.
    // The measurement here is the record itself. The family's whole claim is that
    // fleets lose attempts all day and write nothing down, which is why cost is
    // unanswerable: not that the numbers are missing, but that the events are not
    // recorded as objects. The receipt comes first and the price comes later.
    fields: ['receipt'],
    model: {
      receipt: {
        title: 'attempt 4 lost',
        receipt_id: 'KM-4419-4',
        fit: { harness: 'pi', model: 'qwen3.8-flash', profile: 'migration-sweep', host: 'dellpromax' },
        damage: {
          proof_state: 'PARTIAL — 1 of 3 sealed',
          terminal: 'worker exited 1',
          reason: 'Credential expired mid-run',
        },
        cost: { amount: null, cite: 'cost_gateway.CLAIMS[provider_charge]' },
      },
    },
  },
};
