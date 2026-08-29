/* Does the radar's ink run on the radar's own clock?

   The reading in `MOTION-READINGS.md` named the defect in one sentence: a contact's brightness was
   a typed band while a measured sweep went round it. The component now stamps each placed contact
   with a `cycle` mark on the brightness axis, spent against the producer's poll interval — the same
   interval the wedge turns on.

   "Same clock" is checkable without anybody's opinion. This script measures the animation the
   browser is actually running on each element and compares durations: if the wedge turns once per
   10s and a contact's ink spends itself over 10s, they are the same clock, and if a contact's
   duration is 150ms it is a decorative pulse wearing a poll's clothes. Then it samples opacity
   frame by frame across one full period, because a mark can be right in the DOM and invisible on
   the screen — and finally it throws the rack's evidence switch and requires the ink to stop while
   the ringed contacts stay drawn.

     BASE=http://127.0.0.1:5299/ node app/verify/sweep-clock.mjs
*/
import { chromium } from 'playwright';

// Default port comes from this tree's vite.config.js, and a server identifying another checkout
// is refused before anything is measured. See app/verify/app-identity.mjs.
import { assertServedThisCheckout, defaultBase } from './app-identity.mjs';
const BASE = process.env.BASE || defaultBase();
const KEY = process.env.KEY || 'radar';
const SAMPLE_MS = Number(process.env.SAMPLE_MS || 11000);

const PROBE = () => {
  const anim = (el) => (el.getAnimations ? el.getAnimations() : []).map((a) => ({
    duration: a.effect.getComputedTiming().duration,
    iterations: a.effect.getComputedTiming().iterations,
  }));
  const dial = document.querySelector('[data-specimen-view]');
  // The mark is on the sweep group itself, not on a child — the same element that
  // carries the wedge geometry is the one the runtime rotates.
  const wedgeEl = dial.querySelector('.cd-fd-sweep[data-motion], .cd-fd-sweep [data-motion]');
  const wedge = wedgeEl;
  const contacts = [...dial.querySelectorAll('.cd-fd-contact')].map((g) => {
    const ink = g.querySelector('[data-cycle-axis], [data-motion]');
    return {
      band: g.getAttribute('data-band'),
      pass: g.getAttribute('data-pass'),
      mark: ink.getAttribute('data-motion'),
      spent: ink.getAttribute('data-spent'),
      period: ink.getAttribute('data-period'),
      axis: ink.getAttribute('data-cycle-axis') || '',
      stillReason: ink.getAttribute('data-still-reason') || '',
      anims: anim(ink),
      opacity: Number(getComputedStyle(ink).opacity),
    };
  });
  return {
    wedge: wedge ? { mark: wedge.getAttribute('data-motion'), anims: anim(wedge) } : null,
    contacts,
  };
};

const browser = await chromium.launch();
await assertServedThisCheckout(browser, BASE, 'app/verify/sweep-clock.mjs');
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${BASE}#/component/${KEY}`, { waitUntil: 'networkidle' });

const before = await page.evaluate(PROBE);
const wedgePeriod = await page.evaluate(() => {
  const dial = document.querySelector('[data-specimen-view]');
  const w = dial.querySelector('.cd-fd-sweep[data-motion="cycle"], .cd-fd-sweep [data-motion="cycle"]');
  return w ? { period: Number(w.getAttribute('data-period')), spent: Number(w.getAttribute('data-spent')),
               dur: (w.getAnimations()[0] || { effect: { getComputedTiming: () => ({}) } })
                 .effect.getComputedTiming().duration } : null;
});
console.log(`wedge: mark=${before.wedge && before.wedge.mark} period=${wedgePeriod && wedgePeriod.period}s`
  + ` spent=${wedgePeriod && wedgePeriod.spent} first-animation=${wedgePeriod && wedgePeriod.dur}ms`);

const measured = before.contacts.filter((c) => c.pass === 'measured');
const refused = before.contacts.filter((c) => c.pass === 'refused');
for (const c of before.contacts) {
  console.log(`  ${c.pass.padEnd(8)} band=${c.band.padEnd(11)} mark=${String(c.mark).padEnd(7)}`
    + ` spent=${String(c.spent).padEnd(5)} period=${String(c.period).padEnd(5)} axis=${c.axis.padEnd(10)}`
    + ` anims=${c.anims.length}${c.anims.length ? ` dur=${c.anims[0].duration}ms` : ''}`
    + ` ${c.stillReason ? `reason="${c.stillReason}"` : ''}`);
}

