# Motion readings, one per component

Read off the frames captured by `app/verify/filmstrip.mjs` (this pass: `/tmp/film4`, re-captured
after the refusal and evidence fixes landed), laid out six components to an image by
`app/verify/review-sheet.py` (`/tmp/rs4/group-NN-*.png`, 9 sheets, 51 rows). Every row is: the
entrance at 0ms, mid-entrance and end, the loop at its start and its end, and the last frame after
the rack's evidence switch was clicked — with the mark inventory read from the DOM, the height on
both sides of the switch, and the frame-change counts beside the name.

The question each reading answers is the one the rule poses: **does what moves measure
something?** A specimen that moves because a number arrived is fine and gets said briefly. A
specimen whose motion is decoration, or whose drawing is dead while something is still marked, or
whose stillness is drawn in the visual language of "live", is named with the defect and where it
is. Where a row looks dead at card scale but the DOM says `moving=1`, that is said too — a
measurement nobody can see is a measurement nobody acts on.

Numbers quoted are from the capture: `changed` counts differ from the old pass wherever the
library changed underneath, and those differences are recorded in
[`FILMSTRIP.md`](FILMSTRIP.md), not here.

## The Field

### `admission` — Cargo admission balance

**Measured:** 8 of 17 entrance frames changed, 2 of 12 loop, height 571px held. The right-hand
stack of unit bars grows across the entrance; the tilted beam and the two totals — `OFFERED 14`,
`TAKEN 9` — are identical in the frame at 0ms and the frame at 883ms.
**Refused:** 0 of 13 frames changed. The card draws its own absence — two hatch bands and
`UNMEASURED OFFERED · UNMEASURED TAKEN` — and keeps its 571px.

**Does the motion measure something? Partly, and not the finding.** The tally arriving is a
measurement-shaped motion: units entered one at a time and the drawing says so. But the specimen
is a *balance*, and the balance never moves — the beam sits at its angle from the first frame, so
the reader watches a bar chart fill while the thing the component exists to show (14 against 9,
one side heavier) is a static claim. Two defects, both the same shape as `gauge`'s:

- The numbers are painted before the evidence arrives. `OFFERED 14` is complete at 0ms while the
  bars are still arriving. A counter that finishes before the count it counts is a caption.
- The beam should be the `level` — it is the visual sum of offered against taken — and it has no
  mark. Give the beam a `level`/`decay` driven by the same measured pair, so the balance *settles*
  as the units arrive, and the arrival motion and the finding become one event instead of two.

### `atField` — AT-field write scope

**Measured:** 8 of 17 changed, 2 of 12, `trace` marked, 571px held. What moves is a single hairline
tick near the centre and a small dash that shifts between the loop frames. The four concentric
rings (`FLEET / HOST / MODEL / PROBE`) and the section rules do not move.
**Refused:** 0 of 13; the drawing becomes two hatch bands around `NO REACH COMPUTED`, space kept.

**Does the motion measure something? Yes, and it is invisible.** The rings not animating is
correct: a scope is a claim about authority, not a quantity that travels — and it is the right
reading of the reference idiom, where the field boundary is drawn once. The defect is that the
only motion in the specimen is a hairline and a dash, which at card scale (the tile is 250px of a
571px drawing) is a sub-pixel event. The DOM reports `moving`, the eye reports nothing. Two things
to fix, in order of value:

- The trace has no visible endpoint. A ring being *crossed* is the finding — the subject sitting
  inside `PROBE` but outside `MODEL` is why the hexagons are drawn at all — so the trace should
  run from the centre out to the ring the measurement reaches, and stop at it, which is `trace`
  doing its job on a measured extent rather than on a decorative tick.
- The right-hand paragraph sits at ~6px in the drawing. It is the second-tiniest type in the
  library after the keycard labels; it should be card copy, not specimen ink.

### `bypass` — Agrippan bypass

**Measured:** 5 of 17 changed, 1 of 12, `trace`, 571px held. A red arc grows from the `QUEUE` rail
across the four pass boxes to a dot at the right margin — the curve is partial at 443ms and whole
by 883ms, and the terminal dot appears with the completion.
**Refused:** 0 of 13. The arc stays drawn and nothing animates, which is the correct refusal: a
bypass that was taken is a fact about the past, not a thing that keeps happening.

**Does the motion measure something? Yes — this is the row that shows what the rule is aiming
at.** The arc travels because a pass actually went through, the travel is the whole story, and it
ends. `ALGEDONIC · PASSES NONE OF THESE` beneath it states what the arc is *not* (the library's
algedonic claim — nothing may be snoozed), so the motion cannot be read as an alarm. Two notes:

- The entrance ends and the loop is silent, which is honest (nothing is queued in the fixture).
  If the fixture ever carries a live queue, this row needs a `cycle`/`traffic` with a measured
  period, and only then.
- Small but real: the terminal dot is 3px at design scale and vanishes at 390px. The thing that
  says "and this one is *past*" should not be the first thing the narrow layout erases.

### `ceremony` — Acceptance ceremony

**Measured:** 6 of 17 changed, 1 of 12, `still` and `trace`, 571px held. A marker advances along
the `STAGE → CONDITION → ASK → CONFIRM` rail, arriving at `ASK`; the `ABOUT WINDOW 16s` rule and
the state list below it are fixed.
**Refused:** 0 of 13, `NO CEREMONY DEFINED` drawn in its own space.

**Does the motion measure something? Yes for the marker; one thing is wrong about the window.**
The rail is a state machine and the marker sits at the state the measurement reports — a state
advance is exactly the kind of thing that should be animated, and it is. But `ABOUT WINDOW 16s`
is drawn as an active interval with no `cycle` or `traffic` mark on it, and the loop is silent: the
drawing claims a countdown that nothing counts down on the page. Either it is a measured window —
then it gets `cycle(spent, period, sourceState)` and refuses on overrun like every other countdown
in the library — or the words become `WINDOW UNMEASURED`. As drawn it is a progress bar with no
progress and no producer, which is the chrome the rule exists to keep out.

### `channel` — Channel state

**Measured:** 0 of 17 changed, 0 of 12, **no marks at all**, 234px held and refused.
**Refused:** 0 of 13, and — correctly — nothing changes, because with its evidence present this
specimen does nothing either.

**Does the motion measure something? There is no motion, and that is not the defect.** The defect
is the small orange waveform at the right of the state block. It is drawn in the library's own
"signal" idiom, the same visual language `traffic` uses, and it is inert: nothing measured drives
it, and nothing marks it. A reader is trained by every other specimen to read a squiggle as
"something is happening out there", so a motionless one is a false indicator wearing the costume of
an honest one. Either the channel's own liveness is measured and arrives as a `traffic` period —
then the squiggle earns its place and animates — or it becomes stated absence: a flat rule and the
word `NO CARRIER`. This is the same category as the drawn-refusers who write `UNMEASURED` as ink:
say what is not there, in ink.

### `chipBudget` — HUD chip budget

**Measured:** 8 of 17 changed, 2 of 12, `count` and `level`, 571px held. At 0ms only the outline
chip and the total `26 / 64` exist; by 443ms the five chips (`FLEET BAR 12/6` … `WALLS 4/6`) and
the bracket are there, and by 883ms nothing further moves.
**Refused:** 0 of 13, `NO INVENTORY` drawn, space kept.

**Does the motion measure something? The arrival does; the finding is painted.** Two of the three
quantities on this card exist before their evidence arrives: the ceiling `64`, the total `26`, and
the `OVER BUDGET` verdict are complete in the frame where the chips have not yet been drawn. And
each chip's `x/6` bar is already at its value in the first frame it appears in — the `level` marks
are on the elements but no level is seen travelling, because the parts arrive *and complete* in the
same sampled window.

The specimen is about a sum exceeding a ceiling. Let the sum be the thing that moves: the total
climbing as the parts are counted, and the `OVER BUDGET` word arriving when the sum passes the
ceiling — then the entrance *is* the argument. As it stands, the argument is stated at frame one
and the animation is footsteps behind it.

## The Instrument Rack

### `city` — Placement map

**Measured:** 8 of 17 changed, 2 of 12, `count`, 571px held. The five placement columns
(`delCartogra`, `hermes`, `skelta`, `warp-02`, `rex`) stack green blocks from the baseline as the
count arrives; two columns stay outlined in magenta dashes with a `0` beneath.
**Refused:** 0 of 13. All five columns keep their outlines and labels, and the whole row becomes
the dashed outline with zero counts — the refusal keeps the five-column shape rather than a
sentence.

**Does the motion measure something? Yes.** Blocks stacking as placements are counted is a
measurement and looks like one. The defect is an ink collision, and it is the first sighting of
the cross-cutting problem this pass keeps finding:

- **The same glyph means "not reached" and "no data at all."** Magenta dashes say *this column has
  no placements* inside a measured specimen; the very same dashes say *the library holds no
  measurement here* in the refusal frame. So `skelta` at zero and the entire map refused are the
  same picture, and a reader cannot tell a sparse board from a blind one — which is precisely the
  distinction the honesty bar exists to keep. Measured absence and refused absence need different
  inks, and the choice belongs to the token layer (`--cd-signal-warn` versus a refusal token), not
  to whichever component drew first.

### `collar` — Servitude collar

**Measured:** 5 of 17 changed, 1 of 12, `elapsed` and `trace`, 585px held. The dial reads
`2H 36M ELAPSED` inside a dashed ring; the ring's completed arc grows, and the
`CAT-GRADUATION-30` band beside it is a `trace`.
**Refused:** 0 of 13. The dial keeps its circle in dashed magenta around the word `UNMEASURED`, the
graduation band becomes a hatch band, and the 585px is kept.

**Does the motion measure something? Yes, and the eye cannot see it — the defect this branch was
opened to look at.** Elapsed time is a real quantity with a real producer, and the ring's arc is
honest. But at `2h 36m`, the arc advances a tenth of one degree per second: across a nine-second
capture the words change once and the ring moves by a fraction of a pixel. The component is not
wrong; it is *unwitnessed*. The dial should carry the unit the eye can resolve — minute ticks
lifting as they pass, or the graduation band doing the counting — and the hours belong in the
caption. A measurement nobody can perceive is functionally indistinguishable from decoration, and
that is a claim about the reader, not about the data.

### `contextBurn` — Context burn

**Measured:** 5 of 17 changed, 1 of 12, `level`, 571px held. A bordered context field with
scattered tokens and `82% BURNED` at the foot; between the sampled frames individual tokens change
state.
**Refused:** 0 of 13, `CONTEXT UNMEASURED` in hatch bands, space kept.

**Does the motion measure something? Yes but barely, and the finding is painted.** Tokens switching
state as context is consumed is the right motion, and it is the honest shape of a burn: it happens
one item at a time. Two problems. The percentage is complete in the frame where no token has
switched yet — the same order-of-reversal as `admission` and `chipBudget`. And the individual
switch is a token going from one dark ink to another dark ink at ~3px: the level mark is on the
element and the change is below the threshold of the room. A burn should darken its field as a
field — the aggregate visible at a glance, the individual tokens as detail — and the `level` should
be on that aggregate.

### `coverage` — Coverage against unobserved

**Measured:** 8 of 17 changed, 2 of 12, `count` and `trace`, 571px held. Routes fan out from the
`MPS local` node; at 0ms there is a stub, by 443ms the fan is complete. The hatched
`UNRAIDED territory · no flight authorised` panel is drawn beside it, and remains.
**Refused:** 0 of 13, `NO SWEEP OBSERVED` in the hatched panel, space kept.

**Does the motion measure something? Yes.** The routes were flown, so they draw; the ground nobody
authorised stays hatched; the two inks never trade places. This is the doctrine drawn correctly,
and it is the second row on this sheet that shows what the rule buys. The one weakness: all routes
arrive inside a single sampled window, so the ordering — which is what a survey *is* — is invisible.
A `traffic` period measured from the sweep's own cadence would make the fan arrive in the order it
was flown; that number exists in the fixture and is currently unused.

### `dispatch` — Manifest dispatch

**Measured:** 8 of 17 changed, 2 of 12, `count` and `still`, 571px held. Three manifest rails
(`NARNASS`, `PURUL`, `ARIST`, `IDENTITY` as stages) with nodes that fill as stages are reached; the
foot line reads `1 OF 3 MANIFESTS COMPLETE` and one rail runs dashed red.
**Refused:** 0 of 13. The rails keep their stage geometry with hollow nodes, and the count line
becomes `0 OF 3 MANIFESTS COMPLETE`.

**Does the motion measure something? Yes — a stage advance is the cleanest thing a state machine
can animate.** Two notes, one of them the ink collision again. The dashed magenta refusal rails and
the dashed red not-complete rail are near-neighbours in meaning; when the switch is thrown, the
measured "this manifest is incomplete" and the refused "no manifest data exists" collapse into one
picture, exactly as on `city`. And `0 OF 3 MANIFESTS COMPLETE` is a computed sentence about data
the card has just declared it does not hold — a refusal that keeps a *count* is claiming it counted
nothing. It should read `NO MANIFESTS RETAINED` or similar: absence stated, not arithmetic performed
on absence.

### `dominator` — Domination authority

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 268px held.
**Refusal** 0 of 13 and byte-similar: the console (AWAIT ASSET / TERMINATE / PROVE EXISTENCE) is
text, and its refusal — `UNATTRIBUTED` — is already drawn as ink in the body.

**Does the motion measure something? Nothing moves, correctly:** a domination chain is a legal
state, not an event, and the one real absence (no attribution) is already written as the word
`UNATTRIBUTED` rather than a spinner. What to change is not motion but affordance: the three action
rows are drawn as bordered boxes, which is the library's *button* idiom — the same border the rack
switch and the theme buttons carry — and they do nothing when pressed. In a specimen whose whole
subject is an authority that only acts on presentation, a fake button is a lie about what the
interface will do. Square corners plus no hover, or a `PENDING PRESENTATION` word, and the idiom
stops promising.

## The Organism

### `dossier` — Identity dossier

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 177px held. **Refused:** 0 of 13, same pixels —
the refusal (`NO PROOF HISTORY`) is already drawn as ink in the body, and the disc that carries the
identity stays.

Correct stillness: a dossier is a record of what was proven, and there is nothing here that
travels. What the row shows is the *good* version of the drawn-refuser pattern — the absence has a
word on the drawing and the drawing keeps its 177px. The gap is the same one every other
drawn-refuser has: no `data-motion="still"` anywhere, so `DECLARED STILL` counts this row as zero
and a review script cannot tell it from a component that forgot.

### `envelope` — Demand envelope

**Measured:** 0 of 17 changed, 0 of 12, `still`, 571px held. The envelope trapezoid is drawn with a
filled dot at the plotted position, and `SAFETY BOUNDARY UNSUPPLIED` in red beneath.
**Refused:** 0 of 13 — the trapezoid stays, the word `NO POSITION IS DRAWN` goes inside it, and the
ECONOMICS and WORLD-LAW columns become hatch bands. Space kept.

**Does the motion measure something? Nothing moves, and one thing should.** The envelope's shape is
a claim about a boundary, and it is right that it does not animate — but the *dot* is a plotted
position with a time attached, and this library has a mark for exactly that: `arrive(t, sourceState)`.
A position that arrives at a time is the whole reason the trapezoid is drawn; showing it as already
there loses the only measurement-shaped event the specimen contains. Give the plotted dot an
`arrive` and refuse it to a stated absence when the stamp is missing, and this row goes from a
correctly dead drawing to the cheapest real motion in the family.

### `esperDive` — Evidence dive levels

