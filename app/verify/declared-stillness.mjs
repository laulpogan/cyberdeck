/** Finding #10's instrument: is the stillness declared, or only drawn?
 *
 * A card that prints `DARK` where a placement should be has said something honest in ink,
 * and the reader sees it. But a review script — and the honesty rack, and the next agent —
 * asks the DOM, and the DOM says nothing moved here and nobody said why. `DECLARED STILL`
 * reads 0 over a deliberate refusal, which makes "we drew nothing on purpose"
 * indistinguishable from "we forgot", and an indistinguishable pair cannot be audited.
 *
 * This script renders every bright model, looks for the vocabulary of absence in the text
 * that came out, and reports whether the same specimen declares itself: a `data-refusal`
 * stamp or a `data-motion="still"` with a reason. Server-side, no browser — the marks are
 * data, which is the whole reason the contract is testable without a viewport.
 *
 *   node app/verify/declared-stillness.mjs [--write] [--json]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { allComponents } from '../../app/src/registry/index.js';
import { brightFor } from '../../app/fixtures/index.js';

/** Absence vocabulary. Each entry is a word a drawing prints in ink to say a measurement
 * is not there — harvested from the library's own refusals, not invented here. Adding a
 * word is adding a claim that the library prints it somewhere. */
export const ABSENCE_WORDS = [
  'UNMEASURED', 'UNATTRIBUTED', 'UNSUPPLIED', 'UNREACHABLE', 'UNREPORTED', 'UNSCHEDULED',
  'UNARMED', 'UNOFFERED', 'UNREAD', 'UNRESOLVED', 'UNSTATED', 'UNOWNED', 'DARK',
  'NOT REACHED', 'NOT READ', 'NOT ARMED', 'NO PROOF HISTORY', 'NO SERIES', 'NO SAMPLE',
  'NO CADENCE', 'NO CONTACT',
  'ONE SAMPLE', 'NEVER MEASURED', 'NO ENVELOPE DESCRIBED', 'NO CONTRACT PRODUCER',
  'PERMIT UNMEASURED', 'SILENCE IS NOT CONSENT', 'NO PRODUCER STANDING RECORDED',
  'MANIFEST STATE UNMEASURED', 'TURN UNMEASURED', 'DRIFT UNMEASURED', 'WINDOW LENGTH UNREPORTED',
];

/** The text that was drawn, case preserved. Lowercasing here would turn the fixture's
 * narrative — `every host, including the ones dark` — into a state word it never claims to
 * be, and the first run of this file reported `atField` as an offender for exactly that
 * reason. A drawn absence is set in caps by the component that draws it. */
const words = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'").replace(/&[a-z]+;|&#\d+;/g, ' ')
  .replace(/\s+/g, ' ');

const drawnWord = (text, word) => new RegExp(`\\b${word.replace(/ /g, '\\s+')}\\b`).test(text);

/** The rack's own dialect: a mark it counts. */
export const declares = (html) => /data-refusal="1"/.test(html)
  || (/data-motion="still"/.test(html) && /data-still-reason=/.test(html));

/** A private dialect: an attribute that names an absence, written by one component for
 * one purpose. A reviewer who knows the name can query it; the honesty rack cannot count
 * it, and `DECLARED STILL` reads 0 over it. `data-unmeasured`, `data-proof`, `data-claim`. */
const PRIVATE = /data-(?:unmeasured|proof|claim)="[^"]*"/;
export const privateFlag = (html) => (html.match(new RegExp(PRIVATE, 'g')) || [])
  .map((m) => m.replace(/="[^"]*"$/, ''));

export function audit() {
  const rows = [];
  for (const { key, fn } of allComponents()) {
    let html = '';
    try { html = fn(brightFor(key)); } catch (error) { rows.push({ key, error: error.message }); continue; }
    const text = words(html);
    const drawn = ABSENCE_WORDS.filter((w) => drawnWord(text, w));
    const flags = privateFlag(html);
    rows.push({
      key,
      drawn,
      declared: declares(html),
      privateFlags: flags,
      // The defect this exists for: an absence in ink, with neither the rack's mark nor a
      // word in the DOM that a stranger could count. A private flag is a middle state --
      // visible to whoever already knows the attribute name -- and finding #10's rule is
      // that the vocabulary is one vocabulary.
      undeclared: drawn.length > 0 && !declares(html) && !flags.length,
      privateOnly: drawn.length > 0 && !declares(html) && flags.length > 0,
    });
  }
  return rows;
}

const rows = audit();
const offenders = rows.filter((r) => r.undeclared);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 1));
} else {
  console.log('component        absence drawn                        declared in');
  for (const r of rows.filter((x) => x.drawn.length)) {
    const how = r.declared ? 'the mark' : (r.privateFlags.length ? `private: ${r.privateFlags.join(', ')}` : 'NOTHING');
    console.log(r.key.padEnd(16), r.drawn.join(' / ').slice(0, 44).padEnd(44), how);
  }
  const privateOnly = rows.filter((r) => r.privateOnly);
  console.log(`\n${offenders.length} of ${rows.filter((r) => r.drawn.length).length} draw an absence in a DOM that`
    + ` declares nothing; ${privateOnly.length} more declare it only in a private attribute:`
    + ` ${privateOnly.map((r) => r.key).join(', ') || '(none)'}.`);
}

if (process.argv.includes('--write')) {
  writeFileSync(new URL('./DECLARED-STILLNESS.md', import.meta.url), `# Declared stillness (finding #10 instrument)

Generated by \`node app/verify/declared-stillness.mjs --write\`. For every bright model whose
drawing prints a word from the absence vocabulary: does the same specimen say so in the DOM,
with \`data-refusal="1"\` or a \`data-motion="still"\` carrying a reason? Ink a reader can see and
attributes a script cannot query are two different claims, and only one of them is auditable.

| component | absence drawn | declared in DOM |
| --- | --- | --- |
${rows.filter((r) => r.drawn.length).map((r) => `| \`${r.key}\` | ${r.drawn.join(' · ')} | ${r.declared ? 'yes' : '**no**'} |`).join('\n')}

**${offenders.length} of ${rows.filter((r) => r.drawn.length).length}** specimens draw an absence and
declare nothing: \`${offenders.map((r) => r.key).join('\`, \`')}\`.
`);
  console.log('wrote app/verify/DECLARED-STILLNESS.md');
}
