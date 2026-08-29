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
 *   # no BASE at all: the port comes from this tree's vite.config.js, and a server that
 *   # identifies another checkout is refused before any row is measured (app-identity.mjs).
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
// The default port is this tree's own vite.config.js, and the run refuses a server that
// identifies a different checkout: two worktrees can hold one port, and measuring the other
// branch prints the same green. See app/verify/app-identity.mjs.
import { assertServedThisCheckout, defaultBase } from './app-identity.mjs';
const BASE = process.env.BASE || defaultBase();
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
  // The host loads its display and mono faces over the network, and when they land — 140-220ms in
  // here — every text box gets re-metric'd. That is not the library moving: three refusals in
  // decision.js "moved 1-2px" on this row's first run with zero animations, constant opacity and
  // constant text, because the webfont arrived mid-capture (magi's label grew from 25px to 29px). So
  // the recorder notes when the fonts settle and geometry is judged from that frame onward — while the
  // animation count is judged from frame 0, because a font swap never produces an Animation object.
  window.__rec.fontsOk = !(document.fonts && document.fonts.ready);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready
      .then(() => { window.__rec.fontsOk = true; })
      .catch(() => { window.__rec.fontsOk = true; });
  }

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
  // The animation the runtime makes usually sits on the child, not the group: a contour's
  // `strokeDashoffset` lives on the <polyline>, a cell's fill on its rect. Asking only the
  // element whether it is animating is how a moving thing reports "still" — the file's own
  // comment says so about the page-wide count, and the per-element count had been doing it.
  const ownKids = (el) => (el.getAnimations ? el.getAnimations({ subtree: true }).length : 0);
  const relRectOf = (el) => {
    // [x, y, w, h] in the parent's coordinate frame: what the element did, minus what the container
    // did. A specimen that grows as its rows reveal repositions everything below the reveal, and that
    // is the container's motion, not the refusal's — the runtime never touched the refusal.
    const r = rectOf(el);
    const pr = el.parentElement ? rectOf(el.parentElement) : r;
    return [r[0] - pr[0], r[1] - pr[1], r[2], r[3]];
  };
  const dashOf = (el) => {
    // A `trace` reveal draws itself with stroke-dashoffset, not opacity, so "has this arrived?"
    // has to ask the property the reveal actually writes. getComputedStyle is the fallback: the
    // runtime sets the style on the <path>, but a CSS rule would be invisible to `el.style`.
    const raw = (el.style && el.style.strokeDashoffset) || getComputedStyle(el).strokeDashoffset;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
  };
  const beginOf = (el) => {
    // The reveal's own claim about when it starts, read off the animation object rather than off
    // the sampling grid. `subtree: true` and the minimum, because a slot's reveal usually lives on
    // a child (the dash sits on the <path>, the fade on the group) and the earliest of several
    // animations is the honest answer to "when did this slot begin".
    if (!el.getAnimations) return null;
    let best = null;
    for (const an of el.getAnimations({ subtree: true })) {
      if (!an || !an.effect) continue;
      const ct = an.effect.getComputedTiming();
      if (an.startTime === null || ct.delay === null || ct.delay === undefined) continue;
      const b = an.startTime + Number(ct.delay);
      if (best === null || b < best) best = b;
    }
    return best;
  };

  const tick = () => {
    const doc = document;
    const view = doc.querySelector('[data-specimen-view]');
    const scope = cfg.scopeSpecimen && view ? view : doc;
    const target = cfg.selector ? scope.querySelector(cfg.selector) : null;
    // An empty selector string throws, and an exception in a rAF callback kills the loop
    // without failing the run — the recorder would simply have nothing to report.
    const furniture = cfg.furniture ? [...scope.querySelectorAll(cfg.furniture)] : [];
    const contacts = cfg.contacts ? [...scope.querySelectorAll(cfg.contacts)] : [];
    // Reveal slots get their own recording when a row asks for arrival order. `data-index` is the
    // library's own claim about sequence — "this is the third thing to arrive out of four" — and no
    // instrument in this file had ever watched to see whether it arrived third. `data-motion="still"`
    // is captured in the same pass because the other half of the claim is that a refusal is not part
    // of the cascade at all: it has no slot, and it must not move while its neighbours arrive.
    const revealEls = cfg.reveal
      ? [...scope.querySelectorAll('[data-index], [data-motion="still"]')] : [];
    if (!window.__rec.pid) window.__rec.pid = new WeakMap();
    if (!window.__rec.pidNext) window.__rec.pidNext = 1;
    const pidOf = (el) => {
      // Cascade identity by DOM parent, not by class: killmail runs TWO cascades inside two <ul>s
      // that carry the same class, and grouping by class merged them into one seven-slot sequence,
      // which is a claim the drawing never made.
      const key = el.parentElement || el;
      let v = window.__rec.pid.get(key);
      if (v === undefined) { v = window.__rec.pidNext++; window.__rec.pid.set(key, v); }
      return v;
    };
    // What has to exist before the clock starts. A cell-stillness check has no marked element
    // to wait for and must not start on an empty document — the first frame's boxes define the
    // grid, and a grid fitted over the app chrome would measure the rack instead of the specimen.
    // A change-time assert has no marked element either: it watches the specimen's WORDS, so the
    // specimen itself is the thing to wait for. Without this clause the recorder never sets t0,
    // collects zero frames, and the gap below reports "no text was sampled" -- which is at least
    // an honest failure, but only because the detail line prints the frame count.
    const ready = cfg.selector ? !!target
      : cfg.gridCells || cfg.wantText || cfg.reveal ? !!view
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
        fontsOk: window.__rec.fontsOk === true,
        clock,
        // In-specimen motion, counted separately from the page's. `no_motion` asserts a specimen
        // never moves; a page-wide count would fail the moment anything else on the route moved,
        // and the honest fix for that failure would be the wrong one.
        // `subtree: true` is not optional. `Element.getAnimations()` defaults to the element
        // alone, which for a specimen container means its own animations — none — and the check
        // passed over a radar with three contacts sweeping. A default that reads "still" from a
        // moving thing is the worst kind of instrument.
        inSpecimen: view && view.getAnimations ? view.getAnimations({ subtree: true }).length : 0,
        markup: view ? view.innerHTML.length : 0,
        // A change-time blend check needs the WORDS themselves per frame, and which text-bearing
        // nodes are sitting at a partial opacity right now. Both are opt-in: walking every text
        // node at 60Hz for gaps that never ask would slow down every other measurement.
        txt: cfg.wantText && view ? (view.innerText || view.textContent || '') : null,
        // Not "is any text sitting at half opacity" -- a component may dim a label on purpose, and
        // `hardCut` does exactly that (its readout ink is drawn at .6, permanently, as a statement
        // about how well the value is known). A blend is an OPACITY ANIMATION whose target carries
        // letters, so the animation list is what gets walked: a static 0.6 has no animation behind
        // it, and a crossfade cannot have anything else.
        textAnims: cfg.wantText && view && view.getAnimations
          ? view.getAnimations({ subtree: true }).filter((an) => {
              const t = an.effect && an.effect.target;
              if (!t || !(t.textContent || '').trim()) return false;
              let ks = null;
              try { ks = an.effect.getKeyframes ? an.effect.getKeyframes() : null; } catch (e) { ks = null; }
              return !!ks && ks.some((k) => 'opacity' in k && k.opacity !== undefined
                && k.opacity !== null && !/none/.test(String(k.opacity)));
            }).length : 0,
        nSel, nFurn: furniture.length, nCont: contacts.length,
        anims: doc.getAnimations ? doc.getAnimations().length : 0,
        el: tracked.map((el) => ({
          r: rectOf(el),
          a: angleOf(el),
          p: cfg.wantTranslate ? translateOf(el) : null,
          o: getComputedStyle(el).opacity,
          n: own(el),
          nk: ownKids(el),
          k: (el.getAttribute('class') || el.tagName) + '|' + (el.textContent || '').slice(0, 18),
        })),
        all: everything.map((el) => ({ r: rectOf(el), n: own(el), nk: ownKids(el),
          o: getComputedStyle(el).opacity })),
        rev: revealEls.map((el) => ({
          i: el.hasAttribute('data-index') ? Number(el.getAttribute('data-index')) : null,
          tot: el.hasAttribute('data-total') ? Number(el.getAttribute('data-total')) : null,
          m: el.getAttribute('data-motion'), p: pidOf(el),
          o: Number(getComputedStyle(el).opacity) || 0,
          r: rectOf(el), d: dashOf(el), nk: ownKids(el),
          // Parent-relative geometry, because that is the only geometry the runtime could have
          // animated. Measured against the page, a refusal sitting under a cascade reads as "moved"
          // the moment the container reflows — and once, at sub-pixel scale, when nothing moved at
          // all: killmail's UNPRICED line drifted 529.4px to 528.6px and integer rounding called it a
          // 1px motion. That false red was worth having: it forced the question the row exists to ask,
          // and the answer was zero animations, constant opacity, static parent.
          rp: relRectOf(el),
          x: (el.textContent || '').length,
          b: beginOf(el),
          k: (el.getAttribute('class') || el.tagName) + '|' + (el.textContent || '').trim().slice(0, 14),
        })),
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
        || Math.abs(a.o - b.o) > 0.01 || (b.nk ?? b.n) > 0;
      if (!moved) continue;
      const cell = cellOf(a.r[0] + a.r[2] / 2, a.r[1] + a.r[3] / 2);
      if (cell !== null) live.add(cell);
    }
  }
  return { dead: 12 - live.size, live: live.size };
}

