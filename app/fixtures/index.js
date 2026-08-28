// Every fixture in the library, in one place, keyed by component.
//
// The bright model is the only one written. The dark one is computed from it by
// `darkOf`, which is why a visitor flipping the evidence toggle is watching one
// model lose a number rather than watching a different picture -- and why
// `test/app-fixtures.test.mjs` can assert the two cannot drift.

import { FIELD_FIXTURES } from './field.js';
import { RIVER_FIXTURES } from './river.js';
import { TELEGRAPH_FIXTURES } from './telegraph.js';
import { THREAD_FIXTURES } from './thread.js';
import { ORGANISM_FIXTURES } from './organism.js';
import { DECISION_FIXTURES } from './decision.js';
import { AGENTS_FIXTURES } from './agents.js';
import { INSTRUMENT_FIXTURES } from './instruments.js';
import { darkOf } from './project.js';

export const FIXTURES = {
  ...FIELD_FIXTURES,
  ...RIVER_FIXTURES,
  ...TELEGRAPH_FIXTURES,
  ...THREAD_FIXTURES,
  ...ORGANISM_FIXTURES,
  ...DECISION_FIXTURES,
  ...AGENTS_FIXTURES,
  ...INSTRUMENT_FIXTURES,
};

export const FIXTURE_KEYS = Object.keys(FIXTURES);

/** The bright model, exactly as the family file wrote it. */
export function brightFor(key) {
  const fixture = FIXTURES[key];
  if (!fixture) throw new Error(`no fixture for component '${key}'`);
  return fixture.model;
}

/** The fields that carry a measurement, normalised so a caller can drive a
 * control from them without knowing which ones substitute `[]` for `null`. */
export function fieldsFor(key) {
  const fixture = FIXTURES[key];
  if (!fixture) throw new Error(`no fixture for component '${key}'`);
  return (fixture.fields || []).map((field) => (typeof field === 'string'
    ? { path: field, value: null }
    : { path: field.path, value: field.value === undefined ? null : field.value }));
}

/** The model with the evidence removed. */
export function darkFor(key) {
  return darkOf(brightFor(key), fieldsFor(key));
}

/** The model the app renders for a given evidence state. `all` is the switch on
 * the rack; a single field is what the per-field control strips. */
export function modelFor(key, { evidence = true, strip = null } = {}) {
  const model = brightFor(key);
  if (evidence) return model;
  if (!strip) return darkFor(key);
  const fields = fieldsFor(key).filter((field) => strip.includes(field.path));
  return darkOf(model, fields);
}

/** Valid JavaScript, not a paraphrase: this is the string copy-to-use hands a
 * visitor, and the test that asserts it equals the real call is the same one
 * that runs it back through the component. */
export function callFor(key, model = brightFor(key)) {
  return `${key}(${JSON.stringify(model, null, 2)})`;
}
