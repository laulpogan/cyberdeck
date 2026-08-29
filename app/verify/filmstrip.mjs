/** Filmstrips: what a specimen actually does over time, in pictures and in numbers.
 *
 * A screenshot answers "what does it look like". This answers the question the library's
 * rule can actually be checked against: *does it move, when, for how long, and does it
 * stop when the measurement is gone*. Each component is mounted, re-mounted so the clock
 * starts at a known instant, and sampled frame by frame while the entrance runs; then
 * sampled again slowly enough to watch a loop turn over. Every component is captured
 * twice — with its evidence and without it — because the claim under test is the
 * difference between the two rows, not the beauty of the first one.
 *
 * Motion is measured two ways, and both are recorded:
 *   - `changed` — this frame's PNG bytes differ from the last one's. Exact about
 *     "something on screen altered", silent about what;
 *   - `animations` — `document.getAnimations().length` at that instant, so a counter
 *     that rewrites text (a `setInterval`, not an `Animation`) shows up as pixels
 *     changing with `animations: 0` rather than being called still by the wrong
 *     instrument.
 *
 * Cadence is measured, not assumed: `page.screenshot` costs tens of milliseconds, so
 * every frame carries the page's own `performance.now()` from the instant the shot was
 * asked for, and that is what the sheet is labelled with and what any later arithmetic
 * uses. The requested interval is a floor, not a claim.
 *
 * Output per component, under OUT:
 *   <key>-<condition>-enter-NN.png   dense frames across the entrance
 *   <key>-<condition>-loop-NN.png    slow frames across several seconds
 *   <key>.json                       per-frame {t, changed, animations} + mark inventory
 *   sheets built from these by app/verify/sheet.mjs
 *
 *   node app/verify/filmstrip.mjs KEYS=gauge,radar OUT=/tmp/film
 *   ENTER_MS=1200 ENTER_EVERY=40 LOOP_MS=6000 node app/verify/filmstrip.mjs KEYS=globe
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://127.0.0.1:5299';
const OUT = process.env.OUT || '/tmp/film';
const KEYS = (process.env.KEYS || 'gauge').split(',').map((k) => k.trim()).filter(Boolean);
const ENTER_MS = Number(process.env.ENTER_MS || 900);
const ENTER_EVERY = Number(process.env.ENTER_EVERY || 55);
const LOOP_MS = Number(process.env.LOOP_MS || 4200);
const LOOP_EVERY = Number(process.env.LOOP_EVERY || 380);

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

for (const key of KEYS) {
  await page.goto(`${BASE}/#/component/${key}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  const strip = { key, capturedAt: new Date().toISOString(), base: BASE, conditions: {} };
  for (const condition of ['measured', 'refused']) {
    await setEvidence(page, condition === 'refused');
    const shot = { enter: [], loop: [] };
    for (const [name, total, every] of [['enter', ENTER_MS, ENTER_EVERY], ['loop', LOOP_MS, LOOP_EVERY]]) {
      await remount(page, key);
      shot[name] = await sample(page, key, condition === 'refused' ? Math.min(total, 700) : total, every, `${key}-${condition}-${name}`);
    }
    shot.inventory = await inventory(page, key);
    strip.conditions[condition] = shot;
  }

  writeFileSync(`${OUT}/${key}.json`, JSON.stringify(strip, null, 2));
  report(key, strip);
}

await browser.close();
console.log(`\nframes in ${OUT} — build sheets with app/verify/sheet.mjs`);

/** Put the rack's evidence switch where the condition wants it, using the operator's own
 * control rather than a URL the operator never sees. */
async function setEvidence(page, absent) {
  const now = await page.evaluate(() => document.documentElement.dataset.evidence);
  if ((now === 'absent') !== absent) {
    await page.click('[data-control="evidence"]');
    await page.waitForTimeout(450);
  }
}

/** Force a fresh specimen and align the sampler to it.
 *
 * Hash navigation away and back is what a person pressing back and forward does. It
 * commits a new specimen and the runtime walks it in the same effect that starts the
 * motion, so the strip begins at the frame the page began with. Waiting two frames after
 * each hop is enough for React to commit and for the layout effect to write the markup;
 * waiting longer would miss the entrance, which is the thing being looked at.
 */
async function remount(page, key) {
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(140);
  await page.evaluate((k) => { location.hash = `#/component/${k}`; }, key);
  await page.waitForTimeout(20);
}

async function sample(page, key, totalMs, everyMs, prefix) {
  const box = await specimenBox(page, key);
  if (!box) return [];

  const frames = [];
  const clock = await page.evaluate(() => performance.now());
  const started = Date.now();
  let previous = null;
  let index = 0;

  while (Date.now() - started < totalMs) {
    // One round trip for the clock and the animation count, taken at the same instant,
    // then the shot: reading the count afterwards would report a different instant than
    // the one being captured.
    const at = await page.evaluate(() => ({ t: performance.now(), animations: document.getAnimations().length }));
    const file = `${OUT}/${prefix}-${String(index).padStart(2, '0')}.png`;
    await page.screenshot({ path: file, clip: box });
    const bytes = digest(file);
    frames.push({
      t: Math.round(at.t - clock),
      animations: at.animations,
      changed: previous === null ? false : bytes !== previous,
      file: file.split('/').pop(),
    });
    previous = bytes;
    index += 1;
    const due = started + everyMs * index;
    const wait = due - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
  }
  return frames;
}

async function specimenBox(page, key) {
  return page.evaluate((k) => {
    const node = document.querySelector('[data-specimen-view]')
      || document.querySelector(`[data-specimen-view="${k}"], [data-specimen-view="${k}-measured"]`);
    if (!node) return null;
    const r = node.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    return {
      x: Math.max(0, Math.floor(r.x)),
      y: Math.max(0, Math.floor(r.y)),
      width: Math.min(Math.ceil(r.width), 1280 - Math.max(0, Math.floor(r.x))),
      height: Math.ceil(r.height),
    };
  }, key);
}

async function inventory(page) {
  return page.evaluate(() => {
    const view = document.querySelector('[data-specimen-view]');
    if (!view) return null;
    const marks = [...view.querySelectorAll('[data-motion]')].map((el) => ({
      kind: el.getAttribute('data-motion'),
      reason: el.getAttribute('data-still-reason') || null,
      carrier: el.getAttribute('class') || el.tagName,
    }));
    return {
      evidence: document.documentElement.dataset.evidence,
      marks,
      still: marks.filter((m) => m.kind === 'still').length,
      moving: marks.filter((m) => m.kind !== 'still' && m.kind !== 'intent').length,
      height: Math.round(view.getBoundingClientRect().height),
    };
  });
}

function digest(file) {
  return createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 12);
}

function report(key, strip) {
  for (const [condition, shot] of Object.entries(strip.conditions)) {
    const span = (frames) => (frames.length ? frames[frames.length - 1].t : 0);
    const changed = (frames) => frames.filter((f) => f.changed).length;
    console.log(`${key.padEnd(15)} ${condition.padEnd(9)}`
      + ` enter ${changed(shot.enter)}/${shot.enter.length} changed over ${span(shot.enter)}ms`
      + ` · loop ${changed(shot.loop)}/${shot.loop.length} over ${span(shot.loop)}ms`
      + ` · marks=${shot.inventory?.marks?.length ?? '?'} moving=${shot.inventory?.moving ?? '?'} still=${shot.inventory?.still ?? '?'} h=${shot.inventory?.height ?? '?'}`);
  }
}