const failures = [];
if (!measured.length) failures.push('no contact carries a measured pass time — nothing to compare');
// What "same clock" means, measured. The first animation is deliberately not one period long: it
// runs the REMAINING poll, so a contact last swept 6.4s ago fades for 3.6s and then re-passes on
// schedule — the same reason the poll bar uses two animations instead of a repeating tween. So the
// invariant is not equal durations at t=0, it is that each contact's elapsed plus its remaining
// fade is exactly one period of the period the wedge names, and that the wedge and the contacts
// carry the same `data-period` at all.
// `spent` is a fraction of the period, so an element's elapsed plus its remaining fade is one
// whole period — and one period means the same number for the wedge and for every contact.
const clockMs = (spent, period, dur) => Math.round(spent * period * 1000 + dur);
const wedgeClock = wedgePeriod ? clockMs(wedgePeriod.spent, wedgePeriod.period, wedgePeriod.dur) : null;
for (const c of measured) {
  if (c.mark !== 'cycle') failures.push(`a contact with a measured pass time is marked '${c.mark}'`);
  if (!c.anims.length) { failures.push('a measured contact is not animating its ink'); continue; }
  if (Number(c.period) !== (wedgePeriod && Number(wedgePeriod.period))) {
    failures.push(`contact names a ${c.period}s period against the sweep's ${wedgePeriod.period}s — two clocks`);
  }
  const contactClock = clockMs(Number(c.spent), Number(c.period), c.anims[0].duration);
  if (wedgeClock && Math.abs(contactClock - wedgeClock) > 5) {
    failures.push(`contact's elapsed + remaining fade is ${contactClock}ms against one poll of`
      + ` ${wedgeClock}ms — its ink is not running the poll the wedge is`);
  }
}
for (const c of refused) {
  if (c.anims.length) failures.push(`a contact whose pass time is refused is still animating (${c.anims.length})`);
  if (c.mark !== 'still') failures.push(`a refused contact should declare 'still', found '${c.mark}'`);
}

// Sampled opacity: the mark can be right in the DOM and invisible on screen.
const samples = await page.evaluate(async (ms) => {
  const dial = document.querySelector('[data-specimen-view]');
  const inks = [...dial.querySelectorAll('.cd-fd-contact [data-cycle-axis="brightness"]')];
  const out = inks.map(() => []);
  const start = performance.now();
  await new Promise((done) => {
    const tick = () => {
      inks.forEach((el, i) => {
        const a = el.getAnimations()[0];
        out[i].push(a ? Number((a.effect.getComputedTiming().progress ?? 0).toFixed(3))
                      : Number(getComputedStyle(el).opacity));
      });
      if (performance.now() - start < ms) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  });
  return out;
}, SAMPLE_MS);

samples.forEach((series, i) => {
  const lo = Math.min(...series), hi = Math.max(...series);
  // A sawtooth, not a breathing: the ink is spent against the remaining poll, so the *end* of the
  // sampled window must land near where the start began (the next pass), not glide up and down
  // inside the period the way `traffic`'s in-out curve does.
  const resetCount = series.slice(1).filter((p, k) => p < series[k] - 0.1).length;
  console.log(`  ink ${i}: animation progress ${lo.toFixed(2)}→${hi.toFixed(2)}, ${series.length} frames,`
    + ` ${resetCount} sawtooth resets across one period`);
  if (hi - lo < 0.5) failures.push(`contact ink ${i} spends only ${(hi - lo).toFixed(2)} of its range — a mark nobody can see`);
  if (resetCount < 1) failures.push(`contact ink ${i} never resets across a full period — it is fading once, not running the poll clock`);
});

// One measurement removed, its own refusal, the rest of the clock untouched. This is the state the
// mark was added for, and the rack switch cannot show it: the bright fixture declares `contacts`
// as well, so the global switch empties the dial instead of ringing it.
const fieldRow = 'li[data-field="contacts[].swept_ago_seconds"] button[data-control=\"field\"]';
if (await page.locator(fieldRow).count()) {
  await page.click(fieldRow);
  const dimless = await page.evaluate(PROBE);
  console.log(`pass time removed: ${dimless.contacts.length} placed, `
    + dimless.contacts.map((c) => `${c.pass}/${c.band}:${c.mark}:${c.anims.length}`).join(' '));
  if (dimless.contacts.length !== before.contacts.length) {
    failures.push(`removing only the pass time placed ${dimless.contacts.length} contacts instead of keeping`
      + ` ${before.contacts.length} — the refusal lost its space`);
  }
  if (dimless.contacts.some((c) => c.anims.length)) failures.push('ink spends itself with no pass time measured');
  if (dimless.contacts.some((c) => c.mark !== 'still')) failures.push('a contact without a pass time is not declared still');
  if (dimless.contacts.some((c) => c.band !== 'unmeasured')) failures.push('a contact with no pass time still chooses ink on the strength of a typed band word');
  const stillSweeping = await page.evaluate(() => document.querySelectorAll('[data-specimen-view] .cd-fd-sweep[data-motion="cycle"],'
    + '[data-specimen-view] .cd-fd-sweep [data-motion="cycle"]').length);
  if (!stillSweeping) failures.push('removing the pass times stopped the sweep too — one refusal for two measurements');
} else {
  failures.push('no per-field control for contacts[].swept_ago_seconds — the fixture does not declare it as evidence');
}

// The rack's own switch, last: whatever the dial decides to draw, no ink may spend itself and
// nothing may be left undeclared.
const switchLabel = await page.evaluate(() => {
  const button = document.querySelector('[data-control="evidence"]');
  button.click();
  return button.textContent.trim();
});
const off = await page.evaluate(PROBE);
console.log(`evidence off (${switchLabel}): ${off.contacts.length} placed, `
  + off.contacts.map((c) => `${c.pass}:${c.mark}:${c.anims.length}`).join(' '));
if (off.contacts.some((c) => c.anims.length)) failures.push('ink is spending itself with the evidence switched off');
if (off.wedge && off.wedge.anims.length) failures.push('the sweep is still turning with the evidence off');

await browser.close();
if (failures.length) {
  console.log('\nFAIL');
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('\n✓ the ink runs on the clock the sweep runs on, spends its measured range, resets on'
  + ' the pass, and stops on the switch while the contacts stay drawn.');
