# The cybernetics canon, and what each diagram binds

Six textbook diagrams. They are the load-bearing pictures behind the library, not
decoration on top of it. Each one is redrawn on
[`pages/the-idea-bank.html`](pages/the-idea-bank.html); this file records what each
one obliges a component to do.

The through-line: every one of them is about a signal that either exists or does
not. That is the same claim the library makes about motion, arrived at from the
control-theory side rather than the interface side.

## Wiener — the closed loop

Sensor, comparator, effector, plant, back to sensor. The error signal drives
everything; without a sensor reading there is no error, and without an error there
is nothing for the effector to do.

**Binds:** every control renders its own loop as a receipt trail. Operator decision
goes out as a command, the fleet acts, the observer reports, the queued item
clears. A control that cannot show the sensor half of its loop is a button with no
feedback path, which is the thing this diagram exists to forbid.

## Ashby — requisite variety

Only variety absorbs variety: V(C) ≥ V(D). A controller with fewer distinguishable
states than its disturbance cannot regulate it, no matter how fast it runs.

**Binds:** the human decision queue is the variety amplifier. Automation covers the
disturbance classes it has states for; everything else has to reach a person, and
the interface has to say so rather than absorb it silently. Render the balance per
fleet, so an operator can see when the controller has run out of variety.

## Beer — the Viable System Model

Systems 1 through 5, recursively. S1 does the work, S3 manages it, S3\* audits,
S4 looks outward, S5 holds identity. The algedonic channel is the red dashed line:
pain bypasses the hierarchy and reaches the top directly.

**Binds:** the critical class in the decision queue may bypass every filter,
including snooze. That is the whole justification for a channel that cannot be
muted — not urgency theatre, but a structural claim about what a viable system
needs.

## Forrester — stock and flow

Rectangles are stocks, valves are flows, clouds are the boundary. Delays are drawn
on the arrow, not implied by the layout.

**Binds:** every metric declares which it is. A queue is a stock; an admission rate
is a flow; drawing one as the other is the most common quiet lie in an operations
dashboard. Queue arrows carry the measured admission-to-placement lag, or they
carry nothing.

## Rasmussen — the abstraction hierarchy

Why (mission and purpose), what (work and function), how (session and process).
Ecological interface design says an operator moves up and down this ladder, and a
surface that only serves one rung forces the other two into the operator's head.

**Binds:** the scope stack is this ladder. Descending goes why → what → how;
escaping climbs back. Every surface has to serve glance, pattern, and drill-down,
which is why the same fleet gets more than one projection rather than one
compromise view.

## Shannon — channel with noise

Source, encoder, channel, decoder, destination, with noise entering at the channel.

**Binds:** every inbound agent message renders through this diagram, and the noise
arrow is exactly where untrusted content enters. Attention is channel capacity, so
admission to the operator's queue is a budget, not a firehose. A message whose
provenance is unverified is noise until something authenticates it, and it should
be drawn that way.

## The honesty rules that survive all of it

These are the rules that the wide pass could not talk itself out of.

- Every mark is canonical. Absences are printed — one reserved colour owns
  UNMEASURED everywhere it appears.
- No invented topology, progress, causality, or cost. The tape breaks rather than
  interpolates.
- A control without authority renders as inert glass naming the grant it lacks.
  A fake button is referent drift shipped as a product.
- Composite scores decompose on demand. A number nobody can take apart is a number
  nobody should act on.
- Recorded and live are materially different. Grain, decay and trails belong to
  history only; live data never trails.
