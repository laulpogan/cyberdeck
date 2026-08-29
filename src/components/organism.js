// THE ORGANISM -- supply, structure, and where the fleet sits.
//
// The other families answer what is happening and who did it. This one
// answers whether the shape of the thing can hold: what is stocked, what
// is flowing, what is admitted, and how close the whole system runs to an
// edge it cannot see itself approach.
//
// One rule runs through all eight, Forrester's, and it is violated
// everywhere in ops tooling: A LEVEL AND A RATE ARE DIFFERENT KINDS OF
// NUMBER AND MAY NEVER WEAR THE SAME MARK. "12 queued" and "12 per
// minute" answer different questions, and a dashboard drawing both as a
// number with a label teaches an operator to confuse them. A level gets a
// filled bar standing on a floor; a rate gets an arrow with its period
// attached. You can tell them apart with the labels covered.
//
// Rasmussen's is the second: a system does not fail at a limit, it drifts
// toward one. The envelope draws its three boundaries, or says they were
// never supplied -- rather than drawing a comfortable middle.

import { frame, rect, line, dot, hexCell, text, hatched } from '../draw.js';
import { attrs, count, level, refusal, still, trace } from '../marks.js';
import { card, esc, W, H , refusalFrame } from './card.js';

const PAD = 12;
const SPAN = W - PAD * 2;
const UNMEASURED = 'UNMEASURED';

/** Rasmussen's three boundaries. Each is a producer most fleets do not
 * have, and each says so rather than being drawn at a plausible default.
 * An envelope with invented edges is worse than no envelope, because it
 * looks safe. */
export const BOUNDARIES = [
  ['economic', 'ECONOMIC', 'The spend ceiling nobody has priced.'],
  ['workload', 'WORKLOAD', 'The load the fleet carries before work waits.'],
  ['safety', 'SAFETY', 'The point past which failures stop being recoverable.'],
];

/** Stock and flow glyphs -- a level and a rate never share a glyph.
 *
 * The level mark is Forrester's notation and it is the same size at three
 * as at three hundred, so it reveals in ORDER, never in extent. Animating
 * it to "full" would draw a bar chart out of a glyph and assert a
 * proportion nobody asked for.
 *
 * No rate here is ever derived from one snapshot. A rate computed from a
 * single observation is a number invented by arithmetic on nothing. */
export function stockFlow({ levels = [], rates = [] }) {
  const levelRow = (item, i) => {
    const known = item.value !== null && item.value !== undefined;
    const mark = known ? count(i, levels.length)
                       : still('this level was not measured');
    return `<div class="cd-og-level" data-measured="${known ? 1 : 0}"${attrs(mark)}>
      <span class="cd-og-level-mark" aria-hidden="true"><i></i></span>
      <b>${esc(item.label)}</b><strong>${esc(known ? item.value : UNMEASURED)}</strong>
      <cite>${esc(item.cite)}</cite></div>`;
  };
  const rateRow = (item) => {
    const known = item.value !== null && item.value !== undefined;
    // Even a measured rate holds still. A rate is not a level, and the one
    // way to draw it wrong is to let it fill something.
    const mark = still(known ? 'a rate is not a level'
                             : 'no producer keeps a series for this rate');
    return `<div class="cd-og-rate" data-measured="${known ? 1 : 0}"${attrs(mark)}>
      <span class="cd-og-rate-mark" aria-hidden="true"><svg viewBox="0 0 24 12"
        width="24" height="12"><path d="M0 6 H16 M11 2 L16 6 L11 10" fill="none"
        stroke="currentColor" stroke-width="2"/></svg></span>
      <b>${esc(item.label)}</b><strong>${esc(known ? item.value : UNMEASURED)}</strong>
      <em>PER ${esc(item.period || 'MIN')}</em><cite>${esc(item.cite)}</cite></div>`;
  };
  return card('stock-flow', 'Stock & flow glyphs',
    `<div class="cd-og-stockflow">
      <h4>LEVELS · standing</h4>${levels.map(levelRow).join('')}
      <h4>RATES · per unit time</h4>${rates.map(rateRow).join('')}
    </div>`,
    { note: 'Tell them apart with the labels covered.' });
}