**Measured:** 8 of 17 changed, 2 of 12, `count` and `trace`, 571px held. Four level boxes
(`SUBJECT → MAIN ITEM → ARTIFACT PATCH → ARTIFACT CONTEXT`) fill in order, the fourth staying
hatched, with the proof path and `NO FURTHER RESOLUTION` below.
**Refused:** 0 of 13; the levels become hatch bands around `NO DEPTH MEASURED`.

**Does the motion measure something? Yes — the clearest on this sheet.** A dive *is* an order, and
the frames show the order: each level's interior appears only after the one above it. The ink
collision returns for the third time: the hatched "not reached" level and the hatched "no depth
measured" refusal are drawn with the same bands, so a dive that stopped at level three and a dive
with no data look alike at a glance. Same fix as `city` and `dispatch`, and by now the pattern is
not per-component — see *The ink problem* below.

### `garage` — Assembly garage

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 219px held. **Refused:** 0 of 13, same pixels;
its refusal (`NO PROOF HISTORY`) is ink inside the loadout.

Correct stillness for a loadout: what is assembled is a fact, and a fact does not shimmer. Two
follows. Like `dossier`, the refusal is drawn but undeclared, so the honesty counters read this
row as unmarked. And the row heights inside the loadout are the tightest in the library at 10px
with ~7px type: legible at 1280 and 390, but the specimen has no way to say *"there are eleven
more rows and you are seeing four"* — an assembly whose history is longer than its frame has to be
truncated somewhere, and truncation without a mark is how a short list gets read as a complete one.

### `gauge` — Suit integrity

**Measured:** 6 of 17 changed, 1 of 12, `level`, **196px measured → 219px refused**. The arc fills
and the segment spine lights; the `43/60` label is complete in the 0ms frame.
**Refused:** 0 of 13, `UNMEASURED` in the dial's place.

**Does the motion measure something? Yes, and it is the row that taught the rule.** Integrity
draining as a spine of discrete segments, against an arc that only moves with a measurement, is
the library's best argument. The defects are two: the ratio `43/60` is stated before the arc has
filled (the caption-and-its-echo order bug again), and this capture makes a new one measurable —
**the refusal is 23px taller than the measurement.** Nothing violates the floor, but throwing the
rack switch moves everything below the card by 23px, which is a reflow caused by an epistemic
state. A refusal may be shorter or longer than a measurement, but not *differently sized*: the
drawing area belongs to the specimen, not to whichever state it is in. Same layout wobble to check
across every row in this file.

### `gevulot` — Gevulot visibility contract

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 223px held. **Refused:** 0 of 13, same pixels;
`UNATTRIBUTED` is drawn in red inside the contract block.

Correct stillness, correct refusal-as-ink, same two gaps as `garage` and `dossier`: undeclared, and
a text block whose overflow is unstated. One more, specific here: this contract is about *what may
be seen*, and the one visible affordance in the block reads like a control. A specimen about
visibility that cannot be seen through should not offer something that looks pressable.

## The ink problem, three sightings on one sheet

`city`, `dispatch` and `esperDive` all draw "this element has no measurement" with the same dashed
magenta / hatch treatment the card uses when the *whole specimen* is refused. Inside a measured
specimen that glyph means *not reached, not flown, not drilled*; in a refusal it means *the library
holds nothing*. Those are opposite claims — one is a fact about the world, the other a fact about
the data source — and the same pixels carry both, so a sparse board and a blind board are one
picture. The fix is one token pair (`--cd-refusal-*` distinct from the in-measurement absence ink)
and a check that the two never share a stroke; it belongs in the token layer, not in whichever
component noticed first.

### `glassCell` — Glass review cell

**Measured:** 8 of 17 changed, 2 of 12, `still` and `trace`, 571px held. A subject pane, a dashed
reviewer pane, a dashed sightline between them, and a small filled exchange crossing it — at 0ms it
is at the subject edge, at 443ms it is mid-way.
**Refused:** 0 of 13, and the 571px is kept.

**Does the motion measure something? Yes, and the split is exactly right.** The sightline is now a
declared stillness — a rule about who may look is not a quantity that travels — and the thing that
does move is the exchange, which is an event that happened. That is the discipline the branch was
meant to install, visible in one row. Two weaknesses: `PASSES 3 — BLOCKS 2` is complete at 0ms
while the first exchange has not crossed yet, and the crossing dot is ~4px, so the one honest
motion in the specimen is also the hardest thing on the card to see.

### `globe` — Hologlobe table

**Measured:** 16 of 17 changed, **11 of 12 loop**, `count`, `still`, `trace`, `traffic`, 445px held.
The mesh turns and route arcs surface at different places in different frames — an arc near the
north in the mid-entrance frame, a different one low-left four seconds in.
**Refused:** 0 of 13, **and the specimen still measures 445px**, the fix holding under a re-capture.

**Does the motion measure something? Yes — this is the library's argument in one row.** The mesh
turns on a stated frame convention with a stated period, the pins hold, and the routes appear
because they were flown. What is still weak is the part the component's own doc makes its claim:
the great-circle routing. At card scale the arcs read as short curve fragments and the endpoints are
2–3px, so the drawing says "a route exists" where the argument is "a straight line on a flat map is
the lie". The arcs need to be the loudest ink on the specimen, and the pins that carry a measured
`count` need to be bigger than the mesh they sit on.

### `grid` — Overview grid

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 168px held. **Refused:** 0 of 13, same pixels —
its refusal is the word `UNMEASURED` drawn into the matrix rather than an empty table.

A channel × time availability matrix is a snapshot of commitments, and a snapshot does not shimmer —
correct stillness. What the row shows is the missed motion: every cell is a state, and a state that
*changes* is an event worth marking (`traffic` on the row, `cycle` on the window). The fixture holds
a window and a cadence; nothing on the card uses either, so the matrix reads as a printed table.
The declared-stillness gap applies here too: drawn refusal, no `data-motion="still"`.

### `hardCut` — Hard cut

**Measured:** 8 of 17 changed, 2 of 12, `count` and `trace`, 571px held. Five boot stages fill in
sequence, then the red rule and the change line; the counters at the right (`ATTMOST LAST 4 / 17m`)
move with the stack.
**Refused:** 0 of 13. A hatch band around `CHANGE SET UNMEASURED`, the log line marked
`DIFFERENT UNMEASURED LINE`, `NOTHING BEYOND RULE TOLD` below, and the 571px kept.

**Does the motion measure something? Yes, and it is the idiom the whole vault is about.** This is
the fake-OS boot: stages are *entered*, one at a time, and the cut between states is a cut — no
tween, no shimmer. The counter at the right moving with the stack is what makes it a measurement
rather than a loading animation. Small sharpening available: the red rule that *is* the cut is
static ink, so the moment of cutting is carried only by the log line swapping — one frame of a
discrete jump, which is correct, but the eye lands there late. Widening the rule at the instant the
last stage lands would make the specimen's own thesis visible without adding a single decorative
millisecond.

### `ice` — Intrusion countermeasure walls

**Measured:** 7 of 17 changed, 1 of 12, `still` and `trace`, 571px held. Nested wall frames, green
outside, red dashed inside, with a shell inside them; a trace crosses as the frames complete.
**Refused:** 0 of 13, space kept — everything goes dashed magenta and the foot line reads
`0 WALLS NOT REACHED`.

**Does the motion measure something? Yes.** A wall is a barrier and the trace crossing one is the
event; the nested geometry is a claim about depth, correctly still. Two defects, and the second is
the same bug for the fourth time. `2 WALLS NOT REACHED` becomes `0 WALLS NOT REACHED` under refusal:
a specimen with no wall data reports that *zero walls were not reached*, which is a positive claim
about a world it has just disclaimed — same arithmetic-on-absence as `dispatch`. And the unreached
walls inside a measurement are drawn with the same dashed magenta as refused walls, so the third
sighting of the ink problem is now a pattern with a name.

### `individuation` — Individuation marks

**Measured:** 8 of 17 changed, 2 of 12, `count`, `level`, `still`, **314px measured → 571px refused**.
Sibling rows and a disc at the left; the disc appears mid-entrance.
**Refused:** 0 of 13 — the disc is drawn beside `NO SIBLING OBSERVED`.

**Does the motion measure something? The rows arrive as counted siblings, yes.** The finding here is
layout, not motion: the refusal is **257px taller than the measurement**, because the refusal draws a
full `W×H` frame *in addition to* the card body instead of inside the space the measurement used.
Throwing the rack switch moves the whole page below the card. `gauge` did the same thing at 23px;
here it is most visible. The floor catches collapse; nothing catches inflation, and both are the
same offence — the drawing area belongs to the specimen, not to whichever epistemic state it is in.
The gate should pair heights as strictly as it pairs drawing kinds: for card specimens the drawing
area is fixed by contract, so equal heights on both sides of the switch is not a preference but the
definition of keeping your space.

### `joiOverlay` — JOI overlay

**Measured:** 0 of 17 changed, 0 of 12, `still`, 220px held. **Refused:** 0 of 13, same pixels.

A projection status is a state, and this one is stated rather than animated — correct. The row is
worth two lines because it is the cheapest example of the pattern the pass keeps hitting: the
absence is honest ink inside the drawing and there is no `data-motion="still"` on anything, so the
counters cannot see a refusal that is being made deliberately.

### `keycard` — Access keycard rack

**Measured:** 7 of 17 changed, 1 of 12, `still` and `trace`, 571px held. Six sleeves in a rack; the
cards slide out of them across the entrance — one at 443ms, more by 883ms — and one sleeve is
outlined in red, the withheld card.
**Refused:** 0 of 13, space kept; the rack becomes dashed empty sleeves above a red count line.

**Does the motion measure something? Yes.** A card being pulled is an access event, the sleeves that
stay closed say which doors were not turned, and the sequence — which card, in what order — is the
record. The defects are the standing two. The withheld card is drawn in red dashes and the whole
rack refused is drawn in red dashes: the ink of *denied* and the ink of *unknown* are the same
pixels for the fifth time in nine sheets. And the foot line is an `N of M` count; under refusal it
has to keep reporting a number, and a number about nothing is the arithmetic-on-absence bug again —
`0 turned` and `nobody asked` must not share a sentence.

### `killmail` — Killmail receipt

**Measured:** 0 of 17 changed, 0 of 12, `still`, **308px → 296px refused**. A receipt: FIT, DAMAGE,
COST and the salvage rows, with the unpriced cost line in red.
**Refused:** 0 of 13 — the same receipt form with `UNMEASURED` in every slot and `UNPRICED` under
COST. No frame changes.

Correct: nothing about a loss is in motion, and the receipt shape carries the refusal, which is why
this row now reads as *a killmail with nothing on it* rather than as an error. One layout note in
the same family as `gauge` and `individuation`: the refusal is 12px shorter than the receipt it
refuses, so the switch nudges the page. Small, but it is the same offence and the same fix.

### `ladder` — Command ladder

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 352px held. **Refused:** 0 of 13, same pixels;
the refusal is the drawn `NO PROOF HISTORY` and the row that says who was skipped.

A promotion ladder is a record of who was passed over, and it should not move. Two observations that
generalise across the text specimens. At 352px it does not fill its drawing area even when
measured, so the family's card heights vary by content — which is fine for the rack and means the
height pairing rule has to be stated against the *drawing area*, not the whole card. And like every
text specimen in this file, the refusal is drawn and undeclared.

### `loopDeviation` — Loop deviation

**Measured:** 8 of 17 changed, 2 of 12, `still` and `trace`, 571px held. An `EXPECTED` rail with its
four scheduled marks above an `ACTUAL` rail whose events arrive and advance; two hatched
`NO REFERENCE TRACK` bands, and `NO DELTA IS COMPUTED` in red.
**Refused:** 0 of 13 — hatch bands and `NO EVENTS RETAINED`, space kept.

**Does the motion measure something? Yes — and this is the best *nested* refusal in the library.**
The events arriving are a measurement, so they move; the comparison against the loop's period is
refused *inside the measured state*, because the reference track is missing, and the drawing says so
where the missing thing would have been. That is exactly the distinction the honesty bar is for: one
number is known, the ratio it would have formed is not. Only flaw: the two hatched bands read the
same as the refused state, sighting number six.

### `magi` — MAGI deliberation

**Measured:** 6 of 17 changed, 1 of 12, `still` and `trace`, 571px held. Three hexagon cores —
`SALIUS` cyan, `BESSEL` magenta, `ANKIASER` dim and dashed — with verdict words and dashed links;
across the entrance the cores resolve their verdicts in order.
**Refused:** 0 of 13; the verdicts become `UNMEASURED`, the agreement line reads
`AGREEMENT UNMEASURED` over `0 of 3 ... UNMEASURED`, space kept.

**Does the motion measure something? Yes.** A verdict arriving after a vote is the reason the
idiom exists — the three cores deliberate in a stated order, the reference vault says so, and the
frames agree. `AGREEMENT UNMEASURED` inside the measured card is another good nested refusal: the
cores answered, and what they agreed on is the thing not held. Both standing defects are here too:
the not-consulted core is dashed in the same ink as a refused core, and the count line performs
arithmetic on the absence.

### `mfd` — Twin MFD deck

**Measured:** 7 of 17 changed, 1 of 12, `trace`, 571px held. Two pane bezels, a readout each, and
`SWITCHED SEPARATELY` between them; the trace wipes the pane rule as it resolves.
**Refused:** 0 of 13 — the deck keeps both bezels and the `PANE A / PANE B` labels, and prints
`ONE PANE SHORT` in the space the missing producer would have filled.

**Does the motion measure something? Yes.** A readout resolving under a trace is a value arriving
from a producer, and the deck's claim — that the two panes are switched separately — is carried by
the trace having an `order` and a `total`. The finding is about the number in the pane. The fixture
renders `04:12:33` at 12px in the place an operator reads a running value; nothing about it says
*captured* — no elapsed, no age, no "as of". A frozen time in a clock format is read as a running
clock, and the library has a whole doctrine against that confusion for the river's polls. A
timestamp should be drawn like a timestamp.

### `muthur` — MU/TH/UR console

**Measured:** 8 of 17 changed, 2 of 12, `count`, 414px. **Refused:** 0 of 13, and the console keeps
its frame — one unasked prompt where four answered queries were, `NOTHING ASKED OF THIS CONSOLE`,
201px.

**Does the motion measure something? Yes:** answers landing on a query list is a counted arrival.
This row is the one that *shapes* the layout rule the previous readings asked for. The refusal is
half the measured height and that is right — an unanswered list has one line in it, and drawing
four prompts to preserve the pixel count would be inventing questions. What must be preserved is the
*container*: the console frame, its bezels and its caption stay, and the drawing-kind check is what
proves it. So the rule is not "heights equal"; it is **the same drawing area, with as little in it
as the truth requires** — which is what distinguishes this row from `individuation`, where a whole
extra frame was added on top of the body.

### `needleField` — Needle field

**Measured:** **14 of 17 changed**, 2 of 12, `count`, 571px held. The busiest row in the library. The
field starts flat and dim at 0ms and rises needle by needle through the entrance, one needle amber
against a field of green.
**Refused:** 0 of 13 — the whole field becomes dashed magenta marks, space kept.

**Does the motion measure something? Yes, and this is what a measurement looks like at speed.** Each
needle is one discrete value, they arrive in the order the readings arrived, and the loop is nearly
silent (2 of 12) because a needle that has settled holds. The amber outlier is the finding, and it
is one needle among forty — the specimen is honest about proportion, which is more than most dashboards
manage. Nothing to fix in the motion; the only note is that the dashed refusal is a *field* of dashes,
which reads as static noise rather than as "forty needles have no reading", and that is the ink
problem again at its most repetitive.

### `oracle` — Fragment oracle

**Measured:** 0 of 17 changed, 0 of 12, `still`, 571px held. `5 of 5 exhausted`, fragment boxes with
`credential expiry · 3×`, and hatched bands beneath for what is not held.
**Refused:** 0 of 13 — the fragments become dashed outlines and the bands hatch harder.

