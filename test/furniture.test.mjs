/** The survey grid's lesson, held as a gate: furniture holds still.
 *
 * `vault/SPECS.md`, off a verified reference: an orange grid with fixed corner labels in which
 * only the contact and a lit region change, four of twelve grid cells never moving at all. This
 * library has been caught three times putting `trace(true)` on an axis, a threshold rule and a
 * sightline — furniture drawing itself as though something had travelled it — and the fourth
 * (`esperDive`, 2RO5SN-era) was found by this audit rather than by a browser, which is the point
 * of writing it as a string-level claim.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audit, marked } from '../app/verify/furniture.mjs';

test('no axis, frame, track, label or legend carries a movement', () => {
  const offenders = audit();
  assert.deepEqual(offenders.map((r) => `${r.key}.${r.cls} (${r.kind})`), [],
    'marks sit on furniture: the drawing moved where only a measurement should');
});

test('the audit can see a mark at all', () => {
  // An audit whose regexes quietly stopped matching would report a clean library forever, so
  // silence has to be earned: a marked element is invented, fed to the same parser, and named.
  const seen = marked('<g class="cd-fd-axis" data-motion="trace"></g>');
  assert.deepEqual(seen, [{ tag: 'g', kind: 'trace', cls: 'cd-fd-axis' }]);
});