/** Safe-envelope gauge -- Rasmussen, drawn as walls.
 *
 * The one picture this gauge must never make is a needle inside a green
 * box: that says a position was measured against edges that were
 * measured, and usually neither was. So the operating space is drawn,
 * each boundary is hatched on the side it governs, and the middle stays
 * empty until something real fills it.
 *
 * The stillness is held in the motion too. With no position inside the
 * box there is nothing that could travel toward an edge, and a drifting
 * mark would put the needle back by implication after the geometry went
 * to the trouble of leaving it out. */
export function envelope({ boundaries = BOUNDARIES, position = null,
                           cite = 'envelope.boundaries[]' }) {
  if (!boundaries || !boundaries.length) {
    // A null field is not the default parameter: a caller that said "no boundaries"
    // gets that stated, rather than the library's own label list quietly standing in
    // for a producer that described nothing. The drawing keeps its space either way.
    return card('envelope', 'Safe-envelope gauge',
      refusalFrame({ word: 'NO ENVELOPE DESCRIBED',
        cite: 'envelope.boundaries[]',
        ghost: [{ x: 60, y: 40, w: 220, h: 100 }] }),
      { mark: refusal('no boundary was described') });
  }
  const top = 24, box = 108, inset = 22;
  const g = [`<g class="cd-og-space">`
    + rect(PAD + inset, top + inset, SPAN - inset * 2, box - inset * 2) + '</g>'];
  // An edge is data. A fourth element on a boundary row is the measured limit -- the
  // fraction of its axis where the edge actually sits -- and when it is present the
  // wall draws to that extent as a solid line instead of a hatch. Until this line
  // existed every wall was hardcoded `still` and unsupplied, so the gauge could never
  // show an envelope: the fixture could not have demonstrated it (finding #9). An
  // edge nobody priced still says so, in the same words, on the same element.
  const byEdge = Object.fromEntries((boundaries || []).map((row) => [row[0], row]));
  const limitOf = (key) => {
    const row = byEdge[key];
    const limit = row && row.length > 3 ? row[3] : null;
    return limit === null || limit === undefined || !(Number(limit) >= 0 && Number(limit) <= 1)
      ? null : Number(limit);
  };
  const wall = (key, x, y, w, h, vertical) => {
    const limit = limitOf(key);
    if (limit === null) {
      // The F-16 HUD prints `xxx` INSIDE the field when a value cannot be had. It does not
      // delete the field, and it does not leave the crew to infer a gap from a missing digit.
      // Same rule: the hatched strip IS the edge nobody priced, and the strip says so, rather
      // than trusting a caption centred under the box to be read as this strip's sentence.
      return `<g class="cd-og-wall" data-edge="${key}" data-supplied="0"`
        + `${attrs(still('this boundary was never supplied'))}>`
        + hatched(x, y, w, h) + '</g>'
        + text(vertical ? x - 5 : x + w / 2, vertical ? y + h / 2 : y - 4,
            'XXX', { size: 7, anchor: vertical ? 'end' : 'middle' });
    }
    const extent = level(limit, 1,
      { measured: true, cite: `${cite}[${key}]`, axis: vertical ? 'y' : 'x' });
    // The wall grows out to the limit the producer gave: `level` is extent, and an
    // edge is an extent. Geometry follows the same axis the edge runs on.
    const drawn = vertical
      ? line(x + 5, y, x + 5, y + (h * limit), { width: 2 })
      : line(x, y + 5, x + (w * limit), y + 5, { width: 2 });
    // The value belongs with the wall's NAME, not at the tip of its bar. Placed at the tip --
    // where the arithmetic put it first -- `0.70` landed a few pixels under the demand bar and
    // read as that bar's number, which is a different measurement of a different thing. A
    // number that can be borrowed by the neighbour beside it is not labelling anything.
    return `<g class="cd-og-wall" data-edge="${key}" data-supplied="1"${attrs(extent)}>`
      + drawn + '</g>';
  };
  // `xxx` for the wall that has no value, so its NAME never reads as a priced limit either.
  const valueOf = (key) => {
    const limit = limitOf(key);
    return limit === null ? '' : ` ${limit.toFixed(2)}`;
  };
  g.push(wall('economic', PAD + inset - 10, top + inset, 10, box - inset * 2, true));
  g.push(wall('workload', PAD + SPAN - inset, top + inset, 10, box - inset * 2, true));
  g.push(wall('safety', PAD + inset, top + box - inset, SPAN - inset * 2, 10, false));
  g.push(text(PAD + inset, top + inset - 6, `ECONOMIC${valueOf('economic')}`, { size: 7 }));
  g.push(text(PAD + SPAN - inset, top + inset - 6, `WORKLOAD${valueOf('workload')}`,
    { size: 7, anchor: 'end' }));
  // The name sits by its wall, the value does not: `SAFETY 0.44` first went one line above the
  // boundary rows, where it read as ECONOMIC's number -- the same borrowing the `0.70` at the
  // bar's tip committed. Values live in the rows below, on the same line as the name they
  // belong to. The name still needs to exist here, because without it the bottom wall is a
  // stroke the same weight as the box's own frame, and a limit drawn like furniture is
  // furniture.
  g.push(text(PAD + inset, top + box - inset - 8, 'SAFETY', { size: 7 }));
  // Derived from the caller's list, not the library's default three: a producer that
  // described four edges was told it had described three, and one it invented as a fifth
  // was never counted as priced at all.
  const unsupplied = boundaries.map(([key]) => key).filter((k) => limitOf(k) === null);
  const priced = boundaries.length - unsupplied.length;
  if (unsupplied.length) {
    g.push(text(W / 2, top + box + 10,
      `${unsupplied.map((k) => k.toUpperCase()).join(', ')} UNSUPPLIED`,
      { size: 7, anchor: 'middle' }));
  }
  // A position is a PLACE, and the only thing allowed to put it there is a measurement.
  // The F-16 HUD (`vault/raw/f16-hud-gcas.gif`) prints the live value — `R 7.630` — beside the
  // limit it is read against — `AL 500` — and the cue sits where those two numbers say it
  // sits. Until now this component drew a dot at the exact centre of the space whenever a
  // position object existed AT ALL, including one whose own note read "unmeasured against all
  // three edges": an absence rendered as a comfortable middle, in the one gauge whose subject
  // is that a comfortable middle is the failure it prevents. Finding #12 asked what a drawn
  // fraction was a fraction of. The answer has to be on the drawing.
  const ceiling = position && Number(position.ceiling) > 0 ? Number(position.ceiling) : null;
  const used = position && Number.isFinite(Number(position.used)) ? Number(position.used) : null;
  const demand = ceiling !== null && used !== null ? used / ceiling : null;
  const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  if (demand !== null) {
    const track = SPAN - inset * 2;
    const frac = Math.min(Math.max(demand, 0), 1);
    const x = PAD + inset + track * frac;
    // Bar and number are one measurement, revealed in order: the extent is `used / ceiling`
    // and `order` says which came before which. Past the ceiling the DRAWING clamps, because
    // there is no ink outside the box, and the ink says that rather than hiding it.
    const extent = level(frac, 1, {
      measured: true, order: priced, total: priced + 1,
      cite: position.cite || `${cite}.used / ${cite}.ceiling`,
    });
    g.push(`<g class="cd-og-demand"${attrs(extent)}>`
      + line(PAD + inset, top + box / 2, x, top + box / 2, { width: 2 }) + '</g>');
    g.push(`<g class="cd-og-position">${dot(x, top + box / 2, 5)}</g>`);
    g.push(text(x, top + box / 2 - 10, `${fmt(used)} OF A ${fmt(ceiling)} CEILING`,
      { size: 7, anchor: frac > 0.72 ? 'end' : 'start' }));
    if (demand > 1) {
      g.push(text(W / 2, top + box / 2 + 16, 'PAST THE CEILING — DRAWN CLAMPED HERE',
        { size: 7, anchor: 'middle' }));
    }
  } else {
    g.push(`<g class="cd-og-nodot">`
      + text(W / 2, top + box / 2, 'NO POSITION IS DRAWN',
          { size: 9, anchor: 'middle' })
      // A caller that handed over a position object and no numbers used to be told 'no
      // boundary was supplied', which is a sentence about a different field. Say what is
      // actually missing, in the caller's own words when it had any.
      + text(W / 2, top + box / 2 + 12,
          position
            ? String(position.note || 'the position carries no number to place it by')
            : 'no boundary was supplied',
          { size: 6.5, anchor: 'middle', opacity: '.75' }) + '</g>');
  }
  boundaries.forEach(([key, label, reason], i) => {
    const y = 152 + i * 16;
    // One line per edge: its name, its measured limit or `XXX`, and what it means. The value
    // cannot be read by the wrong neighbour when there is exactly one name in sight of it.
    const limit = limitOf(key);
    g.push(text(PAD, y, `${label}${limit === null ? ' XXX' : ` ${limit.toFixed(2)}`}`,
      { size: 7, opacity: '.8' }));
    g.push(text(PAD + 64, y, reason, { size: 6.5, opacity: '.55' }));
  });
  return card('envelope', 'Safe-envelope gauge',
    frame(W, H, g.join(''), {
      extra: position ? '' : attrs(refusal('no position was measured to move')).trim(),
      // The count is the caller's, not a constant: three was the library's default list,
      // and a producer that described four edges was being described as having three.
      label: unsupplied.length
        ? `The operating space with ${unsupplied.length} boundary `
          + `${unsupplied.length === 1 ? 'edge' : 'edges'} hatched.`
        : `The operating space with all ${boundaries.length} boundaries measured.`,
    }),
    position ? { note: `${unsupplied.length
      // "2 measured edge" was the sentence on screen. A number that disagrees with the
      // noun next to it reads as generated, and generated is what the fixture warnings
      // exist to make impossible: count and noun are the same measurement.
      ? `A position, drawn against ${priced} measured `
        + `${priced === 1 ? 'edge' : 'edges'} and ${unsupplied.length} nobody priced.`
      : `A position drawn against ${priced} measured edges.`}${
      // And the fraction answers to a number, or there is no fraction on the page.
      demand === null ? '' : ` The position sits at ${fmt(used)} of a ${fmt(ceiling)} ceiling.`}${
      // The edges print their fractions and nothing hands them a unit. Say it once, in the
      // sentence the reader is already reading, rather than letting `0.70` borrow a unit from
      // the ceiling beside it -- a different axis and a different measurement.
      priced === 0 ? '' : ' Edges are fractions of their own axis; no unit was supplied.' }` }
      : { note: 'A comfortable middle is the failure this gauge prevents.' });
}

