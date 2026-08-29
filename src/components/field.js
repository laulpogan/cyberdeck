// THE FIELD -- eight ways of looking at a fleet at once.
//
// Every component here takes a model and returns a bounded drawing. That
// boundedness is the point: these are meant to be dropped into a deck
// beside each other, not to be page sections with prose underneath, so
// each one carries its own labels inside its own frame and sizes itself
// from a viewBox rather than from the page.
//
// The shared shape of every function below: read the measurement, decide
// whether there is one, and either draw it with a mark that names where
// it came from or refuse and say why. There is no third branch.

import { frame, hexCell, rect, line, dot, ring, arc, wedge, needle, text,
         hatched, scanlines, wall, curve } from '../draw.js';
import { arrive, attrs, count, cycle, level, refusal, still, trace } from '../marks.js';
import { card, esc, W, H } from './card.js';



/** Kiroshi scan overlay -- annotation over the map, never instead of it.
 *
 * The leaders run out to the margin rather than a card sitting on the
 * cell, because a card over the cell hides the geography the cell was
 * selected from, and the thing being annotated should still be on screen. */
export function scanOverlay({ subject, cite = 'sessions[].id' }) {
  if (!subject) return card('scan', 'Kiroshi scan overlay', '',
    { mark: refusal('no subject is selected') });
  const rows = [
    ['IDENTITY', subject.identity, 'sessions[].id'],
    ['AUTHORITY', subject.authority, 'authority.evaluate'],
    ['BLOCKED BY', subject.blocked, 'sessions[].state_reason'],
  ];
  const g = [];
  g.push(`<g class="cd-fd-cell"${attrs(arrive(subject.changed_at ?? null,
    subject.now ?? null, { window: 30 }))}>`
    + hexCell(46, 100, 30, { width: 2, dashed: !subject.settled })
    + text(46, 98, subject.name, { size: 9, anchor: 'middle' })
    + text(46, 110, String(subject.state || '').toUpperCase(),
        { size: 7, anchor: 'middle', opacity: '.7' }) + '</g>');
  rows.forEach(([label, value, path], i) => {
    const y = 62 + i * 38;
    // A leader travels only to something that was actually read. An
    // annotation drawn to an empty field claims a reading nobody took.
    const known = value !== null && value !== undefined && value !== '';
    g.push(`<g class="cd-fd-leader" data-known="${known ? 1 : 0}"`
      + `${attrs(trace(known, { cite: path, order: i, total: rows.length }))}>`
      + line(78, 100, 108, y, { width: 1, dashed: true })
      + line(108, y, 150, y, { width: 1, dashed: true }) + '</g>');
    // The form's question is on the page from the start; the *answer* is not.
    //
    // `trace` animates geometry -- paths, lines, rects -- and no text at all, so a
    // leader drawn to a printed value announced an order and then ignored it: every
    // field was filled in the 0ms frame, and the scan was a hexagon doing calisthenics
    // next to a form that had already answered. The answer now carries the reveal
    // position the leader claims, in the kind that animates an element: same index,
    // same total, so line and value land in the same instant. Unread rows stay put and
    // unmarked -- `NOT READ` at 0ms is a true sentence, not a reveal.
    g.push(text(154, y - 4, label, { size: 7, opacity: '.7' }));
    g.push(known
      ? `<g class="cd-fd-answer"${attrs(count(i, rows.length))}>`
        + text(154, y + 8, value, { size: 9 }) + '</g>'
      : text(154, y + 8, 'NOT READ', { size: 9, opacity: '.55' }));
  });
  return card('scan', 'Kiroshi scan overlay',
    frame(W, H, g.join(''), { label: `Annotations on ${subject.name}` }),
    { note: 'The map stays under it.' });
}

/** Tri-vision lens toggle -- one comb, three visions.
 *
 * The lens is the operator's choice, so the switch is `intent` rather
 * than a claim about the fleet. What the lens reveals still has to be
 * measured, which is why an unmeasured cell hatches under every lens. */
