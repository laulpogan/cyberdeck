// Every reference a component is quoted against owes a reading of its frames.
//
// The vault's failure mode is a citation standing in for an observation: a file lands in
// `SPECS-FOR.json` because its name looks right, a spec gets built "against" it, and nobody has
// looked at what the frames do. `vault/map.py` now refuses to write `MAPPING.md` while any quoted
// file has no reading in `vault/READINGS.json`. A refusal nobody can exercise is a comment, so the
// gate is driven here from both sides — doctored input must trip it, the real ledger must clear it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = (f) => fileURLToPath(new URL(f, import.meta.url));
const read = (p) => JSON.parse(readFileSync(here(p), 'utf8'));
const SPECS_FOR = read('../vault/SPECS-FOR.json');
const READINGS = read('../vault/READINGS.json');
const MANIFEST = read('../vault/MANIFEST.json').files;
const MAPPING = readFileSync(here('../vault/MAPPING.md'), 'utf8');
const SPECS_MD = readFileSync(here('../vault/SPECS.md'), 'utf8');

const QUOTED_FILES = Object.keys(SPECS_FOR).filter((f) => !f.startsWith('_'));
const BY_BASENAME = new Map(Object.values(MANIFEST).map((r) => [r.file.split('/').pop(), r]));
// SPECS.md is one section per measured file, headed `## \`file\``. Splitting it gives each reading
// its own source of truth, which is what a figure has to be checked against.
const specSection = (file) => {
  const start = SPECS_MD.indexOf(`\n## \`${file}\``);
  if (start < 0) return '';
  const end = SPECS_MD.indexOf('\n## ', start + 1);
  return SPECS_MD.slice(start, end < 0 ? undefined : end);
};

test('every quoted reference has a frame reading with the fields step 3 asks for', () => {
  const thin = [];
  for (const file of QUOTED_FILES) {
    const r = READINGS[file];
    if (!r) { thin.push(`${file}: no reading at all`); continue; }
    for (const field of ['enters', 'moves', 'holds', 'asks', 'dead']) {
      if (!r[field] || r[field].trim().length < 25) thin.push(`${file}: ${field}`);
    }
    // Length is a proxy everywhere except here: a period of "15 frames over 3s." is complete,
    // honest and short, and padding it to satisfy a threshold would be theatre. What it has to
    // carry is the file's own timing vocabulary.
    if (!/frame|loop|delay|still/i.test(r.period || '')) thin.push(`${file}: period (must name frames, loop or delay)`);
  }
  assert.deepEqual(thin, [], `${thin.length} reading field(s) are missing, thin, or silent about timing: `
    + thin.slice(0, 6).join(', ')
    + ' — a reading that does not say what enters, what holds and how it dies is a caption');
});

test('no reading states a figure its own sources do not carry', () => {
  // Not a whitelist of allowed phrasings — that was tried, and it passed the invented claim about a
  // "trail that stays drawn" right through. Every number in `period` and `moves` has to appear in
  // the file's measured section in SPECS.md or in the manifest record, or the reading made it up.
  const invented = [];
  for (const file of QUOTED_FILES) {
    const r = READINGS[file];
    const record = BY_BASENAME.get(file) || {};
    const truth = specSection(file)
      + ' ' + [record.frames, record.loopSeconds].filter((x) => x !== undefined && x !== null).join(' ');
    for (const field of ['period', 'moves']) {
      for (const n of (r[field] || '').match(/\d+(?:\.\d+)?/g) || []) {
        if (!truth.includes(n)) invented.push(`${file}.${field}: ${n}`);
      }
    }
  }
  assert.deepEqual(invented, [], `figures no measurement carries: ${invented.join(', ')} — the last `
    + `invented figure this vault shipped was a trail that measured flat on all fifty frames`);
});

test('MAPPING.md prints the reading of every quoted file', () => {
  const missing = QUOTED_FILES.filter((f) => !MAPPING.includes(f));
  assert.deepEqual(missing, [], `${missing.length} quoted file(s) never appear in MAPPING.md, so the `
    + `table claims them and the readings section does not know them: ${missing.slice(0, 4).join(', ')}`);
  assert.ok(/## What the references do, read off frames/.test(MAPPING),
    'the readings section is gone, which means the map is back to claiming citations it cannot show');
});

test('the reading gate closes when a citation loses its reading', () => {
  const boot = 'import importlib.util as u, json, sys; '
    + 's=u.spec_from_file_location("vmap","vault/map.py"); m=u.module_from_spec(s); s.loader.exec_module(m); '
    + 'args=json.loads(sys.argv[1]); '
    + 'print(json.dumps(m.unread_citations(*args if args else [None,None] if False else (args or [None,None]))))';
  const run = (args) => JSON.parse(execFileSync('python3',
    ['-c', boot, JSON.stringify(args)], { cwd: here('..') }).toString().trim());
  assert.deepEqual(run([{'radar': ['someone-elses-gif.gif']}, {}]), ['someone-elses-gif.gif'],
    'the gate did not trip on a doctored ledger: it is decorative');
  assert.deepEqual(run(null), [], 'the real vault has quoted files with no reading');
});
