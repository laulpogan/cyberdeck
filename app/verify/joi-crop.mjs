import { chromium } from 'playwright';
// Opens no page this tree cannot identify. See app/verify/app-identity.mjs — a probe of the wrong
// worktree is believed exactly as readily as a gate's number.
import { assertServedThisCheckout, defaultBase } from './app-identity.mjs';
const b = await chromium.launch();
await assertServedThisCheckout(browser, typeof BASE === 'string' ? BASE : defaultBase(), 'app/verify/joi-crop.mjs');
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 3 });
await p.goto((process.env.BASE || 'http://127.0.0.1:5299/') + '#/component/joiOverlay');
await p.waitForSelector('.cd-th-overlay');
const a = await p.$('.cd-th-canon'); const z = await p.$('.cd-th-overlay');
const ra = await a.boundingBox(); const rz = await z.boundingBox();
await p.screenshot({ path: '/tmp/joi-cross.png', clip: { x: ra.x - 14, y: ra.y - 10,
  width: Math.max(ra.width, rz.width) + 40, height: (rz.y + rz.height) - ra.y + 20 } });
console.log('/tmp/joi-cross.png  canon', Math.round(ra.width), 'x', Math.round(ra.height),
  ' overlay', Math.round(rz.width), 'x', Math.round(rz.height));
await b.close();
