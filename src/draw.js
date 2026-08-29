// The drawing primitives every component shares.
//
// Two rules hold for everything here, and both are why the components on
// top of it stay honest.
//
// Colour is never a literal. Shapes inherit `currentColor` and the caller
// picks the token by setting `color` on an ancestor, so a shape cannot
// carry a palette the theme has never heard of. That is also what makes
// all of this work in both themes without a second copy.
//
// Geometry is never a claim. `wall()` draws one cell per counted thing
// and returns null when the count is null -- an unmeasured population
// drawn as an empty grid reads as a measured zero, which is the failure
// the whole library exists to prevent. Same reason `curve()` refuses to
// draw through fewer than two samples: one sample is a point, and a chart
// drawn through one point is the most convincing lie a time series can
// tell.
//
// These return SVG fragments, not sized elements. The caller wraps them
// in `frame()`, which sets a viewBox and lets CSS size the result, so a
// drawing is legible at 390px and at 1440px without a second layout.

export const SCHEMA = 'cyberdeck.draw/1';

// The diagonal hatch that means "no instrument reported this". One
// definition, referenced by id, so every unmeasured region in the system
// is the same texture at the same angle -- an operator learns it once.
export const HATCH_ID = 'cd-hatch-unmeasured';

// A refusal is a different claim from an unmeasured region, and until these
// were two textures it could not be told from one. `hatched` means *this
// quantity exists and no instrument reported it* -- a gap inside a live
// drawing. A refusal means *the library holds nothing to draw here*, which is
// a fact about the data source, not the world. Same ink, same 45-degree
// texture, same dashed border: so a sparse board and a blind board were one
// picture, in seven components. The refusal is a crosshatch inside a SOLID
// border -- a different shape, not just a different colour, because a
// distinction that only survives in hue is gone in monochrome and gone to
// about eight percent of men.
// A refusal is a different claim from an unmeasured region, and until these were
// two textures it could not be told from one. `hatched` means *this quantity
// exists and no instrument reported it* — a gap inside a live drawing. A refusal
// means *the library holds nothing to draw here*, which is a fact about the data
// source, not the world. Same ink, same 45-degree texture, same dashed border: so
// a sparse board and a blind board were one picture, in seven components.
//
// The refusal is a CROSSHATCH inside a solid border — a different shape, not
// merely a different colour, because a distinction carried only in hue is gone in
// monochrome and gone to about eight percent of men. It is built from two passes
// of the one existing texture, the second mirrored about the region's centre,
// which rotates its 45-degree lines to 135. Mirrored rather than rotated because
// a rotation does not preserve a rectangular box, and a band that moved out of
// its box would be a refusal that no longer describes the thing it refuses.
//
// It adds no `<pattern>` of its own on purpose: the defs block is contract-held by
// test/draw-contract.json, byte for byte, against the implementation this library
// was ported from. A texture that can be composed from the primitives without
// touching the port is composed, not added.
export const REFUSAL_CLASS = 'cd-refusal';

const DEFS =
  '<defs>'
  + `<pattern id="${HATCH_ID}" width="6" height="6" patternUnits="userSpaceOnUse" `
  + 'patternTransform="rotate(45)">'
  + '<line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" '
  + 'stroke-width="1.4" opacity=".55"/>'
  + '</pattern>'
  + '<pattern id="cd-scanlines" width="3" height="3" patternUnits="userSpaceOnUse">'
  + '<rect width="3" height="1" fill="currentColor" opacity=".14"/>'
  + '</pattern>'
  + '</defs>';

