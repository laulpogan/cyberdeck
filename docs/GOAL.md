# CYBERDECK — autonomous build goal

Paste this whole file as the first message of a fresh session. It is the
brief, the canon, the loop, and the stop condition. Nothing else is
supplied and nothing else is needed.

---

## 0. The goal, in one paragraph

Build **Cyberdeck**: a standalone, framework-free UI component library that
reproduces the interface language of the cyberpunk and sci-fi canon —
**with its motion**. Not a theme. Not a CSS skin with neon borders. A
library where each component carries the *timing, sequencing and decay* of
the screen it came from, because that is the part everyone skips and the
part that actually makes those interfaces feel like those interfaces. You
are done when a person who knows these films and games can look at your
demo page with the sound off and name the source of each component from
the way it moves.

This library has no host application. It depends on nothing. It is the
source material, packaged.

---

## 1. What you are building

```
cyberdeck/
  src/
    core/          tokens, motion primitives, the shared runtime
    components/    one directory per component, self-contained
    canon/         one module per source material (see §3)
  demo/
    index.html     the gallery — every component, running, no build step
    <source>.html  one page per source material, in its own visual world
  docs/
    MOTION.md      the motion language: every technique, named and specified
    CANON.md       the ledger (see §6)
  test/
    *.spec.*       behavioural tests
    perceptibility/ the gate that measures actual movement (see §4.3)
```

**Non-negotiable technical shape:**

- **Zero runtime dependencies** beyond one animation engine you vendor
  yourself. Motion's `mini` build (~3.1kb gzipped, MIT) or raw WAAPI. No
  React, no Vue, no Tailwind, no icon packs.
- **Framework-agnostic**: plain custom elements (`class X extends
  HTMLElement`) or plain factory functions returning DOM. A user must be
  able to drop one file into any stack and have it work.
- **Every demo page is a single self-contained file** that opens from
  `file://` with no server. If a reviewer has to run a build to see it,
  you have failed the review.
- **Tokens only.** No colour literal outside the token file. Every timing
  is a token too — a duration written inline in a component is the motion
  equivalent of a hex literal and drifts the same way.
- **Both themes, or one deliberately.** Most of this canon is dark-first.
  If a component only works on black, say so in its manifest and make the
  page paint its own ground rather than borrowing the host's.

---

## 2. The one thing everybody gets wrong

Cyberpunk UI libraries fail the same way every time: they copy the **look**
and drop the **timing**. Neon cyan on black with a glitch-in on page load
is a screenshot of the genre, not the genre.

What actually distinguishes these interfaces is motion behaviour:

- **Nothing eases in Evangelion.** NERV panels *cut*. Instant, no
  transition, hard replace. An ease-out on a NERV panel is wrong in the
  way a serif in a Swiss poster is wrong.
- **MU/TH/UR types.** Character by character, at a rate slow enough to
  read along with, with a block cursor that does not blink in step with
  the typing. Instant text on a 1979 mainframe is anachronism.
- **The Alien motion tracker's blips persist and decay.** The sweep is
  cheap; the phosphor *afterglow* trailing behind it is the whole thing.
- **ESPER pans and settles.** The zoom is stepped, not continuous, and
  each step lands with a mechanical settle before the next command.
- **Katana ZERO rewinds.** Tape scrub is not a progress bar running
  backwards — it is tracking distortion, frame tear, and audio-free
  stutter at a nonlinear rate.

Your library must encode these as *specifications*, not vibes. `docs/
MOTION.md` names every technique with its parameters: durations, easing
curves (or the deliberate absence of easing), stagger intervals, decay
constants, jitter amplitudes and their distributions, loop periods.

---

## 3. The canon

This is the inventory. **Each entry needs at least one component whose
motion signature is identifiably that source.** The signature column is a
starting point from research, not a ceiling — go to primary reference
material (screenshots, footage, the actual game, published breakdowns from
the studios that made them) before you build.

### Film

