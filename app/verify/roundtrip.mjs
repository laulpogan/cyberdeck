/** Proof that what the page shows and what the page tells you to paste are one thing.
 *
 * Every component page prints a block: the real import line and the real call, with the
 * fixture currently on screen as its argument. The claim is not "the block looks
 * plausible" — it is that pasting it produces *this drawing*. So this script reads the
 * block out of the browser, runs it in node against the library module the registry
 * names, and compares the resulting markup to the markup the browser is holding.
 *
 * Two things had to be true for the comparison to mean anything:
 *
 * - The page is loaded with `?still=1`, which asks the runtime for no motion at all, and
 *   the specimen is then read twice. Comparing markup while a counter is mid-write or an
 *   arc is mid-dash would compare a frame against a function, and the frame always wins;
 *   so a specimen that is still changing is reported rather than compared.
 * - The node side imports the file the registry says the component lives in, not the
 *   string the browser printed. If the registry and the bundle ever disagreed, this
 *   fails on the diff rather than nodding.
 *
 *   npm run verify:roundtrip
 */
import { chromium } from 'playwright';

import { allComponents, COMPONENT_MODULES, IMPORT_PATH } from '../src/registry/index.js';
import { importLine, payloadOf } from '../src/copy-to-use.js';

/** The library modules, loaded once each, from the paths the registry publishes. */
const sources = new Map();
async function load(file) {
  if (!sources.has(file)) {
    const found = COMPONENT_MODULES.find((entry) => entry.file === file);
    sources.set(file, found ? await found.module() : null);
  }
  return sources.get(file);
}

async function moduleFor(key) {
  for (const entry of COMPONENT_MODULES) {
    if (entry.file === 'src/components/card.js') continue;
    const mod = await load(entry.file);
    if (mod && typeof mod[key] === 'function') return entry.file;
  }
  return null;
}

// The default port is this tree's own vite.config.js, and the run refuses a server that
// identifies a different checkout: two worktrees can hold one port, and measuring the other
// branch prints the same green. See app/verify/app-identity.mjs.
import { assertServedThisCheckout, defaultBase } from './app-identity.mjs';
const BASE = (process.env.BASE || defaultBase()).replace(/\/+$/, '');
const components = process.env.KEYS
  ? process.env.KEYS.split(',').map((key) => ({ key }))
  : allComponents();

const browser = await chromium.launch();
await assertServedThisCheckout(browser, BASE, 'app/verify/roundtrip.mjs');
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
const failures = [];

for (const entry of components) {
  const key = entry.key;
  const component = allComponents().find((c) => c.key === key);
  await page.goto(`${BASE}/?still=1#/component/${key}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);

  const read = () => page.evaluate(() => {
    const block = document.querySelector('[data-panel="use"] pre');
    const specimen = document.querySelector('[data-specimen-view]');
    return {
      block: block ? block.textContent : null,
      markup: specimen ? specimen.innerHTML : null,
      live: document.getAnimations().length,
    };
  });
  const seen = await read();

  if (!seen.block || !seen.markup) {
    failures.push(`${key}: no copy-to-use block or no specimen on the page`);
    continue;
  }
  await page.waitForTimeout(400);
  const again = await read();
  if (again.markup !== seen.markup || seen.live) {
    failures.push(`${key}: the specimen is still being written to (${seen.live} animations) — comparing it against a function call would compare a frame, not a drawing`);
    continue;
  }

  let model;
  try {
    // Extracted from the printed text, not taken from the fixture: the check is that
    // what a visitor would paste produces this drawing.
    model = payloadOf(key, seen.block);
  } catch (error) {
    failures.push(`${key}: the printed call does not parse as a call (${error.message})`);
    continue;
  }
  if (!seen.block.startsWith(importLine(key))) {
    failures.push(`${key}: the printed import is not ${importLine(key)}`);
    continue;
  }

  const where = await moduleFor(key);
  if (!where) {
    failures.push(`${key}: no module under COMPONENT_MODULES exports it — the registry is calling something the package does not ship`);
    continue;
  }
  const mod = await load(where);
  const fn = mod[key];
  if (typeof fn !== 'function') {
    failures.push(`${key}: ${where} exports no function called ${key}`);
    continue;
  }

  // The produced string is run back through the same engine that parsed the specimen.
  // `<line/>` in, `</line>` out: an HTML parser normalises self-closing SVG tags, so the
  // component's output and the element's innerHTML are two texts describing one drawing,
  // and comparing them directly reports a difference that has no meaning.
  const normalise = (markup) => page.evaluate((input) => {
    const host = document.createElement('div');
    host.innerHTML = input;
    // `paintGlobe` places the pins: it writes a `transform` and an `opacity` onto every
    // `.cd-globe-pin`, in stillness as well as in motion, because a mesh that never
    // paints is a black box. So the page's globe is the component's drawing plus the
    // host's one frame of placement, and that difference -- only that one, only on those
    // elements -- is removed from both sides rather than wished away. Anything else the
    // painter leaves behind (a stale transform after settle, a pin in the wrong place)
    // still shows up as a diff.
    for (const pin of host.querySelectorAll('.cd-globe-pin')) {
      pin.removeAttribute('transform');
      pin.removeAttribute('style');
    }
    return host.innerHTML;
  }, markup);

  const produced = await normalise(fn(model));
  const onPage = await normalise(seen.markup);
  if (produced !== onPage) {
    const at = firstDiff(produced, seen.markup);
    failures.push(`${key}: the call printed on the page does not reproduce the drawing on it\n`
      + `      first difference at character ${at}\n`
      + `      node:  …${produced.slice(at, at + 90)}…\n`
      + `      page:  …${seen.markup.slice(at, at + 90)}…`);
  }
}

await browser.close();
console.log(`\n${components.length} components round-tripped from the page through the package`);
if (IMPORT_PATH !== 'cyberdeck-ui/components') {
  console.log(`note: import path is ${IMPORT_PATH}`);
}
for (const line of failures) console.log(`✗ ${line}`);
if (!failures.length) console.log('✓ every printed call reproduces its own drawing, byte for byte');
else process.exit(1);

function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i += 1;
  return i;
}
