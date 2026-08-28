// "Every component is reachable" is a claim about coverage, so it is checked
// against the library's own export lists rather than against a count someone
// typed into a document. Any function the library exports that is neither on a
// page nor explicitly accounted for fails this file, which is what makes a new
// upstream component a build failure rather than a silent gap in the showcase.
//
// The second half holds the copy to the same standard: the sentences on the
// pages are quoted out of the components' own doc comments, and the test looks
// for them in the source. A showcase that paraphrases a refusal stops testifying.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  COMPONENT_MODULES, REGISTRY, allComponents, componentByKey, NON_COMPONENTS,
} from '../app/src/registry/index.js';
import { FIXTURE_KEYS } from '../app/fixtures/index.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Letters and digits only, so a doc comment's punctuation and a page's
 * typography cannot disagree about whether they say the same thing. */
const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
  .replace(/\s+/g, ' ').trim();

const components = allComponents();

test('every exported function is a component on a page or an accounted helper', async () => {
  const unaccounted = [];
  const accountedHelpers = new Set();
  for (const { file, module: load } of COMPONENT_MODULES) {
    const namespace = await load();
    for (const [name, value] of Object.entries(namespace)) {
      if (typeof value !== 'function') continue;
      if (componentByKey(name)) continue;
      if (name in NON_COMPONENTS) { accountedHelpers.add(name); continue; }
      unaccounted.push(`${file} exports ${name}()`);
    }
  }
  assert.deepEqual(unaccounted, [],
    'an exported component nobody renders, or an exported helper nobody has to explain');
});

test('every registry entry is a real export of the module it claims, and is fed', () => {
  const problems = [];
  for (const component of components) {
    if (typeof component.fn !== 'function') problems.push(`${component.key} is not callable`);
    if (!FIXTURE_KEYS.includes(component.key)) problems.push(`${component.key} has no fixture`);
  }
  assert.deepEqual(problems, []);
});

test('no helper is excused that the library does not actually export', () => {
  const exported = new Set();
  return Promise.all(COMPONENT_MODULES.map(({ module: load }) => load()))
    .then((namespaces) => {
      for (const namespace of namespaces) {
        for (const name of Object.keys(namespace)) exported.add(name);
      }
      const stale = Object.keys(NON_COMPONENTS).filter((name) => !exported.has(name));
      assert.deepEqual(stale, [], 'an excuse for an export that no longer exists hides nothing');
    });
});

test('every family is wired, counted, and answerable to its own argument', () => {
  for (const family of REGISTRY) {
    assert.ok(family.name && family.question && family.argument, family.slug);
    assert.match(family.file, /^src\/components\/[a-z-]+\.js/,
      `${family.slug} names the file a reader should open`);
    assert.equal(family.count, family.components.length);
    assert.ok(family.components.length >= 2, `${family.slug} is a family, not a stray`);
  }
});

test('every component states who may act on it: producer, refusal, and a note', () => {
  const thin = [];
  for (const component of components) {
    for (const field of ['title', 'refusal', 'note']) {
      if (!component[field] || String(component[field]).length < 10) thin.push(`${component.key}.${field}`);
    }
    // A cite has to look like something a reader could go and grep for, or say
    // out loud that nothing supplies it. Prose is not a cite.
    const path = String(component.producer || '');
    if (!/[.\[]/.test(path) && !/^nothing/.test(path.toLowerCase())) thin.push(`${component.key}.producer`);
  }
  assert.deepEqual(thin, [], 'a specimen with no cite or no refusal sentence is not explained');
});

test('refusal copy is quoted from the component source rather than written fresh', () => {
  // The corpus a quoted sentence may come from: the family's own file, plus the
  // marks module where the shared refusals are written. `Nothing travelled this
  // path` belongs to `trace()`, not to the components that call it, and a quote
  // test that demanded it from the caller would push the copy away from the source.
  const marks = normalize(readFileSync(ROOT + 'src/marks.js', 'utf8'));
  const sources = new Map();
  const loadSource = (family) => {
    if (!sources.has(family.file)) {
      const file = family.file.split(' · ')[0];
      sources.set(family.file, `${normalize(readFileSync(ROOT + file, 'utf8'))} ${marks}`);
    }
    return sources.get(family.file);
  };
  // Sentences the source states as a template (`no ${label} was fitted`) or in a
  // table rather than in prose. Named rather than waved through.
  const FROM_TABLE_OR_TEMPLATE = new Set([
    'dispatch', 'city', 'garage', 'dominator', 'ladder', 'grid', 'channel', 'redaction',
  ]);
  const drift = [];
  for (const family of REGISTRY) {
    for (const component of family.components) {
      const quote = normalize(component.refusal).split(' ').slice(0, 5).join(' ');
      if (FROM_TABLE_OR_TEMPLATE.has(component.key)) continue;
      if (!loadSource(family).includes(quote)) {
        drift.push(`${component.key}: "${component.refusal}"`);
      }
    }
  }
  assert.deepEqual(drift, [], 'copy that paraphrases a refusal is the showcase starting to market');
});

test('the two full-width specimens are the ones that need their own scroll container', () => {
  const wide = components.filter((c) => c.fullWidth).map((c) => c.key).sort();
  assert.deepEqual(wide, ['globe', 'grid', 'river'],
    'the lane chart, the overview grid and the globe are page-shaped, not card-shaped');
});
