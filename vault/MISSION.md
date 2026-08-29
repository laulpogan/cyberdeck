# Standing mission — a complete catalog of measured interface motion

This file is the durable goal. It is written for an agent that inherits nothing: no
conversation, no prior session, no memory beyond the files in this directory. Read it
in full before acting, then read `COVERAGE.md` for the current score.

## The rule everything serves

> Motion is a measurement or it does not happen.

A component may animate only where a duration, easing or loop period traces to something
real. Where nothing was measured, the component renders still and prints the reason in the
markup. `src/marks.js` is the gate; the demo pages carry two counters — `DECLARED STILL`,
which is healthy, and `MOVING WITHOUT EVIDENCE`, which must read zero.

The mission is not "collect references." It is "make every claim this library makes about
time traceable to a source, and record a refusal wherever no such source exists."

## Two loops, and both are the job

**The closing loop** is demand-side and it terminates. The registry renders 51 components.
Each one is done when it holds either a measurement quoted in `SPECS-FOR.json` or a
recorded refusal naming what was searched and why nothing qualified. A refusal is a
finished component, not a gap. Without them the next agent re-searches the same dead ends
forever.

**The widening loop** is supply-side and it does not terminate, so it is bounded per
session instead. Harvesting surfaces motion that no component asked for — a behaviour in a
reel, an instrument, a piece of real hardware that plainly means something and has nowhere
to live. That is the catalog growing past its own commission, and it is the more valuable
half over time. Those findings go to `PROPOSALS.md` with their evidence attached. Promotion
from proposal to component is a human decision and never an agent's.

Do not let the widening loop consume a session. Three proposals in one pass is generous.

## Evidence tiers, strongest first

The vault was built around one kind of measurement — pixels read off a decoded GIF — and
that is the third-strongest thing available. Prefer upward.

1. **Declared in source.** A number stated by whoever built the thing. Phosphor decay in a
   datasheet, radar antenna rotation in a spec, a Scaleform SWF header carrying frameRate
   and frameCount, a shader constant, a decompiled wait. No decode stands between the
   source and the number. Cite the document.
2. **Uncontaminated decode.** A file whose inter-frame delays mean elapsed time: a studio
   process reel, a constant-frame-rate capture you made yourself, an authored GIF that
   still carries real delays. Measure with `clip.mjs`, which reads frame counts out of the
   decoded file rather than computing them from the parameters it was given.
3. **Contaminated decode.** Anything sourced from a film upload. Film runs 23.976 fps
   mapped into 59.94 fields by a 3:2 cadence, so holds alternate between roughly 33 ms and
   50 ms. A naive frame count reads that artifact as easing. Usable, but the contamination
   must be recorded on the mark.
4. **Appearance only.** A static cut. Gives palette, layout and composition; gives no
   timing at all. Never quote it as a measurement.

## What the sources are, in the order they pay

Film is the weakest timing source and was the first one tried. An editor cuts on
comprehension, not on the interface finishing its loop, so the median film shot yields
appearance and nothing else. Point elsewhere first.

- **Datasheets and standards.** Phosphor persistence, radar rotation, relay actuation,
  teletype and line-printer rates, broadcast field rates, flicker-fusion and latency
  perception floors. These need no harvest at all and several are already in hand.
- **Studio process reels.** Territory, Perception, Cantina, Prologue and the designers
  themselves publish the screen graphics playing out uncut. Same asset the film contains,
  minus the editor. Search `<work> UI reel` before searching the work.
- **Games and real software.** The only interactive source, so state change is real and the
  frame clock is yours. Some ship declared durations in inspectable assets, which is tier 1.
  Capture at constant frame rate and verify uniform packet timestamps before measuring.
- **Real instruments and operations rooms.** Aviation, marine, industrial, broadcast,
  archival mission-control footage. This is what the fiction was borrowing from, it is often
  public domain, and it holds far longer than any dramatic shot.
- **Film and television.** For palette, layout, and the rare sustained take. Title sequences
  are the exception worth hunting: a title sequence never cuts away.

