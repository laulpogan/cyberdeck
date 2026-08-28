# AGENTS.md

Cyberdeck: a component library and its showcase app. Every animation is a
measurement or a written refusal. Nothing here is a screenshot.

## Commands

- `npm test` — full suite: library contract tests, app logic tests, browser
  gates. It launches headless Chromium; expect about a minute.
- `npm run demo` — static server on :8199 for the hand-written demos. The
  app lives at `app/index.html` in the same tree; no build step, ever.

## The two halves

`src/` is the library: string-returning component functions (`src/components/`),
mark factories (`src/marks.js`), drawing primitives (`src/draw.js`), and the DOM
runtime (`src/runtime.js`). The runtime reads `data-motion` marks, animates with
Motion mini (`vendor/motion.min.js`), and honours `settle()`: a settled page must
be byte-identical to the never-started render. `test/app-browser.test.mjs`
enforces that literally, comparing `body.innerHTML` against a `?still=1` export.

`app/` is the showcase. `app/registry.js` is its single source of truth: one
entry per component with the fixture model, the evidence controls (exact model
paths whose removal refuses each motion), the refusal copy, and the family.
Adding a component means: a fixture in `app/fixtures/`, a `W(...)` spec in the
registry, and a family id. `test/app.test.mjs` fails the closed set if fixtures
and specs drift, if a dark model touches an undeclared path, or if removing
evidence ever manufactures motion instead of refusing it.

## Non-negotiables

- Motion is a measurement or it is refused, in the markup, with a reason.
  No spinners, no skeletons, no ambient pulse, no looping decoration.
- The honesty bar counts live: `MOVING WITHOUT EVIDENCE` must read 0 at all
  times on every page, both themes. It is computed from `document
  .getAnimations()`, never from a model.
- Colour literals live in `src/tokens.css` only. The browser suite greps the
  app chrome as a ratchet. Both themes must look designed, not inverted.
- Fixtures are deterministic: no `Math.random()`, no `Date.now()`; the clock
  is a constant. Dark (unmeasured) models are derived by nulling declared
  control paths, never hand-written.
- `prefers-reduced-motion` renders zero animation and loses nothing.
- Playwright resolution for the gates: an explicit `PLAYWRIGHT_MODULE_DIR`
  wins, then the repo tree, then the npm global root. If none resolve, the
  browser file skips with a note — do not "fix" the skip by weakening it.

## Gotchas that cost hours once

- `CyberdeckMotion.start()` fires on `DOMContentLoaded`; the app module
  mounts after that listener. Mounting before it double-starts every mark.
- Motion mini commits final keyframes into inline `style` on finish. The
  runtime remembers each node's rendered style at `play()` and restores it
  on settle; handlers that write inline style before `play()` (trace's dash,
  the cycle dial) must call `remember()` at the write site.
- Blink flushes a bare `style=""` once after cancellations; settle sweeps
  it on the next frame. If a byte-identity diff shows an empty style
  attribute, suspect the sweep's node list, not the exporter.
- The app router uses `#/families/<id>`. Route tests must distinguish real
  pages from the NO ROUTE fallback ("view not empty" proves nothing).
- A page whose only live motion is an interval clock has zero WAAPI
  animations; check clocks and loops separately when asserting liveness.
