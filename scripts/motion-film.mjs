// motion-film: the perceptibility instrument GOAL.md §4.3 demands.
//
// For each component it shoots its live stage at fixed times from mount,
// composes the frames into one labelled contact sheet (vault/film/), and
// measures the real pixel delta between the first and last frame. A
// component whose motion cannot move pixels fails here before anyone
// has to say "I don't see anything moving."
//
//   node scripts/motion-film.mjs                 -- all specs
//   node scripts/motion-film.mjs --only radar,collar
//
// Reads are vision's job; this file only produces the evidence: a
// sheet to look at and a number that cannot lie.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { startFeed } from './live-feed.mjs';
import { SPECS } from '../app/registry.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILM_DIR = path.join(ROOT, 'vault', 'film');

async function resolveChromium() {
  const dirs = [];
  if (process.env.PLAYWRIGHT_MODULE_DIR) dirs.push(process.env.PLAYWRIGHT_MODULE_DIR);
  try {
    dirs.push(path.join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'playwright'));
  } catch { /* none */ }
  dirs.push(path.join(os.homedir(), '.claude/skills/deck-render/node_modules/playwright'));
  for (const mod of [() => import('playwright'),
    ...dirs.filter((d) => fs.existsSync(path.join(d, 'package.json')))
      .map((d) => () => import(pathToFileURL(path.join(d, 'index.mjs')).href))]) {
    try {
      const m = await mod();
      if (m?.chromium) return m.chromium;
    } catch { /* next */ }
  }
  throw new Error('no playwright resolvable');
}

function args() {
  const argv = process.argv.slice(2);
  const get = (flag, dflt) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : dflt;
  };
  return {
    only: get('--only', '').split(',').filter(Boolean),
  };
}

// Fraction of pixels that differ beyond a stated colour distance.
// Fraction of pixels that moved, on quarter-quantised channels so JPEG
// ringing (a few levels) cannot register while real green-on-black motion
// (dozens of levels) cannot hide.
const DIFF = `(a, b) => {
  return new Promise((done) => {
    const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    Promise.all([load(a), load(b)]).then(([ia, ib]) => {
      const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(ia, 0, 0); const pa = g.getImageData(0, 0, w, h).data;
      g.clearRect(0, 0, w, h); g.drawImage(ib, 0, 0);
      const pb = g.getImageData(0, 0, w, h).data;
      let moved = 0, n = w * h;
      for (let i = 0; i < pa.length; i += 4) {
        const d = Math.abs((pa[i] >> 2) - (pb[i] >> 2)) + Math.abs((pa[i+1] >> 2) - (pb[i+1] >> 2)) + Math.abs((pa[i+2] >> 2) - (pb[i+2] >> 2));
        if (d > 6) moved++;
      }
      done(moved / n);
    });
  });
}`;

// Labelled contact sheet, one image per component: what vision reads.
const SHEET = async (page, frames, key, span) => {
  return page.evaluate(async ({ frames, key, span }) => {
    document.body.innerHTML = '';
    document.body.style.cssText = 'background:#000;margin:0;padding:0;width:max-content';
    const cell = 406;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:2px';
    const strip = document.createElement('div');
    strip.style.cssText = 'display:flex;gap:2px';
    frames.forEach((f) => {
      const cellBox = document.createElement('div');
      cellBox.style.cssText = `width:${cell}px;height:${f.height * 406 / f.width}px;position:relative`;
      const img = document.createElement('img');
      img.src = `data:image/png;base64,${f.b64}`;
      img.style.width = '100%';
      const tag = document.createElement('span');
      tag.textContent = `${f.t}ms`;
      tag.style.cssText = 'position:absolute;left:3px;top:2px;font:10px monospace;color:#fff;background:rgba(0,0,0,.75);padding:0 3px';
      cellBox.append(img, tag);
      strip.append(cellBox);
    });
    const head = document.createElement('div');
    head.textContent = `${key} — ${frames.length} frames from mount, to ${span}ms`;
    head.style.cssText = 'font:13px monospace;color:#ffb000;padding:2px';
    wrap.append(head, strip);
    document.body.append(wrap);
    await new Promise((ok) => setTimeout(ok, 250));
    return true;
  }, { frames, key, span });
};

const { only } = args();
fs.mkdirSync(FILM_DIR, { recursive: true });

