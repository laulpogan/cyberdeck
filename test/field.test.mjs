// THE FIELD -- eight components, and the eight ways each of them is
// allowed to have nothing to draw.
//
// The visual spec for these came from a set of illustrations drawn from
// hard-coded demo values, which never had to survive their data going
// missing. These do. So most of what is asserted below is the branch the
// picture never had: what the component does when the number is not there.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as f from '../src/components/field.js';

const here = dirname(fileURLToPath(import.meta.url));
const still = (html, why) => {
  assert.match(html, /data-motion="still"/);
  if (why) assert.match(html, new RegExp(why));
};

test('the scan annotates a subject, and refuses without one', () => {
  const html = f.scanOverlay({ subject: {
    name: 's-incident', state: 'needs_human', settled: true,
    identity: 's-incident · hermes · dellpromax',
    authority: 'RETRY · NO_GRANT', blocked: 'Credential expired mid-run' } });
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 3);
  still(f.scanOverlay({ subject: null }), 'no subject is selected');
});

test('a leader is not drawn to a field nobody read', () => {
  // The failure this guards: an annotation line running out to an empty
  // value looks exactly like one running out to a reading.
  const html = f.scanOverlay({ subject: {
    name: 'x', identity: 'a', authority: null, blocked: '' } });
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 1);
  assert.equal((html.match(/nothing travelled this path/g) || []).length, 2);
  assert.match(html, /NOT READ/);
});

test('an unmeasured cell hatches under every lens', () => {
  const cells = [{ health: 'ok', measured: true }, { measured: false }];
  for (const lens of ['health', 'cost', 'authority']) {
    const html = f.triVision({ cells, lens });
    assert.match(html, /cd-hatch-unmeasured/, lens);
  }
  still(f.triVision({ cells: [] }), 'the comb was not enumerated');
});

test('an uncounted board has no wall at all', () => {
  // Not an empty grid: an empty grid reads as a measured zero.
  still(f.scaleCrush({ count: null }), 'the board was never counted');
  const html = f.scaleCrush({ count: 54, bleeding: [4, 11] });
  assert.equal((html.match(/data-motion="count"/g) || []).length, 54);
  assert.equal((html.match(/cd-bleed/g) || []).length, 2);
});

test('unmeasured terrain is a hatched void with the word on it', () => {
  const html = f.coverage({ contours: [[[0, 0], [1, .6]]], dark: true,
    endpoints: [{ id: 'dell', x: 60, y: 96 }] });
  assert.match(html, /UNMEASURED/);
  assert.match(html, /cd-hatch-unmeasured/);
  // Terrain quietly left flat is indistinguishable from terrain measured
  // as flat, which is why the void is drawn rather than skipped.
  still(f.coverage({ contours: [], dark: false }), 'no contour was sampled');
});

test('an unpriced chip is never counted as free', () => {
  const html = f.chipBudget({ ceiling: 64,
    chips: [{ name: 'FLEET BAR', cost: 12, on: true }, { name: 'LENS', on: true }] });
  assert.match(html, /UNPRICED/);
  // The budget bar refuses rather than showing a total that omits it.
  assert.match(html, /quantity was not measured/);
  still(f.chipBudget({ chips: [] }), 'no chip was inventoried');
});

test('the radar sweeps only on a polled live feed', () => {
  const live = f.radar({ contacts: [{ age_seconds: 4, bearing: 1 }],
    pollElapsed: 3, pollPeriod: 10, sourceState: 'live' });
  assert.match(live, /data-motion="cycle"/);
  // An overdue poll refuses rather than wrapping -- a wrap erases the
  // finding, which is that the poll never landed.
  const overdue = f.radar({ contacts: [], pollElapsed: 140, pollPeriod: 10,
    sourceState: 'live' });
  assert.match(overdue, /poll is overdue/);
  assert.match(overdue, /NO SWEEP/);
  assert.match(f.radar({ contacts: [], sourceState: 'stale' }), /NO SWEEP/);
});

