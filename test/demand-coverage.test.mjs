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
const BEFORE_AFTER = readFileSync(here('../app/verify/BEFORE-AFTER.md'), 'utf8');
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
  // An orphan used to have exactly two explanations, and the second one is a lie we told ourselves once
  // already: `strands` lost its quotation when remeasuring its gif found no trail at all, and the two
  // assertions in test/organism.test.mjs that close it did not therefore stop being true. Deleting a
  // checked requirement because the picture that inspired it was refused would make the library less
  // honest, not more. So a third state exists and has to be declared in words: self-derived, no picture,
  // and no for-list entry on the side.
  const orphans = Object.entries(LEDGER).filter(([c, e]) => !NAMED.has(c));
  const unargued = orphans.filter(([, e]) => !e.noReference || e.noReference.trim().length < 60)
    .map(([c]) => c).sort();
  assert.deepEqual(unargued, [], `${unargued.join(', ') || 'none'} are in the ledger but in no for-list `
    + `without a stated reason: either the quotation was withdrawn and the closure goes with it, or a `
    + `for-list entry was lost, or the demand is self-derived and has to say so in noReference`);
  const alsoQuoted = Object.entries(LEDGER).filter(([c, e]) => e.noReference && NAMED.has(c)).map(([c]) => c);
  assert.deepEqual(alsoQuoted, [], `${alsoQuoted.join(', ')} declare noReference and are still quoted in `
    + `a for-list: a demand either has a picture behind it or says it has none, and cannot have both`);
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
    .filter((r) => r.assert && r.component && NAMED.has(r.component) && r.referenceRelation !== 'self'
      && !claimed.has(`row:${r.id}`))
    .map((r) => r.id);
  const undeclaredBorrows = ROWS
    .filter((r) => r.assert && r.component && !NAMED.has(r.component) && r.referenceRelation !== 'origin'
      && r.referenceRelation !== 'self')
    .map((r) => `${r.id} (${r.component})`);
  assert.deepEqual(undeclaredBorrows, [], `${undeclaredBorrows.join(', ')} asser${undeclaredBorrows.length === 1 ? 'ts' : 't'} a component no `
    + `reference is quoted for, without filing itself as origin: say where the demand came from, or drop the row`);
  assert.deepEqual(adrift, [], `${adrift.join(', ')} asser${adrift.length === 1 ? 'ts' : 't'} something no `
    + `reference is quoted for: the row is real work whose reason was never written down, which is how a `
    + `gauntlet accumulates measurements nobody asked for`);
});

test('a self-asserted row names the change it guards, and is attributed where motion is attributed', () => {
  // The ledger above asks "what does the vault demand of the library?", and a self row answers to none of
  // it: it watches an invariant of our OWN markup — that `data-index` arrives in the order it claims —
  // usually because this branch is what created that motion. Those rows are legitimate, and they are also
  // the easiest kind to accumulate, because nobody had to want one. So they answer to the other ledger this
  // branch keeps: the commit they guard, named in the row, and the row named in app/verify/BEFORE-AFTER.md,
  // where every motion change on this branch is attributed to the commit that caused it. A self row nobody
  // attributed is a measurement nobody asked for, wearing a different coat.
  const selfs = ROWS.filter((r) => r.assert && r.referenceRelation === 'self');
  assert.ok(selfs.length,
    'no self-asserted row exists: if none are ever needed, delete this rule rather than let it go vacuous');
  for (const r of selfs) {
    assert.ok(/\b[0-9a-f]{7}\b/.test(r.gap || ''),
      `${r.id} asserts an internal claim and names no commit — say which change it is watching, or the row ` +
      `has no reason to exist beyond the afternoon someone wrote it`);
    assert.ok(BEFORE_AFTER.includes(r.id),
      `${r.id} is asserted and cites a commit, but app/verify/BEFORE-AFTER.md never names it — the ` +
      `attribution table is where a reader looks up what guards what`);
  }
});
