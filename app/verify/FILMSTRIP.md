# What the filmstrips say about the 51 specimens

Captured 2026-08-29 with `app/verify/filmstrip.mjs` against the vault worktree's dev server
(`http://127.0.0.1:5299`), then laid out by `app/verify/sheet.py` into `/tmp/film/<key>-sheet.png`
(51 sheets, four strips each: measured entrance, measured loop, refused entrance, refused loop).

Each row is a measurement of the running page, not of the source. *Entrance frames that
changed* counts PNG bytes differing from the frame before it, sampled densely across the
first ~900 ms after a re-mount. *Peak `getAnimations()`* is the highest count seen while
sampling, taken from the page. *Loop frames that changed* is the same specimen watched over
~4.2 s. The two *refused* columns are the same specimen after the rack's own evidence switch
is clicked off. *Marks on the specimen* is the `data-motion` inventory read in the DOM, so a
row that reads "never moves" can be told apart from a row that reads "refused to move".

| component | entrance frames that changed | peak `getAnimations()` | loop frames that changed | refused: entrance changed | refused: loop changed | height with evidence | height refused | marks on the specimen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `admission` | 8/17 | 12 | 2/12 | 0/13 | 0/2 | 571px | 97px | count — **drawing collapses** |
| `atField` | 8/17 | 4 | 2/12 | 0/13 | 0/2 | 571px | 81px | trace — **drawing collapses** |
| `bypass` | 5/17 | 2 | 1/12 | 0/13 | 0/2 | 571px | 571px | trace |
| `ceremony` | 6/17 | 4 | 1/12 | 0/13 | 0/2 | 571px | 81px | still,trace — **drawing collapses** |
| `channel` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 234px | 234px | — — never moves |
| `chipBudget` | 8/17 | 6 | 2/12 | 0/13 | 0/2 | 571px | 81px | count,level — **drawing collapses** |
| `city` | 8/17 | 7 | 2/12 | 0/13 | 0/2 | 571px | 571px | count |
| `collar` | 5/17 | 1 | 1/12 | 0/13 | 0/2 | 585px | 585px | elapsed,trace |
| `contextBurn` | 5/17 | 1 | 1/12 | 0/13 | 0/2 | 571px | 112px | level — **drawing collapses** |
| `coverage` | 8/17 | 6 | 2/12 | 0/13 | 0/2 | 571px | 571px | count,trace |
| `dispatch` | 8/17 | 8 | 2/12 | 0/13 | 0/2 | 571px | 571px | count,still |
| `dominator` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 268px | 268px | — — never moves |
| `dossier` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 177px | 177px | — — never moves |
| `envelope` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 571px | 571px | still — never moves |
| `esperDive` | 8/17 | 13 | 2/12 | 0/13 | 0/2 | 571px | 81px | count,trace — **drawing collapses** |
| `garage` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 219px | 219px | — — never moves |
| `gauge` | 6/17 | 1 | 1/12 | 0/13 | 0/2 | 196px | 219px | level |
| `gevulot` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 223px | 223px | — — never moves |
| `glassCell` | 7/17 | 4 | 2/12 | 5/13 | 1/2 | 571px | 571px | still,trace — **moves with the evidence off** |
| `globe` | 16/17 | 5 | 11/12 | 0/13 | 0/2 | 445px | 15px | count,still,trace,traffic — **drawing collapses** |
| `grid` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 160px | 160px | — — never moves |
| `hardCut` | 8/17 | 7 | 2/12 | 0/13 | 0/2 | 571px | 571px | count,trace |
| `ice` | 7/17 | 3 | 1/12 | 0/13 | 0/2 | 571px | 571px | still,trace |
| `individuation` | 8/17 | 5 | 2/12 | 0/13 | 0/2 | 314px | 81px | count,level,still — **drawing collapses** |
| `joiOverlay` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 220px | 220px | still — never moves |
| `keycard` | 7/17 | 8 | 1/12 | 0/13 | 0/2 | 571px | 571px | still,trace |
| `killmail` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 308px | 81px | still — **drawing collapses**; never moves |
| `ladder` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 352px | 352px | — — never moves |
| `loopDeviation` | 8/17 | 8 | 2/12 | 0/13 | 0/2 | 571px | 571px | still,trace |
| `magi` | 6/17 | 2 | 1/12 | 0/13 | 0/2 | 571px | 571px | still,trace |
| `mfd` | 7/17 | 2 | 1/12 | 0/13 | 0/2 | 571px | 81px | trace — **drawing collapses** |
| `muthur` | 8/17 | 5 | 2/12 | 0/13 | 0/2 | 414px | 81px | count — **drawing collapses** |
| `needleField` | 14/17 | 28 | 2/12 | 0/13 | 0/2 | 571px | 571px | count |
| `oracle` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 571px | 571px | still — never moves |
| `oscillation` | 16/17 | 7 | 11/12 | 5/13 | 1/2 | 453px | 453px | trace,traffic — **moves with the evidence off** |
| `queueState` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 571px | 571px | — — never moves |
| `radar` | 16/17 | 4 | 11/12 | 5/13 | 1/2 | 571px | 571px | count,cycle,still — **moves with the evidence off** |
| `redaction` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 247px | 247px | — — never moves |
| `river` | 10/17 | 12 | 11/12 | 0/13 | 0/2 | 222px | 222px | count,decay,still,trace |
| `scaleCrush` | 16/17 | 54 | 3/12 | 0/13 | 0/2 | 199px | 81px | count — **drawing collapses** |
| `scanOverlay` | 8/17 | 8 | 2/12 | 0/13 | 0/2 | 571px | 571px | arrive,trace |
| `standardSheet` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 571px | 571px | still — never moves |
| `stockFlow` | 8/17 | 3 | 2/12 | 0/13 | 0/2 | 331px | 331px | count,still |
| `strands` | 8/17 | 3 | 2/12 | 0/13 | 0/2 | 571px | 571px | still,trace |
| `stripChart` | 0/17 | 0 | 4/12 | 0/13 | 0/2 | 585px | 571px | elapsed — never moves |
| `syncRatio` | 5/17 | 6 | 1/12 | 5/13 | 1/2 | 571px | 571px | still,trace — **moves with the evidence off** |
| `tape` | 8/17 | 3 | 2/12 | 0/13 | 0/2 | 275px | 81px | count,elapsed,intent — **drawing collapses** |
| `tapeSplice` | 7/17 | 1 | 2/12 | 0/13 | 0/2 | 571px | 571px | still,trace |
| `tracker` | 16/17 | 4 | 11/12 | 0/13 | 0/2 | 571px | 571px | trace,traffic |
| `triVision` | 8/17 | 10 | 2/12 | 0/13 | 0/2 | 571px | 571px | count |
| `twoState` | 0/17 | 0 | 0/12 | 0/13 | 0/2 | 571px | 571px | — — never moves |