test('a contact with no measured age is off-scope, not at the centre', () => {
  // Parked at the centre it would read as the freshest thing on screen.
  const html = f.radar({ pollElapsed: 1, pollPeriod: 10, sourceState: 'live',
    contacts: [{ age_seconds: null, bearing: 0 }, { age_seconds: 5, bearing: 1 }] });
  assert.equal((html.match(/cd-fd-contact/g) || []).length, 1);
  assert.match(html, /1 OFF-SCOPE/);
  assert.match(html, /1 contacts have no measured age/);
});

test('a swept contact declares the angle the sweep must reach', () => {
  // The ping's evidence is the sweep's: the component states the angle,
  // the runtime lights the blip when the edge arrives, and a blip's
  // brightness is the time since it was last measured.
  const html = f.radar({ pollElapsed: 1, pollPeriod: 10, sourceState: 'live',
    contacts: [{ age_seconds: 5, bearing: Math.PI / 2 },
      { age_seconds: 9, bearing: -Math.PI }] });
  assert.match(html, /data-sweep-angle="90\.00"/);
  assert.match(html, /data-sweep-angle="180\.00"/);
});

test('an unmeasurable bearing declares no angle, so it cannot ping', () => {
  const html = f.radar({ pollElapsed: 1, pollPeriod: 10, sourceState: 'live',
    contacts: [{ age_seconds: 5, bearing: NaN }] });
  assert.equal((html.match(/data-sweep-angle/g) || []).length, 0);
});

test('a worker with no constraint gets a hollow ring, not a bearing', () => {
  const html = f.needleField({ workers: [
    { bearing: 0.9 }, { bearing: null }, { bearing: -1.2, hot: true }] });
  assert.equal((html.match(/data-known="0"/g) || []).length, 1);
  assert.match(html, /this worker reported no constraint/);
  assert.match(html, /2 point at a constraint · 1 reported none/);
  still(f.needleField({ workers: [] }), 'no worker reported a constraint');
});

test('the legend is deliberately still', () => {
  // Nothing on it is measured, so nothing on it may move.
  const html = f.standardSheet({ glyphs: [
    { key: 'working', label: 'WORKING' }, { key: 'unmeasured', label: 'UNMEASURED' }] });
  still(html, 'a legend is not a reading');
  assert.doesNotMatch(html, /data-motion="(count|trace|level|cycle)"/);
});

test('every specimen is bounded and names itself', () => {
  // These are components, not page sections: one viewBox, one card, and a
  // key a gallery can address them by.
  const all = [
    ['scan', f.scanOverlay({ subject: { name: 'a', identity: 'i' } })],
    ['tri-vision', f.triVision({ cells: [{ measured: true, health: 1 }] })],
    ['crush', f.scaleCrush({ count: 4 })],
    ['coverage', f.coverage({ contours: [[[0, 0], [1, 1]]], dark: true })],
    ['chips', f.chipBudget({ ceiling: 8, chips: [{ name: 'A', cost: 2, on: true }] })],
    ['radar', f.radar({ contacts: [], pollElapsed: 1, pollPeriod: 5, sourceState: 'live' })],
    ['needles', f.needleField({ workers: [{ bearing: 1 }] })],
    ['standard-sheet', f.standardSheet({ glyphs: [{ key: 'working', label: 'W' }] })],
  ];
  for (const [key, html] of all) {
    assert.match(html, new RegExp(`data-specimen="${key}"`), key);
    assert.equal((html.match(/<svg/g) || []).length, 1, `${key}: one drawing`);
    assert.match(html, /viewBox=/, key);
  }
});

test('the family escapes what it prints', () => {
  const html = f.scanOverlay({ subject: {
    name: '<script>x</script>', identity: '<script>x</script>' } });
  assert.doesNotMatch(html, /<script>x/);
});

test('no component names a colour', () => {
  const body = readFileSync(join(here, '..', 'src', 'components', 'field.js'), 'utf8');
  assert.deepEqual(body.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [], []);
});
