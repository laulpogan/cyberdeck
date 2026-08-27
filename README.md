# Cyberdeck

Cyberpunk HUD components that refuse to lie.

Most sci-fi UI libraries ship shapes: clip-path corners, scanlines, a neon
palette. They look right and they say nothing. Point one at a feed that died an
hour ago and it will sweep, pulse and count exactly as it did when the feed was
alive, because nothing in it knows the difference.

Cyberdeck is built on one rule.

> **Motion is a measurement or it does not happen.**

Every animation here is a function of a number some producer actually supplied.
When that number is missing the animation is not softened, defaulted or filled
in with a spinner. It is refused, and the refusal is written into the markup
where a person can read it.

```
data-motion="still" data-still-reason="nothing travelled this path"
```

That attribute is the library. Everything else is delivery.

## Why refusal matters

Motion is the easiest lie an interface can tell. A sweep across a panel reads
as scanning. A pulse reads as traffic. A spinner reads as work in progress.
None of them need a producer — a `setInterval` will draw all three over a
payload that has not changed since Tuesday, and an operator will believe every
one.

The dangerous case is not the outage. It is the panel that keeps moving through
the outage, because a moving panel is how a person decides not to look closer.

So the refusals are specific, and they are the parts worth reading:

| Situation | What happens |
|---|---|
| A route delivered nothing | The path does not draw itself |
| The feed went stale | The clock stops and the pulse stops |
| Nobody counted the population | The stagger is refused, not invented |
| A quantity was never measured | The bar does not grow to zero |
| A poll is overdue | The cycle refuses rather than wrapping |

That last one is the whole design in miniature. A poll due forty seconds ago
that has not landed *is the finding*. An indicator that quietly wrapped and
started again would erase it.

## Install

```sh
npm install cyberdeck-ui
```

Or copy `src/` and `vendor/` into your project. There is no build step and no
runtime dependency beyond a 3.1 kb animation engine, vendored in the box.

## Use it

A mark is a plain object of `data-*` attributes. Nothing else.

```js
import { trace, elapsed, traffic, still } from 'cyberdeck-ui';

trace(route.delivered, { cite: 'routes[].delivered' });
// → { 'data-motion': 'trace', 'data-cite': 'routes[].delivered' }

trace(false, { cite: 'routes[].delivered' });
// → { 'data-motion': 'still', 'data-still-reason': 'nothing travelled this path' }
```

One runtime reads them and drives the browser's own animation engine:

```html
<link rel="stylesheet" href="cyberdeck-ui/tokens.css">
<link rel="stylesheet" href="cyberdeck-ui/motion.css">
<script src="cyberdeck-ui/vendor/motion.min.js"></script>
<script src="cyberdeck-ui/runtime.js"></script>
```

**React** spreads a mark directly, because the keys are already `data-*`:

```jsx
import { useMotion, trace, level } from 'cyberdeck-ui/react';

function Routes({ routes }) {
  useMotion();
  return <svg>{routes.map((r, i) =>
    <path key={r.id} d={r.d}
          {...trace(r.delivered, { cite: 'routes[].delivered', order: i, total: routes.length })} />
  )}</svg>;
}
```

**Anything else** — a template, a static site, a server in another language —
emits the same attributes as text:

```js
`<path${attrs(trace(r.delivered, { cite: 'routes[].delivered' }))} d="..."/>`
```

That is deliberate. No component ships animation code, which is what lets the
honesty be tested without a browser and lets the delivery layer be swapped
without touching the contract. The system this was lifted from renders its
markup from Python; the runtime never noticed.

## The nine kinds

| Kind | Answers | Needs |
|---|---|---|
| `arrive` | Did this change, and does anyone know when? | An observed timestamp |
| `decay` | How stale is this, before I read the number? | A measured age |
| `count` | How many, and in what order were they counted? | An index inside a real count |
| `level` | How full, drawn rather than printed? | A measured quantity and a ceiling |
| `elapsed` | How long, still counting because it is still true? | A duration and a live source |
| `trace` | Did anything actually travel this path? | The fact that something did |
| `traffic` | Is this feed live, at its own interval? | A positive measured period |
| `cycle` | Is this being polled, and is the next poll due? | A position inside a known interval |
| `intent` | Did the operator cause it? | Nothing — they are the producer |

Plus `still(reason)`, which is not a fallback but a declaration. An element with
no mark and an element whose mark was forgotten render identical HTML, and only
one of them is correct — so the correct one says so, and a review can tell them
apart.

`elapsed` is the one that surprises people. A wait of five hours measured three
seconds ago is five hours and three seconds now, so the counter keeps running;
freezing it at render time is the *less* truthful option. But only on a live
source. On a stale feed it stops, because a counter that still ticks is claiming
somebody is still watching.

## What this is not

It is not a component kit. There are no buttons, cards or modals here, and the
demo's styling is a demo. What the library provides is the motion layer and the
token palette — the parts that are hard to get right and easy to get wrong in a
way nobody notices for six months.

It is also not a theme. Nothing in the source names a colour; every component
reads a token, which is what makes a re-skin a stylesheet edit rather than a
search through the markup.

## Run the demo

```sh
npm run demo    # then open http://127.0.0.1:8199/demo/
```

Every panel is the same component twice — once with evidence, once without. The
right-hand side is the point.

Turning motion off lands on the markup the page already declared. Cancelling is
settling, not a second design: the operator's system preference, the toggle, and
a vendor bundle that fails to load all produce the identical page.

## Provenance

The marks, the runtime and the palette were lifted out of a working operations
console, where they are held by a unit suite and a browser review script across
eight pages, three viewports and both themes. The port is not a rewrite — the
original's output was captured to `test/contract.json` and `npm test` compares
against it case by case, so a refusal that softens into a default fails as a
string mismatch rather than as a dashboard that lies next year.

```sh
npm test
```

MIT.
