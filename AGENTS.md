# AGENTS.md — what the last agent learned

Working notes for whoever picks this up next. Facts, not intentions. Each one
was either read out of the source or paid for.

## The rule, and who it binds

> **Motion is a measurement or it does not happen.**

`app/` is not exempt. No spinner, skeleton shimmer, progress bar, ambient
pulse, or decorative transition in the chrome. Chrome motion is either
operator-caused and stamped `intent()`, or it does not happen. The counters in
the rack header are the proof, and `MOVING WITHOUT EVIDENCE` must read 0 on
every route, both themes, both widths. If it goes non-zero, the app is wrong —
fix the app, never the counter.

## Stack: React, and the trade it costs

The showcase is React (`react@19`, `vite@8`, `@vitejs/plugin-react`), and the
library's own `react/index.js` is why that is cheap: a mark is an object whose
keys are already `data-*`, so JSX spreads one with no wrapper component, no
context, no render prop. What React genuinely needed was a way to start the
runtime once and re-run it after marks land, and that is the whole file.

The trade, stated honestly: every library component is a function returning an
HTML string, so each one is rendered into an opaque `dangerouslySetInnerHTML`
container that React never diffs (`app/src/components/Specimen.jsx`). The
runtime mutates that subtree after mount — it hands nodes to the browser's
animation engine, and the `elapsed` kind writes text into them as it counts. A
reconciliation that did not make those writes would fight them, so React owns
the chrome and never reaches inside a specimen. What that gives up is React's
usual guarantee that the DOM is a function of state, and what pays for it is
that the sixty components are rendered by the functions that ship, from the
package that ships, with no translation layer between the showcase and the
library. App logic that a test should be able to read — fixtures, evidence
derivation, cites, copy-to-use, route parsing, theme mapping, the honesty
counts — is plain ESM with no JSX, so `node --test` reads it with no transform.

## What the host owes the library

- **The globe's mesh is painted by the host, not the runtime.** `globe()` returns a
  `<canvas>` and does not fill it: the library's own demo calls
  `paintGlobe(figure)` per figure, and an app that forgets renders a black box with a
  caption — present, marked, invisible. `app/src/globe-paint.js` does it after
  `rewalk()` (the mesh reads `data-motion` on its own wrapper to decide whether it may
  turn at all) and keeps a `WeakSet` of the figures it has painted, because
  `paintGlobe` installs a frame callback *and* a root `MutationObserver`: run it twice
  on one figure and the globe turns at double the measured interval, and the interval
  is the whole reading.
- **`globe`'s arcs are never drawn.** `<path class="cd-globe-arc">` is emitted with a
  `trace` mark and CSS, and nothing anywhere gives it a `d` — `globe()` does not
  compute one and `paintGlobe` moves the pins but not the arcs. The figcaption says
  *ARCS ARE MEMBERSHIP, NOT TRAFFIC* about geometry that cannot appear, and the runtime
  skips the mark because `getTotalLength()` is zero. Reported, not fixed: it is a
  feature to write, in a file the showcase was not asked to change.
- **Four marks in the library do not ask a measurement first.** `trace(true, …)` on
  `syncRatio`'s axis (`cd-th-axis`), on `oscillation`'s threshold
  (`cd-riv-threshold`), and on `glassCell`'s sightline (`cd-dc-sightline`); `count(0, 1)`
  on `radar`'s off-scope marker (`cd-fd-offscope`). Everything else is computed from an
  argument and returns `still(reason)` when the argument is missing. These four are the
  holes in "pull the evidence and the page stops", so they are named one by one in
  `app/src/undeclared.js`, licensed in the gate *per specimen*, and asserted present by
  `test/app-undeclared.test.mjs` — which fails if upstream fixes one and the list is not
  updated, so the exemption can only shrink by being earned.
- **A population is a measurement, so the fixture lists have to say so.**
  `count(i, xs.length)` staggers over an array, and the first version of the fixtures
  declared the *reading* and left the array, so with the rack switch off eleven
  specimens were still animating on a count nobody had said was supplied. `chips`,
  `contacts`, `levels`, `items`, `answers`, `siblings`, `endpoints` are now declared as
  evidence fields where a mark counts over them. `coverage.endpoints` is declared as
  `{ path, value: [] }` rather than null, because `coverage` iterates it without a guard
  and absence there really is the empty set.
- **The smallest type in the library is `keycard`'s**, whose column labels compute to
  about 5.5px at the sizes the rack gives it. That is the library's instrument floor, not
  something the app can correct from outside; `app/verify/index.mjs` fails below 5px and
  measures the render scale so the app can never be the thing that shrank a drawing.

## Measuring a counter, and when you cannot

`elapsed` is a `setInterval` that rewrites text, not an `Animation`. Neither
`getAnimations()` nor the peak counter can see it, so a page whose only mark is a
counter reports `peak=0` while visibly alive, and a counter that has stopped reports
the same. The gate therefore splits by kind: where a page carries a mark that is *not*
`elapsed`, it asserts `peak >= 1`; where `elapsed` is the only kind on the page, it
samples `[data-elapsed-text]`, waits 1.5 s, and requires the words to have changed. The
reduced-motion condition gets the mirror image — the words must *not* change, or the
operator's request was honoured only for the kinds the check could see.

That check can only decide what the reading's own resolution makes decidable.
`durationWords` prints `10m` for anything between a minute and an hour — inherited from
`hive_motion.py`, held by `test/contract.json`, and not this app's to change — so the
collar's measured readout legitimately changes once a minute and no 1.5 s window can
prove it alive. `stripChart` prints tenths of a second, and there the window decides.
A frozen-looking counter that is honest at its own granularity is explained on the page
rather than propped up with motion it has no measurement for.

## What the gate measures, and why those five things

`npm run verify` sweeps every route at 1280 and 390 in both schemes and re-runs the
reduced-motion condition over the pages that should be moving. The checks are the ones
a person would do by eye: the four counters, and whether the counter and the page agree;
whether anything scrolls sideways; whether a refusal collapsed its specimen below 24px;
whether text is drawn outside the viewBox it was drawn in and whether the app shrank the
drawing under 85% of its own size; and what happens when the evidence switch is thrown.

Three details that cost an hour each:

- **The pristine markup is captured on the `innerHTML` setter, not with a
  MutationObserver.** The observer's callback is a microtask, and React's effects run
  first: the "export" it recorded already had a trace's dash array in it, and the gate
  reported that *settling* had changed the page. Reading the value at the setter is
  synchronous and exact.
