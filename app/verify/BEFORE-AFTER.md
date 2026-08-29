# Before and after: what this branch changed in the motion, and in which commit

Task-4's contract is that every motion change is driven by a named reference and a named gap,
with before/after evidence. `git merge-base origin/app/pi HEAD` is **fe73d9f**; the branch adds 75
commits. Two instruments were run against that pair, because they see different things:

- **The signature sweep** (`node app/verify/motion-transitions.mjs /tmp/cdb fe73d9f..HEAD`) renders
  every component at all 75 commits and names the commits where its `data-motion` signature moved.
  It is server-side, so it is cheap enough to be exhaustive, and it is what makes the attribution
  below a fact rather than a recollection.
- **The filmstrip pass** (`app/verify/filmstrip.mjs`, both builds, the 35 components whose markup
  differs — 1,575 frames each) measures pixels and `Animation` objects over time, so a plate that
  changes without an `Animation` — a counter rewriting text — still shows up.

**Endpoints.** 35 components: 16 changed their motion, 19 changed markup
only. "px" is the number of sampled frames whose PNG differs from the previous one; "peak" is the
largest `document.getAnimations()` seen during the entrance plus loop watch; "moving" is how many
elements the library itself says carry a mark. The table quotes the **measured** condition; a row can
show identical numbers there and still be listed, because the classification compares the refused
condition too — a refusal that gained or lost a stillness is a motion change even when the bright
plate looks the same on camera.

| component | branch point px/peak/moving | now | transition commit — the gap it was closing | what covers the new motion |
|---|---|---|---|---|
| `admission` | 10/12/12 | 15/14/14 | 4cb3e9b; c21a698 — Two loaders measured, a beam given its angle, and a build… | front_loaded, no_residual_motion |
| `dispatch` | 10/8/8 | 11/9/9 | 4cb3e9b — Premises, then conclusion: a derived figure enters after t… | static tests only |
| `envelope` | 0/0/0 | 10/3/3 | 3204181; c673205 — The position was drawn at the centre of the space because… | no_residual_motion, text_contains |
| `esperDive` | 10/13/10 | 8/9/9 | d44bfc6; 972b13d — The sweep that lied: thirteen false reds from a 600ms slee… | furniture_audit_clean |
| `glassCell` | 10/4/4 | 10/4/4 | ad24743; 4cb3e9b — Premises, then conclusion: a derived figure enters after t… | static tests only |
| `ice` | 8/3/3 | 10/4/4 | 4cb3e9b — Premises, then conclusion: a derived figure enters after t… | static tests only |
| `joiOverlay` | 0/0/0 | 8/2/2 | 3204181 — Finding #9, closed, and every level bar in the library ret… | static tests only |
| `keycard` | 8/8/4 | 10/9/5 | 4cb3e9b — Premises, then conclusion: a derived figure enters after t… | static tests only |
| `killmail` | 0/0/0 | 10/7/7 | 3204181 — Finding #9, closed, and every level bar in the library ret… | static tests only |
| `magi` | 7/2/2 | 10/3/3 | 31a3a62; 4cb3e9b — Premises, then conclusion: a derived figure enters after t… | static tests only |
| `oracle` | 0/0/0 | 8/3/3 | 3204181 — Finding #9, closed, and every level bar in the library ret… | static tests only |
| `oscillation` | 27/7/7 | 27/6/6 | ad24743 — The threshold, the axis and the sightline were geometry; a… | static tests only |
| `radar` | 27/4/4 | 27/6/6 | a196a42 — A radar contact is now bright because the sweep crossed it | furniture_still, loop_wraps_in_a_jump |
| `scanOverlay` | 10/8/4 | 10/11/7 | 4e48b20 — The scan now reveals in the order it claims | static tests only |
| `stripChart` | 4/0/1 | 11/1/2 | 3204181; 7258d94 — Finding #10, closed: an absence now speaks in one vocabula… | no_residual_motion |
| `syncRatio` | 6/6/1 | 0/0/0 | ad24743; 289b5d3 — Twenty-nine cards and eleven shapes learn the difference b… | static tests only |