/** Cargo admission balance -- offered against taken, on a beam that tips.
 *
 * A utilisation percentage hides which side of the gap moved. A beam
 * cannot: the crates are drawn, the tilt IS the difference, and the
 * number that was not admitted is what the reader is left looking at.
 *
 * When either count is missing the beam is not drawn at all, rather than
 * drawn level -- level is the picture of a balanced fleet. */
export function admission({ offered = null, taken = null, status = null,
                            reason = null }) {
  if (offered === null || offered === undefined
      || taken === null || taken === undefined) {
    return card('admission', 'Cargo admission balance',
      refusalFrame({ word: `${UNMEASURED} OFFERED · ${UNMEASURED} TAKEN` }),
      { mark: refusal('one side of the balance was never counted') });
  }
  const cx = W / 2, beamY = 74, arm = 118;
  const gap = offered - taken;
  // Capped: past about a third of a turn the drawing stops reading as a
  // balance and starts reading as a broken one.
  const tilt = offered ? Math.max(-.34, Math.min(.34, gap / offered)) : 0;
  const dy = arm * Math.sin(tilt);
  const g = [line(cx, 150, cx, beamY, { width: 1.5 }),
             line(cx - 50, 150, cx + 50, 150, { width: 1.5 })];
  // The tilt is the difference, and the difference was measured -- both counts arrive or the
  // component refuses above. So the beam's arrival is a `level` in the third dialect
  // (`axis: 'tilt'`), placed one slot past the crates it summarises so the argument is read in
  // the order it is argued, and eased out because the verified balance reference swings most
  // of its way over in the first half of its duration and then holds.
  // The extent in the DOM is the ratio itself — `offered` against the gap — and never the
  // capped angle over the cap. The arm's travel is clamped for legibility, which is a bound on
  // a number, not a rescaling of it: an arm pinned at the cap still reports the imbalance that
  // pinned it, the same way a clamped `traffic` period keeps its real interval in data-period.
  const crates = Math.min(Math.trunc(offered), 6) + Math.min(Math.trunc(taken), 6);
  g.push(`<g class="cd-og-arm"${attrs(level(Math.abs(gap) / offered, 1, {
      measured: true, axis: 'tilt', deg: (tilt * 180) / Math.PI, origin: [cx, beamY],
      // One slot past the last crate drawn, so the beam arrives after the evidence it
      // summarises rather than alongside it (the rule finding #6 wrote).
      order: crates, total: crates + 1,
      cite: 'offered vs taken, on a capped arm' }))}>`
    + line(cx - arm, beamY - dy, cx + arm, beamY + dy, { width: 2.5 }) + '</g>');
  [[-1, offered, 'OFFERED'], [1, taken, 'TAKEN']].forEach(([side, n, label]) => {
    const px = cx + side * arm, py = beamY + side * dy;
    const drawn = Math.min(Math.trunc(n), 6);
    for (let i = 0; i < drawn; i++) {
      g.push(`<g class="cd-og-crate"${attrs(count(i, drawn))}>`
        + rect(px - 15, py + 10 + i * 10, 30, 8,
            { fill: 'currentColor', width: 0, extra: 'opacity=".7"' }) + '</g>');
    }
    // Clear of the arm. A label struck through by the beam it hangs from
    // is the drawing arguing with itself.
    g.push(text(px, py - 22, label, { size: 7, anchor: 'middle' }));
    g.push(text(px, py - 9, String(n), { size: 13, anchor: 'middle' }));
  });
  // The balance is derived from both pans, so it takes the slot one past the last
  // crate: `offered + taken` measured manifests, and this line is item
  // `offered + taken + 1`. Five crates not admitted used to be painted in the first
  // frame, over empty beams.
  g.push(`<g class="cd-og-gap" data-any="${gap ? 1 : 0}"`
    + `${attrs(count(offered + taken, offered + taken + 1))}>`
    + text(cx, 168, `${gap} NOT ADMITTED`, { size: 9.5, anchor: 'middle' })
    + '</g>');
  // Top right, clear of the pan labels, which sit near the left edge when
  // the beam tips.
  if (status) g.push(text(W - PAD, 16, String(status).toUpperCase(),
    { size: 7.5, anchor: 'end' }));
  return card('admission', 'Cargo admission balance',
    frame(W, H, g.join(''), {
      label: `A beam tipped by the difference between ${offered} offered and `
           + `${taken} taken.` }),
    { note: reason || 'The tilt is the difference, not a percentage.' });
}

