/** Watch the "a refusal keeps its space" gate fail, on a page that is not broken.
 *
 * An assertion nobody has seen fail is a rumour. This one has already earned its keep once:
 * the height floor that was supposed to enforce the rule ran on the evidence-present page, so
 * the sweep was green for weeks while twelve components refused by returning nothing — the
 * globe 445px down to 15 — and the first replacement (a 60%-of-card-height ratio) then reported
 * a false failure on a refusal that is legitimately shorter than the four-row measurement it
 * refuses. Both of those could have been caught by running the instrument against a page where
 * the defect was planted on purpose.
 *
 * So: take a live page, delete a drawing out of a specimen, and require the rule to name it.
 * Three conditions, and the control fails if any of them misbehaves — the rule fires on a
 * vanished drawing, fires on a drawing crushed below drawing size, and says nothing at all
 * about the same page left alone.
 *
 *   node app/verify/negative-control.mjs
 *   BASE=http://127.0.0.1:5299/ node app/verify/negative-control.mjs
 */
import { chromium } from 'playwright';

import { DRAWING_SELECTOR, DRAWING_PROBE, drawingVerdict, MIN_DRAWING_PX } from './drawing.mjs';

// Trailing slash or not, the hash goes after the origin: `BASE` arrives with one from
// `npm run verify:all` neighbours and without one from a typed command, and `//#/x` is a
// different URL from `/#/x` to a dev server.
// The default port is this tree's own vite.config.js, and the run refuses a server that
// identifies a different checkout: two worktrees can hold one port, and measuring the other
// branch prints the same green. See app/verify/app-identity.mjs.
import { assertServedThisCheckout, defaultBase } from './app-identity.mjs';
const BASE = (process.env.BASE || defaultBase()).replace(/\/+$/, '');
const ROUTES = (process.env.ROUTES || '/component/mfd,/component/globe,/component/tape').split(',');

const probe = eval(DRAWING_PROBE);
const browser = await chromium.launch();
await assertServedThisCheckout(browser, BASE, 'app/verify/negative-control.mjs');
const outcomes = [];

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(`${BASE}/#${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const clean = await page.evaluate(probe, DRAWING_SELECTOR);
  const target = clean.find((d) => (d.regions || []).length);
  if (!target) {
    outcomes.push({ route, specimen: 'none',
      'clean page names nothing': 'FAIL: no specimen view on the page carried a drawing at all',
      'vanished drawing is named': 'FAIL: nothing to take away',
      'crushed drawing is named': 'FAIL: nothing to take away' });
    await page.close();
    continue;
  }
  // `measured` is always the untouched page; `after` is whatever the sabotage left behind.
  const verdict = (rows) => {
    const after = new Map(rows.map((d) => [d.label, d]));
    // The clean snapshot is `measured`: the rule's question is what the refusal still draws
    // against what the measurement drew, and sabotage stands in for the refusal here. The
    // switch's own behaviour is exercised by the sweep itself on every route.
    return drawingVerdict(clean
      .filter((d) => after.has(d.label))
      .map((d) => ({ label: d.label, measured: d, refused: after.get(d.label) })));
  };

  // Baseline: an untouched page must produce no failures, or the rule is firing on everything
  // and its silence means nothing either.
  const untouched = verdict(await page.evaluate(probe, DRAWING_SELECTOR));
  const silentOnClean = untouched.length === 0;

  // Sabotage 1: the drawing is gone — the empty-body refusal, recreated on purpose.
  await page.evaluate((selector) => {
    const view = [...document.querySelectorAll('[data-specimen-view]')]
      .find((n) => n.querySelector(selector));
    view.querySelector(selector).remove();
  }, DRAWING_SELECTOR);
  const vanished = verdict(await page.evaluate(probe, DRAWING_SELECTOR));
  const caughtVanish = vanished.some((line) => line.includes(target.label));

  // Sabotage 2: the drawing is present but crushed — a frame that survived the collapse at a
  // height no operator could read.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.evaluate(({ selector, px }) => {
    const view = [...document.querySelectorAll('[data-specimen-view]')]
      .find((n) => n.querySelector(selector));
    const el = view.querySelector(selector);
    el.style.setProperty('height', `${px}px`, 'important');
    el.style.setProperty('max-height', `${px}px`, 'important');
    el.style.setProperty('min-height', '0', 'important');
  }, { selector: DRAWING_SELECTOR, px: 8 });
  const crushed = verdict(await page.evaluate(probe, DRAWING_SELECTOR));
  const caughtCrush = crushed.some((line) => line.includes(target.label));

  outcomes.push({
    route, specimen: target?.label,
    'clean page names nothing': silentOnClean ? 'PASS' : `FAIL: ${untouched[0] || ''}`,
    'vanished drawing is named': caughtVanish ? 'PASS' : `FAIL: ${vanished[0] || 'the rule stayed silent'}`,
    'crushed drawing is named': caughtCrush ? 'PASS' : `FAIL: ${crushed[0] || 'the rule stayed silent'}`,
  });
  await page.close();
}

await browser.close();
let failed = false;
for (const row of outcomes) {
  console.log(`\n${row.route} — specimen ${row.specimen}`);
  for (const [check, result] of Object.entries(row).filter(([k]) => !['route', 'specimen'].includes(k))) {
    console.log(`  ${result === 'PASS' ? '✓' : '✗'} ${check}${result === 'PASS' ? '' : ` — ${result}`}`);
    if (result !== 'PASS') failed = true;
  }
}
console.log(failed
  ? '\nThe drawing gate is blind or noisy on at least one page. Fix the instrument, not the number.'
  : `\nThe drawing gate bites on ${outcomes.length} pages and stays quiet on all of them untouched.`);
process.exit(failed ? 1 : 0);
