// DECISION -- who may act, and who agreed.
//
// The ladder answers "may I". These five answer questions about the
// DECISION rather than the verb: who judged, what could be seen while
// judging, which key was actually turned, which barriers were tested, and
// who is allowed to see the answer.

import { frame, rect, line, dot, hexCell, text } from '../draw.js';
import { trace, count, still, attrs } from '../marks.js';
import { card, esc, wrapped, W, H } from './card.js';

const PAD = 12;
const SPAN = W - PAD * 2;

/** The producers that can contribute to a subject's state. Named here
 * rather than discovered, because the set of judges must be knowable when
 * NONE of them answers -- a quorum measured against whoever happened to
 * reply is not a quorum. */
export const JUDGES = [
  ['SALUD', 'Canonical truth. The only producer allowed to assert state.'],
  ['KANPAI', 'The orchestrator. Mutates; never the source of truth.'],
  ['HARNESS', "The worker's own runtime. Closest to the work, least neutral."],
];

const STANDING = { spoke: 'CONTRIBUTED', silent: 'SILENT', unreachable: 'UNREACHABLE' };

/** MAGI dissent panel -- who judged, not what was judged.
 *
 * Three supercomputers vote and the operator sees the SPLIT, not the
 * summary. That is the whole design: a 2-1 and a 3-0 are different facts,
 * and a console printing only the outcome has destroyed the more
 * important one.
 *
 * A fleet typically receives one collapsed state per subject and a list
 * of which producers contributed to it -- never a verdict per producer.
 * So this panel draws who spoke and who was silent, and rules the
 * agreement itself unmeasured. A dissent panel that invents a 3-0 out of
 * one number is the exact failure it exists to prevent.
 *
 * Three seats arranged as three seats. A row of cards is a list of
 * producers; the triangle is the argument -- three independent readings
 * converging on one subject, none subordinate to the others. */
export function magi({ seats, collapsedState = null,
                       cite = 'source.per_producer_verdicts()' }) {
  if (!seats || seats.length !== 3) {
    return card('magi', 'MAGI dissent panel', '',
      { mark: still('a dissent panel needs its full bench') });
  }
  const cx = W / 2;
  const points = [[cx, 34], [PAD + 40, 132], [W - PAD - 40, 132]];
  const g = [`<g class="cd-dc-frame">`
    + points.map((p, i) => line(p[0], p[1], points[(i + 1) % 3][0],
        points[(i + 1) % 3][1], { dashed: true })).join('') + '</g>'];
  g.push(`<g class="cd-dc-subject">`
    + hexCell(cx, 92, 24, { dashed: true })
    + text(cx, 95, String(collapsedState || 'UNMEASURED').toUpperCase().slice(0, 11),
        { size: 7.5, anchor: 'middle' }) + '</g>');
  seats.forEach((seat, i) => {
    const [sx, sy] = points[i];
    g.push(`<g class="cd-dc-seat" data-standing="${esc(seat.standing)}"`
      + `${attrs(trace(seat.standing === 'spoke', { cite: 'seats[].standing', order: i, total: 3 }))}>`
      + hexCell(sx, sy, 26, { dashed: seat.standing !== 'spoke',
          extra: 'fill="currentColor" fill-opacity=".07"' })
      + text(sx, sy - 1, seat.label.slice(0, 9), { size: 8, anchor: 'middle' })
      + text(sx, sy + 10, STANDING[seat.standing] || 'UNKNOWN',
          { size: 6, anchor: 'middle', opacity: '.8' })
      + '</g>');
  });
  const spoke = seats.filter((s) => s.standing === 'spoke').length;
  g.push(text(PAD, 170, 'AGREEMENT UNMEASURED', { size: 9, weight: '600' }));
  g.push(text(PAD, 182,
    `${spoke} of ${seats.length} producers contributed to `
    + String(collapsedState || 'UNMEASURED').toUpperCase(),
    { size: 6.5, opacity: '.6' }));
  g.push(text(PAD, 193, cite, { size: 6, opacity: '.45' }));
  return card('magi', 'MAGI dissent panel',
    frame(W, H, g.join(''), {
      label: 'Three seats around one subject. Which seat spoke is drawn; no '
           + 'verdict is, because none is supplied.' }),
    { note: 'No producer supplies a verdict, so no split may be drawn.' });
}