export function triVision({ cells, lens = 'health', lenses = ['health', 'cost', 'authority'] }) {
  const g = [];
  lenses.forEach((name, i) => {
    const on = name === lens;
    g.push(`<g class="cd-fd-lens" data-on="${on ? 1 : 0}">`
      + rect(14 + i * 104, 12, 96, 20, { width: on ? 1.6 : 1 })
      + text(62 + i * 104, 26, name.toUpperCase(), { size: 8, anchor: 'middle' })
      + '</g>');
  });
  if (!cells || !cells.length) {
    return card('tri-vision', 'Tri-vision lens toggle', frame(W, H, g.join('')),
      { mark: refusal('the comb was not enumerated') });
  }
  cells.forEach((cell, i) => {
    const col = i % 5, row = Math.trunc(i / 5);
    const cx = 46 + col * 58, cy = 78 + row * 52 + (col % 2 ? 12 : 0);
    const known = cell.measured !== false && cell[lens] !== null && cell[lens] !== undefined;
    g.push(`<g class="cd-fd-hex" data-hot="${cell.hot ? 1 : 0}" data-known="${known ? 1 : 0}"`
      + `${attrs(count(i, cells.length))}>`
      + (known ? hexCell(cx, cy, 22, { width: cell.hot ? 2 : 1,
            fill: cell.hot ? 'currentColor' : 'none', extra: 'opacity=".9"' })
              // Unmeasured under this lens is hatched, not left blank: a
              // blank cell reads as a quiet one, and quiet is a reading.
              : hexCell(cx, cy, 22, { width: 1, dashed: true })
                + hatched(cx - 11, cy - 9, 22, 18))
      + '</g>');
  });
  return card('tri-vision', 'Tri-vision lens toggle',
    frame(W, H, g.join(''), { label: `${cells.length} cells under the ${lens} lens` }),
    { note: 'Same comb · three visions · hotkeys 1 2 3' });
}

/** Fleet-wall scale crush -- the whole population at once, and red only
 * where it bleeds. The crush only works if the eye finds the marked cells
 * against a field that is otherwise uniform. */
export function scaleCrush({ count: total, bleeding = [], cite = 'fleet.cells' }) {
  const built = wall(total, { columns: 18, r: 5.2, marked: bleeding,
    mark: (i) => attrs(count(i, total)) });
  if (!built) {
    return card('crush', 'Fleet-wall scale crush', '',
      // No count means no board, and no board means no right to 340×200 of hatch:
      // the measured wall is about 118px tall, and the refusal is a band pair about
      // the same height. Drawing a poster where a board would have been moved the
      // whole page 371px to say less.
      { refusalWord: 'BOARD UNCOUNTED', refusalSpan: [W, 48],
        refusalScale: 2.4, refusalCls: 'cd-draw-fixed',
        mark: refusal('the board was never counted') });
  }
  return card('crush', 'Fleet-wall scale crush',
    frame(built.width, built.height, built.body,
      { label: `${total} cells, ${bleeding.length} bleeding`, scale: 3.2,
        cls: 'cd-draw-fixed' }),
    { note: `${total} cells · red only where it bleeds` });
}

/** Coverage as territory -- observed ground renders, dark zones do not.
 *
 * The refusal is the whole component. An unmeasured region is drawn as a
 * boxed, hatched void with the word on it, because terrain quietly left
 * flat is indistinguishable from terrain measured as flat. */
