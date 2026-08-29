// AGENTS AND COMMS -- who is running, and how much to trust it.
//
// Two workers on the same profile are not interchangeable. They started
// at the same place and then one of them burned 82% of its context
// arguing with a migration while the other has barely spoken. Most
// surfaces treat them as rows of a table with the same shape, which is
// exactly how an operator ends up retrying the wrong one.
//
// The Tachikoma are identical machines that diverge because their
// experience diverges, and the whole point is that you can SEE it.
//
// Two rules run through this family. TRUST IS DRAWN AS SIGNAL QUALITY,
// never as a badge -- a badge reading "inferred" reads as metadata, and a
// noisy trace reads as a warning, which is what it is. And A WITHHELD ROW
// KEEPS ITS PLACE: silent absence teaches an operator the fleet is
// smaller than it is, and there is no way to notice from inside the list.

import { frame, line, dot, rect, text, hatched } from '../draw.js';
import { count, level, still, attrs } from '../marks.js';
import { card, esc, wrapped, W, H , refusalFrame } from './card.js';

const PAD = 12;
const SPAN = W - PAD * 2;
export const WITHHELD = 'WITHHELD';
export const UNPRICED = 'UNPRICED';

/** Trust classes, cleanest first. The integer is the noise level the
 * channel draws; zero is a clean trace. */
export const TRUST = [
  ['CANONICAL', 0, 'Observed by the canonical producer.'],
  ['DERIVED', 1, 'Computed from canonical evidence, not observed directly.'],
  ['INFERRED', 2, 'A guess with a stated basis. Never an observation.'],
  ['UNATTRIBUTED', 3, 'No producer claimed this. Trust nothing from it.'],
];
const NOISE = Object.fromEntries(TRUST.map(([name, n]) => [name, n]));

/** The declared trust class, or UNATTRIBUTED. Never a generous default. */
export const trustOf = (declared) =>
  (typeof declared === 'string' && NOISE[declared.trim().toUpperCase()] !== undefined)
    ? declared.trim().toUpperCase() : 'UNATTRIBUTED';

/** A trust trace. Deterministic jitter, no randomness, so one trust class
 * always draws the same trace and two captures can be compared. */
function trace(trust, width = 96, height = 16) {
  const noise = NOISE[trust] ?? 3;
  const points = [];
  for (let step = 0; step < 25; step++) {
    const wobble = ((step * 7919) % (1 + noise * 6)) - noise * 3;
    points.push(`${(step * width / 24).toFixed(1)},${(height / 2 + wobble * .9).toFixed(1)}`);
  }
  return `<svg class="cd-ag-trace" data-noise="${noise}" viewBox="0 0 ${width} ${height}"
    width="${width}" height="${height}" role="img" aria-label="${esc(trust)}"
    ><polyline points="${points.join(' ')}" fill="none" stroke="currentColor"
    stroke-width="1.4"/></svg>`;
}

/** The identity disc: the ring is its harness, the core is its model, the
 * notch is its host.
 *
 * Not a decoration. It is the one place the question "which exact thing
 * am I about to command" is answered in full -- and the same helper draws
 * it everywhere, because a sheet that renders its own copy of a mark is a
 * sheet that will disagree with the product without anyone noticing. */
export function disc(worker, size = 46) {
  if (worker.redacted) {
    return `<svg class="cd-ag-disc" data-redacted="1" viewBox="-24 -24 48 48"
      width="${size}" height="${size}" role="img" aria-label="Identity withheld">
      <circle cx="0" cy="0" r="21" class="cd-ag-ring"/>
      <line x1="-16" y1="16" x2="16" y2="-16" class="cd-ag-strike"/>
      <text x="0" y="4" text-anchor="middle" class="cd-ag-disc-word">WITHHELD</text></svg>`;
  }
  return `<svg class="cd-ag-disc" viewBox="-24 -24 48 48" width="${size}"
    height="${size}" role="img" aria-label="${esc(
      `${worker.model || 'MODEL UNMEASURED'} on ${worker.host || 'HOST UNMEASURED'}`)}">
    <circle cx="0" cy="0" r="21" class="cd-ag-ring"/>
    <circle cx="0" cy="0" r="12" class="cd-ag-core"/>
    <rect x="-2.5" y="-23" width="5" height="7" class="cd-ag-notch"/></svg>`;
}

