// THE TELEGRAPH -- a queue of human decisions, and the waits that make the
// cadence mean something.
//
// `cadence()` returns null when no wait was measured, and null is the
// important return: a queue whose waits are all unmeasured gets a still page
// and a word saying why, never a reassuring pulse over numbers nobody has.

export const TELEGRAPH_FIXTURES = {
  tracker: {
    // One instrument, one sound: the oldest decision sits at a radius read off
    // its own clock. The refusal this component is named for is the per-decision
    // ping, which would need a measured urgency nobody supplies -- it is written
    // on the drawing so a reader cannot mistake its absence for an oversight.
    fields: ['oldestWaitSeconds'],
    model: {
      oldestWaitSeconds: 5400,
      sourceState: 'live',
      cite: 'summary.oldest_wait_seconds',
    },
  },

  bypass: {
    // The critical path goes AROUND every filter in the stack rather than
    // through them, and the count on it is measured or it is nothing: "0
    // algedonic" over a producer that never answered is the most dangerous zero
    // a console can print.
    fields: ['openCount'],
    model: { openCount: 2, cite: 'items[].request_class' },
  },

  ceremony: {
    // Gates on one run, with the abort window as the only span on it that has a
    // length, stated before anything is armed. Two gates reached, two not: a
    // gate nobody entered is drawn hollow rather than armed.
    fields: ['stages', 'stages[].reached'],
    model: {
      windowSeconds: 10,
      cite: 'ceremony.stages[].reached',
      stages: [
        { label: 'STAGE', reached: true, why: 'the deck is in an acting mode' },
        { label: 'CONFIRM', reached: true, why: 'operator bound this render' },
        { label: 'ARM', reached: false, why: 'no orchestrator adapter reachable' },
        { label: 'COMMIT', reached: false, why: 'never attempted' },
      ],
    },
  },

  twoState: {
    // Two outcomes drawn at the same weight, nothing preselected, and the cost
    // of choosing neither on its own line. Stripping that line is the common
    // case: no producer states what waiting costs, and the box hatches.
    fields: ['doNothing'],
    model: {
      states: [
        { label: 'RETRY', why: 'runs the work item again against the same proof', selected: false },
        { label: 'TERMINATE', why: 'releases the worker and keeps the tape', selected: false },
      ],
      doNothing: 'the attempt counter stays where it is and the wait keeps running',
    },
  },

  tape: {
    // One strip per decision, read in the order it will hurt. Each strip's clock
    // is its own measured wait, so removing the waits stops every counter on the
    // page while the queue keeps its shape and its ranking.
    fields: ['items[].wait_seconds'],
    model: {
      sourceState: 'live',
      cite: 'items[].wait.seconds',
      items: [
        {
          request_class: 'INCIDENT',
          severity: 'RED',
          title: 'Proof gate blocked the canonical write',
          wait_seconds: 5400,
          blocker: 'Credential expired mid-run; the runner will not re-ask.',
          if_you_wait: 'the retry window closes at 6H and the tape stays at attempt 4',
        },
        {
          request_class: 'REVIEW',
          severity: 'AMBER',
          title: 'Two keys wanted for the deploy',
          wait_seconds: 1260,
          blocker: 'Second reviewer has not opened the ceremony.',
          if_you_wait: null,
        },
        {
          request_class: 'REPORT',
          severity: 'ROUTINE',
          title: 'Weekly spend reconciliation',
          wait_seconds: 168,
          blocker: null,
          if_you_wait: 'nothing observable changes, which is also a finding',
        },
      ],
    },
  },

  queueState: {
    // Two empties that render identically unless one of them says so. Measured
    // empty is an all-clear and is allowed to say so; a board nobody reached
    // prints no numeral at all, names the producer and the last contact, and
    // claims nothing. The honest removal is the second one, so this field
    // substitutes the state a failed fetch actually yields rather than a null.
    fields: [{ path: 'sourceState', value: 'unavailable' }, 'openCount', 'age'],
    model: {
      sourceState: 'measured_empty',
      openCount: 0,
      producer: 'notifications.summary',
      age: '9s',
    },
  },
};
