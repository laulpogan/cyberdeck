// The coverage report is the goal's scoreboard, so it is held to its inputs rather than remembered.
//
// Three numbers have been quoted as "coverage" across this project — files marked as resembling a
// component, files a human verified as an interface filling the frame, and files whose measurement is
// actually quoted against a component. They differ by more than three times, and the prose quoted
// whichever was nearest to hand. This test makes the widest one agree with the registry.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { coverage } from '../vault/coverage.mjs';

const here = (f) => fileURLToPath(new URL(f, import.meta.url));

test('the coverage tiers partition the registry — nothing counted twice, nothing dropped', () => {
  const { tiers, total } = coverage();
  assert.equal(tiers.spec.length + tiers.verifiedOnly.length + tiers.candidates.length + tiers.none.length, total,
    'a component is in two tiers or in none');
  assert.ok(tiers.spec.length >= 22,
    `spec-held fell to ${tiers.spec.length}; coverage is a claim and it went down — add the measurement back or say so here`);
});

// The tier that used to be called "files only" counted *seed-mates* — everything a search returned
// for a subject — and two of the biggest seeds were opened and found to hold a cutscene, a suit
// turntable, a spaceship, an Undertale animation and eleven stills of a device with no time in
// them. Naming is the fix: a candidate is a search hit, and the report must never call one held.
test('a search candidate is never reported as a reference held', () => {
  const { tiers } = coverage();
  const report = readFileSync(here('../vault/COVERAGE.md'), 'utf8');
  for (const row of tiers.candidates) {
    assert.ok(!tiers.spec.some((r) => r.key === row.key) && !tiers.verifiedOnly.some((r) => r.key === row.key),
      `${row.key} sits in the candidate tier and a reference tier at once`);
  }
  assert.match(report, /search candidates only/i, 'the report stopped naming the tier honestly');
  assert.equal(/^\| files only \|/m.test(report), false,
    'the report calls a seed-mate count "files only" again — that tier made 36 unverified hits read as coverage');
  for (const row of tiers.verifiedOnly) {
    assert.ok(row.files.length, `${row.key} is in the verified tier naming no file`);
  }
});

test('every spec-held component is quoted by a file the eye verified and the spec measured', () => {
  const { tiers } = coverage();
  const EYEBALL = JSON.parse(readFileSync(here('../vault/EYEBALL.json'), 'utf8'));
  const SPECS = readFileSync(here('../vault/SPECS.md'), 'utf8');
  for (const row of tiers.spec) {
    for (const file of row.files) {
      const rec = Object.entries(EYEBALL).find(([k]) => k.endsWith(file));
      assert.ok(rec && rec[1].contentVerified,
        `${row.key} is counted as spec-held on ${file}, which the eye never verified`);
      assert.ok(SPECS.includes(`## \`${file}\``),
        `${row.key} is counted as spec-held on ${file}, which has no measured row in vault/SPECS.md`);
    }
  }
});

test('the committed report says what the live derivation says', () => {
  const written = readFileSync(here('../vault/COVERAGE.md'), 'utf8');
  const { tiers, total } = coverage();
  assert.match(written, new RegExp(`[Tt]he registry renders \\*\\*${total}\\*\\*`),
    'COVERAGE.md names another registry size than the registry has');
  assert.match(written, new RegExp(`buildable against a reference \\| ${tiers.spec.length} \\|`),
    `COVERAGE.md's spec-held row says another count than SPECS-FOR yields (${tiers.spec.length})`);
});

test('the checker runs as a command, not only as an import', () => {
  // Deliberately narrow, and titled to say so: this proves `--check` exits 0 on the tree as it stands.
  // It does NOT prove the checker can go red — that needs a doctored SPECS-FOR, which is the next thing
  // to do to this file, and until it is done the checker's own reliability is unproven. The tests above
  // are the ones with real teeth, because they derive the tiers themselves instead of trusting the print.
  const out = execFileSync('node', [here('../vault/coverage.mjs'), '--check'], { encoding: 'utf8' });
  assert.match(out, /coverage tiers add up/, `the checker said: ${out}`);
});