/** The asymmetry the glass never closes, stated rather than implied. */
export const GLASS_ASYMMETRY =
  'The subject supplies nothing about being observed. This cell is a window '
  + 'in one direction only, and no producer will ever change that.';

/** Glass-cell review -- both halves at the same weight.
 *
 * Sessions watched through glass, and the subject is the asymmetry: the
 * observer believes the glass is a window and it is also a wall. Every
 * review surface has that shape.
 *
 * Two columns of rows would put reviewer and subject side by side as
 * equals. They are not equals, and that is the whole specimen. So the
 * glass is drawn, the fields that pass cross it, the ones it blocks stop
 * AGAINST it, and the sightline runs one way only. */
export function glassCell({ passed = [], blocked = [],
                            asymmetry = GLASS_ASYMMETRY }) {
  const pane = 176, top = 16, height = 118;
  const g = [rect(PAD, top, pane - PAD - 12, height),
             rect(pane + 12, top, W - PAD - pane - 12, height, { dashed: true })];
  g.push(`<g class="cd-dc-glass">`
    + line(pane, top - 6, pane, top + height + 6, { width: 2, dashed: true }) + '</g>');
  g.push(text(PAD + 4, top + 12, 'SUBJECT', { size: 7.5 }));
  g.push(text(pane + 16, top + 12, 'REVIEWER', { size: 7.5 }));
  const rows = passed.length + blocked.length;
  const step = (height - 40) / Math.max(rows, 1);
  let y = top + 28;
  passed.forEach((_row, i) => {
    g.push(`<g class="cd-dc-through"`
      + `${attrs(trace(true, { cite: 'glass.passed[]', order: i, total: passed.length }))}>`
      + line(PAD + 4, y, pane + 40, y, { width: 1.4 }) + '</g>');
    y += step;
  });
  blocked.forEach((row) => {
    // Stopped against the pane. That is the only difference that matters,
    // and it is a shape rather than a colour.
    g.push(`<g class="cd-dc-blocked" data-why="${esc(row.why || 'unmeasured')}"`
      + `${attrs(still('the glass blocks this one'))}>`
      + line(PAD + 4, y, pane - 6, y, { width: 1.4, dashed: true })
      + dot(pane - 6, y, 2.4) + '</g>');
    y += step;
  });
  g.push(`<g class="cd-dc-sightline"${attrs(trace(true, { cite: 'glass.sightline' }))}>`
    + line(W - PAD - 8, top + height - 8, pane + 6, top + height - 8, { width: 1.2 })
    + text(W - PAD - 12, top + height - 12, 'SEES',
        { size: 6.5, anchor: 'end' }) + '</g>');
  g.push(text(PAD, 154, `PASSES ${passed.length}  ·  BLOCKS ${blocked.length}`,
    { size: 8, weight: '600' }));
  g.push(wrapped(PAD, 168, asymmetry, 62, { size: 6.5, opacity: '.6' }, 9));
  return card('glass', 'Glass-cell review',
    frame(W, H, g.join(''), {
      label: `One pane. ${passed.length} fields cross it, ${blocked.length} `
           + 'stop against it, and the sightline runs one way.' }),
    { note: 'A window in one direction only.' });
}

/** The doors, outermost first. Same order as the authority ladder, so an
 * operator who has learned to read one has learned to read the other. */
export const DOORS = [
  ['EFFECTIVE MODE', 'The deck itself must be in an acting mode.'],
  ['OPERATOR SESSION', 'A session must reach this render.'],
  ['OPERATOR IDENTITY', 'The session must be bound to a person.'],
  ['COMMAND ADAPTER', "The orchestrator's boundary must be reachable."],
  ['ORCHESTRATOR VERB', 'The orchestrator must expose this mutation.'],
  ['SUBJECT PERMIT', 'The producer must say the subject allows it.'],
  ['ACCEPTANCE CEREMONY', 'Irreversible verbs take two keys.'],
];

