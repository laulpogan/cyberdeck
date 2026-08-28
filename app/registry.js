// The registry: every component the app renders, its home family, the
// measured fixture it is given, and the exact fields the evidence toggle
// may remove. The `refuse` lines are quoted from each component's own doc
// comment -- the library's own sentences are the copy, not a paraphrase.

import { attrs, intent, still } from '../src/marks.js';
import { card } from '../src/components/card.js';
import * as fieldC from '../src/components/field.js';
import * as riverC from '../src/components/river.js';
import * as telegraphC from '../src/components/telegraph.js';
import * as threadC from '../src/components/thread.js';
import * as organismC from '../src/components/organism.js';
import * as decisionC from '../src/components/decision.js';
import * as authorityC from '../src/components/authority.js';
import * as agentsC from '../src/components/agents.js';
import { gauge } from '../src/components/gauge.js';
import { globe, paintGlobe } from '../src/components/globe.js';
import { FIXTURES } from './fixtures/index.js';
import { clone, setPath, same, getPath } from './util.js';

export const FAMILIES = [
  { id: 'field', name: 'THE FIELD', question: 'Looking at a whole fleet at once',
    argument: 'Every component here takes a model and returns a bounded drawing: '
      + 'read the measurement, decide whether there is one, and either draw it '
      + 'with a mark that names where it came from or refuse and say why. '
      + 'There is no third branch.' },
  { id: 'river', name: 'THE RIVER', question: 'Time, and how little of it a fleet keeps',
    argument: 'A family built to draw time is mostly a family drawing the shape '
      + 'of a hole, and the discipline is that each one draws its OWN hole and '
      + 'names the series it wanted, rather than six charts printing the same shrug.' },
  { id: 'telegraph', name: 'THE TELEGRAPH', question: 'What is waiting on me, and what if I keep sleeping',
    argument: 'Cadence, not a bell: the tick interval IS the instrument, and run '
      + 'it over a wait nobody took and it is the purest fake motion a console '
      + 'can produce. And one channel that cannot be snoozed, drawn going '
      + 'AROUND the notification stack rather than a louder badge on it.' },
  { id: 'thread', name: 'THE THREAD', question: 'One session, held steady while it changes',
    argument: 'The recurring trap is the half-detector. Every component here '
      + 'wants two channels and is given one, and the discipline is to draw the '
      + 'half that exists and name the half that does not, rather than '
      + 'reporting a whole verdict off a single lane.' },
  { id: 'organism', name: 'THE ORGANISM', question: 'Whether the shape of the thing can hold',
    argument: 'Forrester\'s rule violated everywhere in ops tooling: a LEVEL and '
      + 'a RATE are different kinds of number and may never wear the same mark. '
      + 'And Rasmussen\'s: a system does not fail at a limit, it drifts toward '
      + 'one, so the envelope draws its boundaries or says they were never '
      + 'supplied.' },
  { id: 'decision', name: 'DECISION & AUTHORITY', question: 'Who may act, and who agreed',
    argument: 'A control that lacks its grant is not a greyed-out button. It is '
      + 'inert glass that NAMES the authority it is missing. The rest of the '
      + 'family is about the decision rather than the verb: who judged, what '
      + 'could be seen while judging, which key was turned, what was tested.' },
  { id: 'agents', name: 'AGENTS & COMMS', question: 'Who is running, and how much to trust it',
    argument: 'Trust is drawn as signal quality, never as a badge, and a '
      + 'withheld row keeps its place: silent absence teaches an operator the '
      + 'fleet is smaller than it is, and there is no way to notice from inside '
      + 'the list.' },
  { id: 'instruments', name: 'INSTRUMENTS', question: 'The dial and the globe',
    argument: 'The two shapes too large for a card. Both carry the same '
      + 'contract: the arc is a measured ratio or it does not sweep; the globe '
      + 'turns on a measured refresh interval or it holds still.' },
];

const W = (key, family, fn, exportName, file, name, refuse, controls, extra = {}) =>
  ({ key, family, fn, exportName, file, name, refuse, controls, ...extra });