const esc = (v) => String(v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

/** Coordinates as short decimals. Full float precision in path data makes
 * a diff between two renders unreadable, and the byte-identical capture
 * the review depends on harder to eyeball. */
const num = (v) => {
  const s = Number(v).toFixed(2);
  return s.replace(/0+$/, '').replace(/\.$/, '') || '0';
};

const tail = (extra) => (extra ? ' ' + extra : '');

/** One drawing.
 *
 * `label` is what a screen reader gets instead of the geometry; a
 * decorative frame passes null and is hidden outright rather than read
 * out as a list of coordinates.
 *
 * `fit` defaults to left-aligned rather than centred: a drawing capped in
 * height by CSS on a wide screen centres itself away from the header that
 * names it, and a drawing that has drifted from its own label reads as
 * decoration.
 *
 * `scale` gives the drawing an intrinsic size in CSS pixels. Anything
 * drawn at true scale needs it -- a wall of three cells stretched to the
 * width of a 1440px page is three enormous hexagons, the exact opposite
 * of what a scale crush is for. */
export function frame(width, height, body, {
  cls = '', label = null, extra = '', fit = null, scale = null } = {}) {
  const size = scale === null ? ''
    : ` width="${num(width * scale)}" height="${num(height * scale)}"`;
  const a11y = label
    ? `role="img" aria-label="${esc(label)}"`
    : 'aria-hidden="true" focusable="false"';
  return `<svg class="cd-draw${cls ? ' ' + esc(cls) : ''}" `
    + `viewBox="0 0 ${num(width)} ${num(height)}"${size} `
    + `preserveAspectRatio="${esc(fit || 'xMinYMid meet')}" ${a11y}`
    + `${tail(extra)}>${DEFS}${body}</svg>`;
}

// ------------------------------------------------------------- shapes

/** Point-up by default, the orientation a fleet comb uses. `flat` gives
 * the flat-top hex a territory map draws. */
export function hexagon(cx, cy, r, { flat = false } = {}) {
  const turn = flat ? 0 : Math.PI / 6;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    pts.push(num(cx + r * Math.cos((Math.PI / 3) * i + turn))
      + ',' + num(cy + r * Math.sin((Math.PI / 3) * i + turn)));
  }
  return pts.join(' ');
}

export const hexCell = (cx, cy, r, {
  fill = null, width = 1, dashed = false, flat = false, extra = '' } = {}) =>
  `<polygon points="${hexagon(cx, cy, r, { flat })}" fill="${fill || 'none'}" `
  + `stroke="currentColor" stroke-width="${num(width)}"`
  + `${dashed ? ' stroke-dasharray="3 3"' : ''}${tail(extra)}/>`;

export const rect = (x, y, w, h, {
  fill = null, width = 1, dashed = false, extra = '' } = {}) =>
  `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" `
  + `fill="${fill || 'none'}" stroke="currentColor" stroke-width="${num(width)}"`
  + `${dashed ? ' stroke-dasharray="3 3"' : ''}${tail(extra)}/>`;

export const line = (x1, y1, x2, y2, { width = 1, dashed = false, extra = '' } = {}) =>
  `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" `
  + `stroke="currentColor" stroke-width="${num(width)}"`
  + `${dashed ? ' stroke-dasharray="4 3"' : ''}${tail(extra)}/>`;

export const dot = (cx, cy, r, { hollow = false, width = 1, extra = '' } = {}) =>
  `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(r)}" `
  + `fill="${hollow ? 'none' : 'currentColor'}" stroke="currentColor" `
  + `stroke-width="${num(width)}"${tail(extra)}/>`;

export const ring = (cx, cy, r, { dashed = false, width = 1, extra = '' } = {}) =>
  `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(r)}" fill="none" `
  + `stroke="currentColor" stroke-width="${num(width)}"`
  + `${dashed ? ' stroke-dasharray="3 4"' : ''}${tail(extra)}/>`;