// How tall a tower may get, and how many workers that height stands for.
// Height is a count and nothing else: a tower scaled by "importance" is a
// ranking nobody measured.
const TOWER_UNIT = 16, TOWER_BASE = 14;

/** Placement as city -- hosts as buildings, workers as lit windows.
 *
 * A bar chart of workers per host answers the same question and loses the
 * one thing the motif is for: a host with no work is a plot with the
 * lights off, which an operator reads as starved without being told.
 *
 * One window per worker, never a texture, so the building cannot look
 * busier than the host is. And an empty host is drawn DARK rather than
 * omitted -- a host that vanished when it emptied would take the evidence
 * of the starvation with it. */
export function city({ hosts = [] }) {
  if (!hosts.length) {
    return card('city', 'Placement as city', '',
      { mark: refusal('no placement was observed') });
  }
  const gap = 12;
  const width = Math.min(52, (SPAN - gap * (hosts.length - 1)) / hosts.length);
  const tallest = Math.max(...hosts.map((h) => (h.workers || []).length), 1);
  const floor = Math.min(H - 26, 40 + TOWER_BASE + tallest * TOWER_UNIT);
  const g = [];
  hosts.forEach((host, i) => {
    const x = PAD + i * (width + gap);
    const workers = host.workers || [];
    const tower = TOWER_BASE + workers.length * TOWER_UNIT;
    const top = floor - tower;
    if (workers.length) {
      g.push(`<g class="cd-og-tower">${rect(x, top, width, tower)}</g>`);
      workers.forEach((worker, row) => {
        g.push(`<g class="cd-og-window" data-state="${esc(String(worker.state || '').toLowerCase())}"`
          + `${attrs(count(row, workers.length))}>`
          + rect(x + 7, top + 7 + row * TOWER_UNIT, width - 14, 8,
              { fill: 'currentColor', width: 0 }) + '</g>');
      });
    } else {
      // `DARK` is the honest picture of a host with nothing on it, and the mark is what
      // keeps it from reading as a drawing that failed to render.
      g.push(`<g class="cd-og-dark"${attrs(refusal('no placement was recorded on this host'))}>`
        + rect(x, floor - TOWER_BASE, width, TOWER_BASE, { dashed: true })
        + text(x + width / 2, floor - 4, 'DARK', { size: 7, anchor: 'middle' })
        + '</g>');
    }
    g.push(text(x + width / 2, floor + 14, String(host.host),
      { size: 7, anchor: 'middle' }));
    g.push(text(x + width / 2, floor + 24, String(workers.length),
      { size: 8, anchor: 'middle', opacity: '.6' }));
  });
  const dark = hosts.filter((h) => !(h.workers || []).length).length;
  return card('city', 'Placement as city',
    frame(W, H, g.join(''), {
      label: 'One building per host, one lit window per worker. An empty '
           + 'host is a dark plot rather than a missing row.' }),
    { note: dark ? `${dark} host${dark === 1 ? '' : 's'} dark, and drawn.`
                 : 'One window per worker, never a texture.' });
}

