// THE TELEGRAPH -- one queue of human decisions, across every harness.
// The fixtures supply exactly the two things the family refuses to
// invent: a measured wait, and an honest source state.

export const telegraph = {
  tracker: { oldestWaitSeconds: 21400, sourceState: 'live' },

  bypass: { openCount: 2 },

  ceremony: {
    windowSeconds: 12,
    stages: [
      { label: 'PREPARE', why: 'the pack is staged', reached: true },
      { label: 'STAGE', why: 'first key', reached: true },
      { label: 'ARM', why: 'second key', reached: false },
      { label: 'EXECUTE', why: 'irreversible', reached: false },
    ],
  },

  'two-state': {
    states: [
      { label: 'KILL', why: 'stop the worker now; the change set is lost' },
      { label: 'HOLD', why: 'the attempt keeps running and keeps costing' },
    ],
    doNothing: 'the attempt keeps burning tokens against the ceiling',
  },

  tape: {
    sourceState: 'live',
    items: [
      {
        request_class: 'INCIDENT',
        severity: 'RED',
        title: 'PROOF GATE FLOODED THE SHARED QUEUE',
        wait_seconds: 7260,
        blocker: 'canonical truth will not mutate while the flood is open',
        if_you_wait: 'every downstream seal waits behind this one',
      },
      {
        request_class: 'PERMIT',
        severity: 'AMBER',
        title: 'RELEASE ARTIFACT OUTSIDE THE SANDBOX',
        wait_seconds: 430,
        blocker: 'the subject permit is held by the work item owner',
        if_you_wait: 'the artifact expires in 52 minutes',
      },
      {
        request_class: 'REVIEW',
        severity: 'GREEN',
        title: 'ADOPT THE NEW HARNESS PIN',
        wait_seconds: 60,
        blocker: null,
        if_you_wait: null,
      },
    ],
  },

  queue: {
    sourceState: 'measured_empty',
    openCount: 0,
    producer: 'orch-gateway',
    age: '4S',
  },
};
