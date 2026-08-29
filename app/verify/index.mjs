// The gate. `npm run verify` -- every route, both widths, both themes, and the
// four claims that only exist once a browser has run the page.
//
// Why this is a gate and not a look: every composition defect this library has had
// (labels struck through by the lines they named, a projection covering the
// observation it was projected over, `line-height: 0` flattening a page) passed the
// unit tests, because a unit test cannot see. So the checks below are the ones a
// person would perform by eye, written down: does anything overflow, is any text
// too small to read, does the page scroll sideways, does the honesty readout read
// zero, and does settling give the markup back. `app/verify/inspect.mjs` remains the
// tool for *looking* -- this file exists so that what was found while looking cannot
// come back.
//
//   node app/verify/index.mjs                    # the whole sweep
//   ROUTES='#/component/collar' node app/verify/index.mjs
//   KEEP=1 OUT=/tmp/gate-shots                   # keep the pictures as evidence

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

import { REGISTRY, allComponents } from '../src/registry/index.js';
import { UNCONDITIONAL_MARKS } from '../src/undeclared.js';
import { FIXTURES } from '../fixtures/index.js';
import { DRAWING_SELECTOR, DRAWING_PROBE, drawingVerdict, layoutVerdict } from './drawing.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:5199/';
const OUT = process.env.OUT || '/tmp/cyberdeck-gate';
const widths = (process.env.WIDTHS || '1280,390').split(',').map(Number);
const schemes = (process.env.SCHEMES || 'dark,light').split(',');
const settleMs = Number(process.env.SETTLE_MS || 900);

const COMPONENT_KEYS = new Set(allComponents().map((component) => component.key));
// Components that refuse by drawing the absence -- UNMEASURED, DARK, NO PROOF HISTORY
// -- are known to the registry by the word they print, and they stamp no
// `data-motion="still"` anywhere. That gap is reported in AGENTS.md; here it means the
// page-wide "with evidence absent the page must declare a refusal" assertion cannot be
// made over a page whose only specimen is one of them.
const DRAWN_ONLY = new Set(allComponents()
  .filter((component) => component.refusalText)
  .map((component) => component.key));

// The full sweep is 63 routes × 2 widths × 2 schemes, and one browser doing that
// serially takes an hour. `SHARD=2/4` takes every fourth route starting at the second,
// so four processes finish together and each writes its own results file.
const SHARD = process.env.SHARD ? process.env.SHARD.split('/').map(Number) : [1, 1];
const DEFAULT_ROUTES = [
    '#/',
    '#/overview',
    '#/rules',
    '#/primitives',
    ...REGISTRY.map((family) => `#/families/${family.slug}`),
    ...allComponents().map((component) => `#/component/${component.key}`),
  ];
// Routes may be named by argument OR by `ROUTES=a,b`. Until this block existed the argument
// form looked harmless and was not: it was ignored, the sweep ran over every route at four
// viewports, and a check written to look at one page reported the landing page instead — which
// cost a 15-minute kill and left a page unverified. An unknown route now refuses to run at all,
// because under a hash router a typo'd path renders Home, and a gate that measures Home while
// naming another page is worse than no gate at all.
const _requested = process.env.ROUTES
  ? process.env.ROUTES.split(',').map((r) => r.trim())
  : process.argv.slice(2);
const _all = _requested.length ? _requested : DEFAULT_ROUTES;
if (_requested.length) {
  const unknown = _requested.filter((route) => !DEFAULT_ROUTES.includes(route));
  if (unknown.length) {
    console.error(`verify: ${unknown.join(', ')} is not a route the app has. Not running:`);
    console.error("  a typo'd route renders the landing page under a hash router, and the pass");
    console.error('  would be real about the wrong page.');
    process.exit(2);
  }
}
const routes = _all.filter((_, i) => i % SHARD[1] === SHARD[0] - 1);
if (SHARD[1] > 1) console.log(`shard ${SHARD[0]}/${SHARD[1]}: ${routes.length} of ${_all.length} routes`);

// Any page carrying the globe's canvas gets a different assertion, not a pass:
// `paintGlobe`
// writes a transform and an opacity onto every pin every frame, and `settle()` stops
// the loop wherever it started, leaving the pins wherever the last frame put them.
// The byte-identity assertion therefore runs everywhere else, and this route is
// checked for the weaker, still-true property -- after settle the pins do not move.
// Detected from the page rather than from a route list, so the exemption cannot
// spread to a page that does not carry a canvas.

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = [];
const report = (name, line, bad = []) => {
  results.push({ name, line, bad });
  console.log(`${bad.length ? '✗' : '·'} ${name}  ${line}${bad.length ? `\n    ${bad.join('\n    ')}` : ''}`);
};

