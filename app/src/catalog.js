// The families of the library, in the order the argument is made.
//
// `argument` is not marketing copy: each one is the sentence that explains
// why these particular components exist together, and most of them are
// lifted from the family files' own header comments. Where a family's
// components disagree with this summary the components win, and this file
// is the thing that was wrong.
export const FAMILIES = [
  {
    slug: 'field',
    name: 'The Field',
    question: 'Looking at a whole fleet at once',
    argument: 'Eight ways to hold a population in one look, and the discipline '
      + 'that a population nobody counted does not get to stagger.',
    file: 'src/components/field.js',
  },
  {
    slug: 'river',
    name: 'The River',
    question: 'Time, and how little of it a fleet keeps',
    argument: 'A family built to draw time is mostly a family drawing the shape '
      + 'of a hole. The discipline is that each one draws its own hole and '
      + 'names the series it wanted, rather than six charts printing the same shrug.',
    file: 'src/components/river.js',
  },
  {
    slug: 'telegraph',
    name: 'The Telegraph',
    question: 'What is waiting on me, and what if I keep sleeping',
    argument: 'A queue of human decisions. The cadence is the reading, and a '
      + 'poll that is overdue is the finding rather than something an indicator '
      + 'wraps around and forgets.',
    file: 'src/components/telegraph.js',
  },
  {
    slug: 'thread',
    name: 'The Thread',
    question: 'One session, held steady while it changes',
    argument: 'The close view of a single subject: nothing eases, the type '
      + 'arrives at the rate it was typed, and a change is a change because '
      + 'somebody timestamped it.',
    file: 'src/components/thread.js',
  },
  {
    slug: 'organism',
    name: 'The Organism',
    question: 'Whether the shape of the thing can hold',
    argument: 'Stock and flow, safe envelopes, admission control, the grid. A '
      + 'level and a rate never share a glyph, and a boundary nobody measured '
      + 'is not drawn as a boundary.',
    file: 'src/components/organism.js',
  },
  {
    slug: 'decision',
    name: 'Decision & Authority',
    question: 'Who may act, and who agreed',
    argument: 'Access as a physical latch rather than a colour change, the triad '
      + 'in dissent, the wall you see only as far as the one that stops you.',
    file: 'src/components/decision.js',
  },
  {
    slug: 'agents',
    name: 'Agents & Comms',
    question: 'Who is running, and how much to trust it',
    argument: 'Identical workers diverging visibly over time, redaction drawn as '
      + 'a hole, and a trust reading that never decorates an unmeasured thing.',
    file: 'src/components/agents.js',
  },
];

export const INSTRUMENTS = {
  slug: 'instruments',
  name: 'Instruments',
  question: 'The stand-alone pieces that are not a family',
  argument: 'gauge, globe and the full-width river: the drawings big enough to '
    + 'be pages of their own rather than cards in a deck.',
  file: 'src/components/gauge.js',
};

export function familyBySlug(slug) {
  return FAMILIES.find((family) => family.slug === slug) || null;
}

export function familyName(slug) {
  const family = familyBySlug(slug);
  return family ? family.name : slug;
}
