# Standing mission — a comparison catalog of interfaces

This file is the durable goal. It is written for an agent that inherits nothing: no
conversation, no memory beyond the files in this directory. Read it, then read
`CATALOG.md` to see what has been taken, then work.

## What changed, and why

The first phase collected entry points. Eight veins, roughly a hundred and seventy sources,
and it worked: the map exists. The weakness is that it is organised by where things came
from — anime, games, control rooms — which is how they were found, not how they get used.

Nobody designing a status readout wants "the anime shelf". They want every scanning
interface anyone has ever drawn, side by side, across sixty years and five media, so the
common bones are visible and the choices stand out against them. That is a comparison
catalog, and it is what this phase builds.

So the axis turns. **Organise by what the surface does, not by what it came from.**

## The comparison spine

Every entry gets at least one function. These are the functions, and they came out of what
the collection actually found rather than from a theory:

`terminal` · `scope` · `scan` · `analysis` · `warning` · `map` · `tracking` ·
`manifest` · `access` · `diagnostic` · `queue` · `comms` · `boot` · `progress` ·
`targeting` · `vitals` · `timeline` · `network` · `consensus` · `identity` · `sensor`

A function is **covered** when it holds instances from at least three different media —
film or television, anime, games, real hardware, obsolete computing, print. Three because
two is a coincidence and three is a convention. Anything with fewer is the work list.

The point of three media is falsification. If every scanning interface in fiction sweeps a
line down a subject, and no real instrument ever did, that is worth knowing before you build
one. A catalog drawn only from film cannot tell you which parts are the job and which parts
are the genre.

## What a depth pass does

The survey opened sources. A depth pass empties one.

Pick a source from the queue. Go through it properly rather than sampling it. For each thing
worth keeping, write a row naming the **function**, the work, and what a person building an
interface would come here to steal. Where a source hands you many instances of one function,
that is the best possible outcome — it fills a comparison set in one pass.

Volume still matters, but comparability matters more. Fifty rows all tagged `terminal` from
one game is worth less than fifteen rows spread across `access`, `warning` and `consensus`
in three different media.

## The depth queue

Ordered by what they will fill, not by how interesting they are.

- **Mark Coleran's archive.** Twenty-two works, self-indexed *by function already* — security
  gates, station boards, fingerprint database, code-breaking. The closest thing to a
  pre-sorted comparison set that exists, and no crawling needed.
- **Art of the Title.** All 1,449 entries in one request, tagged by depth. Filter to the ones
  carrying interviews and work those.
- **The reel cache.** `KIT-FUI.json` holds the identifiers; `reels.mjs` fetches; `windows.py`
  ranks the moving stretches without an eye. Look at the ranked windows, name what each
  shows, tag the function.
- **Interface In Game.** 398 titles with screen-type facets already published, and around
  17,000 screenshot URLs in its attachment sitemaps. Its facets map almost directly onto the
  spine above.
- **Starring the Computer.** 679 real machines against 1,794 appearances, pre-rated. The only
  index that connects a fictional screen to the actual hardware standing in for it.
- **16colo.rs and Demozoo.** Textmode and demoscene, each large enough to be several passes.
  Both fill `boot`, `progress` and `identity` in a register nothing else covers.
- **Wikimedia Commons, control rooms by function.** Already a function tree. Descend it and
  map its branches onto the spine.
- **The Japanese monitor-graphics credits.** Search 画面デザイン, 劇中GUI, モニターグラフィックス
  and work by designer rather than by show.
- **bitsavers and the Apollo handbooks.** Where a panel's *intended* semantics are written
  down rather than inferred from a photograph.

## Where footage comes from now

Several of the best indexes refuse automated fetching at the edge and cannot be worked here:
Game UI Database, MobyGames, Nexus Mods, fancaps. Do not try to defeat a bot challenge.

For games in particular there is a better route anyway. Long-play footage, developer
walkthroughs and interface showcases are on YouTube and Vimeo in quantity, they are fetchable
with `youtube.mjs`, and unlike a screenshot database they show the interface *moving*. Prefer
that over hunting stills. The same trick works for hardware: control-room and instrument
footage is on both platforms and in the Internet Archive.

## Constraints

- **Only catalog what you actually opened.** A row written from a search result is the exact
  drift this vault exists to prevent. If a source fails, record it as not opened.
- **Do not invent counts, dates or names.** Write `[unverified]` instead.
- The operator has authorized fetching sources whose robots.txt asks agents away, for private
  non-commercial reference. Note it in the commit when you do. **Bot challenges are different
  and stay off** — a Cloudflare interstitial is a control to respect, not a lock to pick.
- Sessions belong to the operator. Never acquire a credential; take one when it is handed
  over, as `COOKIES=` or `COOKIES_FROM=`.
- **Media stays local.** Downloads are private reference copies under gitignored `raw/`.
  Nothing derived is redistributed and no third-party asset is committed. Notes travel.
- Two failures at the same thing means stop and check the tool version before trying again.
  A stale extractor looks exactly like a hard refusal, and that has already cost a session.

## Per-session shape

Pick one source from the depth queue. Empty it, or work it until the session is long enough.
Tag every row with its function. Commit the notes with a message saying which source you
worked, which functions it filled, and what it did not have.

Then run the coverage line at the bottom of `CATALOG.md` and update it: which functions now
hold three media, and which are still short.

## What done looks like

Every function on the spine holds instances from at least three different media, and the
catalog can be read down a function rather than across a source. At that point the question
"how has anyone ever built this kind of readout" has an answer that is not one person's
memory of a film they liked.