## What the pass turned up that the tests had not

- **`3204181` ("every level bar in the library returned to where it was drawn") handed its reveal-order
  machinery to three plates that had never animated at all** — `killmail` (`still:1` → `count:7 still:1`),
  `oracle` (`still:5` → `count:3 still:2`), `joiOverlay` (`still:1` → `count:2 still:3`). A global fix
  creating local motion is either fine or quietly wrong, and nothing in the suite could tell which.
  It is fine, and now it is asserted: `test/reveal-order.test.mjs` holds that the members arrive 0..n-1
  over one stated population, that `oracle`'s fourth fragment is *drawn and declared* rather than
  dropped while the population still says four, and that `joiOverlay`'s projections stay out of the
  cascade. Collapsing a shared helper's slot (`count(i, total)` → `count(0, total)`) goes red with
  "killmail: the population of 4 must arrive 0..n-1, got 0,0,0,0".
- **A general invariant fell out of the same inspection**: a declared stillness never carries a reveal
  slot. 65 `still` marks across every bright model, none with `data-index` or `data-total`. A slot is a
  promise of membership in a population arriving in order; a refusal is the space where a measurement
  did not arrive. Giving a stillness a slot makes the runtime schedule the absence of a fact. Proven by
  putting `data-index="1"` on `oracle`'s hatched forecast: *"a declared stillness carries a reveal slot
  — the runtime will give an absence a place in the arrival order"*.
- **`count` marks carry no `data-cite` anywhere — 188 of them, zero cites.** That is house style, not a
  regression: a count states arrival order over a population whose cite lives on the row. Writing it up
  here because "this mark has no provenance" was the obvious wrong conclusion to reach for.
- **`syncRatio` lost its motion deliberately** (`trace:1` → nothing, then more stillness): the ratio axis
  is geometry, and `ad24743` stopped animating it. The pixels confirm it — 6 changing frames became 0.
- **`radar` gained cycles and a stillness** (`a196a42`, then `826ea58`) and is the one plate whose motion
  this branch had to invent a kind of measurement for: net rotation over accumulated revolutions.

## Markup changed, motion did not (19)

These are the ripple of shared work — `card.js`, `draw.js`, `marks.js`, `components.css` — and they are
listed so the claim "35 components changed" is not mistaken for "35 components move differently":

`atField`, `ceremony`, `channel`, `chipBudget`, `city`, `coverage`, `dominator`, `garage`, `gevulot`, `grid`, `ladder`, `loopDeviation`, `muthur`, `queueState`, `river`, `standardSheet`, `tape`, `tapeSplice`, `tracker`.

## How to re-run it

```sh
MB=$(git merge-base origin/app/pi HEAD)
git worktree add /tmp/cdb $MB && ln -s $PWD/node_modules /tmp/cdb/node_modules
(cd /tmp/cdb && ./node_modules/.bin/vite --port 5300 --host 127.0.0.1 &)
node app/verify/motion-transitions.mjs /tmp/cdb ${MB}..HEAD
KEYS=<the differing keys> BASE=http://127.0.0.1:5300 OUT=/tmp/film-before node app/verify/filmstrip.mjs
KEYS=<the differing keys> BASE=http://127.0.0.1:5299 OUT=/tmp/film-after  node app/verify/filmstrip.mjs
```

*Two ways this went wrong before it went right, recorded because both looked like results: a per-commit
render piped through `2>/dev/null` with a `{}` default reported "75 signatures recorded" while every
payload was empty — the probe imported `./app/...` relative to `/tmp` — and `git rev-list` run inside a
detached worktree returned no commits at all. An instrument that reports success on its own failure is
worse than no instrument, so `motion-transitions.mjs` renders inside the tree it is checking, counts the
commits that fail to render, and prints a component as `(unrenderable)` rather than as no change.*

