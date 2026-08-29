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