## Standing constraints

- **Never invent a number.** Write `[TBD: verify]` instead. An invented figure is the one
  failure this vault cannot absorb, because everything downstream trusts it.
- **Provenance is part of the mark.** Name the actor that looked and the frames it saw.
  `eyeball.py` takes `EYE=` and `FRAMES_VIEWED=` for exactly this reason. Do not let a tool
  default claim eyes that never saw the file.
- **Respect robots.txt and stated crawl refusals.** `hudsandguis.com` blocks automated AI
  agents by name. It is a good index; a person may read it. Do not route around the block
  and do not rationalise it.
- **Media stays local.** Downloads are private reference copies for design study under
  gitignored `raw/`. Nothing derived is redistributed and no third-party asset is committed.
  What ships is the number.
- **Two failures at the same thing means stop and research.** A stale extractor is
  indistinguishable from a hard refusal until you check the version. That already cost one
  session; do not pay it twice.

## Per-session protocol

1. Run `node vault/coverage.mjs`. It writes `COVERAGE.md` and prints the score. That is the
   starting truth, not what any prose in this repo claims.
2. Pick one target from the queue below, or the highest-tier evidence available for any
   component still open. Prefer tier 1 and tier 2 work over another film.
3. Do the work. Measure with the existing tools; do not reimplement what `clip.mjs`,
   `mark.py` or `eyeball.py` already own.
4. Record the outcome, including a refusal. `EYEBALL.json` for what eyes saw,
   `SPECS-FOR.json` for a measurement quoted against a component.
5. Re-run `coverage.mjs` and the test suite. Commit one verified logical unit with the
   finding stated plainly, including anything you got wrong.
6. If the pass surfaced motion no component asked for, add at most three entries to
   `PROPOSALS.md` and stop there.

Stop the session when the target is closed or refused. Do not chain into a second target to
feel productive; a clean small commit is the unit this vault is built from.

## Open queue

Ordered by evidence yield per hour, not by interest.

- **Tier-1 constants file.** Land the sourced physical figures — phosphor decay bands,
  radar sweep period, relay operate and release, teletype and line-printer rates, broadcast
  field rates, perception floors — as `CONSTANTS.json`, each with its document citation.
  Three doctrine sentences in `docs/reference/doctrine.md` currently assert more than any
  source supports and should be corrected against it.
- **Authored-GIF ingest.** `scifiinterfaces.com` exposes an open WordPress REST API with a
  large GIF library. Roughly half those files still carry authored frame delays and half
  were re-encoded to zero. Fetch, measure, keep the half that carries timing, and record on
  each mark which half it came from.
- **Static-cut rejection.** Per-shot frame-difference variance, computed before any contact
  sheet is tiled. Numpy only. This kills the wasted-eye failure mode mechanically rather
  than asking an agent to confirm that nothing moves.
- **Shot-boundary sampling.** Replace fixed-interval sampling in `youtube.mjs` with scene
  detection so short inserts stop being missed.
- **Reel candidate table.** Build a film to reel-URL index from the public catalogs, so
  candidates come from a curated source rather than a text search that returned drift.
- **Loop period without an eye.** Autocorrelation over the per-shot frame-difference signal
  recovers a period directly. Write it beside the eye's grade, never instead of it.
- **Cross-corpus ranking.** Embed one keyframe per shot, index it, and rank against a
  prompt bank per component. This is what turns eye-seconds from one sheet per film into one
  sheet per component. Worth doing only once the cheaper stages are in.
- **The three unsourced doctrine claims.** A split-flap manufacturer spec, an audio tape
  transport spin-down figure, and a solenoid throw datasheet.

## What done looks like

Every one of the 51 components holds a measurement or a refusal. `COVERAGE.md` shows no
component in the "search candidates only" tier, because a candidate count is a statement
about a search query and not about this vault. `PROPOSALS.md` holds the motifs the catalog
found that nobody commissioned, each with evidence, waiting on a human.

The library then animates only where it can say why, and says why wherever it does not.