**Does the motion measure something? Nothing moves, and this reading originally accused the card of
promising that something should. That accusation was wrong and is retracted.** Written from a
filmstrip frame too small to resolve punctuation, the string was logged as `credential expiry 3s` and
charged with being an uncounted countdown. What the card actually prints is `credential expiry · 3×`
under the label `SAME BLOCKER`, cited to `sessions[].state_reason`: the same blocker recurred three
times. That is a count of the past, not a claim about the future, and it is the honest shape of the
field. No change was made to `oracle`.

The lesson is about this file, not the component: a reading taken off a thumbnail is a hypothesis.
Both halves of the finding that follow were tested against the rendered string before anything was
edited, and one of them did not survive.### `oscillation` — Oscillation detector

**Measured:** 16 of 17 changed, **11 of 12 loop**, `still`, `trace`, `traffic`, 453px held. Ticks run
along a rail under a dashed `THRESHOLD 3` rule, with three hatched `UNMEASURED` bands below for the
state, phase and period nobody retained.
**Refused:** 0 of 13 — hatching over the whole specimen, `NO CADENCE RETAINED`, space kept.

**Does the motion measure something? Yes, and the row is the library's best single argument.** The
ticks are arrival times that exist, so they move; the period does not exist, so the band above them
stays hatched *while the ticks keep running*. Motion and refusal on one card, neither pretending
about the other — this is what the honesty bar is trying to show. Two small notes: the ticks are ~3px
wide, so the loudest honest motion in the library is drawn in the thinnest ink; and the still
threshold rule is right to be still, but a threshold with no ticks crossing it looks decorative,
which is a fixture problem, not a drawing problem.

### `queueState` — Request queue state

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 571px held — `NO REQUEST NEEDS AN OPERATOR`,
the board measured, and `OPEN 0` at the foot.
**Refusal:** 0 of 13 — the board becomes a dashed outline reading `REQUEST QUEUE UNMEASURED`, and
the count at the foot is a dashed `—`, **not a zero**.

**Does the motion measure something? No motion, correct — and this row is the model for the bug
four other rows have.** A measured empty board prints `OPEN 0`; a refused board prints an em dash
where the number would be. `dispatch`, `ice`, `magi` and `keycard` all keep an `N of M` sentence
alive across the switch and end up reporting a number about nothing. `queueState` is proof that the
correct pattern costs nothing, so those four are choices, not constraints.

### `radar` — Proximity radar

**Measured:** 16 of 17 changed, **11 of 12 loop**, `count`, `cycle`, `still`, 571px held. The wedge
turns and blips are present at different brightnesses in different frames.
**Refused:** 0 of 13. The plate keeps its rings, the caption becomes `NO SWEEP`, the
`inner ring fresh / outer ring stale` legend stays (it is a claim about the *rings*, not a
measurement), and `1 OFF-SCOPE — UNMEASURED` keeps its hatching. Space kept.

**Does the motion measure something? The sweep does; the contacts do not, and that is the named
gap.** The loop is real (11 of 12 frames differ) because `cycle` carries a measured period, and a
turning wedge is a measurement of time. What is wrong is the part the reference vault settles: in
M513-3 a contact firms *as the sweep crosses it* and then decays, and the library's own `radar.js`
doc says the whole point is "where the sweep left them". In these frames a blip is bright at 443ms
and bright at 883ms with no relation to where the wedge is. A contact whose brightness is unrelated
to the sweep is decoration wearing a measurement's costume — the fix is already designed (brightness
= a decay on `now − last_pass(contact)`, stamped `traffic`/`decay` so it can be refused) and it is
the single highest-value motion edit left on this branch.

### `redaction` — Redaction bar

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 247px held. **Refused:** 0 of 13, same pixels.

A redaction bar is a statement about withheld content, and it is drawn as ink. Correct stillness;
the drawn-refuser declaration gap applies (the `DARK` word is on the page and no `data-motion="still"`
anywhere), and there is nothing here that should move: content is either withheld or it is not.

### `river` — Attempt river

**Measured:** 10 of 17 changed, **10 of 12 loop**, `count`, `decay`, `still`, `trace`, 222px held.
Attempt ticks along a rail, and a **red segment at the right where the next poll was due and did not
land**.
**Refused:** 0 of 13 — `NO ATTEMPTS RETAINED` in the rail's place, space kept.

**Does the motion measure something? Yes — and this row contains the library's best-designed
behaviour.** A tick is an attempt that happened; the red segment is `cycle` refusing on overrun
rather than wrapping, which is the difference between an instrument and a spinner, and it is visible
here as ink at the exact place a reader looks when something is late. The weakness is scale: at 222px
the ticks are ~2px and the labels are ~6px, so the finding (the red overrun) is the only thing a
reader takes in from across the room, and the count of attempts — which is what makes the overrun
legible as lateness rather than as a gap — is the part nobody can read.

### `scaleCrush` — Scale crush

**Measured:** 16 of 17 changed, 3 of 12, `count`, **199px → 571px refused**. A hex board of fleet
cells filling in cell by cell, with red cells among the green.
**Refused:** 0 of 13 — two hatch bands around `BOARD UNCOUNTED`.

**Does the motion measure something? Yes.** Cells arriving as the board is counted, and a red cell
meaning a specific loss, is a measurement; the loop is quiet because a counted board holds. The
layout defect is the biggest one found: the refusal is **372px taller** than the board it refuses
(199 → 571), because the refusal draws a full `W×H` band pair into a card whose measurement occupies
a third of that area. Same offence as `individuation`, three times the size. The fix is mechanical —
the refusal frame should be sized to the drawing area the measurement used — and the gate should make
it impossible to ship again.

### `scanOverlay` — Subject overlay

**Measured:** 8 of 17 changed, 2 of 12, `arrive` and `trace`, 571px held. A hexagon resolving
`LOCK / ARM / HOLD / ARM`, dashed links out to `IDENTITY`, `AUTHORITY` and `FAILURE`, and
`Credential expired mid-run` in red.
**Refused:** 0 of 13 — the hexagon dims and the columns read `NOT READ`.

**Does the motion measure something? The mark says an order and the drawing ignores it.** The trace
is stamped with `order` and `total`, and a scan that resolves identity, then authority, then failure
in sequence is exactly the thing the mark is for. But in the 0ms frame `0-unacent · hermes · delFromex`
and `RETRY — NO GRANT` are already printed: everything the scan is supposed to *reveal* is there
before the scan has moved. So the animation is a hexagon doing calisthenics next to a form that
already answered. Order the reveals to the trace that claims them — a column is blank ink until its
`order` passes — and the specimen says what it thinks it says. The red `Credential expired mid-run`
inside the measured card is another correct nested refusal.

### `standardSheet` — Standard glyph sheet

**Measured:** 0 of 17 changed, 0 of 12, `still`, 571px held. Six glyphs with their words: `MONOTONE`,
`BLOCKED`, `NEEDS YOU`, `UNMEASURED`, `LANCED`, `DRAINED`. **Refused:** 0 of 13, same pixels.

Nothing should move on a legend and nothing does. This row matters for a different reason: the sheet
already draws a dashed magenta circle for `UNMEASURED`, which means the library has *one* glyph for
absence and is using it for two opposite claims — the ink problem in eight of nine sheets. The fix
belongs here: the sheet defines the vocabulary, so a refusal needs its own glyph on this card before
`city`, `dispatch`, `ice`, `magi`, `keycard`, `loopDeviation` and `needleField` can be asked to use
it. It is a one-token change with seven call sites, and the sheet is the place a reader learns it.

## The Telegraph

### `stockFlow` — Stock and flow

**Measured:** 8 of 17 changed, 2 of 12, `count` and `still`, 331px held. A station table with counts
arriving per row. **Refused:** 0 of 13 — the count column becomes `UNMEASURED` and the 331px holds.

**Does the motion measure something? The counts do; the flow does not.** This is the component whose
doc admits it has no stream mark, and the frames confirm it: quantities appear, and nothing travels
from one station to the next. A table titled *flow* that never shows movement along the line is a
claim the drawing does not support — and the fix is not decoration: a route with a measured transit
time gets a `traffic` period and the arrival at the far end gets an `arrive`, which is what makes it
flow rather than inventory.

### `strands` — Delivery strands

**Measured:** 8 of 17 changed, 2 of 12, `still` and `trace`, 571px held. Routes draw between stations
as thick green arcs, arriving one at a time.
**Refused:** 0 of 13 — every arc becomes a thin dashed magenta line and the event count disappears
from the foot.

**Does the motion measure something? Yes** — an arc drawing itself is a delivery that happened, in
the order it happened. The refusal is verified in the markup rather than inferred from the picture:
the route group goes from `data-delivered="1" data-motion="trace" data-index="0" data-total="4"` to
`data-delivered="0" data-motion="still" data-still-reason="nothing travelled this path"`. One defect:
the refusal *deletes the count* instead of marking it, which is the collapse pattern in miniature —
the count line is a drawing region and it has no `data-drawing` stamp, so the instrument cannot see
it go.

### `stripChart` — Phosphor strip chart

**Measured:** 0 of 17 changed, **4 of 12 loop** (all late — the `elapsed` interval re-painting),
`elapsed`, 585→571px. What is drawn is four hatched bands reading `ONE SAMPLE` and `NEVER MEASURED`
under a `NO WAVE` tag.
**Refused:** 0 of 13 — the bands hatch and the caption changes.

**Does the motion measure something? No, and the reason is the showcase, not the component.** The
library's only over-time instrument never draws a line anywhere in this app, because the bright
fixture gives it one sample and no series. Every other row in this file that refuses *inside* a
measured card is doing something honest; here the bright model is itself the refusal, so the two
columns on screen are nearly the same picture and a reader never sees what the component is for.
Fix is in `app/fixtures/telegraph.js`: the bright model needs a real series (it is a demo fixture,
fabricating it is legitimate and stating it is required), and this is the general lesson — a fixture
whose bright column is mostly absence hides the component it is supposed to demonstrate.

### `syncRatio` — Insertion sync

**Measured:** 0 of 17 changed, 0 of 12, **`still` only**, 571px held. Three hatched lane bands
(`NO PRODUCER`, `NO SERIES RETAINED`), a `SYNC UNMEASURED` verdict, and one green marker at the
present instant.
**Refused:** 0 of 13, byte-identical — the honest consequence of the mark fix that landed earlier on
this branch, when the axis went from `trace(true)` to a declared stillness.

Correct as drawn: with no series the ratio cannot be computed, and the drawing says so in three
places. Same fixture problem as `stripChart` though, and worth naming once for both: the bright model
carries no series, so the component is only ever seen refusing. `oscillation` proves the alternative
— a measured arrival stream *plus* a refused period, on one card.

### `tape` — Decision tape

**Measured:** 8 of 17 changed, 2 of 12, `count`, `elapsed`, `intent`, 275px held. Tape items arrive
and the open item's clock runs. **Refused:** 0 of 13 — one blank slot in the tape frame, 146px.

**Does the motion measure something? Yes,** and the height drop is the legitimate kind. The container
is kept — the tape frame is stamped as a drawing region and survives — and the content inside it is
as short as the truth: nothing is queued, so one slot is what an empty queue looks like. This is the
counter-example that stopped the "heights must be equal" rule from being written, and `gauge` and
`individuation` are the two that showed why some pairing rule is still needed.

### `tapeSplice` — Tape splice

**Measured:** 7 of 17 changed, 2 of 12, `still` and `trace`, 571px held. A reel timeline —
`NO TAPE | A1 | A2 | A3 | GAP | B4` — with a red notch at the seam, `1 EVENTS` at the foot and
`THE SEAM IS DRAWN`. **Refused:** 0 of 13 — `ONE REEL, NO SPLICE` in hatch bands.

**Does the motion measure something? Yes.** The unreels before the splice are drawn as *gaps* rather
than omitted, which is the library's `NO PROOF HISTORY` doctrine done properly: the absence has a
position on the timeline. Two nits: `1 EVENTS` is a plural applied to one, the kind of thing a reader
notices and then distrusts; and the event count vanishes under refusal instead of becoming a marked
absence.

## The Watch

### `tracker` — Bearing tracker

**Measured:** 16 of 17 changed, **11 of 12 loop**, `trace` and `traffic`, 571px held. Bearing rings
expand from a contact under a `TICK 2S` cadence, with `1H 30M CONTACT WAIT` stated beside them.
**Refused:** 0 of 13 — `NO CONTACT`, `CONTACT WAIT IS UNMEASURED`, `NO CADENCE`, the rings kept as
dashed arcs and the 571px held.

**Does the motion measure something? Yes — this is `radar`'s fix already built, in the same library.**
The rings redraw on a stated period, which is what `traffic` means, and the wait is a separate
measured quantity rather than an animation. The refusal even names `NO CADENCE` separately from
`NO CONTACT`, which is the distinction `radar` is missing. If the radar redesign is going to borrow
anything from the vault, it should first borrow this.

**Fixed on this branch, and measured.** Each placed contact now carries its own `cycle` mark on a
new `brightness` axis, spent against the producer's poll interval — the same number the wedge turns
on — so a contact firms as the sweep crosses its bearing and spends itself to a floor of 0.32 by the
next pass. `npm run verify:clock` (`app/verify/sweep-clock.mjs`) measures it in the browser rather
than asserting it: the wedge names a 10s poll at 0.30 spent with a 7000ms first turn; contacts at
0.15 and 0.64 spent run 8500ms and 3600ms, and elapsed-plus-remaining is 10000ms on every element,
which is what "same clock" means when the first animation is deliberately the *remaining* poll.
Across 1321 sampled frames each contact's progress ran 0→1 and reset exactly once per period —
a sawtooth against the pass, not a `traffic` breathe that recovers before anything arrives. The
third contact is 12s since its pass against a 10s poll, so `cycle` refuses (`poll is overdue`) and
the dot is drawn **ringed** instead of bright: the missing look-again is the finding. Remove only
`contacts[].swept_ago_seconds` and three contacts stay placed, declared `still`, unanimated, and
`data-band="unmeasured"`, while the sweep keeps turning — one measurement gone, its own refusal,
the rest of the clock untouched. The typed `band` word chooses ink only while the pass time is
measured.

### `triVision` — TrisonVision tabs

**Measured:** 8 of 17 changed, 2 of 12, `count`, 571px held. Three mode tabs (`HEALTH / COST /
AUTHORITY`), a field of hexes filling, one amber, one dashed.
**Refused:** 0 of 13 — the tabs dim, the hex field is replaced by `UNMEASURED` in hatch.

**Does the motion measure something? Yes for the hexes, and the tabs are right to sit still.** A mode
change is operator-caused; an interface that switches your optic for you while the tab glows is the
chrome the rule is about. Nothing on this card moves without a measurement, and the tab that would
move on a real switch would be stamped `intent()` by the operator's own hand. One weakness carried
from the ink family: the dashed hex inside the measured field and the refused field use the same
stroke — sighting number seven.

### `twoState` — Two-state choice

**Measured:** 0 of 17 changed, 0 of 12, **no marks**, 571px held. `RETRY` and `TERMINATE` as outlined
choices, `MOTHER IS PRESELECTED`, and the green-ruled line about the counter staying where it is.
**Refused:** 0 of 13 — an `UNDECIDED` hatch band replaces the rule.

Correct stillness: a choice is not an animation, and the preselection is stated in words rather than
implied by a glow. Worth noting against `dominator`'s fake buttons: here the bordered boxes are
*choices in the specimen's own argument*, with the sentence `IF YOU CHOOSE MOTHER` under them — the
difference between an affordance drawn honestly and one drawn decoratively is whether the drawing
says who acts.

