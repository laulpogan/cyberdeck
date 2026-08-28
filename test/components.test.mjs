// The components keep the contract the marks make.
//
// A component is where the honesty usually leaks: the marks refuse
// correctly, and then a component draws a confident picture anyway
// because the refusal only reached an attribute nobody rendered. These
// tests read the markup each component actually produces.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { gauge } from '../src/components/gauge.js';
import { river } from '../src/components/river.js';
import { globe } from '../src/components/globe.js';

const here = dirname(fileURLToPath(import.meta.url));
const at = (n) => new Date(1787000000000 + n * 60000).toISOString();
const LANES = [
  { id: 'a', attempt: 1, state: 'done', events: [
    { at: at(0), kind: 'created' }, { at: at(10), kind: 'gate_passed' },
    { at: at(20), kind: 'accepted' }] },
  { id: 'b', attempt: 2, state: 'needs_human', events: [
    { at: at(0), kind: 'created' }, { at: at(15), kind: 'canonical_blocked' }] },
  { id: 'c', attempt: 1, state: 'queued', events: [] },
];
const EPS = [
  { id: 'one', lat: 40, lon: -74, workers: 18, awaiting: false },
  { id: 'two', lat: 51, lon: 0, workers: 0, awaiting: true },
];

test('a measured ratio draws its arc to the measured extent', () => {
  const html = gauge({ value: 15, ceiling: 18, measured: true, cite: 'proof.sealed', label: 'P' });
  assert.match(html, /data-motion="level"/);
  // The arc rests at the real ratio in the markup, so a reader with no
  // runtime still sees 15 of 18 rather than an empty ring.
  const offset = Number(html.match(/stroke-dashoffset:([\d.]+)/)[1]);
  assert.ok(Math.abs(offset - (1 - 15 / 18)) < 0.001, `rests at the ratio (${offset})`);
});

test('an unmeasured ratio never draws a full ring', () => {
  const html = gauge({ value: null, ceiling: 18, measured: false, cite: 'x', label: 'B' });
  assert.match(html, /data-motion="still"/);
  assert.match(html, /quantity was not measured/);
  assert.doesNotMatch(html, /data-motion="level"/);
  // The specific failure: a bar at zero and a bar nobody filled in must
  // not look alike, so the absent dial says the word.
  assert.match(html, /UNMEASURED/);
});

test('every lane that ran is traced, and the empty one is drawn anyway', () => {
  const html = river({ lanes: LANES, cite: 'sessions[].events' });
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 2);
  assert.match(html, /this lane has no run to draw/);
  // Drawn, not omitted: an absent row and an empty row must not look alike.
  assert.equal((html.match(/class="cd-riv-lane"/g) || []).length, 3);
});

test('a lane waiting on a person says so rather than animating', () => {
  const html = river({ lanes: LANES, cite: 'sessions[].events' });
  assert.match(html, /this lane is waiting on a person/);
});

test('the trail fades by real age, or not at all', () => {
  const withClock = river({ lanes: LANES, cite: 'x', now: at(30), staleAfter: 3600 });
  assert.match(withClock, /data-motion="decay"/);
  // No clock supplied: the fade is refused rather than invented.
  const without = river({ lanes: LANES, cite: 'x' });
  assert.doesNotMatch(without, /data-motion="decay"/);
});

test('no lanes at all is a refusal, not an empty drawing', () => {
  assert.match(river({ lanes: [], cite: 'x' }), /no lanes were observed/);
});

test('the globe turns only on a live feed with a measured interval', () => {
  const live = globe({ endpoints: EPS, cite: 'p', periodSeconds: 6, sourceState: 'live' });
  assert.match(live, /data-motion="traffic"/);
  for (const state of ['stale', 'unavailable', 'measured_empty']) {
    const dead = globe({ endpoints: EPS, cite: 'p', periodSeconds: 6, sourceState: state });
    assert.match(dead, /data-motion="still"/, state);
    assert.match(dead, /NOT TURNING/, state);
  }
  // And never on a live feed whose interval nobody measured.
  assert.match(globe({ endpoints: EPS, cite: 'p', periodSeconds: null, sourceState: 'live' }),
    /no interval was measured/);
});

test('an endpoint carrying nobody gets no arc drawn to it', () => {
  const html = globe({ endpoints: EPS, cite: 'p', periodSeconds: 6, sourceState: 'live' });
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 1);
  assert.match(html, /nothing travelled this path/);
});

test('the endpoints are elements, so they can be marked and read', () => {
  // The whole reason the globe keeps canvas only for its mesh: readings
  // must be in the DOM where a review can find them.
  const html = globe({ endpoints: EPS, cite: 'p', periodSeconds: 6, sourceState: 'live' });
  assert.equal((html.match(/class="cd-globe-pin"/g) || []).length, EPS.length);
  assert.equal((html.match(/data-motion="count"/g) || []).length, EPS.length);
});

test('no component names a colour', () => {
  // Tokens or nothing. This is the ratchet: a re-skin has to be a
  // stylesheet edit, never a search through the components.
  const dir = join(here, '..', 'src', 'components');
  for (const name of readdirSync(dir)) {
    const body = readFileSync(join(dir, name), 'utf8');
    const hex = body.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [];
    assert.deepEqual(hex, [], `${name} carries colour literals`);
  }
});