const DOOR_WORD = { open: 'TURNED', shut: 'HELD SHUT', not_reached: 'NOT REACHED' };

/** Keycard access trace -- a door, an instant, a card.
 *
 * Authority is not a property, it is a sequence of doors. A list of doors
 * with states beside them is a permissions table; the corridor is the
 * fact. The doors stand in order, you get as far as the first one held
 * shut, and every door past it is dashed because nobody tried it.
 *
 * An event with no timestamp is drawn UNSTAMPED and loud. An access trace
 * whose order cannot be established is not a trace -- it is a list. */
export function keycard({ doors, unstamped = 0 }) {
  if (!doors || !doors.length) {
    return card('keycard', 'Keycard access trace', '',
      { mark: still('no corridor was described') });
  }
  const slot = SPAN / doors.length;
  const top = 26, height = 92;
  const g = [line(PAD, top + height, PAD + SPAN, top + height, { width: 1 })];
  doors.forEach((door, i) => {
    const x = PAD + i * slot + 2;
    const w = slot - 6;
    g.push(`<g class="cd-dc-door" data-state="${esc(door.state)}"`
      + `${attrs(trace(door.state !== 'not_reached', { cite: 'doors[].state', order: i, total: doors.length }))}>`
      + rect(x, top, w, height - 14, { dashed: door.state === 'not_reached',
          width: door.state === 'shut' ? 2 : 1 })
      // A turned door is drawn OPEN: the leaf swung back against the
      // frame. That is a different shape, not a green tint.
      + (door.state === 'open' ? line(x + w, top, x + w - 6, top + height - 20,
          { width: 1.4 }) : '')
      + (door.state === 'shut' ? line(x, top + height - 22, x + w,
          top + height - 22, { width: 3 }) : '')
      + '</g>');
    g.push(wrapped(x + w / 2, top + height + 10, door.label, 10,
      { size: 5.5, anchor: 'middle' }, 7));
  });
  const shut = doors.findIndex((d) => d.state === 'shut');
  const untried = doors.filter((d) => d.state === 'not_reached').length;
  g.push(text(PAD, 152, shut >= 0 ? `HELD AT ${doors[shut].label}` : 'EVERY DOOR TURNED',
    { size: 8, weight: '600' }));
  g.push(`<g class="cd-dc-untested" data-any="${untried ? 1 : 0}">`
    + text(PAD, 165, `${untried} not reached`, { size: 6.5 }) + '</g>');
  if (unstamped) {
    g.push(`<g class="cd-dc-unstamped"${attrs(still('these events carry no instant'))}>`
      + text(PAD, 184, `UNORDERABLE · ${unstamped} EVENT${unstamped === 1 ? '' : 'S'} CARRY NO INSTANT`,
          { size: 7.5 }) + '</g>');
  }
  return card('keycard', 'Keycard access trace',
    frame(W, H, g.join(''), {
      label: 'The doors in order. You get as far as the first one held shut; '
           + 'every door past it is dashed because nobody tried it.' }),
    unstamped
      ? { note: 'A trace whose order cannot be established is a list.' }
      : { note: 'Authority is a sequence of doors, not a property.' });
}

/** ICE / countermeasure walls -- depth, and what was never tested.
 *
 * The layers past the one that stopped you are not layers you beat. The
 * ladder stops at the first missing grant, so every check after it is
 * UNTESTED -- and every console that renders a checklist paints those
 * remaining rows green or grey. Both readings are wrong. NOT REACHED is
 * its own state, drawn in the cannot-see colour, because it is a thing
 * nobody knows.
 *
 * Indented rows say the layers are ordered. They do not say you are
 * standing outside the first one and cannot see past it. Nested
 * rectangles receding into the panel do. */
