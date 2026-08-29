# The comb instrument — prior art, and the twenty-six other places it goes

A spike on one pattern: a population where every member has the same shape, one
cell each, driven by a measurement that is true right now. It is the field
component's ancestor, and this is the record of what the pattern actually is and
what else it could carry.

Full page, with the twenty-six ideas and their signals:
[`pages/the-comb-instrument.html`](pages/the-comb-instrument.html).

## What the pattern is

Not a chart. An instrument for reading a population.

Strip the hexagons away and what is left is simple: a set of things with the same
shape, one cell each, driven by a live measurement. The hexagon earns its place
only because cells sharing edges read as one field rather than as a grid of
separate objects — the eye gets a texture instead of a list.

So the question is never whether it should be hexagons. It is **which population**
and **which measurement**. Change either and the same parts build a different
instrument.

## Prior art, verified against primary sources

**Datadog Host Map.** The mature version of exactly this pattern: hosts as
hexagons, colour by metric, tag-sharing nodes clustering, click to zoom into
integrations. We converged on it independently, grouping included. Their cells are
hosts — a population that barely changes.

**Calm technology.** The design discipline for information that lives in the
periphery: glanceable, no modals, no alarm walls. Now a maintained standard with a
certification and a published product list rather than a 1995 essay. It is also the
diagnosis for why an all-red field failed — alarm colour spent on the ordinary
state.

**Agent observability, 2026.** The category is trace-first: timelines, span graphs,
token counters, OpenTelemetry GenAI conventions. Its own practitioners name the
failure — five concurrent agents producing five concurrent traces with shared state
mutations is unreadable.

**The gap.** Traces answer *what did this agent do*. At ninety concurrent agents
that question is unanswerable and also the wrong one. The comb answers *what is the
colony doing*. The field is building better microscopes; nobody is building the
wide shot.

## The twenty-six, by which part you swap

Every idea names the signal it rides on, because a cell property with no
measurement behind it cannot be filed.

**Swap the population — what a cell is.** A systemd unit (165 timers run the fleet
and nothing shows them at once). A card rather than a worker, which makes the comb
the board rather than a view of it. A branch at the merge gate. A repo file, by
churn, showing where two writers will collide next. A steering lens. An hour, as a
contribution comb. An open defect. A host, for parity with the prior art.

**Swap the encoding — what a cell says.** A sparkline inside each cell, separating
quiet-because-queued from quiet-because-stuck. Nested comb, expanding a lens into
its workers in place. Size as spend, so an expensive agent looks expensive. Ghost
cells, so finished work leaves a fading trace. Notches for reclaims, so a card on
its fourth attempt does not look like one on its first.

**Make it ambient — the axis worth the most.** Field temperature shifting with
engine saturation. The favicon as one hexagon coloured by the worst state on the
board — fleet state readable from a browser tab, for the cost of one canvas
element. An audio hum whose pitch tracks throughput and whose dropped note marks a
failure. A full-bleed screensaver legible across a room. A statusline comb, one
block per lens, in every shell prompt. Wallpaper regenerated each minute.

The ambient group is the one that pays, because it removes the act of going to
look — which was the cost the instrument existed to remove in the first place.