/** Garage assembly -- model and harness as a loadout, and what the fit has
 * produced.
 *
 * A loadout with no proof history says so instead of implying a clean
 * record. An empty column and a column of passes look identical until one
 * of them is named. */
export function garage({ loadouts = [] }) {
  if (!loadouts.length) {
    return card('garage', 'Garage assembly', '',
      { mark: refusal('no loadout was observed') });
  }
  const rows = loadouts.map((item) => {
    const proof = Object.entries(item.proof || {});
    return `<article class="cd-og-loadout" data-drawing="loadout">
      <header><b>${esc(item.model)}</b><span>${esc(item.harness)}</span>
        <em>${item.count} FITTED</em></header>
      <div class="cd-og-fit">${proof.length
        ? proof.map(([key, n]) =>
            `<span data-proof="${esc(String(key).toLowerCase())}">${esc(key)} <i>${n}</i></span>`).join('')
        : `<span data-proof="unmeasured"${
          attrs(refusal('no proof history was retained for this assembly'))}>NO PROOF HISTORY</span>`}</div>
    </article>`;
  });
  return card('garage', 'Garage assembly', rows.join(''),
    { note: 'What the fit has actually produced, or that nothing has.' });
}

/** Strand delivery routes -- drawn, and thickened once per delivery.
 *
 * A list of arrows says which route exists. The motif says which route is
 * LOAD-BEARING: a strand gets one stroke of width per landing on it, so a
 * path everything travels is visibly the path everything travels.
 *
 * A route with no delivery is drawn dashed rather than left off. An
 * undelivered strand is the fact. */