const measure = (label, value) => {
  const unknown = value === null || value === undefined || value === WITHHELD;
  return `<span class="cd-ag-measure"${unknown ? ' data-unmeasured="1"' : ''}>`
    + `<b>${esc(label)}</b>${esc(unknown ? (value === WITHHELD ? WITHHELD : 'UNMEASURED') : value)}</span>`;
};

/** Tachikoma individuation -- siblings, and the lives they have lived.
 *
 * Workers sharing a profile are drawn as a group, each carrying the
 * measures that make it itself. Divergence is a bar per sibling against
 * the GROUP'S OWN span, so "these two are the same" and "these two have
 * lived different lives" are one glance apart.
 *
 * A sibling whose telemetry is absent gets no bar and says so. An
 * unmeasured worker is not an identical one. And a withheld worker does
 * not get to arrive: redaction is a deliberate hole in the record, and an
 * entrance would give the hole the same presence as the workers who are
 * actually there. */
export function individuation({ profile, siblings,
                                cite = 'telemetry.context_percent' }) {
  if (!siblings || !siblings.length) {
    // The tank, alone. The profile IS observed -- it is the subject of the question -- so the
    // refusal draws its identity disc and says the rest was not seen. An empty frame would
    // hide the one thing this console actually knows, and the disc is the shape the finding
    // is about: this tank, unaccompanied.
    return card('individuation', 'Tachikoma individuation',
      refusalFrame({
        word: 'NO SIBLING OBSERVED',
        ghost: [`<g transform="translate(30,77)">${disc(profile || {})}</g>`],
      }),
      { mark: still('no sibling was observed on this profile') });
  }
  const burns = siblings.map((s) => s.context_percent)
    .filter((v) => v !== null && v !== undefined);
  const low = burns.length ? Math.min(...burns) : null;
  const high = burns.length ? Math.max(...burns) : null;
  const diverged = low !== null && high - low >= 20;
  const rows = siblings.map((worker, i) => {
    const value = worker.context_percent;
    const known = value !== null && value !== undefined && low !== null;
    const width = high - low;
    const offset = !known ? 0 : (width <= 0 ? 0 : 100 * (value - low) / width);
    const burn = known
      // The numeral rides the edge it describes. Parked at the end of the
      // track it read as a value near the maximum whatever the fill said,
      // and 12% and 82% became indistinguishable at a glance.
      ? `<span class="cd-ag-burn" data-measured="1"${attrs(
          level(offset, 100, { measured: true, cite }))} data-level-axis="slide">
          <span class="cd-ag-track"><i style="left:${offset.toFixed(1)}%"
            ><em>${Math.trunc(value)}%</em></i></span></span>`
      : `<span class="cd-ag-burn" data-measured="0"${attrs(
          still('context was not measured'))}><i>CONTEXT UNMEASURED</i></span>`;
    // The stillness is about ARRIVAL, not about the measures. Wrapped
    // around the whole row it stilled a context burn that was genuinely
    // measured -- and a withheld identity does not make a reading
    // unmeasured. The row keeps its measures; only the entrance is
    // refused, so the mark sits on the thing that would have entered.
    return `<article class="cd-ag-sibling" data-redacted="${worker.redacted ? 1 : 0}">
      <span class="cd-ag-arrival"${attrs(worker.redacted
        ? still('this worker is withheld, so it does not arrive')
        : count(i, siblings.length))}>${disc(worker, 38)}</span>
      <div class="cd-ag-body">
        <b>${esc(worker.title || worker.session_id || 'UNMEASURED')}</b>
        <span class="cd-ag-ident">${esc(worker.harness || 'HARNESS UNMEASURED')} · ${
          esc(worker.host || 'HOST UNMEASURED')}</span>
        <div class="cd-ag-measures">${measure('TURNS', worker.turns)}${
          measure('TOOLS', worker.tool_calls)}</div>
        ${burn}
      </div></article>`;
  });
  const word = low === null ? 'DIVERGENCE UNMEASURED'
    : `${diverged ? 'DIVERGED' : 'CONVERGENT'} · CONTEXT ${low}%-${high}%`;
  return card('individuation', 'Tachikoma individuation',
    `<div class="cd-ag-group" data-diverged="${diverged ? 1 : 0}">
      <header><b>${esc(profile)}</b>
        <span data-measured="${low === null ? 0 : 1}">${esc(word)}</span></header>
      ${rows.join('')}</div>`,
    { note: 'An unmeasured worker is not an identical one.' });
}

