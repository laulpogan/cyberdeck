/** The furniture audit: the part of a drawing that is not a measurement must not move.
 *
 * `vault/SPECS.md`, off the verified survey grid (`rig--…2RO5SN…`): an orange grid with fixed
 * corner labels in which only the contact and a lit region change, and the measured claim that
 * four of twelve grid cells never move at all. That split is the reference's whole argument, and
 * it is the split this library keeps relearning — the axis that got `trace(true)` in three
 * components, the threshold line that animated, the sightline that traced itself.
 *
 * So this is the audit that would have caught them without a browser: for every bright model,
 * look for a mark on something whose role is furniture — an axis, a frame, a track, a ring, a
 * label, a legend, a caption, a tick — as opposed to a contact, a value, a bar, an answer.
 *
 * The list is judgement, so it is written out and argued below rather than hidden in a regex.
 * Where a class is genuinely both — `cd-og-window` is a bar and a container — it belongs on
 * MOVED_FURNITURE only if the moving thing is not the measurement.
 *
 *   node app/verify/furniture.mjs            # what moved that should have held still
 */
import { allComponents } from '../../app/src/registry/index.js';
import { brightFor } from '../../app/fixtures/index.js';

/** Class fragments whose name says "this is the drawing's furniture". */
const FURNITURE = [
  'axis', 'frame', 'grid-lines', 'track', 'rail', 'rule', 'legend', 'label',
  'caption', 'tick', 'mesh-ring', 'head-band', 'chrome',
];

/**
 * Class fragments that look like furniture and are not, each with the reason. Every entry is
 * a claim that the moving thing inside the name is the measurement, so each one is falsifiable
 * by reading the component.
 */
const NOT_FURNITURE = {
  // A lane is the thing being measured, not the thing it is drawn on: a lane with a series in
  // it carries samples, and `stripChart` throws if the series lane is not one it drew.
  'lane': 'a lane holds samples; a lane with a series in it is a measurement',
  // `cd-riv-series` is the retained history itself.
  'series': 'the series is the retained samples',
  // A dial whose sweep *is* the poll interval: the radar's cycle mark reports the period.
  'dial': 'the dial turns once per measured poll — the rotation is the reading',
  // The gauge arc is the measured integrity, not the scale it is drawn against.
  'arc': 'the arc is the measured extent',
  // A ring in the AT-field drawing is a scope, and a scope has a count.
  'scope': 'each ring is a write scope with its own count',
  // The board in the grid component is the table body — cells move in it, and the audit looks
  // at the element carrying the mark, not the container.
  'board': 'the board is the container; cells carry the marks',
};

export const marked = (html) => {
  const out = [];
  const open = /<([a-zA-Z][\w-]*)([^>]*)>/g;
  let match;
  while ((match = open.exec(html))) {
    const attrs = match[2];
    const motion = /\sdata-motion="([^"]+)"/.exec(attrs);
    if (!motion) continue;
    const cls = /\sclass="([^"]+)"/.exec(attrs);
    out.push({ tag: match[1], kind: motion[1], cls: cls ? cls[1] : '' });
  }
  return out;
};

export function audit() {
  const rows = [];
  for (const { key, fn } of allComponents()) {
    let html = '';
    try { html = fn(brightFor(key)); } catch { continue; }
    for (const m of marked(html)) {
      if (m.kind === 'still') continue;                     // a refusal is not motion
      const lower = ` ${m.cls.toLowerCase()} `;
      const excused = Object.keys(NOT_FURNITURE).find((word) => lower.includes(word));
      if (excused) continue;
      const hit = FURNITURE.find((word) => lower.includes(` ${word}`)
        || lower.includes(`${word}-`) || lower.includes(`-${word}`) || lower.includes(`${word} `));
      if (hit) rows.push({ key, ...m, furniture: hit });
    }
  }
  return rows;
}

const rows = audit();
if (rows.length) {
  console.log('marks on furniture — the drawing moved where only a measurement should:');
  for (const row of rows) {
    console.log(`  ${row.key.padEnd(14)}.${row.cls.padEnd(24)} data-motion="${row.kind}"  `
      + `(furniture word: ${row.furniture})`);
  }
  process.exitCode = 1;
} else {
  console.log('furniture holds still in every bright model: no axis, frame, track, label or '
    + 'legend carries a movement.');
}