| Source | Motion signature to capture |
| --- | --- |
| **Alien (1979)** — MU/TH/UR, Nostromo | Character-by-character phosphor type-on; block cursor; scanline roll; slow refresh; green-on-black bloom |
| **Alien** — Ron Cobb semiotic standard | No motion. Static plates. Include it as the control: a component that proves the library can also hold still |
| **Aliens** — motion tracker | Sweep + blip persistence + distance readout; the decay trail is the component |
| **Blade Runner (1982)** — ESPER | Stepped zoom; grid track; mechanical settle between commands; photo pan on rails |
| **Blade Runner 2049** — Joi, Wallace | Volumetric presence flicker; projection offset from the surface it lands on; interference on movement |
| **Ex Machina** — glass cell, keycard | Asymmetric sightline; access grant as a physical latch, not a colour change |
| **The Matrix** — code rain, two-state | Falling glyph columns at varying rates; the irreversible commit with no default |
| **Minority Report** | Gestural pull-through; card physics; content that follows the hand with lag |
| **Oblivion** (GMUNK) | Rigid grid; thin sharp lines; everything aligned; motion as precise reveal, never bounce |
| **Tron: Legacy** (GMUNK) | Identity disc; geometric bloom; light-cycle ribbon trails |
| **Prometheus / Covenant** (Territory) | Holographic volumetric scan; layered depth passes |
| **Ghost in the Shell** | Barber-pole data columns; thermoptic shimmer; dive descent |
| **Akira** | Scale crush; espers' fragmentary oracle text |
| **Iron Man** (JARVIS) | Suit-up dispatch sequence; assembly in ordered stages |
| **Cyber City Oedo 808** | Collar countdown — a real terminus, running down |

### Television & anime

| Source | Motion signature to capture |
| --- | --- |
| **Neon Genesis Evangelion** — NERV, MAGI, AT field | **Hard cut, no easing.** Tiling text panels; MAGI tri-panel dissent; sync-ratio drift; AT field expanding in discrete rings |
| **Psycho-Pass** — Dominator | Mechanical transformation between authority states; the lock-on that must complete before it fires |
| **Ghost in the Shell: SAC** — Tachikoma | Individuation: identical agents diverging visibly over time; canonical redaction as a drawn hole |
| **Westworld** | Loop-trace deviation from a reference path |
| **Severance** — Lumon MDR | Numbers that *tremble*; refinement as ordered capture into bins; deliberately archaic slowness |
| **Devs** | Determinism lattice; prediction converging on the present |

### Games

| Source | Motion signature to capture |
| --- | --- |
| **Cyberpunk 2077** — Kiroshi, quickhacks | Glitch-in with chromatic aberration; leader lines to the margin; the quickhack ladder charging |
| **Cyberpunk: Edgerunners** | Context-burn creep; cyberpsychosis as an encroaching edge |
| **Alien: Isolation** | Motion-tracker cadence that **tightens with proximity**; the interval is the reading |
| **Death Stranding** | Odradek scan pulse; strand delivery routes drawing along their length; cargo balance |
| **Katana ZERO** | VHS scrub, tracking distortion, rewind, hard interrupt cut |
| **NieR:Automata** | HUD chip budget as spatial packing; menu as diegetic OS |
| **Observer** | Tri-vision lens toggle; the switch between electromagnetic and biological views |
| **System Shock** | Twin MFD deck; CRT curvature |
| **EVE Online** | Overview grid doctrine; killmail receipt; information density as the aesthetic |
| **Armored Core** | Garage assembly; part-swap with weight consequence |
| **Cloudpunk** | Placement as city; voxel depth |
| **Transistor** | `Turn()` — batched commands committed at once, planned then executed |
| **Deus Ex: Human Revolution** | Gold-black augmentation overlay; the third-person cover snap |
| **Signalis** | Survival-horror CRT; deliberate input latency as tension |
| **Hardspace: Shipbreaker** | Cutting tool overlays; structural stress read live |
| **Returnal / Control** | Corruption spread; oldest-house brutalist typography in motion |

### Literature & theory