> **This file is the measurement; [`MOTION-READINGS.md`](MOTION-READINGS.md) is the eye.** Every
> component now has a written reading there, taken from six-to-an-image sheets
> (`app/verify/review-sheet.py`). Where the two disagree, the reading is newer and the table here is
> the capture it was read from.

## 1. Almost everything moves once and then stops — and for most of them that is correct

46 of 51 fall silent inside the loop window. Only five keep moving: `globe` (11 of 12 loop
frames changed), `oscillation` (11/12), `radar` (11/12), `river` (11/12), `tracker` (11/12),
plus `stripChart`, whose elapsed counter is a `setInterval` and changes only when the words
change.

That is not a list of failures. The fixtures are frozen instants — no `Date.now()`, no
`Math.random()`, one bright model per component — so a component whose subject is a snapshot
has no honest reason to keep moving. A gauge that sweeps to 41/60 and holds is telling the
truth. A component that *breathes* on a timer is inventing a clock that nobody measured,
which is the thing the rule is for.

The interesting agreement is in the marks column: every component carrying a continuous kind
— `traffic`, `cycle`, `decay` — is in the moving five, and none of the silent ones carries
one. The library's continuous-motion classes and its loop-silent set line up exactly. So a
name like `stockFlow` reading "count, still — loop falls silent" is not a motion defect, it
is a naming question: either its fixture carries a stream, or it should not be called a flow.

## 2. Four components animate with the evidence switched off

`oscillation`, `syncRatio`, `glassCell` and `radar` each change in 5 of 13 refused entrance
frames, with 1 of 2 refused loop frames changing, and `getAnimations()` non-zero while the rack
says there is nothing to measure. This is the rule broken in pixels.

Three of them are the `trace(true)` carriers already named in `app/src/undeclared.js` — recorded
there as unconditional marks, visible here as frames that differ. The fourth is `radar`, whose
unconditional mark is `count(0, 1)`: the tally animates while the numbers that would produce it
have been withdrawn. **The fix is at the component: `trace(evidence)` and `count(value)` where
the value is the measurement, refusing the way the other marks refuse.**