export function ice({ walls }) {
  if (!walls || !walls.length) {
    return card('ice', 'ICE / countermeasure walls', '',
      { mark: still('no barrier was described') });
  }
  const height = 168;
  // Derived from the count, and floored at nothing. A fixed step ran out
  // of panel at the fifth layer and silently stopped drawing the rest,
  // which is the omission this specimen is about -- and a MINIMUM step
  // reintroduces it at a higher wall count, where the innermost rects go
  // negative and vanish. The nesting gets tight instead.
  const step = (Math.min(SPAN, height) / 2 - 14) / walls.length;
  const g = [];
  walls.forEach((wall, i) => {
    const inset = 5 + i * step;
    g.push(`<g class="cd-dc-wall" data-state="${esc(wall.state)}"`
      + `${attrs(trace(wall.state !== 'not_reached', { cite: 'walls[].state', order: i, total: walls.length }))}>`
      + rect(PAD + inset, 8 + inset, SPAN - inset * 2, height - inset * 2, {
          dashed: wall.state === 'not_reached',
          width: wall.state === 'shut' ? 2 : 1,
          extra: `opacity="${Math.max(.28, 1 - i * .16).toFixed(2)}"` })
      + '</g>');
    g.push(`<g class="cd-dc-walllabel" data-state="${esc(wall.state)}">`
      + text(PAD + inset + 4, 8 + inset + 7, wall.label.slice(0, 22),
          { size: 6, opacity: Math.max(.4, 1 - i * .14).toFixed(2) }) + '</g>');
  });
  const untested = walls.filter((w) => w.state === 'not_reached').length;
  // The count of things nobody knows wears the colour of things nobody
  // knows. In the measured-and-well green it read as a result.
  g.push(`<g class="cd-dc-untested" data-any="${untested ? 1 : 0}">`
    + text(PAD, 192, `${untested} WALL${untested === 1 ? '' : 'S'} NOT REACHED`,
        { size: 8, weight: '600' }) + '</g>');
  return card('ice', 'ICE / countermeasure walls',
    frame(W, H, g.join(''), {
      label: 'Each layer is drawn behind the one in front of it. The wall '
           + 'that stopped you is solid; everything behind it is dashed.' }),
    { note: 'Untested is neither passed nor standing.' });
}

export const UNCONTRACTED = 'UNCONTRACTED';

/** Gevulot visibility contract -- what travels when this page does.
 *
 * Every fact carries the privacy contract it was shared under. Most
 * fleets supply a visibility contract for nothing at all, and the honest
 * render of that is not to paint every field PUBLIC. It is to draw every
 * field UNCONTRACTED, loud, and say that sharing this surface shares all
 * of it at once.
 *
 * A field with no stated contract is not a public one. */
export function gevulot({ fields, producer = 'configuration.visibility_contracts' }) {
  if (!fields || !fields.length) {
    return card('gevulot', 'Gevulot visibility contract', '',
      { mark: still('nothing on this surface is readable') });
  }
  const rows = fields.map((row) => {
    const contract = row.contract || UNCONTRACTED;
    const stated = contract !== UNCONTRACTED;
    return `<li data-stated="${stated ? 1 : 0}">
      <b>${esc(row.label)}</b><span>${esc(contract)}</span>
      <cite>${esc(row.path)}</cite></li>`;
  });
  const bare = fields.filter((f) => !f.contract || f.contract === UNCONTRACTED).length;
  return card('gevulot', 'Gevulot visibility contract',
    `<ul class="cd-dc-gevulot">${rows.join('')}</ul>
     <p class="cd-dc-ruling"><b>${bare === fields.length ? 'NO CONTRACT PRODUCER'
       : `${bare} OF ${fields.length} UNCONTRACTED`}</b>
       <span>Nothing here is marked public, because no producer has said it is
       — and a field with no stated contract is not a public one. Sharing this
       surface shares all ${fields.length} of them at once.</span></p>`,
    { note: `Producer that would say: ${producer}` });
}
