// A `level` fill is drawn twice: once by the host's markup and once by the runtime's reveal, and
// the runtime wins — it animates to the mark's own value and keeps it (`fill: forwards`). That
// asymmetry is why finding #11's remaining hole cannot be closed in a browser. Sabotaging the
// chrome's rule bar with a hardcoded `scaleX(0.9)` under `data-level="0.406"` rendered 0.406 and
// the gate stayed green: the page never showed the lie, so no amount of measuring the page can
// find it. The bytes that go into the export still said 0.9, which is what a review reads.
//
// So the check is static, over source: an inline extent on a `level` fill must be *derived from
// the mark*, never a literal, and the anchor that makes the extent readable must not be overridden
// into the middle of the box.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SOURCES = ['rules.js', 'primitives.js']
  .map((name) => ['app/src/' + name, readFileSync('app/src/' + name, 'utf8')]);

test('a host-written inline extent is read from the mark, not hardcoded beside it', () => {
  for (const [path, src] of SOURCES) {
    // Match actual calls, not prose about them: every inline `scaleX(...)` the app writes into a
    // specimen's own markup.
    for (const m of src.matchAll(/scaleX\(([^)]*)\)/g)) {
      const arg = m[1].trim();
      const literal = /^[\d.]+$/.test(arg);
      assert.ok(!literal,
        `${path} writes a bar to scaleX(${arg}) as a literal. The mark next to it carries the`
        + ` measurement, and because the runtime animates the fill to the mark and holds it, the`
        + ` page renders the mark while the export renders the literal -- a disagreement no`
        + ` browser check can see. Read the extent from the mark (mark['data-level'] ?? 1).`);
      assert.match(arg, /mark|data-level|level/,
        `${path} writes scaleX(${arg}) from something that is not the mark, so the drawn extent`
        + ` and the declared measurement can drift apart without anything noticing`);
    }
  }
});

test('the chrome keeps its level fills anchored at the track edge', () => {
  // The mis-anchor is the defect finding #11 was actually about: `scaleX()` about the centre of a
  // box draws the measurement out from the middle, and `chipBudget` did that for its whole life.
  // The library anchors marked fills in `src/motion.css`; a host that re-specifies the origin for
  // one of its own fills silently un-anchors it, and the gate catches that only in the browser --
  // so the source is checked too, because the fix is one CSS line away from being deleted.
  const css = readFileSync('app/styles/app.css', 'utf8');
  const blocks = [...css.matchAll(/([^{}]*level[^{}]*|[^{}]*rule-bar[^{}]*)\{([^}]*)\}/gi)]
    .map((m) => ({ sel: m[1].trim(), body: m[2] }));
  assert.ok(blocks.length, 'no app CSS block mentions a level fill or the rule bar -- did the'
    + ' chrome bar lose its class, or did the anchor comment go with it?');
  for (const b of blocks) {
    const origin = /transform-origin\s*:\s*([^;}]+)/i.exec(b.body);
    if (!origin) continue;
    assert.doesNotMatch(origin[1], /center|centre|50%/,
      `${b.sel} puts transform-origin on a level fill at ${origin[1].trim()}. An extent that`
      + ` grows from the middle of its box is not a measurement of its extent`);
  }
});