for (const route of routes) {
  for (const width of widths) {
    for (const scheme of schemes) {
      // One pass per (route, width, theme): the claims are cheap together and the
      // alternative -- a context per claim -- is 10x the browser starts for no
      // extra truth.
      const ctx = await browser.newContext({
        viewport: { width, height: 900 },
        colorScheme: scheme,
        reducedMotion: 'no-preference',
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      const consoleProblems = [];
      page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') consoleProblems.push(`${m.type()}: ${m.text()}`);
      });
      page.on('pageerror', (e) => consoleProblems.push(`pageerror: ${e.message}`));
      page.on('requestfailed', (r) => {
        if (!r.url().startsWith('data:')) consoleProblems.push(`requestfailed: ${r.url()}`);
      });

      await page.addInitScript(() => {
        window.__peak = 0;
        // The same lesson, applied to the beam: a measurement taken after the page settles
        // reads zero whether or not anything swung. So the tilt's angle is sampled per frame
        // from a standing start, and the claims below are about the trajectory — how far it
        // got, and where it came to rest. This also reads the CSS `rotate` property, which is
        // the one the runtime drives; `transform` alone stays at the identity matrix through a
        // whole swing, and a claim that is always zero is worse than none because it looks
        // like a check.
        window.__tilt = { marks: 0, swung: 0, frames: 0 };
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
        const sample = () => {
          const n = document.getAnimations ? document.getAnimations().length : 0;
          if (n > window.__peak) window.__peak = n;
          const beams = document.querySelectorAll('[data-level-axis="tilt"]');
          if (beams.length) {
            window.__tilt.marks = beams.length;
            window.__tilt.frames++;
            beams.forEach((el) => {
              const angle = Math.abs(angleOf(el));
              if (angle > window.__tilt.swung) window.__tilt.swung = angle;
              // Where the trajectory ended, not where the page ended up an age later. By the
              // time settle() runs, the runtime has already given every touched element back
              // its server-written style — which is right, and is also why a rest check taken
              // after settle could never see a beam left in the wrong place. The last frame on
              // which the animation was still alive is the honest end of the swing.
              // No "where did it land" reading is taken here, and the reason is worth keeping:
              // the engine fills its animations backwards (so the delay shows the starting
              // angle), writes a resting value into the `style` ATTRIBUTE on its way out, and
              // the runtime then hands the element back the server's style at settle(). Three
              // authorities over one property, and every "last frame" I sampled was one of
              // theirs rather than the swing's. Where the beam ENDS is already claimed by the
              // byte-identity check — a settled page must equal the static export, angle
              // included — so claiming it twice, badly, would only add a flaky voice.
            });
          }
          requestAnimationFrame(sample);
        };
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(sample));

        // The export, per specimen: the bytes that went IN, before any animation
        // touched them. `settle()` claims to give this back, and the only honest
        // comparison is against the render rather than against "a second later",
        // when a live counter is legitimately mid-tick.
        //
        // Watched at the setter, not with a MutationObserver. The observer's callback
        // is a microtask, and React's effects run before it: by the time the record
        // landed, the runtime had already written a trace's dash array into the brand
        // new subtree, and the gate was comparing a settled page against markup from
        // a page mid-animation -- which it then reported as settle having changed
        // something. The value handed to the setter is the component's own output.
        window.__export = {};
        const innerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        Object.defineProperty(Element.prototype, 'innerHTML', {
          configurable: true,
          get: innerHTML.get,
          set(value) {
            if (this.matches?.('[data-specimen-view]')) {
              innerHTML.set.call(this, value);
              // Read it BACK rather than recording what came in. `<line/>` goes in
              // and `</line>` comes out: an HTML parser normalises self-closing SVG
              // tags, so the string the component returned and the bytes the element
              // holds are different texts describing the same drawing. The claim is
              // about the bytes on the page, so those are the bytes to keep.
              window.__export[this.getAttribute('data-specimen-view') || '?'] = this.innerHTML;
              window.__writes = (window.__writes || 0) + 1;
              return;
            }
            return innerHTML.set.call(this, value);
          },
        });
      });

      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(settleMs);

      const name = `${route.replace(/^#/, '') || '/'}@${width}-${scheme}`;
      const bad = [];

      // —— what the page says about itself
      const readout = await page.evaluate(() => {
        const cells = [...document.querySelectorAll('[data-honesty]')]
          .map((n) => [n.dataset.honesty, Number(n.textContent.trim())]);
        const values = Object.fromEntries(cells);
        return {
          values,
          cells: cells.length,
          live: document.getAnimations().length,
          marks: document.querySelectorAll('[data-motion]').length,
          still: document.querySelectorAll('[data-motion="still"]').length,
          lying: document.getAnimations().filter((a) => {
            const t = a.effect && a.effect.target;
            return t && t.closest && t.closest('[data-motion="still"]');
          }).length,
          peak: window.__peak ?? 0,
          // How many drawings on the page were told to move. An animation count taken
          // after the page settles reads zero whether or not anything moved, and so does
          // a peak of zero on a page that should have been moving: that is the
          // invisible-motion defect, and it has passed this repo's own tests once.
          liveSpecimen: [...document.querySelectorAll('[data-specimen-view] [data-motion]')]
            .filter((el) => !['still', 'intent'].includes(el.getAttribute('data-motion'))).length,
          // `elapsed` is a `setInterval` that rewrites text, not an `Animation`, so the
          // peak can never see it and neither can `getAnimations()`. It gets measured
          // with the instrument that fits it -- whether the words change -- below.
          elapsedMarks: document.querySelectorAll('[data-specimen-view] [data-motion="elapsed"]').length,
          theme: document.documentElement.getAttribute('data-theme')
            || `system(${matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'})`,
          docScroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
          specimens: [...document.querySelectorAll('[data-specimen-view]')].map((n) => {
            const box = n.getBoundingClientRect();
            // Being wider than the box is not the defect -- for the wide drawings it
            // is the design, and the box is inside a scroller on purpose. The defect
            // is content wider than its box with nothing to scroll it, because then it
            // is either cut off or the page scrolls sideways, and the page does neither.
            const wider = n.scrollWidth > n.clientWidth + 1;
            const scroller = n.closest('.cd-scroll');
            const scrolls = scroller
              && ['auto', 'scroll'].includes(getComputedStyle(scroller).overflowX);
            return {
              label: n.getAttribute('data-specimen-view') || '?',
              h: Math.round(box.height),
              w: Math.round(box.width),
              content: n.scrollWidth,
              overflow: wider && !scrolls,
              scrolled: wider && scrolls,
            };
          }),
          bodyScrolls: document.body.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });

      if (readout.cells !== 4) bad.push(`the honesty readout shows ${readout.cells} counters, not 4`);
      if (readout.liveSpecimen - readout.elapsedMarks > 0 && !readout.peak) {
        bad.push(`${readout.liveSpecimen} drawings carry a mark and the peak animation count is 0 — motion was asked for and never happened`);
      }
      if (readout.elapsedMarks && !readout.liveSpecimen) {
        // The page's only motion is a running counter. Then the counter had better run:
        // `elapsed` writes text only when the words change, which is honest at hour
        // granularity and indistinguishable from a stuck widget at a glance. Measured
        // over 1.5s, because that is roughly how long a reader looks at one number
        // before deciding whether it is alive.
        const words = () => page.evaluate(() => [...document.querySelectorAll('[data-elapsed-text]')]
          .map((n) => n.textContent));
        const first = await words();
        await page.waitForTimeout(1500);
        const after = await words();
        if (first.join('|') === after.join('|')) {
          bad.push(`${readout.elapsedMarks} counter${readout.elapsedMarks > 1 ? 's' : ''} on the page and nothing changed in 1.5s (${first.join(' / ') || 'no text'}) — a stopped counter is the defect the kind exists to avoid`);
        }
      }
      if (readout.lying) bad.push(`MOVING WITHOUT EVIDENCE=${readout.lying} (live count agrees: ${readout.live})`);
      if (readout.values['moving-without-evidence'] !== readout.lying) {
        bad.push(`the counter reads ${readout.values['moving-without-evidence']} while the page has ${readout.lying} — the readout and the truth disagree`);
      }
      if (readout.docScroll > readout.client) {
        bad.push(`the document scrolls sideways (${readout.docScroll} > ${readout.client})`);
      }
      if (readout.bodyScrolls) bad.push('the body itself scrolls sideways');
      for (const spec of readout.specimens) {
        if (spec.h < 24) bad.push(`${spec.label}: specimen is ${spec.h}px tall — a refusal must keep its space`);
        if (spec.overflow) {
          bad.push(`${spec.label}: ${spec.content}px of drawing in a ${spec.w}px box with nothing to scroll it`);
        }
      }
      // —— two pieces of type in the same pixels, measured where HTML and SVG meet.
      //
      // `individuation` draws each row's context bar as its own little svg and prints the
      // percentage at the end of the bar. A worker at 82% is fine. A worker at 12% puts
      // the label under the row above, on top of "TOOLS 22" — a measurement overprinted by
      // another measurement, which is the failure this library exists to prevent, and
      // invisible to a check that only looks inside one svg at a time. So this collects
      // every run of type in the specimen — HTML text leaves a client rect, `<text>` is
      // mapped through its own CTM into the same coordinates — and asks whether any two
      // of them share pixels.
      const collisions = await page.evaluate(() => {
        const hits = [];
        for (const view of document.querySelectorAll('[data-specimen-view]')) {
          const label = view.getAttribute('data-specimen-view') || '?';
          const runs = [];
          for (const node of view.querySelectorAll('*')) {
            if (node.closest('svg')) continue;
            const own = [...node.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
            if (!own.length) continue;
            for (const text of own) {
              const range = document.createRange();
              range.selectNodeContents(text);
              // One client rect per run, unioned. A range can hand back a rect per line
              // box, and two rects for one piece of type would collide with each other --
              // a `NO SNOOZE` that reports itself printed over itself is the check lying,
              // not the page.
              const boxes = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
              if (boxes.length) {
                const left = Math.min(...boxes.map((r) => r.left));
                const top = Math.min(...boxes.map((r) => r.top));
                const right = Math.max(...boxes.map((r) => r.right));
                const bottom = Math.max(...boxes.map((r) => r.bottom));
                runs.push({
                  text: text.textContent.trim().slice(0, 20),
                  node: text,
                  rect: { left, top, right, bottom, width: right - left, height: bottom - top },
                });
              }
            }
          }
          const ctmOf = (svg) => {
            const ctm = svg.getScreenCTM();
            return ctm ? [ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f] : null;
          };
          for (const svg of view.querySelectorAll('svg')) {
            const m = ctmOf(svg);
            if (!m) continue;
            for (const text of svg.querySelectorAll('text, tspan')) {
              const content = text.textContent.trim();
              if (!content || text.querySelector('tspan')) continue;
              let box;
              try { box = text.getBBox(); } catch (e) { continue; }
              if (!box.width || !box.height) continue;
              const corners = [
                [box.x, box.y].map((v, i) => m[i === 0 ? 0 : 2] * v),
                [box.x + box.width, box.y + box.height].map((v, i) => m[i === 0 ? 0 : 2] * v),
              ];
              void corners;
              const x0 = m[0] * box.x + m[2] * (box.x + box.width) + m[4];
              const x1 = m[0] * box.x + m[2] * box.x + m[4];
              const y0 = m[1] * box.y + m[3] * (box.y + box.height) + m[5];
              const y1 = m[1] * box.y + m[3] * box.y + m[5];
              runs.push({
                text: content.slice(0, 20),
                node: text,
                rect: {
                  left: Math.min(x0, x1), right: Math.max(x0, x1),
                  top: Math.min(y0, y1), bottom: Math.max(y0, y1),
                  width: Math.abs(x0 - x1), height: Math.abs(y0 - y1),
                },
              });
            }
          }
          for (let i = 0; i < runs.length; i += 1) {
            for (let j = i + 1; j < runs.length; j += 1) {
              if (runs[i].node === runs[j].node) continue;
              const a = runs[i].rect;
              const b = runs[j].rect;
              const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (x < 2 || y < 2) continue;
              const smaller = Math.min(a.width * a.height, b.width * b.height);
              // A quarter of the smaller string covered is where "close together"
              // becomes "one of these is unreadable". The threshold was set by the
              // defect it now guards: a context numeral riding 4px into the line
              // above it grazed a fifth of "TOOLS 22" at 0.28, and nothing else in
              // the set is anywhere near it.
              if (smaller <= 0 || (x * y) / smaller < 0.25) continue;
              hits.push(`${label}: "${runs[i].text}" is printed over "${runs[j].text}"`);
            }
          }
        }
        return [...new Set(hits)];
      });
      bad.push(...collisions);

      if (consoleProblems.length) bad.push(...consoleProblems.slice(0, 4));

      // Wait for the page to have drawn something before judging it. The app is a hash
      // router and React mounts the specimen after the chrome, so every drawing claim in
      // this file used to race the mount -- a level-anchoring probe added to `chipBudget`
      // found zero level marks because it was looking at the landing page, and a check
      // that measures nothing reports nothing. Routes with no drawing at all (rules) are
      // allowed to time out; the claim they owe is made elsewhere.
      // Wait for *this* route's specimen, not merely for a specimen. The app is a hash
      // router: the landing page mounts first and carries its own live drawing, so a
      // wait on `[data-specimen-view]` resolved on the home page and every drawing claim
      // in this file judged whatever happened to be mounted. A level-anchoring probe
      // added against `chipBudget` reported zero level marks and passed, which is how a
      // gate becomes decoration -- the check that measures nothing reports nothing.
      const routeKey = /^#\/component\/([\w-]+)$/.exec(route)?.[1];
      const mounted = await page.waitForFunction((key) => (key
        ? [...document.querySelectorAll('[data-specimen-view]')]
          .some((n) => n.getAttribute('data-specimen-view') === key)
        : document.querySelector('.cd-draw, [data-specimen-view]')), routeKey ?? null,
      { timeout: 6000 }).then(() => true, () => false);
      if (routeKey && !mounted) {
        // The route asked for a specimen and the page shows something else. Every
        // drawing claim below would then measure the wrong page and report a clean
        // result, so the wrong page is the failure -- named here, once.
        bad.push(`#${routeKey} never mounted: the page shows no specimen with that name,`
          + `so every drawing claim on this route would be measuring some other drawing`);
      }
      await page.waitForTimeout(200);

      // A `level` bar must END where the measurement says, not merely move. The
      // counters ask whether something animated, and a scaleX applied about the centre
      // of the viewBox answers "yes" while landing the bar in another column -- which is
      // what `chipBudget` did for its whole life: authored at x=224, finishing at x≈91,
      // and holding there because the animation keeps its end state. Nothing that moves
      // can be trusted to have arrived, so this measures arrival.
      const anchored = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('[data-motion="level"]').forEach((el) => {
          const axis = el.getAttribute('data-level-axis') || 'x';
          // A tilt is not a left-anchored extent — it is an angle about a pivot — so it is
          // measured by a different claim below (`tilted`), and forcing the anchor rule on it
          // would compare a rotated bounding box against an unrotated one.
          if (axis === 'slide' || axis === 'fade' || axis === 'tilt') return;
          const level = Number(el.getAttribute('data-level'));
          if (!(level >= 0)) return;
          // Follow the runtime's own choice of target: a level on a track animates the
          // fill inside it, and measuring the track instead would compare a box that
          // never moves against an extent the fill is holding.
          const target = el.querySelector('i') || el;
          let authoredLeft;
          let width;
          let scaleByLevel;
          if (typeof target.getBBox === 'function') {
            // SVG dialect: the extent is *in the transform* -- the drawing is written at
            // full extent and `scaleX(level)` is what makes it a measurement.
            const box = target.getBBox();
            const ctm = target.parentElement.getScreenCTM();
            if (!ctm) return;
            authoredLeft = ctm.a * box.x + ctm.c * box.y + ctm.e;
            width = Math.abs(ctm.a * box.width);
            scaleByLevel = true;
          } else {
            // HTML dialect, measured as an OUTCOME rather than classified by encoding. What
            // used to live here tried to work out WHICH encoding the host used -- CSS width or
            // the transform -- and skipped the right edge whenever it could not tell, which is
            // how a bar declaring 0.406 rendered at 0.189 of its track through the whole life
            // of finding #11 while the gate watched and said nothing. A `level` prediction needs
            // no such judgement: 0.406 means the ink covers 40.6% of its track, however the host
            // drew it, and the ink starts at that track's own left edge. Width-encoded hosts
            // satisfy both, transform-encoded hosts satisfy both, and a centre-anchored bar --
            // the real defect -- starts 177px late and is caught on the left edge.
            const track = el.getBoundingClientRect();
            if (!(track.width > 0)) return;
            authoredLeft = track.left;
            width = track.width;
            scaleByLevel = true;
          }
          const r = target.getBoundingClientRect();
          out.push({
            name: el.getAttribute('class') || el.tagName,
            authoredLeft, renderedLeft: r.left,
            authoredRight: authoredLeft + width * (scaleByLevel ? level : 1),
            renderedRight: r.right, span: width, level, scaleByLevel,
          });
        });
        return out;
      });
      // Two claims about the swing, both read off the sampled trajectory:
      //   * it swung -- a `level(axis:'tilt')` that never moved is the invisible-motion
      //     defect wearing a new kind, and only a per-frame sample can tell it apart from a
      //     page that settled quietly;
      //   * where it came to rest is NOT claimed here. The byte-identity claim does that
      //     better: a settled page must equal the static export, and the resting angle is part
      //     of those bytes. (A per-frame landing reading was tried and removed -- see the note
      //     in the sampler.)
      const tilt = await page.evaluate(() => window.__tilt || { marks: 0 });
      if (tilt.marks && (tilt.frames || 0) > 3) {
        if (tilt.swung < 2) {
          bad.push(`${tilt.marks} tilt mark(s) on this page swung a maximum of `
            + `${tilt.swung.toFixed(1)}° over ${tilt.frames} sampled frames -- a beam that is `
            + `declared to find its angle and never moves is the invisible-motion defect`);
        }
      }

      for (const bar of anchored) {
        // Tolerance scales with the drawing: a specimen fitted to a 390px phone maps
        // user units to fewer device pixels, and the same one-unit rounding is smaller.
        const slack = 1.5 + bar.span * 0.03;
        const leftDrift = Math.abs(bar.renderedLeft - bar.authoredLeft);
        // The right edge is claimed wherever the resting transform carries the extent and
        // is anchored at the element's own left edge -- in either dialect. `scaleByLevel` is
        // measured off the computed transform and its origin, not inferred from the tag: the
        // skip that used to live here was written when the chrome's `cd-rule-bar` declared
        // 0.406 and rendered 0.189, and the anchor rule fixed the bar without this claim ever
        // being asked to come back. A dodge that outlives its defect is a hole with a comment.
        const rightMiss = bar.scaleByLevel ? Math.abs(bar.renderedRight - bar.authoredRight) : 0;
        if (leftDrift > slack || rightMiss > slack) {
          bad.push(`${bar.name} is a level of ${bar.level} that does not land where it `
            + `was drawn: authored edge ${Math.round(bar.authoredLeft)}..`
            + `${Math.round(bar.authoredRight)}, rendered `
            + `${Math.round(bar.renderedLeft)}..${Math.round(bar.renderedRight)} `
            + `(drift ${Math.round(leftDrift)}px / ${Math.round(rightMiss)}px) -- `
            + `an extent that ends in the wrong place is not a measurement`);
        }
      }

      // —— what the drawing contains: type small enough to be decoration, text
      // outside the box it was drawn in, and marks that never got a movement
      const drawn = await page.evaluate(() => {
        const problems = [];
        // Judge the drawing the page laid out, not the symbols inside it. A disc the
        // library writes as `<svg width="30" viewBox="-24 -24 48 48">` is a glyph at a
        // size the library chose, and its ratio to its own viewBox says nothing about
        // whether the app starved the specimen. A svg with an explicit `width`
        // attribute was sized by the library; one without is sized by its container,
        // which is the thing the app controls, and the first such svg in the specimen
        // is the drawing.
        const isSymbol = (svg) => {
          const given = svg.getAttribute('width') || '';
          return Boolean((given && !given.endsWith('%'))
            || (svg.parentElement && svg.parentElement.closest('svg')));
        };
        for (const view of document.querySelectorAll('[data-specimen-view]')) {
          const label = view.getAttribute('data-specimen-view') || '?';
          const drawing = [...view.querySelectorAll('svg[viewBox]')].find((svg) => {
            const vb = svg.viewBox && svg.viewBox.baseVal;
            return vb && vb.width && !isSymbol(svg);
          });
          if (drawing) {
            const vb = drawing.viewBox.baseVal;
            const scale = drawing.getBoundingClientRect().width / vb.width;
            if (scale < 0.85) {
              problems.push(`${label}: drawn at ${(scale * 100).toFixed(0)}% of its own size — type below its design floor`);
            }
          }
          for (const svg of view.querySelectorAll('svg')) {
            const vb = svg.viewBox && svg.viewBox.baseVal;
            if (!vb || !vb.width) continue;
            // The library's own floor is instrument type drawn at about 6.5 user
            // units, so the property worth asserting is not "the app finds 7px
            // acceptable" -- it is that the app never draws the thing SMALLER than
            // it was drawn. A card is drawn to fill the cell it is given
            // (`components.css`: `svg.cd-draw { width: 100% }`), so scaling with the
            // cell is the design; what is not the design is the app taking a chart
            // drawn for a spread and squeezing it into a column. That is measured once
            // per specimen above, and what is checked here is the type itself.
            for (const text of svg.querySelectorAll('text')) {
              const size = Number.parseFloat(getComputedStyle(text).fontSize || '16');
              // The library's own floor: `keycard` draws its column labels at about
              // 5.5 user units, which is the smallest type anywhere in the set and is
              // recorded in AGENTS.md as the library's choice rather than something the
              // app can fix from outside. Below five, no screen is reading it.
              if (size > 0 && size < 5) {
                problems.push(`${label}: ${size.toFixed(1)}px type on "${text.textContent.trim().slice(0, 24)}"`);
              }
              let box;
              try { box = text.getBBox(); } catch (e) { continue; }
              if (!box || !box.width) continue;
              if (box.x < vb.x - 1 || box.y < vb.y - 1
                  || box.x + box.width > vb.x + vb.width + 1
                  || box.y + box.height > vb.y + vb.height + 1) {
                problems.push(`${label}: text drawn outside its viewBox — "${text.textContent.trim().slice(0, 28)}"`);
              }
            }
          }
        }
        return [...new Set(problems)];
      });
      bad.push(...drawn);

      // —— evidence off: every specimen on screen loses its number and keeps its shape
      const evidenceSwitch = await page.$('[data-control="evidence"]');
      if (evidenceSwitch && readout.specimens.length) {
        const before = readout;
        // Where the picture is, before anything is taken away. Measured here because the
        // click below is the comparison: a specimen view holds the frame, the caption, the
        // refusal sentence and sometimes a note, so total card height moves for reasons that
        // have nothing to do with the drawing. See `drawing.mjs` for what this instrument is
        // for and `negative-control.mjs` for the run that proves it bites.
        const drawingsOn = await page.evaluate(eval(DRAWING_PROBE), DRAWING_SELECTOR);
        // The state of the page before the switch, in three numbers that a re-render must move:
        // the specimen markup's size, the count of declared refusals, and the count of printed
        // refusal words (twelve components refuse by ink rather than by mark, so a `still` count
        // alone cannot see them). Polling for change instead of sleeping is what makes this check
        // survive load: a shard beside three others can sample a page React has not re-rendered
        // yet, and a page sampled mid-flight is the measured render wearing the refused render's
        // clothes — which is how thirteen components came to "still be marked" over a build that
        // had refused every one of them.
        const shapeOf = () => page.evaluate(() => ({
          size: [...document.querySelectorAll('[data-specimen-view]')]
            .reduce((n, n2) => n + n2.innerHTML.length, 0),
          still: document.querySelectorAll('[data-still-reason]').length,
          words: [...document.querySelectorAll('[data-specimen-view] text, [data-specimen-view] span, [data-specimen-view] div')]
            .filter((el) => el.children.length === 0 && /UNMEASURED|UNPRICED|UNATTRIBUTED|NO PROOF HISTORY|\bDARK\b|NO RESOLUTION|NO DEADLINE SET/.test(el.textContent || '')).length,
        }));
        const beforeShape = await shapeOf();
        await evidenceSwitch.click();
        let changed = false;
        for (let waited = 0; waited < 4000 && !changed; waited += 100) {
          await page.waitForTimeout(100);
          const now = await shapeOf();
          changed = now.size !== beforeShape.size || now.still !== beforeShape.still
            || now.words !== beforeShape.words;
        }
        await page.waitForTimeout(300);
        const off = await page.evaluate(() => ({
          still: document.querySelectorAll('[data-motion="still"]').length,
          // Counted per specimen, because a component can answer "no measurement" by
          // throwing its whole drawing away and returning one refused card -- the
          // ceremony does exactly that. Its marked-element count goes DOWN, and the
          // page is more honest for it. What must not go down is how many drawings on
          // the page admit they were refused.
          refusing: [...document.querySelectorAll('[data-specimen-view]')]
            .filter((n) => n.querySelector('[data-motion="still"], [data-still-reason]')).length,
          reasons: document.querySelectorAll('[data-still-reason]').length,
          liveMarks: [...document.querySelectorAll('[data-specimen-view]')].map((n) => ({
            label: n.getAttribute('data-specimen-view') || '?',
            marks: [...n.querySelectorAll('[data-motion]')]
              .map((el) => `${el.getAttribute('data-motion')}@${(el.getAttribute('class') || el.tagName).split(' ')[0]}`)
              .filter((m) => !m.startsWith('still@') && !m.startsWith('intent@')),
          })).filter((specimen) => specimen.marks.length),
          lying: document.getAnimations().filter((a) => {
            const t = a.effect && a.effect.target;
            return t && t.closest && t.closest('[data-motion="still"]');
          }).length,
          verdict: Number(document.querySelector('[data-honesty="moving-without-evidence"]')?.textContent.trim() ?? -1),
          heights: [...document.querySelectorAll('[data-specimen-view]')]
            .map((n) => Math.round(n.getBoundingClientRect().height)),
          // What the refusal itself is obliged to print, per specimen: the reason line the
          // layout allowance is made of. Read here, not guessed in the verdict.
          reasons: [...document.querySelectorAll('[data-specimen-view]')].map((n) => Math.round(
            [...n.querySelectorAll('i.cd-why, .cd-why')]
              .reduce((sum, el) => sum + el.getBoundingClientRect().height, 0))),
          painted: getComputedStyle(document.body).backgroundColor,
        }));
        // The precondition this whole section silently assumed: the click landed. A button that
        // is disabled does nothing when clicked, and a page under load can be sampled before the
        // re-render lands — in both cases the "refused" render IS the measured render, and every
        // check below reports the marks it is hunting for as if the operator had taken the
        // evidence away. Four shards against one dev server produced exactly these false reds:
        // thirteen components "still marked", one "loses its drawing". Score those checks only
        // over a render that proves it changed, and say plainly when it did not.
        // Two pages of the fifty-one are legends — `standardSheet`'s glyph key and `channel`'s four
        // trust classes — and their fixtures declare `fields: []` on purpose: there is no measurement
        // on a key that could be taken away, so the page is *supposed* to read identical on both sides
        // of the toggle, and its refusal (UNATTRIBUTED, NO MEASUREMENT HERE) is printed either way.
        // Demanding a change from them would be demanding that a legend pretend to be a reading. The
        // declaration is read from the fixtures rather than duplicated here, because a licence that
        // lives in the checker is a licence nobody reviews.
        const changesOnToggle = readout.specimens.some((spec) => COMPONENT_KEYS.has(spec.label)
          && !DRAWN_ONLY.has(spec.label) && (FIXTURES[spec.label]?.fields || []).length > 0);
        const switchTook = changed || !changesOnToggle;
        const marksLeft = off.liveMarks.reduce((n, s) => n + s.marks.length, 0);
        // Only pages that show registry components owe a refusal at all — the primitives page is a
        // shape gallery with no measurement anywhere to remove, and demanding a refusal from it
        // would be demanding a lie. It also does not owe the precondition complaint.
        const owesRefusal = readout.specimens.some((spec) => COMPONENT_KEYS.has(spec.label)
          && !DRAWN_ONLY.has(spec.label));
        if (!switchTook && owesRefusal) {
          bad.push(`the evidence switch never took effect over ${readout.specimens.length} specimen(s) `
            + `(${marksLeft} mark(s) still on the page: the specimen markup, the declared refusals, and `
            + `the printed refusal words all read identical after the click) — `
            + `this is the measured render wearing the refused render's clothes, so the mark, drawing and `
            + `height checks below are skipped rather than scored: an instrument that cannot tell "the `
            + `refusal is applied" from "nothing happened" reports the very defect it hunts`);
        }
        if (switchTook) {
          if (off.verdict !== 0) bad.push(`with evidence absent the verdict reads ${off.verdict}`);
          // The promise this app makes, stated as a check: with evidence absent, no
          // drawing on the page is still moving. Four specimens in the library mark
          // themselves as moving without asking a measurement first -- `trace(true)` and
          // `count(0, 1)`, named one by one in `app/src/undeclared.js` -- so those marks
          // are allowed, and only those, and only where they are named. An empty list
          // here means an empty licence: everything else has to refuse.
          const licence = Object.fromEntries(Object.entries(UNCONDITIONAL_MARKS)
            .map(([key, entries]) => [key, entries.map((entry) => `${entry.kind}@${entry.carrier}`)]));
          for (const specimen of off.liveMarks) {
            const allowed = licence[specimen.label] || [];
            const extra = specimen.marks.filter((m) => !allowed.includes(m));
            if (extra.length) {
              bad.push(`${specimen.label} is still marked ${extra.join(', ')} with every measurement removed `
                + `(named here: ${allowed.join(', ') || 'nothing'})`);
            }
          }
          // "A refusal keeps its space" has to be measured *against a refusal*, and the first
          // version of this did not: the only height floor in this file ran on the
          // evidence-present page, where nothing is refused, so the sweep stayed green while
          // twelve components answered "no measurement" by returning a card with an empty body
          // -- frame and sentence standing, drawing area gone, the globe 445px down to 15.
          //
          // Its replacement measures the drawing rather than the card, because a ratio cannot
          // tell a vanished picture from a refusal that is honestly shorter than the presence it
          // refuses: MU/TH/UR's console with one unasked prompt is not four answered queries, and
          // asking it to pad out to four would be asking for a lie. Same instrument, sharper
          // question -- is the picture still there, and is it still drawing-sized?
          const drawingsOff = await page.evaluate(eval(DRAWING_PROBE), DRAWING_SELECTOR);
          const byLabel = new Map(drawingsOff.map((d) => [d.label, d]));
          const lost = drawingVerdict(drawingsOn
            .filter((d) => byLabel.has(d.label))
            .map((d) => ({ label: d.label, measured: d, refused: byLabel.get(d.label) })));
          if (lost.length) {
            bad.push(`${lost.length} specimen(s) fail the drawing test when the evidence goes: `
              + lost.slice(0, 4).join('; ') + (lost.length > 4 ? ` and ${lost.length - 4} more` : ''));
          }
          // The asymmetric half: a refusal may say less, so it may be shorter — MU/TH/UR's
          // console with one unasked prompt legitimately halves. It may not be taller: that
          // is ink the measurement never claimed, and it moves everything below the card
          // because someone changed an epistemic state. `scaleCrush` did +371px and
          // `individuation` +554px before the refusal frames were sized to the space.
          if (off.heights.length === before.specimens.length) {
            const grew = layoutVerdict(before.specimens.map((spec, i) => ({
              label: spec.label, measured: spec.h, refused: off.heights[i],
              reason: off.reasons?.[i] ?? 0,
            })).filter((pair) => COMPONENT_KEYS.has(pair.label)));
            if (grew.length) bad.push(grew.slice(0, 3).join('; ')
              + (grew.length > 3 ? `; and ${grew.length - 3} more` : ''));
          }
          // Only pages that show registry components owe this one. The primitives page
          // is a shape gallery -- seventeen drawings, no measurement anywhere to remove --
          // and demanding a refusal from it would be demanding a lie.
          const declaredOnes = before.specimens
            .filter((spec) => COMPONENT_KEYS.has(spec.label) && !DRAWN_ONLY.has(spec.label));
          if (declaredOnes.length && off.still < 1) {
            bad.push('with evidence absent the page declares no refusal anywhere');
          }
        }
        await evidenceSwitch.click();
        await page.waitForTimeout(400);
      }

      // —— the kill switch: settle gives the markup back
      const kill = await page.$('[data-control="kill"]');
      if (kill) {
        const disabled = await kill.evaluate((b) => b.disabled);
        if (!disabled) {
          await kill.click();
          await page.waitForTimeout(500);
          const settled = await page.evaluate(() => ({
            live: document.getAnimations().length,
            stamped: document.documentElement.hasAttribute('data-motion-off'),
            identical: [...document.querySelectorAll('[data-specimen-view]')].every((n) => {
              const label = n.getAttribute('data-specimen-view') || '?';
              return window.__export[label] === n.innerHTML;
            }),
            recorded: Object.keys(window.__export).length,
            // Decided by what is on the page, not by the route it arrived on: the
            // globe appears on its own page and in the instruments family, and a
            // carve-out written against a pathname would quietly exempt whichever
            // page it happened to name.
            globe: !!document.querySelector('.cd-globe-mesh'),
          }));
          if (settled.live) bad.push(`${settled.live} animations survived settle()`);
          if (!settled.stamped) bad.push('settle() did not stamp the root');
          if (settled.globe) {
            // The one route where byte-identity is not the property: the pins keep
            // wherever the last frame left them. What can be asserted is that
            // settling stopped the loop, which is the same claim one level down.
            const moved = await page.evaluate(async () => {
              const read = () => [...document.querySelectorAll('.cd-globe-pin')]
                .map((p) => `${p.getAttribute('transform')}|${p.style.opacity}`).join(' ');
              const first = read();
              await new Promise((r) => setTimeout(r, 350));
              return first !== read();
            });
            if (moved) bad.push('the globe is still turning after settle() — the canvas loop outran the kill switch');
          } else if (settled.recorded && !settled.identical) {
            bad.push('a settled page is not the rendered page (specimen markup differs from the export)');
          } else if (!settled.recorded && readout.specimens.length) {
            bad.push('a specimen is on the page and nothing recorded what it looked like before motion — the identity claim is unchecked here');
          }
          await kill.click();
          await page.waitForTimeout(300);
        }
      }

      if (process.env.KEEP === '1') {
        await page.screenshot({ path: `${OUT}/${name.replace(/[^\w.-]+/g, '-')}.png`, fullPage: true });
      }
      report(name,
        `peak=${readout.peak} marks=${readout.marks} still=${readout.still} lying=${readout.lying} theme=${readout.theme}`,
        bad);
      await ctx.close();
    }
  }
}