export function coverage({ contours, dark, endpoints = [], cite = 'coverage.observed' }) {
  const g = [];
  const drawn = curve(contours && contours[0], { width: 190, height: 150 });
  if (drawn) {
    contours.forEach((series, i) => {
      const path = curve(series, { width: 190, height: 150 });
      if (!path) return;
      g.push(`<g class="cd-fd-contour" transform="translate(6 26)"`
        + `${attrs(trace(true, { cite, order: i, total: contours.length }))}>`
        + path + '</g>');
    });
  }
  endpoints.forEach((e, i) => {
    g.push(`<g class="cd-fd-post"${attrs(count(i, endpoints.length))}>`
      + dot(e.x, e.y, 4) + text(e.x + 10, e.y + 3, e.id, { size: 8 }) + '</g>');
  });
  if (dark) {
    g.push('<g class="cd-fd-dark">'
      + rect(206, 22, 118, 152, { width: 1, dashed: true })
      + hatched(206, 22, 118, 152)
      + text(265, 92, 'UNMEASURED', { size: 9, anchor: 'middle' })
      + text(265, 106, 'terrain unrendered', { size: 7.5, anchor: 'middle', opacity: '.6' })
      + '</g>');
  }
  return card('coverage', 'Coverage as territory',
    frame(W, H, g.join(''), { label: 'Observed territory and unmeasured ground' }),
    drawn ? { note: 'Observed territory renders · dark zones do not' }
          : { mark: refusal('no contour was sampled') });
}

/** HUD chip budget -- density is a spent resource.
 *
 * Every chip on a deck costs attention, so the budget is drawn as a
 * budget. A chip whose cost nobody costed is listed and marked, never
 * counted as free. */
export function chipBudget({ chips, ceiling, cite = 'hud.channel_budget' }) {
  if (!chips || !chips.length) {
    return card('chips', 'HUD chip budget', '',
      { refusalWord: 'NO INVENTORY',
    mark: still('no chip was inventoried') });
  }
  const spent = chips.filter((c) => c.on).reduce((n, c) => n + (c.cost || 0), 0);
  const priced = chips.every((c) => typeof c.cost === 'number');
  const g = [];
  chips.forEach((c, i) => {
    const y = 26 + i * 26;
    g.push(`<g class="cd-fd-chip" data-on="${c.on ? 1 : 0}"${attrs(count(i, chips.length))}>`
      + rect(14, y, 178, 20, { width: c.on ? 1.4 : 1 })
      + text(22, y + 14, c.name, { size: 8 })
      + text(184, y + 14, typeof c.cost === 'number' ? `${c.cost} CH` : 'UNPRICED',
          { size: 8, anchor: 'end', opacity: c.on ? null : '.55' })
      + '</g>');
  });
  // The budget is the sum of the chips above it, so it enters one slot past the last
  // chip -- the total arriving before the parts it totals made the entrance a
  // conclusion with no premises.
  const budget = level(priced ? spent : null, ceiling,
    { measured: priced && typeof ceiling === 'number', cite,
      order: chips.length, total: chips.length + 1 });
  g.push(text(224, 30, 'BUDGET', { size: 7, opacity: '.7' }));
  g.push(text(224, 58, priced ? `${spent} / ${ceiling}` : 'UNPRICED', { size: 18 }));
  g.push(`<g class="cd-fd-budget"${attrs(budget)}>`
    + rect(224, 74, 100, 8, { width: 1 })
    + (budget['data-motion'] === 'level'
      ? rect(224, 74, 100 * Number(budget['data-level']), 8,
          { fill: 'currentColor', width: 0 })
      // Unpriced is hatched rather than empty: an empty bar is a spend of
      // zero, and nobody measured a spend of zero.
      : hatched(224, 74, 100, 8))
    + '</g>');
  g.push(text(224, 96, 'of the channel budget', { size: 7, opacity: '.55' }));
  return card('chips', 'HUD chip budget',
    frame(W, H, g.join(''), { label: `${spent} of ${ceiling} channels spent` }),
    { note: 'Density is a spent resource. Default load-out: lean.' });
}

/** Radar freshness sweep -- radius is evidence age, not distance.
 *
 * The sweep runs the producer's real poll interval, so an operator reads
 * "is this being polled" off the movement rather than trusting a
 * timestamp. An overdue poll refuses to sweep rather than wrapping, since
 * a wrap would erase the finding.
 *
 * Brightness is a second measurement and a separate one: how long since
 * the sweep last crossed this contact's bearing, spent against that same
 * poll interval. A blip firms as the wedge reaches it and spends itself
 * until the next pass; with no measured pass time it refuses and is drawn
 * ringed, because the thing that would have brightened it is the thing
 * that is missing. */
