// THE ORGANISM -- eight components, and Forrester's rule underneath all
// of them: a level and a rate are different kinds of number and may never
// wear the same mark.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as og from '../src/components/organism.js';

const still = (html, why) => {
  assert.match(html, /data-motion="still"/);
  if (why) assert.match(html, new RegExp(why));
};

const LEVELS = [
  { label: 'SESSIONS', value: 12, cite: 'sessions[]' },
  { label: 'NEEDS HUMAN', value: 3, cite: 'sessions[].state' },
  { label: 'QUEUE DEPTH', value: null, cite: 'capacity.admission.queue_depth' },
];
const RATES = [
  { label: 'ADMITTED', value: null, period: 'MIN', cite: 'no admission-event producer' },
  { label: 'COMPLETED', value: null, period: 'MIN', cite: 'no completion-event producer' },
];

test('a level and a rate never share a glyph', () => {
  const html = og.stockFlow({ levels: LEVELS, rates: RATES });
  assert.match(html, /cd-og-level-mark/);
  assert.match(html, /cd-og-rate-mark/);
  // The rate glyph is an arrow with a period; the level glyph is a bar on
  // a floor. Neither borrows the other's geometry.
  assert.match(html, /PER MIN/);
  assert.doesNotMatch(html, /cd-og-level[^>]*>[\s\S]{0,200}?PER MIN/);
});

test('the level mark reveals in order, never in extent', () => {
  // Forrester's notation is the same size at three as at three hundred.
  // Animating it to full would draw a bar chart out of a glyph.
  const html = og.stockFlow({ levels: LEVELS, rates: RATES });
  assert.equal((html.match(/data-motion="count"/g) || []).length, 2);
  assert.doesNotMatch(html, /data-motion="level"/);
});

test('no rate is ever derived from a single snapshot', () => {
  const html = og.stockFlow({ levels: LEVELS, rates: RATES });
  assert.equal((html.match(/no producer keeps a series for this rate/g) || []).length, 2);
  // Even a measured rate holds still: a rate is not a level.
  const measured = og.stockFlow({ levels: [], rates: [
    { label: 'ADMITTED', value: 4, period: 'MIN', cite: 'events' }] });
  assert.match(measured, /a rate is not a level/);
});

test('an unmeasured level is named, not drawn at zero', () => {
  const html = og.stockFlow({ levels: LEVELS, rates: [] });
  assert.match(html, /this level was not measured/);
  assert.match(html, /UNMEASURED/);
});

test('the envelope draws no position and no comfortable middle', () => {
  // The one picture this gauge must never make is a needle in a green box.
  const html = og.envelope({});
  assert.match(html, /NO POSITION IS DRAWN/);
  assert.match(html, /ECONOMIC, WORKLOAD, SAFETY UNSUPPLIED/,
    'the missing edges are named, not summarised');
  assert.equal((html.match(/this boundary was never supplied/g) || []).length, 3);
  assert.match(html, /no position was measured to move/);
  assert.doesNotMatch(html, /data-motion="trace"/);
});

test('the envelope names each boundary it is missing, separately', () => {
  const html = og.envelope({});
  for (const [, label] of og.BOUNDARIES) assert.ok(html.includes(label), label);
  assert.match(html, /spend ceiling nobody has priced/);
});

test('the beam is not drawn level when a side was never counted', () => {
  // Level is the picture of a balanced fleet.
  still(og.admission({ offered: 40, taken: null }),
    'one side of the balance was never counted');
  const html = og.admission({ offered: 40, taken: null });
  assert.doesNotMatch(html, /NOT ADMITTED/);
});

test('the tilt is the difference and the gap is what is left in view', () => {
  const html = og.admission({ offered: 40, taken: 31, status: 'THROTTLED' });
  assert.match(html, /9 NOT ADMITTED/);
  assert.match(html, /data-any="1"/);
  assert.match(html, /THROTTLED/);
  const even = og.admission({ offered: 12, taken: 12 });
  assert.match(even, /0 NOT ADMITTED/);
  assert.match(even, /data-any="0"/);
});

const HOSTS = [
  { host: 'dellpromax', workers: [{ state: 'running' }, { state: 'NEEDS HUMAN' }] },
  { host: 'spark', workers: [{ state: 'running' }] },
  { host: 'dotair', workers: [] },
];

test('an empty host is a dark plot, never a missing row', () => {
  // A host that vanished when it emptied would take the evidence of the
  // starvation with it.
  const html = og.city({ hosts: HOSTS });
  assert.match(html, /DARK/);
  assert.match(html, /dotair/);
  assert.match(html, /1 host dark, and drawn/);
});

test('one window per worker, never a texture', () => {
  const html = og.city({ hosts: HOSTS });
  assert.equal((html.match(/cd-og-window/g) || []).length, 3);
  still(og.city({ hosts: [] }), 'no placement was observed');
});

test('a loadout with no proof history says so', () => {
  // An empty column and a column of passes look identical until one of
  // them is named.
  const html = og.garage({ loadouts: [
    { model: 'opus-5', harness: 'kanpai', count: 4, proof: { passed: 3, failed: 1 } },
    { model: 'sonnet-5', harness: 'scape', count: 2, proof: {} }] });
  assert.match(html, /NO PROOF HISTORY/);
  assert.match(html, /passed/i);
  still(og.garage({ loadouts: [] }), 'no loadout was observed');
});

