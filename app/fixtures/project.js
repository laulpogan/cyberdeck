// Turning a bright model into a dark one.
//
// The dark variant of every fixture is *derived*, never written. A second
// hand-authored model drifts from the first within a fortnight -- some field
// gets added to one and not the other, and the "with no evidence" column starts
// showing a different component than the "with evidence" column. So there is one
// model, a list of which fields carry the measurement, and this function.
//
// It only ever removes. A field named in the list must already exist on the
// bright model with a value (asserted in `test/app-fixtures.test.mjs`), because
// nulling something that was never there is how a fixture ends up claiming a
// measurement the model does not have.

/** A structural copy: plain objects and arrays only, everything else kept as
 * given. Fixtures are data, so this is enough and it stays honest about it. */
export function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object' && value.constructor === Object) {
    const out = {};
    for (const [key, entry] of Object.entries(value)) out[key] = clone(entry);
    return out;
  }
  return value;
}

/** `cells[].health` → ['cells', 'health']; the `[]` means every element. */
export function parsePath(path) {
  return String(path).split('.').map((segment) => {
    const each = segment.endsWith('[]');
    return { name: each ? segment.slice(0, -2) : segment, each };
  });
}

function readAt(node, steps, index) {
  if (node === null || node === undefined) return undefined;
  const step = steps[index];
  if (!step) return node;
  const target = step.name ? node[step.name] : node;
  if (target === undefined || target === null) return target;
  if (step.each) {
    if (!Array.isArray(target)) return undefined;
    return target.map((entry) => readAt(entry, steps, index + 1));
  }
  return readAt(target, steps, index + 1);
}

/** Set `path` to `value` everywhere it lands. Returns whether anything was hit. */
function applyAt(root, path, value) {
  const steps = parsePath(path);
  let hit = false;
  const walk = (node, index) => {
    const step = steps[index];
    if (!step) return;
    const target = step.name ? node[step.name] : node;
    if (target === undefined || target === null) return;
    if (step.each) {
      if (!Array.isArray(target)) return;
      for (const entry of target) walk(entry, index + 1);
      return;
    }
    if (index === steps.length - 1) {
      if (target !== null && target !== undefined) hit = true;
      node[step.name] = value;
      return;
    }
    walk(target, index + 1);
  };
  walk(root, 0);
  return hit;
}

/** A field is either a path -- remove it, which means `null` -- or a path with
 * the value the producer would have sent instead. The second form exists because
 * some components treat *no population* as the missing measurement and would
 * throw on `null` (`loopDeviation` reads `observed.length`). Substituting `[]`
 * there is still a subtraction: the test asserts the dark model contains no key
 * and no value the bright model did not have. */
export function normalizeField(field) {
  if (typeof field === 'string') return { path: field, value: null };
  return { path: field.path, value: field.value === undefined ? null : field.value };
}

/** The dark model: `model` with every field in `fields` removed. */
export function darkOf(model, fields = []) {
  const dark = clone(model);
  for (const field of fields) applyAt(dark, normalizeField(field).path, normalizeField(field).value);
  return dark;
}

/** True when `path` resolves to a value on `model` -- used to prove the dark
 * variant is a subtraction and not a story. */
export function hasValue(model, path) {
  const steps = parsePath(path);
  const value = readAt(model, steps, 0);
  const found = (v) => v === null || v === undefined
    ? false
    : (Array.isArray(v) ? v.some(found) : true);
  return found(value);
}

/** Every key of `dark` must exist in `bright` with the same or a null value.
 * Returns the offending paths, which the test asserts are none. */
export function addedOrChanged(bright, dark, prefix = '', allowances = []) {
  const allowed = (path, value) => allowances.some((entry) => entry.path === path
    && deepEqual(entry.value, value));
  const problems = [];
  const brightIsObject = bright && typeof bright === 'object';
  if (!brightIsObject) {
    if (dark !== null && dark !== bright) problems.push(prefix || '(root)');
    return problems;
  }
  if (Array.isArray(bright)) {
    if (!Array.isArray(dark)) return [prefix || '(root)'];
    if (dark.length > bright.length) problems.push(`${prefix}[length]`);
    dark.forEach((entry, i) => {
      problems.push(...addedOrChanged(bright[i], entry, `${prefix}[${i}]`, allowances));
    });
    return problems;
  }
  if (!dark || typeof dark !== 'object') {
    // A declared substitution is legal only at the exact path the fixture named.
    return allowed(prefix, dark) ? [] : [prefix || '(root)'];
  }
  for (const [key, value] of Object.entries(dark)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!(key in bright)) { problems.push(path); continue; }
    if (value === null) continue;
    if (allowed(path, value)) continue;
    // `doors[].state` stands for every element of the array it names.
    const bracketed = path.replace(/\[\d+\]/g, '[]');
    if (allowed(bracketed, value)) continue;
    problems.push(...addedOrChanged(bright[key], value, path, allowances));
  }
  return problems;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
