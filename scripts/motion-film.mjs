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
const FILM_DIR = path.join(ROOT, 'vault', 'film',
  process.argv.includes('--theme') && !process.argv.includes('--theme dark') ? 'light'
    : process.argv.includes('--reduced') ? 'reduced' : '');

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
    interact: process.argv.includes('--interact'),
    theme: get('--theme', 'dark'),
    reduced: process.argv.includes('--reduced'),
  };
}

// Components the load-time reel finds still -- by design (a refusal in
// the markup) or because their fixture's story is "nothing has arrived".
// Still-at-load is honest only if the moment evidence arrives moves;
// --interact strips evidence via the page's own control and films the
// restore, so "dead" is never confused with "refusing on purpose".
// radar rides as the positive control: it must arrive MOVING.
const ARRIVAL_KEYS = ['radar', 'standard-sheet', 'joi', 'oracle', 'killmail', 'strip',
  'two-state', 'queue', 'envelope', 'garage', 'grid', 'gevulot', 'dominator',
  'ladder', 'disc', 'dossier', 'channel', 'redaction'];

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

const { only, interact, theme, reduced } = args();
fs.mkdirSync(FILM_DIR, { recursive: true });

const chromium = await resolveChromium();
const { server, port } = await startFeed();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1320, height: 1500 }, deviceScaleFactor: 1,
  ...(reduced ? { reducedMotion: 'reduce' } : {}) });
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
await page.click(`[data-theme-choice="${theme}"]`);
await page.waitForTimeout(300);

const keys = only.length ? only : (interact ? ARRIVAL_KEYS : Object.keys(SPECS));

// The honesty theatre on camera: film #/live answering the producer,
// kill the producer mid-reel, and keep rolling. A failed poll yields the
// dark model immediately -- the frames below must show the page go dark
// with its own refusal reasons, honesty bar at zero throughout.
if (process.argv.includes('--live-reel')) {
  await page.goto(`http://127.0.0.1:${port}/app/index.html?film=${Math.random()}#/live`,
    { waitUntil: 'commit' });
  // The live slot starts as a stub and grows on the first answer: a clip
  // taken at mount would film the empty strip forever. The whole viewport
  // is the honest frame for a page that grows into itself.
  const box = { x: 0, y: 0, width: 1320, height: 1000 };
  const shots = []; const times = []; let t = 0;
  const grab = async (waitMs, label) => {
    await page.waitForTimeout(waitMs); t += waitMs;
    shots.push({ buf: await page.screenshot({ clip: box, type: 'jpeg', quality: 70 }), t, label });
  };
  for (let i = 0; i < 9; i++) await grab(600, 'live');     // ~5.4s of answers
  server.close();                                           // kill the producer
  await page.waitForTimeout(2200); t += 2200;              // the next poll fails
  for (let i = 0; i < 8; i++) await grab(700, 'dark');     // dark model holds
  const lying = await page.textContent('#h-lying');
  const flags = await page.evaluate(() => {
    const s = document.querySelector('#view').textContent;
    return { answered: s.includes('ANSWERED'), noAnswer: s.includes('NO ANSWER'),
             unmeasured: /UNMEASURED|REFUS|AWAIT/i.test(s) }; });
  let delta = 0;
  for (let i = 0; i + 1 < shots.length; i++) {
    const d = await blank.evaluate(new Function('p', `return (${DIFF})(p.a, p.b)`),
      { a: `data:image/jpeg;base64,${shots[i].buf.toString('base64')}`,
        b: `data:image/jpeg;base64,${shots[i + 1].buf.toString('base64')}` });
    if (d > delta) delta = d;
  }
  const picked = [0, 3, 6, 8, 9, 11, 13, 16].filter((i) => i < shots.length)
    .map((i) => ({ b64: shots[i].buf.toString('base64'), width: box.width,
                   height: box.height, t: shots[i].t }));
  await SHEET(sheet, picked, `live-reel  producer killed at ${shots[8].t}ms  `
    + `MOVING-WITHOUT-EVIDENCE=${lying}`, picked[picked.length - 1].t);
  await sheet.screenshot({ path: path.join(FILM_DIR, 'live-reel.png'), fullPage: true });
  console.log(`live-reel: delta=${(delta * 100).toFixed(1)}% MEW=${lying} flags=${JSON.stringify(flags)}`);
  console.log(flags.noAnswer && flags.unmeasured && Number(lying) === 0
    ? 'DARK ON FEED-DOWN, honesty bar clean' : 'LIVE-REEL CHECK FAILED -- see flags');
  await browser.close();
  process.exit(0);
}
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
  const box = await boxOf();
  if (interact) {
    await page.waitForTimeout(1300); // let the load render settle to still
    const movable = await page.evaluate(() => [...document.querySelectorAll('#stage [data-motion]')]
      .filter((el) => { const k = el.getAttribute('data-motion'); return k !== 'still' && k !== 'intent'; }).length);
    await page.click('#btn-evidence'); // strip all evidence
    await page.waitForTimeout(300);
    await boxOf(); // the dark model may sit at a different height
    await page.evaluate(() => { window.__cdProbe.maxAnims = 0; });
    await page.click('#btn-evidence'); // restore it: this is the arrival
    const r = await burst(key, '-arrival');
    r.movable = movable;
    return r;
  }
  return await burst(key, '', box);
}

