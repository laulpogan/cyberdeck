// The evidence toggle and the kill switch, driven in a real browser.
// Task-6 folds these assertions into `app/verify/index.mjs`; this is the probe
// that decides whether the wiring is true before it becomes a gate.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5199/';
const browser = await chromium.launch();
const out = [];
const fail = [];

async function open(route, width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(String(e)));
  await page.addInitScript(() => {
    // The export, as rendered: the markup each specimen had the moment it landed
    // and before any animation touched it. `settle()` is claimed to return the page
    // to exactly this -- the elapsed counters undo their own text on cancel, and
    // every other kind composites over the render rather than editing it -- so the
    // comparison has to be against this and not against whatever the page happened
    // to look like a second later, with a live counter mid-tick.
    window.__export = {};
    const record = (node) => {
      if (!node || node.nodeType !== 1) return;
      const views = node.matches('[data-specimen-view]') ? [node]
        : [...node.querySelectorAll('[data-specimen-view]')];
      for (const view of views) {
        window.__export[view.getAttribute('data-specimen-view') || '?'] = view.innerHTML;
      }
    };
    const obs = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type !== 'childList') continue;
        if (r.addedNodes.length && r.removedNodes.length) record(r.target);
        for (const n of r.addedNodes) record(n);
      }
    });
    obs.observe(document, { childList: true, subtree: true });

    window.__peak = 0;
    const tick = () => {
      const n = document.getAnimations ? document.getAnimations().length : 0;
      if (n > window.__peak) window.__peak = n;
      requestAnimationFrame(tick);
    };
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(tick));
  });
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  return { ctx, page, problems };
}

const read = (page) => page.evaluate(() => ({
  peak: window.__peak,
  animations: document.getAnimations().length,
  still: document.querySelectorAll('[data-motion="still"]').length,
  marks: document.querySelectorAll('[data-motion]').length,
  reasons: [...document.querySelectorAll('[data-still-reason]')]
    .map((el) => el.getAttribute('data-still-reason')),
  ledger: [...document.querySelectorAll('.cd-ledger li code')].map((n) => n.textContent),
  lying: document.getAnimations().filter((a) => {
    const t = a.effect && a.effect.target;
    return t && t.closest && t.closest('[data-motion="still"]');
  }).length,
  // "The component keeps its space" is measured on the specimen container, not on
  // a card: the lane chart is a bare <svg> and has no card to measure.
  box: (() => {
    const c = document.querySelector('[data-specimen-view]');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  })(),
  // The claim is that no library component's markup changes when motion is
  // cancelled, so that is what gets compared -- every specimen on the page, in
  // document order. The chrome is excluded on purpose: pressing the kill switch
  // changes the switch (`aria-pressed`, its label) and `settle()` stamps
  // `data-motion-off` on <html>, and both of those are the record that the
  // operator asked, in the same category as the stamp the bridge already exempts.
  specimens: [...document.querySelectorAll('[data-specimen-view]')]
    .map((n) => `${n.getAttribute('data-specimen-view')}::${n.innerHTML}`).join('\n'),
  exported: JSON.stringify(window.__export),
  verdict: document.querySelector('[data-honesty="moving-without-evidence"]')?.textContent.trim(),
}));

// 1. per-field control on a page that animates
{
  const { ctx, page, problems } = await open('#/component/river');
  const before = await read(page);
  const rows = await page.$$('.cd-evidence-list li');
  out.push(`river page: peak=${before.peak} marks=${before.marks} still=${before.still} box=${JSON.stringify(before.box)} fields=${rows.length}`);
  if (before.peak === 0) fail.push('the lane chart never animated — nothing to stop');
  if (rows.length < 2) fail.push('the per-field controls are missing');

  const path = await rows[0].getAttribute('data-field');
  await rows[0].$eval('button', (b) => b.click());
  await page.waitForTimeout(700);
  const after = await read(page);
  out.push(`  strip ${path}: still=${after.still} reasons=${JSON.stringify(after.reasons.slice(0, 3))} box=${JSON.stringify(after.box)} verdict=${after.verdict}`);
  if (!after.reasons.some((r) => r === before.reasons.find(() => false) || r)) fail.push('unreadable reasons');
  if (after.still <= before.still) fail.push(`stripping ${path} declared no new stillness`);
  if (!after.reasons.length) fail.push('no data-still-reason appeared');
  if (!after.ledger.length) fail.push('the ledger did not quote the reason');
  if (before.box && (Math.abs(after.box.w - before.box.w) > 2 || Math.abs(after.box.h - before.box.h) > 2)) {
    fail.push(`the specimen changed size when the measurement went: ${JSON.stringify(before.box)} → ${JSON.stringify(after.box)}`);
  }
  if (after.lying) fail.push(`MOVING WITHOUT EVIDENCE=${after.lying} after a strip`);
  if (problems.length) fail.push(`console: ${problems.join(' | ')}`);
  await ctx.close();
}