const ROUTES = [
  { origin: 'kanpai', carrier: 'opus-5', destination: 'dellpromax',
    delivered: true, task_id: 'W-1' },
  { origin: 'kanpai', carrier: 'opus-5', destination: 'dellpromax',
    delivered: true, task_id: 'W-2' },
  { origin: 'scape', carrier: 'sonnet-5', destination: 'spark',
    delivered: false, task_id: null },
];

test('a route thickens once per landing on it', () => {
  const html = og.strands({ routes: ROUTES });
  const widths = [...html.matchAll(/stroke-width="([\d.]+)"/g)].map((m) => Number(m[1]));
  // Two landings on the first pair, none on the second.
  assert.ok(Math.max(...widths) >= 1 + 1.6 * 2, `widths were ${widths}`);
  assert.ok(widths.includes(1), `widths were ${widths}`);
});

test('an undelivered route stays drawn, dashed, and still', () => {
  const html = og.strands({ routes: ROUTES });
  assert.match(html, /data-delivered="0"/);
  assert.match(html, /stroke-dasharray="4 3"/);
  assert.equal((html.match(/data-motion="trace"/g) || []).length, 2);
  assert.match(html, /1 route carries nothing, and stays drawn/);
  still(og.strands({ routes: [] }), 'no route was observed');
});

test('an empty grid cell is named, never blank', () => {
  // Blank reads as zero, or as fine.
  const html = og.grid({ rows: [
    { task: 'W-2211', state: 'running', host: 'dellpromax', harness: 'kanpai',
      model: 'opus-5', run: 4, proof: 'passed', ctx: 82 },
    { task: 'W-2212', state: 'NEEDS HUMAN', host: 'spark', harness: null,
      model: 'sonnet-5', run: 1, proof: null, ctx: null }] });
  assert.equal((html.match(/data-unmeasured="1"/g) || []).length, 3);
  assert.match(html, /UNMEASURED/);
  assert.match(html, /2 subjects, no cards/);
  still(og.grid({ rows: [] }), 'no subject was observed');
});

test('the grid keeps its own scroll container', () => {
  // Wide content must never make the page body scroll sideways.
  const html = og.grid({ rows: [{ task: 'W-1', state: 'running' }] });
  assert.match(html, /class="cd-og-grid"/);
});

const SCOPES = [
  { label: 'SUBJECT', count: 1, reach: 'one session' },
  { label: 'TASK', count: 4, reach: 'every attempt of one task' },
  { label: 'HOST', count: 9, reach: 'every worker on one host' },
  { label: 'FLEET', count: 31, reach: 'everything' },
];

test('a wider scope is drawn further out and fainter', () => {
  const html = og.atField({ scopes: SCOPES });
  // Only the ring polygons, not the labels beside them.
  const rings = [...html.matchAll(/<g class="cd-og-scope"[\s\S]*?<polygon[^>]*opacity="([\d.]+)"/g)]
    .map((m) => Number(m[1]));
  assert.equal(rings.length, SCOPES.length);
  for (let i = 1; i < rings.length; i++) assert.ok(rings[i] < rings[i - 1]);
});

test('reach is not a permission unless something can actually write', () => {
  const html = og.atField({ scopes: SCOPES });
  assert.match(html, /reach and not permission/);
  const live = og.atField({ scopes: SCOPES, writable: true });
  assert.match(live, /permission this identity actually holds/);
  still(og.atField({ scopes: [] }), 'no reach was computed');
});

test('no organism component hides moving marks inside a stillness', () => {
  const nesting = (html) => {
    const tags = html.match(/<[a-z]+[^>]*>|<\/[a-z]+>/g) || [];
    let depth = 0, stillDepth = 0, moving = 0;
    const stack = [];
    for (const tag of tags) {
      if (tag.startsWith('</')) {
        if (stack.length && stack[stack.length - 1] === depth) { stack.pop(); stillDepth--; }
        depth--; continue;
      }
      if (/\/>$/.test(tag)) {
        if (stillDepth && /data-motion="(?!still)/.test(tag)) moving++;
        continue;
      }
      depth++;
      if (stillDepth && /data-motion="(?!still)/.test(tag)) moving++;
      if (/data-motion="still"/.test(tag)) { stack.push(depth); stillDepth++; }
    }
    return moving;
  };
  const cases = [
    og.stockFlow({ levels: LEVELS, rates: RATES }),
    og.envelope({}), og.envelope({ position: { x: .4, y: .6 } }),
    og.admission({ offered: 40, taken: 31 }), og.admission({ offered: null, taken: 1 }),
    og.city({ hosts: HOSTS }), og.city({ hosts: [] }),
    og.garage({ loadouts: [] }),
    og.strands({ routes: ROUTES }), og.strands({ routes: [] }),
    og.grid({ rows: [] }),
    og.atField({ scopes: SCOPES }), og.atField({ scopes: [] }),
  ];
  for (const html of cases) assert.equal(nesting(html), 0);
});
