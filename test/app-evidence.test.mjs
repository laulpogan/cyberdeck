// The evidence controls and the copy-to-use block, checked without a browser.
//
// Both are the parts of the showcase most likely to lie quietly: the switch can
// look like it worked while the model it handed the component was unchanged, and
// a code block can drift one field away from the specimen above it and nobody
// notices until a visitor pastes it into a file. So the state transitions are
// asserted here, and the block is parsed back out of its own text and run through
// the real component.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  emptyEvidenceState, removedFor, removedPaths, resolveModel, fieldRemoved,
  withGlobal, withField, evidenceSummary,
} from '../app/src/evidence.js';
import { copyBlock, importLine, payloadOf } from '../app/src/copy-to-use.js';
import { FIXTURE_KEYS, brightFor, darkFor, fieldsFor } from '../app/fixtures/index.js';
import { normalizeField } from '../app/fixtures/project.js';
import { allComponents } from '../app/src/registry/index.js';

const components = allComponents();

test('the rack switch produces exactly the dark model, for every component', () => {
  const off = withGlobal(emptyEvidenceState(), true);
  const offenders = [];
  for (const key of FIXTURE_KEYS) {
    const model = resolveModel(key, off);
    if (JSON.stringify(model) !== JSON.stringify(darkFor(key))) offenders.push(key);
    assert.equal(removedPaths(key, off).length, fieldsFor(key).length,
      `${key} reports every field missing under the switch`);
  }
  assert.deepEqual(offenders, [], 'the switch means the same thing everywhere');
});

test('nothing removed is the bright model, byte for byte, including an empty set for an unknown key', () => {
  const state = emptyEvidenceState();
  for (const key of FIXTURE_KEYS) {
    assert.equal(JSON.stringify(resolveModel(key, state)), JSON.stringify(brightFor(key)));
  }
  assert.deepEqual(removedFor(state, 'not_a_component'), []);
});

test('one field control moves one field and leaves the rest of the picture alone', () => {
  const field = normalizeField(fieldsFor('mfd')[0]).path;
  const state = withField(emptyEvidenceState(), 'mfd', field);
  assert.equal(fieldRemoved('mfd', field, state), true);
  assert.equal(evidenceSummary('mfd', state).removed, 1);
  assert.notEqual(JSON.stringify(resolveModel('mfd', state)), JSON.stringify(brightFor('mfd')));
  assert.deepEqual(removedFor(state, 'triVision'), [], 'another component is untouched');

  const back = withField(state, 'mfd', field);
  assert.deepEqual(removedFor(back, 'mfd'), [], 'the same control puts it back');
  assert.equal(JSON.stringify(resolveModel('mfd', back)), JSON.stringify(brightFor('mfd')));
});

test('a control that was never offered throws instead of doing nothing', () => {
  assert.throws(() => withField(emptyEvidenceState(), 'mfd', 'not_a_field'),
    /is not a field of 'mfd'/);
});

test('the rack switch hides the per-field sets rather than overwriting them', () => {
  let state = withField(emptyEvidenceState(), 'collar', 'elapsedSeconds');
  state = withGlobal(state, true);
  assert.equal(evidenceSummary('collar', state).scope, 'global');
  assert.equal(fieldRemoved('collar', 'waitingSeconds', state), true,
    'under the switch everything reads as missing');
  state = withGlobal(state, false);
  assert.deepEqual(removedFor(state, 'collar'), ['elapsedSeconds'],
    'flipping the switch back lands where the visitor was');
  assert.equal(fieldRemoved('collar', 'waitingSeconds', state), false);
});

test('every field of every component is strippable, and stripping all of them is the dark model', () => {
  for (const component of components) {
    const paths = fieldsFor(component.key).map((field) => normalizeField(field).path);
    let state = emptyEvidenceState();
    for (const path of paths) state = withField(state, component.key, path);
    assert.equal(evidenceSummary(component.key, state).removed, paths.length,
      `${component.key} reports all of its fields missing`);
    assert.equal(JSON.stringify(resolveModel(component.key, state)),
      JSON.stringify(darkFor(component.key)),
      `${component.key} with its fields removed is the derived dark model`);
  }
});

test('copy-to-use is the real import and the real call, for the model on screen', () => {
  for (const component of components) {
    const model = brightFor(component.key);
    const block = copyBlock(component.key, model);
    assert.equal(block.split('\n')[0], importLine(component.key));
    assert.match(block, new RegExp(`\\n\\n${component.key}\\(`), 'the call follows a blank line');
    assert.ok(block.includes(`${component.key}(`));

    // Parsed back out of the text a visitor would copy, then handed to the real
    // component: if the block and the specimen ever disagree, this fails.
    const pasted = payloadOf(component.key, block);
    assert.deepEqual(pasted, model, `${component.key} block carries the model on screen`);
    assert.equal(component.fn(pasted), component.fn(model),
      `${component.key} renders the same thing from the pasted block`);
  }
});

test('a stripped model changes the copy-to-use block too', () => {
  const state = withField(emptyEvidenceState(), 'collar', 'elapsedSeconds');
  const model = resolveModel('collar', state);
  const block = copyBlock('collar', model);
  assert.match(block, /"elapsedSeconds": null/);
  assert.doesNotMatch(block, /"elapsedSeconds": 9400/);
  assert.deepEqual(payloadOf('collar', block).elapsedSeconds, null);
});