// 2. the rack switch across a family page
{
  const { ctx, page, problems } = await open('#/families/field');
  const before = await read(page);
  await page.click('[data-control="evidence"]');
  await page.waitForTimeout(900);
  const after = await read(page);
  const peakAfter = await page.evaluate(() => window.__peak);
  out.push(`field family: present peak=${before.peak} still=${before.still} → absent still=${after.still} marks=${after.marks} verdict=${after.verdict} (peak ever=${peakAfter})`);
  if (after.still < before.still) fail.push('the rack switch removed declared stillness instead of adding it');
  const declared = await page.evaluate(() => document.documentElement.dataset.evidence);
  if (declared !== 'absent') fail.push('the page does not say it is evidence-absent');
  if (problems.length) fail.push(`console: ${problems.join(' | ')}`);
  await ctx.close();
}

// 3. the kill switch leaves the markup byte-identical
for (const route of ['#/component/collar', '#/families/river', '#/']) {
  const { ctx, page, problems } = await open(route);
  await page.waitForTimeout(1200);           // let the elapsed counters write text
  const before = await read(page);
  await page.click('[data-control="kill"]');
  await page.waitForTimeout(400);
  const after = await read(page);
  const exported = await page.evaluate(() => JSON.stringify(window.__export));
  const stamped = await page.evaluate(() => document.documentElement.hasAttribute('data-motion-off'));
  const backToExport = await page.evaluate(() => {
    const views = [...document.querySelectorAll('[data-specimen-view]')];
    // A comparison against an empty record proves nothing: the gate that has to
    // say "settling changed nothing" also has to say it saw something to compare.
    if (!views.length || Object.keys(window.__export).length === 0) return false;
    return views.every((n) => window.__export[n.getAttribute('data-specimen-view') || '?'] === n.innerHTML);
  });
  out.push(`settle ${route}: animations ${before.animations} → ${after.animations}, stamped=${stamped}, settled is the export=${backToExport}`);
  if (after.animations !== 0) fail.push(`${route}: ${after.animations} animations survived settle()`);
  if (!stamped) fail.push(`${route}: settle did not stamp the root`);
  if (!backToExport) {
    const detail = await page.evaluate(() => {
      for (const n of document.querySelectorAll('[data-specimen-view]')) {
        const label = n.getAttribute('data-specimen-view') || '?';
        const was = window.__export[label];
        if (was !== undefined && was !== n.innerHTML) {
          const i = [...was].findIndex((c, k) => c !== n.innerHTML[k]);
          return `${label} at ${i}: ${JSON.stringify(was.slice(Math.max(0, i - 50), i + 50))} → ${JSON.stringify(n.innerHTML.slice(Math.max(0, i - 50), i + 50))}`;
        }
      }
      return 'no specimen recorded before motion started';
    });
    fail.push(`${route}: a settled page is not the rendered page -- ${detail}`);
  }
  // and motion comes back when the operator asks
  await page.click('[data-control="kill"]');
  await page.waitForTimeout(500);
  const resumed = await read(page);
  out.push(`  resume: animations=${resumed.animations} marks=${resumed.marks}`);
  if (problems.length) fail.push(`console ${route}: ${problems.join(' | ')}`);
  await ctx.close();
}

// 4. reduced motion: zero motion, and the readout still reads zero
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + '#/families/river', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const r = await read(page);
  out.push(`reduced-motion: animations=${r.animations} marks=${r.marks} still=${r.still} verdict=${r.verdict}`);
  if (r.animations !== 0) fail.push(`prefers-reduced-motion left ${r.animations} animations running`);
  if (r.verdict !== '0') fail.push('the readout does not read 0 under reduced motion');
  const killed = await page.$eval('[data-control="kill"]', (b) => ({ label: b.textContent.trim(), disabled: b.disabled }));
  out.push(`  kill switch under reduced motion: ${JSON.stringify(killed)}`);
  await ctx.close();
}

await browser.close();
console.log(out.join('\n'));
console.log(fail.length ? `\n✗ ${fail.length} FAILURES\n - ` + fail.join('\n - ') : '\n✓ every claim held');
process.exit(fail.length ? 1 : 0);