- **Compare against the bytes the parser produced, not the string that went in.**
  `<line/>` in, `</line>` out: an HTML parser normalises self-closing SVG tags, so the
  component's output and the element's `innerHTML` are different texts describing one
  drawing. Record what the element holds after the assignment.
- **The globe route cannot be held to byte-identity, and the exemption is decided by
  content.** `paintGlobe` writes a `transform` and an `opacity` onto every pin every
  frame; `settle()` stops the loop and leaves the pins where the last frame put them.
  So any page carrying a `.cd-globe-mesh` is asserted on the weaker true property —
  after settle, the pins stop moving — detected from the DOM rather than from a route
  list, because a carve-out written against a pathname exempts whatever it names.

The sweep is 261 page loads. `npm run verify` runs one browser and takes an hour;
`npm run verify:all` splits the routes across `SHARDS` processes (four by default),
merges the result files, and exits non-zero if any shard saw anything. Same code, same
assertions, one verdict.

## Two checks that only exist because a person looked

- **Type printed over type.** Everything the gate knew about composition was measured
  inside one box at a time — text inside its viewBox, text above five pixels, the
  specimen keeping its height. A card whose body is HTML with small SVGs set between the
  lines can overlap itself across that seam. So the gate collects every run of type in a
  specimen, HTML by its range rect and `<text>` mapped through its own `getScreenCTM()`
  into the same coordinates, and asks whether two of them share a quarter of the smaller
  one's pixels. One unioned rect per run: a range returns a rect per line box, and a
  label colliding with itself is the check lying, not the page being wrong. The threshold
  is set by the defect that produced it: the numeral measured 14×10 px, the line above it
  cut 4 px off its bottom, and 4 px of a 10 px string is 40% of the smaller of the two.
  The sweep at 0.25 finds nothing else anywhere in the set, so the two are far apart —
  0.4 would have just missed the one case worth catching.
- **Whether the app, rather than the library, shrank a drawing.** The scale check runs
  once per specimen, on the svg the container sizes. A `<svg>` carrying its own `width`
  attribute was sized by the library — the 48-unit identity disc drawn at 30 — and its
  ratio to its own viewBox is a glyph, not evidence about the page.

Both were found by looking at screenshots, and both are now gates: the eye's job is to
find the class of defect once, not the same defect on every page every time.

## The round trip: `npm run verify:roundtrip`

The strongest claim the showcase makes is that the block under COPY-TO-USE reproduces
what is on screen. `app/verify/roundtrip.mjs` loads each component page with `?still=1`,
reads the printed block, runs that call in node against the module the registry names,
and compares markup; all 51 come back identical. Two differences are removed, and named
in the file rather than hidden in a helper:

- The produced string is pushed through the browser's parser first, because `<line/>` in
  and `</line>` out are two texts describing one drawing.
- `paintGlobe` places the pins even in stillness — a mesh that never paints is a black
  box — so `transform` and `style` are stripped from `.cd-globe-pin` on both sides.
  Nothing else the painter leaves behind is excused, and the script refuses to compare at
  all if the specimen is still being written to.

## The traps, paid for

- **`<repo>/react/` shadows the npm `react` package.** With the Vite root at the
  repository root, a bare `import { useEffect } from 'react'` resolved to the
  library's own `react/index.js`: the dep pre-bundle came out containing
  `src/marks.js` and every page died with *"does not provide an export named
  'useEffect'"*. Root the build at `app/` (`vite.config.js`) and the collision
  disappears. Anyone adding a second build config will hit this again.
- **`CyberdeckMotion.start()` does not consult `CyberdeckMotion.off`, and refusing to
  call it is not enough.** `off` is
  computed once at load from `prefers-reduced-motion`, `?still=1`, and a missing
  engine, and it gates only the runtime's own auto-start. A caller that calls
  `start()` anyway re-enables motion on a page whose operator asked for none —
  including `react/index.js`'s own `useMotion`/`useMotionEffect`. Everything in
  `app/` goes through `app/src/motion-bridge.js`, which refuses when `off` is
  set. Refusing quietly turned out to be its own defect: `paintGlobe` decides each frame
  whether to turn by reading `data-motion-off` on `<html>`, nothing ever stamped that on a
  `?still=1` page, and so a globe turned beside fourteen marks that had correctly refused.
  `rewalk()` now records the refusal in the place everything else already reads it. Upstream,
  `start()` should check `off`, and `paintGlobe` should read the same flag.
- **An animation count taken after the page settles reads 0 whether or not
  anything moved.** Entrances are over in ~300 ms. `app/verify/inspect.mjs`
  therefore samples `document.getAnimations().length` per frame from a standing
  start and reports the peak. `peak=0` on a page that should be moving is the
  invisible-motion defect, and it passed the library's own tests once already.
- **`elapsed` is a `setInterval`, not an `Animation`, and it writes text only
  when the words change.** So a wait measured in hours (`2h 36m`) is honest and
  visibly frozen: at that granularity a running counter restates the same string
  3599 times out of 3600. A landing page that must *show* a measurement driving
  motion needs a duration short enough for the words to change on the clock face
  — or a kind with a real loop. `app/src/pages/Home.jsx` will move to one.
- **`motion.css` guards the element carrying `data-motion="still"`, not its
  descendants.** `card()` stamps the mark on the whole `<figure>`, so anything
  inside a refused card is inside the refusal. A chrome hover transition there
  is exactly what `MOVING WITHOUT EVIDENCE` hunts, so `app.css` extends the
  guard to the subtree with `!important`. That is a structural refusal, not a
  way to make the number look good: if the runtime ever animates a descendant of
  a stillness, refusing it is the correct behaviour.
- **`--cd-mono` is the host's job.** `src/tokens.css` names colours only, and
  `components.css` reads `var(--cd-mono, inherit)`. A host that never sets one
  renders the whole library in the browser's UI face. `app/styles/app.css` sets
  it and `--cd-display`, and `app/index.html` loads the two faces the components
  were drawn against, with monospace and condensed fallbacks so a font that
  fails to load costs typeface, not layout.
- **`--cd-signal-cyan` is referenced twice with a fallback and defined nowhere**
  (`components.css:170`, `:184`). It resolves to `--cd-signal-data-dim` and
  nothing breaks, but the token is a leftover. `--cd-globe-size` is set inline by
  `globe.js` and is not a host token.

