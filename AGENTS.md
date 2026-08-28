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

## The rack, not a storefront

No hero gradient, no floating shadows, no rounded card grid with an accent rail.
`box-sizing: border-box` is reset at the top of `app.css` because a component
sized with padding and a 1px frame overflows its cell by the frame otherwise —
which is the same border-box bug the library already learned once. Wide things
(the overview grid, code blocks, the lane chart) scroll in their own
`overflow-x: auto` container; the body never scrolls sideways, at 390 or 1280.
