import * as field from '../../../src/components/field.js';
import * as river from '../../../src/components/river.js';
import * as telegraph from '../../../src/components/telegraph.js';
import * as thread from '../../../src/components/thread.js';
import * as organism from '../../../src/components/organism.js';
import * as decision from '../../../src/components/decision.js';
import * as authority from '../../../src/components/authority.js';
import * as agents from '../../../src/components/agents.js';
import { gauge } from '../../../src/components/gauge.js';
import { globe, paintGlobe } from '../../../src/components/globe.js';

import { FIELD_FIXTURES } from '../../fixtures/field.js';
import { RIVER_FIXTURES } from '../../fixtures/river.js';
import { TELEGRAPH_FIXTURES } from '../../fixtures/telegraph.js';
import { THREAD_FIXTURES } from '../../fixtures/thread.js';
import { ORGANISM_FIXTURES } from '../../fixtures/organism.js';
import { DECISION_FIXTURES } from '../../fixtures/decision.js';
import { AGENTS_FIXTURES } from '../../fixtures/agents.js';
import { INSTRUMENT_FIXTURES } from '../../fixtures/instruments.js';

/** One component, assembled from the module that exports it and the fixture that
 * feeds it. `fields` comes from the fixture rather than being repeated here, so
 * the registry cannot claim a measurement the model does not carry. */
function entry(module, fixtures, key, meta) {
  const fixture = fixtures[key];
  if (!fixture) throw new Error(`registry entry '${key}' has no fixture`);
  if (typeof module[key] !== 'function') throw new Error(`registry entry '${key}' is not exported`);
  return { key, fn: module[key], fields: fixture.fields, ...meta };
}