# What the 51 rows add up to

Ordered by how much they cost to fix and how much they were hiding.

1. **Radar's contacts are not tied to the sweep** (`radar`). One row, named, and the fix is in this
   library already (`tracker`'s `traffic` on a stated cadence). Highest value: it is the specimen the
   vault is thickest with references for.
2. **The same ink means "not reached" and "no measurement" — seven sightings** (`city`, `dispatch`,
   `esperDive`, `ice`, `keycard`, `loopDeviation`, `triVision`, plus the dashed field of `needleField`).
   One token pair plus a glyph on `standardSheet`, which is where the vocabulary is defined, then
   seven call sites.
3. **Refusals that change the page height** (`scaleCrush` +372px, `individuation` +257px, `gauge` +23,
   `killmail` −12). The container must be kept, not the count: `muthur` and `tape` show a refusal
   legitimately halving its content and staying honest, so the rule is *same drawing area, as little
   in it as the truth requires*, checked against the drawing box rather than the card.
4. **Counts kept across the switch** (`dispatch` `0 OF 3 MANIFESTS COMPLETE`, `ice` `0 WALLS NOT
   REACHED`, `magi` `0 of 3 …`, `keycard`). A refusal that reports a number is arithmetic on absence.
   `queueState` already prints `—` where its count would be: the correct pattern exists in the
   library and costs nothing.
5. **A length with no state on it** (`ceremony` `ABORT WINDOW 10s`). ~~`ABOUT WINDOW 16s` and
   `oracle`'s `credential expiry 3s`~~ — both strings were misread off small filmstrip frames; see
   the correction at the end of this file. What survives is narrower: the bracket announced ten
   seconds over a gate nobody reached. It says `· NOT ARMED` now, and refuses to tick.
6. **Findings painted before the evidence arrives** (`admission`, `chipBudget`, `contextBurn`,
   `glassCell`, `gauge`, `scanOverlay`). The number is complete in the frame where nothing has
   arrived yet; the sum, the balance, the verdict should be the last thing drawn, because then the
   entrance is the argument instead of a footnote to it.
7. **Order claimed and not honoured** (`scanOverlay`: `order`/`total` on the trace while every column
   is filled at 0ms). One of the cheapest real fixes here.
8. **Motionless things drawn in the costume of live things** (`channel`'s inert orange waveform,
   `dominator`'s fake buttons, `gauge`'s refusal being taller than its measurement). Say what is not
   there, in ink — which is the rule the twelve drawn-refusers already follow.
9. **Fixtures that refuse instead of demonstrating** (`stripChart` `ONE SAMPLE`, `syncRatio` `NO
   SERIES`). The showcase never shows these two components working, because their bright models hold
   almost nothing. Bright models are the app's responsibility.
10. **Honest stillness, drawn but undeclared** (`dossier`, `garage`, `grid`, `gevulot`, `ladder`,
    `redaction`, `joiOverlay`, `twoState`…). `DECLARED STILL` reads 0 over a deliberate refusal, which
    is why the twelve are already in `FILMSTRIP.md`.

## Finding #2 is closed at the vocabulary, not at the sites

The two inks now differ in **shape** before colour: a refusal is a crosshatch
inside a solid border in `--cd-refusal-ink`; a measured absence keeps the single
45-degree hatch, the dashed border and the magenta of `--cd-signal-unknown`.
`refusal(reason)` stamps `data-refusal="1"`, and `refusalHatched()` composes the
crosshatch from two mirrored passes of the one existing texture — no new
`<pattern>`, because `test/draw-contract.json` holds the port's defs byte for byte
and a texture that can be composed without touching the port should be. `loopDeviation`'s
`NO REFERENCE TRACE` and `magi`'s `AGREEMENT UNMEASURED` are the first in-card
refusals to take it; a test holds coverage's magenta unraided region *out* of it,
so the distinction cannot quietly collapse back into one stroke.

What is **not** done: dispatch's rails, ice's walls, keycard's sleeves,
triVision's field and needleField's field of hollow rings still draw their
in-specimen absence in the gap ink. The vocabulary exists; those sites still have
to say which of the two facts they mean.

## Finding #3 is closed: the switch no longer moves the page

`app/verify/PAIR-HEIGHTS.md` (from `app/verify/pair-heights.mjs`) measures the specimen box
on both sides of the rack's own switch for all 51 components. The rule is **asymmetric** —
a refusal may shrink, it may not grow past the sentence it is obliged to print — and with
the fixes in, **no specimen grows past its allowance**; three shrink, each for a stated
truthful reason (`muthur` 414→201, `individuation` 314→157, `tape` 275→146), and the report
says why rather than hiding them. What it took: `scaleCrush` refused at the board's fixed
pixel size instead of a fluid poster; `individuation`'s refusal became the *row* it
replaces rather than a `W×H` frame; `gauge`'s +23 turned out to be its own refusal sentence
and is allowed by measurement, not by a widened constant; `ladder` stopped repeating a
paragraph once per verb.

The one rule that was *not* written: "heights equal". `muthur` and `tape` are the
counter-examples that killed it — reserving the measured height would put blank space where
an absence is being declared, and a reserved box reads as a quiet measurement.

## Finding #4 is closed: nothing counts what nobody reported

Four specimens did arithmetic on absence. The mechanism was not in the components but in the
fixtures: `app/fixtures/decision.js` declared the *absence* of a door or wall state as
`state: 'not_reached'`. That is not absence, it is a fate — a wall the sequence stopped short
of, which is a fact a halt earns. So the dark model reported five walls as untried, and the
component summed them into `5 WALLS NOT REACHED`, and the same shape gave `0 of 3 producers
contributed` for a bench nobody polled and `0 OF 3 MANIFESTS COMPLETE` for three sessions
nobody reported on.

Now: an unreported state keeps its own word (`UNREPORTED`), its own ink (refusal — nobody said
is not the same fact as something stopped us), its own shape (dotted, not the outline of a
turned door), and its own count. The denominators count what was reported: `1 NOT REACHED · 1
UNREPORTED`, `1 of 2 producers contributed · 1 UNRECORDED`, `1 OF 2 MANIFESTS COMPLETE · 1
UNREPORTED`. When nothing was reported the line says so instead of dividing: `TURN UNMEASURED`,
`WALL STATES UNREPORTED`, `NO PRODUCER STANDING RECORDED · 3 SEATS`, `MANIFEST STATE UNMEASURED
· 3 SESSIONS LISTED` — the population is kept because the session ids really are measured.

Two smaller things fell out. The absence was first printed **twice**, once as `6 states
unreported` and again beside it as `6 UNREPORTED` — one absence in two inks reads as two facts,
so the separate group exists only to carry a second ink when both kinds share a panel. And the
loudest line on the refused panel, `TURN UNMEASURED`, was rendered in the healthy data green:
the letters said one thing and the colour said the opposite, which is a green checkmark on an
unchecked row one size up. It carries the refusal ink now. The green sequence rail under the
labels stays green on purpose — the order of the doors *is* measured, only their states aren't.

## Finding #8 is closed: the costume an inert thing wears

Two specimens were charged with wearing live idioms while doing nothing. Read against the running
app, the first charge was half mine again — the actions are `RETRY ATTEMPT / TERMINATE / PURGE
EVIDENCE`, not the words I transcribed off the sheet — and `authority.js` was already doing the hard
part right: a granted verb renders a real `<button>`, every other state renders `<span role="note"
aria-disabled="true">`, because "a disabled button is still a button and still invites the press".
Exactly one pressable thing exists on the panel, and the test now asserts that number.

What was real is what the hue-only rule caught. Three states, three shapes was the claim, and
`ceremony_required` differed from a granted button by **colour alone** — amber against green, both
solid, both one-pixel borders. Pressed side by side in monochrome, a ceremony that will not act on a
click looks exactly like a grant that will. It carries a second rule inset inside its frame now
(`box-shadow: inset`), which is a shape, costs no layout, and reads before any colour is consulted:
solid = press me, ring-inside = exists and is weighted, dashed = no grant. `test/affordance.test.mjs`
reads the stylesheet for this, the way the token ratchet does, because the claim is about the rules
that ship and a screenshot cannot be asserted in a unit test.

The second specimen was not a false indicator by intent: `channel`'s glyph measures **amplitude** —
flat for a canonical observation, static for an unattributed one — which is a measurement drawn in
shape, and the deterministic noise is a function of the trust class, not a random walk. But it is
drawn in the same idiom the `traffic` marks use for a live signal, and nothing was said about it, so
the column is named now: `TRUST CLASS` … `SIGNAL NOISE · AMPLITUDE, NOT CADENCE`. And the
unattributed row — the class whose own definition is "no producer claimed this" — wore signal amber,
which says *hot*. It wears the refusal ink now, glyph and rule together, and `data-claim="unattributed"`
is the hook it hangs on. If a producer ever reports a cadence, that is a `traffic(period)` mark and
the squiggle earns a pulse; until then the header says what it is.

The fixture moved too: `capabilities` gained `TERMINATE`, because without a seam the second verb is
refused for a missing mutation and the showcase never rendered the ceremony state its own comment
promised. A fixture that cannot show a state is how a shape goes unreviewed.

## Finding #7 is closed: the scan reveals in the order it claims

`scanOverlay` stamped its leaders with `order`/`total` and then printed every answer in the 0ms
frame — `s-incident · hermes · dellpromax` and `RETRY · NO_GRANT` sitting there before the scan had
moved, the hexagon doing calisthenics next to a form that had already answered. The cause was not
sloppiness but a kind boundary: **`trace` animates geometry — paths, lines, rects — and no text at
all.** A mark on a leader says the leader travelled; it says nothing about the words at its end.

Each value now carries the same reveal position in the kind that animates an element (`count(i, n)`),
so line and answer land in the same instant. Read out of the running app:

    answer delays  [0, 60, 120]ms     leader delays [0, 60, 120]ms
    answer opacity at currentTime=0:  0, 0, 0   -- blank ink until the order passes

The label of each field stays printed at frame 0: `IDENTITY`, `AUTHORITY`, `BLOCKED BY` are the form,
not claims about the world. And a row nobody read is printed at once with no mark at all —
`NOT READ` at 0ms is a true sentence, and giving it a reveal would be a transition invented to make an
absence look like a process. The dark model ends up with zero reveal marks on the specimen, which the
honesty gate checks rather than this prose.

## Finding #6 is closed: the entrance is now the argument

Six specimens painted the conclusion in frame 0 while its evidence was still fading in — a balance,
a tally, a total already on the glass above rows that had not arrived. That is not decoration; it
makes the entrance a footnote to a verdict instead of the argument for it.

The rule: **a figure computed from other figures takes the reveal slot one past the end of the
population it is computed from** — `count(n, n + 1)`, or `level(..., { order: n, total: n + 1 })`
when it is a bar. `level` grew optional `data-index`/`data-total` and the runtime's `levelled` now
shares the delay formula `counted` and `traced` already used, so ordering one kind does not mean
downgrading it to a fade. Seven sites carry it: `admission`'s balance, `chipBudget`'s bar,
`glassCell`'s tally, `magi`'s contribution line, `keycard`'s and `ice`'s door/wall tallies, and
`dispatch`'s manifest line.

Verified where the claim actually lives — the running app, `getComputedTiming().delay`:

    admission   derived 414ms  inputs max 150ms   chipBudget  derived 150ms  inputs max 144ms
    glassCell   derived 150ms  inputs max 120ms   magi        derived 135ms  inputs max  60ms
    keycard     derived 154ms  inputs max  90ms   ice         derived 150ms  inputs max  72ms
    dispatch    derived 216ms  inputs max 135ms

`test/reveal-order.test.mjs` holds the rule without duplicating the timing formula (the runtime
computes `span * index/total` with `span` non-decreasing in `total`, so asserting ratio-greater and
denominator-greater forces the conclusion without a second implementation). Paused at `currentTime
= 0`, the derived lines are simply absent: no `5 NOT ADMITTED` over empty beams, no `PASSES 3 ·
BLOCKS 2` over sightlines still drawing.

Two things the gates caught that the plan did not anticipate. `dispatch` was first given
`count(workers.length, workers.length + 1)` — the last **part** on the panel sits at index 3 of 4,
so the summary of two workers landed *mid-chain*: its population is parts-across-workers, and the
reveal test refused the mistake. And `glassCell`'s new tally kept counting in the dark model, where
`blocked` survives because those rows are the cell's standing refusals rather than readings; the
honesty gate named it — `still marked count@cd-dc-tally with every measurement removed` — and the
reveal is now claimed only when a passage actually happened. Motion that outlives its evidence is
the sin this app was built to make noisy.

Two specimens were **removed from the finding rather than fixed**: `gauge` and `contextBurn` show a
final number while their arc or grain animates, but that number is not a summary — it is the same
single measurement the arc's extent is drawn from. A read of one measurement is not a conclusion
with missing premises, and delaying it would be a transition invented to look like reasoning.

## Finding #5 is closed — and the readings file was the defect half the time

Read again against the running app rather than the filmstrip, half of finding #5 did not exist. The
two strings I logged were mis-transcriptions off thumbnails:

| logged from the sheet | what the card actually prints | |
| --- | --- | --- |
| `ceremony` `ABOUT WINDOW 16s` | `ABORT WINDOW 10s` | 10 is the fixture's own value |
| `oracle` `credential expiry 3s` | `credential expiry · 3×` | a recurrence count under `SAME BLOCKER`, cited to `sessions[].state_reason` |

`oracle` has no phantom countdown and was not touched: a count of how many times a blocker recurred
is a fact about the past, drawn in the shape of a count. The retraction is recorded here rather than
quietly edited, because the next reader who trusts this file will otherwise go looking for a timer
that does not exist.

What survived in `ceremony` is narrower and real: the bracket stated a **length** over a gate nobody
reached, which announces ten seconds the operator does not have. A dimension is not a countdown — the
bracket is a labelled span between two gates — but a length with no state on it is the same family of
error the collar already refuses (`elapsed, because remaining is unknowable`). It now says
`ABORT WINDOW 10s · NOT ARMED`, or `· ARMED` when the gate is reached, and either way carries
`still` naming what is missing: an armed window with no elapsed stamp refuses to tick rather than
drawing a static number in countdown type. No fixture supplies an elapsed stamp, so none is invented —
the place where `cycle(elapsed, windowSeconds, sourceState)` belongs is written into the comment, and
it will decay the day a producer exists. If the length itself is never stated, the bracket reads
`WINDOW LENGTH UNREPORTED` in refusal ink and no number fills the gap.

### Two probe results that came out *for* the library

The bright model was checked against the dark model for all 51 components. Two render byte-identical
— `standardSheet` and `channel` — and both declare **no** evidence fields, so the fixture contract
holds: every component that declares a measurement visibly changes when it is removed. The first
version of that probe used string membership to ask "did this word disappear", and reported `grid`
and `strands` as unchanged; a positional diff showed the truth immediately — `grid` prints
`<td data-unmeasured="1">UNMEASURED</td>` where bright prints `82%`, and `strands` swaps every route
from `data-motion="trace"` to a stated `still`. A check that asks the wrong question about a string
finds defects that are not there; the same lesson the drawing instrument learned the hard way.

---

## Finding #9 — closed: the bright column showed refusals, and every `level` bar landed in the wrong column

The bright model is the showcase's demonstration. Twelve of them were mostly absence,
which means the moving half of the site was reviewed against drawings that never moved.
`stripChart` had no series to draw, `envelope` had no edges supplied, `joiOverlay`/`thread`
led with refused lanes, `oracle` stamped every held fragment as a refusal, `killmail` left
blank lines silent. Each was fixed at the end that was wrong — the component when it could
not draw what it was given (`stripChart` now draws a `polyline` through the retained
samples, in the lane it names, and throws if the caller points it at a lane it did not
draw), and the fixture when the component was right (`envelope` supplies two measured
limits and leaves the third unpriced; the fixture comment says so).

**A fixture that fabricates must say so, and show its motion.** `stripChart`'s series is
not a producer's readings; it is written in the fixture from `beforeS(i) + sin(i)`, with
the sentence "Fabricated here, deterministically" above it, and a test that requires both
the sentence and the absence of any actual `Math.random()`/`Date.now()` call. That test
failed on its first run: it matched the *prose* that forbids those calls, so it failed for
the right reason and taught nothing. Match invocations, not vocabulary.

**Every `level` bar in the library drew its measurement in the wrong place.** Writing the
series meant measuring where a scaled drawing actually lands, and `chipBudget`'s budget bar
is authored at `x=224..324`, holds `data-level="0.406"`, and finishes at **x≈91..131**. The
runtime applies `scaleX(level)`, and with no `transform-box`, an SVG element's transform
origin is the centre of the *viewBox* — `170`, not `0` — so the bar was scaled about a point
170 user units to its right and dragged past it. The counters all read clean: something
moved, and it moved the amount the measurement said. It just arrived 133 units from where
it was drawn, and stayed there, because the animation keeps its end state. A `level` is the
kind whose entire claim is an extent, and every one of them was wrong:

```
cd-fd-budget      authored 772..871 (screen px)   rendered 447..546   drift 325px
cd-og-wall (0.44) ends where its own left edge is, once anchored
```

Fix is four rules of CSS — `transform-box: fill-box` with `transform-origin: left center`
(`left top` on the `y` axis), for the marked element **and the `<i>` fill inside it**: the
runtime animates `el.querySelector('i') || el`, so a level on a track moves a node that
carries no attribute of its own, and the chrome's rule bar grew from its centre while every
counter on the page reported a clean reveal. `prefers-reduced-motion` restates it, because
the whole purpose of that block is to pin bars at their measurement.

Two new claims in the gate, one of them an instrument fix:

- **A level lands where it was drawn.** Authored edges come from `getBBox()` mapped through
  the *parent's* `getScreenCTM()` (untransformed), the rendered edges from
  `getBoundingClientRect()`, tolerance `1.5px + 3% of span`. Sabotage proves it bites: with
  the anchor rule removed it names `cd-fd-budget` and its 325px drift.
- **The route's specimen must mount.** The app is a hash router and the landing page carries
  its own live drawing, so `[data-specimen-view]` resolved on Home and this probe found zero
  level marks — it passed while measuring nothing. My own first sabotage run used
  `ROUTES=/component/chipBudget` without the `#`, the app showed Home, and I nearly shipped
  the claim blind. Now a `/component/<key>` route that does not mount its own specimen is
  named as a failure, since every drawing claim on that route would be reading a different
  drawing. Verified: a bogus key fails, a real one passes.

The ratchet is `test/app-fixtures.test.mjs`: a bright model must render a moving mark, or
be in `NOT_KINETIC` with a reason. It holds two members, both quoted from what the
components are for — `standardSheet: 'a legend is not a reading'`, `syncRatio: 'a total is
not a rate'` — and a third, `envelope`, had to be fixed rather than listed.

Five tests were superseded rather than silenced: `agents` fragments (composition is what the
refusal is about, and composition happens in the forecast band, not on the readings), the
`killmail` blank-line stillness (an absent field is a different claim from a denied charge),
`thread`'s observed lane (a reading reveals; the projection is refused at its `<ul>`),
`organism`'s missing-edge copy (the edges are named, not summarised), and the fixture
vocabulary test above.

## Finding #11 — closed: the bar was mis-anchored, and the title of this finding was wrong

The diagnosis filed here said the chrome's rule bar "speaks both dialects at once": `data-level
="0.406"` with a fill whose CSS width is the whole track, rendered at `0.189` of that track, and
notably `0.189 ≠ 0.406² = 0.165`, which is what double-encoding would have produced. The number
was right and the reading of it was not. A fill at `width: 100%` is not an extent claim — it is the
**track**, the thing the extent is measured against — so this host always had exactly one encoding:
the transform carries the extent. What was broken was the anchor. `scaleX()` scales about the
element's own centre unless told otherwise, so a bar holding the right reading was drawn from the
middle of the box outward, and a claim that divided its rendered box by the track came back with
something no arithmetic explains. The same defect the gate caught in `chipBudget` (finding #10) was
already fixed for every marked element by the anchor rule in `src/motion.css` — `transform-box
: fill-box`, origin at the left edge — which left this finding's headline pointing at a dialect
problem that had never existed.

Probed on the rendered page after the fix, both themes, 1280:

```
.cd-rule-bar   data-level="0.406"   inline `transform: scaleX(0.406)`
               transform-origin 0px 13px (left edge) · track 599px · bar 242.4px
               ratio 0.405 · left inset 1px (the frame)
```

The closing rule still holds, restated because the first phrasing is what misled: **one
measurement, one encoding** — either the transform carries the extent or the CSS width does — and
*which one* is now read off the page rather than inferred from the tag. The gate asserts the right
edge wherever the resting transform carries a scale anchored at the element's own left edge, and a
host that encodes extent in width still fails that test for the right edge and is measured on the
left only. What the claim is proven to catch was established by sabotage, twice, and the two runs
disagreed:

- **`transform-origin: center` on the chrome bar → red**, as it must be:
  `cd-rule-bar is a level of 0.406 that does not land where it was drawn: authored edge 34..631,
  rendered 211..454 (drift 177px / 0px)`. The mis-anchor that produced finding #11's `0.189` is
  caught on the left edge.
- **`scaleX(0.9)` written into the markup under a mark that says 0.406 → green**, and the first
  draft of this entry explained that green as sampling timing — "the gate measures at 200ms, while
  the reveal still owns the property". That explanation was wrong too, and the wrongness is the
  useful part. The runtime animates the fill to the mark's own value and *keeps* it
  (`fill: forwards`), so it owns the property permanently: the sabotaged bar rendered 0.406 at
  200ms, at two seconds, and after settle. No browser check can ever see that disagreement, because
  the page never shows it — but the export, which is what a review reads and what the
  byte-identity claim is about, said 0.9 the whole time.

So the hole is closed where it is visible: statically, in `test/level-encoding.test.mjs`. An inline
extent written by a host must be read from the mark (`mark['data-level'] ?? 1`), never a numeric
literal, and no app CSS block may put `transform-origin` at the centre of a level fill. Both rules
were proven to bite by the same two sabotages, which is the point of putting them in source: the
browser gate keeps its three real jobs — motion in flight, arrival of the extent, and byte identity
after settle — and stops being asked to detect a lie it is structurally unable to observe.

---

## Closed on the screen, not in the source (after #9)

Four of the rebuilt specimens were looked at, and three said something the code did not
say. `stripChart`'s series was checked against the render rather than trusted from the
formula: 12 points, `y = height - value*height`, first point `0,9` for value `0.5`, the whole
`polyline` inside the lane it names — correct, and my reading of a downscaled screenshot
("32.4% against a point at 21.8") was wrong, which is why numbers get probed.
`chipBudget`'s budget bar now sits under `26 / 64` filled to 40.6% of its track, anchored at
its own left edge: the visible proof of the anchor fix. The five chips spend 12+8+6 = 26 lit
and 10+22 graphite, which is the same 26, so the number and the picture agree.

- **`envelope` wrote "2 measured edge".** Count and noun disagreed on screen, and the count
  was a `3` copied from the library's default boundary list — so a caller that described
  four edges was described back as having three. Both now come from the caller's list. Test
  added in `test/organism.test.mjs`, including the four-boundary case and a check that no
  `N measured edge` survives.
- **`oracle` printed a drift it did not measure.** `HOST DRIFT / dellpromax → spark-02`
  under `cite: 'fleet.placement'` — one field. A drift is the difference between two
  placements, so the far end of that arrow was invented, which is finding #4's arithmetic on
  absence wearing prose. The row is now `HOST PLACEMENT / dellpromax · drift unmeasured`:
  what the cite holds, plus what it cannot support, in ink. A rule came out of it
  (`test/app-fixtures.test.mjs`): a fixture that prints a transition — arrow, drift, splice,
  revision — must cite both ends, and a transition word *negated in its own sentence* is a
  stated absence and needs no second source. The rule was sabotaged back to the old string
  and names the row, so it bites.

## Finding #12 — half closed: the envelope answers to its numbers now, `joiOverlay` still has its tick

### Closed: an envelope whose limits carry their own numbers

The finding said two things, and one of them was a misreading. `WORKLOAD UNSUPPLIED` is not stamped
across the middle of the operating space — it sits centred *below* the box, at y=142 — which is only
discoverable by looking, and it is the reason the second half of this entry stayed unfixed for so
long: the diagnosis pointed at a collision that does not exist. What is true is weaker and still
matters: the aggregate caption is nobody's claim about *this* strip, and the box's limits carried no
numbers at all, so the hatch read as a region rather than as an edge nobody priced.

The F-16 HUD is quoted for exactly this: it never draws a value without the limit it is read against
(`R 7.630` over `AL 500`), and where a value cannot be had it prints `xxx` **inside the field**
rather than deleting the field. The gauge now does both:

- the priced walls print their fraction beside their own name — `ECONOMIC 0.70`, `WORKLOAD` — and
  `SAFETY` gets a name at all, which it never had: its bar was a stroke the same weight as the box's
  frame, so it read as furniture;
- the unpriced wall prints `XXX` beside its hatch, in the field's own space;
- each boundary row under the box carries name, value and meaning on one line
  (`WORKLOAD XXX  The load the fleet carries before work waits.`);
- the note states the referent once, because the fractions have no unit and must not borrow one from
  the ceiling printed next to them: *Edges are fractions of their own axis; no unit was supplied.*

It took three placements to get this right, and the two failures are the transferable part. First the
number went at the **tip of the bar**, `0.70` a few pixels under the demand line — and it read as the
demand's number. Then it went in a label **one line above the boundary rows**, `SAFETY 0.44` directly
over `ECONOMIC` — and it read as ECONOMIC's number. Both times the arithmetic was correct and the
placement lied. The rule that closes it: **a number must sit on the same line as its name, or inside
its own glyph's space.** Anything else is available to the neighbour.

Still observed and accepted: `XXX` and `12.4 OF A 20 CEILING` are on adjacent lines at the right edge
— crowded at 340 units wide, distinguishable, and the strip is the nearer thing to the `XXX`.

Verified on the rendered page at 1280, both themes, plus the family route's refusal column: 9 gate
passes, `npm test` 273.

### Closed: the `+` was two frames crossing where neither had a reason to

No glyph, and no CSS pseudo-element — a probe over the rendered page reported `content: none` on every
`::before` and `::after` in the specimen. It was geometry: `.cd-th-canon` reserved `padding-bottom:
1.6rem` for the projection to overlap, while `.cd-th-overlay` only pulled itself up by `-.7rem`, so
0.9rem of the observed panel's own frame hung below the band's top edge. The band is opaque —
`background: var(--cd-void-raised)`, because an overlay that occludes nothing is not on top of
anything — and it is inset `1.4rem` from the panel. That combination covered the hanging border
*everywhere except its bottom-left corner*, leaving a short grey stub stranded in empty air beside the
band's inset. At any zoom it reads as a stray `+`, and at 518px wide it is invisible.

The reservation now equals the pull-up, `padding: .45rem .55rem .7rem`, so the two frames **meet**
instead of crossing in the middle of nothing. The band still overhangs the panel and is still lifted
clear of the observed rows — the idiom is the component's whole argument and it is unchanged — but the
corner now lands on the band's own edge, where something is actually adjacent to it. Verified on the
page at 3x, where the stub is visible in the before and gone in the after, and the observed box's
height fell from 75px to 60px as the CSS says it should.

The lesson generalises past this specimen: **a mark that nothing made is usually two drawings sharing
space by accident**, and the instrument for it is a zoomed crop of the suspicious region, not another
count. `app/verify/shot-one.mjs` and a five-line crop probe found in one look what three counters had
never noticed.

## Finding #10 — closed: one vocabulary for an absence

Twelve components refused by drawing — `DARK`, `UNMEASURED`, `NO PROOF HISTORY`,
`UNATTRIBUTED` in ink, nothing in the DOM. The reader saw the truth; the rack read
`DECLARED STILL = 0`, and a script could not tell "we declined on purpose" from "we forgot".
Rather than fix the remembered list, the instrument was written first
(`app/verify/declared-stillness.mjs`, output `DECLARED-STILLNESS.md`), and the true picture
was not the remembered one: **21** specimens draw a word from the absence vocabulary; **5**
declared nothing at all (`coverage`, `stripChart`, `tracker`, `tape`, `city`); **5** more
declared in a dialect of their own invention — `data-unmeasured`, `data-proof`,
`data-claim` — which a reviewer who knows the name can query and the rack cannot count
(`garage`, `grid`, `dominator`, `ladder`, `channel`).

The instrument's first run reported two offenders it could not name, and both were its own
defects: it case-folded the whole specimen, so `atField` was convicted for its fixture's
prose (`every host, including the ones dark`) and `mfd` for text it never draws. A drawn
absence is set in caps by the component that draws it; matching prose for state words
invents defects. That case is now a comment in the file, and a case-sensitive exact-word test.

**The rule the finding turns on: one vocabulary.** A private attribute is not wrong — it is
specific, it reads well in a diff, and it stayed. What was missing is a mark beside it,
because the mark is the thing the honesty rack counts. Stamps went on all ten sites, each
reason naming the field that is absent (`no placement was recorded on this host`, `the
producer sent no value for this cell`, `no producer states a ping per decision`, `no cadence
was measured for this trust class`, `no sample was retained on ${lane}`).

**The sweep crossed a line and an existing test caught it.** The first pass stamped
`refusal` over coverage's dark territory, and `test/marks.test.mjs` — written for the #2 ink
split, holding that coverage must not claim a refusal over a *measured* gap — went red. The
survey says nothing was flown there, which is a measurement of a kind, so coverage declares a
plain `still('the survey reports nothing flown here')` with its 45° hatch and dashed edge, and
carries no `data-refusal`. That distinction is now asserted in both files: a gate written for
one finding protects the other one.

The positive measurement, read off the running app at 1280 — the counter the finding says is
stuck at zero, on the ten pages that were silent:

```
channel 0→1   city 0→2   coverage 0→1   dominator 0→2   garage 0→1
grid    0→5   ladder 0→2 stripChart 0→3 tape    0→2   tracker  0→1
```

`test/declared-stillness.test.mjs` holds it: no drawn absence may be undeclared or
private-dialect-only, with non-vacuity assertions underneath (an empty vocabulary would make
the first claim pass over a silent library), and the coverage case pinned to `still` rather
than `refusal`. `NO CADENCE` and `NO CONTACT` joined the vocabulary because the tracker prints
them — the list is grown from what the library draws, never from what seems plausible.

## `no_blend_on_change`: the change window is ~300ms, and three sabotages were invalid before one was not

The Solari board's rule — a flap shows one face at a time — needed a check no assert in this file could
serve: `no_residual_motion` proves a thing settles, `constant_rate` proves a rate, and a crossfade is a
single well-behaved `Animation` with `fill: forwards` that satisfies both. So the gauntlet grew
`no_blend_on_change`: it finds the specimen's own field control (**on the `<li data-field>`, not the
button** — the button's text is only `remove`/`restore`, and matching button text would have made every
change-time gap report "no such control" forever), presses it *while the recorder is sampling*, records
when, and captures the specimen's words and its opacity animations every frame from there.

What it measures on the honest build, `#/component/hardCut`: **108 sampled frames across the change, 7
values leaving the panel, 8 arriving, 0 frames holding an old value and a new one together, 0 opacity
animations running on text.** A hard cut cuts.

Getting from "it passes" to "it passes and would fail" took four attempts, and three were invalid.

- **A `count` mark on the in-flight group** — invalid because that group is not rendered in the state
  this control changes. The check only ever sees faces actually on the page: a limitation to state, not
  to hide.
- **A CSS rule, `animation: sabotage-fade 900ms linear`, on every `[data-specimen-view] text`** —
  invalid twice over. Computed style reported the animation name, yet `getAnimations()` listed nothing:
  a rule whose `@keyframes` do not resolve creates no `Animation` object at all. Adding `infinite`
  changed nothing, which is how I knew the object was never there. A filter cannot catch an animation
  that does not exist, and my first report on this row blamed the filter for my own invalid sabotage.
- **Sampling too late** — the first probe read the window at +60, +180, +420 and +900ms cumulative and
  saw *zero* animations, which read as "this app does not animate on change". It does: at +30, +50, +70,
  +150 and +300ms the same window holds four animations on `<g>` targets with `opacity` keyframes. **The
  change window is about one entrance long, ~300ms**, and a check that samples at human cadence reports
  a clean it never looked at.
- **The valid one:** `hardCut` marking a text-bearing `<g>` with `count(1, 2)` — exactly how this library
  would produce the defect, a component stamping its own letters and the runtime fading them. Red,
  verbatim: *max 4 opacity animations running on text … a value that arrives through a half-state is a
  crossfade, and a hard cut is not a crossfade.* Reverted, green again.

Two rules, both bought: **plant the sabotage in the mechanism the code actually uses** (a mark, then the
runtime, then WAAPI opacity) rather than in a stylesheet that may never build an object; and **sample a
change at frame resolution**, because a 300ms window is invisible to anything that waits a beat. Also
bought, and recorded where it can do damage: a `python3 - <<PY` that opens a file for writing inside a
`write(...)` argument truncates the file even when the argument then throws. This entry was rebuilt from
git after exactly that.


## The deck had no common now: `river` normalised every lane, and an audio editor refuted it

`river` mapped time with a closure built inside each lane — `px(t) = gutter + ((at(t) - t0) / span) * (right - gutter)`,
`t0` and `span` from that lane's own first and last event. The consequence is invisible on one lane and fatal on
three: every run was stretched to fill the plate, so all lanes began at the gutter and ended at the right margin
however far apart their real last events were, and `now` resolved to **one x per lane**. A deck like that cannot
carry a playhead, a cross-lane event, or any sentence about which session started late — the timing facts a stack
of lanes exists to show were destroyed by the mapping.

The reference is `scope-envelope-violin.gif`, an audio editor: two named tracks stacked, **one ruler across the top
of the whole plate**, one playhead travelling the whole width. It is quoted in `SPECS-FOR.json` explicitly *as a
refutation* — the reading says the instrument's own travel column reads `N/A — no bright marker crosses the frame`,
because the playhead is dark ink on a light strip, so the thing this file is quoted for is invisible to the tracker
and had to be read with an eye.

The change: the deck computes `T0`/`T1` across every lane with two or more events, and every lane draws on it. A
lane that began late now begins late — lane B's first segment moved from `200.0` to `537.0` in the unit case at the
half-way mark of a six-minute deck, which is the whole difference between the two geometries. The ruler prints its
own end stamps (`00:00:00`, the mid-time, `00:06:00`) and the aria-label says *one shared time axis*.

Two decisions worth the ink. **The ruler and the now-line carry no mark and do not move.** The measurement on this
deck is the run ink, which travels because the run happened; a playhead sweeping left-to-right would move on nothing,
which is precisely what `MOVING WITHOUT EVIDENCE` is installed to catch — so "now" is a static line at a measured x
with its stamp printed beside it. And **a `now` outside the deck is drawn clamped and says so**
(`NOW OUTSIDE THE DECK — DRAWN CLAMPED HERE`), following `envelope`'s ceiling rule rather than silently stretching the
plate with time nobody observed.

The gate caught two defects in this change that no unit test would have. A centred now-label at the right edge hung
**past the viewBox** — `/families/river@1280-dark … text drawn outside its viewBox` was red on all 8 viewport/theme
combinations until the label anchors to whichever side has room; text escaping the plate is a plate defect, not a
cosmetic slip. And while writing the regression test for the empty-lane refusal I found that branch returning **before**
the awaiting cue, so a lane that is `needs_human` *and* has no run printed nothing about waiting — the loudest fact on
that row went missing exactly when the row was emptiest. Fixed, and pinned.

`lane_axis_shared` is a new gauntlet assert kind, and it measures what separates the geometries without asking the
DOM to confess timestamps: how many distinct **run-end** x values are on the plate. Asserted, not held. Green:
*2 run(s) — 2 distinct run end(s) (874.0, 407.9), 1 distinct start(s) (200.0), ruler=1, now-line=1* — the single
shared start is honest here, because the fixture's two sessions genuinely began together. Sabotage, restoring the
per-lane `px` verbatim: *1 distinct run end(s) (874.0)*, red, with the message naming the normalisation. Then green
again from a `/tmp` snapshot rather than a `git checkout`, because river.js carried uncommitted work — the trap two
commits ago sprang on `EYEBALL.json`.

Six unit tests in `test/river-axis.test.mjs` (falls inside the deck; late lane starts late; the plate prints its
deck; the ruler carries no motion mark; `now` is one line at the deck's x; a clamped `now` names itself; an empty lane
refuses and keeps its cue), gate green on `#/families/river` and `#/component/river` at both widths and both themes.
The gauntlet row that recorded this as *not held* — on the grounds that an assert cannot fail on a geometry the
component never draws — is now asserted, which is the outcome that entry was written hoping for.

## The HUD's cue rule, audited: the library draws three cues, and my instrument was wrong three times

`f16-hud-gcas.gif` was quoted against `mfd` last time with three demands. Checking `mfd`'s drawing killed two of
them and left one: a warning cue **arrives, holds while the condition lasts, and leaves** — the FLYUP limit cue
comes in around 2.7s of the window with GND PROX beside it and is gone by 10.7s. That demand does not belong to
`mfd`, which has neither a scale nor a cue element. It belongs to whichever components draw a triggered state, so
the residue became an audit: find every cue in the library, and ask each one whether it can leave.

**The inventory is smaller than the reference implies.** Rendering every fixture bright and reading its drawn text
nodes, virtually every uppercase phrase this library prints is a *label* (`PANE A`, `HOST`, `RATIO`, `PERIOD`,
`COST`) or a *measured value* (`12.4 OF A 20 CEILING`, `ECONOMIC 0.70`, `41/60`). The genuine condition-cues —
a state asserted of the subject, not a name and not an absence — number **three**: `IN FLIGHT` (`hardCut`),
`PAST THE CEILING — DRAWN CLAMPED HERE` (`envelope`), `AWAITING OPERATOR` (`river`). The HUD reference's cue class
is barely instantiated here, which is itself a reading: this library asserts very little about its subjects, and
when it does, the assertion is worth the scrutiny the reference demands.

**All three hold.** `hardCut`'s in-flight bar arrives with the value and leaves without it — the plate draws
`changed + 1` flight groups with `inFlight` and exactly `changed` without, and the readout row for in-flight stays
behind printing `UNMEASURED` rather than vanishing with the cue. `envelope` prints its clamp notice only past the
ceiling, and at double its ceiling it still names the *measured* position (`40 OF A 20 CEILING`) while the dot sits
clamped — the number and the clamp are separate claims. `river`'s operator cue follows the lane's **state**, not the
presence of ink: `needs_human` with a run draws it, `running` does not, an empty `queued` lane does not, and an
empty `needs_human` lane does — the case the axis work added.

**And the audit instrument was wrong three times before the tests were right**, which is the part worth keeping.
A word-substring scan over stripped markup reported `hardCut` printing `IN FLIGHT` with no in-flight — because
**`NOTHING IN FLIGHT` contains `IN FLIGHT`**, and the library deliberately draws that negation. Then a `endsWith`
match missed `PAST THE CEILING` entirely, because the drawn phrase is `PAST THE CEILING — DRAWN CLAMPED HERE` and
the cue is the *prefix*: a scan blind to prefixes finds no cue and reports the vocabulary as smaller than it is.
Then one regex — `class="cd-th-flight"` … `IN FLIGHT` — reached from a counted row's group across to the readout's
`IN FLIGHT` **label** and reported a second time that the cue never leaves. It does leave; the count of groups goes
7 → 6. Each failure has the same shape: matching drawn ink by fragment instead of by the whole drawn node. Every
assertion in `test/cue-liveness.test.mjs` now matches an entire text node, a group count, or a whole phrase, and
`hardCut`'s assertion counts groups precisely *because* the cue's words and the label's words are the same two words.

Written as four differential tests rather than a ledger with a vocabulary, because the vocabulary form needs a human
to separate cue from label anyway and gives them a machine they cannot trust. The tests can ring — deleting the
`envelope` clamp notice produces *"a position at double its ceiling is drawn clamped and does not say so"*, and the
original `hardCut` sabotage (a cue that never leaves) produced *"the in-flight bar is still on the plate with no
in-flight — a cue that outlives its condition"* — restored from `/tmp` snapshots, both files carrying uncommitted
work. The fourth test pins the vocabulary itself: if a fourth cue appears it inherits the obligation, and the
reading that produced it has to name the field that governs it before the ink is allowed. No gauntlet row: the
on-screen half of this rule is already held by `envelope-limit-named`, which asserts the honest page names
`12.4 OF A 20 CEILING` — and an absent cue is not something the browser can be asked to show. `npm test` 292.

## The radar never turned: a `cycle` mark with no geometry, and a gate that took three calibrations to see it

`hurricane-irma-radar-loop.gif` was quoted for the rule that a loop's step interval *is* the measurement. Writing
the assert for it found a defect first. `radar` stamps `data-motion="cycle" data-spent="0.3" data-period="10"` on
its wedge and **nothing else** — while the runtime's rotational branch is gated on `data-cycle-axis="rotate"`, a
attribute only ever stamped by `app/src/rules.js`, the Rules page's own dial demo. So the sweep fell through to the
default `cycle` branch: **one non-repeating transform on a wide fan, computed angle 0 the whole way**. A countdown
bar wearing a radar dial, printed on the component whose entire claim is that the survey comes round again — and
the runtime comment right above that branch says so ("the sweep an operator watches is the poll they are waiting
for — the one thing a radar drawn as a still picture cannot say"). The fix is two attributes on the mark, plus a
test each way: measured period ⇒ `data-cycle-axis="rotate" data-cycle-origin="100 100"`; refused sweep ⇒ no
geometry for the runtime to turn, because an unmeasured poll must not animate.

Then the instrument, which was wrong three times before it was worth its green:

1. **It read the wrong property.** The runtime drives the individual `rotate` property; my sampler read
   `getComputedStyle().transform` and got a plain matrix — `angleFirst: null` on a dial spinning at full speed. The
   same blind spot had already cost me a false green earlier in the day on `hardCut`'s CSS animation. Measure the
   property that is actually driven, with the matrix as fallback for hosts that author the shorthand.
2. **"Seam" is not a sound gate.** The first gate looked for the angle crossing 0. But when an animation *commits*
   its final `360deg`, the needle lands on 0 and that mimics a wrap exactly — so a dial that swept once and stopped
   reported "1 seam crossed, travel after the seam" and passed. Raw seam counts are now reported and explicitly
   **not** gated.
3. **Per-frame thresholds cannot see the defect they name.** The next gate counted reversed frames with a step
   threshold, and the eased-return sabotage — the exact thing the row exists to catch — **passed**: a 10-second
   reverse sweeps 0.6°/frame, under any threshold that a jump-seam would need. It printed *"0° travelled forward
   after the seam"* and stayed green. The aggregate is what works: **net rotation over total rotation** = +1 for a
   dial that only ever goes forward, ≈ 0 for one that eases back. That made A red: *net −350° against 665°
   travelled (sign consistency −0.525)*.
4. **One period cannot tell a repeating poll from a single extra sweep.** Removing `repeat: Infinity` leaves a dial
   that sweeps the partial, sweeps one full turn, then goes silent — which is indistinguishable from a poll for the
   first ~9 seconds, *because for the first 9 seconds it is one*. The window now samples until **two revolutions**
   have accumulated or the needle visibly stops moving (no two degrees in two seconds). That is what finally made
   the stall case red, at 16.8s, and the honest build green at 18.8s: *2252 frames, net 700° against 700° travelled,
   sign consistency 1, 1.94 completed revolutions*.

One diagnosis stays deliberately hedged, because the instrument cannot resolve it honestly: under the eased-return
sabotage the **stall** check fires first, at 7.1s, since an `ease-in-out` reversal is nearly motionless at the seam.
The message therefore says what the eye sees — *did not move two degrees in two seconds while the source was live —
a stall between polls, or an ease slow enough to read as one; either reading is the defect* — rather than naming a
mechanism the sample cannot distinguish. A red that sends the next agent to the wrong file is nearly as bad as a
false green.

`radar-loop-wraps-without-a-tween` is **asserted** now, and both directions are proven: honest green at 1.94
revolutions with sign consistency 1 and 0 opacity animations on the sweep; sabotage A red on consistency; sabotage
B red on stall. Gate on `#/component/radar` and `#/families/field`: 9 passes, byte-identity holding with the
runtime writing `transform-box`/`transform-origin` inline (that branch's own `remember()` was built for the Rules
dial and it survives a real page). `test/field.test.mjs` pins both mark states. Gauntlet 22 rows — **19 pass, 3
held, 0 FAIL** — with two rows flipped from held to asserted today (`river-lanes-share-one-now`, this one).
`npm test` 294.

## The wait with no terminus: the row was aimed at the wrong component, and the right one was already innocent

`in-flight-wait-draws-no-progress-bar` was filed against `dispatch`, with a hold saying the assert needed a
specimen whose wait was actually in flight. Reading `dispatch` now, the truth is blunter: **`dispatch` draws a
fitted-parts chain — three workers, three parts, a dashed chain at the first missing one — and has no wait in it at
all.** The component was chosen because "dispatch" sounds like sending-and-waiting. That is the same error as
`scanOverlay` (a map annotator, not a scanner) and `twoState` (a commit widget, not a cell), three times in one
week, so the rule stays written: **read the drawing, never the name.** The row records the mis-attribution in its
own `observed` field instead of being quietly retargeted.

The component that actually draws a wait is `collar` — and it was already doing the right thing. It cites
`evidence.operator.deadline_at`, **takes no deadline parameter**, and draws under `REMAINING` a hatched area reading
`NO DEADLINE SET`, with the plate's own note: *"Counting down to an invented instant is manufactured urgency."* That
is the barcode reference exactly — the scanning app says `Retrieving data, please wait…` and draws no bar, no
percentage, no remaining-time figure, because it knows it does not know. So this commit adds no drawing; it adds the
assertion that keeps it true.

`no_bar_where_no_terminus` looks for the three ways the claim "this much is left" gets made: a measured-extent mark
(`data-motion="level"`) anywhere in the specimen, a missing hatched area, and — **scoped to the REMAINING label's own
region**, not anywhere on the plate — a figure that reads as remaining time. The scoping is the whole instrument:
`collar` legitimately prints `2h 37m` elapsed, which is measured, and a plate-wide ban on duration patterns would
fail the honest component for the one number it is allowed. Green: *REMAINING label found: true; hatched refusal
areas: 2; measured-extent marks: 0; remaining-time figures in the label's region: none*. Sabotages, both red:
replacing the refusal with `ETA 4M LEFT` gives *"a remaining-time figure was drawn beside REMAINING (ETA 4M LEFT @
603,521) where no deadline exists"*; stamping `data-motion="level"` over the wait area gives *"the wait carries 1
measured-extent mark(s): an extent says how much is left, and nothing supplied a terminus"*.

`test/collar-wait.test.mjs` pins the same three claims without a browser, and my two attempts at it are worth more
than the tests: an `assert.match` regex for the hatch fill that refused to match a string the markup plainly
contains, replaced by the plain `includes` it was really testing; and a pinned elapsed figure of `2h 36m` that the
honest build "failed" — 9456 s is 2 h 37 m, so the test disagreed with the formatter, not with the drawing. **Assert
a figure's shape, or derive it; a pinned value that rounds differently is a red that means nothing.**

Gate green on `#/component/collar` and `#/families/river` (9 passes, byte-identity holding). Gauntlet 22 rows:
**20 pass, 2 held** — the two survivors are `globe-hue-caution`, an appearance lesson by design, and
`tape-sweeps-a-drawn-strip`, which no mark vocabulary can say. `npm test` 297.

## Re-reading the board for what it says about *rows*: one component gains a reference, one loses one

Coverage was 21 of 51 and the cheapest material was already on disk, so the question asked of each verified file was
"what else is in these frames?" For `solari-departure-flap.gif` — 22 observations at two-second spacing across 67
seconds — the answer was about the **rows**, not the flaps: every row keeps the same left edge and width the whole
clip; the row order never re-sorts; no row grew when its value did (16:25 and 18:20 sit in the same slot); only two
rows changed at all in 67 seconds, and each of those changes was marked **by ink as well as words** — `FINAL CALL`
arrives red, `GATE closed` arrives dimmed and lower-case. That is a demand on any list, and `stockFlow` is the
library's list of standing quantities, whose own note reads *"Tell them apart with the labels covered."* Quoted, and
now asserted by `slots_do_not_move`: left-edge spread, width spread, and no measured-extent mark anywhere in the
specimen. Green: *5 rows, left spread 0px, width spread 0px, extents 0*.

**The same read cost a coverage point, which is the point.** `dispatch`'s only spec-held source was this record — and
`dispatch` draws a fitted-parts chain: three workers, three manifest parts, a dashed chain at the first unfitted one.
The board does not inform that drawing any more than it informed `collar`'s row yesterday. `for` lists are "where the
reference actually informs", so `dispatch` came out of the record: **21 spec-held, but 20 honest ones before and 21
now** — the count held because a name-resemblance left as a real reading arrived. This is the third time this week a
`for` entry was chosen by name instead of drawing (`scanOverlay`, `twoState`, `dispatch`), and both rows now carry
their mis-attribution in their own text rather than being quietly corrected.

Sabotage A went green first, and the reason matters more than the eventual red: I wrote the sabotage as

```
<div …>
      style="width: ${140 + i * 40}px"><span …>
```

— after the tag's `>`. The `style` became **text content** printed on the card, and the widths never varied, so the
row correctly reported *5 rows, width spread 0px* over a build my edit had not actually changed. A sabotage that did
not apply certifies nothing, and the tell was sitting in the row's own measurement (`value=width` pairs all equal, and
a stray `style="…"` string now on the plate). Re-planted inside the opening tag: **red** — *"rows do not share a field
(left spread 0px, width spread 691.63px) — on the board the row's geometry is fixed and only its characters change."*
Sabotage B, an extent stamped into the rate row: **red** — *"2 measured-extent mark(s) in a stock-and-flow list: the
board draws a value in a slot and never draws how much it is."*