const chromium = await resolveChromium();
const { server, port } = await startFeed();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1320, height: 1500 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  const P = { maxAnims: 0, h1: null, h2: null };
  window.__cdProbe = P;
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h; };
  setInterval(() => {
    const n = document.getAnimations().length;
    if (n > P.maxAnims) P.maxAnims = n;
    if (P.h1 === null && document.querySelector('#stage')) P._t0 = Date.now();
    if (P._t0 !== undefined) {
      const st = document.querySelector('#stage');
      if (P.h1 === null && Date.now() - P._t0 > 250) P.h1 = st ? hash(st.innerHTML) : 0;
      if (P.h1 !== null && P.h2 === null && Date.now() - P._t0 > 3200) P.h2 = st ? hash(st.innerHTML) : 0;
    }
  }, 32);
});
const page = await ctx.newPage();
const blank = await browser.newPage();
const sheet = await browser.newPage();

// Dark once at the landing page; the choice persists, so every component
// page below mounts fresh already in dark — frame zero is frame zero.
await page.goto(`http://127.0.0.1:${port}/app/index.html`, { waitUntil: 'load' });
await page.waitForSelector('[data-theme-choice="dark"]');
await page.click('[data-theme-choice="dark"]');
await page.waitForTimeout(300);

const keys = only.length ? only : Object.keys(SPECS);
const report = [];
for (const key of keys) {
  if (!SPECS[key]) { console.log(`skip ${key}: not a spec`); continue; }
  try {
    await shoot(key);
  } catch (err) {
    console.log(`FAIL ${key}: ${String(err.message).split('\n')[0]}`);
    report.push({ key, deltaPct: -2 });
  }
}

async function shoot(key) {
  await page.goto(`http://127.0.0.1:${port}/app/index.html?film=${Math.random()}#/component/${key}`,
    { waitUntil: 'commit' });
  // A hash-only goto is same-document; the random query forces a real load
  // every time so frame zero means what it says. The wait returns the box
  // in the same round-trip: every extra hop lands AFTER short marks die.
  const box = await (await page.waitForFunction(() => {
    const el = document.querySelector('#stage');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return null;
    return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 860) };
  }, null, { timeout: 8000 })).jsonValue();
  const shots = [];
  const times = [];
  let shotClock = 0;
  const grab = async (waitMs) => {
    if (waitMs) await page.waitForTimeout(waitMs);
    shotClock += waitMs;
    shots.push(await page.screenshot({ clip: box, type: 'jpeg', quality: 70 }));
    times.push(shotClock);
  };
  // JPEG at dsf1 keeps each shot fast enough to bracket 300ms marks; the
  // comparison quantizes colours so JPEG noise cannot fake movement.
  for (let i = 0; i < 10; i++) await grab(i === 0 ? 60 : 70); // ~0-700ms burst
  for (let i = 0; i < 6; i++) await grab(800);                // loops to ~5.5s
  let delta = 0;
  for (let i = 0; i + 1 < shots.length; i++) {
    const d = await blank.evaluate(
      new Function('p', `return (${DIFF})(p.a, p.b)`),
      { a: `data:image/jpeg;base64,${shots[i].toString('base64')}`,
        b: `data:image/jpeg;base64,${shots[i + 1].toString('base64')}` });
    if (d > delta) delta = d;
  }
  const probe = await page.evaluate(() => window.__cdProbe || null);
  const picked = [0, 2, 4, 6, 8, 11, 13, 15].filter((i) => i < shots.length).map((i) =>
    ({ b64: shots[i].toString('base64'), width: box.width, height: box.height, t: times[i] }));
  await SHEET(sheet, picked, key, picked[picked.length - 1].t);
  await sheet.screenshot({ path: path.join(FILM_DIR, `${key}.png`), fullPage: true });
  await sheet.goto('about:blank');
  report.push({
    key,
    deltaPct: Math.round(delta * 1000) / 10,
    anims: probe ? probe.maxAnims : -1,
    dom: probe ? (probe.h1 !== probe.h2) : false,
  });
}
await browser.close();
server.close();
report.sort((a, b) => a.deltaPct - b.deltaPct);
for (const r of report) {
  const alive = (r.anims ?? -1) > 0 || r.dom || r.deltaPct > 0.2;
  console.log(`${String(r.deltaPct).padStart(6)}%  ${String(r.anims).padStart(3)}a  ${r.dom ? 'dom' : '   '}  ${alive ? '' : 'DEAD '}${r.key}`);
}
const dead = report.filter((r) => (r.anims ?? -1) <= 0 && !r.dom && r.deltaPct <= 0.2);
console.log(`\n${report.length} filmed -> ${path.relative(process.cwd(), FILM_DIR)}/`);
console.log(dead.length ? `DEAD: ${dead.map((r) => r.key).join(', ')}` : 'every component moves');