export function strands({ routes = [] }) {
  if (!routes.length) {
    return card('strands', 'Strand delivery routes', '',
      { mark: refusal('no route was observed') });
  }
  const landings = new Map();
  routes.forEach((r) => {
    const key = `${r.origin}→${r.destination}`;
    landings.set(key, (landings.get(key) || 0) + (r.delivered ? 1 : 0));
  });
  const g = [];
  const step = Math.min(34, (H - 30) / routes.length);
  routes.forEach((route, i) => {
    const y = 26 + i * step;
    const key = `${route.origin}→${route.destination}`;
    // One stroke of width per landing, floored at a hairline so an
    // undelivered route is still drawn.
    const thickness = 1 + 1.6 * (landings.get(key) || 0);
    g.push(`<g class="cd-og-route" data-delivered="${route.delivered ? 1 : 0}"`
      + `${attrs(trace(route.delivered, { cite: 'routes[].delivered', order: i, total: routes.length }))}>`
      + `<path d="M 80 ${y} Q 170 ${y - 11} 262 ${y}" fill="none" `
      + `stroke="currentColor" stroke-width="${thickness}"`
      + `${route.delivered ? '' : ' stroke-dasharray="4 3"'}/></g>`);
    g.push(dot(80, y, 3));
    g.push(dot(262, y, 3, { hollow: !route.delivered }));
    g.push(text(75, y + 3, String(route.origin), { size: 7, anchor: 'end' }));
    g.push(text(268, y + 3, String(route.destination), { size: 7 }));
    g.push(text(171, y - 13, String(route.carrier),
      { size: 6.5, anchor: 'middle', opacity: '.75' }));
  });
  const dead = routes.filter((r) => !r.delivered).length;
  return card('strands', 'Strand delivery routes',
    frame(W, H, g.join(''), {
      label: 'Each route thickens once per landing on it. An undelivered '
           + 'route stays dashed.' }),
    dead ? { note: `${dead} route${dead === 1 ? ' carries' : 's carry'} nothing, and stays drawn.` }
         : { note: 'Width is landings, so the load-bearing path looks like one.' });
}