The ink-per-state half of this reading — `FINAL CALL` in red, `GATE closed` dimmed — is recorded and **not yet
asserted**. It demands a component with states to distinguish; `stockFlow` has none, and the queue components carry
their own colour discipline. Filed rather than forced: a reading that implies work the drawing cannot host is the
`mfd` mistake, and that mistake is already in the ledger once.

Gauntlet 23 rows: **21 pass, 2 held, 0 FAIL**. Gate green on `#/component/stockFlow` and `#/families/organism` (9
passes). Coverage tiers add up: 21 spec-held + 17 files-only + 13 nothing. `npm test` 297.

## The sweep that lied: thirteen components "still marked", and the sharded run was the defect

I started a full sweep to re-establish the 261-pass artifact after a day of library edits, and its partial log named
thirteen components for marks surviving the evidence switch — `glassCell trace@cd-dc-sightline`, `oscillation`,
`syncRatio`, `radar`, `scaleCrush`, `ceremony`, `globe`, `mfd`, `dominator`, `esperDive` and more. Every one of those
components is documented in `app/src/undeclared.js` as **already fixed into a declared refusal**, and every route I ran
afterward came back green. Running one shard alone: **67 passes over 16 routes, no complaint anywhere**.

The failure mode was the instrument, not the library. `app/verify/index.mjs` clicked the evidence switch, slept a fixed
600 ms, and sampled. Four shards share one dev server, and under that load the sample sometimes landed on a page React
had not re-rendered yet — the **measured render wearing the refused render's clothes**. Every mark on the page then
looked like motion-without-evidence, which is the exact defect that check exists to find. A check whose precondition can
silently fail reports its own failure condition as a finding, and I nearly spent the day fixing thirteen components that
were innocent.

