// The coverage report is the goal's scoreboard, so it is held to its inputs rather than remembered.
//
// Three numbers have been quoted as "coverage" across this project — files marked as resembling a
// component, files a human verified as an interface filling the frame, and files whose measurement is
// actually quoted against a component. They differ by more than three times, and the prose quoted
// whichever was nearest to hand. This test makes the widest one agree with the registry.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { coverage, NO_REFERENCE_REASON } from '../vault/coverage.mjs';

const here = (f) => fileURLToPath(new URL(f, import.meta.url));

test('the coverage tiers partition the registry — nothing counted twice, nothing dropped', () => {
  const { tiers, total } = coverage();
  assert.equal(tiers.spec.length + tiers.verifiedOnly.length + tiers.candidates.length + tiers.none.length, total,
    'a component is in two tiers or in none');
  // The floor came down from 22 to 21, and it came down because a claim was withdrawn rather than
  // because a measurement was lost: `strands` was spec-held on a Geocities circuit gif quoted for a trail
  // that stays drawn, and counting the lit area on all fifty of that gif's frames found it flat at 26-73 px
  // — no accumulation at any brightness floor, so the trail was never there. A component whose only
  // reference turns out not to show the thing it was quoted for is not spec-held, and lowering the number
  // is the honest edit. The floor stays a floor: if it drops again, name what went and why.
  assert.ok(tiers.spec.length >= 21,
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

test('a component with no reference owes a reason, not a bare name', () => {
  // Twelve components have nothing, and the number alone reads as laziness — so the next agent either
  // burns a round rediscovering the ceiling or dismisses it. Each name carries the class of artefact
  // that would have to exist for the entry to move, which keeps "the search was not exhaustive"
  // falsifiable: go and find that thing. A shrug fails the length floor; an absent entry fails outright.
  const { tiers } = coverage();
  const missing = tiers.none.filter((k) => !NO_REFERENCE_REASON[k]).sort();
  assert.deepEqual(missing, [], `${missing.join(', ') || 'every'} bottom-tier component has to say why no `
    + `moving image of it is available — otherwise the ceiling is a mood, not a finding`);
  const thin = Object.entries(NO_REFERENCE_REASON)
    .filter(([, why]) => why.trim().length < 80).map(([k]) => k).sort();
  assert.deepEqual(thin, [], `${thin.join(', ')} named too little to check against a search: name the artefact `
    + `class that would have to exist`);
});

test('--check can go red on provenance that moves no count', () => {
  // The checker used to verify one property: that the tiers sum to the registry. That stays true while the
  // report's provenance rots — a component held by two verified files loses one quotation, every count
  // holds, and the line a reviewer reads still credits a record that stopped naming it. So the doctoring
  // is exactly that count-neutral edit: remove a component from ONE of the two files that hold it.
  //
  // It happens in a temp directory on purpose. The first version of this test rewrote
  // `vault/SPECS-FOR.json` in place, and because `node --test` runs test files as parallel processes,
  // `test/gauntlet.test.mjs` read the doctored vault mid-run and reported a red that was not its own.
  // A test may not mutate data the rest of the suite reads; the env-var override below is what makes
  // the doctoring safe rather than merely quick.
  const { tiers } = coverage();
  const multi = tiers.spec.find((r) => r.files.length > 1);
  assert.ok(multi, 'this drift class needs a component held by two verified files; none exists, so the '
    + 'checker has nothing to catch yet — widen this test rather than trusting it');

  const specsPath = here('../vault/SPECS-FOR.json');
  const reportPath = here('../vault/COVERAGE.md');
  const dir = mkdtempSync(join(tmpdir(), 'coverage-drift-'));
  const fakeSpecs = join(dir, 'SPECS-FOR.json');
  const fakeReport = join(dir, 'COVERAGE.md');
  const record = JSON.parse(readFileSync(specsPath, 'utf8'));
  assert.ok(record[multi.files[0]], `${multi.files[0]} is credited in the tiers but is not a SPECS-FOR record`);
  const env = (specs) => ({ ...process.env, CYBERDECK_SPECS_FOR: specs, CYBERDECK_COVERAGE_REPORT: fakeReport });
  const run = (specs) => execFileSync('node', [here('../vault/coverage.mjs'), '--check'],
    { encoding: 'utf8', stdio: 'pipe', env: env(specs) });

  try {
    writeFileSync(fakeReport, readFileSync(reportPath, 'utf8'));
    writeFileSync(fakeSpecs, JSON.stringify(record, null, 2) + '\n');
    assert.match(run(fakeSpecs), /coverage tiers add up/,
      'the undoctored copy must pass, or the harness proves nothing');

    record[multi.files[0]].for = record[multi.files[0]].for.filter((k) => k !== multi.key);
    writeFileSync(fakeSpecs, JSON.stringify(record, null, 2) + '\n');
    let failed = false;
    let said = '';
    try {
      run(fakeSpecs);
    } catch (err) {
      failed = true;
      said = `${err.stdout || ''}${err.stderr || ''}`;
    }
    assert.ok(failed, `--check accepted a vault that stopped naming ${multi.key} in ${multi.files[0]} while the `
      + `report still credits that file. Counts held; provenance did not; nothing noticed.`);
    assert.match(said, new RegExp(multi.key),
      `the checker went red without naming the component whose provenance moved: ${said.slice(0, 240)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the checker runs as a command, not only as an import', () => {
  // Deliberately narrow, and titled to say so: this proves `--check` exits 0 on the tree as it stands.
  // It does NOT prove the checker can go red — that needs a doctored SPECS-FOR, which is the next thing
  // to do to this file, and until it is done the checker's own reliability is unproven. The tests above
  // are the ones with real teeth, because they derive the tiers themselves instead of trusting the print.
  const out = execFileSync('node', [here('../vault/coverage.mjs'), '--check'], { encoding: 'utf8' });
  assert.match(out, /coverage tiers add up/, `the checker said: ${out}`);
});
