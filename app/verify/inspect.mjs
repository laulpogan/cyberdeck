// Capture and report, for looking at.
//
// This is not the gate — `index.mjs` asserts; this one *shows*. It exists
// because every composition defect found in this library so far (labels
// struck through by the lines they named, a projection covering the
// observation it was projected over, a glyph stretched to the width of its
// card, `line-height: 0` flattening the whole page) passed every unit test
// and was found by a person looking at a picture. So the pictures are
// produced the same way every time: same routes, same widths, same themes,
// deterministic fixtures, no clock in the loop.
//
//   node app/verify/inspect.mjs                       # every route, both widths, both schemes
//   ROUTES='#/,#/rules' node app/verify/inspect.mjs   # one pass over what you just wired
//
// Output: /tmp/cyberdeck-shots/<route>@<width>-<scheme>.png plus a line of
// measurements per capture, including the peak animation count sampled per
// frame from a standing start — an animation count taken after the page has
// settled reads zero whether or not anything moved.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://127.0.0.1:5199/';
const OUT = process.env.OUT || '/tmp/cyberdeck-shots';
const routes = (process.env.ROUTES || '#/,#/overview,#/rules,#/primitives').split(',');
const widths = (process.env.WIDTHS || '1280,390').split(',').map(Number);
const schemes = (process.env.SCHEMES || 'light,dark').split(',');
const settleMs = Number(process.env.SETTLE_MS || 900);

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let failures = 0;

for (const route of routes) {
  for (const width of widths) {
    for (const scheme of schemes) {
      const ctx = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        colorScheme: scheme,
        reducedMotion: 'no-preference',
      });
      const page = await ctx.newPage();
      const problems = [];
      page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
      });
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));

      // Sample the animation count from the first frame: entrances are over
      // in a few hundred milliseconds.
      await page.addInitScript(() => {
        window.__peak = 0;
        const tick = () => {
          const n = document.getAnimations ? document.getAnimations().length : 0;
          if (n > window.__peak) window.__peak = n;
          requestAnimationFrame(tick);
        };
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(tick));
      });

      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(settleMs);

      const measured = await page.evaluate(() => ({
        peak: window.__peak ?? 0,
        animations: document.getAnimations().length,
        marks: document.querySelectorAll('[data-motion]').length,
        still: document.querySelectorAll('[data-motion="still"]').length,
        lying: document.getAnimations().filter((a) => {
          const t = a.effect && a.effect.target;
          return t && t.closest && t.closest('[data-motion="still"]');
        }).length,
        readout: [...document.querySelectorAll('[data-honesty]')]
          .map((n) => `${n.dataset.honesty}=${n.textContent.trim()}`).join(' '),
        docScroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        painted: document.documentElement.dataset.theme || `system(${
          matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'})`,
        bg: getComputedStyle(document.body).backgroundColor,
        ink: getComputedStyle(document.body).color,
        lineH: getComputedStyle(document.body).lineHeight,
        stillness: globalThis.__cyberdeckStillness || null,
      }));

      const name = `${(route.replace(/^#/, '') || '/').replace(/\W+/g, '-') || 'home'}@${width}-${scheme}`;
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });

      const bad = [];
      if (measured.lying) bad.push(`MOVING WITHOUT EVIDENCE=${measured.lying}`);
      if (measured.docScroll > measured.client) bad.push(`body scrolls sideways (${measured.docScroll}>${measured.client})`);
      if (measured.lineH === '0px' || measured.lineH === '0') bad.push('line-height collapsed to zero');
      if (problems.length) bad.push(...problems);
      if (bad.length) failures += 1;

      console.log(`${name}  peak=${measured.peak} marks=${measured.marks} still=${measured.still} `
        + `lying=${measured.lying} theme=${measured.painted} bg=${measured.bg}`);
      if (bad.length) console.log(`  ✗ ${bad.join(' | ')}`);
      await ctx.close();
    }
  }
}

await browser.close();
console.log(failures ? `\n${failures} capture(s) with problems — look at them in ${OUT}` : `\nno problems reported. shots in ${OUT}`);
process.exit(failures ? 1 : 0);
