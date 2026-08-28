import test from 'node:test';
import assert from 'node:assert/strict';

import { SPECS, FAMILIES, FAMILY_BY_ID } from '../app/registry.js';
import { FIXTURES } from '../app/fixtures/index.js';
import { copyFor } from '../app/copy.js';
import { clone, setPath, getPath } from '../app/util.js';

const specKeys = Object.keys(SPECS);

function darkModel(key) {
  return SPECS[key].controls.reduce(
    (m, c) => c.paths.reduce((mm, p) => setPath(mm, p, c.off), m),
    clone(FIXTURES[key]),
  );
}

function leaves(node, prefix = [], out = new Map()) {
  if (node === null || typeof node !== 'object') { out.set(prefix.join('.'), node); return out; }
  for (const [k, v] of Array.isArray(node)
    ? node.entries() : Object.entries(node)) {
    leaves(v, [...prefix, k], out);
  }
  return out;
}

// 'contacts[*].age_seconds' must cover the concrete leaf 'contacts.3.age_seconds'.
// With prefix=true it also covers descendants ('visionA' covers 'visionA.2.cost'),
// which is how a whole unmeasured source is allowed to go.
function patternSegments(pattern) {
  return pattern.split('.').flatMap((seg) => {
    const m = seg.match(/^(.*?)\[([*\d]+)\]$/);
    if (!m) return [seg];
    return [m[1], m[2] === '*' ? '*' : m[2]].filter((s) => s !== '');
  });
}

function patternCovers(pattern, leafPath, prefix = false) {
  const p = patternSegments(pattern);
  const l = leafPath.split('.');
  const n = prefix ? Math.min(p.length, l.length) : p.length;
  if (!prefix && p.length !== l.length) return false;
  if (prefix && p.length > l.length) return false;
  return p.slice(0, n).every((seg, i) => seg === '*'
    ? /^\d+$/.test(l[i]) : seg === l[i]);
}

test('registry and fixtures are the same closed set', () => {
  assert.deepEqual(specKeys.slice().sort(), Object.keys(FIXTURES).slice().sort());
  const familyIds = new Set(FAMILIES.map((f) => f.id));
  for (const key of specKeys) {
    assert.ok(familyIds.has(SPECS[key].family), `${key} belongs to no family`);
  }
  for (const fam of FAMILIES) {
    assert.ok(specKeys.some((k) => SPECS[k].family === fam.id), `${fam.id} has no specs`);
    assert.equal(FAMILY_BY_ID[fam.id].name, fam.name);
  }
});

test('every spec renders a string, measured and dark, twice identically', () => {
  for (const key of specKeys) {
    const fn = SPECS[key].fn;
    const a = fn(clone(FIXTURES[key]));
    const b = fn(clone(FIXTURES[key]));
    assert.equal(typeof a, 'string', key);
    assert.equal(a, b, `${key} is not deterministic from its fixture`);
    const d1 = fn(darkModel(key));
    assert.equal(d1, fn(darkModel(key)), `${key} dark render is not deterministic`);
  }
});

test('renders never leak undefined, null, or NaN into the page', () => {
  for (const key of specKeys) {
    for (const html of [SPECS[key].fn(clone(FIXTURES[key])), SPECS[key].fn(darkModel(key))]) {
      assert.ok(!/>[^<]*\bundefined\b/.test(html), `${key}: raw undefined`);
      assert.ok(!/>[^<]*\bNaN\b/.test(html), `${key}: raw NaN`);
      assert.ok(!/="(undefined|null|NaN)"/.test(html), `${key}: raw null in an attribute`);
    }
  }
});

test('dark models differ from measured only at declared control paths, set to the declared value', () => {
  for (const key of specKeys) {
    const base = leaves(FIXTURES[key]);
    const dark = leaves(darkModel(key));
    for (const [path, value] of dark) {
      if (base.has(path)) continue;
      // A declared nulling of a whole source collapses its subtree into the
      // off value; that is a shape change the control owns, not an invention.
      const owned = SPECS[key].controls.some((c) =>
        c.paths.some((p) => patternCovers(p, path) && sameValue(c.off, value)));
      assert.ok(owned, `${key}: dark model invented a field (${path}) the fixture never had`);
    }
    for (const [path, value] of base) {
      if (!dark.has(path)) {
        // A whole unmeasured source may go -- nulled or emptied -- but only
        // along a declared control path.
        const owned = SPECS[key].controls.some((c) =>
          c.paths.some((p) => patternCovers(p, path, true)));
        assert.ok(owned, `${key}: dark model deleted ${path} with no control claiming it`);
        continue;
      }
      if (sameValue(value, dark.get(path))) continue;
      const owned = SPECS[key].controls.some((c) =>
        c.paths.some((p) => patternCovers(p, path) && sameValue(c.off, dark.get(path))));
      assert.ok(owned, `${key}: dark model moved ${path} to ${JSON.stringify(dark.get(path))} with no control claiming it`);
    }
  }
});

function sameValue(a, b) {
  return a === b || (Number.isNaN(a) && Number.isNaN(b));
}

test('no control is dead: removing its evidence always changes the model', () => {
  for (const key of specKeys) {
    for (const control of SPECS[key].controls) {
      const off = control.paths.reduce(
        (m, p) => setPath(m, p, control.off), clone(FIXTURES[key]));
      assert.notDeepEqual(off, FIXTURES[key],
        `${key}: control "${control.label}" removes evidence the fixture never had`);
    }
  }
});

test('evidence removal only shrinks motion: dark marks are a subset of measured plus still', () => {
  const kinds = (html) => new Set([...html.matchAll(/data-motion="([^"]+)"/g)].map((m) => m[1]));
  for (const key of specKeys) {
    const lit = kinds(SPECS[key].fn(clone(FIXTURES[key])));
    for (const kind of kinds(SPECS[key].fn(darkModel(key)))) {
      assert.ok(kind === 'still' || lit.has(kind),
        `${key}: removing evidence produced new motion "${kind}" where measured had [${[...lit].join(',') || 'none'}]`);
    }
  }
});

test('fixtures are frozen and free of wall-clock reads', () => {
  for (const key of specKeys) {
    assert.ok(Object.isFrozen(FIXTURES[key]), `${key} fixture is not frozen`);
  }
});

test('copy-to-use names the component, the import, and the live model', () => {
  for (const key of specKeys) {
    const model = clone(FIXTURES[key]);
    const text = copyFor(SPECS[key], model);
    assert.match(text, new RegExp(
      `import \\{ ${SPECS[key].exportName} \\} from 'cyberdeck-ui/components';`), key);
    assert.match(text, new RegExp(
      `container\\.innerHTML = ${SPECS[key].exportName}\\(`), key);
    const body = text.match(/innerHTML = \w+\((\{[\s\S]*?\})\);/)[1];
    assert.deepEqual(JSON.parse(body), JSON.parse(JSON.stringify(model)),
      `${key}: pasted snippet does not carry the live model`);
    assert.match(text, /CyberdeckMotion\.start/, `${key}: snippet forgets the runtime`);
  }
});

test('util: wildcards set and read every concrete leaf', () => {
  const model = { rows: [{ n: 1 }, { n: 2 }], deep: { list: [{ x: { y: 3 } }] } };
  const dark = setPath(setPath(clone(model), 'rows[*].n', null), 'deep.list[*].x.y', 0);
  assert.deepEqual(getPath(dark, 'rows[1].n'), null);
  assert.deepEqual(getPath(dark, 'deep.list.0.x.y'), 0);
  assert.equal(model.rows[0].n, 1, 'setPath mutated the input');
});
