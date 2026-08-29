// What does the animation list actually contain, for a CSS animation the runtime did not make?
//   node app/verify/probe-anims.mjs [route]
// Written to settle one question about `no_blend_on_change`: `effect.getKeyframes()` is shaped
// differently for a CSSAnimation than for the WAAPI keyframes the runtime builds, and a filter
// written against one can silently match neither -- which is how an instrument reports "0 opacity
// animations on text" while every label on the page is visibly fading.
import { chromium } from 'playwright';
const route = process.argv[2] || '#/component/hardCut';
const base = process.env.BASE || 'http://127.0.0.1:5299/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(base + route);
await p.waitForSelector('[data-specimen-view]');
for (const step of [120, 300, 600, 1400]) {
  await p.waitForTimeout(step);
  const out = await p.evaluate(() => {
    const view = document.querySelector('[data-specimen-view]');
    const list = view.getAnimations ? view.getAnimations({ subtree: true }) : [];
    const shape = list.slice(0, 4).map((an) => {
      const eff = an.effect;
      const tgt = eff && eff.target ? eff.target : (an.target || null);
      let keys = null;
      try { keys = eff && eff.getKeyframes ? eff.getKeyframes().map((k) => Object.keys(k).join('+')) : null; }
      catch (e) { keys = 'throws: ' + e.message; }
      return {
        ctor: an.constructor.name,
        name: an.animationName || an.transitionProperty || null,
        state: an.playState,
        target: tgt ? tgt.tagName : null,
        text: tgt ? (tgt.textContent || '').trim().slice(0, 12) : null,
        keys,
      };
    });
    return { n: list.length, shape };
  });
  console.log(`+${step}ms`, JSON.stringify(out).slice(0, 500));
}
await b.close();
