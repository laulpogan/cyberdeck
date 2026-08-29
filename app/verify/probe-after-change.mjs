// What is animating in the window right AFTER a field is removed? The change-time assert reads the
// same list, so this is the fastest way to see whether a planted fade is missing from the recorder's
// view or merely rejected by its filter.
//   node app/verify/probe-after-change.mjs [route] [field path]
import { chromium } from 'playwright';
const route = process.argv[2] || '#/component/hardCut';
const field = process.argv[3] || 'changed';
const base = process.env.BASE || 'http://127.0.0.1:5299/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(base + route);
await p.waitForSelector('[data-specimen-view]');
await p.waitForTimeout(1200);
const clicked = await p.evaluate((want) => {
  const btn = [...document.querySelectorAll('[data-control="field"]')]
    .find((x) => (x.closest('li')?.getAttribute('data-field') || '').includes(want));
  if (!btn) return false;
  btn.click();
  return true;
}, field);
console.log('control clicked:', clicked);
for (const step of [30, 50, 70, 150, 300]) {
  await p.waitForTimeout(step);
  const out = await p.evaluate(() => {
    const view = document.querySelector('[data-specimen-view]');
    const list = view.getAnimations ? view.getAnimations({ subtree: true }) : [];
    const page = document.getAnimations().filter((a) => {
      const t = a.effect && a.effect.target;
      return t && view.contains(t);
    });
    return {
      viaSubtree: list.length,
      viaPageFilter: page.length,
      ctors: [...new Set(list.map((a) => a.constructor.name))],
      named: list.filter((a) => a.animationName).map((a) => a.animationName).slice(0, 5),
      first: list.slice(0, 2).map((a) => ({
        ctor: a.constructor.name, tgt: a.effect && a.effect.target ? a.effect.target.tagName : null,
        keys: a.effect && a.effect.getKeyframes
          ? a.effect.getKeyframes().map((k) => Object.keys(k).join('+')) : null })),
    };
  });
  console.log(JSON.stringify(out));
}
await b.close();