export function radar({ contacts, pollElapsed = null, pollPeriod = null,
                        sourceState = 'unavailable', cite = 'source.poll_interval_ms' }) {
  const cx = 100, cy = 100;
  const g = [];
  [28, 52, 76].forEach((r) => g.push(ring(cx, cy, r, { width: 1, extra: 'opacity=".45"' })));
  const sweep = cycle(pollElapsed, pollPeriod, sourceState, { cite });
  const sweeping = sweep['data-motion'] === 'cycle';
  g.push(`<g class="cd-fd-sweep"${attrs(sweep)}>`
    + (sweeping ? wedge(cx, cy, 76, -0.5, 0.35, { opacity: '.14' })
                : text(cx, cy - 86, 'NO SWEEP', { size: 8, anchor: 'middle' }))
    + '</g>');
  (contacts || []).forEach((c, i) => {
    // Radius is age. A contact whose age nobody measured cannot be placed
    // on this dial at all, so it is listed off-scope instead of parked at
    // the centre, which would read as the freshest thing on the screen.
    if (c.age_seconds === null || c.age_seconds === undefined) return;
    const r = 28 + Math.min(1, c.age_seconds / (c.window || 60)) * 48;
    const x = cx + r * Math.cos(c.bearing), y = cy + r * Math.sin(c.bearing);
    // Brightness is the second clock, and it is a measurement rather than a
    // label. `band` used to be the ink here -- a category someone typed --
    // so a contact held its brightness while a measured sweep went round it,
    // which is the freshest-looking lie in the library. The mark refuses on
    // an unmeasured pass time, on a source that is not live, and on an
    // overrun; in every one of those cases the contact is drawn ringed.
    let pass = cycle(c.swept_ago_seconds, pollPeriod, sourceState, {
      cite: c.cite || 'contacts[].swept_ago_seconds',
    });
    // `cycle` refuses a missing elapsed with the poll's own words, which are
    // true of the river and wrong here: the interval *is* measured — the sweep
    // two inches away is turning on it. The component names the quantity that
    // is actually absent, which is what every other refusal in this library
    // does, and leaves the mark's own refusals (a source that is not live, an
    // overrun) alone because those are the same fact on any dial.
    if (c.swept_ago_seconds === null || c.swept_ago_seconds === undefined) {
      pass = still('this contact has no recorded sweep-pass time');
    }
    const passing = pass['data-motion'] === 'cycle';
    // The source's own band word only gets to choose ink while the pass time
    // is measured. A contact typed `fresh` whose sweep-pass was never
    // recorded must not be drawn in freshness ink on the strength of the
    // word alone; `unmeasured` is the colour the library already defines for
    // exactly this.
    const band = passing ? (c.band || 'fresh') : 'unmeasured';
    g.push(`<g class="cd-fd-contact" data-band="${band}"`
      + ` data-pass="${passing ? 'measured' : 'refused'}"`
      + `${attrs(count(i, contacts.length))}>`
      + `<g${attrs(pass)}${passing ? ' data-cycle-axis="brightness"' : ''}>`
      + dot(x, y, 3.4)
      + (passing ? '' : ring(x, y, 6.5, { dashed: true }))
      + '</g></g>');
  });
  const offScope = (contacts || []).filter((c) => c.age_seconds === null
    || c.age_seconds === undefined).length;
  g.push(text(200, 62, 'RADIUS = EVIDENCE AGE', { size: 7, opacity: '.7' }));
  g.push(text(200, 78, 'inner ring: fresh', { size: 8 }));
  g.push(text(200, 92, 'outer ring: stale', { size: 8 }));
  // Either branch is a declaration. Contacts with no measured age are listed,
  // not placed, and the list is stated. When nothing is off-scope there is no
  // population to stagger a marker over: `count(0, 1)` moved a tally of
  // nothing, which is the shape of a spinner wearing a count's clothes.
  g.push(`<g class="cd-fd-offscope" data-any="${offScope ? 1 : 0}"${attrs(offScope
    ? still(`${offScope} contact${offScope === 1 ? ' has' : 's have'} no measured age`)
    : still('nothing is off-scope; a tally of nothing is not a count'))}>`
    + text(200, 106, offScope ? `${offScope} OFF-SCOPE · UNMEASURED` : 'all contacts aged',
        { size: 8, opacity: '.75' }) + '</g>');
  return card('radar', 'Radar freshness sweep',
    frame(W, H, g.join(''), { label: 'Contacts by evidence age' }),
    sweeping ? { note: 'Sweeping at the measured poll interval' }
             : { mark: sweep });
}

