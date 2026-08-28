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

## The traps, paid for

- **`<repo>/react/` shadows the npm `react` package.** With the Vite root at the
  repository root, a bare `import { useEffect } from 'react'` resolved to the
  library's own `react/index.js`: the dep pre-bundle came out containing
  `src/marks.js` and every page died with *"does not provide an export named
  'useEffect'"*. Root the build at `app/` (`vite.config.js`) and the collision
  disappears. Anyone adding a second build config will hit this again.
- **`CyberdeckMotion.start()` does not consult `CyberdeckMotion.off`.** `off` is
  computed once at load from `prefers-reduced-motion`, `?still=1`, and a missing
  engine, and it gates only the runtime's own auto-start. A caller that calls
  `start()` anyway re-enables motion on a page whose operator asked for none —
  including `react/index.js`'s own `useMotion`/`useMotionEffect`. Everything in
  `app/` goes through `app/src/motion-bridge.js`, which refuses when `off` is
  set. Upstream, `start()` should check it.
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

- **`killmail` stamps a refusal it does not mean.** The cost line carries
  `data-motion="still" data-still-reason="no canonical charge record is supplied"`
  unconditionally, so given a charge record it prints `data-priced="1"`, the
  amount, and a sentence denying the amount exists. `agents.js` computes `priced`
  two lines above and never uses it for the mark. The fixture keeps the receipt
  honestly UNPRICED so the showcase does not ship the contradiction.
- **Twelve components refuse by drawing rather than declaring.** `tapeSplice`,
  `twoState`, `muthur`, `city`, `garage`, `grid`, `gevulot`, `dominator`, `ladder`,
  `dossier`, `channel` and `redaction` write their absence as ink — `UNMEASURED`,
  `DARK`, `NO PROOF HISTORY`, `UNATTRIBUTED` — with no `data-motion="still"`
  anywhere, so `DECLARED STILL` reads 0 over a deliberate refusal and a review
  script cannot tell "we drew nothing on purpose" from "we forgot". Each names its
  word in the registry as `refusalText`, and the fixture test asserts the word is
  really on screen. The `standardSheet` in the same role *does* stamp, which is
  what makes the other twelve read as a gap rather than a choice.
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
