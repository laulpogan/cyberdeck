# Examples

Three published pages that run the real library, preserved as files. Each is the
artifact's own HTML with the host frame runtime removed and nothing else edited;
the source URL is named in a comment at the top. They are self-contained apart from
Google Fonts, so they open from the file system:

```sh
open examples/cyberdeck.html
```

| Page | What it demonstrates |
| --- | --- |
| [`cyberdeck.html`](cyberdeck.html) | The nine kinds of motion, each panel showing the same component twice — once with evidence, once without. The right-hand half is the library |
| [`motion-is-a-measurement.html`](motion-is-a-measurement.html) | The motion vocabulary in full: arrive, decay, and the seven others, each beside its own refusal, with the honesty readout live |
| [`the-deck-redrawn.html`](the-deck-redrawn.html) | Three components that already existed as canvas bitmaps, rebuilt as elements. The write-up of why a bitmap could not be reviewed is on the page |

All three carry a live readout of what the page is actually doing.
`cyberdeck.html` and `the-deck-redrawn.html` show the full honesty bar —
animations running, marks, declared still, and the number that has to stay at
zero, moving without evidence. `motion-is-a-measurement.html` runs the shorter
version: animations and marks.

`the-deck-redrawn.html` is the clearest argument in the set. A bitmap has no
elements, so there is nothing to hang a mark on and nothing for a review to ask.
The dials grew from zero whether or not a ratio had been measured, and the globe
turned at a constant rate over a dead feed. A turning globe reads as health, which
makes it the most expensive thing on a deck to get wrong.

## The other runnable surfaces

**Component demos**, on this branch, in [`../demo/`](../demo/) — one page per
family. They load `src/` directly, so they need a server:

```sh
npm run demo        # python3 -m http.server 8199
open http://localhost:8199/demo/
```

**The two showcase apps** live on unmerged branches. See
[`../docs/reference/branches.md`](../docs/reference/branches.md).

```sh
# vanilla, with a live data adapter on a real clock
git worktree add ../cyberdeck-opencode app/opencode
cd ../cyberdeck-opencode && npm run demo:live     # http://127.0.0.1:8299/app/

# React, with the evidence-toggling rack and the verify suite
git worktree add ../cyberdeck-pi app/pi
cd ../cyberdeck-pi && npm install && npm run app  # http://127.0.0.1:5199/
```

The two motion branches carry their own copies of these apps on different ports —
`motion/vault-gauntlet` serves the vanilla app on 8299, `motion/vault` serves the
React app on 5299 — so both can run beside the app branches without a port clash.

**Research pages** — the nine that describe the design rather than use the
library — are in [`../docs/reference/pages/`](../docs/reference/pages/).