/** A stroked arc between two angles in radians, drawn the short way. */
export function arc(cx, cy, r, start, end, { width = 1, dashed = false, extra = '' } = {}) {
  const large = ((end - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) > Math.PI ? 1 : 0;
  return `<path d="M ${num(cx + r * Math.cos(start))} ${num(cy + r * Math.sin(start))} `
    + `A ${num(r)} ${num(r)} 0 ${large} 1 `
    + `${num(cx + r * Math.cos(end))} ${num(cy + r * Math.sin(end))}" fill="none" `
    + `stroke="currentColor" stroke-width="${num(width)}"`
    + `${dashed ? ' stroke-dasharray="4 3"' : ''}${tail(extra)}/>`;
}

/** A filled pie slice -- a radar's swept sector. */
export function wedge(cx, cy, r, start, end, { opacity = '.12', extra = '' } = {}) {
  const large = ((end - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) > Math.PI ? 1 : 0;
  return `<path d="M ${num(cx)} ${num(cy)} `
    + `L ${num(cx + r * Math.cos(start))} ${num(cy + r * Math.sin(start))} `
    + `A ${num(r)} ${num(r)} 0 ${large} 1 `
    + `${num(cx + r * Math.cos(end))} ${num(cy + r * Math.sin(end))} Z" `
    + `fill="currentColor" opacity="${esc(opacity)}" stroke="none"${tail(extra)}/>`;
}

/** A magnetised bar with a head. Every needle in a field is the same
 * length: direction is measured, magnitude is not, and a longer needle
 * would be read as a stronger pull nobody recorded. */
export function needle(cx, cy, length, angle, { width = 1.4, extra = '' } = {}) {
  const dx = length * Math.cos(angle);
  const dy = length * Math.sin(angle);
  const body = line(cx - dx, cy - dy, cx + dx, cy + dy, { width })
    + dot(cx + dx, cy + dy, 2);
  return extra ? `<g ${extra}>${body}</g>` : body;
}

export const text = (x, y, value, {
  size = 8, anchor = 'start', weight = null, opacity = null, family = null } = {}) =>
  `<text x="${num(x)}" y="${num(y)}" font-size="${num(size)}" `
  + `text-anchor="${esc(anchor)}" fill="currentColor"`
  + `${weight ? ` font-weight="${esc(weight)}"` : ''}`
  + `${opacity ? ` opacity="${esc(opacity)}"` : ''}`
  + `${family ? ` font-family="${esc(family)}"` : ''}>${esc(value)}</text>`;

// ------------------------------------------------------------ textures

/** A region nobody measured. Hatch rather than leave blank: a blank
 * region reads as a quiet one, and quiet is a measurement. */
export const hatched = (x, y, w, h, { extra = '' } = {}) =>
  `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" `
  + `fill="url(#${HATCH_ID})" stroke="currentColor" stroke-width="1" `
  + `stroke-dasharray="3 3"${tail(extra)}/>`;

/** A region the library cannot draw at all. Crosshatched and SOLID-edged:
 * the dashed border belongs to a gap inside a live measurement, and a
 * refusal has no live measurement to be a gap inside of. */
/** A region the library cannot draw at all: crosshatched, and grouped under
 * `.cd-refusal` so the stylesheet can give it refusal ink and a solid border.
 * The dashed border belongs to a gap inside a live measurement, and a refusal
 * has no live measurement to be a gap inside of. */
export const refusalHatched = (x, y, w, h, { extra = '' } = {}) => {
  const cx = x + w / 2;
  return `<g class="${REFUSAL_CLASS}"${tail(extra)}>`
    + hatched(x, y, w, h)
    + `<g transform="translate(${num(cx * 2)} 0) scale(-1 1)">${hatched(x, y, w, h)}</g>`
    + '</g>';
};

export const scanlines = (x, y, w, h) =>
  `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" `
  + 'fill="url(#cd-scanlines)" stroke="none"/>';

/** Grain creeping in from the edges of a panel as `density` rises.
 *
 * Deterministic on purpose. Math.random() is fine for a picture and wrong
 * here: a review captures a page byte-for-byte, and a field that
 * reshuffles every render turns every capture into a diff.
 *
 * `density` is 0..1 and comes from something measured. There is no call
 * for an unmeasured subject -- the caller draws nothing at all rather
 * than a clean panel, because a clean panel is what a fresh session looks
 * like. */
export function staticField(x, y, w, h, { density, seed = 0, inset = 26 } = {}) {
  const d = Math.max(0, Math.min(1, Number(density)));
  if (!(d > 0)) return '';
  const marks = [];
  // Same LCG as the reference implementation, kept in 32-bit space so the
  // two agree grain for grain rather than merely looking similar.
  let state = Number(BigInt.asUintN(32,
    BigInt(seed) * 6364136223846793005n + 1442695040888963407n));
  const step = () => {
    state = Number(BigInt.asUintN(31, BigInt(state) * 1103515245n + 12345n));
    return state;
  };
  const count = Math.trunc(240 * d) + 40;
  for (let i = 0; i < count; i++) {
    const px = x + ((step() % 10000) / 10000) * w;
    const py = y + ((step() % 10000) / 10000) * h;
    const roll = (step() % 10000) / 10000;
    const edge = Math.min(px - x, x + w - px, py - y, y + h - py);
    if (roll > Math.min(1, edge / inset) * (1 - d) + d * 0.15) continue;
    marks.push(`<rect x="${num(px)}" y="${num(py)}" width="1.6" height="1.6" `
      + `fill="currentColor" opacity="${step() % 2 ? '.35' : '.6'}"/>`);
  }
  return marks.join('');
}

// ------------------------------------------------------ counted things

/** One cell per counted thing, at true scale.
 *
 * Returns { body, width, height } or null when `count` is null. Null is
 * the whole reason this helper exists: a board nobody enumerated has no
 * wall, and drawing an empty grid for it claims a measurement nobody
 * made. Callers render the honest-empty state instead.
 *
 * `marked` is the set of indices that bleed. Nothing else takes a colour:
 * the crush only works if the eye finds the marked cells against a field
 * that is otherwise uniform.
 *
 * `mark` is an optional callback taking the cell index and returning
 * extra attributes for that cell -- how a caller staggers the wall by the
 * count it already established, without building a parallel array as long
 * as the wall to say one thing about every cell in it. */
export function wall(count, {
  columns = 32, r = 5.2, gap = 1.6, marked = [], flat = false, mark = null } = {}) {
  if (count === null || count === undefined) return null;
  const n = Math.trunc(count);
  if (n < 0) return null;
  const cols = Math.max(1, Math.trunc(columns));
  const hot = new Set(marked || []);
  const stepX = r * 1.5 + gap;
  const stepY = r * Math.sqrt(3) + gap;
  const cells = [];
  let rows = 0;
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.trunc(i / cols);
    rows = Math.max(rows, row + 1);
    const cx = r + col * stepX;
    const cy = r + row * stepY + (col % 2 ? stepY / 2 : 0);
    const bleeds = hot.has(i);
    let attrs = bleeds ? 'opacity=".85" class="cd-bleed"' : 'opacity=".34"';
    if (mark) attrs += (mark(i) || '');
    cells.push(hexCell(cx, cy, r, {
      flat, width: bleeds ? 1.5 : 0.8,
      fill: bleeds ? 'currentColor' : 'none', extra: attrs }));
  }
  return {
    body: cells.join(''),
    width: r * 2 + Math.max(0, Math.min(n, cols) - 1) * stepX,
    height: r * 2 + Math.max(0, rows - 1) * stepY + (rows > 1 ? stepY / 2 : 0),
  };
}

/** A line through measured samples, or null.
 *
 * `samples` is a sequence of [x, y] already in 0..1. Fewer than two and
 * this returns null rather than a flat line or one wide dot. */
export function curve(samples, { width, height, dashed = false, stroke = 1.4 } = {}) {
  const pts = (samples || []).filter((p) => p !== null && p !== undefined);
  if (pts.length < 2) return null;
  return `<polyline points="${pts.map(([px, py]) =>
    num(px * width) + ',' + num((1 - py) * height)).join(' ')}" `
    + `fill="none" stroke="currentColor" stroke-width="${num(stroke)}"`
    + `${dashed ? ' stroke-dasharray="4 3"' : ''}/>`;
}

/** An empty time axis. Drawn even when no series exists, because the
 * frame is what tells an operator a recorder was supposed to be here. */
export function axis(width, height, { ticks = 4 } = {}) {
  const marks = [line(0, height, width, height, { width: 1 })];
  for (let i = 0; i <= ticks; i++) {
    const px = (width * i) / ticks;
    marks.push(line(px, height, px, height - 3, { width: 1 }));
  }
  return marks.join('');
}
