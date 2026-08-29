# The parallel branches, and what each one holds

Four harnesses were pointed at the same commit and left to run. None of the four
has been merged, so most of the library's work is reachable only by checking out a
branch, and none of it is visible from `build/foundation`. This file is the map.

Measured 2026-08-29. All five branches are pushed to
[github.com/laulpogan/cyberdeck](https://github.com/laulpogan/cyberdeck); the
repository has no `main`, and `origin/HEAD` is unset.

| Branch | Head | Ahead of foundation | Files | What it is |
| --- | --- | --- | --- | --- |
| `build/foundation` | `a0f61e3` | — | 48 | The library itself: runtime, marks, 19 drawing primitives, 51 components in seven families, eight demo pages, ten test files |
| `app/opencode` | `dcea88f` | +6 | 73 | Vanilla-JS showcase app with a live data adapter |
| `app/pi` | `fe73d9f` | +13 | 102 | React showcase app with an evidence-toggling rack and a verify suite |
| `motion/vault` | `ec09793` | +92 | 172 | The reference vault, the motion readings, and the gauntlet |
| `motion/vault-gauntlet` | `bdfefdb` | +33 | 77 | The film camera and the judged motion ledger |

All four forked from `a0f61e3`. `motion/vault` was scoped off `app/pi` so the two
app branches would not be contaminated by motion edits; the library's runtime,
marks, keyframes and component geometry are in bounds there and out of bounds
everywhere else.

## `build/foundation` — the library

Seven component families, built in this order: the field (8), the river (6), the
telegraph (6), the thread (6), the organism (8), decision and authority (7),
agents and comms (7). Plus the standalone gauge, globe and card. One rule
enforced across all of them: an animation is a function of a number a producer
supplied, or it does not happen and prints why.

## `app/opencode` — the vanilla showcase

`app/` with no framework. A registry, per-family galleries, an honesty bar that
counts animations, marks, declared stills, and anything moving without evidence.

The interesting part is `app/adapter.js` and its three rules, tested in both node
and the browser (`test/adapter.test.mjs`, `test/app-browser.test.mjs`). It reads a
producer on a real clock via `scripts/live-feed.mjs` and is not permitted to invent
a field. `src/runtime.js` was changed here so a settled page is byte-equal to the
static export — the property the round-trip check depends on.

Run with `npm run demo:live` — http://127.0.0.1:8299/app/.

## `app/pi` — the React showcase

Same idea, different stack, and `AGENTS.md` on this branch (24 KB) is the record
of what the trade cost. Fixtures and a registry covering 51 components and 82
evidence fields, one model per component with its dark half derived. Three
switches: evidence per field, the refusal that evidence absence causes, and the
code that reproduces the drawing.

`app/verify/` is the gate: `roundtrip.mjs` proves `settle()` hands the document
back byte for byte, `probe-evidence.mjs` walks the evidence matrix, and the token
ratchet stops the palette from growing.

Run with `npm install && npm run app` — http://127.0.0.1:5199/.

## `motion/vault` — the reference corpus

The largest branch by a wide margin, and the one nothing else knows about.

`vault/` is a real acquisition pipeline: `acquire.mjs` drives a browser, harvests
media out of the scrolled DOM, verifies by magic bytes, and records provenance.
`mark.py` decodes each file to measure frames, per-frame delay and loop length,
then grades it `reference`, `look-alike`, or `drift`.

Measured contents: **273 records** — 147 reference, 39 look-alike, 87 drift. 92
GIFs, 11 of which hold a single frame. Longest real loop is 147 frames over
14.7 s. Frame and delay measurements were cross-checked against ImageMagick on 15
sampled files with zero disagreements.

The binaries are gitignored — 284 files, 106 MB, local only — but the 24 tracked
files under `vault/` include `MANIFEST.json` and its per-file provenance, so the
corpus is re-acquirable. That is the difference between this branch and
`motion/vault-gauntlet`, which commits nothing under `vault/` at all.

Coverage against the 51 rendered components, by tier that means something:
22 spec-held, 0 verified-but-unquoted, 17 search-candidates-only, 12 nothing. The
middle tier used to lie by counting seed-mates — everything a search returned —
and `COVERAGE.md` records how that was caught.

Also here: `app/verify/MOTION-READINGS.md` (143 KB of per-component readings),
`FILMSTRIP.md`, `BEFORE-AFTER.md`, `DECLARED-STILLNESS.md`, and a `test/` suite
that grew from 10 files to 32 — including `state-legibility.test.mjs`, which
requires a state difference to survive a monitor with no hue discrimination.

`AGENTS.md` on this branch is 70 KB. It is the accumulated record of what went
wrong, including two mechanisms that let a red result get pushed as green.

## `motion/vault-gauntlet` — the film camera

`scripts/motion-film.mjs` renders every component's motion to filmstrips.
`docs/MOTION-GAUNTLET.md` is the judged ledger: 52 of 52 components judged across
both themes and both motion preferences, against a vault of 67 stills and 16
strips.

The frames themselves are not in git. This branch's `.gitignore` excludes `vault/`
outright, so **zero files are tracked under it** — the 73 PNGs in `vault/film/`
and the reference imagery in `vault/ref/` and `vault/motion/` exist only in the
local worktree, with no committed manifest to re-acquire them from. The ledger
cites frames a reader cannot open.

The ledger is worth reading for the cases where the instrument was wrong before
the component was: the radar phased its blips against a partial lap, the gauge arc
never claimed `pathLength`, and a light-theme failure turned out to be montage
blindness rather than a real regression.

## Ports

Each branch pins its own, so several can run at once.

| Branch | Command | URL |
| --- | --- | --- |
| any | `npm run demo` | http://localhost:8199/demo/ |
| `app/opencode` | `npm run demo:live` | http://127.0.0.1:8299/app/ |
| `app/pi` | `npm run app` | http://127.0.0.1:5199/ |
| `motion/vault` | `npm run app` | http://127.0.0.1:5299/ |
| `motion/vault-gauntlet` | `npm run demo:live` | http://127.0.0.1:8299/app/ |

A port answering from the wrong worktree has already cost a day on this project:
every verify tool on `motion/vault` was pointing at a port that another worktree
was serving, so the tools measured a page the branch had not changed.
