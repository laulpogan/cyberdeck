import { chromium } from 'playwright';
// Opens no page this tree cannot identify. See app/verify/app-identity.mjs — a probe of the wrong
// worktree is believed exactly as readily as a gate's number.
import { assertServedThisCheckout, defaultBase } from './app-identity.mjs';
const b = await chromium.launch();
await assertServedThisCheckout(browser, typeof BASE === 'string' ? BASE : defaultBase(), 'app/verify/probe-bar.mjs');
const p = await b.newPage();
await p.goto('http://127.0.0.1:5299/#/rules');
await p.waitForSelector('.cd-rule-bar');
await p.waitForTimeout(2500);
const rows = await p.evaluate(() => [...document.querySelectorAll('.cd-rule-bar')].map((el) => {
  const i = el.querySelector('i');
  const cs = getComputedStyle(i);
  const track = el.getBoundingClientRect();
  const bar = i.getBoundingClientRect();
  return { level: el.getAttribute('data-level'), inlineI: i.getAttribute('style'),
    origin: cs.transformOrigin, transformBox: cs.transformBox, computedI: cs.transform,
    computedSpan: getComputedStyle(el).transform, trackW: +track.width.toFixed(1),
    barW: +bar.width.toFixed(1), ratio: +(bar.width / track.width).toFixed(3),
    leftInset: +(bar.left - track.left).toFixed(1) };
}));
console.log(JSON.stringify(rows, null, 1));
await b.close();