// Reduced motion is a fifth condition on every route, and it is the one an operator
// can impose on a page they did not build. It gets its own pass over what should be
// moving, at one width, because the claim is about the runtime, not the composition.
if (!process.env.SKIP_REDUCED) {
  for (const route of routes.filter((r) => r === '#/' || r.startsWith('#/families'))) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const problems = [];
    page.on('pageerror', (e) => problems.push(String(e)));
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    // A canvas is not an `Animation` either, and the globe's painter reads the root's
    // `data-motion-off` every frame -- so a page can satisfy "no animations" while the
    // mesh keeps turning. Hash the pixels before and after the same window the counters
    // are watched in.
    const meshHash = () => page.evaluate(() => {
      const canvas = document.querySelector('.cd-globe-mesh');
      if (!canvas) return null;
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let hash = 2166136261;
      for (let i = 0; i < data.length; i += 16384) hash = ((hash ^ data[i]) * 16777619) >>> 0;
      return hash;
    });
    const meshBefore = await meshHash();
    const elapsedBefore = await page.evaluate(() => [...document.querySelectorAll('[data-elapsed-text]')].map((n) => n.textContent));
    await page.waitForTimeout(1200);
    const elapsedAfter = await page.evaluate(() => [...document.querySelectorAll('[data-elapsed-text]')].map((n) => n.textContent));
    const r = await page.evaluate(() => ({
      live: document.getAnimations().length,
      verdict: Number(document.querySelector('[data-honesty="moving-without-evidence"]')?.textContent.trim() ?? -1),
      marks: document.querySelectorAll('[data-motion]').length,
      kill: (() => {
        const b = document.querySelector('[data-control="kill"]');
        return b ? { label: b.textContent.trim(), disabled: b.disabled } : null;
      })(),
      meshPainted: (() => {
        const canvas = document.querySelector('.cd-globe-mesh');
        if (!canvas) return true;
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < data.length; i += 4) if (data[i]) return true;
        return false;
      })(),
    }));
    const bad = [];
    if (r.live) bad.push(`prefers-reduced-motion left ${r.live} animations running`);
    // A counter is not an `Animation`, so `live: 0` would say nothing about it. Under a
    // reduced-motion request the words must stop changing as surely as the arcs stop
    // drawing -- otherwise the operator's request is honoured only for the kinds this
    // check happens to be able to see.
    if (elapsedBefore.join('|') !== elapsedAfter.join('|')) {
      bad.push(`prefers-reduced-motion left a counter writing text (${elapsedBefore.join(' / ')} -> ${elapsedAfter.join(' / ')})`);
    }
    if (r.verdict !== 0) bad.push(`the readout reads ${r.verdict} under reduced motion`);
    if (!r.kill || !r.kill.disabled) bad.push('the kill switch offers to un-decide reduced motion');
    if (!r.meshPainted) bad.push('the globe mesh was never painted — a canvas the host forgot is a black box');
    if (meshBefore !== null && meshBefore !== (await meshHash())) {
      bad.push('the globe mesh is still turning under prefers-reduced-motion — the canvas did not read the refusal');
    }
    if (problems.length) bad.push(...problems);
    report(`${route.replace(/^#/, '') || '/'}@reduced`,
      `animations=${r.live} marks=${r.marks} verdict=${r.verdict} switch=${JSON.stringify(r.kill)}`, bad);
    await ctx.close();
  }
}

await browser.close();
const failures = results.filter((r) => r.bad.length);
writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
/**
 * One line, one verdict. The pass count used to print unconditionally, so a run that failed read
 * as `8 passes over 2 routes …` immediately followed by `✗ 4 with problems` — and `grep passes` is
 * exactly what a reviewer, or a shard's parent, reaches for first. A number that appears in a red
 * run is a false green wearing a statistic's clothes, so the count now appears only when it is the
 * whole truth.
 */
if (failures.length) {
  console.log(`\n✗ RED — ${failures.length} of ${results.length} configs with problems over `
    + `${routes.length} routes × ${widths.length} widths × ${schemes.length} schemes`);
} else {
  console.log(`\n${results.length} passes over ${routes.length} routes × ${widths.length} widths `
    + `× ${schemes.length} schemes`);
}
if (failures.length) {
  console.log(`✗ ${failures.length} with problems — ${failures.map((f) => f.name).join(', ')}`);
  console.log(`  evidence in ${OUT}/results.json`);
  process.exit(1);
}
console.log(`✓ every claim held. results in ${OUT}/results.json`);