/** Magnetic needle field -- every worker points at its governing constraint.
 *
 * Every needle is the same length on purpose: direction is measured,
 * magnitude is not, and a longer needle would be read as a stronger pull
 * nobody recorded. */
export function needleField({ workers, cite = 'sessions[].constraint' }) {
  if (!workers || !workers.length) {
    return card('needles', 'Magnetic needle field', '',
      { mark: refusal('no worker reported a constraint') });
  }
  const g = [];
  workers.forEach((w, i) => {
    const col = i % 7, row = Math.trunc(i / 7);
    const cx = 30 + col * 44, cy = 34 + row * 40;
    // A worker with no measured constraint gets a hollow ring, not a
    // needle pointing somewhere plausible.
    if (w.bearing === null || w.bearing === undefined) {
      g.push(`<g class="cd-fd-needle" data-known="0"`
        + `${attrs(refusal('this worker reported no constraint'))}>`
        + ring(cx, cy, 4, { dashed: true }) + '</g>');
      return;
    }
    g.push(`<g class="cd-fd-needle" data-hot="${w.hot ? 1 : 0}" data-known="1"`
      + `${attrs(count(i, workers.length))}>`
      + needle(cx, cy, 9, w.bearing, { width: 1.4 }) + '</g>');
  });
  const blind = workers.filter((w) => w.bearing === null || w.bearing === undefined).length;
  return card('needles', 'Magnetic needle field',
    frame(W, H, g.join(''), { label: `${workers.length} workers by constraint` }),
    { note: blind
      ? `${workers.length - blind} point at a constraint · ${blind} reported none`
      : 'Every worker points at its governing constraint' });
}

/** The semiotic standard sheet -- the legend, and the one thing on this
 * page that is deliberately still. A legend is not a reading: nothing on
 * it is measured, so nothing on it may move. */
export function standardSheet({ glyphs }) {
  const g = [];
  (glyphs || []).forEach((s, i) => {
    const px = 56 + (i % 3) * 104, py = 52 + Math.trunc(i / 3) * 74;
    const shape = {
      working: dot(px, py, 7),
      blocked: rect(px - 7, py - 7, 14, 14, { fill: 'currentColor', width: 0 }),
      needs_you: `<polygon points="${px},${py - 8} ${px + 8},${py + 6} ${px - 8},${py + 6}" `
        + 'fill="currentColor"/>',
      unmeasured: rect(px - 7, py - 7, 14, 14, { width: 2, dashed: true }),
      landed: dot(px, py, 7, { hollow: true }),
      draining: rect(px - 8, py - 2, 16, 4, { fill: 'currentColor', width: 0 }),
    }[s.key] || dot(px, py, 6, { hollow: true });
    g.push(`<g class="cd-fd-glyph" data-glyph="${s.key}">${shape}`
      + text(px, py + 26, s.label, { size: 8, anchor: 'middle', opacity: '.75' })
      + '</g>');
  });
  return card('standard-sheet', 'Semiotic standard sheet',
    frame(W, H, g.join(''), { label: 'The glyph legend' }),
    { mark: refusal('a legend is not a reading') });
}
