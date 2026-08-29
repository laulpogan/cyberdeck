/** The gauntlet: every named gap, measured against the reference that named it.
 *
 * Step 3 of the goal wrote down how each reference moves — entry order, rate, what stays still,
 * what a dead state looks like. Step 4 changed the components towards those readings. This is
 * step 5: one command that re-runs the measurements, prints the numbers side by side with the
 * figures quoted out of `vault/SPECS.md`, writes a sheet per gap with the reference's own frames
 * above the app's, and exits non-zero when a gap is still open.
 *
 * Three things this refuses to be:
 *
 *   1. A screenshot. A picture says what a specimen looks like; every check here is a number
 *      taken across frames, because every gap in `vault/GAUNTLET.json` is about a rate, an order,
 *      or something that does not move.
 *   2. A measurement taken after the page settles. Entrance motion is over in ~300 ms, so a
 *      count sampled when things are calm reads zero whether or not anything moved — the defect
 *      the peak counter exists for. The recorder here is installed before navigation and runs one
 *      `requestAnimationFrame` callback from the moment the specimen exists.
 *   3. A check that can pass because nothing was on screen. Every kind reports what it counted:
 *      zero tracked elements, zero contacts, or a zero-length travel is a FAILURE of the check,
 *      not a vacuous pass.
 *
 * Rows in `vault/GAUNTLET.json` with `heldAs: caution` or `counter-example` carry no `assert`.
 * They appear in the output marked `held` rather than `pass` — a sheet that quietly re-labelled
 * documentation as green is how a review stops being able to tell the difference.
 *
 *   BASE=http://127.0.0.1:5299/ node app/verify/gauntlet.mjs
 *   BASE=… OUT=/tmp/gauntlet GAPS=globe-constant-rate node app/verify/gauntlet.mjs
 *
 * Then compose the pictures:
 *   python3 app/verify/gauntlet-sheet.py OUT=/tmp/gauntlet
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { audit as furnitureAudit } from './furniture.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const BASE = process.env.BASE || 'http://127.0.0.1:5199/';
const OUT = process.env.OUT || join(ROOT, 'app/verify/GAUNTLET');
const only = process.env.GAPS ? process.env.GAPS.split(',') : null;
const SAMPLE_MS = Number(process.env.SAMPLE_MS || 16);

mkdirSync(OUT, { recursive: true });

const GAPS = JSON.parse(readFileSync(join(ROOT, 'vault/GAUNTLET.json'), 'utf8')).gaps
  .filter((g) => !only || only.includes(g.id));

/** Installed before navigation. Records what every element in the specimen was doing, per frame,
 * from the instant the specimen existed — not from the instant the page finished loading, which
 * is a different and later event on a hash-routed page. */
