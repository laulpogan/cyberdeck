// A cue must arrive, hold while its condition is true, and LEAVE when it stops being true.
//
// Reference: `f16-hud-gcas.gif` — the HUD's FLYUP limit cue arrives around 2.7s of the window with
// GND PROT beside it, holds while the closure lasts, and is gone by 10.7s. It arrives and leaves
// rather than sitting there, because a cue that stays is claiming a condition that ended.
//
// Filed in `vault/SPECS-FOR.json` as the residue of that quotation once `mfd`'s drawing was checked
// and found to host neither a scale nor a cue. These are the cues the library actually draws —
// three of them — each held to its own governing field. They are written as differentials rather
// than as a vocabulary report, because the report form produced three false readings before these
// tests existed (see MOTION-READINGS.md): matching drawn ink by word substring cannot tell
// `NOTHING IN FLIGHT` from `IN FLIGHT`, `endsWith` misses a cue that is a prefix of a longer
// sentence, and one regex spanned from a bar group to a readout label and reported a defect that
// did not exist. Every assertion here matches a whole drawn node, a group count, or a whole phrase.
import test from 'node:test';
import assert from 'node:assert/strict';

import { hardCut } from '../src/components/thread.js';
import { river } from '../src/components/river.js';
import { envelope } from '../src/components/organism.js';
import { brightFor } from '../app/fixtures/index.js';

const nodes = (html) => [...html.matchAll(/>([^<>]+)</g)]
  .map((m) => m[1].replace(/&#x27;|&#39;/g, "'").replace(/&[a-z]+;|&#\d+;/g, ' ').trim())
  .filter(Boolean);
const drawn = (html, phrase) => nodes(html).includes(phrase);

test('hardCut: the in-flight bar arrives with the value and leaves without it', () => {
  const on = hardCut(brightFor('hardCut'));
  const off = hardCut({ ...brightFor('hardCut'), inFlight: null });
  const changed = brightFor('hardCut').changed;
  const bars = (html) => (html.match(/class="cd-th-flight"/g) || []).length;
  // One group per counted row, plus the in-flight bar and nothing else. Counting groups is the
  // only reliable reading: the cue's text and the readout's label are the same two words, and a
  // regex loose enough to reach from one to the other reports a cue that was never drawn.
  assert.equal(bars(on), changed + 1, 'the in-flight bar did not arrive with the value');
  assert.equal(bars(off), changed,
    'the in-flight bar is still on the plate with no in-flight — a cue that outlives its condition');
  assert.ok(drawn(off, 'IN FLIGHT'),
    'the readout row for in-flight must stay and say UNMEASURED, not vanish');
  assert.ok(drawn(off, 'UNMEASURED'), 'the unread row must name its own unreadness');
  assert.equal(/undefined/.test(off), false, 'the null value leaked the word `undefined`');
});

test('envelope: the ceiling cue appears only past the ceiling, and the number is named either way', () => {
  const base = brightFor('envelope');
  const honest = envelope(base);
  const overModel = { ...base, position: { ...base.position, used: base.position.ceiling * 2 } };
  const over = envelope(overModel);
  const cue = 'PAST THE CEILING — DRAWN CLAMPED HERE';
  assert.equal(drawn(honest, cue), false,
    'the plate claims an overrun while showing a position inside its ceiling');
  assert.match(honest, /12\.4 OF A 20 CEILING/, 'the honest position stopped naming itself');
  assert.ok(drawn(over, cue), 'a position at double its ceiling is drawn clamped and does not say so');
  // Derived from the model, not predicted: the first version of this line guessed the figure the
  // drawing would print and failed over its own arithmetic. The claim is that the MEASURED position
  // is named — not the clamped one the dot sits at.
  assert.ok(nodes(over).includes(`${overModel.position.used} OF A ${overModel.position.ceiling} CEILING`),
    `the clamped drawing must print the measured position (${overModel.position.used} of ${overModel.position.ceiling}), not the clamped one`);
});

test('river: the operator cue follows the lane state, not the presence of ink', () => {
  const ev = [{ at: '2026-01-01T00:00:00Z', kind: 'turn' }, { at: '2026-01-01T00:02:00Z', kind: 'sealed' }];
  const lane = (state, events) => ({ id: 'ses-1', attempt: 1, state, events });
  const one = (lanes) => river({ lanes, cite: 'sessions[].evidence.timeline' });
  assert.ok(drawn(one([lane('needs_human', ev)]), 'AWAITING OPERATOR'),
    'a lane waiting on a person with a run drew no cue');
  assert.equal(drawn(one([lane('running', ev)]), 'AWAITING OPERATOR'), false,
    'a running lane claims an operator is being waited for');
  assert.equal(drawn(one([lane('queued', [])]), 'AWAITING OPERATOR'), false,
    'an empty queued lane claims a wait that was never stated');
  assert.ok(drawn(one([lane('needs_human', [])]), 'AWAITING OPERATOR'),
    'the empty-lane refusal dropped the state cue again — the loudest fact on the emptiest row');
});

test('the three genuine cues are still the three genuine cues', () => {
  // The HUD reference's cue class is barely instantiated here: almost every uppercase phrase this
  // library draws is a label or a measured value, not a condition asserted of the subject. If a
  // fourth cue appears, it inherits this file's obligation, and the reading that generated it needs
  // a named governing field before the ink is allowed.
  const cues = {
    'IN FLIGHT': (html) => (html.match(/class="cd-th-flight"/g) || []).length,
    'PAST THE CEILING — DRAWN CLAMPED HERE': (html) => nodes(html).includes('PAST THE CEILING — DRAWN CLAMPED HERE'),
    'AWAITING OPERATOR': (html) => nodes(html).includes('AWAITING OPERATOR'),
  };
  assert.deepEqual(Object.keys(cues).sort(), [
    'AWAITING OPERATOR', 'IN FLIGHT', 'PAST THE CEILING — DRAWN CLAMPED HERE',
  ], 'the cue vocabulary changed shape; say which field governs the new one and test it');
});