export const SPECS = {
  // ---------------------------------------------------------------- FIELD
  scan: W('scan', 'field', fieldC.scanOverlay, 'scanOverlay', 'field.js',
    'Kiroshi scan overlay',
    'An annotation drawn to an empty field claims a reading nobody took.',
    [{ label: 'annotations read', paths: ['subject.authority', 'subject.blocked'], off: null },
     { label: 'change timestamped', paths: ['subject.changed_at'], off: null }]),
  'tri-vision': W('tri-vision', 'field', fieldC.triVision, 'triVision', 'field.js',
    'Tri-vision lens toggle',
    'Unmeasured under this lens is hatched, not left blank: a blank cell reads '
      + 'as a quiet one, and quiet is a reading.',
    [{ label: 'cells read under every lens',
      paths: ['cells[*].health', 'cells[*].cost', 'cells[*].authority'], off: null }]),
  crush: W('crush', 'field', fieldC.scaleCrush, 'scaleCrush', 'field.js',
    'Fleet-wall scale crush',
    'The board was never counted, so there is no wall — an empty grid drawn for '
      + 'an uncounted board claims a measurement nobody made.',
    [{ label: 'board counted', paths: ['count'], off: null }]),
  coverage: W('coverage', 'field', fieldC.coverage, 'coverage', 'field.js',
    'Coverage as territory',
    'Terrain quietly left flat is indistinguishable from terrain measured as '
      + 'flat, so unmeasured ground is drawn as a boxed, hatched void.',
    [{ label: 'contours sampled', paths: ['contours'], off: null }]),
  chips: W('chips', 'field', fieldC.chipBudget, 'chipBudget', 'field.js',
    'HUD chip budget',
    'Unpriced is hatched rather than empty: an empty bar is a spend of zero, '
      + 'and nobody measured a spend of zero.',
    [{ label: 'chips priced', paths: ['chips[*].cost'], off: null }]),
  radar: W('radar', 'field', fieldC.radar, 'radar', 'field.js',
    'Radar freshness sweep',
    'An overdue poll refuses to sweep rather than wrapping, since a wrap would '
      + 'erase the finding.',
    [{ label: 'poll interval measured', paths: ['pollElapsed', 'pollPeriod'], off: null },
     { label: 'contacts aged', paths: ['contacts[*].age_seconds', 'contacts[*].band'], off: null },
     { label: 'source live', paths: ['sourceState'], off: 'unavailable' }]),
  needles: W('needles', 'field', fieldC.needleField, 'needleField', 'field.js',
    'Magnetic needle field',
    'A worker with no measured constraint gets a hollow ring, not a needle '
      + 'pointing somewhere plausible.',
    [{ label: 'constraints reported', paths: ['workers[*].bearing'], off: null }]),
  'standard-sheet': W('standard-sheet', 'field', fieldC.standardSheet, 'standardSheet', 'field.js',
    'Semiotic standard sheet',
    'A legend is not a reading: nothing on it is measured, so nothing on it may '
      + 'move. This card declares its own stillness in both worlds.',
    [{ label: 'legend enumerated', paths: ['glyphs'], off: [] }]),

  // ---------------------------------------------------------------- RIVER
  lanes: W('lanes', 'river', riverC.river, 'river', 'river.js',
    'The phosphor oscilloscope',
    'A lane with no events does not draw, and says so. It is drawn as a lane '
      + 'with NO RUN OBSERVED rather than omitted — an absent row and an empty '
      + 'row must not look alike.',
    [{ label: 'events retained', paths: ['lanes[0].events', 'lanes[1].events'], off: [] }],
    { wide: true }),
  esper: W('esper', 'river', riverC.esperDive, 'esperDive', 'river.js',
    'ESPER evidence dive',
    'The honest dive descends only as far as the producer retains, then draws '
      + 'the floor AS A FRAME rather than leaving it off the end.',
    [{ label: 'levels below subject', paths: ['levels[1].value', 'levels[2].value'], off: null }]),
  splice: W('splice', 'river', riverC.tapeSplice, 'tapeSplice', 'river.js',
    'Tape splice & stitch',
    'A splice you cannot see is an edit presented as a recording.',
    [{ label: 'attempt counted', paths: ['attempt'], off: null }]),
  oscillation: W('oscillation', 'river', riverC.oscillation, 'oscillation', 'river.js',
    'Oscillation detector',
    'It detects oscillation and it may not oscillate: a rhythm needs a period, '
      + 'nobody keeps one, so the detector that would hunt prettily stands '
      + 'still instead.',
    [{ label: 'attempt counted', paths: ['attempt'], off: null }]),
  deviation: W('deviation', 'river', riverC.loopDeviation, 'loopDeviation', 'river.js',
    'Loop-trace deviation',
    'A deviation drawn against an assumed loop measures the assumption.',
    [{ label: 'events retained', paths: ['observed'], off: [] }]),
  collar: W('collar', 'river', riverC.collar, 'collar', 'river.js',
    'Collar countdown',
    'Counting down to an invented instant is manufactured urgency, and '
      + 'manufactured urgency is how a console trains an operator to ignore it.',
    [{ label: 'elapsed measured', paths: ['elapsedSeconds'], off: null },
     { label: 'wait measured', paths: ['waitingSeconds'], off: null },
     { label: 'source live', paths: ['sourceState'], off: 'unavailable' }]),
  strip: W('strip', 'river', riverC.stripChart, 'stripChart', 'river.js',
    'Phosphor strip chart',
    'One sample is not a series. A flat line drawn from a single sample is the '
      + 'most common chart lie in software, and it reads as stability.',
    [{ label: 'sample retained', paths: ['sample'], off: null }]),

  // ------------------------------------------------------------ TELEGRAPH
  tracker: W('tracker', 'telegraph', telegraphC.tracker, 'tracker', 'telegraph.js',
    'Motion-tracker cadence',
    'A rhythm invented from a rank is a rhythm an operator learns and is then '
      + 'misled by. No measured wait, no cadence.',
    [{ label: 'oldest wait measured', paths: ['oldestWaitSeconds'], off: null },
     { label: 'source live', paths: ['sourceState'], off: 'unavailable' }]),
  bypass: W('bypass', 'telegraph', telegraphC.bypass, 'bypass', 'telegraph.js',
    'Algedonic bypass',
    'A zero over a producer that never answered is the most dangerous number '
      + 'on the page.',
    [{ label: 'algedonic counted', paths: ['openCount'], off: null }]),
  ceremony: W('ceremony', 'telegraph', telegraphC.ceremony, 'ceremony', 'telegraph.js',
    'Acceptance ceremony',
    'An unreached run is drawn whole and entered nowhere: an armed-looking '
      + 'first gate over a seam that does not exist is the cruellest thing this '
      + 'component could do.',
    [{ label: 'gates entered', paths: ['stages[0].reached', 'stages[1].reached'], off: false }]),
  'two-state': W('two-state', 'telegraph', telegraphC.twoState, 'twoState', 'telegraph.js',
    'Two-state commit',
    'Doing nothing is a third fact, not a third button — and the cost of '
      + 'inaction is the line nobody writes down.',
    [{ label: 'cost of inaction stated', paths: ['doNothing'], off: null }]),
  tape: W('tape', 'telegraph', telegraphC.tape, 'tape', 'telegraph.js',
    'The decision tape',
    'Ranked by the order it will hurt, not by arrival. On a dead feed every '
      + 'clock stops and says when it stopped.',
    [{ label: 'waits measured', paths: ['items[*].wait_seconds'], off: null },
     { label: 'source live', paths: ['sourceState'], off: 'unavailable' }]),
  queue: W('queue', 'telegraph', telegraphC.queueState, 'queueState', 'telegraph.js',
    'The queue, and its two empties',
    'Measured empty is an all-clear, and it is allowed to say so. A board '
      + 'nobody could reach claims nothing.',
    [{ label: 'board reached', paths: ['sourceState'], off: 'unavailable' },
     { label: 'open counted', paths: ['openCount'], off: null }]),

  // --------------------------------------------------------------- THREAD
  mfd: W('mfd', 'thread', threadC.mfd, 'mfd', 'thread.js',
    'Twin MFD deck',
    'A readout whose producer is silent renders its own unmeasured face; it '
      + 'never falls back to a readout that does have data.',
    [{ label: 'pane B has a producer', paths: ['panes[1].value'], off: null }]),
  sync: W('sync', 'thread', threadC.syncRatio, 'syncRatio', 'thread.js',
    'Sync ratio',
    'Reading "turns > 0" as "still emitting" would fire SPINNING on every '
      + 'finished session. The output lane is drawn dark, named, and the '
      + 'verdict stays honest.',
    [{ label: 'output channel observed', paths: ['output.known'], off: false }]),
  cut: W('cut', 'thread', threadC.hardCut, 'hardCut', 'thread.js',
    'Interrupt hard-cut',
    'The cut is unpriced, and a free-looking cut is a lie.',
    [{ label: 'change set measured', paths: ['changed', 'inFlight', 'attempt', 'branch'], off: null }]),
  muthur: W('muthur', 'thread', threadC.muthur, 'muthur', 'thread.js',
    'MU/TH/UR query mode',
    'The refusals get the same prompt and the same rule as the answers. They '
      + 'ARE answers, and demoting them to grey footnotes is how a console '
      + 'starts to look more capable than it is.',
    [{ label: 'answers answerable', paths: ['answers[0].answer', 'answers[1].answer', 'answers[4].answer'], off: null }]),
  joi: W('joi', 'thread', threadC.joiOverlay, 'joiOverlay', 'thread.js',
    'Joi overlay presence',
    'A badge reading "inferred" beside an identically weighted number is '
      + 'exactly the failure this rule prevents, with a label on it. An '
      + 'overlay is not a reading.',
    [{ label: 'observed values', paths: ['rows[0].value', 'rows[1].value', 'rows[2].value'], off: null }]),
  burn: W('burn', 'thread', threadC.contextBurn, 'contextBurn', 'thread.js',
    'Context-burn creep',
    'A clean panel is exactly what a fresh session looks like, so a worker '
      + 'whose telemetry is absent must not be given one.',
    [{ label: 'context measured', paths: ['percent'], off: null }]),

  // ------------------------------------------------------------- ORGANISM
  'stock-flow': W('stock-flow', 'organism', organismC.stockFlow, 'stockFlow', 'organism.js',
    'Stock & flow glyphs',
    'No rate is ever derived from one snapshot. A rate computed from a single '
      + 'observation is a number invented by arithmetic on nothing.',
    [{ label: 'levels measured', paths: ['levels[*].value'], off: null },
     { label: 'arrivals series exists', paths: ['rates[0].value'], off: null }]),
  envelope: W('envelope', 'organism', organismC.envelope, 'envelope', 'organism.js',
    'Safe-envelope gauge',
    'A comfortable middle is the failure this gauge prevents — an envelope '
      + 'with invented edges is worse than no envelope, because it looks safe.',
    [{ label: 'position measured', paths: ['position'], off: null }]),
  admission: W('admission', 'organism', organismC.admission, 'admission', 'organism.js',
    'Cargo admission balance',
    'When either count is missing the beam is not drawn at all, rather than '
      + 'drawn level — level is the picture of a balanced fleet.',
    [{ label: 'taken counted', paths: ['taken'], off: null }]),
  city: W('city', 'organism', organismC.city, 'city', 'organism.js',
    'Placement as city',
    'An empty host is drawn DARK rather than omitted — a host that vanished '
      + 'when it emptied would take the evidence of the starvation with it.',
    [{ label: 'hosts placed', paths: ['hosts[0].workers', 'hosts[3].workers'], off: [] }]),
  garage: W('garage', 'organism', organismC.garage, 'garage', 'organism.js',
    'Garage assembly',
    'A loadout with no proof history says so instead of implying a clean '
      + 'record.',
    [{ label: 'proof history exists', paths: ['loadouts[0].proof'], off: null }]),
  strands: W('strands', 'organism', organismC.strands, 'strands', 'organism.js',
    'Strand delivery routes',
    'A route with no delivery is drawn dashed rather than left off. An '
      + 'undelivered strand is the fact.',
    [{ label: 'deliveries landed', paths: ['routes[0].delivered', 'routes[1].delivered', 'routes[2].delivered'], off: false }]),
  grid: W('grid', 'organism', organismC.grid, 'grid', 'organism.js',
    'Overview grid doctrine',
    'An empty cell is never blank. Blank reads as zero or as fine; the word is '
      + 'what makes it a gap.',
    [{ label: 'proof and ctx recorded', paths: ['rows[*].proof', 'rows[*].ctx'], off: null }]),
  'at-field': W('at-field', 'organism', organismC.atField, 'atField', 'organism.js',
    'AT-field write scope',
    'Where no write route exists, none of these rings is a permission.',
    [{ label: 'reach computed', paths: ['scopes'], off: [] }]),

  // --------------------------------------------------- DECISION & AUTHORITY
  magi: W('magi', 'decision', decisionC.magi, 'magi', 'decision.js',
    'MAGI dissent panel',
    'A dissent panel that invents a 3-0 out of one collapsed number is the '
      + 'exact failure it exists to prevent.',
    [{ label: 'seats spoke', paths: ['seats[0].standing', 'seats[1].standing'], off: 'silent' },
     { label: 'state judged by someone', paths: ['collapsedState'], off: null }]),
  glass: W('glass', 'decision', decisionC.glassCell, 'glassCell', 'decision.js',
    'Glass-cell review',
    'The fields that pass cross the pane; the ones it blocks stop AGAINST it. '
      + 'A window in one direction only.',
    [{ label: 'fields cross the pane', paths: ['passed'], off: [] },
     { label: 'blocked fields named', paths: ['blocked'], off: [] }]),
  keycard: W('keycard', 'decision', decisionC.keycard, 'keycard', 'decision.js',
    'Keycard access trace',
    'An access trace whose order cannot be established is not a trace — it is '
      + 'a list.',
    [{ label: 'doors tried', paths: ['doors[0].state', 'doors[1].state', 'doors[2].state', 'doors[3].state', 'doors[4].state'], off: 'not_reached' },
     { label: 'events carry instants', paths: ['unstamped'], off: 3 }]),
  ice: W('ice', 'decision', decisionC.ice, 'ice', 'decision.js',
    'ICE / countermeasure walls',
    'NOT REACHED is its own state, drawn in the cannot-see colour, because it '
      + 'is a thing nobody knows. Untested is neither passed nor standing.',
    [{ label: 'walls tested', paths: ['walls[0].state', 'walls[1].state', 'walls[2].state'], off: 'not_reached' }]),
  gevulot: W('gevulot', 'decision', decisionC.gevulot, 'gevulot', 'decision.js',
    'Gevulot visibility contract',
    'A field with no stated contract is not a public one.',
    [{ label: 'contracts stated', paths: ['fields[*].contract'], off: null }]),
  dominator: W('dominator', 'decision', authorityC.dominator, 'dominator', 'authority.js',
    'The Dominator control',
    'A control that lacks its grant is inert glass that NAMES the authority it '
      + 'is missing.',
    [{ label: 'permits measured', paths: ['verbs[0].permit', 'verbs[1].permit'], off: null },
     { label: 'deck in an acting mode', paths: ['env.mode'], off: 'observe' }]),
  ladder: W('ladder', 'decision', authorityC.ladder, 'ladder', 'authority.js',
    'Command ladder',
    'The rungs you cannot afford stay on the list. Hiding a verb an operator '
      + 'lacks authority for hides the system\'s shape.',
    [{ label: 'permits measured', paths: ['verbs[*].permit'], off: null },
     { label: 'adapter reachable', paths: ['env.adapter'], off: false }]),

  // ----------------------------------------------------------- AGENTS
  disc: W('disc', 'agents', (model) => card('disc', 'Identity disc',
      agentsC.disc(model.worker, 96),
      { note: 'The ring is its harness, the core is its model, the notch is its host.' }),
    'disc', 'agents.js', 'Identity disc',
    'The disc answers "which exact thing am I about to command" — and a '
      + 'withheld one is drawn WITHHELD, not blank.',
    [{ label: 'identity observed', paths: ['worker.redacted'], off: true }]),
  individuation: W('individuation', 'agents', agentsC.individuation, 'individuation', 'agents.js',
    'Tachikoma individuation',
    'An unmeasured worker is not an identical one. And a withheld identity '
      + 'does not get to arrive.',
    [{ label: 'context measured', paths: ['siblings[0].context_percent', 'siblings[1].context_percent'], off: null },
     { label: 'identities declared', paths: ['siblings[2].redacted'], off: true }]),
  dispatch: W('dispatch', 'agents', agentsC.dispatch, 'dispatch', 'agents.js',
    'Suit-up dispatch',
    'A launch with a filled-in blank is a launch nobody authorised.',
    [{ label: 'parts fitted', paths: ['workers[1].model'], off: null }]),
  oracle: W('oracle', 'agents', agentsC.oracle, 'oracle', 'agents.js',
    'Oracle fragments',
    'A fragment must never borrow the weight of a measurement. The space a '
      + 'forecast would occupy is drawn empty.',
    [{ label: 'fragments held', paths: ['fragments[0].value', 'fragments[1].value'], off: null }]),
  dossier: W('dossier', 'agents', agentsC.dossier, 'dossier', 'agents.js',
    'Identity disc dossier',
    'A row whose producer is silent says so, rather than leaving the disc to '
      + 'imply a complete identity.',
    [{ label: 'producer named the rows', paths: ['worker.model', 'worker.host'], off: null }]),
  channel: W('channel', 'agents', agentsC.channel, 'channel', 'agents.js',
    'Channel with noise',
    'Nothing may present an inference at the weight of an observation. The '
      + 'four classes only teach the scale if they are seen together.',
    [{ label: 'classes enumerated', paths: ['classes'], off: [] }]),
  redaction: W('redaction', 'agents', agentsC.redaction, 'redaction', 'agents.js',
    'Canonical redaction',
    'Silent absence is the failure mode: the row stays and its measures stay.',
    [{ label: 'identity declared', paths: ['workers[0].redacted'], off: true },
     { label: 'measures recorded', paths: ['workers[2].turns'], off: null }]),
  killmail: W('killmail', 'agents', agentsC.killmail, 'killmail', 'agents.js',
    'Killmail receipt',
    'A receipt that guessed would be the first number anyone put in a '
      + 'spreadsheet.',
    [{ label: 'attempt recorded as lost', paths: ['receipt'], off: null }]),

  // -------------------------------------------------------- INSTRUMENTS
  gauge: W('gauge', 'instruments', gauge, 'gauge', 'gauge.js',
    'The trinity dial',
    'A ratio with no measurement behind it does not sweep to zero — it '
      + 'declines to sweep, and says why.',
    [{ label: 'ratio measured', paths: ['measured'], off: false }]),
  globe: W('globe', 'instruments', globe, 'globe', 'globe.js',
    'The globe',
    'An unattended globe turning over a dead source is exactly the lie the '
      + 'library exists to refuse — and it is the easiest one to ship, because '
      + 'a turning globe looks like health.',
    [{ label: 'refresh interval measured', paths: ['periodSeconds'], off: null },
     { label: 'source live', paths: ['sourceState'], off: 'unavailable' }],
    { wide: true, afterMount: paintGlobe }),
};

export const FAMILY_BY_ID = Object.fromEntries(FAMILIES.map(f => [f.id, f]));

export function modelFor(spec, evidenceOn, disabled = new Set()) {
  const base = clone(FIXTURES[spec.key]);
  const off = evidenceOn ? spec.controls.filter((_, i) => disabled.has(i))
                        : spec.controls;
  return off.reduce((model, control) =>
    control.paths.reduce((m, path) => setPath(m, path, control.off), model), base);
}

// A control reads ON when any path it owns currently holds something
// other than the off value.
export function controlOn(spec, model, index) {
  const control = spec.controls[index];
  return control.paths.some((path) => !pathOff(model, path, control.off));
}

function pathOff(model, path, off) {
  const value = getPath(model, path);
  if (path.includes('[*]')) {
    return Array.isArray(value) && value.length > 0
      && value.every((each) => same(each, off));
  }
  return same(value, off);
}

export const EXPORT_LINE = "import { %n } from 'cyberdeck-ui/components';";

export { attrs, intent };
