import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:5299/';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto(BASE + '#/component/radar', { waitUntil: 'commit' });
await p.waitForSelector('[data-specimen-view="radar"]', { timeout: 15000 });
await p.waitForTimeout(1400);
console.log(JSON.stringify(await p.evaluate(async () => {
  const el = document.querySelector('[data-specimen-view="radar"] .cd-fd-sweep');
  if (!el) return { missing: true };
  // The runtime animates the individual `rotate` property, so `transform` reads a plain matrix
  // and the instrument reports null: measure the property that is actually being driven, and fall
  // back to the matrix for a host that authors the shorthand instead.
  const deg = () => {
    const cs = getComputedStyle(el);
    const rot = /(-?[0-9.]+)deg/.exec(cs.rotate || '');
    if (rot) return Number((((Number(rot[1]) % 360) + 360) % 360).toFixed(2));
    const m = (cs.transform || '').match(/matrix\(([^)]+)\)/);
    if (!m) return null;
    const [a, bb] = m[1].split(',').map(Number);
    return Number(((Math.atan2(bb, a) * 180 / Math.PI + 360) % 360).toFixed(2));
  };
  const seen = [];
  const wait = () => new Promise((r) => requestAnimationFrame(r));
  const t0 = performance.now();
  let wraps = 0, back = 0, prev = null;
  for (;;) {
    const d = deg();
    if (d !== null && prev !== null) {
      let step = d - prev;
      if (step > 180) step -= 360;
      if (step < -180) step += 360;
      if (d < prev - 1 && Math.abs(step) < 20) back++;
      if (d < prev - 1 && Math.abs(step) >= 20) wraps++;
    }
    if (d !== null) { seen.push(d); prev = d; }
    if (performance.now() - t0 > 13000) break;
    await wait();
  }
  return {
    angleFirst: seen[0], angleAt30: seen[30], angleLast: seen[seen.length - 1],
    distinctAngles: new Set(seen).size, frames: seen.length, wraps, rewoundFrames: back,
    attrs: [...el.attributes].map((a) => `${a.name}=${a.value}`),
    animations: el.getAnimations().map((a) => ({
      ctor: a.constructor.name,
      keys: (a.effect?.getKeyframes?.() || []).map((k) => Object.keys(k)
        .filter((x) => !['offset', 'easing', 'composite', 'computedOffset'].includes(x)).join('+')),
      iterations: a.effect?.getTiming?.().iterations,
    })),
    transformSamples: seen,
  };
}), null, 1));
await b.close();
