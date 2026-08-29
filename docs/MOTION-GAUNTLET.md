# Motion gauntlet — ledger

One line per component. A component is DONE when its film proves it moves
the way its source moves: a reference frame from `vault/ref/` on one side,
our contact sheet from `vault/film/` on the other, and a human-eyed verdict
between them. `scripts/motion-film.mjs` re-shoots any subset in seconds.

Instrument: burst of 10 JPEG frames (~70ms apart, quantised pixel delta so
noise cannot fake motion) + a 6-frame reel to 5.5s, plus an in-page probe —
max concurrent WAAPI animations and a DOM hash delta over 3s. A component
with no animation, no DOM change, and no pixel delta is DEAD until either
the film or a written refusal explains why.

## Baseline (film before vault)

DEAD by honest design — the markup refuses, in the markup, with a reason:
standard-sheet (a legend is not a reading), joi (a projection is not a
reading), oracle (a fragment composes with nothing), killmail (no canonical
charge record). No motion owed; motion fabricated here would be the lie.

DEAD as an empty event-driven state — motion belongs to the event, not the
mount: queue (empty queue, nothing waiting), two-state, dossier, channel,
grid, disc, garage, ladder, dominator, oracle-panel, gevulot. These need an
interaction reel: film the toggle/arrival/click response, not the idle page.

MOVING but unjudged until a reference exists: the 35 live components —
crush (216 concurrent animations — must prove the loops are measurements,
not decoration), cut 9.1%, tape 5.6%, tri-vision 4.8%, chips 4.6%, city 3%,
gauge 2.7%, muthur 2.7%, ice 2.5%, esper 2.8% down to splice/collar at 0.1%.

Real defects already seen on film:
- collar: countdown text flip-flops 2h36M <-> 2h35M between renders. The
  displayed minutes must never move backwards or oscillate.
- crush: 216 animations alive at once — pending verdict on whether each one
  is a measurement.

## Reference vault (scripts/vault-harvest.mjs -> vault/ref/, gitignored)

Built by the search council's union, then verified page by page. Live,
provenance-recorded sources, each frame hashed and origin-stamped in
manifest.jsonl:
- hudsandguis.com — curated diegetic-UI captures by tag. The treasure:
  the `radar` tag alone returns Alien: Isolation's motion tracker, the
  exact canon our radar/tracker/gauge components claim.
- film-grab.com — full-frame film stills. Composition and palette
  reference only: it grabs every frame, not just UI, so Blade Runner
  gives a city skyline, not the ESPER deck.
- scifiinterfaces.com — annotated UI plates (lazy gallery, thin pull so
  far), and it hosts the MOVING clips we still need.

Gap named honestly: a static frame library captures LOOK, not MOVE. The
high-quality bar the goal sets ("movie magic real motion") cannot be met
from stills alone. The next harvest pass targets the motion sources --
scifiinterfaces' embedded clips, interfaceingame videos, animated-screen
archives -- and this tool needs a frame-stepper that turns a GIF/clip
into a labelled strip the way motion-film does for our own pages.

## Motion vault (scripts/motion-harvest.mjs -> vault/motion/, gitignored)

Stills capture look; this captures MOVE. Real game-UI clips (direct mp4s
from interfaceingame's screenshots index -- the game galleries are
JS-gated, the index is not) steeped by ffmpeg into 6-frame timestamped
strips via montage (this box's ffmpeg has no drawtext; the timestamp is
burnt from the filename instead). First five land real motion grammar:
Division 2's inventory -- tab bloom, sequenced card reveal; Dishonored 2
menu fades; the Overwatch callout. A component's target and its execution
now sit in the same view: vault/motion/<game>/<clip>.png next to
vault/film/<component>.png. The gauntlet's loop:
steep a reference clip, film ours, read both, fix the numbers, re-shoot.

## Cycles