function recorder(cfg) {
  window.__cfg = cfg;
  window.__rec = { t0: null, frames: [], notes: [] };

  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return [r.x, r.y, r.width, r.height];
  };
  const angleOf = (el) => {
    const cs = getComputedStyle(el);
    const own = (cs.rotate || '').trim();
    const deg = own && own !== 'none' ? /(-?[\d.]+)deg/.exec(own) : null;
    if (deg) return Number(deg[1]);
    const m = (cs.transform || '').match(/matrix\(([^)]+)\)/);
    if (m) {
      const [a, b] = m[1].split(',').map(Number);
      return Math.atan2(b, a) * 180 / Math.PI;
    }
    return 0;
  };
  const translateOf = (el) => {
    // The globe's pins are moved with an SVG `transform` attribute, which getComputedStyle does
    // not report as a matrix on every engine. Read the attribute the loop wrote.
    const m = /translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(el.getAttribute('transform') || '');
    return m ? [Number(m[1]), Number(m[2])] : null;
  };
  const own = (el) => (el.getAnimations ? el.getAnimations({ subtree: false }).length : 0);

  const tick = () => {
    const doc = document;
    const view = doc.querySelector('[data-specimen-view]');
    const scope = cfg.scopeSpecimen && view ? view : doc;
    const target = cfg.selector ? scope.querySelector(cfg.selector) : null;
    // An empty selector string throws, and an exception in a rAF callback kills the loop
    // without failing the run — the recorder would simply have nothing to report.
    const furniture = cfg.furniture ? [...scope.querySelectorAll(cfg.furniture)] : [];
    const contacts = cfg.contacts ? [...scope.querySelectorAll(cfg.contacts)] : [];
    // What has to exist before the clock starts. A cell-stillness check has no marked element
    // to wait for and must not start on an empty document — the first frame's boxes define the
    // grid, and a grid fitted over the app chrome would measure the rack instead of the specimen.
    const ready = cfg.selector ? !!target
      : cfg.gridCells ? !!view
        : furniture.length > 0 || contacts.length > 0;
    if (ready && window.__rec.t0 === null) window.__rec.t0 = performance.now();
    if (window.__rec.t0 !== null) {
      const t = performance.now() - window.__rec.t0;
      const tracked = [...new Set([
        ...(cfg.selector ? [...scope.querySelectorAll(cfg.selector)] : []),
        ...furniture, ...contacts,
      ])];
      const everything = cfg.gridCells ? [...scope.querySelectorAll('*')] : [];
      const nSel = cfg.selector ? tracked.filter((el) => el.matches(cfg.selector)).length : 0;
      // The animation's own clock, read from the animation the runtime made. "Half the
      // duration" has to mean the animation's half — measuring against the sampling window
      // would put half of a 1600ms capture past the end of a 300ms entrance, and every
      // settled specimen would read as perfectly front-loaded.
      let clock = null;
      if (target && target.getAnimations) {
        const an = target.getAnimations({ subtree: false })[0]
          || (target.firstElementChild ? target.firstElementChild.getAnimations({ subtree: false })[0] : null);
        if (an && an.effect) {
          const ct = an.effect.getComputedTiming();
          clock = { progress: ct.progress === null ? null : ct.progress, state: an.playState,
                    delay: ct.delay, duration: ct.activeDuration };
        }
      }
      window.__rec.frames.push({
        t,
        clock,
        nSel, nFurn: furniture.length, nCont: contacts.length,
        anims: doc.getAnimations ? doc.getAnimations().length : 0,
        el: tracked.map((el) => ({
          r: rectOf(el),
          a: angleOf(el),
          p: cfg.wantTranslate ? translateOf(el) : null,
          o: getComputedStyle(el).opacity,
          n: own(el),
          k: (el.getAttribute('class') || el.tagName) + '|' + (el.textContent || '').slice(0, 18),
        })),
        all: everything.map((el) => ({ r: rectOf(el), n: own(el), o: getComputedStyle(el).opacity })),
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** The one quantity a rate check follows, read off the element the animation is on. */
function valueOf(e, property) {
  if (property === 'angle') return e.a;
  if (property === 'rightEdge') return e.r[0] + e.r[2];
  if (property === 'width') return e.r[2];
  if (property === 'translateX') return e.p ? e.p[0] : NaN;
  return NaN;
}

/** Progress of a driven quantity: 0 at its first sampled value, 1 at its last. */
function series(frames, key) {
  const out = [];
  for (const f of frames) {
    if (!f.el.length) continue;
    if (key === 'angle') out.push([f.t, Math.abs(f.el[0].a)]);
    else if (key === 'rightEdge') out.push([f.t, f.el[0].r[0] + f.el[0].r[2]]);
    else if (key === 'width') out.push([f.t, f.el[0].r[2]]);
    else if (key === 'translateX') out.push([f.t, f.el[0].p ? f.el[0].p[0] : NaN]);
  }
  return out.filter((p) => Number.isFinite(p[1]));
}

/** How far along it was at half the total elapsed time, and when it got there. */
function progressAt(s, ratio) {
  if (s.length < 3) return null;
  const start = s[0][1];
  const end = s[s.length - 1][1];
  const span = Math.abs(end - start);
  if (span < 1e-6) return { span: 0, atHalf: null, arriveAt: null };
  const tHalf = s[0][0] + (s[s.length - 1][0] - s[0][0]) * ratio;
  const dir = Math.sign(end - start);
  let atHalf = null;
  for (const [t, v] of s) { if (t <= tHalf) atHalf = (v - start) / (end - start); }
  let arriveAt = null;
  for (const [t, v] of s) {
    if ((v - start) / (end - start) >= 0.985) { arriveAt = t - s[0][0]; break; }
  }
  return { span, atHalf, arriveAt, direction: dir };
}

/** How long a turn takes, timed rather than fitted.
 *
 * The first version of this fitted `A·sin(ωt)+B·cos(ωt)+b` and grid-searched ω. Over a window
 * shorter than about 1.5 turns that basis is nearly degenerate — a slowly varying sinusoid can
 * imitate a straight line — so the search wandered off to a 7 s period in a 3 s window and
 * reported R² below zero, which is not a measurement of anything. Timing the pin as it crosses
 * its own mean going up is not cleverer, it is just honest: two crossings are one period, three
 * are two periods, and the spread between them IS the constancy the reference is quoted for
 * ("0.367 of the frame crossed, 0.43 of the way along at half the duration, over 4.2s"). */
function turnTimes(samples) {
  const t0 = samples[0][0];
  const pts = samples.map(([t, x]) => [(t - t0) / 1000, x]);
  const mean = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const crossings = [];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i - 1][1] < mean && pts[i][1] >= mean) {
      const f = (mean - pts[i - 1][1]) / (pts[i][1] - pts[i - 1][1]);
      crossings.push(pts[i - 1][0] + f * (pts[i][0] - pts[i - 1][0]));
    }
  }
  const turns = crossings.slice(1).map((t, i) => t - crossings[i]);
  if (turns.length < 2) return { crossings: crossings.length, turns };
  const sorted = [...turns].sort((a, b) => a - b);
  return { crossings: crossings.length, turns, medianMs: sorted[Math.floor(sorted.length / 2)] * 1000 };
}

/** Cell stillness, measured the way the reference is quoted: a 4×3 grid over the specimen, and
 * how many cells contain nothing that ever moved. An element counts as moving if its rectangle
 * moved more than a pixel, if its own opacity changed, or if an animation targets it — because a
 * label fading in did change, and calling that still would be the instrument disagreeing with
 * its own definition of a change. */
function deadCells(frames, tolerancePx) {
  const live = new Set();
  const cellOf = (x, y) => {
    const first = frames[0];
    if (!first || !first.all.length) return null;
    const box = first.all.reduce((acc, e) => ({
      x0: Math.min(acc.x0, e.r[0]), y0: Math.min(acc.y0, e.r[1]),
      x1: Math.max(acc.x1, e.r[0] + e.r[2]), y1: Math.max(acc.y1, e.r[1] + e.r[3]),
    }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
    const w = (box.x1 - box.x0) / 4, h = (box.y1 - box.y0) / 3;
    const cx = Math.floor((x - box.x0) / Math.max(w, 1e-6));
    const cy = Math.floor((y - box.y0) / Math.max(h, 1e-6));
    if (cx < 0 || cx > 3 || cy < 0 || cy > 2) return null;
    return cy * 4 + cx;
  };
  const base = frames[0];
  for (let i = 1; i < frames.length; i++) {
    const f = frames[i];
    if (f.all.length !== base.all.length) continue;          // the tree changed; compare again later
    for (let e = 0; e < f.all.length; e++) {
      const a = base.all[e], b = f.all[e];
      const moved = Math.abs(a.r[0] - b.r[0]) > tolerancePx || Math.abs(a.r[1] - b.r[1]) > tolerancePx
        || Math.abs(a.r[2] - b.r[2]) > tolerancePx || Math.abs(a.r[3] - b.r[3]) > tolerancePx
        || Math.abs(a.o - b.o) > 0.01 || b.n > 0;
      if (!moved) continue;
      const cell = cellOf(a.r[0] + a.r[2] / 2, a.r[1] + a.r[3] / 2);
      if (cell !== null) live.add(cell);
    }
  }
  return { dead: 12 - live.size, live: live.size };
}

const browser = await chromium.launch();
const rows = [];

for (const gap of GAPS) {
  const route = gap.route || (gap.component ? `#/component/${gap.component}` : null);
  const a = gap.assert || {};
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const row = { id: gap.id, component: gap.component, route, reference: gap.reference,
                referenceFigure: gap.referenceFigure, heldAs: gap.heldAs, gap: gap.gap,
                measured: null, verdict: 'held', detail: '' };
  // A row with no assert still gets its pictures. A caution is a thing someone has to look at
  // to keep meaning anything; if it never renders, it silently becomes a comment in a JSON file.
  const needPage = a.kind ? a.kind !== 'furniture_audit_clean' : !!(gap.component || gap.route);

  try {
    if (a.kind === 'furniture_audit_clean') {
      const hits = furnitureAudit();
      row.measured = `${hits.length} mark(s) on furniture across every bright model`;
      row.verdict = hits.length === 0 ? 'pass' : 'FAIL';
      row.detail = hits.map((h) => `${h.key}:${h.cls}->${h.furniture}`).join(', ') || 'clean';
    } else if (needPage) {
      await page.addInitScript(recorder, {
        selector: a.selector || null,
        furniture: a.furniture || null,
        contacts: a.contacts || null,
        gridCells: a.kind === 'dead_cells',
        wantTranslate: a.kind === 'turn_period',
        scopeSpecimen: !!gap.component,
      });
      await page.goto(BASE + route, { waitUntil: 'commit' });

      // Wait for THIS specimen. On a hash router the landing page also carries a
      // [data-specimen-view], and a gate that measures Home while reporting a component route is
      // worse than no gate.
      if (gap.component) {
        await page.waitForSelector(`[data-specimen-view="${gap.component}"]`, { timeout: 15000 });
      } else {
        await page.waitForLoadState('domcontentloaded');
      }

      // The clips are for the sheet, and they are taken while the entrance runs. A screenshot
      // costs tens of milliseconds, which is why every measurement above is timestamped inside
      // the page rather than counted from the outside.
      const clips = [];
      const clipTarget = gap.component
        ? await page.$(`[data-specimen-view="${gap.component}"]`)
        : await page.$('.cd-vault');
      const windowMs = a.windowMs || 1600;
      const started = Date.now();
      for (let i = 0; i < 6 && clipTarget; i++) {
        const file = join(OUT, `${gap.id}-app-${String(i).padStart(2, '0')}.png`);
        await clipTarget.screenshot({ path: file });
        clips.push({ file, t: Date.now() - started });
      }
      await page.waitForTimeout(Math.max(windowMs - (Date.now() - started), 300));
      const settledFile = join(OUT, `${gap.id}-app-settled.png`);
      if (clipTarget) await clipTarget.screenshot({ path: settledFile });
      clips.push({ file: settledFile, t: Date.now() - started, settled: true });
      row.clips = clips;

      const rec = await page.evaluate(() => window.__rec);
      const frames = (rec.frames || []).filter((f) => f.t <= (a.windowMs || 2200));
      row.sampledFrames = frames.length;
      if (process.env.DEBUG) {
        const head = frames.slice(0, 6).map((f) => `${Math.round(f.t)}ms:`
          + `${f.el.length ? f.el[0].a.toFixed(2) : '—'}/${f.el.length ? f.el[0].r[2].toFixed(1) : '—'}`
          + `/${f.all.length}`).join('  ');
        console.log(`   [debug] t0=${rec.t0 === null ? 'never' : Math.round(rec.t0)} frames=${frames.length}`
          + ` layout=${frames[0] ? `${frames[0].nSel}+${frames[0].nFurn}+${frames[0].nCont}` : '—'}  ${head}`);
      }

      if (a.kind === 'front_loaded' || a.kind === 'constant_rate') {
        // Progress is normalised by the animation's own clock: `how much of the travel had
        // happened when the animation said it was half done`. The value series is read as a
        // distance from wherever the specimen came to rest, so a beam settling from its
        // counter-rotation and a bar growing out to its extent are the same measurement —
        // how far along the travel it was, not whether its numbers went up or down.
        const seen = frames.filter((f) => f.clock && f.clock.progress !== null && f.el.length);
        const values = seen.map((f) => ({ prog: f.clock.progress, v: valueOf(f.el[0], a.property) }));
        const usable = values.filter((p) => Number.isFinite(p.v));
        // The endpoints of the travel come from the whole capture, not from the frames the
        // animation happened to be reporting on. The engine fills its keyframes backwards, so
        // the frame before the animation carries its starting value, and the frames after it
        // carry the rest — reading both from inside the active phase would shorten the travel to
        // whatever the sampling missed at the ends, which is how a swing measured 14.5° of a 19.5°
        // travel on the first pass and looked less front-loaded than the screen was.
        const allValues = frames.filter((f) => f.el.length).map((f) => valueOf(f.el[0], a.property))
          .filter(Number.isFinite);
        const rest = allValues.length ? allValues[allValues.length - 1] : NaN;
        const deviated = usable.map((p) => Math.abs(p.v - rest));
        const peak = Math.max(...allValues.map((v) => Math.abs(v - rest)), 0);
        if (usable.length < 6) {
          row.verdict = 'FAIL';
          row.detail = `only ${usable.length} sampled value(s) while the animation was active — `
            + `the check cannot see a travel it is not shown (window had ${frames.length} frames)`;
        } else if (peak < 1e-4) {
          row.verdict = 'FAIL';
          row.detail = `${a.selector} travelled nowhere at all across ${usable.length} active samples `
            + `— a check that measures nothing does not pass`;
        } else {
          const at = (prog) => {
            let best = usable[0];
            for (const p of usable) if (Math.abs(p.prog - prog) < Math.abs(best.prog - prog)) best = p;
            return deviated[usable.indexOf(best)] / peak;
          };
          const half = 1 - at(0.5);
          const done = usable.findIndex((p) => 1 - p.v / peak >= 0.985 && p.prog > 0.9);
          row.measured = `${half.toFixed(2)} of the travel done at half the animation's duration `
            + `(travel ${peak.toFixed(2)}, animation ${Math.round(usable.length ? (seen[0].clock.duration || 0) : 0)}ms)`;
          if (a.kind === 'front_loaded') {
            row.verdict = half >= a.atHalfMin ? 'pass' : 'FAIL';
            if (row.verdict === 'FAIL') row.detail = `the reference is ${row.referenceFigure}; this `
              + `specimen had only ${half.toFixed(2)} of its travel done at half its duration`;
          } else {
            row.verdict = half >= a.atHalfMin && half <= a.atHalfMax ? 'pass' : 'FAIL';
            if (row.verdict === 'FAIL') row.detail = `the reference reads ${row.referenceFigure}; this `
              + `specimen was ${half.toFixed(2)} of the way along at half its duration, outside `
              + `${a.atHalfMin}–${a.atHalfMax} — an extent whose travel IS the measurement should `
              + `run at a rate, not rush and settle`;
          }
          void done;
        }
      } else if (a.kind === 'no_residual_motion') {
        const still = await page.evaluate((sel) => {
          const els = [...document.querySelectorAll(sel)];
          return { count: els.length, anims: els.reduce((n, el) => n + el.getAnimations().length, 0) };
        }, a.selector);
        row.measured = `${still.anims} animation(s) on ${still.count} element(s) ${a.afterMs}ms after the entrance`;
        row.verdict = still.count === 0 ? 'FAIL'
          : still.anims === 0 ? 'pass' : 'FAIL';
        if (row.verdict === 'FAIL' && still.count > 0) {
          row.detail = 'it is still moving after it should have arrived — '
            + `the reference ${a.kind === 'no_residual_motion' ? gap.referenceFigure : ''}`;
        }
      } else if (a.kind === 'furniture_still') {
        // The recorder tracks the selector's elements, then the furniture, then the contacts, in
        // that order, every frame — so a slice of `f.el` addresses one of those groups across the
        // whole entrance. Comparing by index requires the tree to have stayed the same size, and
        // frames where it has not are dropped rather than compared against the wrong element.
        const spans = frames.filter((f) => f.el.length === (f.nSel + f.nFurn + f.nCont));
        const group = (frames2, from, to) => {
          let worst = 0, name = '';
          for (let i = from; i < to; i++) {
            const base = frames2[0].el[i];
            for (const f of frames2) {
              const e = f.el[i];
              if (!e) continue;
              // The centre, and only position. A centred label that restates itself (`fresh`
              // becoming `12s`) moves its left edge by half the width change while sitting exactly
              // where it was put; measuring the top-left would call a relayout a slide. Width
              // change is reported beside the number, never failed on its own.
              const centre = (r) => [r[0] + r[2] / 2, r[1] + r[3] / 2];
              const bc = centre(base.r);
              const ec = centre(e.r);
              const d = Math.max(Math.abs(bc[0] - ec[0]), Math.abs(bc[1] - ec[1]));
              if (d > worst) { worst = d; name = e.k; }
            }
          }
          return { worst, name };
        };
        if (spans.length < 3) {
          row.verdict = 'FAIL';
          row.detail = `only ${spans.length} comparable frame(s) — the specimen's tree kept changing size`;
        } else {
          const f0 = spans[0];
          const furn = group(spans, f0.nSel, f0.nSel + f0.nFurn);
          const cont = group(spans, f0.nSel + f0.nFurn, f0.nSel + f0.nFurn + f0.nCont);
          const animating = spans[spans.length - 1].el
            .slice(f0.nSel + f0.nFurn).reduce((n, e) => n + (e.n > 0 ? 1 : 0), 0);
          const widths = spans.length > 2 ? spans.map((f) => Math.max(0, ...f.el.slice(f0.nSel, f0.nSel + f0.nFurn).map((e, i) => Math.abs(e.r[2] - spans[0].el[f0.nSel + i]?.r[2] ?? 0)))) : [0];
          row.measured = `furniture moved at most ${furn.worst.toFixed(2)}px${furn.name ? ` (${furn.name})` : ''}, widest text change ${Math.max(...widths).toFixed(1)}px; `
            + `${f0.nCont} contact element(s), ${animating} with an animation of their own, `
            + `contacts moved up to ${cont.worst.toFixed(2)}px`;
          row.verdict = f0.nFurn === 0 || f0.nCont === 0 ? 'FAIL'
            : furn.worst > a.tolerancePx ? 'FAIL'
              : (animating === 0 && cont.worst <= 0.5) ? 'FAIL' : 'pass';
          if (row.verdict === 'FAIL' && (f0.nFurn === 0 || f0.nCont === 0)) {
            row.detail = `only ${f0.nFurn} furniture and ${f0.nCont} contact element(s) matched — `
              + 'a split with both halves missing is not a split';
          } else if (row.verdict === 'FAIL' && furn.worst > a.tolerancePx) {
            row.detail = `${furn.name} is furniture that drifted ${furn.worst.toFixed(2)}px; the `
              + `reference holds its ${a.furniture.join(', ')} fixed`;
          } else if (row.verdict === 'FAIL') {
            row.detail = 'nothing moved either — a survey grid with no contact on it is not a survey';
          }
        }
      } else if (a.kind === 'dead_cells') {
        const dc = deadCells(frames, 1);
        row.measured = `${dc.dead} of 12 cells never moved (${dc.live} carried something)`;
        row.verdict = frames.length < 5 ? 'FAIL' : dc.dead >= a.deadCellsMin ? 'pass' : 'FAIL';
        if (row.verdict === 'FAIL' && frames.length >= 5) {
          row.detail = `the reference holds ${row.referenceFigure}; this specimen has only ${dc.dead} quiet cells`;
        }
      } else if (a.kind === 'turn_period') {
        const s = series(frames, 'translateX');
        const turns = turnTimes(s);
        const declared = Number(await page.evaluate((attr) => {
          const el = document.querySelector('[data-motion="traffic"]');
          return el ? el.getAttribute(attr) : null;
        }, a.periodAttribute));
        const travel = s.length ? Math.max(...s.map((p) => p[1])) - Math.min(...s.map((p) => p[1])) : 0;
        if (travel < 1) {
          // Named separately, because "the rate is wrong" and "nothing is turning" are different
          // defects and the second one is the one a fixture hides.
          row.verdict = 'FAIL';
          row.detail = `the pin travelled ${travel.toFixed(2)}px across ${s.length} samples — `
            + 'the globe is not turning at all, so no rate can be read from it';
        } else if (!Number.isFinite(declared) || declared <= 0) {
          row.verdict = 'FAIL';
          row.detail = `no usable period declared (${declared}) — nothing to time the turn against`;
        } else if (turns.crossings < 3) {
          row.verdict = 'FAIL';
          row.detail = `the pin crossed its mid-position ${turns.crossings} time(s) in `
            + `${(windowMs / 1000).toFixed(1)}s — timing a turn needs to watch more than one of `
            + `them, and ${declared}s declared means the window has to be longer than 1.5 periods`;
        } else {
          const drift = Math.abs(turns.medianMs / 1000 - declared) / declared;
          const spread = (Math.max(...turns.turns) - Math.min(...turns.turns)) * 1000;
          row.measured = `turns of ${(turns.turns.map((t) => t.toFixed(2)).join('s, ') + 's')} `
            + `against a declared ${declared}s period (median ${Math.round(turns.medianMs)}ms, `
            + `drift ${(drift * 100).toFixed(1)}%, widest spread ${spread.toFixed(0)}ms)`;
          row.verdict = drift <= a.tolerance ? 'pass' : 'FAIL';
          if (row.verdict === 'FAIL') row.detail = `the turn takes ${(turns.medianMs / 1000).toFixed(2)}s `
            + `against the ${declared}s the mark declares — a hologlobe whose rate depends on the `
            + 'display refresh is a graphic, and the reference is quoted because its rate IS the reading';
        }
      } else if (a.kind === 'no_residual_motion') {
        const still = await page.evaluate((sel) => {
          const els = [...document.querySelectorAll(sel)];
          return { count: els.length, anims: els.reduce((n, el) => n + el.getAnimations().length, 0) };
        }, a.selector);
        row.measured = `${still.anims} animation(s) on ${still.count} element(s) ${a.afterMs}ms after the entrance`;
        row.verdict = still.count === 0 ? 'FAIL'
          : still.anims === 0 ? 'pass' : 'FAIL';
        if (row.verdict === 'FAIL' && still.count > 0) {
          row.detail = 'it is still moving after it should have arrived — '
            + `the reference ${a.kind === 'no_residual_motion' ? gap.referenceFigure : ''}`;
        }
      } else if (a.kind === 'furniture_still') {
        // The recorder tracks the selector's elements, then the furniture, then the contacts, in
        // that order, every frame — so a slice of `f.el` addresses one of those groups across the
        // whole entrance. Comparing by index requires the tree to have stayed the same size, and
        // frames where it has not are dropped rather than compared against the wrong element.
        const spans = frames.filter((f) => f.el.length === (f.nSel + f.nFurn + f.nCont));
        const group = (frames2, from, to) => {
          let worst = 0, name = '';
          for (let i = from; i < to; i++) {
            const base = frames2[0].el[i];
            for (const f of frames2) {
              const e = f.el[i];
              if (!e) continue;
              // The centre, and only position. A centred label that restates itself (`fresh`
              // becoming `12s`) moves its left edge by half the width change while sitting exactly
              // where it was put; measuring the top-left would call a relayout a slide. Width
              // change is reported beside the number, never failed on its own.
              const centre = (r) => [r[0] + r[2] / 2, r[1] + r[3] / 2];
              const bc = centre(base.r);
              const ec = centre(e.r);
              const d = Math.max(Math.abs(bc[0] - ec[0]), Math.abs(bc[1] - ec[1]));
              if (d > worst) { worst = d; name = e.k; }
            }
          }
          return { worst, name };
        };
        if (spans.length < 3) {
          row.verdict = 'FAIL';
          row.detail = `only ${spans.length} comparable frame(s) — the specimen's tree kept changing size`;
        } else {
          const f0 = spans[0];
          const furn = group(spans, f0.nSel, f0.nSel + f0.nFurn);
          const cont = group(spans, f0.nSel + f0.nFurn, f0.nSel + f0.nFurn + f0.nCont);
          const animating = spans[spans.length - 1].el
            .slice(f0.nSel + f0.nFurn).reduce((n, e) => n + (e.n > 0 ? 1 : 0), 0);
          const widths = spans.length > 2 ? spans.map((f) => Math.max(0, ...f.el.slice(f0.nSel, f0.nSel + f0.nFurn).map((e, i) => Math.abs(e.r[2] - spans[0].el[f0.nSel + i]?.r[2] ?? 0)))) : [0];
          row.measured = `furniture moved at most ${furn.worst.toFixed(2)}px${furn.name ? ` (${furn.name})` : ''}, widest text change ${Math.max(...widths).toFixed(1)}px; `
            + `${f0.nCont} contact element(s), ${animating} with an animation of their own, `
            + `contacts moved up to ${cont.worst.toFixed(2)}px`;
          row.verdict = f0.nFurn === 0 || f0.nCont === 0 ? 'FAIL'
            : furn.worst > a.tolerancePx ? 'FAIL'
              : (animating === 0 && cont.worst <= 0.5) ? 'FAIL' : 'pass';
          if (row.verdict === 'FAIL' && (f0.nFurn === 0 || f0.nCont === 0)) {
            row.detail = `only ${f0.nFurn} furniture and ${f0.nCont} contact element(s) matched — `
              + 'a split with both halves missing is not a split';
          } else if (row.verdict === 'FAIL' && furn.worst > a.tolerancePx) {
            row.detail = `${furn.name} is furniture that drifted ${furn.worst.toFixed(2)}px; the `
              + `reference holds its ${a.furniture.join(', ')} fixed`;
          } else if (row.verdict === 'FAIL') {
            row.detail = 'nothing moved either — a survey grid with no contact on it is not a survey';
          }
        }
      } else if (a.kind === 'dead_cells') {
        const dc = deadCells(frames, 1);
        row.measured = `${dc.dead} of 12 cells never moved (${dc.live} carried something)`;
        row.verdict = frames.length < 5 ? 'FAIL' : dc.dead >= a.deadCellsMin ? 'pass' : 'FAIL';
        if (row.verdict === 'FAIL' && frames.length >= 5) {
          row.detail = `the reference holds ${row.referenceFigure}; this specimen has only ${dc.dead} quiet cells`;
        }
      } else if (a.kind === 'rate_fit') {
        const s = series(frames, 'translateX');
        const turns = turnTimes(s);
        const declared = Number(await page.evaluate((attr) => {
          const el = document.querySelector('[data-motion="traffic"]');
          return el ? el.getAttribute(attr) : null;
        }, a.periodAttribute));
        const travel = s.length ? Math.max(...s.map((p) => p[1])) - Math.min(...s.map((p) => p[1])) : 0;
        if (travel < 1) {
          // Named separately, because "the rate is wrong" and "nothing is turning" are different
          // defects and the second one is the one a fixture hides.
          row.verdict = 'FAIL';
          row.detail = `the pin travelled ${travel.toFixed(2)}px across ${s.length} samples — `
            + 'the globe is not turning at all, so no rate can be read from it';
        } else if (!fit || !Number.isFinite(declared)) {
          row.verdict = 'FAIL';
          row.detail = `fitted nothing usable (${fit ? fit.r2.toFixed(2) : 'no fit'}) from ${s.length} samples, declared period ${declared}`;
        } else {
          const drift = Math.abs(fit.periodMs / 1000 - declared) / declared;
          row.measured = `fitted turn ${fit.periodMs}ms against a declared ${declared}s period `
            + `(fit R² ${fit.r2.toFixed(2)}, drift ${(drift * 100).toFixed(1)}%)`;
          row.verdict = fit.r2 < 0.6 ? 'FAIL' : drift <= a.tolerance ? 'pass' : 'FAIL';
          if (row.verdict === 'FAIL') row.detail = fit.r2 < 0.6
            ? `the pin's travel is not a clean turn (R² ${fit.r2.toFixed(2)}) — the rate is being varied`
            : `the turn takes ${Math.round(fit.periodMs / 1000)}s against the ${declared}s the mark declares — `
              + 'a hologlobe that accelerates is a graphic';
        }
      } else if (a.kind === 'text_contains') {
        const text = await page.evaluate(() => document.body.innerText);
        const missing = a.values.filter((v) => !text.includes(v));
        row.measured = missing.length ? `missing: ${missing.join(' | ')}` : `all ${a.values.length} figure(s) on screen`;
        row.verdict = missing.length ? 'FAIL' : 'pass';
        row.detail = missing.join(' | ');
      } else if (a.kind === 'chrome_still') {
        const chrome = await page.evaluate(async () => {
          const count = () => document.getAnimations().filter((a) => {
            const t = a.effect && a.effect.target;
            return !(t && t.closest && t.closest('[data-specimen-view]'));
          }).length;
          let peak = 0;
          for (let i = 0; i < 90; i++) { peak = Math.max(peak, count()); await new Promise((r) => setTimeout(r, 16)); }
          return peak;
        });
        row.measured = `${chrome} animation(s) outside the specimens, sampled 90 times`;
        row.verdict = chrome === 0 ? 'pass' : 'FAIL';
        if (row.verdict === 'FAIL') row.detail = 'the chrome moved without a measurement, on the page that states the rule';
      }
    }
  } catch (err) {
    row.verdict = 'FAIL';
    row.detail = String(err).split('\n')[0];
  } finally {
    await page.close();
  }
  rows.push(row);
  const flag = row.verdict === 'pass' ? '✓' : row.verdict === 'held' ? '·' : '✗';
  console.log(`${flag} ${row.id.padEnd(30)} ${(row.measured || row.detail || 'held, not asserted').slice(0, 120)}`);
}

await browser.close();

const fails = rows.filter((r) => r.verdict === 'FAIL');
writeFileSync(join(OUT, 'summary.json'), JSON.stringify({
  base: BASE, ran: new Date().toISOString(), rows,
}, null, 2) + '\n');

writeFileSync(join(OUT, 'GAUNTLET.md'), [
  '# The gauntlet: named gaps, measured against the reference that named them',
  '',
  `Generated by \`node app/verify/gauntlet.mjs\` against \`${BASE}\` at ${new Date().toISOString()}.`,
  '',
  'Each row is one entry of `vault/GAUNTLET.json`: the component, the verified vault file it is',
  'held against, the figure `vault/spec.py` read off that file, and the number this run measured',
  'off the app. `held` means the row is a caution or a counter-example and asserts nothing — it is',
  'on the sheet, and it is not a pass.',
  '',
  '| gap | held as | reference figure | this run | verdict |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| \`${r.id}\` | ${r.heldAs} | ${r.referenceFigure} | ${(r.measured || r.detail || '—').replace(/\|/g, '/')} | ${r.verdict} |`),
  '',
  'Sheets are written next to this file by `python3 app/verify/gauntlet-sheet.py`.',
  '',
].join('\n'));

console.log(`\n${rows.length} gap(s): ${rows.filter((r) => r.verdict === 'pass').length} pass, `
  + `${rows.filter((r) => r.verdict === 'held').length} held, ${fails.length} FAIL — evidence in ${OUT}`);
if (fails.length) {
  for (const f of fails) console.log(`  ✗ ${f.id}: ${f.detail || f.measured}`);
  process.exitCode = 1;
}
