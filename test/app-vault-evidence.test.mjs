// The Rules page cites real files and prints real numbers about them. Nothing on that page is
// allowed to be remembered from memory: every row has to resolve to a file in the vault, that
// file has to have passed the eye, and the URL printed beside it has to be the URL the acquire
// step recorded. `vault/spec.py` produced the figures; this test holds the page to them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { FORBIDDEN_IDIOMS, PERMITTED_IDIOMS, RULES_HELD, VAULT_NOTE,
         VERIFIED_COUNT, MOVING_COUNT } from '../app/src/vault-evidence.js';
import * as MARKS from '../src/marks.js';

const here = (f) => fileURLToPath(new URL(f, import.meta.url));
const EYEBALL = JSON.parse(readFileSync(here('../vault/EYEBALL.json'), 'utf8'));
const MANIFEST = JSON.parse(readFileSync(here('../vault/MANIFEST.json'), 'utf8')).files;
const ROWS = [...FORBIDDEN_IDIOMS, ...PERMITTED_IDIOMS];

const byName = new Map(Object.values(MANIFEST).map((r) => [r.file.split('/').pop(), r]));
const verifiedCount = Object.values(EYEBALL).filter((r) => r.contentVerified).length;

test('every cited reference is a vault file an eye actually looked at', () => {
  for (const row of ROWS) {
    const record = byName.get(row.file);
    assert.ok(record, `${row.file} is cited on the Rules page but is not in vault/MANIFEST.json`);
    const seen = EYEBALL[record.file];
    assert.ok(seen, `${row.file} was never put in front of an eye (vault/EYEBALL.json)`);
    assert.equal(seen.contentVerified, true,
      `${row.file} is cited as evidence about motion but the eye did not verify it — a relevance `
      + `label derived from a caption says nothing about the picture`);
    assert.equal(row.source, record.mediaUrl,
      `${row.file}: the link printed on the page is not the mediaUrl the acquire step recorded`);
  }
});

test('no file is cited twice, and every row can be keyed on it', () => {
  // The React key collision was found by the browser gate's console check, which is the right
  // instrument for a rendered page and the wrong one for a table this file can count.
  const files = ROWS.map((r) => r.file);
  assert.equal(new Set(files).size, files.length,
    `two rows cite the same reference: ${files.join(', ')}`);
});

test('a measured row carries a number, and the number is the argument', () => {
  for (const row of ROWS) {
    assert.match(row.measured, /\d/, `${row.idiom}: "measured" with no figure in it is an opinion`);
    assert.ok(row.measured.length > 20, `${row.idiom}: too short to be a measurement`);
  }
});

test('the library half of each permitted row names a mark kind that exists', () => {
  for (const row of PERMITTED_IDIOMS) {
    assert.equal(typeof MARKS[row.kind], 'function',
      `${row.idiom} is claimed to be carried by \`${row.kind}\`, which marks.js does not export`);
  }
});

test('the counts in the note are counted, not remembered', () => {
  assert.match(VAULT_NOTE, new RegExp(`These ${ROWS.length} are`),
    `the note says ${ROWS.length ? 'another' : 'no'} row count than the ${ROWS.length} rows rendered`);
  assert.equal(VERIFIED_COUNT, verifiedCount,
    `the page claims ${VERIFIED_COUNT} verified references; vault/EYEBALL.json says ${verifiedCount}`);
});

test('MOVING_COUNT is the moving population the ranking saw', () => {
  const ranked = JSON.parse(readFileSync(here('../vault/RANK.json'), 'utf8'));
  const moving = Array.isArray(ranked) ? ranked : ranked.files || ranked.ranked;
  assert.ok(Array.isArray(moving), 'vault/RANK.json does not carry a list of ranked files');
  assert.equal(MOVING_COUNT, moving.length,
    `the page says ${MOVING_COUNT} moving files; vault/RANK.json ranks ${moving.length}`);
});

test('the rules the evidence supports are the rules the app holds', () => {
  assert.ok(RULES_HELD.length >= 2);
  const app = readFileSync(here('../app/src/pages/Rules.jsx'), 'utf8');
  assert.match(app, /FORBIDDEN_IDIOMS\.map/);
  assert.match(app, /PERMITTED_IDIOMS\.map/);
  assert.match(app, /VAULT_NOTE/);
});

test('the evidence module is data, and moves nothing itself', () => {
  const src = readFileSync(here('../app/src/vault-evidence.js'), 'utf8');
  // The section argues against motion without a measurement. A `data-motion` in the module that
  // carries the argument would be the app breaking its own rule to make the point.
  assert.equal(/data-motion|intent\(|attrs\(/.test(src), false,
    'vault-evidence.js stamps motion; the counter-examples are quoted as ink, never re-enacted');
});
