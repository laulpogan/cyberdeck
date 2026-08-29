// One specimen, shot large enough to read, because "it passed the counters" and "it looks right"
// are different questions and only one of them is answered by a number.
//
//   node app/verify/shot-one.mjs "#/component/joiOverlay" /tmp/joi.png [width]
import { chromium } from 'playwright';
// Opens no page this tree cannot identify. See app/verify/app-identity.mjs — a probe of the wrong
// worktree is believed exactly as readily as a gate's number.
import { assertServedThisCheckout, defaultBase } from './app-identity.mjs';
const [route, out, widthArg] = process.argv.slice(2);
if (!route || !out) {
  console.error('usage: node app/verify/shot-one.mjs <#route> <out.png> [width]');
  process.exit(2);
}
const width = Number(widthArg || 1280);
const base = process.env.BASE || 'http://127.0.0.1:5299/';
const b = await chromium.launch();
await assertServedThisCheckout(browser, typeof BASE === 'string' ? BASE : defaultBase(), 'app/verify/shot-one.mjs');
const p = await b.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
await p.goto(base + route);
await p.waitForTimeout(2200);
const target = await p.$('[data-specimen-view] .cd-card, .cd-card, main');
const box = await target.boundingBox();
await p.screenshot({ path: out, clip: { x: box.x, y: Math.max(0, box.y),
  width: Math.min(box.width, width), height: Math.min(box.height, 860) } });
console.log(`${out}  ${Math.round(box.width)}x${Math.round(box.height)} @${width}px  ${route}`);
await b.close();