| Source | Motion signature to capture |
| --- | --- |
| **Neuromancer** | ICE — countermeasure walls in depth, receding; you see as far as the one that stops you |
| **The Quantum Thief** | Gevulot — visibility contracts; selective revelation |
| **Stafford Beer** — VSM / Cybersyn | Algedonic bypass (the channel that cannot be snoozed); phosphor strip chart with real persistence |
| **Jay Forrester** | Stock and flow — a level and a rate must never share a glyph or a motion |
| **Jens Rasmussen** | Safe-envelope boundaries; drift toward the edge |
| **Norbert Wiener** | Oscillation / hunting detection |
| **Claude Shannon** | Channel with visible noise |
| **Edward Tufte** | The counterweight. Data-ink ratio. Include at least one component that is *austere* and prove the library can be quiet |

**Minimum bar: every source above gets at least one component.** If a
source turns out to have no distinctive motion worth encoding, you may
retire it — but you must write the sentence explaining why in `CANON.md`,
and "I ran out of time" is not that sentence.

---

## 4. The laws

### 4.1 Motion is specified, not improvised

Every component ships a `motion` manifest: each animated property, its
duration, its curve, its trigger, its loop period, its decay constant. If
you cannot write the number down, you have not designed the motion, you
have fiddled with it until it looked okay once.

### 4.2 Every component degrades to a real static state

`prefers-reduced-motion: reduce` and a `?still=1` escape hatch both land on
the rendered component — not a half-faded element frozen mid-entrance, and
not a second design. The simplest way to guarantee this: every animation
*rests* at the state the markup already describes, so cancelling is
settling. Hand animations to the browser as real `Animation` objects rather
than writing inline style from a JS tick, and this property comes free.

### 4.3 Perceptibility is a gate, not an opinion

**This is the law that exists because it is the one that gets violated.**

A previous build of a motion system passed every honesty and correctness
test it had and the operator's response was *"I don't see anything
moving."* The measurement afterwards: 597 elements, 7 marked, and the only
thing running after load was a 17×6 pixel bar crossing at two thirds of a
pixel per second. Correct, and invisible.

So: an automated gate, driven from the compositor and not from
self-assessment.

- Sample `document.getAnimations().length` **per frame from a standing
  start** — entrances are over in a few hundred milliseconds and a page
  inspected after settling reports zero.
- For each component, capture two screenshots N milliseconds apart during
  its characteristic motion and require a **pixel delta above a stated
  threshold** in a stated region.
- Any component whose motion cannot be seen in a 2-second glance at 100%
  zoom **fails** and goes back. Either the motion is too small, too slow,
  or drawn at a scale nobody can read — all three are real defects and all
  three passed the tests that came before this gate existed.

### 4.4 Each component stands alone

Mountable in isolation, in a bare HTML file, with no sibling components and
no shared page scaffolding. If it only works inside your gallery, it is a
demo, not a library.

### 4.5 Attribution and originality

These are *influences*, not assets. Write your own geometry, your own
type-setting, your own timing. Do not copy anyone's SVG, sprite sheets,
fonts, or logos, and do not reproduce a studio's exact frames. Name every
influence in `CANON.md` — credit is part of the deliverable. Where a real
organisation's mark or a real film's logotype would appear, build your own
fictional equivalent instead.

---

## 5. The loop

Run this until §6 says stop. Do not ask for approval between iterations.

**1. DOSSIER.** Pick the next source from `CANON.md`. Research it from
primary material until you can write its motion signature as numbers:
durations, curves, sequence, decay. Write the dossier before writing code.
A dossier that says "glitchy and fast" is not finished.

**2. BUILD.** The smallest complete component that carries that signature.
Wire it into the gallery and into its own single-file demo page in the same
change. A component not on a page does not exist.

**3. GATE.** Run the perceptibility gate (§4.3), the reduced-motion check,
the isolation check (§4.4), and the token check. All four, every time.

**4. REVIEW.** Run §7 against what you just built. Harshly.

**5. LEDGER.** Update `CANON.md` with the verdict and the evidence. Commit,
small and often, with a real message.

