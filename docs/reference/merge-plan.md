# Merge plan

Four branches, none merged, all green on their own tests. This is the order to
merge them in, the two collisions that make order matter, and the evidence behind
both calls.

Measured 2026-08-29 against `a0f61e3`, the commit all four forked from.

## What the branches actually are

Two lineages, not four. Each app branch got a motion branch built on the same
substrate.

```
a0f61e3  build/foundation
   ├── app/opencode   (vanilla app)  ──► motion/vault-gauntlet  (film camera)
   └── app/pi         (React app)    ──► motion/vault           (reference corpus)
```

The two motion branches are **independent rewrites of the same library files**.
Neither is an ancestor of the other. On `src/runtime.js` they differ by 290 of
491 lines; on `river.js` by 262 of 631; on `field.js` by 141 of 362. There is no
hunk-level merge available.

| Branch | Commits | `src/` files touched | Tests | Result |
| --- | --- | --- | --- | --- |
| `app/opencode` | 6 | 2 | 174 | pass |
| `app/pi` | 13 | 3 | 210 | pass |
| `motion/vault` | 92 | 16 | 331 | pass |
| `motion/vault-gauntlet` | 33 | 9 | 178 | pass |

## Collision 1 — the two motion branches

Only one `src/` can win. The cross-test settles which.

| Library source | Test suite | Result |
| --- | --- | --- |
| `motion/vault` | `motion/vault-gauntlet`'s | **168 / 178** — 10 fail |
| `motion/vault-gauntlet` | `motion/vault`'s | **249 / 323** — 74 fail |

`motion/vault` is the superset. It touches all 9 files the gauntlet touched plus
7 the gauntlet never opened — `agents.js`, `authority.js`, `card.js`,
`decision.js`, `organism.js`, `telegraph.js`, `draw.js`. Its source nearly
satisfies the gauntlet's contract; the reverse fails four times as widely.

**Call: `motion/vault`'s `src/` wins.** The gauntlet's ten failures are a
follow-up, not a merge conflict — they are its last radar and gauge work, which
landed after the two branches had already diverged.

The ten, by file:

| Test file | Fails | What it is |
| --- | --- | --- |
| `app-browser.test.mjs` | 3 | one wrapper, plus a declaration count and a missing `data-sweep-angle` |
| `field.test.mjs` | 2 | radar contacts: off-scope age, swept bearing |
| `agents.test.mjs` | 1 | fragments held apart |
| `marks.test.mjs` | 1 | dial origin as radial sweep |
| `organism.test.mjs` | 1 | envelope with no measured position |
| `river-family.test.mjs` | 1 | the dive's floor as a level |
| `thread.test.mjs` | 1 | a projection lifted out of the panel |

Two of the three `app-browser` failures are real and one is the wrapper that
reports them. The radar one — `.cd-fd-contact[data-sweep-angle]` never appears —
is the same gap as the two `field.test.mjs` failures, so the ten collapse to
roughly four distinct pieces of work: the radar sweep and its blips, the dial
origin, the envelope and dive levels, and the vanilla app's declaration count.

## Collision 2 — two different apps at `app/`

`app/opencode` and `motion/vault-gauntlet` put a vanilla app at `app/`.
`app/pi` and `motion/vault` put a React app at the same path. Same directory,
different framework, no shared file.

```
vanilla                     React
app/adapter.js              app/src/
app/galleries.js            app/verify/
app/honesty.js              app/styles/
app/registry.js             app/fixtures/
app/live.js  app/copy.js    app/index.html
```

Both are worth keeping — the vanilla one carries the live data adapter and its
three rules, the React one carries the evidence matrix and the verify suite. One
has to move.

**Call: React app stays at `app/`, vanilla moves to `app-vanilla/`.** The React
app is the one the winning motion branch is built against, so leaving it in place
keeps `motion/vault`'s 331 tests and its whole `app/verify/` suite pointing at
paths that still exist. Moving the vanilla app costs a path rewrite in
`scripts/live-feed.mjs`, `test/app.test.mjs` and `test/app-browser.test.mjs`, and
nothing else.

## The order

Merge along the winning lineage first, then bring the other in beside it.

**1. `app/pi` → `build/foundation`.** Smallest real merge. 3 source files, 7 new
test files, the React app, and the dev dependencies. Gate: 210 tests, plus
`npm run verify:roundtrip`.

**2. `motion/vault` → `build/foundation`.** The big one. Takes `src/` wholesale —
it is a strict superset of everything downstream of `app/pi`. Brings the 24
tracked `vault/` files, `app/verify/`'s 32 files, and the test suite to 331.
Gate: 331 tests, `npm run verify:all`, `npm run verify:coverage`.

**3. `app/opencode` → `build/foundation`, with the app relocated.** Move `app/*`
to `app-vanilla/*` before merging, and **drop the branch's `src/runtime.js`
change**. That change existed to make a settled page byte-equal the static
export, and the vault runtime already has the property: under vault's `src/`, the
gauntlet's own browser test *kill switch leaves the page byte-identical to the
static export* passes. Checked, not assumed. Gate: 331 tests still green, plus
the relocated vanilla app's own 174.

**4. `motion/vault-gauntlet` — port, do not merge.** Its `src/` loses. What is
worth taking is `scripts/motion-film.mjs`, `docs/MOTION-GAUNTLET.md`, and the
radar, gauge and blip work from its last commits — driven by the ten failing
tests above rather than by the diff. Land those tests first, watch them fail,
then port until they pass.

## Before any of it — the imagery is not in git

Two branches cite pictures that exist only on this machine.

| Branch | Under `vault/` | Tracked | On disk |
| --- | --- | --- | --- |
| `motion/vault` | scripts, `MANIFEST.json`, records | 24 files | 284 raw binaries, 106 MB, gitignored |
| `motion/vault-gauntlet` | film and reference frames | **0 files** | 73 PNGs in `vault/film/`, plus `ref/` and `motion/` |

`motion/vault` is recoverable: `MANIFEST.json` holds per-file provenance, so
`acquire.mjs` can rebuild the corpus. `motion/vault-gauntlet` is not — its
`.gitignore` excludes `vault/` outright, nothing under it is tracked, and there is
no committed manifest. Its ledger cites 67 stills and 16 strips that a reader
cannot open, and deleting that worktree destroys them.

**Do this first, before touching a branch:** commit a manifest for the gauntlet's
frames, or copy them somewhere durable. It is the only irreversible item in this
plan.

Also decide where the corpus lives. 106 MB of GIFs does not belong in the
package or, probably, in this repository. The options are a sibling repository,
an LFS store, or manifest-only with re-acquisition on demand — which is what
`motion/vault` already implements and what makes it the cheaper default.

## Second decision, cheaper than it looks

`build/foundation` is the default branch and the repository has no `main`.
Whatever lands, rename or set `origin/HEAD` at the end so a clone checks out
something on purpose rather than by accident.
