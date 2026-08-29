// A producer that sends no array at all still gets a drawing, not just a sentence.
//
// The full gate sweep caught this: under the evidence switch `esperDive` rendered an empty frame and
// `app/verify/drawing.mjs` said the only true thing about it — *loses its drawing entirely*. The card's
// refusal line printed either way, which is exactly why the check counts **region kinds** and not words:
// a caption is not a picture, and an operator comparing two cards should see where the levels would
// have stood. The board's argument (3), quoted in `vault/SPECS.md`: a blank flap occupies the cell,
// holds its position, and takes the same time to arrive as a digit.
import test from 'node:test';
import assert from 'node:assert/strict';

import { esperDive } from '../src/components/river.js';

const EMPTY = esperDive({ levels: [] });
const MEASURED = esperDive({ levels: [
  { label: 'SUBJECT', value: 'ses-4419', cite: 'sessions[].id' },
  { label: 'WORK ITEM', value: 'W-2211', cite: 'sessions[].work.id' },
] });

test('the empty dive draws the band where the levels would have stood', () => {
  assert.match(EMPTY, /class="cd-riv-empty"/,
    'the plate went blank: the region the audit reads by class name is gone');
  assert.match(EMPTY, /cd-riv-empty[\s\S]{0,240}url\(#cd-hatch/,
    'the band stopped being hatched: an empty area reads as a measured zero');
  assert.match(EMPTY, /<text[^>]*>NO DEPTH MEASURED<\/text>/,
    'the word left the drawing and lives only in the caption under it');
});

test('the drawn absence is a declaration, not an animation', () => {
  assert.match(EMPTY, /cd-riv-empty"[^>]*data-motion="still"/,
    'the absence moved, and nothing was measured to move');
  assert.match(EMPTY, /data-still-reason="nothing was dived into"/);
});

test('the refusal occupies no geometry the measurement did not use', () => {
  // Same frame, same viewBox, so the evidence switch cannot grow the card — the rule the pair-height
  // check enforces in pixels and this pins at the source.
  const box = (h) => (h.match(/viewBox="[^"]+"/) ?? [''])[0];
  assert.equal(box(EMPTY), box(MEASURED), 'the empty plate changed the drawing box');
});

// The reveal sequence is a claim about arriving measurements, so it follows the value.
// The full sweep found four rows of a dive animating after every value had been removed — unlicensed,
// because `esperDive` is not named in `app/src/undeclared.js` and must not be. `data-known` already
// distinguished these rows; the mark now agrees with the attribute beside it.
test('the dive animates the rows that hold something and refuses the rest', () => {
  const mixed = esperDive({ levels: [
    { label: 'SUBJECT', value: 'ses-4419', cite: 'sessions[].id' },
    { label: 'WORK ITEM', value: null, cite: 'sessions[].work.id' },
    { label: 'ARTIFACT PATH', value: null, cite: 'evidence.artifact.latest_path', floor: true },
  ] });
  const rows = [...mixed.matchAll(/<g class="cd-riv-readrow" data-floor="(\d)" data-known="(\d)"([^>]*)>/g)]
    .map((m) => ({ floor: m[1] === '1', known: m[2] === '1', attrs: m[3] }));
  assert.equal(rows.length, 3, 'a readout row was dropped or duplicated');
  for (const row of rows) {
    if (row.known) {
      assert.match(row.attrs, /data-motion="count"/, 'a measured row stopped arriving');
    } else {
      assert.match(row.attrs, /data-motion="still"/,
        'a row with no value is still animating an arrival');
      assert.match(row.attrs, new RegExp(row.floor
        ? 'the record stops here; the floor is drawn, not measured'
        : 'this row was not measured'), 'the refusal does not name itself');
    }
  }
});

test('a dive with nothing known is motionless', () => {
  const blind = esperDive({ levels: [
    { label: 'SUBJECT', value: null, cite: 'sessions[].id' },
    { label: 'WORK ITEM', value: null, cite: 'sessions[].work.id' },
  ] });
  assert.equal(blind.match(/data-motion="count"/g), null,
    'the ladder revealed itself over an empty record');
  assert.match(blind, /UNMEASURED/, 'the rows stopped saying what they lack');
});