/** The parts a dispatch fits, and the order it fits them in. */
export const PARTS = [['HARNESS', 'harness'], ['MODEL', 'model'],
                      ['HOST', 'host'], ['IDENTITY', 'did']];

/** Suit-up dispatch -- every part, fitted or missing, before launch.
 *
 * Launch is inert while any part is missing. The failure this prevents is
 * the quiet default: a dispatch that fills an absent model with "the
 * usual one" and launches, which is how a fleet ends up running something
 * nobody chose.
 *
 * The chain goes dashed at the first part that is not fitted, so where it
 * stops is the answer. */
export function dispatch({ workers }) {
  if (!workers || !workers.length) {
    return card('dispatch', 'Suit-up dispatch', '',
      { mark: still('no worker was offered for dispatch') });
  }
  // A gutter for the worker names. Drawn over the first column they
  // collided with its own header.
  const gutter = 54;
  const step = (SPAN - gutter) / PARTS.length;
  const gap = Math.min(30, (H - 60) / workers.length);
  const g = [];
  workers.forEach((worker, row) => {
    const y = 30 + row * gap;
    let broken = false;
    PARTS.forEach(([label, key], i) => {
      const value = worker[key];
      const fitted = Boolean(value) && value !== WITHHELD;
      if (!fitted) broken = true;
      const x = PAD + gutter + i * step + step / 2;
      g.push(`<g class="cd-ag-part" data-fitted="${fitted ? 1 : 0}"${
        attrs(fitted && !broken
          ? count(i, PARTS.length)
          : still(fitted ? 'a later part is missing' : `no ${label.toLowerCase()} was fitted`))}>`
        + dot(x, y, 3.4, { hollow: !fitted }) + '</g>');
      if (i) {
        g.push(`<g class="cd-ag-link" data-fitted="${fitted && !brokenBefore(worker, i) ? 1 : 0}">`
          + line(x - step, y, x, y, { width: 1.4,
              dashed: !fitted || brokenBefore(worker, i) }) + '</g>');
      }
    });
    g.push(text(PAD, y + 3, worker.session_id || `WORKER ${row + 1}`,
      { size: 6.5, opacity: '.65' }));
  });
  PARTS.forEach(([label], i) => {
    g.push(text(PAD + gutter + i * step + step / 2, 18, label,
      { size: 6.5, anchor: 'middle', opacity: '.7' }));
  });
  const ready = workers.filter((w) => PARTS.every(([, k]) =>
    Boolean(w[k]) && w[k] !== WITHHELD)).length;
  g.push(text(PAD, H - 22, `${ready} OF ${workers.length} MANIFESTS COMPLETE`,
    { size: 8, weight: '600' }));
  g.push(text(PAD, H - 10, 'no part is ever defaulted',
    { size: 6.5, opacity: '.6' }));
  return card('dispatch', 'Suit-up dispatch',
    frame(W, H, g.join(''), {
      label: 'Each manifest as a chain of stages. The line goes dashed at '
           + 'the first part that is missing.' }),
    { note: 'A launch with a filled-in blank is a launch nobody authorised.' });
}

const brokenBefore = (worker, index) =>
  PARTS.slice(0, index).some(([, key]) =>
    !worker[key] || worker[key] === WITHHELD);

/** Oracle fragments -- pieces, held apart.
 *
 * Four facts about a subject, each real, none of them composing with
 * another. Turning them into "this will fail again" needs priors over
 * outcomes and nothing keeps any.
 *
 * A console that assembles a prediction from fragments is believed at the
 * weight of a measurement, which is the one thing a fragment must never
 * borrow. So the fragments are drawn apart, and the space where a
 * forecast would go is hatched and named. */
