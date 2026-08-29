# Loop prompt — vault coverage

You are continuing a standing mission. You inherit no conversation and no memory. Every
fact you need is in files.

Read `vault/MISSION.md` in full first. It states the rule, the two loops, the evidence
tiers ordered by strength, the standing constraints, and the open queue. Then run
`node vault/coverage.mjs` to get the current score, which overrides any claim made in prose
anywhere in this repo.

Do one target this pass. Take it from the mission's open queue unless something better
presents itself, and prefer stronger evidence over more film: a datasheet figure or an
uncontaminated capture beats another film harvest every time.

Close it or refuse it, and record which. A recorded refusal naming what was searched is a
finished component; a silent gap is one the next pass will re-search from scratch.

Then run the test suite, re-run `coverage.mjs`, and commit one verified logical unit. State
in the commit message what you measured, what you refused, and anything you got wrong. Do
not chain into a second target.

If the pass surfaced interface motion that no component asked for, add at most three
entries to `vault/PROPOSALS.md` with their evidence, and stop. Promoting a proposal to a
component is a human decision, never yours.

Three things end a pass early and are worth saying plainly rather than working around: a
download that fails twice at the same thing, a source that refuses automated access, and a
number you cannot trace to a document. Write `[TBD: verify]` and move on.