### radar -- cycle 1 -- judged against vault/ref/fui-radar (Isolation tracker)
The still film had a uniform wedge and constant blips: a wiper, not a
tracker. Isolation's grammar is the phosphor trail (the sweep says where
the measurement has already been) and blips that flare as the leading
edge crosses them and decay while they wait -- a blip's brightness IS the
time since it was last measured. Both built: a seven-slice fading wedge
with a bright leading sliver (field.js), and chained laps that re-schedule
each ping against its own start, firing at `data-sweep-angle` (runtime.js).
The film caught a real geometry bug on the first re-shoot -- descending
slice args made the arc sweep the long way and draw a whole lens -- fixed,
and the second re-shoot reads right. Delta 2.2% -> 17%; 176/176 including
radar's byte-identity gate under the new ping machinery (remembered styles
survive a settle mid-flash). Open: trail opacity is honest but thin next
to Isolation's phosphor; art-direction pass later.

### mfd -- cycle 1 -- judged against vault/motion/the-division-2 (tab bloom,
sequenced reveal)
Our deck appeared whole except two underlines: readouts teleporting onto
glass. Division's grammar is content arriving in sequence, so the twin
deck now fills itself: values on the deck's count (A, then B), detail
lines behind them, while each rule stays a trace of its own measured
arrival. Re-shoot confirms the cascade -- pane B's number lands roughly
a beat after A's, details land last.

### lanes / oscillation / deviation -- cycle 1 -- judged against
vault/ref/fui-diagnostics
Lanes: the deck draws its runs and stops. Its model carries a measured
freshness window, so the running lane's last tick now pulses on it --
the phosphor saying "this run is still arriving". Waiting and finished
lanes get no wrapper at all (a refusal may not wrap a mover).
Oscillation and deviation: judged PASS as drawn. Oscillation's model
says live but supplies no measured interval, and deviation has no live
state at all -- an invented tempo would be the lie, not the stillness.
Principle from the cycle: no tempo without a measurement.

### esper / mfd / crush -- cycle 2 -- the shared cascade rule
The ESPER dive flipped through its four enhancement frames in ~250ms --
the stagger existed but read as one pop. Root cause was the span formula
duplicated in counted() and traced(): the per-element step, tuned for
walls of two hundred, collapses to a flicker at counts of two to four.
One rule now governs every cascade: a readable beat floor for small
counts, big counts still ride the step and compress at the ceiling. The
dive materialises frame by frame, the MFD deck fills with a visible
pause between panes, and the 216-cell fleet wall still admits its count
inside about a second. 176/176.

### magi -- cycle 1 -- the conclave convenes seat by seat
Reference: vault motion strip magi-scene (Evangelion MAGI screen; the
three terminals flip to their verdicts one after another, the tally
accumulating last). Our panel's spoke-seats trace on data-index across
three -- under the shared cascade rule that is 0/160/320ms, and the film
shows exactly the canon's beat: frame, then seat, then seat, subject in
the middle, footer tally arriving last. The silent seat never moves: it
has no evidence to trace on. PASS as drawn; the fix was the shared rule,
not new code.

Vault note: the Ghost in the Shell thermoptic clip's sampled windows held
no HUD, so both strips were deleted rather than kept. The ESPER dive
window (viewfinder codes, progressive enhancement to the face) is the
canonical study for the esper component -- it confirms the frame-by-frame
materialise we shipped; image-processing blur-to-sharp stays out of
scope, we draw frames of data, not pixels.

### batch: gauge, muthur, globe, city, tape -- cycle 1 -- all PASS as drawn
- gauge: the arc is drawn once, as a measurement, and holds. No sweep theatre.
- muthur: terminal lines boot in a count cascade -- a boot sequence that
  boots. No tempo is claimed beyond the drawing's own arrival.
- globe: the rotation is the one ambient loop, and it answers to
  traffic() on the source's own refresh_ms -- a live refresh turns it, a
  stale feed stops it. Blips ping on arrival, not orbit for looks.
- city: blocks stack up like a skyline rising; the unmeasured block
  stays dark, reserved by refusal.
- tape: transcript lays down line by line like a recorded call, no
  fake transport theatre, no VU meter invented from silence.

