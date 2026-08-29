// The costume an inert thing wears.
//
// Finding #8: a control that will not act, or a glyph that measures no cadence, drawn
// in the idiom of a live one. Both cases are decided by *shape* here, because a
// distinction that lives only in hue is gone in monochrome -- which this library already
// holds itself to everywhere else. These assertions read the stylesheet for the same
// reason the token ratchet does: the claim is about the rules that ship, and a rendered
// screenshot cannot be asserted against in a unit test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as a from '../src/components/agents.js';
import * as au from '../src/components/authority.js';

const CSS = readFileSync(fileURLToPath(new URL('../src/components/components.css',
  import.meta.url)), 'utf8');

/** The rule block for one selector, as one string. */
const rule = (selector) => {
  const at = CSS.indexOf(selector + ' {');
  assert.ok(at >= 0, `no rule block for ${selector}`);
  return CSS.slice(at, CSS.indexOf('}', at));
};

test('a granted verb is the only thing that invites the press', () => {
  const granted = rule('.cd-grant[data-grant="granted"]');
  const inert = rule('.cd-grant[data-grant="no_grant"]');
  const ceremony = rule('.cd-grant[data-grant="ceremony_required"]');
  assert.match(granted, /cursor: pointer/, 'granted says press me');
  assert.match(inert, /cursor: default/, 'no grant says do not');
  assert.match(inert, /border-style: dashed/, 'and says it in the border shape');
  assert.match(ceremony, /cursor: default/, 'ceremony will not act on one click');
  // The point of finding #8: ceremony used to differ from a live button by hue alone.
  assert.match(ceremony, /box-shadow: inset/, 'so it carries a second rule, inset');
  assert.doesNotMatch(granted, /box-shadow: inset/, 'and the live button does not');
});

test('ceremony, grant and refusal are three shapes, not three colours', () => {
  const html = au.dominator(brightDominator());
  assert.match(html, /<button[^>]*data-grant="granted"/, 'one real button');
  assert.match(html, /<span class="cd-grant" role="note"[^>]*data-grant="ceremony_required"/,
    'ceremony is inert glass, not a disabled button');
  assert.match(html, /data-grant="no_grant"/, 'and the ungranted verb is inert too');
  assert.equal((html.match(/<button/g) || []).length, 1,
    'exactly one pressable thing in the specimen');
});

test('the channel names its noise column instead of leaving a squiggle to be guessed', () => {
  const html = a.channel({ classes: a.TRUST });
  assert.match(html, /SIGNAL NOISE · AMPLITUDE, NOT CADENCE/, 'the idiom is labelled');
  assert.match(html, /TRUST CLASS/, 'both columns named');
  const rows = [...html.matchAll(/<li data-noise="(\d+)"([^>]*)>/g)];
  assert.equal(rows.length, a.TRUST.length, 'one row per class');
  assert.equal(rows.filter((r) => /data-claim="unattributed"/.test(r[2])).length, 1,
    'exactly the unattributed row carries the claim');
  assert.ok(rows.some((r) => r[1] === '0' && !/data-claim/.test(r[2])),
    'non-vacuous: a canonical row wears no refusal');
});

const brightDominator = () => ({
  // The seam has to exist before the ceremony can be reached: a verb whose mutation the
  // orchestrator does not expose is refused earlier, and correctly so. This is the
  // payload that puts all three shapes on one panel.
  env: { mode: 'act-reversible', operator: 'laul', adapter: true,
    capabilities: ['RETRY', 'TERMINATE'] },
  verbs: [
    { label: 'RETRY ATTEMPT', commandType: 'RETRY', permit: true, irreversible: false },
    { label: 'TERMINATE', commandType: 'TERMINATE', permit: true, irreversible: true },
    { label: 'PURGE EVIDENCE', commandType: 'PURGE', permit: null, irreversible: true },
  ],
});
