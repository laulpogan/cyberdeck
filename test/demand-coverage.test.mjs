// Every reference that names a component owes a checkable closure.
//
// A for-list entry in `vault/SPECS-FOR.json` is a claim: this verified picture is what the component is
// built against, and the reading says in prose what it demands. Prose closures are the drift hazard — a
// session ends, the next one inherits a summary, and nobody can tell "we asserted that" from "we meant
// to". So each named target resolves here to artifacts that must exist and must say what they claim:
// a gauntlet row that asserts, or a test block that renders the component and holds the claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (f) => fileURLToPath(new URL(f, import.meta.url));
const SPECS_FOR = JSON.parse(readFileSync(here('../vault/SPECS-FOR.json'), 'utf8'));
const LEDGER = JSON.parse(readFileSync(here('../vault/DEMANDS.json'), 'utf8')).demands;
const ROWS = JSON.parse(readFileSync(here('../vault/GAUNTLET.json'), 'utf8')).gaps;
const byId = new Map(ROWS.map((r) => [r.id, r]));
const testCache = new Map();
const testFile = (f) => {
  if (!testCache.has(f)) testCache.set(f, readFileSync(here(`../${f}`), 'utf8'));
  return testCache.get(f);
};

const NAMED = new Set();
for (const [file, rec] of Object.entries(SPECS_FOR)) {
  if (file.startsWith('_')) continue;
  for (const c of rec.for || []) NAMED.add(c);
}

test('every component a reference names is in the demand ledger', () => {
  const missing = [...NAMED].filter((c) => !LEDGER[c]).sort();
  assert.deepEqual(missing, [], `${missing.length} named target(s) carry no closure — a citation with no `
    + `artifact behind it is the difference between a vault and a mood board: ${missing.join(', ')}`);
});

test('the ledger does not invent targets nobody quoted', () => {
  const orphans = Object.keys(LEDGER).filter((c) => !NAMED.has(c)).sort();
  assert.deepEqual(orphans, [], `${orphans.join(', ')} are in the ledger but in no for-list: either the `
    + `quotation was withdrawn (then the closure goes with it) or a for-list entry was lost`);
});

test('a closure names an artifact that exists and asserts', () => {
  for (const [target, entry] of Object.entries(LEDGER)) {
    assert.ok(Array.isArray(entry.closedBy) && entry.closedBy.length,
      `${target} is closed by nothing`);
    let rows = 0;
    let tests = 0;
    for (const ref of entry.closedBy) {
      if (ref.startsWith('row:')) {
        const row = byId.get(ref.slice(4));
        assert.ok(row, `${target} claims row ${ref.slice(4)}, which the gauntlet does not have`);
        assert.ok(row.assert, `${target} claims row ${ref.slice(4)}, which is held rather than asserted — `
          + `a caution the sheet draws is not a claim the tool checks`);
        rows += 1;
      } else {
        assert.ok(ref.startsWith('test:'), `${target}'s closure "${ref}" is neither row: nor test:`);
        const [, file, title] = ref.match(/^test:([^|]+)\|([\s\S]*)$/) || [];
        assert.ok(file && title,
          `${target}'s closure "${ref}" must read test:<path>|<the test's own title>`);
        assert.ok(existsSync(here(`../${file}`)), `${target} claims ${file}, which does not exist`);
        assert.ok(testFile(file).includes(`'${title}'`) || testFile(file).includes(`"${title}"`),
          `${target} claims ${file} asserts "${title}", and no test in that file is called that. A closure `
          + `has to name the assertion, not the neighbourhood it lives in.`);
        tests += 1;
      }
    }
    assert.ok(rows + tests > 0, target);
  }
});

test('a closure states a demand rather than a label', () => {
  const thin = Object.entries(LEDGER)
    .filter(([, e]) => !e.claim || e.claim.trim().length < 60)
    .map(([c]) => c);
  assert.deepEqual(thin, [], `${thin.join(', ') || 'every'} closure has to say in a sentence what the `
    + `reference demands of the component, or the check verifies a word instead of a claim`);
});

test('every asserted row also closes something in the ledger', () => {
  const claimed = new Set(Object.values(LEDGER).flatMap((e) => e.closedBy.filter((r) => r.startsWith('row:'))));
  // A row whose component is quoted by some reference has to be named by that component's closure. A row
  // whose component nobody quotes is the other honest case — a borrowed measurement — and the row already
  // has to have filed itself as `origin` for that; if it has not, it is asserting a claim no reference
  // asked for and no ledger entry owns, which is exactly how a gauntlet grows measurements nobody wanted.
  const adrift = ROWS
    .filter((r) => r.assert && r.component && NAMED.has(r.component) && !claimed.has(`row:${r.id}`))
    .map((r) => r.id);
  const undeclaredBorrows = ROWS
    .filter((r) => r.assert && r.component && !NAMED.has(r.component) && r.referenceRelation !== 'origin')
    .map((r) => `${r.id} (${r.component})`);
  assert.deepEqual(undeclaredBorrows, [], `${undeclaredBorrows.join(', ')} asser${undeclaredBorrows.length === 1 ? 'ts' : 't'} a component no `
    + `reference is quoted for, without filing itself as origin: say where the demand came from, or drop the row`);
  assert.deepEqual(adrift, [], `${adrift.join(', ')} asser${adrift.length === 1 ? 'ts' : 't'} something no `
    + `reference is quoted for: the row is real work whose reason was never written down, which is how a `
    + `gauntlet accumulates measurements nobody asked for`);
});