export function oracle({ fragments, seam = 'source.outcome_priors(work_id)' }) {
  if (!fragments || !fragments.length) {
    return card('oracle', 'Oracle fragments', '',
      { mark: still('no fragment was held') });
  }
  const g = [];
  fragments.forEach((row, i) => {
    const held = row.value !== null && row.value !== undefined;
    const y = 24 + i * 30;
    g.push(`<g class="cd-ag-fragment" data-held="${held ? 1 : 0}"${
      attrs(still('a fragment composes with nothing'))}>`
      + rect(PAD, y, SPAN, 22, { dashed: !held })
      + text(PAD + 7, y + 9, row.label, { size: 6.5, opacity: '.7' })
      + text(PAD + 7, y + 18, held ? String(row.value) : 'UNMEASURED', { size: 8 })
      + text(W - PAD - 7, y + 18, row.cite,
          { size: 5.5, anchor: 'end', opacity: '.45' })
      + '</g>');
  });
  const y = 24 + fragments.length * 30 + 6;
  // The space a forecast would occupy, drawn empty. Left off the panel it
  // would read as a component that simply does not forecast, rather than
  // one that refuses to.
  g.push(`<g class="cd-ag-noforecast"${attrs(still('no priors exist to forecast from'))}>`
    + hatched(PAD, y, SPAN, 30)
    + text(W / 2, y + 18, 'NO FORECAST IS ASSEMBLED', { size: 8, anchor: 'middle' })
    + '</g>');
  g.push(text(PAD, y + 46, seam, { size: 6, opacity: '.45' }));
  const held = fragments.filter((f) => f.value !== null && f.value !== undefined).length;
  return card('oracle', 'Oracle fragments',
    frame(W, H, g.join(''), {
      label: `${held} fragments held apart, and the empty space where a `
           + 'forecast would be assembled.' }),
    { note: 'A fragment must never borrow the weight of a measurement.' });
}

export const DOSSIER_ROWS = [['HARNESS', 'harness'], ['MODEL', 'model'],
  ['HOST', 'host'], ['IDENTITY', 'did'], ['SESSION', 'session_id']];

/** Identity disc dossier -- one object, handed between views.
 *
 * The disc answers "which exact thing am I about to command", and it can
 * only answer it if a reviewer has been taught to read it. A ring, a core
 * and a notch are three facts; the legend is what makes them legible.
 *
 * A row whose producer is silent says so, rather than leaving the disc to
 * imply a complete identity. */
export function dossier({ worker }) {
  if (!worker) {
    return card('dossier', 'Identity disc dossier', '',
      { mark: still('nothing was observed, so no identity is drawn') });
  }
  const rows = DOSSIER_ROWS.map(([label, key]) => {
    const value = worker[key];
    const known = Boolean(value) && value !== WITHHELD;
    return `<li data-known="${known ? 1 : 0}"><b>${esc(label)}</b>
      <span>${esc(known ? value : (value === WITHHELD ? WITHHELD : 'UNMEASURED'))}</span></li>`;
  });
  return card('dossier', 'Identity disc dossier',
    `<div class="cd-ag-dossier">
      <div class="cd-ag-face">${disc(worker, 96)}</div>
      <ul class="cd-ag-rows">${rows.join('')}</ul>
    </div>`,
    { note: 'The disc here is the disc the sibling row draws, from one helper.' });
}

/** Channel with noise -- trust as signal quality, never as a badge.
 *
 * The four classes only teach the scale if they are seen together. One
 * row at a time, an operator learns "this one looks a bit rough" and
 * never learns what clean looks like.
 *
 * Untrusted content is DATA, never a command. A message body asking to be
 * acted on is drawn at its own trust class and stays a message body. */
export function channel({ classes = TRUST }) {
  return card('channel', 'Channel with noise',
    `<ul class="cd-ag-trusts">${classes.map(([name, noise, why]) =>
      `<li data-noise="${noise}"><b>${esc(name)}</b>${trace(name)}
        <span>${esc(why)}</span></li>`).join('')}</ul>`,
    { note: 'Nothing may present an inference at the weight of an observation.' });
}

/** Canonical redaction -- one mark, and the row keeps its place.
 *
 * The failure mode is SILENT ABSENCE. A worker dropped from a list
 * because its identity is withheld teaches an operator the fleet is
 * smaller than it is, and there is no way to notice from inside the list.
 *
 * So the row stays, its measures stay, and exactly one mark says which
 * part was withheld. */
