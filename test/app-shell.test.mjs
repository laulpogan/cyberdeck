// The app's own logic, tested where it lives: plain ESM, no transform, no
// browser. Everything the chrome claims to know is asserted here -- which
// routes exist, what the theme control stamps, how the four counters are
// counted, and when motion is refused. The visual claims are not here; those
// are `app/verify/`, because every composition defect this library has had
// walked straight through a unit test.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseHash, href, sameRoute } from '../app/src/router.js';
import {
  attributeFor, normalizeTheme, effectiveTheme, applyTheme, THEMES,
} from '../app/src/theme.js';
import {
  countMarks, countStill, movingWithoutEvidence, honestyReadout,
} from '../app/src/honesty.js';

// ——— routes ———

test('every route in the brief has a path and parses back from it', () => {
  const routes = [
    { kind: 'home' },
    { kind: 'family', family: 'river' },
    { kind: 'component', key: 'collar' },
    { kind: 'rules' },
    { kind: 'primitives' },
    { kind: 'overview' },
  ];
  for (const route of routes) {
    const path = href(route);
    assert.ok(path.startsWith('#/'), `${route.kind} links with a hash path: ${path}`);
    const parsed = parseHash(path);
    assert.equal(parsed.kind, route.kind, `${path} parses back to ${route.kind}`);
    if (route.family) assert.equal(parsed.family, route.family);
    if (route.key) assert.equal(parsed.key, route.key);
    assert.ok(sameRoute(route, parsed));
  }
});

test('an empty hash is home, and an unknown path is not silently home', () => {
  assert.equal(parseHash('').kind, 'home');
  assert.equal(parseHash('#/').kind, 'home');
  assert.equal(parseHash('#/families').kind, 'overview', 'the bare index lists the families');
  assert.equal(parseHash('#/nope').kind, 'unknown');
});

test('a component route carries the key through, which is what copy-to-use links to', () => {
  assert.deepEqual(parseHash('#/component/stripChart'), { kind: 'component', key: 'stripChart' });
  assert.equal(href({ kind: 'component', key: 'stripChart' }), '#/component/stripChart');
});

// ——— theme ———

test('the three theme states are three states: system stamps nothing', () => {
  assert.deepEqual(THEMES, ['system', 'light', 'dark']);
  assert.equal(attributeFor('system'), null, 'system is the absence of an attribute');
  assert.equal(attributeFor('light'), 'light', 'an explicit light beats a dark OS only by attribute');
  assert.equal(attributeFor('dark'), 'dark');
});

test('an unknown or missing stored theme falls back to system, never to light', () => {
  assert.equal(normalizeTheme('neon'), 'system');
  assert.equal(normalizeTheme(undefined), 'system');
  assert.equal(normalizeTheme(null), 'system');
  assert.equal(normalizeTheme(''), 'system');
});

test('what the page is painted as follows the OS only while nothing is chosen', () => {
  const darkOs = { matchMedia: (q) => ({ matches: /dark/.test(q) }) };
  const lightOs = { matchMedia: (q) => ({ matches: /light/.test(q) }) };
  assert.equal(effectiveTheme(darkOs, 'system'), 'dark');
  assert.equal(effectiveTheme(lightOs, 'system'), 'light');
  assert.equal(effectiveTheme(darkOs, 'light'), 'light', 'an explicit choice beats the OS');
  assert.equal(effectiveTheme(lightOs, 'dark'), 'dark');
});

test('applyTheme removes the attribute for system rather than writing "system"', () => {
  const attrs = {};
  const doc = {
    documentElement: {
      setAttribute: (k, v) => { attrs[k] = v; },
      removeAttribute: (k) => { delete attrs[k]; },
    },
  };
  applyTheme(doc, 'dark');
  assert.equal(attrs['data-theme'], 'dark');
  applyTheme(doc, 'system');
  assert.ok(!('data-theme' in attrs), 'system must not stamp an unrecognised value');
});

// ——— the honesty readout ———

/** A document small enough to read: marks by selector, animations by target. */
function fakeDoc({ marks = 0, stills = 0, targets = [] }) {
  const stillNode = { closest: (sel) => (sel === '[data-motion="still"]' ? {} : null) };
  const looseNode = { closest: () => null };
  const nodes = targets.map((kind) => (kind === 'still' ? stillNode : looseNode));
  return {
    querySelectorAll: (sel) => ({ length: sel === '[data-motion]' ? marks : stills }),
    getAnimations: () => nodes.map((target) => ({ effect: { target } })),
  };
}

test('MOVING WITHOUT EVIDENCE counts animations whose target sits inside a stillness', () => {
  const doc = fakeDoc({ marks: 10, stills: 3, targets: ['loose', 'still', 'still', 'loose'] });
  const readout = honestyReadout(doc);
  assert.equal(readout.animations, 4);
  assert.equal(readout.marks, 10);
  assert.equal(readout.still, 3);
  assert.equal(readout.movingWithoutEvidence, 2, 'two of four run under a refusal');
});

test('a still page reads zero on the verdict and zero on animations', () => {
  const doc = fakeDoc({ marks: 6, stills: 6, targets: [] });
  assert.deepEqual(honestyReadout(doc), {
    animations: 0, marks: 6, still: 6, movingWithoutEvidence: 0,
  });
});

test('an animation with no target is not evidence of a lie', () => {
  const animations = [{ effect: null }, { effect: { target: null } }, {}];
  assert.equal(movingWithoutEvidence(animations), 0);
});

test('the counts are the same function the readout and the gate both use', () => {
  const doc = fakeDoc({ marks: 4, stills: 1, targets: ['loose'] });
  assert.equal(countMarks(doc), honestyReadout(doc).marks);
  assert.equal(countStill(doc), honestyReadout(doc).still);
});

// ——— the kill switch and the runtime's own refusal ———

test('start() is refused when the runtime has decided the page is the static export', async () => {
  let started = 0;
  globalThis.CyberdeckMotion = { off: true, start: () => { started += 1; }, settle: () => {} };
  globalThis.window = { matchMedia: () => ({ matches: true }), location: { search: '' } };
  const bridge = await import('../app/src/motion-bridge.js');
  assert.equal(bridge.motionAvailable(), false);
  assert.equal(bridge.startMotion(), false, 'reduced motion is not overruled by a caller');
  assert.equal(started, 0);
  assert.match(bridge.stillnessReason(globalThis.window), /reduced motion/);
  delete globalThis.CyberdeckMotion;
  delete globalThis.window;
});

test('the kill switch settles and stamps the root; turning it back on clears the stamp', async () => {
  let settled = 0; let starts = 0;
  globalThis.CyberdeckMotion = {
    off: false,
    start: () => { starts += 1; },
    settle: () => { settled += 1; globalThis.__root.setAttribute('data-motion-off', ''); },
  };
  globalThis.__root = {
    attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    removeAttribute(k) { delete this.attrs[k]; },
    hasAttribute(k) { return k in this.attrs; },
  };
  const doc = { documentElement: globalThis.__root };
  const bridge = await import('../app/src/motion-bridge.js');
  bridge.setMotionOff(doc, true);
  assert.equal(settled, 1);
  assert.equal(bridge.isMotionOff(doc), true);
  bridge.setMotionOff(doc, false);
  assert.equal(bridge.isMotionOff(doc), false, 'a stale stamp leaves every later intent() dead');
  assert.equal(starts, 1);
  delete globalThis.CyberdeckMotion;
});
