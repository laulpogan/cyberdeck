// The evidence state, as data.
//
// The rack's switch and a specimen's per-field controls are the same control at
// two scopes, so the state has to be one thing: a global claim ("nothing on this
// page was supplied") and a per-component set of fields ("this one is missing").
// Keeping it in plain functions means the page that renders a component and the
// test that checks what the page rendered ask the same question.
//
// The global switch does not overwrite the per-field sets -- flipping evidence back
// on puts a visitor back where they were, which is what makes it safe to pull the
// whole rug as a demonstration.

import { brightFor, fieldsFor } from '../fixtures/index.js';
import { darkOf } from '../fixtures/project.js';

/** Fresh state for a page load: everything present. */
export function emptyEvidenceState() {
  return { globalOff: false, perKey: {} };
}

/** The fields removed for one component by its own controls. */
export function removedFor(state, key) {
  return (state.perKey && state.perKey[key]) || [];
}

/** Every field currently missing from one specimen: all of them under the rack
 * switch, otherwise whichever its own controls have taken away. */
export function removedPaths(key, state) {
  const fields = fieldsFor(key);
  if (state.globalOff) return fields;
  const chosen = new Set(removedFor(state, key));
  return fields.filter((field) => chosen.has(field.path));
}

/** The model the specimen renders right now. Nothing removed is the bright model
 * byte for byte. The order the fixture declared its fields in is preserved, so a
 * parent field (`panes`) and a child field (`panes[].value`) cannot disagree about
 * which of them applied last. */
export function resolveModel(key, state) {
  const removed = removedPaths(key, state);
  if (!removed.length) return brightFor(key);
  return darkOf(brightFor(key), removed);
}

/** Is this particular field currently missing? */
export function fieldRemoved(key, path, state) {
  return removedPaths(key, state).some((field) => field.path === path);
}

/** The rack switch. It owns no per-field set, so nothing is lost by using it. */
export function withGlobal(state, globalOff) {
  return { ...state, globalOff };
}

/** Toggle one field of one component, and only that. An unknown path throws
 * rather than being ignored: a control that silently does nothing is how a demo
 * starts lying about what it just did. */
export function withField(state, key, path) {
  const known = fieldsFor(key).map((field) => field.path);
  if (!known.includes(path)) throw new Error(`'${path}' is not a field of '${key}'`);
  const chosen = new Set(removedFor(state, key));
  if (chosen.has(path)) chosen.delete(path);
  else chosen.add(path);
  return { ...state, perKey: { ...state.perKey, [key]: [...chosen] } };
}

/** How much of the picture is missing, for the line that says so. */
export function evidenceSummary(key, state) {
  const total = fieldsFor(key).length;
  const removed = removedPaths(key, state);
  return {
    total,
    removed: removed.length,
    scope: state.globalOff ? 'global' : (removed.length ? 'field' : 'none'),
    label: total === 0
      ? 'nothing to strip: this specimen refuses whatever it is given'
      : removed.length === 0
        ? `all ${total} measurement${total === 1 ? '' : 's'} supplied`
        : `${removed.length} of ${total} removed`,
  };
}