async function boxOf(sel) {
  return (await page.waitForFunction((q) => {
    const el = document.querySelector(q || '#stage');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return null;
    return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 860) };
  }, sel || '#stage', { timeout: 8000 })).jsonValue();
}

async function burst(key, suffix, pre) {
  const box = pre || await boxOf();
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
  const lying = suffix ? await page.textContent('#h-lying') : null;
  if (!suffix) for (let i = 0; i < 6; i++) await grab(800);    // loops to ~5.5s
  let delta = 0;
  for (let i = 0; i + 1 < shots.length; i++) {
    const d = await blank.evaluate(
      new Function('p', `return (${DIFF})(p.a, p.b)`),
      { a: `data:image/jpeg;base64,${shots[i].toString('base64')}`,
        b: `data:image/jpeg;base64,${shots[i + 1].toString('base64')}` });
    if (d > delta) delta = d;
  }
  const probe = await page.evaluate(() => window.__cdProbe || null);
  const clocks = suffix ? await page.evaluate(
    () => (window.CyberdeckMotion && window.CyberdeckMotion.clocks) ? window.CyberdeckMotion.clocks() : 0) : 0;
  const picked = (suffix ? [0, 2, 4, 6, 8, 9] : [0, 2, 4, 6, 8, 11, 13, 15])
    .filter((i) => i < shots.length).map((i) =>
      ({ b64: shots[i].toString('base64'), width: box.width, height: box.height, t: times[i] }));
  await SHEET(sheet, picked, key + suffix + (lying !== null ? `  MOVING-WITHOUT-EVIDENCE=${lying}` : ''),
    picked[picked.length - 1].t);
  await sheet.screenshot({ path: path.join(FILM_DIR, `${key}${suffix}.png`), fullPage: true });
  await sheet.goto('about:blank');
  const entry = {
    key: key + suffix,
    deltaPct: Math.round(delta * 1000) / 10,
    anims: probe ? probe.maxAnims : -1,
    dom: probe ? (probe.h1 !== probe.h2) : false,
    lying: suffix ? Number(lying) : null,
    clocks,
  };
  report.push(entry);
  return entry;
}
await browser.close();
server.close();
report.sort((a, b) => a.deltaPct - b.deltaPct);
for (const r of report) {
  const alive = (r.anims ?? -1) > 0 || r.dom || r.deltaPct > 0.2 || (r.clocks ?? 0) > 0;
  // A refusal's full model carries no movable mark at all: the arrival
  // staying still IS the designed behaviour, not a dead component.
  const byDesign = r.movable === 0;
  console.log(`${String(r.deltaPct).padStart(6)}%  ${String(r.anims).padStart(3)}a  ${r.dom ? 'dom' : '   '}  ${byDesign ? 'BY-DESIGN' : alive ? '' : 'DEAD '}${r.key}`
    + ((r.clocks ?? 0) ? `  clk=${r.clocks}` : '')
    + (r.lying === null || r.lying === undefined ? '' : `  MEW=${r.lying}${r.lying > 0 ? ' <-- VIOLATION' : ''}`));
}
const dead = report.filter((r) => r.movable !== 0 && (r.anims ?? -1) <= 0 && !r.dom
  && r.deltaPct <= 0.2 && (r.clocks ?? 0) === 0);
console.log(`\n${report.length} filmed -> ${path.relative(process.cwd(), FILM_DIR)}/`);
if (reduced) {
  // Under prefers-reduced-motion, stillness is the contract: a MOVING
  // row here is a violation, and the stills are the pass.
  console.log(dead.length === report.length ? 'reduced-motion: every component still, as contracted'
    : `REDUCED-MOTION VIOLATIONS: ${report.filter((r) => !dead.includes(r)).map((r) => r.key).join(', ')}`);
} else {
  console.log(dead.length ? `DEAD: ${dead.map((r) => r.key).join(', ')}` : 'every component moves');
}