The counter stayed at `MOVING WITHOUT EVIDENCE = 0` across all four. It asks the runtime what it
is animating, and the runtime answers honestly about animations that the component stamped
without anything behind them — which is why an honesty readout built only from marks cannot see
this, and a pixel-difference check can.

**Fixed on this branch, and re-captured.** Each carrier now declares its stillness, and the
refused strips read silent: 0 of 13 entrance frames changed and `getAnimations()` at 0 on all
four, against 5 of 13 changed with live animations before. They still move when the evidence is
there — `radar` 16 of 17 entrance frames and 11 of 12 loop frames, `oscillation` the same,
`glassCell` 8 of 17 — so the fix removed the claim, not the drawing. `syncRatio` is now
completely still, which is the specimen's own assertion: no series was retained for the lane, so
nothing travelled the axis. See `app/src/undeclared.js`, whose licence list is empty, and
`test/app-undeclared.test.mjs`, which renders each component with and without its evidence and
reads the mark off the element.

## 3. Twelve refusals throw the drawing away

The heights columns hold the finding. `globe` falls from 445px to 15px; `tape` from 275px to
81px; `scaleCrush` from 199px to 81px; `killmail` from 308px to 81px; a run of cards that sit
at 571px with their measurements land at 81, 97, or 112px without them. The card keeps its
frame and its refusal sentence and loses the shape the refusal is about.

`npm run verify` was green across 261 passes while this was true, because the only height
floor in the gate ran on the evidence-present page. The gate now pairs the heights across the
switch and names each one (`2c35a94`). A refusal has to keep its space.

**Fixed on this branch** (`3f095f2`). `card()` now reads its own body: an empty body over a
refusal is not a drawing, so the card draws the absence — the library's unmeasured hatch
bracketing a word that names what is missing, plus `ghost` geometry where the absent
measurement has a shape (the twin MFD deck outlines its two bezels and drops the hatch, because
the outline *is* the hatch). Twelve sites name their own word — `ONE PANE SHORT`, `BOARD
UNCOUNTED`, `NOTHING PENDING` — since `UNMEASURED` everywhere would be a legend, not a reading.
`globe` needed its own fix: its refusal path omitted the mesh and the SVG layer entirely. The
thirteen routes now pass 52 of 52 at both widths and both schemes, where every one of them
failed before.

## 4. Fifteen never move at all, and most of them are refusing

`channel`, `dominator`, `dossier`, `garage`, `gevulot`, `grid`, `ladder`, `redaction`,
`twoState`, `queueState` carry no marks at all; `envelope`, `joiOverlay`, `killmail`, `oracle`,
`standardSheet` carry `still` and mean it. The first group is the drawn-refusal family from
`AGENTS.md`: they write their absence as ink — `UNMEASURED`, `DARK`, `NO PROOF HISTORY` — and
stamp nothing, so `DECLARED STILL` reads 0 over a deliberate refusal. The filmstrip is a third
instrument on that gap: a still frame is indistinguishable from a forgotten animation unless
the DOM says which one it is.

## 5. The radar: the sweep is decoration, not measurement

The one sheet read closely at writing time. The wedge turns, at a steady period, and the two
contacts are dots that sit where they sit: their brightness does not change when the wedge
crosses them, and nothing decays between passes. The reference claim written into the vault
for this idiom is the opposite — *the blip appears when the sweep passes it and fades on a
measured decay* — and that is the Aliens M513-3 behaviour the component is named after.

As drawn, the sweep is a spinner with a dial painted behind it. The fix has to be arithmetic,
not CSS: each contact's brightness is a function of the same clock that draws the wedge —
`age = now - last_pass(contact)` — and the runtime should write it as a `traffic`/`decay`
value rather than a keyframe loop. Then the sweep carries information, and refusing it is
possible.

## 6. What has not been looked at

This is one reading of 51 sheets. 48 of them have been *measured* and not *seen*. The table is
the measurement; the reading above names where eyes are needed first: `needleField` (peak 28
animations, the busiest specimen in the library), `scaleCrush` (peak 54), `magi` (three cores
that should deliberate), `collar` (the elapsed counter the landing page depends on),
`muthur`, `tapeSplice`, `hardCut`, `scanOverlay`.

## Regenerating

```sh
node app/verify/filmstrip.mjs ALL                     # frames + JSON into /tmp/film
python3 app/verify/sheet.py /tmp/film $(cd /tmp/film && ls *.json | sed 's/\.json$//')
```