**6. Next.** Return to 1.

Between sources, every fifth iteration: stop adding and do a **sweep pass**
— re-run the whole gate over every component built so far. Things rot.
A component that passed in isolation two hours ago may have lost to a token
change since.

---

## 6. Done

You are **not** done when you feel finished. Feeling finished is the
failure mode this section exists to defeat.

`docs/CANON.md` is a table with one row per source in §3 and these columns:

| Source | Component(s) | Motion signature (specified) | Gate | Adversarial verdict | Evidence |

You are done when **every row** is filled and:

- **Gate** is PASS on all four checks in §5.3.
- **Adversarial verdict** is PASS — meaning the review in §7 tried to
  reject it and could not.
- **Evidence** links a captured frame sequence (3+ frames spanning the
  motion) proving it moves, plus the demo page.
- And the **blind test** in §7.3 has been run over the finished gallery
  and passed.

Any row missing any of those is an open row. Open rows mean not done.

---

## 7. Review, and why yours will be too kind

Self-review drifts kind. You will look at what you built, recognise your
own intent in it, and grade the intent instead of the artifact. Structure
around that.

### 7.1 Review as the adversary, not the author

For each component, take the explicit position that **it is a generic
neon-themed div and does not evoke its source at all.** Your job in the
review is to *sustain* that claim. The component passes only when you
cannot.

Concretely, argue these and see if they stick:

- "The motion here is a fade and a translate. Every UI library has that."
- "This is the source's *palette*, not its behaviour. Recolour it grey and
  nothing identifies it."
- "The timing is the framework default, not a researched number."
- "This reproduces one frame of the reference, not the transition between
  frames."
- "A person who has seen this film would not recognise it."

If any of those survives, the component fails. Write down which one and
what you will change.

### 7.2 The grey test

Strip the component to a single colour — no palette, no glow, no neon. If
its source is still identifiable from motion and layout alone, it passes.
If it is not, you built a colour scheme and called it a component. This
test alone will fail a large fraction of your first attempts, which is what
it is for.

### 7.3 The blind test

At the end, render the full gallery with **all labels and source names
removed**. Go through it and name each component's source from motion
alone. Anything you cannot identify is an open row, regardless of how good
it looks. Record the score in `CANON.md`. Below 80% correct is a failing
gallery and you go back to work.

### 7.4 Escalate on failure, not on boredom

Two failed attempts at the same component means stop coding and go back to
primary sources. You are missing a fact about how the thing actually moves,
and a third attempt from the same understanding produces the same result.

---

## 8. Named traps

Each of these has actually happened. Do not rediscover them.

- **Invisible motion.** Technically animating, perceptually static. §4.3.
- **The small-thing trap.** Spending the motion vocabulary on chips,
  counters and progress bars while the *drawings* — the radar, the wall,
  the corridor, the trace — sit still. The interesting motion belongs on
  the interesting geometry. Audit for this explicitly: count animated
  elements inside `<svg>` versus outside.
- **Tests that pass on nothing.** An assertion that checks marks carry the
  right attributes and never checks anything moved. A selector matching
  `path` and `line` but not `rect`, so the animation runs on almost nothing
  while every test stays green. Assert on the *effect*, not the intent.
- **Animating over a refusal.** If a dashed line means "not reached" or
  "no data", an animation that borrows and does not restore the dash
  pattern turns it solid — erasing meaning by animating it. Restore what
  you borrow.
- **Ease everywhere.** Some of this canon is explicitly un-eased. A house
  ease-out applied uniformly flattens Evangelion into Material Design.
- **The demo-only component.** §4.4.
- **Loop-until-bored.** §6 and §7.3 are the stop condition. Not fatigue.

---

## 9. First move

Do not start building. Start by writing `docs/CANON.md` with every row
from §3 present and empty, and `docs/MOTION.md` with its section headings
and nothing under them. That table is your work queue and your stop
condition, and creating it first is what makes the rest of this
autonomous.

Then take the first row and begin the loop.
