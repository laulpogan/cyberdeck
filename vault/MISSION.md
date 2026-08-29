# Standing mission — collect cool interfaces, widely

This file is the durable goal. It is written for an agent that inherits nothing: no
conversation, no memory beyond the files in this directory. Read it, then go collect.

## The job right now

Find and keep interfaces worth looking at. Cyberpunk, retrofuturist, diegetic, industrial,
obsolete, imaginary — anything where somebody designed a surface for reading machine state
and made it good. Breadth first. A wide, messy collection beats a narrow rigorous one,
because you cannot study what you never found.

Measurement is a later phase and is not gating anything today. Do not run coverage checks,
do not grade sources, do not refuse a thing for lacking a duration. Grab it, say where it
came from, move on.

## What counts as worth keeping

One test: would somebody building a sci-fi interface want to look at this again?

Keep it if the surface is doing something — reading out state, sorting, scanning, refusing,
deciding, waiting. Keep whole panels and whole screens over cropped details. Keep the
strange ones; an ugly Soviet control room is more useful than another blue hologram. Keep
things that are obviously derivative too, because the derivation is the interesting part.

Skip logos, posters, key art, generic sci-fi environments, and anything that is a lighting
effect rather than a readout.

## Where to look

Work down whichever vein is cold. The point is coverage of *kinds*, not of any one title.

**Screen graphics for film and TV.** Studio process reels are the best form of it —
Territory, Perception, Cantina, Prologue, Ash Thorp, GMUNK, Rodeo FX and the individual
designers all publish the graphics playing out uncut, which is the same asset the film has
without the edit on top. Title sequences too; Art of the Title hosts many in full.

**Anime.** Evangelion, Ghost in the Shell, Patlabor, Serial Experiments Lain, Psycho-Pass,
Akira, Bubblegum Crisis, Cowboy Bebop, Texhnolyze. Denser with interface per minute than
almost any live-action work, and much of it never got catalogued in English.

**Games.** Alien: Isolation, Deus Ex, System Shock, Prey, Signalis, Observation, Citizen
Sleeper, Hardspace: Shipbreaker, NORCO, Papers Please, Uplink, Hacknet, Elite Dangerous,
EVE Online, Fallout's Pip-Boy. The Game UI Database indexes far more.

**Existing catalogs.** Kit FUI is a clonable public repo indexing films, shows, games,
studios and designers with links out to reels. scifiinterfaces.com has a large per-film
archive. Pushing Pixels has hundreds of interviews with the people who actually built these
screens. HUDS+GUIS is excellent and blocks automated agents in robots.txt — a person may
read it, we do not crawl it.

**Real hardware and real rooms.** This is the underfished vein and it is where the fiction
got its ideas. Mission control, submarine and aircraft panels, radar consoles, air traffic
control, nuclear and industrial SCADA, broadcast gear, oscilloscopes, telephone exchanges.
Much of it is public domain archival footage and it holds on screen far longer than any
dramatic shot.

**Obsolete computing.** Teletext and Ceefax, Minitel, PLATO, Xerox Alto and Star, Symbolics
Lisp machines, early CAD, terminal software, BBS and ANSI art, demoscene and cracktros,
Flash-era and Y2K web. Archive.org and textfiles.com hold enormous amounts of this.

**Concept and fan work.** ArtStation and Behance FUI galleries, r/FUI, Dribbble. Lower
signal, but it shows what the current vocabulary actually is.

**Print and physical.** Manuals, magazine advertising, VHS and album art, technical
diagrams, dashboard design. Interfaces that never moved are still interfaces.

## How to keep it

Fetch with what already exists. `youtube.mjs` pulls a video and builds a contact sheet
across it. `clip.mjs` cuts a window out of a local file. `acquire.mjs` harvests media out
of a page in a real browser. Do not build new tooling unless the vein genuinely needs it.

Media lands under gitignored `raw/`. It is a private reference copy for design study;
nothing gets redistributed and no third-party asset is committed. What gets committed is
the note about it.

Add a row to `CATALOG.md` for anything kept. Source, what it is, why it is interesting. One
line is fine. A catalog nobody can search is a folder.

## Constraints, short list

- Respect robots.txt and any stated refusal of automated access. Route around nothing.
- Do not invent detail about a source you did not open. Say you did not open it.
- Two failures at the same fetch means stop and check the tool version before trying again.
  A stale extractor looks exactly like a hard refusal.
- Commit the notes, never the media.

## Per-session shape

Pick a cold vein. Go wide in it. Add rows to `CATALOG.md`, drop files in `raw/`, commit the
notes. Stop when the vein is worked or the session is long enough.

Volume is the metric right now. Fifty new entries in a pass is a good pass.