### batch: needles, ice, keycard, at-field, splice, ceremony -- cycle 1
- ice: walls draw outward ring by ring; unreached walls are held as
  dashed refusals with the count stated. The layered-defense grammar is
  exactly the canon. PASS.
- keycard: seven cells pass left to right as a cascade, the revoked card
  lands red, the eighth slot stays dashed unmeasured. PASS.
- at-field: nested hex rings bloom outward from the core, statuses
  arriving with each ring. PASS.
- needles: the fan traces in per needle and holds; no sweep theatre. PASS.
- splice: the measured span traces in; the seam itself refuses -- THE
  SEAM IS SHADOW -- and unmeasured cells stay NO TAPE dashed. PASS.
- ceremony: the montage said it popped; the raw probe said otherwise --
  gate one drew from 0ms, gate two opened at 150ms, and the unreached
  gates correctly never animated. The 406px sheet hides a 20px stroke:
  glyph-level claims are decided on raw frames. PASS, with the rule now
  proven twice.

### final sweep tranche -- all PASS as drawn
bypass draws its red arc source-to-opt-in like the act itself. sync
inserts new channels into the stack, failed drives staying hatched.
tri-vision fills hex by hex through the lens; strands links arc by arc
with the unmeasured strand dashed. glass lets passing fields extend and
stops blocked ones dashed against the wall, sightline arrow last. burn
accumulates holes across the frame to the stated percentage. dispatch
fills manifests node by node; individuation and stock-flow boot their
ledgers line by line. The 35 live components are now all frame-judged:
four were fixed (radar, mfd, lanes, the shared cascade rule) and the
rest pass as drawn.

### the arrival reel -- the refusals prove they can move
Still-at-load is only honest if the moment evidence arrives moves. The
film camera grew an --interact mode: load the page, strip every evidence
control through the page's own button, restore it, and film the
restore. Verdicts: 16 full models carry no movable mark at all -- still
on arrival IS the designed refusal, printed BY-DESIGN, not DEAD. The
strip chart's one mark is an interval clock (WAAPI-zero by nature), so
the runtime now counts clocks off its JS surface, and the reel reads the
honesty bar during the arrival: MEW=0 on every one. radar rides as the
positive control and arrives moving -- contacts pinging in as the sweep
takes them. 176/176 with byte-identity intact (the guard is a JS WeakSet;
nothing bookkeeping touches the markup).
Side finding while wiring the reel: start() can now meet a page twice
(the DOMContentLoaded auto-start and the app's kill-switch handoff); a
per-node played-guard in the runtime makes a render play its marks once,
which is the honest meaning of replay.

### the live reel -- honesty theatre on camera
--live-reel films #/live answering the producer, kills the feed server
mid-reel, and keeps rolling. The sheet reads exactly as promised:
awaiting stub, then the sweep drawing itself with phosphor trail and
blip pings on the answered polls; at the kill the chip flips to NO
ANSWER and the radar becomes a NO SWEEP refusal -- the dark model, not
held-over values -- honesty bar at zero the whole way. Two camera traps
caught: the live slot grows from a stub, so a clip taken at mount films
an empty strip forever (frame the whole viewport for a page that grows
into itself), and the page's own status text lives outside the slot
node.

### theme and preference coverage
--reduced films the whole rack under prefers-reduced-motion: every one of
the 52 still, the full drawing intact -- zero motion loses nothing, on
camera not just in tests. --theme light films the whole rack in the day
theme: the same 17 refuse and the same 35 move; magi reads as designed
amber-and-ink, not an inversion. Open design note: the radar's phosphor
trail washes paler on cream than on black -- a light-theme trail tuning
is a candidate cycle, deliberately not yet paid for.

### radar -- cycle 2 -- the trail speaks day theme
The phosphor ladder is additive light: 15% on black is an echo, 15% on
cream is a smudge. The decay slices now carry their own honest number in
--trail-op while the theme supplies one multiplier -- 1 against the
void, 1.85 against paper. The rendered ladder is unchanged in dark
(byte-identity intact, opacity attributes untouched as the no-CSS
fallback); in light the trail finally reads as a sweep instead of a
stain. 176/176.
