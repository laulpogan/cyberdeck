// The app's own logic, tested where it lives: plain ESM, no transform, no
// browser. Everything the chrome claims to know is asserted here -- which
// routes exist, what the theme control stamps, how the four counters are
// counted, and when motion is refused. The visual claims are not here; those
// are `app/verify/`, because every composition defect this library has had
// walked straight through a unit test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

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

test('every relative import in the app points at a file that exists', () => {
  // Vite reports an unresolved import as a 500 on the module request, which in a
  // browser looks like a blank page with four console errors and no sentence
  // naming the file that was wrong. `app/src/components/../fixtures` is one `..`
  // away from working and one away from being a blank screen, so it is checked
  // here rather than discovered by a person waiting for a page to paint.
  const root = `${fileURLToPath(new URL('..', import.meta.url))}app`;
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (/\.(js|jsx|mjs)$/.test(entry.name)) files.push(path);
    }
  };
  walk(root);
  assert.ok(files.length > 15, 'the walk found the app sources');

  const broken = [];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/from\s+'(\.[^']+)'|import\('(\.[^']+)'\)|import\s+'(\.[^']+)'/g)) {
      const spec = match[1] || match[2] || match[3];
      const target = resolve(dirname(file), spec);
      const exists = [target, `${target}.js`, `${target}.jsx`, `${target}.css`]
        .some((candidate) => existsSync(candidate));
      if (!exists) broken.push(`${file.replace(root, 'app')} -> ${spec}`);
    }
  }
  assert.deepEqual(broken, [], 'every relative specifier lands on a file');
});

test('every named import the app takes is something the module exports', () => {
  // The failure this stands guard over: `import { motionIsOff } from './motion-bridge.js'`
  // against a module that exports `isMotionOff`. The browser raises one page error
  // and renders nothing at all -- no file name, no line, no candidate spelling -- so
  // a rename in one file reads as a blank screen until someone reads the console.
  const root = `${fileURLToPath(new URL('..', import.meta.url))}app`;
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (/\.(js|jsx)$/.test(entry.name)) files.push(path);
    }
  };
  walk(root);

  const exportsOf = (path) => {
    const source = readFileSync(path, 'utf8');
    const names = new Set();
    for (const match of source.matchAll(/export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z0-9_$]+)/g)) {
      names.add(match[1]);
    }
    for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
      for (const part of match[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop();
        if (name) names.add(name.trim());
      }
    }
    return names;
  };

  const missing = [];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/import\s+([^;\n]*?)\s+from\s+'(\.[^']+)'/g)) {
      const clause = match[1];
      const braces = /\{([^}]*)\}/.exec(clause);
      if (!braces) continue;
      const target = resolve(dirname(file), match[2]);
      if (!existsSync(target)) continue; // the resolution test owns that failure
      const have = exportsOf(target);
      for (const raw of braces[1].split(',')) {
        const name = raw.trim().split(/\s+as\s+/)[0];
        if (name && !have.has(name)) missing.push(`${file.replace(root, 'app')} wants ${name} from ${match[2]}`);
      }
    }
  }
  assert.deepEqual(missing, [], 'no module is asked for something it does not give');
});