The fix is to wait for the thing I am about to score, and to say so when it never happened:

```js
const beforeShape = await shapeOf();          // markup size, declared refusals, printed refusal words
await evidenceSwitch.click();
for (let waited = 0; waited < 4000 && !changed; waited += 100) { …poll… }
```

Three numbers, not one, because **twelve components refuse by ink rather than by mark** — a `still`-count delta cannot
see them, and my first attempt at this guard used exactly that and passed over a sabotaged build. With the click
disabled as a sabotage, the instrument now reports a single red — *"the evidence switch never took effect over 1
specimen(s) (9 mark(s) still on the page: the specimen markup, the declared refusals, and the printed refusal words all
read identical after the click) — this is the measured render wearing the refused render's clothes, so the mark, drawing
and height checks below are skipped rather than scored"* — instead of four copies of a bogus "still marked". Pages that
legitimately owe no refusal (`#/primitives`, a shape gallery with nothing to remove) do not owe the complaint either.

**`esperDive` was real, and it took the fixture fix to see it.** The same partial log said *"`esperDive` loses its
drawing entirely when the evidence goes"*, and this one was true: its `levels: []` branch returned a card whose body was
`''` — the refusal sentence printed underneath an empty picture. The Solari board's third argument is the standard: *a
blank flap occupies the cell, holds its position, and takes the same time to arrive as a digit, rather than deleting the
field and letting the row shrink.* So the empty dive now draws a hatched band at a level row's own geometry with `NO
DEPTH MEASURED` inside it, `still`-marked, in the same `viewBox` — no growth, which the pair-height rule would otherwise
catch. `SPECS-FOR` now quotes the board for `esperDive` (coverage 22), and the sweep's red was observed **before** any of
my edits, which is the only reason I trust the claim.

Then the fixture change exposed a second, worse defect. `esperDive`'s fixture declared `['levels[].value', 'levels']` —
the whole array as well as its values — so the dark model deleted the plate's shape, which is how the two columns drift
into being two different components. With the array kept and only its values nulled, four readout rows appeared, **all
carrying `count(i, n)`**, animating an arrival for values that had been taken away, unlicensed, with `still=0` beside
`peak=10`. The mark now follows the value it sits on: measured → `count(i, levels.length)`; unmeasured →
`still('this row was not measured')`; the floor row → `still('the record stops here; the floor is drawn, not measured')`
because `NO RESOLUTION` is a declaration about the record, not an observation arriving. `data-known` had been telling
this story all along and the mark simply disagreed with the attribute next to it.

Two-way proof, both directions run: old fixture + fixed component → **4 passes** (the drawing fix alone suffices); fixed
fixture + reverted component → **4 problems** (so the defect was the component's, and the fixture had been hiding it).
Five tests in `test/esper-empty.test.mjs` pin the band, the mark, the shared `viewBox`, the per-row mark rule, and a dive
that is motionless because nothing is known. `npm test` 302.

A note on my own arithmetic, since it is the kind that wastes an afternoon: I attributed the sweep's complaints to
routes by looking for `· /route` headers and got it wrong, because four shards write one stdout and I read it as if it
were one stream. The shard tag `[2/4]` was already there; grouping by it is what made the table legible. Interleaved
output needs the tag used, not just present.

## Clean sweep, and what it took to earn the word

After the guard learned what a legend is, the whole surface passes again: **261 checks over 63 routes × two widths ×
two schemes, `MOVING WITHOUT EVIDENCE` reading 0 on every one of them**, this time with the radar turning, the river
sharing one axis, the collar refusing its deadline in ink, and `esperDive` drawing its absence at a level row's own
geometry. The number is the same as the pre-vault artifact and means something different: it was taken over a build
whose motion had been measured against references, and by an instrument that now refuses to score itself over a page
that never changed.

Three things this sweep taught about instruments, in the order they hurt:

1. **A legend is not a reading.** `/component/standardSheet` and `/component/channel` declare `fields: []` — there is
   no measurement on a key or a trust-class legend for the toggle to take away — and my new precondition guard demanded
   that they change anyway. The exemption is now read out of `FIXTURES[label].fields` rather than hard-coded in the
   checker: *a licence that lives in the checker is a licence nobody reviews.*
2. **A count printed in a red run is a false green wearing a statistic's clothes.** The tool printed
   `8 passes over 2 routes × 2 widths × 2 schemes` on the same run that printed `✗ 4 with problems`, because the count
   line was unconditional and counted rendered configs rather than verified claims — and `grep passes` is the first
   thing any reviewer reaches for. The summary is now one line, one verdict.
3. **A snapshot restores a state, not an intent.** Undoing a sabotage with `cp /tmp/index.guard3.js` reverted a fix I
   had made *after* the snapshot was taken, and the file passed `node --check` looking entirely innocent. The diff is
   what tells you what the copy took back.

## 273 files on disk, 18 measured: the coverage tier that counted search hits as a vault

Task-3's contract is per component — the files a component is held against, and a motion spec read off frames — and it
stands at 22 of 51. The number that made that look close to finishable was the middle tier: *17 components with "files
only"*, which read as *we have pictures for those, we just haven't written the spec*. So I opened the biggest seeds
underneath it, and the tier was lying.

`rig` — 25 candidates, chosen to inform `gauge`, `ice` and `individuation` (Dead Space's RIG spine: stasis, kinesis).
Its four largest animated candidates: a combat cutscene; a **3D model turntable of the suit on a blue background**, which
is a character viewer and not an interface; a spaceship flying; and an **Undertale fan animation**. `spinner-console` —
11 candidates, chosen to inform `collar` and `joiOverlay` — is real film-UI stills from scifiinterfaces, of the
*Severance* spinner: a digit window cycling 000000–000006 under six coloured bands. It is a genuine interface, and it is
a **still**, while step 3 asks for entry order, real durations, easing and loop period; the device has no time in it at
all. Between 36 unverified candidates, zero additional references. One correction to my own first draft of this
paragraph: the `rig` seed does hold one verified file — a gifcities capture already quoted for `radar` — so the drift is
in the bulk nobody opened, not in the seed's every member. That is the difference between "the seed is worthless" and
what is actually true, and it is the difference the vault exists to keep.

So `vault/coverage.mjs` was changed to say what it knows. Four tiers now: **spec-held 22 · verified-unquoted 0 ·
search candidates only 17 · nothing 12**, and the middle tier's definition is `contentVerified` on a manifest record,
not a row in `MAPPING.md`. `COVERAGE.md` names the last tier *search hits, not references* and carries the story of the
two seeds, and `test/coverage.test.mjs` refuses the old wording outright — rename the label back to `files only` and the
suite goes red (*"the report calls a seed-mate count 'files only' again — that tier made 36 unverified hits read as
coverage"*), proven both ways in one sitting.

The honest shape of the remaining work is now legible, and it is not analysis. Eighteen files have been through the eye
and the frame counter; 255 have not. Coverage grows only by verifying a candidate into a reference, and the two seeds
opened today say the yield of verification-by-bulk is low, because a search subject returns the *thing* far more often
than a *screen showing the thing* — the splicer whose display never faces the camera, the radar dish on the hill, the
suit on the turntable. What is left is not "write the specs we can see"; it is that the material for most of these
components has not been found, and `gevulot` will not tell you and `ceremony` is a rite. `npm test` 303; coverage
`22 + 0 + 17 + 12 = 51`.

## Ink per state, enforced: a state difference has to survive a monitor with no hue discrimination

The Solari board's last unasserted reading — *FINAL CALL arrives red, GATE closed arrives dimmed and lower-case, so
"nothing about a difference is carried by hue alone here, each ink belongs to a different physical claim"* — was filed
against `stockFlow` and correctly refused there (a stock list has no states). Its real home is the library's
state-bearing components, and the library already has the rule in a comment (`river.js`: "Event kinds map to shapes,
never to colour alone"). So `test/state-legibility.test.mjs` makes the rule a check instead of a comment: **a state
difference must be legible without colour — in the form drawn, or in a word printed inside the state's own group.**

The instrument had one false start of the kind this vault keeps meeting. The first draft compared each state's raw
markup, and *could not fail*: two doors side by side differ in `x` for reasons that have nothing to do with their state,
so every pair "differed" and the guard was decorative. The form signature now strips every coordinate
(`x y x1 y1 x2 y2 cx cy r points`) and keeps only shape, `stroke-width`, `stroke-dasharray`, `fill`, `opacity`, plus the
printed words. Same lesson as the radar dial's thresholds, one abstraction level up: **compare the property that carries
the claim.**

What it found is that the library is currently innocent, in five places, and the test says *how* each one is legible:
`keycard` draws open at stroke 1 with a diagonal, shut at stroke 2 with a floor line, and not-reached as a dashed
outline with nothing in it; `twoState` distinguishes chosen from unchosen by dash and weight, never warmth;
`dispatch` breaks the chain's form at an unfitted part; `needleField` gives an unreported worker a dashed ring rather
than a needle "pointing somewhere plausible"; `syncRatio` prints the verdict word and its sentence from `SYNC[key]`, so
the CSS colour is confirmatory rather than load-bearing; and `river` colours a `needs_human` lane amber **and** prints
`AWAITING OPERATOR` — which is exactly the board's move, ink *and* words, and the test now depends on the words staying.

And one retraction, written into the test itself rather than into my memory. The first run reported a defect:
*"syncRatio: stalled and spinning draw the same forms and print the same words — the only thing telling them apart is
CSS colour."* That was my call shape, not the component's: `state` and `output` are channel objects (`{ known }`) and the
word comes from `verdict`, so passing `state: 'spinning'` as a string made both renders agree on the fallback
`UNMEASURED`. A differential is only as good as its contract, and a red that comes from the harness is worse than no
red, because it teaches the reader to distrust the next true one.

Both channels proven red on command: making `SYNC.stalled` share `spinning`'s word gives *"the only thing telling them
apart is CSS colour, which is the distinction the rule says must not live in hue alone"*; deleting the amber lane's words
gives *"the lane that owes a person stopped saying it, leaving hue to carry the whole difference"*. Restored from `/tmp`
copies, and `git status` confirmed clean apart from the new file. `npm test` 309; gate 24 passes over
`syncRatio`/`keycard`/`dispatch`/`needleField`/`twoState`/`river`.

## `coverage` gets its row, and the instrument had to be fixed twice to earn it

The hurricane loop states three demands — `radar` (asserted), `coverage`, and `tracker`. Writing the `coverage` row
turned up two problems before it produced a result.

**The reading doesn't land where it says.** It asks that "the plate and its legend are untouched by the animation", but
`coverage` draws no graticule and no colour key: it has contours (`trace`, measured), posts (`count`), and the dashed,
hatched `UNMEASURED / terrain unrendered` ground. So the demand's real home is *that block must not move while the
survey arrives* — and demanding an untouched legend from a component with no legend would have been the `mfd` mistake in
a new costume. The row says so in its own `observed` field.

**The instrument could not see motion.** The first run failed with *"6 contact element(s), 0 with an animation of their
own … nothing moved either"*, while `probe-anims.mjs` showed six `strokeDashoffset` animations running at +120 ms and
none by +600 ms: the entrance is real and lasts about half a second. Two bugs, one line each. It read the animation
count from the **last frame of the window** — settled ground by definition — so liveness is now counted per contact
across every frame. And it asked `getAnimations({ subtree: false })` on the `<g>` the selector matched, while the
runtime's animation sits on the child `<polyline>`: the file's own comment warns that *"a default that reads 'still'
from a moving thing is the worst kind of instrument"*, and the per-element count had been doing exactly that while the
page-wide count had been fixed. Same fix applied to `dead_cells`, where under-counting liveness *inflates* the dead-cell
total and so makes its own row easier to pass — `chipBudget` still reports 7 of 12 quiet, so that claim survived a
sharper instrument rather than being re-tuned to it.

**Stillness is not only position.** With liveness fixed, the row passed on the honest build — and stayed green over a
sabotage that put a mark on the hatched ground. A pulsing absence never leaves its box, so a drift check sails right
past it, and an absence that breathes reads as a quantity. `furniture_still` now fails if any furniture element carries
**an animation or an opacity change at any point in the window**, not merely a translation: *"1 furniture element(s)
carried an animation of their own (cd-fd-dark|UNMEASUREDterrain) — furniture that animates is furniture asking to be
read as a measurement."* All three furniture rows stay green on the honest build, so no legitimate label arrival got
caught by the new arm; radar's furniture really is untouched.

Two invalid plants on the way, recorded because they are the failure mode, not an aside: the first sabotage used
`decay`, which `field.js` never imported, so the component threw and the harness reported a `waitForSelector` timeout —
right result, wrong reason, and the loudness is the only thing that made it survivable. The second imported `decay` but
called it in a way that creates no `Animation` at all, so the row passed over a "moving" absence and looked like a
verified green. The third plant — `count(1, 2)`, the known-good one from the `no_blend_on_change` work — went red
immediately. **A sabotage that produces no animation object tests the harness's patience, not its eyes.**

Also removed while in there: `furniture_still` existed **twice** in the `else if` chain, identical, the second copy
unreachable. Anyone patching the copy at line 777 would have changed nothing at all and had every reason to believe
otherwise. Gauntlet 24 rows — **22 pass, 2 held, 0 FAIL**; gate 4 passes on `#/component/coverage`; `npm test` 309.

