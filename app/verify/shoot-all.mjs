// Every specimen, once, in the dark theme, cropped to its own card.
//
// The Quest gallery ships reference stills for nine of the fifty-one
// components, which is enough to check the nine that were ported and nothing
// else. A port with no reference is unfalsifiable: it can only be reviewed by
// looking at it and feeling good. This writes the missing forty-two.
//
// The theme is stamped explicitly rather than left to the viewer's setting.
// A reference shot in whatever mode the machine happened to be in is a
// reference that changes when someone toggles their OS.
//
//   BASE=http://127.0.0.1:5299/ node app/verify/shoot-all.mjs OUT=/tmp/refs
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2)
  .filter((a) => a.includes('=')).map((a) => a.split('=', 2)));
const OUT = args.OUT || '/tmp/refs';
const BASE = process.env.BASE || 'http://127.0.0.1:5299/';
const KEYS = (await import('../src/registry/families.js')).then;

mkdirSync(OUT, { recursive: true });

const families = await import('../src/registry/families.js');
const names = [];
const walk = (o) => {
  if (Array.isArray(o)) o.forEach(walk);
  else if (o && typeof o === 'object') {
    if (o.key) names.push(o.key);
    Object.values(o).forEach(walk);
  }
};
walk(families.FAMILIES || families.default || families);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2,
  colorScheme: 'dark',
});
// The dark theme is stamped before any navigation so the first paint is
// already in it; toggling after load leaves a light frame in the shot.
// Stamping the attribute is not enough on its own: app/src/theme.js reads its
// own choice out of localStorage on mount and writes the attribute back, so a
// shot taken without seeding the store comes out in whatever the app last
// remembered. Seed the store, stamp the attribute, and set the OS preference.
await page.addInitScript(() => {
  try { localStorage.setItem('cyberdeck.app.theme', 'dark'); } catch (e) { /* private mode */ }
  document.documentElement.setAttribute('data-theme', 'dark');
});

const report = [];
for (const key of names) {
  try {
    await page.goto(`${BASE}#/component/${key}`, { waitUntil: 'load' });
    await page.waitForTimeout(1400);
    // The specimen, not the page it is documented on. `main` swallows the
    // title, the prose and the evidence tables, and a reference carrying those
    // measures the documentation rather than the drawing.
    const target = await page.$('[data-specimen-view]');
    if (!target) { report.push({ key, error: 'no card' }); continue; }
    const box = await target.boundingBox();
    if (!box || box.width < 8) { report.push({ key, error: 'empty box' }); continue; }
    await page.screenshot({
      path: `${OUT}/${key}.png`,
      clip: { x: box.x, y: Math.max(0, box.y), width: box.width, height: box.height },
    });
    report.push({ key, w: Math.round(box.width), h: Math.round(box.height) });
  } catch (err) {
    report.push({ key, error: String(err.message).slice(0, 90) });
  }
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
const ok = report.filter((r) => !r.error);
console.log(`${ok.length}/${report.length} shot into ${OUT}`);
for (const r of report.filter((r) => r.error)) console.log(`  MISSING ${r.key}: ${r.error}`);
await browser.close();
