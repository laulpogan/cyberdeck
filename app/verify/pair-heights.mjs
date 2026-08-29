/* Does throwing the rack switch move the page?

   The drawing gate asks which *pictures remain* — that is the sharp half of "a refusal keeps its
   space". This asks the other question, the one an operator feels: the specimen is 199px of board
   and then it is 571px of refusal bands, and everything below the card on the page jumps 372px
   because somebody changed an epistemic state. Nothing violates the floor; the layout moved anyway.

   The measured states and the refused states are read from the same page with the same probe
   (`drawing.mjs`'s `DRAWING_PROBE`), so the numbers are the browser's, not the source's. Deltas are
   reported in both directions — a refusal that shrinks is `gauge`'s and `killmail`'s version of the
   same offence.

     BASE=http://127.0.0.1:5299/ node app/verify/pair-heights.mjs [OUT=app/verify/PAIR-HEIGHTS.md]
*/
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

import { DRAWING_SELECTOR, DRAWING_PROBE, GROWTH_TOLERANCE_PX } from './drawing.mjs';
import { COMPONENT_KEYS } from '../src/registry/index.js';

// Default port comes from this tree's vite.config.js, and a server identifying another checkout
// is refused before anything is measured. See app/verify/app-identity.mjs.
import { assertServedThisCheckout, defaultBase } from './app-identity.mjs';
const BASE = process.env.BASE || defaultBase();
const OUT = process.env.OUT || '';
// The same allowance the gate uses, imported rather than restated, so the report cannot
// quietly disagree with the rule it is measuring.
const TOLERANCE = GROWTH_TOLERANCE_PX;

const probe = async (page) => page.evaluate(eval(DRAWING_PROBE), DRAWING_SELECTOR);
// The gate pairs `[data-specimen-view]` rects, so this does too: the rule is about the
// box the page laid out. The probe's own `height` is the drawing region, which is a
// different question and belongs to the drawing gate.
const views = (page) => page.evaluate(() => [...document.querySelectorAll('[data-specimen-view]')]
  .map((n) => ({ label: n.getAttribute('data-specimen-view') || '?',
                 h: Math.round(n.getBoundingClientRect().height) })));

const browser = await chromium.launch();
await assertServedThisCheckout(browser, BASE, 'app/verify/pair-heights.mjs');
const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
const rows = [];

for (const key of COMPONENT_KEYS) {
  console.error(`· ${key}`);
  await page.goto(`${BASE}#/component/${key}`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  // `[data-specimen-view]` is the app's mount point; the `data-specimen` figure is
  // the library's. Some specimens are drawn without a card (the globe paints a
  // canvas, the river is a lane, the gauge is a dial), so the mount point is the
  // honest thing to wait for — a page with no drawing at all is still a finding, and
  // it is recorded as one below rather than skipped silently.
  const present = await page.locator('[data-specimen-view]').count().catch(() => 0);
  if (!present) { console.error(`NO SPECIMEN VIEW for /component/${key}`); continue; }
  await page.waitForTimeout(260);
  const on = await probe(page);
  const onViews = await views(page);
  await page.click('[data-control="evidence"]');
  await page.waitForTimeout(320);
  const off = await probe(page);
  const offViews = await views(page);

  const offByLabel = new Map(off.map((d) => [d.label, d]));
  for (const measured of on) {
    const refused = offByLabel.get(measured.label);
    if (!refused) continue;
    // The specimen view, not the sum of drawing regions: the rule this measures is about
    // the space the page laid out, and a text-led card's picture is smaller than its
    // space. The drawing gate owns the region question.
    const byLabel = (list) => list.find((v) => v.label === measured.label);
    const hOn = byLabel(onViews)?.h ?? Math.round(measured.height);
    const hOff = byLabel(offViews)?.h ?? Math.round(refused.height);
    rows.push({ key, hOn, hOff, delta: hOff - hOn,
      kindsOn: measured.regions.map((r) => r.kind).join('+'),
      kindsOff: refused.regions.map((r) => r.kind).join('+') });
  }
}

rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
const grew = rows.filter((r) => r.delta > TOLERANCE);
const shrank = rows.filter((r) => r.delta < -TOLERANCE);

const lines = ['# Does the switch move the page?', '',
  `Measured against the running app at 1280px, all ${COMPONENT_KEYS.length} components: the`,
  '`[data-specimen-view]` box on both sides of the rack\'s own evidence switch,',
  '`app/verify/pair-heights.mjs`. The rule is **asymmetric**:', '',
  `> A refusal may be **shorter** than the measurement — an unanswered list has one line in it,`,
  `> and padding it out would be inventing questions. It may not be **taller** by more than`,
  `> ${TOLERANCE}px, which is one refusal sentence: the only thing a refusal is obliged to add.`,
  '',
  'Growing is ink the measurement never claimed, and it moves everything below the card because',
  'somebody changed an epistemic state. Shrinking is a quantity.',
  '',
  `**${grew.length} of ${rows.length} specimens grow past the allowance**`
  + (grew.length ? `: ${grew.map((r) => `\`${r.key}\``).join(', ')}.` : ' — none.'),
  '',
  '| component | measured | refused | growth | drawing kinds measured | refused |',
  '| --- | --- | --- | --- | --- | --- |'];
for (const r of grew) {
  lines.push(`| \`${r.key}\` | ${r.hOn}px | ${r.hOff}px | +${r.delta}px `
    + `| ${r.kindsOn} | ${r.kindsOff} |`);
}
lines.push('', '## Shrinking is allowed, and here is what it costs', '',
  `**${shrank.length} specimens are shorter refused than measured.** Each is a truthful quantity —`,
  'the container survives, there is simply less in it — but the page below still moves up, which',
  'is the trade the rule chooses deliberately: reserving the measured height would put blank space',
  'where an absence is being declared, and a reserved box reads as a quiet measurement.',
  '',
  '| component | measured | refused | shrink | why it is legitimate |',
  '| --- | --- | --- | --- | --- |');
const WHY = {
  muthur: 'one unasked prompt where four answered queries were; the console frame is kept',
  tape: 'nothing is queued, so the tape is one blank slot',
  individuation: 'one tank observed, no siblings — the row it replaces is one row',
  killmail: 'the same receipt form with the fields refused instead of filled',
  stripChart: 'the refusal caption is shorter than the four hatched rows it replaces',
};
for (const r of shrank) {
  lines.push(`| \`${r.key}\` | ${r.hOn}px | ${r.hOff}px | ${r.delta}px | ${WHY[r.key] || 'draws the same container with less in it'} |`);
}
lines.push('', `The remaining ${rows.length - grew.length - shrank.length} specimens hold within ±${TOLERANCE}px.`, '');
const report = lines.join('\n');
if (OUT) writeFileSync(OUT, report);
console.log(report);
console.log('worst offenders:');
for (const r of rows.slice(0, 8)) {
  console.log(`  ${r.key.padEnd(15)} ${String(r.hOn).padStart(5)}px -> ${String(r.hOff).padStart(5)}px`
    + `  (${r.delta > 0 ? '+' : ''}${r.delta}px)`);
}
await browser.close();