- **React re-serialises `dangerouslySetInnerHTML` when the wrapper object changes.**
  React diffs the prop's *value*, and the value is an object literal, so any
  re-render of the chrome — theme switch, kill switch, a counter — hands it a new
  `{ __html }` holding the same string, React decides the property changed, and the
  browser reparses the specimen. Every animation the runtime had started is then
  attached to a node that is no longer in the document, and the `elapsed` counters
  go on writing text into it. `app/src/components/Specimen.jsx` caches the object so
  its identity tracks the string. "React never reaches inside a specimen" is one
  line of code, not a stance, and the byte-identity assertion is what proved it.
- **`settle()` was not giving the markup back. Three writers, all now closed.** The
  animation engine writes the resting value into the `style` *attribute* on its way
  out (`style="opacity: 1"`); `traced` writes a dash array into that attribute on its
  way in; and a cancelled animation's undo handler runs a microtask *later* and
  leaves `style=""` where the server wrote no attribute at all. None of it moves a
  pixel — a resting value is by construction what the markup already said — and all
  of it breaks "a settled page IS the static export" at the byte level. `src/runtime.js`
  now remembers each element's `style` attribute the moment before anything touches
  it and hands it back at settle, after the cancellation passes, then once more on a
  microtask for the handlers that run on the rejection.
- **The settle assertion is `settled == export`, not `before == after`.** A running
  `elapsed` counter is *meant* to differ from the export — that is its job, and the
  first version of the assertion failed on a page that was behaving perfectly. The
  snapshot to compare against is the markup as it landed, before motion touched it,
  which `app/verify/probe-evidence.mjs` records with a MutationObserver. Cancelling
  does restore the text: `elapsing`'s cancel writes back what the server wrote, which
  is why the claim survives a minute ticking over.
- **The kill switch's own state is chrome, and the comparison is scoped to say so.**
  Pressing it changes `aria-pressed` and the button's `aria-label`, and `settle()`
  stamps `data-motion-off` on `<html>`. Both are records that the operator asked —
  same category as the stamp the bridge already exempts — so the assertion runs over
  the `[data-specimen-view]` subtrees, which is the claim: *no component's markup
  changed when motion was cancelled.*
- **Two typos that render as a blank page, so both are now tests.**
  `import { motionIsOff } from './motion-bridge.js'` against a module exporting
  `isMotionOff`, and `'../../src/marks.js'` where the file is at
  `'../../../src/marks.js'`. The browser's answer to either is one line of console
  and no DOM. `test/app-shell.test.mjs` walks `app/` and asserts every relative
  specifier lands on a file and every named import is something the target exports.

- **A percentage height needs a definite height, and the failure is silent.**
  `.cd-rule-bar i { height: 100% }` inside a parent with only `min-height` resolved to
  zero: the measured `level` bar on `/rules` — the one specimen whose entire subject was
  a quantity drawing itself out — rendered as an empty box, at every width, with no
  console message. It is a real property of `height` and nothing about the app.

## The marks contract

A mark is a plain object of `data-*` attributes and carries no animation code —
that is what lets honesty be tested without a browser and lets a Python server
and a React tree produce the same markup. Eleven kinds: `arrive`, `decay`,
`count`, `level`, `elapsed`, `trace`, `traffic`, `cycle`, `intent`, plus
`still(reason)`, which is a declaration rather than a fallback, and `attrs()`
for template hosts.

Two details that are easy to get wrong from memory:

- `level` takes `measured` as an argument, *never inferred from* `value != null`.
  A bar at zero and a bar nobody filled in must not look alike.
- `cycle` refuses on an overrun rather than wrapping. A poll due forty seconds
  ago that has not landed **is the finding**.

## The card contract