export const GRID_COLUMNS = ['TASK', 'STATE', 'HOST', 'HARNESS', 'MODEL',
                             'RUN', 'PROOF', 'CTX'];

/** Overview grid doctrine -- every subject, one grid.
 *
 * EVE's overview: one dense, sortable, filterable table an operator can
 * live in. The antidote to a page of cards, and the only surface in the
 * library that shows every subject at once.
 *
 * An empty cell is never blank. Blank reads as zero or as fine; the word
 * is what makes it a gap. */
export function grid({ rows = [], columns = GRID_COLUMNS }) {
  if (!rows.length) {
    return card('grid', 'Overview grid doctrine', '',
      { mark: refusal('no subject was observed') });
  }
  const body = rows.map((row) => {
    const cells = columns.map((key) => {
      const value = row[key.toLowerCase()];
      const unknown = value === null || value === undefined || value === '';
      // Both dialects, deliberately: `data-unmeasured` says what this cell is to anyone
      // who knows the attribute, and the mark says it in the one vocabulary the honesty
      // rack counts. A private dialect alone leaves `DECLARED STILL` at 0 over a refusal.
      return `<td${unknown ? ' data-unmeasured="1"' + attrs(refusal('the producer sent no value for this cell')) : ''}>${
        esc(unknown ? UNMEASURED : value)}</td>`;
    });
    return `<tr data-state="${esc(String(row.state || '').toLowerCase())}">${
      cells.join('')}</tr>`;
  });
  return card('grid', 'Overview grid doctrine',
    `<div class="cd-og-grid" data-drawing="grid"><table>
      <thead><tr>${columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${body.join('')}</tbody></table></div>`,
    { note: `${rows.length} subjects, no cards.` });
}