const browser = await chromium.launch();
await assertServedThisCheckout(browser, BASE, 'app/verify/gauntlet.mjs');
const rows = [];

for (const gap of GAPS) {
  const route = gap.route || (gap.component ? `#/component/${gap.component}` : null);
  const a = gap.assert || {};
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // The sheet has to be able to tell an informs row from a borrowed one: a reference band drawn
  // above a specimen reads as "this picture is what this drawing is for", which for a borrowed row
  // would be a claim the vault explicitly refuses to make.
  const row = { id: gap.id, component: gap.component, route, reference: gap.reference,
                referenceRelation: gap.referenceRelation || 'informs', originClaim: gap.originClaim,
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
        gridCells: a.kind === 'dead_cells' || a.kind === 'no_motion',
        wantTranslate: a.kind === 'turn_period',
        wantText: a.kind === 'no_blend_on_change',
        reveal: a.kind === 'arrival_order',
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

      // A change-time assert has to CAUSE the change while the recorder is sampling, and record
      // when. Doing it later would mean reading frames that had already been collected, and the
      // whole point is the frames around the swap.
      if (a.kind === 'no_blend_on_change') {
        await page.waitForTimeout(1200);
        const clicked = await page.evaluate((want) => {
          // The button's own text is only `remove`/`restore`; the field it addresses is on the
          // <li> around it. Matching button text would have made every change-time gap report
          // "no such control" forever, which is the shape of a silently useless instrument.
          const btn = [...document.querySelectorAll('[data-control="field"]')]
            .find((b) => (b.closest('li')?.getAttribute('data-field') || '').includes(want));
          if (!btn) return false;
          btn.click();
          window.__rec.clickT = window.__rec.t0 === null ? 0 : performance.now() - window.__rec.t0;
          return true;
        }, a.fieldIncludes || '');
        if (!clicked) {
          row.verdict = 'FAIL';
          row.detail = `no field control on this page carries "${a.fieldIncludes}" — the assert `
            + 'cannot cause a change, so it cannot observe one';
        }
      }

      // The clips are for the sheet, and they are taken while the entrance runs. A screenshot
      // costs tens of milliseconds, which is why every measurement above is timestamped inside
      // the page rather than counted from the outside.
      const clips = [];
      const clipSel = gap.component ? `[data-specimen-view="${gap.component}"]` : '.cd-vault';
      const snap = async (file) => {
        // Re-resolve the element for EVERY frame. A specimen is re-mounted when its fixture re-renders,
        // and an ElementHandle held across that is detached: on a full 33-row sweep `admission` failed
        // with "Element is not attached to the DOM" and the row reported an instrument error where a
        // motion verdict belongs. Alone it passed three times out of three, which is the worst kind of
        // green — a tool that fails only under load teaches people to re-run rather than to read.
        for (let tries = 0; tries < 3; tries++) {
          const el = await page.$(clipSel);
          if (el) {
            try { await el.screenshot({ path: file }); return true; }
            catch { /* detached between the query and the capture: re-query */ }
          }
          await page.waitForTimeout(60);
        }
        return false;
      };
      const windowMs = a.windowMs || 1600;
      const started = Date.now();
      for (let i = 0; i < 6; i++) {
        const file = join(OUT, `${gap.id}-app-${String(i).padStart(2, '0')}.png`);
        if (!await snap(file)) break;
        clips.push({ file, t: Date.now() - started });
      }
      await page.waitForTimeout(Math.max(windowMs - (Date.now() - started), 300));
      const settledFile = join(OUT, `${gap.id}-app-settled.png`);
      if (await snap(settledFile)) {
        clips.push({ file: settledFile, t: Date.now() - started, settled: true });
      } else {
        // Named, not swallowed: the sheet reports a row with no frames, and this line says why.
        row.clipError = `no ${clipSel} could be captured — it was gone or re-mounting when the frame was due`;
      }
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
      } else if (a.kind === 'arrival_order') {
        // `data-index` is a claim about ORDER, and until this branch nothing watched the order.
        // `no_residual_motion` proves a plate settles; `front_loaded` proves most of the travel lands
        // early — both pass over a cascade that arrives BACKWARDS, which is precisely the defect a
        // reveal-order claim can have while looking perfect on camera.
        //
        // Measurement, per slot, in milliseconds. Two clocks are available and they are not
        // interchangeable: the animation object states its own begin (startTime + delay, exact), while
        // the frame grid resolves to ~16ms — and on `killmail` the grid put all four reveals in the same
        // frame, which would have let the row pass over an ordering it never measured. So the clock is
        // preferred whenever every member of a cascade has one, and the change-grid is the fallback.
        // "Did this slot change?" is answered on opacity, parent-relative box, dash offset and text
        // length — which covers BOTH reveal mechanisms, the fade the runtime plays on a `count` member
        // and the dash-draw it plays on a `trace`, without asking each component which it chose. Each
        // carries a tolerance: a sub-pixel reflow is not a reveal, and integer rounding once called a
        // 0.8px drift a motion.
        const tolMs = Number(a.toleranceMs ?? 16);
        const tolPx = Number(a.tolerancePx ?? 0.75);
        const frames = (rec.frames || []).filter((f) => f.rev && f.rev.length);
        const thin = (why) => {
          row.verdict = 'held';
          row.measured = `${(rec.frames || []).length} frame(s) captured`;
          row.detail = why;
        };
        if (!(rec.frames || []).length) thin('the recorder collected nothing — the specimen never appeared');
        else if (!frames.length) thin('no frame carried a reveal slot: this specimen stamps no data-index at all');
        else {
          const n = frames[0].rev.length;
          const differs = (p, q) => Math.abs(Number(p.o) - Number(q.o)) > 0.01
            || Math.abs(Number(p.d) - Number(q.d)) > 0.5
            || p.x !== q.x
            || [0, 1, 2, 3].some((k) => Math.abs(p.rp[k] - q.rp[k]) > tolPx);
          const f0 = frames[0].rev;
          // Geometry is judged from the frame the fonts settled in (see the recorder's note): a label
          // re-metric'd by an arriving webfont is not a reveal, and 1-2px of text box is not motion.
          // Animations are still counted from frame 0, which is where a real reveal lives.
          const settledAt = frames.findIndex((f) => f.fontsOk);
          const b0 = settledAt < 0 ? 0 : settledAt;
          const rev0 = frames[b0].rev;
          if (frames.some((f) => f.rev.length !== n)) {
            thin(`${n} slot(s) at frame 0, then the tree changed mid-capture — a moving tree cannot be compared slot to slot`);
          } else {
            const starts = f0.map((_, e) => {
              for (let i = b0 + 1; i < frames.length; i++) {
                if (differs(rev0[e], frames[i].rev[e])) return frames[i].t;
              }
              return null;
            });
            const clocks = f0.map((_, e) => {
              let best = null;
              for (const fr of frames) {
                const b = fr.rev[e].b;
                if (b !== null && b !== undefined && (best === null || b < best)) best = b;
              }
              return best;
            });
            // A new cascade begins where the CLAIMED ORDER restarts. `killmail` runs 0,1,2,3 and then
            // 0,1,2 as a second population; `scanOverlay` runs 0,0,1,1,2,2 because a trace and its
            // label share a slot. A strict decrease separates the two without knowing either drawing.
            const groups = [];
            f0.forEach((e, idx) => {
              if (e.i === null || Number.isNaN(e.i)) return;
              const prev = groups[groups.length - 1];
              if (!prev || e.i < f0[prev[prev.length - 1]].i) groups.push([idx]);
              else prev.push(idx);
            });
            const inversions = [];
            const described = [];
            let incomplete = null;
            for (const g of groups) {
              // One clock per cascade, never two: animation begins run off the document timeline and
              // frame changes off the recorder's t0, so comparing across them is arithmetic on
              // unrelated rulers. Each cascade is normalised to its own earliest reveal, which is what
              // "arrives first" means on a plate.
              const clocked = g.every((e) => typeof clocks[e] === 'number');
              const base = clocked ? Math.min(...g.map((e) => clocks[e])) : 0;
              const tOf = (e) => (clocked ? clocks[e] - base : starts[e]);
              const source = clocked ? 'animation clock' : 'first frame it changed';
              const dead = g.find((e) => typeof tOf(e) !== 'number');
              if (dead !== undefined) {
                incomplete = `slot ${f0[dead].i} never changed during the capture and no animation survived to say when it began — the entrance outran the recorder`;
                break;
              }
              for (let x = 0; x < g.length; x++) {
                for (let y = 0; y < g.length; y++) {
                  if (x === y || f0[g[y]].i < f0[g[x]].i) continue;
                  if (tOf(g[y]) < tOf(g[x]) - tolMs) {
                    inversions.push(`${f0[g[x]].k} claims slot ${f0[g[x]].i} and began at ${Math.round(tOf(g[x]))}ms, `
                      + `but ${f0[g[y]].k} claims the later slot ${f0[g[y]].i} and began at ${Math.round(tOf(g[y]))}ms`);
                  }
                }
              }
              described.push(`${g.map((e) => `${f0[e].i}@${Math.round(tOf(e))}ms`).join(' → ')} [${source}]`);
            }
            const stills = f0.map((e, idx) => ({ e, idx })).filter(({ e }) => e.m === 'still');
            const stirred = stills.filter(({ idx }) => {
              for (let i = b0 + 1; i < frames.length; i++) {
                if (differs(rev0[idx], frames[i].rev[idx])) return true;
              }
              // Any frame at all, including the ones before the fonts settled: a refusal with an
              // animation inside it is the moving-without-evidence defect whoever wrote the drawing.
              return frames.some((fr) => fr.rev[idx].nk > 0);
            }).map(({ e }) => e.k);

            if (incomplete) thin(incomplete);
            else {
              row.measured = `${groups.length} cascade(s) over ${n} slot(s): ${described.join('  |  ')}`
                + `; ${stills.length} stillness(es) watched for ${Math.round(frames[frames.length - 1].t)}ms`
                + ` from ${settledAt < 0 ? 'frame 0 (fonts never reported settled)'
                  : `the frame the fonts settled at ${Math.round(frames[b0].t)}ms`} (animations counted from frame 0)`;
              const bad = [...inversions, ...stirred.map((k) => `the refusal ${k} moved more than ${tolPx}px (or animated a descendant) while its neighbours arrived`)];
              row.verdict = bad.length ? 'FAIL' : 'pass';
              row.detail = bad.length ? bad.join('; ')
                : `every slot arrived no earlier than the slot before it (±${tolMs}ms), and nothing marked still budged past ${tolPx}px in its own container`;
            }
          }
        }
      } else if (a.kind === 'lane_axis_shared') {
        // The reference is an audio editor: named lanes stacked under ONE ruler across
        // the top of the plate, one playhead over the whole width. `river` used to map
        // each lane's own first and last stamp onto the plate, which stretched every run
        // to the full width — so all lanes ended at the right margin however far apart
        // their real last events were, and "now" resolved to one x per lane. The count
        // of distinct run-end x values separates the two geometries without needing the
        // DOM to confess its timestamps: under the old normalisation it is exactly one.
        const lanes = await page.evaluate((sel) => {
          const runs = [];
          for (const lane of document.querySelectorAll(`${sel} .cd-riv-lane`)) {
            const xs = [...lane.querySelectorAll('.cd-riv-seg')]
              .flatMap((l) => [Number(l.getAttribute('x1')), Number(l.getAttribute('x2'))])
              .filter((n) => Number.isFinite(n));
            if (xs.length) runs.push({ first: Math.min(...xs), last: Math.max(...xs) });
          }
          const key = (n) => n.toFixed(1);
          return {
            runs: runs.length,
            starts: [...new Set(runs.map((r) => key(r.first)))],
            ends: [...new Set(runs.map((r) => key(r.last)))],
            ruler: document.querySelectorAll(`${sel} .cd-riv-ruler`).length,
            now: document.querySelectorAll(`${sel} [data-now="1"]`).length,
          };
        }, a.selector);
        row.measured = `${lanes.runs} run(s) on the plate — ${lanes.ends.length} distinct run end(s) `
          + `(${lanes.ends.join(', ')}), ${lanes.starts.length} distinct start(s) (${lanes.starts.join(', ')}), `
          + `ruler=${lanes.ruler}, now-line=${lanes.now}`;
        row.verdict = lanes.ruler === 0 ? 'FAIL'
          : lanes.runs < 2 ? 'FAIL'
          : lanes.now !== 1 ? 'FAIL'
          : lanes.ends.length >= 2 ? 'pass' : 'FAIL';
        if (row.verdict === 'FAIL') {
          row.detail = 'every run ending at the same x means each lane was normalised to fill the plate again: '
            + 'a deck whose lanes share no common now cannot carry a playhead, a cross-lane event, or a claim '
            + 'about which run finished late';
        }
      } else if (a.kind === 'loop_wraps_in_a_jump') {
        // The reference is a rolling NWS radar loop: measured over 25 frames it never returns to
        // frame zero, and the wrap back to the oldest step is a discontinuity. On a dial the
        // equivalent is a sweep that keeps going FORWARD through 0 — the seam is a jump, never a
        // wind-back — and a sweep that stopped at the end of its first pass is a progress bar
        // wearing a period.
        //
        // Angles come off the property the runtime actually drives (`rotate`), with the matrix as
        // fallback for a host that authors the shorthand. An instrument reading `transform` here
        // returned null on a dial spinning at full speed: reading the wrong property is how a gate
        // certifies stillness over motion.
        const spin = await page.evaluate(async (sel) => {
          const el = document.querySelector(sel);
          if (!el) return { missing: true };
          const period = Number(el.getAttribute('data-period')) || 3;
          const spent = Math.min(0.95, Math.max(0, Number(el.getAttribute('data-spent')) || 0));
          const deg = () => {
            const cs = getComputedStyle(el);
            const r = /(-?[0-9.]+)deg/.exec(cs.rotate || '');
            if (r) return ((Number(r[1]) % 360) + 360) % 360;
            const m = (cs.transform || '').match(/matrix\(([^)]+)\)/);
            if (!m) return null;
            const [a2, b2] = m[1].split(',').map(Number);
            return (Math.atan2(b2, a2) * 180 / Math.PI + 360) % 360;
          };
          const wait = () => new Promise((res) => requestAnimationFrame(res));
          // Stop as soon as there is a seam with real travel after it; otherwise sit out the poll.
          // Sample long enough to see the poll come round TWICE, or until it visibly stops. A
          // dial that sweeps once, pauses, and says nothing else looks exactly like a repeating
          // poll for one period — because for one period it is one. Only the second turn, or the
          // absence of one, separates them.
          const cap = period * 1000 * 3 + 2000;
          const t0 = performance.now();
          let prev = null, frames = 0, seams = 0, travel = 0, net = 0, total = 0, first = null, last = null;
          let lastAdvance = performance.now(), stalled = false, lastNet = null;
          for (;;) {
            const d = deg();
            if (d !== null) {
              if (prev !== null) {
                let step = d - prev;
                if (step > 180) step -= 360;
                if (step < -180) step += 360;
                net += step;                          // signed: where the dial actually went
                total += Math.abs(step);              // unsiged: how far its ink travelled
                if (d < prev - 1) seams += 1;         // the dial came round
                if (seams && step > 0) travel += step;
                if (net - (lastNet ?? -1e9) > 2) { lastAdvance = performance.now(); lastNet = net; }
              } else { first = d; lastNet = net; }
              frames += 1; last = d; prev = d;
            }
            // A live source whose sweep has not moved two degrees in two seconds is not polling.
            if (performance.now() - lastAdvance > 2000) { stalled = true; break; }
            if (performance.now() - t0 > cap || net >= 700) break;
            await wait();
          }
          const fades = el.getAnimations().reduce((n, an) => n
            + ((an.effect && an.effect.getKeyframes && an.effect.getKeyframes())
              .some((k) => 'opacity' in k) ? 1 : 0), 0);
          // Net over total is the sign-consistency of the whole window: +1 for a dial that only
          // ever goes forward, ~0 for one that sweeps out and eases back. Thresholding per-frame
          // steps instead missed exactly that — a 10s reverse sweeps 0.6°/frame, under any
          // threshold a jump-seam would need, and the instrument stayed green while printing
          // "0° travelled forward after the seam". Read the aggregate.
          const consistency = total > 0 ? net / total : 0;
          return { period, spent, frames, seams, travel: Math.round(travel), fades, stalled,
                   consistency: Number(consistency.toFixed(3)), net: Math.round(net), total: Math.round(total),
                   span: Math.round(performance.now() - t0), first, last };
        }, a.selector);
        if (spin.missing) {
          row.measured = `no element matched ${a.selector} — there is no rotating cycle mark on this plate`;
          row.verdict = 'FAIL';
        } else {
          // A completed revolution is the only sound gate. "Seam" is not: the animation COMMITTING
          // its final 360deg lands the needle on 0 and mimics a wrap exactly, so a dial that swept
          // once and stopped read as a wrap with travel after it. Net rotation cannot be faked that
          // way — one sweep tops out below a revolution.
          const revolutions = spin.net / 360;
          row.measured = `${spin.frames} frames over ${(spin.span / 1000).toFixed(1)}s (period ${spin.period}s, `
            + `spent ${spin.spent}) — net ${spin.net}° against ${spin.total}° travelled `
            + `(sign consistency ${spin.consistency}) = ${revolutions.toFixed(2)} completed revolution(s), `
            + `${spin.seams} raw seam(s) [reported, not gated: committing the final 360deg mimics a wrap], `
            + (spin.stalled ? 'STALLED before the window closed, ' : '')
            + `opacity animations on the sweep: ${spin.fades}`;
          row.verdict = spin.frames < 120 ? 'FAIL'
            : spin.stalled ? 'FAIL'
            : spin.consistency < 0.95 ? 'FAIL'
            : revolutions < 0.92 ? 'FAIL'
            : spin.fades > 0 ? 'FAIL' : 'pass';
          if (row.verdict === 'FAIL') {
            // Ordered worst-diagnosis-first: a red that names the wrong defect sends the next
            // agent to fix the wrong thing.
            row.detail = spin.stalled
              ? `the sweep did not move two degrees in two seconds while the source was live (${(spin.span / 1000).toFixed(1)}s in, on a ${spin.period}s period) — a stall between polls, or an ease slow enough to read as one; either reading is the defect, because the reference keeps stepping on its interval until the source goes silent`
              : spin.consistency < 0.95
                ? `the sweep came back over ground it had already covered (net ${spin.net}° against ${spin.total}° travelled) — a rolling loop jumps at its seam, and a search that eases itself back is a search that never ended`
                : revolutions < 0.92
                ? `the sweep came back over ground it had already covered (net ${spin.net}° against ${spin.total}° travelled) — a rolling loop jumps at its seam, and a search that eases itself back is a search that never ended`
                : spin.fades > 0
                    ? 'the seam is faded: opacity at the wrap hides where the loop turned over'
                    : `only ${spin.frames} frames were sampled, too few to tell a seam from a dropped frame`;
          }
        }
      } else if (a.kind === 'slots_do_not_move') {
        // The reference is a 67-second split-flap board: ~22 observations, two rows changed at all,
        // and every row held its field — same left edge, same width, the order never re-sorted, and
        // no row grew because its number got bigger. A list that scales a row to its value makes
        // the *quantity* the thing you compare, when the board's whole argument is that rows are
        // addressed by what they are, not by how much they are. `stockFlow` exists to keep a stock
        // and a flow apart, and the one way to draw that wrong is to let a level fill something.
        const rows = await page.evaluate(({ selector, rows: rowSel, tolerancePx = 1.5 }) => {
          const view = document.querySelector(selector);
          if (!view) return { missing: true };
          const list = [...view.querySelectorAll(rowSel)];
          if (list.length < 2) return { tooFew: list.length };
          const boxes = list.map((el) => {
            const r = el.getBoundingClientRect();
            return { w: r.width, h: r.height, left: r.left, right: r.right,
                     value: (el.querySelector('strong')?.textContent || '').trim() };
          });
          const spread = (pick) => Math.max(...boxes.map(pick)) - Math.min(...boxes.map(pick));
          return {
            n: boxes.length,
            widthSpread: spread((b) => b.w), leftSpread: spread((b) => b.left),
            rightSpread: spread((b) => b.right), heightSpread: spread((b) => b.h),
            extents: view.querySelectorAll('[data-motion="level"]').length,
            pairs: boxes.map((b) => `${b.value}=${Math.round(b.w * 10) / 10}`),
          };
        }, a);
        if (rows.missing || rows.tooFew !== undefined) {
          row.measured = rows.missing ? `no specimen matched ${a.selector}`
                                       : `only ${rows.tooFew} row(s) matched — a spread needs two`;
          row.verdict = 'FAIL';
        } else {
          row.measured = `${rows.n} rows, left edge spread ${Math.round(rows.leftSpread * 100) / 100}px, `
            + `width spread ${Math.round(rows.widthSpread * 100) / 100}px, right edge spread `
            + `${Math.round(rows.rightSpread * 100) / 100}px (tolerance ${a.tolerancePx ?? 1.5}px); `
            + `measured-extent marks: ${rows.extents}; value=width: ${rows.pairs.join(' ')}`;
          const tol = a.tolerancePx ?? 1.5;
          row.verdict = (rows.leftSpread <= tol && rows.widthSpread <= tol && rows.extents === 0)
            ? 'pass' : 'FAIL';
          if (row.verdict === 'FAIL') {
            row.detail = rows.extents > 0
              ? `${rows.extents} measured-extent mark(s) in a stock-and-flow list: the board draws a value in a slot and never draws how much it is — a level is the wrong vocabulary for a standing quantity, and for a rate it is a lie`
              : `rows do not share a field (left spread ${Math.round(rows.leftSpread * 100) / 100}px, width spread ${Math.round(rows.widthSpread * 100) / 100}px) — on the board the row's geometry is fixed and only its characters change, so a row that grows with its number is asking the operator to compare shapes instead of reading values`;
          }
        }

      } else if (a.kind === 'no_bar_where_no_terminus') {
        // The reference is a phone barcode scan whose lookup says `Retrieving data, please wait…`
        // and draws NOTHING measurable — no bar, no percentage, no remaining-time figure. A wait
        // with no terminus drawn as an extent is a claim about how much longer, made from no
        // measurement. The instrument looks for the three ways that claim gets made: a measured
        // extent mark, a hatched refusal where the wait should be stated, and — in the label's own
        // region, not anywhere on the plate — a figure that reads as remaining time.
        const wait = await page.evaluate((sel) => {
          const view = document.querySelector(sel);
          if (!view) return { missing: true };
          const label = [...view.querySelectorAll('text, span, div')]
            .find((el) => el.children.length === 0 && /^\s*REMAINING\s*$/.test(el.textContent || ''));
          const lab = label ? label.getBoundingClientRect() : null;
          const figures = [];
          const FIGURE = /(\d+\s*%|\bETA\b|\d+\s*(?:h|m|s|min|hours?|minutes?|seconds?)\b)/i;
          for (const el of view.querySelectorAll('text, span, div')) {
            if (el.children.length || !lab) continue;
            const r = el.getBoundingClientRect();
            const text = (el.textContent || '').trim();
            if (!text || !FIGURE.test(text)) continue;
            // "The label's own region": to the right of where REMAINING sits, on its row or the
            // one under it. A duration elsewhere on the plate — the elapsed counter, which is
            // measured — belongs to a different quantity and is not this violation.
            if (r.left >= lab.left - 4 && r.top < lab.bottom + 34 && r.bottom > lab.top - 6) {
              figures.push(`${text} @ ${Math.round(r.left)},${Math.round(r.top)}`);
            }
          }
          return {
            hasLabel: !!label,
            hatch: view.querySelectorAll('[fill^="url(#cd-hatch"]').length
              + view.querySelectorAll('rect[fill^="url(#cd-hatch"]').length,
            extents: view.querySelectorAll('[data-motion="level"]').length,
            figures,
          };
        }, a.selector);
        if (wait.missing) {
          row.measured = `no specimen matched ${a.selector}`;
          row.verdict = 'FAIL';
        } else {
          row.measured = `REMAINING label found: ${wait.hasLabel}; hatched refusal areas: ${wait.hatch}; `
            + `measured-extent marks in the specimen: ${wait.extents}; remaining-time figures in the label's `
            + `region: ${wait.figures.length ? wait.figures.join(' | ') : 'none'}`;
          row.verdict = wait.hasLabel ? 'pass' : 'FAIL';
          if (wait.hasLabel && wait.hatch < 1) row.verdict = 'FAIL';
          if (wait.extents > 0) row.verdict = 'FAIL';
          if (wait.figures.length) row.verdict = 'FAIL';
          if (row.verdict === 'FAIL') {
            row.detail = wait.extents > 0
              ? `the wait carries ${wait.extents} measured-extent mark(s): an extent says how much is left, and nothing supplied a terminus — the reference states an unknown wait in words and draws no bar`
              : wait.figures.length
                ? `a remaining-time figure was drawn beside REMAINING (${wait.figures.join(' | ')}) where no deadline exists — the app in the reference says "retrieving data, please wait" and refuses to number the wait, which is the difference between an indeterminate wait and a lie about a determinate one`
                : wait.hatch < 1
                  ? 'the wait area is empty rather than hatched: a blank area reads as a quantity of zero, and nobody measured zero'
                  : 'the plate no longer names the missing terminus where a reader looks for it';
          }
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
          // An entrance is ~300-500ms; the last frame of a 2200ms window is settled ground, and
          // counting animation there certified a specimen whose contacts had already finished —
          // then reported "nothing moved" as the failure, which was the instrument's own blind
          // spot dressed up as the component's. Liveness is per contact over the whole window.
          const liveAt = [];
          for (const f of spans) {
            const cont = f.el.slice(f0.nSel + f0.nFurn);
            for (let i = 0; i < cont.length; i++) {
              if ((cont[i].nk ?? cont[i].n) > 0) liveAt[i] = true;
            }
          }
          const animating = liveAt.filter(Boolean).length;
          // The other half of "untouched". A hatched absence that *pulses* never leaves its box,
          // so the drift check passes right over it — an absence that breathes is an absence
          // asking to be read as a quantity. Furniture carries no measurement, so it carries no
          // animation at any point in the window, and no opacity change either.
          const furnLive = [];
          const furnOpacity = [];
          for (const f of spans) {
            const furnEls = f.el.slice(f0.nSel, f0.nSel + f0.nFurn);
            for (let i = 0; i < furnEls.length; i++) {
              if ((furnEls[i].nk ?? furnEls[i].n) > 0) furnLive[i] = furnEls[i].k;
              const o = Number(furnEls[i].o);
              if (Number.isFinite(o)) (furnOpacity[i] ??= []).push(o);
            }
          }
          const furnAnimated = furnLive.filter(Boolean);
          const furnFade = furnOpacity.reduce((worst, list) => Math.max(worst,
            list.length ? Math.max(...list) - Math.min(...list) : 0), 0);
          const widths = spans.length > 2 ? spans.map((f) => Math.max(0, ...f.el.slice(f0.nSel, f0.nSel + f0.nFurn).map((e, i) => Math.abs(e.r[2] - spans[0].el[f0.nSel + i]?.r[2] ?? 0)))) : [0];
          row.measured = `furniture moved at most ${furn.worst.toFixed(2)}px${furn.name ? ` (${furn.name})` : ''}, widest text change ${Math.max(...widths).toFixed(1)}px; `
            + `${f0.nCont} contact element(s), ${animating} animated at some point in the window `
            + '(counted across every frame, with descendants), contacts moved up to '
            + cont.worst.toFixed(2) + 'px; furniture animated: '
            + furnAnimated.length + ', furniture opacity spread: ' + furnFade.toFixed(3) + '';
          row.verdict = f0.nFurn === 0 || f0.nCont === 0 ? 'FAIL'
            : furnAnimated.length > 0 ? 'FAIL'
              : furnFade > 0.02 ? 'FAIL'
                : furn.worst > a.tolerancePx ? 'FAIL'
                  : (animating === 0 && cont.worst <= 0.5) ? 'FAIL' : 'pass';
          if (row.verdict === 'FAIL' && (f0.nFurn === 0 || f0.nCont === 0)) {
            row.detail = `only ${f0.nFurn} furniture and ${f0.nCont} contact element(s) matched — `
              + 'a split with both halves missing is not a split';
          } else if (row.verdict === 'FAIL' && furnAnimated.length > 0) {
            row.detail = `${furnAnimated.length} furniture element(s) carried an animation of their `
              + `own (${furnAnimated.slice(0, 3).join(' | ')}) — the reference holds the plate untouched, `
              + `and furniture that animates is furniture asking to be read as a measurement`;
          } else if (row.verdict === 'FAIL' && furnFade > 0.02) {
            row.detail = `furniture opacity moved across the window (${furnFade.toFixed(2)}) — a hatched `
              + 'absence that breathes reads as a quantity, and nobody measured this one at all';
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
      } else if (a.kind === 'no_blend_on_change') {
        // The Solari board's argument, made assertable: a flap has a fixed set of faces and there
        // is NO in-between state to render, so a value change shows one value or the other and
        // never both at once, never a value at half opacity. A crossfade would satisfy every
        // animation-clock check in this file -- it is one well-behaved Animation, `fill: forwards`
        // and all -- which is exactly why this row was held rather than asserted.
        const clickT = await page.evaluate(() => (window.__rec.clickT === undefined ? null : window.__rec.clickT));
        const words = frames.filter((f) => typeof f.txt === 'string');
        const pre = clickT === null ? null : words.filter((f) => f.t < clickT).pop();
        const post = words[words.length - 1];
        const after = clickT === null ? [] : words.filter((f) => f.t >= clickT - 16);
        const tokens = (t) => new Set(t.split(/\s+/).map((x) => x.trim()).filter((x) => x.length >= 2));
        if (row.verdict === 'FAIL') {
          // already failed on the missing control
        } else if (clickT === null || !pre || !post) {
          row.verdict = 'FAIL';
          row.detail = `no text was sampled before and after a change (${words.length} of `
            + `${frames.length} frames carried words, clickT=${clickT === null ? 'none' : Math.round(clickT)}ms, `
            + `first txt=${JSON.stringify(String(words[0] ? words[0].txt : '').slice(0, 40)) || 'n/a'}) `
            + '-- the assert measured nothing';
        } else if (pre.txt === post.txt) {
          row.verdict = 'FAIL';
          row.detail = 'the specimen printed the same words before and after the control was pressed; '
            + 'a change that does not reach the page cannot be checked for blending';
        } else {
          const was = tokens(pre.txt); const now = tokens(post.txt);
          const gone = [...was].filter((t) => !now.has(t));
          const arrived = [...now].filter((t) => !was.has(t));
          const both = after.filter((f) => gone.some((g) => f.txt.includes(g))
            && arrived.some((x) => f.txt.includes(x)));
          const fadedMax = after.reduce((n, f) => Math.max(n, f.textAnims || 0), 0);
          row.measured = `${after.length} sampled frame(s) across the change: ${gone.length} value(s) `
            + `left the panel, ${arrived.length} arrived, ${both.length} frame(s) held both at once, `
            + `max ${fadedMax} opacity animation(s) running on text`;
          row.verdict = !gone.length || !arrived.length ? 'FAIL'
            : (both.length || fadedMax) ? 'FAIL' : 'pass';
          if (row.verdict === 'FAIL' && gone.length && arrived.length) {
            row.detail = `${both.length} frame(s) showed the old value and the new one together, and `
              + `${fadedMax} animation(s) faded text in or out. A flap shows one face at a time: a `
              + `value that arrives through a half-state is a crossfade, and a hard cut is not a `
              + `crossfade`;
          } else if (row.verdict === 'FAIL') {
            row.detail = 'the change swapped no words at all, so there was no pair of states to watch';
          }
        }
      } else if (a.kind === 'no_motion') {
        const framesSeen = frames.filter((f) => f.inSpecimen !== undefined);
        const peak = framesSeen.reduce((n, f) => Math.max(n, f.inSpecimen), 0);
        const markup = framesSeen.length ? framesSeen[framesSeen.length - 1].markup : 0;
        row.measured = `${peak} animation(s) inside the specimen across ${framesSeen.length} sampled `
          + `frames (${markup} chars of markup drawn)`;
        row.verdict = markup < 200 || framesSeen.length < 20 ? 'FAIL'
          : peak === 0 ? 'pass' : 'FAIL';
        if (row.verdict === 'FAIL' && markup < 200) {
          row.detail = 'the specimen drew almost nothing (' + markup + ' chars) — a check that '
            + 'nothing moved passes trivially over an empty page, so it does not pass here';
        } else if (row.verdict === 'FAIL' && framesSeen.length < 20) {
          row.detail = `only ${framesSeen.length} frames sampled — "it never moved" needs a window`;
        } else if (row.verdict === 'FAIL') {
          row.detail = `the specimen moved ${peak} time(s): its reference is a panel arriving over `
            + 'a field that keeps RUNNING, and this component has no running field — its rows are '
            + 'facts already true at read time, so motion here is decoration wearing a record';
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