`card(key, title, body, { mark, note })` (`src/components/card.js`) wraps every
bounded specimen in a `<figure class="cd-card" data-specimen=...>` with a
`W = 340, H = 200` drawing area, and — this is the part that matters — reads the
refusal off the mark itself: when `mark['data-motion'] === 'still'` it stamps the
mark on the figure and prints `data-still-reason` as `<i class="cd-why">`, so a
card cannot disagree with the drawing it holds. A component that renders its
refusal in its own body text (the collar's `UNMEASURED` dial) leaves the card
unmarked, which is why `MOVING WITHOUT EVIDENCE` needs a subtree guard rather
than a card-level one.

**A refusal draws itself now, and a card body may be empty because of it.** `card()` compares its
own body against the mark it holds: empty body + `still` mark → `refusalFrame()` puts the
library's unmeasured hatch around a word naming what is missing, so the card holds the space of
the drawing it refused. Thirteen components had been answering "no measurement" with an empty
body and losing 200-430px, invisible to the gate because its only height floor ran on the
evidence-present page. Two levers, both read off the mark: `refusalWord` (name the word --
`UNMEASURED` everywhere is a legend, not a reading) and `ghost` (the absent geometry in the
component's own helpers; when it is supplied the hatch is dropped, because the outline of the
missing thing is itself the hatch). The reason sentence stays in the card's `<i class="cd-why">`
line and is never painted into the picture, and the cite line prints only when a cite exists -- a
placeholder there stands exactly where provenance is read. One component, `muthur`, did not take
the frame at all: its body is a CRT console, so its refusal is one unasked prompt in that
console, because HTML furniture holds its height at 390px where a scaled SVG frame does not.

`wrapped(x, y, value, chars, options, leading)` exists because SVG text does not
wrap and breaking by character count cuts words in half, which looks deliberate.

## The token ratchet

```sh
grep -rEl '#[0-9a-fA-F]{3,6}\b' src/ app/ react/   # must print src/tokens.css and nothing else
```

`test/tokens-ratchet.test.mjs` holds the app to the same rule the library holds
itself to. Nothing in `app/` names a colour: chrome colour is a `--cd-*` token or
a `color-mix` of tokens. Three theme states, not two — bare `:root` is a complete
light palette, the dark media query is guarded as `:root:not([data-theme="light"])`,
and `:root[data-theme="dark"]` restates dark, so "system" is the *absence* of an
attribute and an explicit light choice under a dark OS only works because the
attribute keeps the media query off. Never define a colour only inside a media or
`[data-theme]` block.

## Fixtures and the registry (51 components, 82 evidence fields)

`app/fixtures/` holds one bright model per component and names which of its fields
carry a measurement. The dark model is computed by `darkOf`, never written, so the
two columns on screen cannot drift into being two different components. A declared
field must already hold a value in the bright model — nulling something that was
never there is how a fixture starts claiming a measurement it does not have. A
field may instead be `{ path, value }` for the cases where absence is not `null`:
an unreachable source sends `sourceState: 'unavailable'`, and a producer that
retained nothing sends `[]`, because `observed.length` throws on null. Those
substitutions are the only non-null differences allowed, and only at the path that
declared them.

`app/src/registry/` is what makes "every component is reachable" checkable:
`test/app-registry.test.mjs` walks the exports of the component modules and fails
on any function that is neither a rendered component nor listed in `NON_COMPONENTS`
with a reason. Adding a component upstream turns the showcase red until it is on a
page. The same file carries the copy: the refusal sentences are quoted out of the
components' doc comments, and the test looks for them in the source so a page
cannot quietly start paraphrasing a refusal into marketing.

Things the fixtures turned up, all of them in the library rather than the app:

- **`killmail` stamped a refusal it did not mean — fixed on this branch.** The
  cost line carried the missing-charge stillness unconditionally, so a receipt that
  *does* hold a charge record printed `data-priced="1"`, the amount, and a mark
  denying the amount exists. `agents.js` computed `priced` two lines above and never
  used it for the mark. It now stamps the refusal only in the else-branch, and
  `test/agents.test.mjs` asserts both halves: priced prints the amount and carries no
  `data-refusal`; unpriced still refuses. A refusal that is not true is not a
  conservative error — the honesty ledger reads the DOM, so it is a second reading of
  one fact, and the two disagree in the markup.
- **Twelve components refuse by drawing rather than declaring.** `tapeSplice`,
  `twoState`, `muthur`, `city`, `garage`, `grid`, `gevulot`, `dominator`, `ladder`,
  `dossier`, `channel` and `redaction` write their absence as ink — `UNMEASURED`,
  `DARK`, `NO PROOF HISTORY`, `UNATTRIBUTED` — with no `data-motion="still"`
  anywhere, so `DECLARED STILL` reads 0 over a deliberate refusal and a review
  script cannot tell "we drew nothing on purpose" from "we forgot". Each names its
  word in the registry as `refusalText`, and the fixture test asserts the word is
  really on screen. The `standardSheet` in the same role *does* stamp, which is
  what makes the other twelve read as a gap rather than a choice.
- **Finding #10 is closed: an absence speaks in one vocabulary.**
  `app/verify/declared-stillness.mjs` renders every bright model, matches the absence words
  the library actually prints, and asks whether the same specimen declares it in the
  DOM. Ten sites were silent or private-only (`data-unmeasured`, `data-proof`,
  `data-claim` — queryable by anyone who knows the name, uncountable by the rack); each kept
  its flag and gained a mark beside it. Two things to remember: match drawn words
  case-sensitively (the first run convicted `atField` for its fixture's prose "the ones
  dark"), and a *measured* gap takes a plain `still`, never a `refusal` — coverage crossed
  that line and `test/marks.test.mjs`, written for the ink split, caught it.
  `test/declared-stillness.test.mjs` holds the rule with non-vacuity assertions under it.
- **`atField` prints the word `undefined`** for a scope with no count: the label is
  built by `${scope.label}  ${scope.count}` with no `UNMEASURED` branch, which is
  the one state in that file that does not have one.
- **`arrive` takes stamps in seconds and `river` takes them in milliseconds.**
  `field.scanOverlay` windows an arrival at `30`, so a fixture in epoch
  milliseconds is "older than the arrival window" forever. Fixtures derive both
  units from one frozen instant in `app/fixtures/time.js` and pick per component.
- **The globe's canvas loop edits markup the kill switch cannot rewind.**
  `paintGlobe` writes `transform` and `opacity` onto the pins every frame and reads
  `data-motion-off` to stop, which is right as far as it goes — but the pins keep
  wherever the last frame left them, so "settle leaves the markup byte-identical"
  holds on every route except one carrying a *turning* globe. The verify gate
  asserts byte-identity everywhere and asserts frozen-ness instead on that one
  specimen, named in its output rather than quietly excluded.

## The rack, not a storefront

No hero gradient, no floating shadows, no rounded card grid with an accent rail.
`box-sizing: border-box` is reset at the top of `app.css` because a component
sized with padding and a 1px frame overflows its cell by the frame otherwise —
which is the same border-box bug the library already learned once. Wide things
(the overview grid, code blocks, the lane chart) scroll in their own
`overflow-x: auto` container; the body never scrolls sideways, at 390 or 1280.

## The radar's two clocks

A contact's **radius** is evidence age; its **brightness** is a separate measurement — how long
since the sweep crossed its bearing — spent against the same poll interval the wedge turns on
(`data-motion="cycle"` + `data-cycle-axis="brightness"`). The runtime's `cycle` now has three
geometries behind one mark: the bar, the dial (`rotate`), and the ink (`brightness`). Three rules
fall out of it and a reviewer should not have to rediscover them:

- The first animation is the **remaining** poll, not the whole period. So the check is never
  "durations equal" — it is elapsed + remaining = one period, on the wedge and every contact alike.
  `npm run verify:clock` measures exactly that, plus a per-frame sawtooth reset, plus the
  per-field removal state. A repeating tween started at `spent` would be a beat late forever; that
  is why `cycle` uses two animations, here and on the bar.
- Brightness never fades to zero (floor 0.32). A contact that goes dark reads as *gone*, and
  "we have not looked again" is a different fact.
- The source's `band` word chooses ink only while the pass time is measured. Otherwise the contact
  is drawn `data-band="unmeasured"` with a ring: a typed category must not keep a dot glowing after
  the clock it was supposed to describe has refused.

## Two inks, not one

`hatched()` means *this quantity exists and no instrument reported it* — a gap
inside a live drawing. A refusal means *the library holds nothing to draw*, which
is a fact about the source. They shared a texture, a dashed border and the magenta
of `--cd-signal-unknown`, so a sparse board and a blind board were the same
picture in seven components. The split is now in the machinery, not in someone's
eye:

- `refusalHatched()` (`src/draw.js`) draws a **crosshatch inside a solid border**,
  built from two passes of the one existing texture, the second mirrored about the
  region's centre — mirrored, not rotated, because a rotation does not preserve a
  rectangular box. It adds no `<pattern>` of its own: the defs block is
  contract-held byte-for-byte by `test/draw-contract.json`, and a texture that can
  be composed without touching the port is composed, not added.
- `refusal(reason)` (`src/marks.js`) is `still(reason)` plus `data-refusal="1"`.
  **Not every stillness is a refusal** — a threshold, a sightline and a wall are
  motionless and measured — and the first cut of the stylesheet keyed off
  `[data-motion="still"]`, which would have drawn a measured fact in refusal ink.
  That is the same error as the one being fixed, in the other direction.
- CSS: `.cd-refusal` and `[data-refusal="1"]` take `--cd-refusal-ink` (warm
  graphite, defined in all three theme states) and a `1 4` dot-dash against the
  `3 3` gap-dash. Hue is the secondary signal; shape carries the claim.
- `test/marks.test.mjs` holds the two apart in both directions: loopDeviation's
  `NO REFERENCE TRACE` band carries the refusal, coverage's magenta unraided
  region must not.

Still on the list, now that the vocabulary exists: dispatch's rails, ice's walls,
keycard's sleeves, triVision's field, needleField's field of hollow rings.

## Which stillnesses are refusals (and which are not)

`still(reason)` covers two facts and the drawing has always had to separate them by
itself. The split is now marked, and the rule used to decide is worth keeping:

- **`refusal(reason)`** — nothing was held to draw: `no series was retained`,
  `no producer`, `no instant`, `no priors`, `no canonical charge record`, plus every
  card-level refusal (`{ mark: refusal(...) }`, 29 call sites), because a card that
  declines to draw is declining for lack of data.
- **Plain `still(reason)`** — the thing is motionless *and measured*: the sightline
  that is the asymmetry, the axis that is a frame, the threshold that is a rule not a
  route, the glass that blocks a pane, the projection that is not a reading, the lane
  waiting on a person, the legend that is not a reading. Colouring those in refusal
  ink would state that the archive is silent about something the archive actually
  reported.

Refusal bands take `refusalHatched()` too, so an in-card refusal is dense crosshatch
with a dot-dash graphite border and graphite words (`NO PRODUCER`, `NO REFERENCE
TRACE`, `NO FORECAST IS ASSEMBLED`) against a measured row's green frame and a per-row
absence's magenta dot-dash box: three claims, three textures, on one card. Known
residue: the hatch *lines* inside a band still take the specimen's default colour,
because `hatched()` paints its pattern with `currentColor` resolved at the `<defs>`
root, not at the referencing element — the density and the border carry the claim
while the line hue stays, and the pattern def is contract-held, so it is not touched.

`syncRatio`'s ratio band was a thirteenth component refusing by drawing rather than
declaring — hatched span, the words `NO SERIES RETAINED`, and nothing in the DOM —
found while doing the ink work, now declared, and its `DECLARED STILL` went 0 → 4.

## A refusal may shrink. It may not grow.

`app/verify/pair-heights.mjs` measures the `[data-specimen-view]` box on both sides of the
rack's own switch and `app/verify/PAIR-HEIGHTS.md` reports it. The rule is **asymmetric**:
shrinking is a truthful quantity — `muthur` answers one unasked prompt where four queries
were, `tape` shows one blank slot because nothing is queued, and padding either out would
be inventing content — while growing is ink the measurement never claimed, moving
everything below the card because somebody changed an epistemic state. `scaleCrush` added
371px and `individuation` 554px before this existed.

Three things that fell out of enforcing it:

- **A refusal inherits the measurement's sizing, not the library's defaults.** `card()`
  takes `refusalSpan`/`refusalScale`/`refusalCls`, and `refusalFrame` passes them through.
  The fleet wall is drawn at a fixed pixel size so its hexes stay hexes at 390; refusing it
  with a fluid 340×200 frame was honest at 1280 and **collapsed under the drawing floor at
  390** — one fix that manufactured the opposite defect three widths away.
- **The allowance is the sentence, not a constant.** The first cut allowed 26px (one
  measured `i.cd-why` line) and then failed `dominator` +28, `ladder` +54 and
  `contextBurn` +31 for the crime of explaining themselves. The gate now reads each
  refused specimen's own reason-line height and allows that plus the gap it sits in.
- **Words the refusal must say are allowed their own line, once.** `ladder` printed the
  same paragraph — *the producer has not said whether this is permitted; silence is not
  consent* — under every verb, so a fourteen-rung ladder grew by a paragraph. The sentence
  is now printed once per card (`SILENCE_IS_NOT_CONSENT`) and the row keeps the short
  clause; the word `PERMIT UNMEASURED` already carries the fact. Repeating a doctrine
  sentence per row is not more honest, it is layout with a thesis.

## An unreported state is not a state. Check the fixtures too.

Finding #4 lived in `app/fixtures/decision.js`, not in a component: the declared *absence* for
`keycard`/`ice` was `{ path: 'doors[].state', value: 'not_reached' }`. A declared absence has to
be the thing that is actually missing — `unknown` — because `not_reached` is a **verdict** the
sequence earns (a held-shut door behind it). With the substitution in place the dark model
printed `5 WALLS NOT REACHED` and the component dutifully summed a fate for three walls nobody
reported. `magi` and `dispatch` did the same arithmetic in code: `0 of 3 producers contributed`
for a bench never polled, `0 OF 3 MANIFESTS COMPLETE` for sessions nobody reported on.

The rule the four now share: **count what was reported, name the rest, and when nothing was
reported say that instead of dividing.** `UNREPORTED` gets refusal ink (nobody said ≠ something
stopped us — the `authority.js` doctrine), its own count, and its own *shape*: dotted, not the
outline of a turned door. Denominators are measured populations — `dispatch` keeps
`· 3 SESSIONS LISTED`, because the session ids really are there.

When auditing a refusal, read the fixture's declared substitutions before the component. A
substitution that names a *result* is the bug, and every downstream count will look correct.

## Premises, then conclusion.

A figure computed from other figures enters the page **after** every figure it was computed from:
`count(n, n + 1)`, or `level(..., { order: n, total: n + 1 })` for a bar. The runtime turns
`data-index`/`data-total` into `span * (index / total)` with `span` non-decreasing in `total`, so the
slot one past the end of the population is guaranteed to start last. `test/reveal-order.test.mjs`
asserts the two premises rather than a duplicated timing formula, and the delays were read out of
`getComputedTiming()` on the running app (`admission` 414ms against inputs at 150ms).

Three ways this went wrong while being implemented, all of them worth remembering:

- **The population is what the figure summarises, not what is nearest in the code.** `dispatch`
  summarises parts *across* workers: `count(workers.length, ...)` put the summary in the middle of
  the chain of parts it stands for. Multiply both dimensions.
- **A reveal that outlives its evidence is motion without evidence.** `glassCell`'s tally kept
  `count(2, 3)` in the dark model because its `blocked` pane holds *standing refusals*, not readings.
  The honesty gate named the element. Any mark that animates must be justified by data the evidence
  switch can actually remove; when it cannot, the mark refuses.
- **A read of one measurement is not a conclusion.** `gauge`'s number and its arc are one
  measurement, so delaying the number would be a transition invented to look like reasoning. The
  rule is about derived figures; do not extend it to single-source labels.

## A mark moves what its kind can move.

`trace` animates geometry — `path, line, polyline, polygon, rect, circle, ellipse` — and **no text**.
So a `trace` on a leader line says *the line travelled*, and says nothing about the value printed at
its end. `scanOverlay` claimed an order for years while every answer sat in the 0ms frame: the mark
was honest about its own element and silent about the one that mattered. Give text its own reveal at
the same position (`count(i, n)` uses the same `data-index`/`data-total` and therefore the same
delay), and verify with `getComputedTiming().delay` on both elements rather than by reading the
markup. Labels — the questions a form asks — may print at frame 0; answers may not. And an unread
field prints `NOT READ` at frame 0 with no mark: a reveal on an absence is a transition invented to
look like a process.

## An affordance is a shape, never a hue.

`authority.js` renders a granted verb as a real `<button>` and every other state as
`<span role="note" aria-disabled="true">` — "a disabled button is still a button and still invites
the press". That half was right; the half that was wrong is that `ceremony_required` then differed
from the live button by **amber instead of green** only. Two shapes, three states, and the third
state's difference was one channel of one sense. It now carries an inset second rule
(`box-shadow: inset 0 0 0 1px`) — a ring inside the frame reads as *exists and is weighted* in
monochrome, and costs no layout. Solid = press me, ring-inside = weighted, dashed = no grant.

`test/affordance.test.mjs` asserts this against the stylesheet rather than a screenshot, the way the
token ratchet does, because the claim is about the rules that ship. Two durable lessons from the
same pass: **an unlabelled glyph in a known idiom is a claim** — `channel`'s noise glyph measures
amplitude in the shape of the `traffic` squiggle, so the column now says `SIGNAL NOISE · AMPLITUDE,
NOT CADENCE`; and **a fixture that cannot reach a state leaves that state unreviewed** — `dominator`
needed `TERMINATE` in the seam list before the ceremony shape ever appeared on a page.

- **A `level` bar is anchored or it lies.** Without `transform-box: fill-box`, an SVG
  `scaleX(level)` is applied about the centre of the *viewBox* (170 units, not 0), so the bar
  finishes to the left of where it was drawn and stays there — every level in the library
  drew its measurement ~2× off for its whole life, with clean counters throughout. The anchor
  belongs on the marked element *and* `[data-motion="level"] > i`: the runtime animates
  `el.querySelector('i') || el`, so the fill inside a track carries no attribute. Restated in
  `prefers-reduced-motion`, which exists to pin bars at their measurement.
- **`level` has two dialects and the chrome speaks both.** SVG puts the extent in the
  transform; HTML hosts put it in CSS width; `cd-rule-bar` declares 0.406, is given the full
  track as width, and renders 0.189 — finding #11, open. The gate asserts the left edge in
  both dialects and the right edge only where the transform is the extent.
- **The gate waits for *its* specimen now.** `[data-specimen-view]` alone resolves on the
  landing page, because the app is a hash router; drawing claims measured Home while reporting
  the route's name, and `ROUTES` entries need the `#` (`#/component/x`) or the app renders Home
  and every drawing claim on that route goes vacuous. A `/component/<key>` route whose specimen
  never mounts is a failure, not a shrug.

- **A transition word needs both ends.** `dellpromax → spark-02` under one field's cite said
  drift when nothing measured a change; the rule (in `test/app-fixtures.test.mjs`) is that a
  printed arrow/drift/splice cites two sources, unless the same sentence negates it —
  `drift unmeasured` is a statement of absence, which is the house style and needs nothing.
- **Counts and nouns are one measurement, and the count belongs to the caller.** The
  envelope's note hardcoded both a plural-free noun and the library's default three, so a
  producer with four boundaries was described as having three. Interpolated copy is derived
  data: pluralise from the same number, and take the total from the argument, never from a
  constant in the component.

## The gauntlet, and what it found lying

`node app/verify/gauntlet.mjs` (npm: `verify:gauntlet`, then `verify:gauntlet-sheet` for the
pictures) walks `vault/GAUNTLET.json`: each row is one component, the verified vault file it was
built against, the figure `vault/spec.py` read off that file, and a measurement of the app's own
specimen. It writes `OUT/GAUNTLET.md`, `OUT/summary.json`, and one sheet per gap with the
reference's frames on the row above the specimen's. Rows with no `assert` are printed `held`, never
`pass`. `test/gauntlet.test.mjs` holds the rows to the vault's own records — a quoted figure has to
be a string `SPECS.md` actually contains.

Two defects it produced on its first run, both invisible in any screenshot:

- **A measured period that depended on the refresh rate.** `globe.js` advanced the mesh by
  `2π / (period × 60)` **per animation frame**, which is a 60 Hz assumption wearing a measurement.
  Timed against its own `data-period`, a 4 s globe turned in **1.1 s** on a headless compositor
  with no vsync lock. The angle is now derived from elapsed time; the same instrument reads
  **4.00 s, no spread between turns**. Any loop you write must take its rate from `performance.now()`.
- **An easing word that did not ease.** The tilt asked the engine for `ease-out` and measured
  **0.48** of its travel at half the animation's own duration — a straight line. `vendor/motion.min.js`
  honours a named curve weakly; the reference is at 0.93. The travel now lives in a middle keyframe
  (`(0 - deg * 0.07)`), and measures **0.92**. A named curve is a request; a keyframe is a measurement.

Two instrument lessons paid for in the same run, both recorded in the file's comments: "half the
duration" must mean the **animation's** half (`effect.getComputedTiming().progress`), not half of the
sampling window; and the endpoints of a travel must be read from the whole capture, because the
engine fills its keyframes backwards and the frames before and after an animation carry its start
and rest. Fitting a sinusoid over less than ~1.5 turns is degenerate — the turn is now **timed at
phase crossings**, which also reports the constancy the reference is quoted for.

## Two ways an instrument can read "still" off a moving thing

- **`Element.getAnimations()` defaults to `{ subtree: false }`.** A gauntlet check written as
  `view.getAnimations().length` reported 0 animations inside a specimen while three of its contacts
  were sweeping — it was counting only animations attached to the container itself. Pass
  `{ subtree: true }`, and sabotage any stillness check by pointing it at something that moves.
- **A row number is only meaningful beside the sheet that printed it.** One eye pass marked twelve
  rows against an `index.json` left in a previous `OUT` directory: eleven descriptions landed on
  files nobody had looked at and one of them was written as `contentVerified: true`. `vault/eyeball.py MARK`
  now refuses a row-addressed mark unless `SHEET` names a file in the same directory as the index it
  resolved, and the repair (`git checkout vault/EYEBALL.json`, re-mark by raw path) is cheap only
  because the marks are one JSON file. Mark by path when in doubt; the path is checked against
  `MANIFEST.json` and the row is not.

The yield of the eye pass is worth stating as a number: **12 of 114 ranked moving files** survive
it. The twelve newest produced **one** usable interface — a full-frame game UI — and the other
eleven were stormtroopers, a cartoon stand, two Blade Runner corridors, a digitised man, three site
logos, a webring banner, a banner that changes by hue alone, and a character hologram. GIF hosts
index characters and site decoration; the diegetic interface is not what the harvest reaches. The
one file that passed is what makes `dossier`'s stillness *visible*: the panel in it arrives over a
field where 11 of 12 cells keep changing, and `dossier` has no running field, so `gauntlet.json`
now asserts that it does not breathe.

## The moving references were on a host that answers a plain request

`vault/clip.mjs` takes a **direct** media URL (or a file already on disk), derives a window of it
as a GIF for `spec.py`, sheets the frames for the eye, and writes the manifest record with the
derivation on it (`segment.start`, `segment.seconds`, `sourceSeconds`). It is 100 lines and it
found in one run what eleven batches of GIF-host harvest mostly did not: a frame-filling moving
interface — a declassified F-16 HUD (`raw/f16-hud-gcas.gif`, Wikimedia Commons, `curl` answers it,
no browser, no challenge). YouTube refuses media downloads from this network (`403`, then the `tv`
client's "page needs to be reloaded"); Commons answers. Query the Commons API with
`filetype:video …` and `gsrnamespace=6`, take `imageinfo[].url`, and derive a window.

What that one file is now quoted for: **`envelope`** (a FLYUP limit cue arrives when the measured
closure violates the limit, holds exactly as long as it lasts, and leaves; the limit itself is
printed beside the live value — `AL 500` — which is the answer to the extent that meant "0.62 of
what"), **`tape`** (graduations scroll under a pinned boxed readout, so the movement is the
reading and the position is the number), and `elapsed`. It also shows the library's own refusal
from the outside: where a value is unavailable the HUD prints `xxx` **inside the field**, and a
masked black block keeps its space with every neighbour still laid out.

Two number-hygiene lessons, both from files written in the same hour: the frame count of a derived
GIF must be **counted out of the file** (the tool first wrote `DUR × FPS` = 96 into a record for a
file it believed held fewer), and a cap on what gets measured is not a property of the file —
`spec.py` measures the first 80 frames, so its line now says `first 80 of 96 frames measured`.

## The bright-ink instrument is blind to a light theme, and that is not a finding about the file

`vault/spec.py` finds the moving marker by looking for **bright, saturated** ink that changes
position. The audio-editor reference (`raw/scope-envelope-violin.gif`) is a light grey window with
a dark hairline playhead, so the instrument reports `travel of the bright head: N/A — no bright
marker crosses the frame` while the eye watched that playhead cross the whole frame in eight
seconds. An `N/A` from that column is a statement about the instrument's contrast assumption, not
evidence that nothing moved. The eye remains the gate; the instrument's job is the rate and the
extent *when it can see the thing*. Do not "fix" the N/A by lowering the saturation threshold until
a dark-on-light file is the one being measured, and never quote a column the instrument marked N/A
as if it had measured something — `test/gauntlet.test.mjs` refuses a `referenceFigure` fragment the
file did not print, N/A included.

And a noun search returns the thing, not the screen: Commons `radar` gave a camera pointed at a
rotating antenna on a hill. Search for the **display** (`oscilloscope`, `HUD`, `monitor screen`).

## A playhead needs a shared axis, and `river` does not have one

The audio-editor reference made the missing idiom look cheap: draw a hairline at `now` and let it
cross the field. It is not portable, and the reason is in the geometry, not the will. `river` maps
each lane through `px(t) = gutter + ((t - t0) / span) * (right - gutter)` where `t0` and `span` come
from **that lane's own** first and last event. Every lane is normalised to its own life, so "now"
has one x per lane and none of them agree — a now-line clamped to each lane's right edge would
print "now is where this lane stopped", the falsest sentence a time chart can make. `tape` is not an
escape hatch either: it is the *decision* tape, a queue of waits, with no axis at all. The mark kind
still does not exist; the row stays `notHeld` with this reason in it. Building the idiom means a
component whose x is absolute time — which is a new drawing, not a new dialect.

## The Commons search API throttles; the file resolver does not

`vault/clip.mjs` derives from a **direct media URL**, and there are two ways to get one. The search
API (`generator=search&gsrsearch=filetype:video …`) is the discovery route, and it eventually answers
`You are making too many requests to the API` in plain text with no JSON — so a script that pipes that
into `json.load` reports a parse error and looks like a code bug. Two rules:

- **Never reconstruct a URL from a truncated print.** One run of this vault recorded a 137-byte 403
  page as a candidate reference because the search output had cut the URL and the hash directory was
  guessed. Take the whole field, or take nothing.
- **Resolve a known filename instead of searching for it again**:
  `curl -IL "https://commons.wikimedia.org/wiki/Special:FilePath/<File_name_with_underscores>"` and read
  `url_effective`. That is the canonical resolver, it is not the search API, and it returns the exact
  `upload.wikimedia.org/…` path — including the query the CDN attaches, which is fine to drop.

Also new in the manifest: `cameraDrift: true` on `raw/solari-departure-flap.gif`. The Solari board is a
superb dispatch reference and the camera was handheld, so `travel of the bright head` reads 0.163 when
the board's own centroid travel is close to zero — a flap changes **in place**. Where a split-flap
recorded from a moving camera measures travel, the travel is the cameraperson. Say so in the file
record before somebody quotes the number.

## A change window is ~300ms, and a sabotage must be planted in the real mechanism

Two ways this vault nearly shipped a fake instrument, both in `no_blend_on_change` (the Solari board's
rule: a value change shows one face or the other). The recorder found **zero** animations in the change
window when it sampled at +60/+180/+420/+900ms, and **four** when the same window was sampled at
+30/+50/+70/+150/+300ms: a field change re-runs one entrance, so the whole window is ~300ms. Anything
that waits a beat before looking reports a clean it never looked at.

And a sabotage must exist in the mechanism the code uses. A stylesheet rule
`animation: sabotage-fade 900ms linear` on specimen `<text>` produced **no `Animation` object at all** —
computed style named the animation, `getAnimations()` held nothing, and adding `infinite` changed
nothing, because the `@keyframes` never resolved. Three invalid sabotage attempts went by before one
was planted where the library actually animates: a component marking a text-bearing group, which the
runtime then fades with WAAPI opacity. That one turned the check red. Marks → runtime → WAAPI is the
mechanism; a CSS rule that may never build an object is not.

Shell hazard found the same hour: `python3 - <<'PY'` with `open(p,'w').write(<big expression>)`
**truncates the file before the expression is evaluated**, so an exception in the expression leaves the
file empty. Compute the new text, then open and write it. One findings document was rebuilt from git
after exactly that.

## The vault's file schemas, and the three ways I broke them in one sitting

Guessed shapes cost more time than the acquisition did. Written down so they are read, not repaid:

- `vault/SPECS-FOR.json` holds **one record per verified file**: `{"for": ["radar", "coverage"],
  "reading": "…"}`. It is *not* a list of `{component, gap, quote}` objects. A record with invented keys
  is not rejected loudly — the coverage count simply refuses to rise, which took a test failure to notice.
- `vault/GAUNTLET.json` rows call the symptom **`gap`**, not `symptom`, and every row needs
  `referenceFigure` — a fragment of at least 18 characters that appears **verbatim** in `vault/SPECS.md`
  (`test/gauntlet.test.mjs` splits it on `;·,` and looks for each piece). `heldAs` is what lets a caution
  row go unasserted; `route` is what lets a row name no component.
- **Never normalise a data file by rebuilding its records from a whitelist of keys.** I sorted one row's
  fields with `{k: row[k] for k in keys}` applied to *every* row, which silently deleted `heldAs` and
  `route` from rows I had not touched and failed two invariants on them. A whitelist is a deletion machine
  wearing a formatting tool's clothes. Append to a list; do not rebuild the records.
- `vault/clip.mjs` takes **`KEY=value` pairs as arguments** (`SLUG=… START=… DUR=… URL=… WORK=…
  SHOWS=… SHOWS_HOW=… RELEVANCE=…`), not `--flags`, and `FILE=` means *a file already on disk*. Its refusal
  is correct and unhelpful-looking: "needs SLUG=", because it will not write a manifest record with a hole
  where the provenance goes.
- Coverage is counted from `for` lists **intersected with `COMPONENT_KEYS`**: 17 of 51 components are
  spec-held, and `for` legitimately holds mark kinds (`level`, `trace`, `elapsed`, `decay`) and the
  `rules page`, so a raw count overstates it. `test/gauntlet.test.mjs` now refuses a `for` name that
  resolves to none of those three things — a typo'd component name would otherwise read as coverage nobody
  can render, and the guard has been proven red on `radarSweep`.

And the quietest one: piping a verify tool's stderr into `/dev/null` let `gauntlet-sheet.py` fail three
commits running while I reported "sheets regenerated" from the directory it had left behind. Run the tool
where its noise can be seen; a broken tool that prints nothing looks exactly like a passing one.

## Coverage has three numbers, and only one of them means what people think it means

`node vault/coverage.mjs` (also `npm run verify:coverage`) writes `vault/COVERAGE.md` and splits the
registry into three tiers: **18 spec-held** — a verified file's measurement is quoted against the component
in `SPECS-FOR.json`; **17 files-only** — marked files resemble it and nobody has read a measurement off
them; **16 with nothing**. They sum to 51 and `test/coverage.test.mjs` holds that partition, holds each
spec-held component to a file the eye verified *and* a row `spec.py` measured, and refuses a `COVERAGE.md`
whose counts have drifted from the live derivation.

Prose had been quoting "25 without a usable reference" (from `map.py`, files joined by resemblance) and
"34 lack references" interchangeably. The widest reading overstates coverage by more than three times:
eleven files on a component is not a reference you can build against, it is eleven pictures nobody measured.

The steering consequence, learned the hour the report was written: **the cheapest coverage is not
acquisition.** Seventeen components already hold marked files. Re-reading the 18 verified files and asking
what *else* is visible in each frame — a health bar beside a survey grid, a ratio beside a countdown — raises
the spec-held tier with no network at all. Acquisition stays the only route for the 16 in the nothing tier.

## Undo a sabotage with a copy, not with `git checkout`, while the file carries uncommitted work

`git checkout vault/EYEBALL.json` to undo a doctored `contentVerified: false` also threw away the mark
that turn had just made — the mark was uncommitted, so "restore" meant "erase the finding too", and the
coverage test then failed for a *true* reason (a component counted as spec-held on a file nobody verified).
The instrument was right and my repair was wrong. Snapshot to `/tmp` before sabotaging a file the turn has
written to, and restore from there.

## A stack of lanes needs one axis before it can have a "now"

`river` built its time mapping *inside* each lane (`px(t)` from that lane's own `t0`/`span`), so every run was
stretched to the full plate and `now` had one x per lane. Nothing on a single lane reveals this; on three lanes it
destroys the only facts a stack carries. If a component stacks lanes and anything might later need a shared x — a
playhead, a cross-lane event, "which one finished late" — the span must be computed across the deck, and each lane's
own coverage drawn *within* it, so a lane that began late visibly began late.

Two reusable pieces from that change:

- **How to test it from the outside:** count the distinct run-end x values on the plate. Under per-lane
  normalisation it is exactly **one** — every lane ends at the margin — and on a shared axis it is however many real
  end times the lanes have. `lane_axis_shared` in `app/verify/gauntlet.mjs` does this, so the DOM never has to
  confess timestamps. Its sabotage is the old `px` restored verbatim, and it goes red: *1 distinct run end(s) (874.0)*.
- **A static line can be a measurement.** The ruler and the now-line deliberately carry **no mark and no motion**:
  the measurement is the run ink, which travels because the run happened. A playhead sweeping across on nothing is
  exactly the motion `MOVING WITHOUT EVIDENCE` exists to catch. "Now" is a line at a measured x with its stamp
  printed beside it, clamped-and-named when it falls outside the deck.

SVG labels: a `text-anchor="middle"` label centred near the right edge **hangs past the viewBox**, and
`app/verify/index.mjs` reads that as a plate defect (it turned 8 viewport/theme combinations red before it was
anchored to whichever side has room). Long notices go inside the plate, not off its edge.