export const FAMILY_TABLES = [
  {
    slug: 'field',
    name: 'The Field',
    question: 'Looking at a whole fleet at once',
    argument: 'Eight ways to hold a population in one look. Every one of them '
      + 'reads the measurement, decides whether there is one, and either draws it '
      + 'with a mark naming where it came from or refuses and says why. There is '
      + 'no third branch.',
    file: 'src/components/field.js',
    components: [
      entry(field, FIELD_FIXTURES, 'scanOverlay', {
        title: 'Kiroshi scan overlay',
        producer: 'sessions[].id · authority.evaluate · sessions[].state_reason',
        refusal: 'An annotation drawn to an empty field claims a reading nobody took.',
        note: 'The leaders run out to the margin rather than a card sitting on the '
          + 'cell, because a card over the cell hides the geography it was selected from.',
      }),
      entry(field, FIELD_FIXTURES, 'triVision', {
        title: 'Tri-vision lens toggle',
        producer: 'fleet.cells[health|cost|authority]',
        refusal: 'An unmeasured cell hatches under every lens.',
        note: 'The lens switch is the operator’s choice, so it is marked `intent` — '
          + 'the only motion on this component that is a claim about the interface '
          + 'rather than about the fleet.',
      }),
      entry(field, FIELD_FIXTURES, 'scaleCrush', {
        title: 'Fleet-wall scale crush',
        producer: 'fleet.cells',
        refusal: 'The board was never counted.',
        note: 'A stagger over a population nobody counted is a rhythm invented to '
          + 'look considered.',
      }),
      entry(field, FIELD_FIXTURES, 'coverage', {
        title: 'Coverage as territory',
        producer: 'coverage.observed',
        refusal: 'No contour was sampled.',
        note: 'Terrain quietly left flat is indistinguishable from terrain measured '
          + 'as flat, so the unmeasured region is a boxed hatched void with the word on it.',
      }),
      entry(field, FIELD_FIXTURES, 'chipBudget', {
        title: 'HUD chip budget',
        producer: 'hud.channel_budget',
        refusal: 'An empty bar is a spend of zero, and nobody measured a spend of zero.',
        note: 'A chip whose cost nobody costed is listed and marked, never counted '
          + 'as free.',
      }),
      entry(field, FIELD_FIXTURES, 'radar', {
        title: 'Radar freshness sweep',
        producer: 'source.poll_interval_ms',
        refusal: 'An overdue poll refuses to sweep rather than wrapping, since a wrap '
          + 'would erase the finding.',
        note: 'Radius is evidence age, not distance. A contact with no measured age '
          + 'is listed off-scope rather than parked at the centre, which would read as '
          + 'the freshest thing on the screen.',
      }),
      entry(field, FIELD_FIXTURES, 'needleField', {
        title: 'Magnetic needle field',
        producer: 'sessions[].constraint',
        refusal: 'This worker reported no constraint.',
        note: 'Every needle is the same length on purpose: direction is measured, '
          + 'magnitude is not.',
      }),
      entry(field, FIELD_FIXTURES, 'standardSheet', {
        title: 'Semiotic standard sheet',
        producer: 'nothing — it is a legend',
        refusal: 'A legend is not a reading: nothing on it is measured, so nothing on '
          + 'it may move.',
        note: 'The control that proves the library can hold still on purpose. It '
          + 'refuses with any fixture, which is why there is no field here to strip.',
      }),
    ],
  },

  {
    slug: 'river',
    name: 'The River',
    question: 'Time, and how little of it a fleet keeps',
    argument: 'A family built to draw time is mostly a family drawing the shape of '
      + 'a hole. The discipline is that each one draws its OWN hole and names the '
      + 'series it wanted, rather than six charts printing the same shrug — a reader '
      + 'learns which recorder to build first.',
    file: 'src/components/river.js',
    components: [
      entry(river, RIVER_FIXTURES, 'river', {
        title: 'The phosphor lanes',
        producer: 'sessions[].evidence.timeline',
        refusal: 'A lane with no events does not draw, and says so.',
        note: 'The beam travels because the run happened, and the stagger is the '
          + 'order the lanes are read. A lane with nothing on it is drawn as a lane, '
          + 'not omitted.',
        fullWidth: true,
      }),
      entry(river, RIVER_FIXTURES, 'esperDive', {
        title: 'ESPER evidence dive',
        producer: 'sessions[].id · sessions[].work.id · evidence.artifact.latest_path',
        refusal: 'The honest dive descends only as far as the producer retains, then '
          + 'draws the floor AS A FRAME rather than leaving it off the end.',
        note: 'A viewer that keeps offering another step teaches an operator the '
          + 'detail exists somewhere, which is the one thing ESPER is famous for '
          + 'getting wrong.',
      }),
      entry(river, RIVER_FIXTURES, 'tapeSplice', {
        title: 'Tape splice & stitch',
        producer: 'sessions[].evidence.timeline',
        refusal: 'This attempt kept no tape.',
        refusalText: 'UNMEASURED',
        note: 'A splice you cannot see is an edit presented as a recording. With no '
          + 'attempt number the strip is hatched and the card declares nothing — the '
          + 'one specimen whose refusal is drawn rather than written.',
      }),
      entry(river, RIVER_FIXTURES, 'oscillation', {
        title: 'Oscillation detector',
        producer: 'source.attempt_outcomes(work_id)',
        refusal: 'A rhythm needs a period, nobody keeps one, so the detector that '
          + 'would hunt prettily over an unmeasured period stands still instead.',
        note: 'A candidate, not a diagnosis. The beat rides the verdict line rather '
          + 'than the drawing: wrapped around the frame it would put every honest '
          + 'attempt tick inside a declared stillness.',
      }),
      entry(river, RIVER_FIXTURES, 'loopDeviation', {
        title: 'Loop-trace deviation',
        producer: 'observed[] · expected_trace(work_id)',
        refusal: 'No reference trace was ever written.',
        note: 'A deviation drawn against an assumed loop measures the assumption. The '
          + 'missing recorder is rendered at the same width as the observed track, not '
          + 'shrunk into a footnote.',
      }),
      entry(river, RIVER_FIXTURES, 'collar', {
        title: 'Collar countdown',
        producer: 'evidence.operator.deadline_at',
        refusal: 'Counting down to an invented instant is manufactured urgency.',
        note: 'It counts up, the ring is left open, and the countdown is refused. '
          + 'Elapsed is the one number here that is true and still moving.',
      }),
      entry(river, RIVER_FIXTURES, 'stripChart', {
        title: 'Phosphor strip chart',
        producer: 'source.snapshot_series(session_id)',
        refusal: 'One sample is not a series.',
        note: 'A flat line drawn from a single sample is the most common chart lie in '
          + 'software and it reads as stability. The retained sample draws as one mark '
          + 'at its own instant.',
      }),
    ],
  },

  {
    slug: 'telegraph',
    name: 'The Telegraph',
    question: 'What is waiting on me, and what if I keep sleeping',
    argument: 'One queue of human decisions, read in the order it will hurt. Cadence, '
      + 'not a bell: the tick interval IS the instrument, and a rhythm invented from a '
      + 'rank is a rhythm an operator learns and is then misled by.',
    file: 'src/components/telegraph.js',
    components: [
      entry(telegraph, TELEGRAPH_FIXTURES, 'tracker', {
        title: 'Motion-tracker cadence',
        producer: 'summary.oldest_wait_seconds',
        refusal: 'An unmeasured wait gets no cadence.',
        note: 'The tracker never tells you where the thing is; it tells you it is '
          + 'closer than it was. The per-decision ping it refuses is written on the '
          + 'drawing so its absence cannot be mistaken for an oversight.',
      }),
      entry(telegraph, TELEGRAPH_FIXTURES, 'bypass', {
        title: 'Algedonic bypass',
        producer: 'items[].request_class',
        refusal: 'A zero over a producer that never answered is the most dangerous '
          + 'number on the page.',
        note: 'The critical line goes AROUND the notification stack rather than being '
          + 'a louder badge on it, because going around is a different shape.',
      }),
      entry(telegraph, TELEGRAPH_FIXTURES, 'ceremony', {
        title: 'Acceptance ceremony',
        producer: 'ceremony.stages[].reached',
        refusal: 'No ceremony is defined for this verb.',
        note: 'The abort window is the only span on the run with a length, and it is '
          + 'stated before anything is armed. A window an operator learns the size of '
          + 'after committing is not a window.',
      }),
      entry(telegraph, TELEGRAPH_FIXTURES, 'twoState', {
        title: 'Two-state commit',
        producer: 'items[].cost_of_inaction',
        refusal: 'no producer states the cost of inaction',
        refusalText: 'UNMEASURED',
        note: 'Doing nothing is not a third outcome, it is the consequence of not '
          + 'choosing, and it gets its own line. Nothing is preselected and neither box '
          + 'is drawn warmer than the other.',
      }),
      entry(telegraph, TELEGRAPH_FIXTURES, 'tape', {
        title: 'The decision tape',
        producer: 'items[].wait.seconds',
        refusal: 'No decision is waiting on a person.',
        note: 'The rank stagger is the ranking being played back, so the eye lands on '
          + '01 because it IS first. The shutter is `intent`: the operator caused it.',
      }),
      entry(telegraph, TELEGRAPH_FIXTURES, 'queueState', {
        title: 'The queue, and its two empties',
        producer: 'notifications.summary · source.state',
        refusal: 'The board was never reached, so no all-clear is claimed.',
        note: 'A measured empty board is an all-clear and says so. A board nobody could '
          + 'reach prints no numeral at all, names the producer and the last contact, '
          + 'and claims nothing.',
      }),
    ],
  },

  {
    slug: 'thread',
    name: 'The Thread',
    question: 'One session, held steady while it changes',
    argument: 'The recurring trap here is the half-detector: every component wants two '
      + 'channels and is given one. The discipline is to draw the half that exists and '
      + 'name the half that does not, rather than reporting a whole verdict off a single lane.',
    file: 'src/components/thread.js',
    components: [
      entry(thread, THREAD_FIXTURES, 'mfd', {
        title: 'Twin MFD deck',
        producer: 'sessions[].runtime_seconds · sessions[].evidence.timeline',
        refusal: 'This readout has no producer.',
        note: 'A readout whose producer is silent renders its own unmeasured face and '
          + 'never falls back to the pane that has data. A pane quietly showing '
          + 'something else is worse than a dark one.',
      }),
      entry(thread, THREAD_FIXTURES, 'syncRatio', {
        title: 'Sync ratio',
        producer: 'telemetry.output_events · sessions[].state_revision · source.progress_history()',
        refusal: 'No series was retained for this lane.',
        note: 'A cumulative turn counter is not a rate, so reading it as "still '
          + 'emitting" would fire SPINNING on every finished session. The output lane '
          + 'stays dark and named and the verdict stays UNMEASURED.',
      }),
      entry(thread, THREAD_FIXTURES, 'hardCut', {
        title: 'Interrupt hard-cut',
        producer: 'evidence.git.changed_files',
        refusal: 'The cut is unpriced, and a free-looking cut is a lie.',
        note: 'The scar travels only when the change set it strikes through was '
          + 'measured: drawn over a hatched panel it would animate a cost nobody '
          + 'counted, inside a card that had already refused.',
      }),
      entry(thread, THREAD_FIXTURES, 'muthur', {
        title: 'MU/TH/UR query mode',
        producer: 'sessions[].state_reason · source.outcome_priors(work_id) · fleet.placement',
        refusal: 'UNABLE TO COMPUTE.',
        refusalText: 'UNABLE TO COMPUTE',
        note: 'The refusals get the same prompt and the same rule as the answers. They '
          + 'are answers, and demoting them to grey footnotes is how a console starts to '
          + 'look more capable than it is.',
      }),
      entry(thread, THREAD_FIXTURES, 'joiOverlay', {
        title: 'Joi overlay presence',
        producer: 'sessions[].heartbeat_at · inferred.blocker · inferred.failure_at',
        refusal: 'A projection is not a reading.',
        note: 'Anything derived rather than observed is lifted out of the panel and '
          + 'drawn on top of it. A badge reading "inferred" beside an identically '
          + 'weighted number is the failure with a label on it.',
      }),
      entry(thread, THREAD_FIXTURES, 'contextBurn', {
        title: 'Context-burn creep',
        producer: 'telemetry.context_percent',
        refusal: 'Context was not measured.',
        note: 'A direction, not a budget: the working area closes in from the edges. '
          + 'Nothing is drawn for an unmeasured subject, because a clean panel is '
          + 'exactly what a fresh session looks like.',
      }),
    ],
  },

  {
    slug: 'organism',
    name: 'The Organism',
    question: 'Whether the shape of the thing can hold',
    argument: 'Forrester, first: a level and a rate are different kinds of number and '
      + 'may never wear the same mark. Rasmussen, second: a system does not fail at a '
      + 'limit, it drifts toward one — so the envelope draws its boundaries or says they '
      + 'were never supplied, rather than drawing a comfortable middle.',
    file: 'src/components/organism.js',
    components: [
      entry(organism, ORGANISM_FIXTURES, 'stockFlow', {
        title: 'Stock & flow glyphs',
        producer: 'fleet.counts.* · source.throughput_1h · cost_gateway.CLAIMS[provider_charge]',
        refusal: 'A rate is not a level.',
        note: 'Even a measured rate holds still. No rate here is derived from one '
          + 'snapshot, because a rate computed from a single observation is a number '
          + 'invented by arithmetic on nothing.',
      }),
      entry(organism, ORGANISM_FIXTURES, 'envelope', {
        title: 'Safe-envelope gauge',
        producer: 'boundaries.economic · boundaries.workload · boundaries.safety',
        refusal: 'This boundary was never supplied.',
        note: 'The one picture this gauge must never make is a needle inside a green '
          + 'box. With no position inside there is nothing that could travel toward an '
          + 'edge, so the stillness is held in the motion too.',
      }),
      entry(organism, ORGANISM_FIXTURES, 'admission', {
        title: 'Cargo admission balance',
        producer: 'capacity.offered · capacity.admitted',
        refusal: 'One side of the balance was never counted.',
        note: 'A utilisation percentage hides which side of the gap moved. A beam '
          + 'cannot, and when either count is missing the beam is not drawn level — '
          + 'level is the picture of a balanced fleet.',
      }),
      entry(organism, ORGANISM_FIXTURES, 'city', {
        title: 'Placement as city',
        producer: 'fleet.placement',
        refusal: 'No placement was observed.',
        refusalText: 'DARK',
        note: 'One window per worker, never a texture, so the building cannot look '
          + 'busier than the host is. An empty host is drawn DARK rather than omitted.',
      }),
      entry(organism, ORGANISM_FIXTURES, 'garage', {
        title: 'Garage assembly',
        producer: 'fleet.loadouts · source.proof_history(model, harness)',
        refusal: 'No loadout was observed.',
        refusalText: 'NO PROOF HISTORY',
        note: 'A loadout with no proof history says so instead of implying a clean '
          + 'record. An empty column and a column of passes look identical until one of '
          + 'them is named.',
      }),
      entry(organism, ORGANISM_FIXTURES, 'strands', {
        title: 'Strand delivery routes',
        producer: 'routes[].delivered',
        refusal: 'Nothing travelled this path.',
        note: 'A strand thickens once per landing on it, so the load-bearing route '
          + 'looks like one. An undelivered route stays drawn and dashed: an undelivered '
          + 'strand is the fact.',
      }),
      entry(organism, ORGANISM_FIXTURES, 'grid', {
        title: 'Overview grid doctrine',
        producer: 'fleet.subjects',
        refusal: 'No subject was observed.',
        refusalText: 'UNMEASURED',
        note: 'An empty cell is never blank — blank reads as zero or as fine, and the '
          + 'word is what makes it a gap. This is also the widest specimen in the '
          + 'library, so it is the page’s overflow test.',
        fullWidth: true,
      }),
      entry(organism, ORGANISM_FIXTURES, 'atField', {
        title: 'AT-field write scope',
        producer: 'authority.evaluate',
        refusal: 'No reach was computed.',
        note: 'Each wider scope is drawn further out and fainter, so the escalation is '
          + 'read before the numbers are. Where no write route exists, none of this is a '
          + 'permission, and the card says so under the drawing.',
      }),
    ],
  },

  {
    slug: 'decision',
    name: 'Decision & Authority',
    question: 'Who may act, and who agreed',
    argument: 'A control that lacks its grant is not a greyed-out button: it is inert '
      + 'glass that names the authority it is missing. "Disabled" hides whether the '
      + 'block is policy, plumbing, identity, or a permit the producer never issued — '
      + 'four different problems, only one of them the operator’s.',
    file: 'src/components/decision.js · src/components/authority.js',
    components: [
      entry(decision, DECISION_FIXTURES, 'magi', {
        title: 'MAGI dissent panel',
        producer: 'seats[].standing · source.per_producer_verdicts()',
        refusal: 'A dissent panel needs its full bench.',
        note: 'A 2-1 and a 3-0 are different facts, and a console printing only the '
          + 'outcome has destroyed the more important one. No producer supplies a '
          + 'verdict per seat, so the agreement itself is ruled unmeasured.',
      }),
      entry(decision, DECISION_FIXTURES, 'glassCell', {
        title: 'Glass-cell review',
        producer: 'glass.passed[] · glass.blocked[] · glass.sightline',
        refusal: 'The glass blocks this one.',
        note: 'The subject supplies nothing about being observed. Fields the glass '
          + 'blocks stop AGAINST it, which is a shape rather than a colour, and the '
          + 'sightline runs one way only.',
      }),
      entry(decision, DECISION_FIXTURES, 'keycard', {
        title: 'Keycard access trace',
        producer: 'doors[].state',
        refusal: 'These events carry no instant.',
        note: 'You get as far as the first door held shut, and every door past it is '
          + 'dashed because nobody tried it. An access trace whose order cannot be '
          + 'established is not a trace, it is a list.',
      }),
      entry(decision, DECISION_FIXTURES, 'ice', {
        title: 'ICE / countermeasure walls',
        producer: 'walls[].state',
        refusal: 'Nothing travelled this path.',
        note: 'The layers past the one that stopped you are not layers you beat. '
          + 'Untested is neither passed nor standing, and it wears the colour of things '
          + 'nobody knows.',
      }),
      entry(decision, DECISION_FIXTURES, 'gevulot', {
        title: 'Gevulot visibility contract',
        producer: 'configuration.visibility_contracts',
        refusal: 'Nothing on this surface is readable.',
        refusalText: 'NO CONTRACT PRODUCER',
        note: 'A field with no stated contract is not a public one. The honest render '
          + 'of "nobody said" is every field UNCONTRACTED and loud, not every field '
          + 'PUBLIC.',
      }),
      entry(authority, DECISION_FIXTURES, 'dominator', {
        title: 'The Dominator control',
        producer: 'orchestrator.commands.* · sessions[].permit.*',
        refusal: 'Silence is not consent.',
        refusalText: 'PERMIT UNMEASURED',
        note: 'Three verbs against one environment so the three states stand beside '
          + 'each other. GRANTED renders a button; the other two render a span, because '
          + 'a disabled button is still a button and still invites the press.',
      }),
      entry(authority, DECISION_FIXTURES, 'ladder', {
        title: 'Command ladder',
        producer: 'orchestrator.commands.* · sessions[].permit.*',
        refusal: 'The orchestrator exposes no verbs.',
        refusalText: 'PERMIT UNMEASURED',
        note: 'The rungs an operator cannot afford stay on the list. Hiding a verb they '
          + 'lack authority for hides the shape of the system; showing it inert teaches '
          + 'the shape in one glance.',
      }),
    ],
  },

  {
    slug: 'agents',
    name: 'Agents & Comms',
    question: 'Who is running, and how much to trust it',
    argument: 'Two workers on one profile are not interchangeable, and the point of the '
      + 'motif is that you can SEE it. Trust is drawn as signal quality, never as a '
      + 'badge, and a withheld row keeps its place — silent absence teaches an operator '
      + 'the fleet is smaller than it is.',
    file: 'src/components/agents.js',
    components: [
      entry(agents, AGENTS_FIXTURES, 'individuation', {
        title: 'Tachikoma individuation',
        producer: 'telemetry.context_percent · sessions[].turns',
        refusal: 'Context was not measured.',
        note: 'Divergence is a bar per sibling against the group’s own span, so "these '
          + 'two are the same" and "these two have lived different lives" are one glance '
          + 'apart. An unmeasured worker is not an identical one.',
      }),
      entry(agents, AGENTS_FIXTURES, 'dispatch', {
        title: 'Suit-up dispatch',
        producer: 'workers[].harness · model · host · did',
        refusal: 'No model was fitted.',
        note: 'The chain goes dashed at the first part that is not fitted, so where it '
          + 'stops is the answer. A dispatch that fills an absent model with "the usual '
          + 'one" is how a fleet runs something nobody chose.',
      }),
      entry(agents, AGENTS_FIXTURES, 'oracle', {
        title: 'Oracle fragments',
        producer: 'sessions[].attempt · sessions[].state_reason · source.outcome_priors(work_id)',
        refusal: 'No priors exist to forecast from.',
        note: 'Four real facts, held apart. The space where a forecast would go is '
          + 'hatched and named: left off the panel it would read as a component that '
          + 'does not forecast rather than one that refuses to.',
      }),
      entry(agents, AGENTS_FIXTURES, 'dossier', {
        title: 'Identity disc dossier',
        producer: 'workers[].harness · model · host · did · session_id',
        refusal: 'Nothing was observed, so no identity is drawn.',
        refusalText: 'UNMEASURED',
        note: 'The disc answers "which exact thing am I about to command" — and it is '
          + 'the same helper the sibling rows draw, because a sheet that renders its own '
          + 'copy of a mark will disagree with the product.',
      }),
      entry(agents, AGENTS_FIXTURES, 'channel', {
        title: 'Channel with noise',
        producer: 'nothing — it is the trust scale itself',
        refusal: 'No producer claimed this. Trust nothing from it.',
        refusalText: 'UNATTRIBUTED',
        note: 'The four classes only teach the scale if they are seen together. Nothing '
          + 'may present an inference at the weight of an observation, and untrusted '
          + 'content is data, never a command.',
      }),
      entry(agents, AGENTS_FIXTURES, 'redaction', {
        title: 'Canonical redaction',
        producer: 'workers[].did · workers[].turns',
        refusal: 'No worker was observed.',
        refusalText: 'UNMEASURED',
        note: 'The row stays and its measures stay; exactly one mark says which part was '
          + 'withheld. Silent absence is the failure mode.',
      }),
      entry(agents, AGENTS_FIXTURES, 'killmail', {
        title: 'Killmail receipt',
        producer: 'cost_gateway.CLAIMS[provider_charge]',
        refusal: 'No canonical charge record is supplied.',
        note: 'UNPRICED is a truthful value, not a placeholder. A receipt that guessed '
          + 'would be worse than no receipt — it would be the first number anyone put in '
          + 'a spreadsheet.',
      }),
    ],
  },

  {
    slug: 'instruments',
    name: 'Instruments',
    question: 'The drawings big enough to be pages of their own',
    argument: 'Both of these are the library’s only ambient loops, and both gate theirs '
      + 'on a measured interval from the producer rather than a house tempo. A globe '
      + 'turning over a dead source is the easiest lie to ship, because a turning globe '
      + 'looks like health.',
    file: 'src/components/gauge.js · src/components/globe.js',
    components: [
      entry({ gauge }, INSTRUMENT_FIXTURES, 'gauge', {
        title: 'The trinity dial',
        producer: 'source.proof_sealed_count()',
        refusal: 'Quantity was not measured.',
        note: 'The markup carries the arc at its full measured extent, so with the '
          + 'runtime absent or settled the reader still sees the correct ratio rather '
          + 'than an empty ring. Settling is the rendered page.',
      }),
      entry({ globe }, INSTRUMENT_FIXTURES, 'globe', {
        title: 'The globe, and the mesh that may not turn',
        producer: 'fleet.endpoints · source.refresh_ms',
        refusal: 'No interval was measured.',
        note: 'The mesh is canvas because a few hundred arcs redrawn every frame is '
          + 'what canvas is for; the endpoints are real DOM so they can be marked, '
          + 'hit-tested and read. The turn answers to `traffic`.',
        post: paintGlobe,
        fullWidth: true,
      }),
    ],
  },
];

/** Exported functions that are not specimens. Named with a reason, because the
 * completeness test in `test/app-registry.test.mjs` fails on any export that is
 * neither a component nor explicitly accounted for here — which is what makes
 * "every component is reachable" a checked claim rather than a hope. */
export const NON_COMPONENTS = {
  esc: 'HTML escaping helper in card.js.',
  card: 'the deck wrapper every bounded specimen shares, not a specimen itself.',
  wrapped: 'SVG text wrapping helper; SVG text does not wrap.',
  cadence: 'maps a measured wait to a tick interval in telegraph.js.',
  algedonic: 'predicate: whether a decision may not be snoozed.',
  evaluate: 'grades a verb against an environment into one of three authority states.',
  control: 'renders one graded verb; drawn by both dominator and ladder.',
  disc: 'the identity mark drawn inside individuation, dossier and redaction.',
  trustOf: 'resolves a declared trust class, or UNATTRIBUTED. Never a generous default.',
  paintGlobe: 'paints the globe mesh after mount; needs a document, so it is a post-render hook.',
};