## `tracker`'s demand, closed in the dialect the drawing can actually speak

The hurricane loop's third demand — *"a value entering the plate is already drawn at its measured value, not faded up to
it"* — came from measuring a saturated cell sitting at 0.25 of its final extent at half duration: a new observation step
*appears* at full reflectivity instead of growing into itself. Read literally against `tracker` that would demand
snap-to-length bands, and `tracker`'s bands are `trace` reveals of *measured waits in arrival order* — the library's
licensed reveal. Demanding the raster claim of a weather cell from a survey arc is `mfd` again: a reading implying work
the drawing cannot host. So the demand was translated to the dialect the plate actually has, and it is narrower:
**the printed figure is a measurement already taken, so nothing animates it.**

`test/entered-values.test.mjs` holds that. `OLDEST WAIT` and its duration must be outside every marked group, and
`tracker`'s mark kinds are a named whitelist — `trace` reveals a measured band in order, `traffic` is the recorder's own
tick, `refusal`/`still` declare absences — so any new kind appearing on this plate has to be argued for in the test. An
elapsed counter is forbidden by name (this plate's whole reading is one measured figure, not a running one) and so is a
`decay` (*"a figure that decays is a figure being spent, and this one was taken already"*). Proven by planting a
`count` over the duration: *"the duration itself sits inside an animated group — a measured wait restated as something
happening."*

Three of my own errors are in this file's history and each is the kind that fakes a green. The first render used
`{ oldest, ticks }` — real props are `{ oldestWaitSeconds, sourceState }` — and produced `NO CONTACT / EVERY WAIT IS
UNMEASURED / NO CADENCE`: a **plausible refusal face**, which I nearly asserted invariants about; a wrong call shape
that renders a refusal looks exactly like a passing test if the assertions are negative enough. The second was the
arithmetic again: 9456 s asserted as `2H 36M`, and the honest build printed `2H 37M` because the formatter rounds up —
the same mistake I made on `collar`, now with an exact multiple (5400 s) and a comment saying why. And the earlier
`decay` plants on `coverage` are written up above: one threw because the module never imported it, one created no
`Animation` at all, and both looked like answers.

`tracker` was already innocent. What changed is that its innocence is now a claim with a fence around it, and the fence
quotes the reference that justifies it. `npm test` 312.

## The ledger is green, and the notes said it was red: re-run the instrument before repeating the number

The largest item on the standing debt list was the twelve components that "refuse by drawing rather than declaring" —
ink that reads `UNMEASURED` or `DARK` with nothing in the DOM saying why, so a review script couldn't separate a
decision from an oversight. It is closed: `app/verify/declared-stillness.mjs`, which harvests the library's own absence
vocabulary and renders every bright model server-side, reads **0 of 22 undeclared**, and `verify:stillness` is already a
package script. Before writing that up as news I made the instrument prove it: taking `city`'s
`refusal('no placement was recorded on this host')` off the group that draws `DARK` moves it to **1 of 22**; restoring
returns it to **0**. Green that cannot be made red is not a result, and this ledger had not been re-sabotaged since the
last component was fixed.

The stale claim was not in `AGENTS.md` — that file had already marked the `killmail` mis-stamp *"fixed on this branch"*,
with the two test halves named. The stale claim was in **my own carried-forward summary**, which still described both
gaps as open, and it was specific enough to send me off "fixing" two closed findings. That is worth writing where the
next reader will see it, because every long-running session on this branch inherits the same hazard: a summary is a
photograph of the work at compaction time, and the work moved. **Re-run the instrument, or read the bullet in the file —
the file carries the corrections, the recollection carries the drift.**

## Going to ask whether `queueState` needed a row, and finding a false all-clear instead

The last two named demands without gauntlet rows were `queueState` (Solari: *a change arrives by FLIP; only the cells
whose value changed move*) and `killmail` (barcode: *a charge record arrives already priced*). Neither can hold a row.
`killmail`'s claim is already asserted where it is checkable — `test/agents.test.mjs` renders a priced receipt and an
unpriced one and compares their marks — and `queueState` carries **no marks at all**: it is a static plate, so a row would
be a filmstrip of nothing moving, which is `mfd` in a new costume. Solari informs its *vocabulary*, not its motion. Both
recorded rather than built.

Reading `queueState` to write that down found the defect. Its headline is chosen by `counted`, which is the test *"did
anybody reach the board"* — not *"did a count arrive, and what is it"*. So:

```
queueState({ sourceState: 'live', openCount: 3 })   →  NO REQUEST NEEDS AN OPERATOR   over   OPEN 3
queueState({ sourceState: 'live' })                 →  NO REQUEST NEEDS AN OPERATOR   over   OPEN 0
```

A queue plate whose headline denies the number printed underneath it, and a zero made out of absence, in the one sentence
the plate exists to get right. Nothing caught it because nothing rendered it: the showcase fixture is the measured-empty
story, the two tests drew measured-empty and unreached, and so the lying path had no caller anywhere in the repository —
the live-caller-gate failure mode, inside the library. The evidence for that is the fix itself: three faces changed their
printed words and **zero existing tests failed**.

The fix separates the two claims into three empties. Only a measured empty board gets the all-clear; a board holding work
prints `3 REQUESTS WAITING` / `1 REQUEST WAITING` beside its own number; a board that was read but never counted prints
`REQUEST COUNT UNMEASURED`, `BOARD READ · NO ALL-CLEAR IS CLAIMED`, hatching where the numeral would be, and declares a
`still` refusal; the unreached board keeps its words. My first version dashed the frame of anything that was not an
all-clear, which would have put a *measured* board holding three inside the unmeasured frame — trading one lie for
another, caught by the library's own grammar rather than by taste.

Three guards, each proven against its own half of the bug: the wording test goes red when `clear` is chosen by `counted`
again (*"did not match /3 REQUESTS WAITING/"*), and the count-missing test goes red when `hasCount` collapses back into
`counted` (*"a zero with no count behind it is not a measurement"*). `state-legibility` now holds all four faces apart —
clear, holding, uncounted, unreached are the four answers that change what an operator does next, and none of them may
live in hue. `npm test` **315**, gate 5 passes on the telegraph family with `lying=0`, full sweep **261 clean**, both
sabotages restored with `git diff` showing only the intended change.

## A row that cites a picture and a row that imitates one are different claims, and the file could not tell them apart

Every named demand is now asserted or recorded as unassertable, which meant the closure lived only in prose. Turning that
into a check surfaced the shape of the problem: comparing `SPECS-FOR.json`'s for-lists against the gauntlet's rows gave
**28 named components, 13 with a row, 15 without** — and six rows whose cited reference does not name their component at
all. Four of the six (chipBudget ×2, glassCell, esperDive) are honest borrowings: the *demand* was measured on those
frames, and no one claims the picture informs that drawing. The sixth was mine: `dispatch-unchanged-rows-hold` asserts
dispatch against the Solari board, and two commits ago I removed `dispatch` from that board's for-list because its only
relation was the word "dispatch". Both of those things are true — the slot-geometry invariant really was measured across
22 observations of that board, and the board does not inform dispatch's drawing — and the format had no way to say so, so
a corrected attribution looked exactly like drift.

So `GAUNTLET.json` rows now carry `referenceRelation`: **18 `informs`, 6 `origin`**. An `informs` row must appear in that
record's for-list; an `origin` row must *not*, and must carry an `originClaim` saying how the picture entered (≥160
characters, and it has to name the for-list relation it is disclaiming). `test/gauntlet.test.mjs` refuses all four ways
to get this wrong, each proven red individually: demoting `hardCut`'s row to dodge a for-list that does name it, deleting
a claim, deleting the field, and reducing a claim to `borrowed it` ("11 characters is a shrug, not an argument"). An
origin row is never coverage, which is now enforced by construction rather than by memory.

