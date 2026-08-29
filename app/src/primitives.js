// The drawing exports, each one shown drawing.
//
// `src/draw.js` is the vocabulary: seventeen exports that return strings of SVG,
// used by every component in the library and by nothing else. It is listed here
// rather than described because the claim on this page is the same one the
// component pages make -- the thing on screen is the export running -- and
// `test/app-rules.test.mjs` walks the module's exports and fails if any of them is
// missing from this list, so the gallery cannot fall behind the file.
//
// The notes are quoted out of `draw.js`. Where a shape has no doc comment there is
// no note, rather than a sentence written to fill the space.

import {
  frame, hexagon, hexCell, rect, line, dot, ring, arc, wedge, needle, text,
  hatched, refusalHatched, REFUSAL_CLASS, scanlines, staticField, wall, curve, axis,
} from '../../src/draw.js';

const W = 208;
const H = 60;
const show = (body, label = null) => frame(W, H, body, { label });

export const PRIMITIVES = [
  {
    name: 'frame',
    call: 'frame(width, height, body, { cls, label, extra, fit, scale })',
    note: 'gives the drawing an intrinsic size in CSS pixels.',
    html: () => show(rect(12, 12, 184, 36, { width: 1 }) + text(20, 34, 'every drawing is inside one of these', { size: 8 }), 'an SVG frame with a viewBox'),
  },
  {
    name: 'hexagon',
    call: 'hexagon(cx, cy, r, { flat })',
    note: 'Point-up by default, the orientation a fleet comb uses.',
    html: () => show(`<polygon points="${hexagon(56, 30, 20)}" fill="none" stroke="currentColor" stroke-width="1"/>`
      + `<polygon points="${hexagon(140, 30, 20, { flat: true })}" fill="none" stroke="currentColor" stroke-width="1"/>`
      + text(184, 34, 'flat', { size: 8, opacity: '.6' }), 'two hexagons, point-up and flat-top'),
  },
  {
    name: 'hexCell',
    call: 'hexCell(cx, cy, r, { fill, width, dashed, flat, extra })',
    html: () => show([0, 1, 2, 3].map((i) => hexCell(30 + i * 46, 30, 18, {
      fill: i === 1 ? 'currentColor' : null,
      dashed: i === 2,
      width: i === 3 ? 2 : 1,
    })).join(''), 'four hex cells: filled, hollow, dashed, heavy'),
  },
  {
    name: 'rect',
    call: 'rect(x, y, w, h, { fill, width, dashed, extra })',
    html: () => show(rect(16, 16, 80, 28) + rect(112, 16, 80, 28, { dashed: true }), 'a rectangle, solid and dashed'),
  },
  {
    name: 'line',
    call: 'line(x1, y1, x2, y2, { width, dashed, extra })',
    html: () => show(line(16, 22, 192, 22) + line(16, 40, 192, 40, { dashed: true, width: 2 }), 'two lines'),
  },
  {
    name: 'dot',
    call: 'dot(cx, cy, r, { hollow, width, extra })',
    html: () => show([0, 1, 2, 3].map((i) => dot(36 + i * 46, 30, 4 + i * 2, { hollow: i % 2 === 1 })).join(''), 'four dots'),
  },
  {
    name: 'ring',
    call: 'ring(cx, cy, r, { dashed, width, extra })',
    html: () => show(ring(60, 30, 20) + ring(150, 30, 20, { dashed: true }), 'two rings'),
  },
  {
    name: 'arc',
    call: 'arc(cx, cy, r, start, end, { width, dashed, extra })',
    note: 'A stroked arc between two angles in radians, drawn the short way.',
    html: () => show(arc(60, 44, 30, Math.PI, Math.PI * 1.5, { width: 2 })
      + arc(150, 44, 30, Math.PI * 1.1, Math.PI * 1.9, { dashed: true }), 'two arcs'),
  },
  {
    name: 'wedge',
    call: 'wedge(cx, cy, r, start, end, { opacity, extra })',
    note: "A filled pie slice -- a radar's swept sector.",
    html: () => show(ring(104, 32, 26) + wedge(104, 32, 26, -Math.PI / 2, -Math.PI / 3, { opacity: '.35' }), 'a swept sector'),
  },
  {
    name: 'needle',
    call: 'needle(cx, cy, length, angle, { width, extra })',
    note: 'Every needle in a field is the same length: direction is measured, magnitude is not',
    html: () => show([0, 1, 2, 3, 4].map((i) => needle(30 + i * 38, 30, 14, (i * Math.PI) / 5)).join(''), 'a needle field'),
  },
  {
    name: 'text',
    call: 'text(x, y, value, { size, anchor, weight, opacity, family })',
    html: () => show(text(16, 26, 'SVG text does not wrap', { size: 11, weight: 'bold' })
      + text(16, 44, 'so a long value is cut by hand', { size: 8, opacity: '.7' }), 'two lines of drawing text'),
  },
  {
    name: 'hatched',
    call: 'hatched(x, y, w, h, { extra })',
    note: 'A region nobody measured. Hatch rather than leave blank: a blank region reads as a quiet one, and quiet is a measurement.',
    html: () => show(hatched(16, 14, 176, 32), 'a hatched region'),
  },
  {
    name: 'refusalHatched',
    call: 'refusalHatched(x, y, w, h, { extra })',
    note: 'A region the library cannot draw at all: crosshatched, and grouped under '
        + '`.cd-refusal` so the stylesheet can give it refusal ink and a solid border. '
        + 'The dashed border belongs to a gap inside a live measurement, and a refusal '
        + 'has no live measurement to be a gap inside of.',
    html: () => show(refusalHatched(16, 14, 176, 32), 'a crosshatched refusal'),
  },
  {
    name: 'scanlines',
    call: 'scanlines(x, y, w, h)',
    html: () => show(scanlines(16, 14, 176, 32), 'a scanline wash'),
  },
  {
    name: 'staticField',
    call: 'staticField(x, y, w, h, { density, seed, inset })',
    note: 'Math.random() is fine for a picture and wrong here: a review captures a page byte-for-byte',
    html: () => show(rect(16, 12, 176, 36, { width: 0.8 }) + staticField(16, 12, 176, 36, { density: 0.55, seed: 3 }), 'grain at a measured density'),
  },
  {
    name: 'wall',
    call: 'wall(count, { columns, r, gap, marked, flat, mark })',
    note: 'Nothing else takes a colour: the crush only works if the eye finds the marked cells against a field that is otherwise uniform.',
    html: () => {
      const built = wall(64, { columns: 16, marked: [19, 22, 37] });
      return frame(Math.max(W, Math.round(built.width)), Math.max(H, Math.round(built.height) + 8),
        `<g transform="translate(4 8)">${built.body}</g>`, 'a crush wall with three cells bleeding');
    },
  },
  {
    name: 'curve',
    call: 'curve(samples, { width, height, dashed, stroke })',
    note: 'A line through measured samples, or null.',
    html: () => show(axis(176, 44) + curve([[0, 0.2], [0.25, 0.45], [0.5, 0.3], [0.75, 0.8], [1, 0.62]], { width: 176, height: 40 })
      , 'a curve over an axis'),
  },
  {
    name: 'axis',
    call: 'axis(width, height, { ticks })',
    note: 'An empty time axis. Drawn even when no series exists, because the frame is what tells an operator a recorder was supposed to be here.',
    html: () => show(axis(176, 40), 'an empty axis'),
  },
];

/** Names only, for the coverage test that keeps this list honest. */
export const PRIMITIVE_NAMES = PRIMITIVES.map((p) => p.name);