export function redaction({ workers }) {
  if (!workers || !workers.length) {
    return card('redaction', 'Canonical redaction', '',
      { mark: still('no worker was observed') });
  }
  const withheld = workers.filter((w) => w.redacted).length;
  const rows = workers.map((worker) =>
    `<li data-redacted="${worker.redacted ? 1 : 0}">${disc(worker, 30)}
      <b>${esc(worker.title || worker.session_id || 'UNIDENTIFIED')}</b>
      <span>${esc(worker.redacted ? WITHHELD
        : (worker.did || worker.session_id || 'UNIDENTIFIED'))}</span>
      ${measure('TURNS', worker.turns)}</li>`);
  return card('redaction', 'Canonical redaction',
    `<ul class="cd-ag-redactions">${rows.join('')}</ul>
     <p class="cd-ag-note"><b>${withheld} OF ${workers.length} WITHHELD</b>
       <span>The row stays and its measures stay. A worker that vanished from
       this list because its identity was withheld would teach an operator the
       fleet is smaller than it is.</span></p>`,
    { note: 'Silent absence is the failure mode.' });
}

/** Killmail receipt -- every lost attempt gets an immutable record.
 *
 * When a ship dies the game does not print a number and move on. It
 * writes a record: who died, what they were flying, every module fitted,
 * and what it was worth. Immutable, addressable, comparable -- which is
 * why an economy of analysis grew on top of it without anyone designing
 * one.
 *
 * Fleets lose attempts all day and write nothing down. A retry replaces
 * the failure and the failure is gone. That is why cost is unanswerable:
 * not that the numbers are missing, but that the EVENTS are not recorded
 * as objects. The receipt comes first and the price comes later.
 *
 * UNPRICED is a truthful value, not a placeholder. A receipt that guessed
 * would be worse than no receipt -- it would be the first number anyone
 * put in a spreadsheet. When a producer supplies charge records the field
 * lights up in place and every historical receipt stays honestly
 * unpriced, which is what an immutable record is for. */
export function killmail({ receipt }) {
  if (!receipt) {
    // The receipt form, blank. Every slot the producer would fill says so in the same
    // words a measured receipt uses for one missing field, because a reader who came for
    // the shape of a killmail should see the shape with nothing in it -- the FIT, the
    // DAMAGE and the COST panels exist and every line in them is UNMEASURED. That is the
    // finding; a generic hatched frame would have hidden which fields went missing.
    const blank = (label) => `<li data-unmeasured="1"><b>${esc(label)}</b>`
      + '<span>UNMEASURED</span></li>';
    return card('killmail', 'Killmail receipt',
      `<div class="cd-ag-receipt" data-drawing="receipt">
        <header><b>NO LOSS RECORDED</b><code>UNADDRESSED</code></header>
        <h5>FIT</h5><ul>${['HARNESS', 'MODEL', 'PROFILE', 'HOST'].map(blank).join('')}</ul>
        <h5>DAMAGE</h5><ul>${['PROOF', 'TERMINAL EVENT', 'BLOCKED BY'].map(blank).join('')}</ul>
        <h5>COST</h5>
        <p class="cd-ag-cost" data-priced="0"><b>${esc(UNPRICED)}</b></p>
      </div>`,
      { mark: still('no attempt was recorded as lost') });
  }
  const fit = receipt.fit || {};
  const damage = receipt.damage || {};
  const row = (label, value) => `<li${value ? '' : ' data-unmeasured="1"'}>
    <b>${esc(label)}</b><span>${esc(value || 'UNMEASURED')}</span></li>`;
  const priced = receipt.cost && receipt.cost.amount != null;
  return card('killmail', 'Killmail receipt',
    `<div class="cd-ag-receipt" data-drawing="receipt">
      <header><b>${esc(receipt.title || 'ATTEMPT LOST')}</b>
        <code>${esc(receipt.receipt_id || 'UNADDRESSED')}</code></header>
      <h5>FIT</h5><ul>
        ${row('HARNESS', fit.harness)}${row('MODEL', fit.model)}
        ${row('PROFILE', fit.profile)}${row('HOST', fit.host)}</ul>
      <h5>DAMAGE</h5><ul>
        ${row('PROOF', damage.proof_state)}${row('TERMINAL EVENT', damage.terminal)}
        ${row('BLOCKED BY', damage.reason)}</ul>
      <h5>COST</h5>
      <p class="cd-ag-cost" data-priced="${priced ? 1 : 0}"${
        attrs(still('no canonical charge record is supplied'))}>
        <b>${esc(priced ? receipt.cost.amount : UNPRICED)}</b>
        <span>${esc((receipt.cost && receipt.cost.cite) || 'cost_gateway.CLAIMS[provider_charge]')}</span></p>
    </div>`,
    priced ? { note: 'A record, addressable and comparable.' }
           : { note: 'A receipt that guessed would be the first number in a spreadsheet.' });
}