Wiring that label into the sheet then found the larger defect. The canvas width was computed from the **specimen** strip
alone, and a reference frame tiled to the same height is usually wider than a specimen cell — so the strip loop hit the
right edge and `break`-ed, silently. **`chipBudget-constant-rate` was showing 1 of its 6 reference frames. `glassCell`
and `stripChart` showed 2 of 6.** Sheets held up as side-by-side motion comparisons were displaying one or two frames of
the thing being imitated, and nothing said so. Fixed at the cause (width now takes the wider of the two strips) and kept
as a check: any strip that still drops frames is named in `sheet-index.txt`, and it currently reports none. Labels are
now cut by `draw.textlength` rather than by a character count, because three header lines had been running off the edge
mid-word — including the new `ORIGIN ONLY` line, which is the one line on that sheet nobody may be allowed to truncate.

One trap on the way: after the builder crashed mid-run I read `sheet-index.txt` and quoted its contents — written by the
*previous* run. A generated artifact that survives a crash is a rumour about the current build. `rm` the index before
regenerating is the habit now, same family as checking that your sabotage reached the build.

Gauntlet unchanged at **24 rows, 22 pass, 2 held, 0 FAIL**; `npm test` **316**; the corrected `chipBudget` sheet is
5792px wide and shows the install marker crossing all the way across, which is the claim the row has been making about
constant rate since it was written.

## Every reference that names a component now owes a named artifact, and it turned out the work was already done

A closure that lives in prose is the drift hazard this whole branch keeps hitting: the session ends, the next one inherits
a summary, and nobody can tell "we asserted that" from "we meant to". So `vault/DEMANDS.json` now lists all **28 targets**
named in any `SPECS-FOR.json` for-list, each with a one-sentence claim (what the picture demands of the drawing) and the
artifacts that close it — `test/demand-coverage.test.mjs` refuses a target with no closure, an orphan closure, a closure
naming a row that is held rather than asserted, a test title that is not in the file it cites, a claim short enough to be
a label, and an asserted row that no closure owns.

Making the closures precise caught two false friends. A call-site grep matched `coverage.test.mjs` to the `coverage`
component — that file asserts the **vault's coverage tiers**, not the component; the real closure is
`field.test.mjs: "unmeasured terrain is a hatched void with the word on it"`. And `trace`'s nearest matches were the
app-side tests about marks surviving the evidence switch, when the claim is about a trace ending — `agents.test.mjs: "the
trace is deterministic, so two captures compare"`. Both would have been green and both would have been lies about which
test proves what.

The finding worth keeping: **nothing had to be declared unassertable.** The five targets I expected to write off —
`city`, `mfd`, `muthur`, `oscillation`, `strands` — have no gauntlet row and no test title naming them, but each is
asserted by a block whose title describes the behaviour instead of the component: *"an empty host is a dark plot, never a
missing row"*, *"a dark pane renders its own face and never the other pane"*, *"a refusal is an answer and gets the same
rule as one"*, *"the detector raises a candidate and never a diagnosis"*, *"an undelivered route stays drawn, dashed, and
still"*. A grep for the component's name finds nothing and a grep for the claim finds the assertion; the ledger stores the
second kind, which is why it was cheap to write and needs no new code — **`git status` shows two new files and no library
edit.** The work was already there; what was missing was the bookkeeping that lets the next agent check it.

The fifth check closes the loop the `dispatch` de-quoting opened: an asserted row whose component *is* quoted must be
named by that component's closure, and one whose component nobody quotes must have filed itself as `origin`. So a row can
no longer be born from a picture and then be orphaned when the attribution is corrected — it has to say which it is.
Proven five ways: drop a target, cite a title that doesn't exist, lean on the held `tape` row, delete a row from its own
closure, shorten a claim to `the globe moves`. Each produced its own named red.

`npm test` **321 · 0 fail** (five new checks); the ledger holds 28 targets and 65 artifact references; gauntlet unchanged
at 24 rows, 22 pass, 2 held.

## Pushing a red, and the two mechanisms that let me do it

The commit before this one carried `fail 1`. Two independent mechanisms conspired. The first is a shell
fact: `npm test 2>&1 | grep -E "^ℹ (pass|fail)" && git commit && git push` gates on **grep's** status, which
is 0 as long as a summary line was printed — including `ℹ fail 1`. I read the printed counts, then chained
the commit anyway, which is what a summary line is for and why it must never be the gate.

The second was worse, because it was my own new test. `test/coverage.test.mjs` doctored `vault/SPECS-FOR.json`
in place to prove `--check` can go red. `node --test` runs test *files* in parallel processes, so
`test/gauntlet.test.mjs` read the doctored vault and failed on `referenceRelation` — a true statement about a
vault that no longer existed, and nobody's defect but mine. Each file was green in isolation; the pair was
never tested until they ran in the same suite, which is what a suite is for. The fix is not a lock or an
ordering trick: the checker now takes `CYBERDECK_SPECS_FOR` and `CYBERDECK_COVERAGE_REPORT`, and the test
doctored copy in a temp directory — and it asserts the **undoctored** copy passes first, so the harness is
proven before the sabotage is.

Both rules are in `AGENTS.md`. The suite has been run twice from a clean tree with the exit status checked
directly: **323 pass, 0 fail, exit 0, twice**. The red commit is not rebased away — the fix is the next
commit, so the branch carries the failure and the correction in that order, which is the honest history.