/** AT-field write scope -- the blast radius, drawn before the write.
 *
 * A list of four scopes with counts beside them is a table of reach. The
 * field is the point: each wider scope is drawn further out and fainter,
 * so the eye reads the escalation before it reads the numbers, and the
 * outermost ring -- everything -- is the one that looks least solid.
 *
 * Every scope is a projection of reach. Where no write route exists, none
 * of these is a permission, and the card says so under the drawing rather
 * than leaving the rings to imply it. */
export function atField({ scopes, writable = false,
                          cite = 'authority.evaluate' }) {
  if (!scopes || !scopes.length) {
    return card('at-field', 'AT-field write scope', '',
      { refusalWord: 'NO REACH COMPUTED',
    mark: still('no reach was computed') });
  }
  const cx = W / 2, cy = 92;
  const g = [];
  scopes.forEach((scope, i) => {
    const radius = 20 + i * 18;
    g.push(`<g class="cd-og-scope" data-scope="${esc(String(scope.label).toLowerCase())}"`
      + `${attrs(trace(true, { cite, order: i, total: scopes.length }))}>`
      + hexCell(cx, cy, radius, { width: 1.4, dashed: i > 0,
          extra: `opacity="${(0.95 - i * 0.2).toFixed(2)}"` }) + '</g>');
    // Above its own ring, not on it. Inside, each label sat on the line it
    // was naming.
    g.push(text(cx, cy - radius - 3, scope.label,
      { size: 7, anchor: 'middle', opacity: (0.95 - i * 0.16).toFixed(2) }));
    // The counts live in the readout below. On the rings they landed on
    // one baseline and read as a single row of numbers rather than as one
    // number per scope.
  });
  scopes.forEach((scope, i) => {
    const y = 172 - (scopes.length - 1 - i) * 12;
    const counted = scope.count != null;
    const reached = scope.reach != null;
    const row = [
      text(PAD, y, `${scope.label}  ${counted ? scope.count : UNMEASURED}`,
        { size: 6.5, opacity: counted ? '.7' : '.45' }),
      text(W - PAD, y, reached ? scope.reach : UNMEASURED,
        { size: 6.5, anchor: 'end', opacity: reached ? '.5' : '.35' }),
    ].join('');
    // A scope nobody counted keeps its row. On the departure board a blank flap
    // still occupies its cell, sits between its printed neighbours, and waits out
    // its own flip timing: absence is a character, not a deletion. The template used
    // to interpolate the count straight in, so the ordinary state "nobody counted
    // this scope" printed the word `undefined` into a reader's picture. Count and
    // reach each sit in their own space on the line that names them, which is also
    // the rule that a number may never rest where a neighbour's name can lend it
    // its own (finding #12).
    //
    // The stillness is stamped because the ink is not enough. A reviewer reading the
    // page sees UNMEASURED; the honesty rack counts a `data-motion="still"` with a
    // reason, and twelve components had been drawing absences nobody could query.
    // This is a measured gap, not a refusal: the world came up short, the component
    // did not decline, so it carries a plain stillness and never a `data-refusal`.
    g.push(counted && reached ? row
      : `<g${attrs(still(counted
        ? 'no reach was reported for this scope'
        : 'no count was computed for this scope'))}>${row}</g>`);
  });
  return card('at-field', 'AT-field write scope',
    frame(W, H, g.join(''), {
      label: 'Four write scopes as rings: each wider one is drawn further '
           + 'out and fainter.' }),
    { note: writable
        ? 'Every scope is a permission this identity actually holds.'
        : 'No write route exists, so every scope is reach and not permission.' });
}
