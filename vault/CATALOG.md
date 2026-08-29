# Catalog

Everything kept, one row each. Wide and shallow on purpose — this is a collection, not an
argument. Rows get added freely; nothing here has to justify itself beyond being worth a
second look.

Media lives under gitignored `raw/`. This file is the part that travels.

Columns: **vein** is the kind of source, so cold veins are easy to spot. **why** is the
only field that takes thought — write what a person building an interface would come here
to steal.

| vein | what | source | file | why |
| --- | --- | --- | --- | --- |
| obsolete computing | Online Teletext Viewer — renders live teletext pages in a browser, incl. Ceefax, Teefax, ChunkyText | https://zxnet.co.uk/teletext/viewer | — | the format itself: 40x24 cells, seven colours, block mosaics, double-height headers. A whole visual language built inside a hard grid |
| obsolete computing | zxnet teletext emulator index — the map of everything that can still render teletext | https://zxnet.co.uk/teletext/emulators/ | — | entry point to the rest of the vein; names the adapters, servers and viewers by hardware |
| obsolete computing | BeebEm — emulates the Acorn ANE01 teletext adapter for the BBC Micro | http://www.mkw.me.uk/beebem/ | — | teletext as it arrived on a period machine, not a modern reconstruction of it |
| obsolete computing | Fuse — emulates the TTX2000 S adapter for the ZX Spectrum | http://fuse-emulator.sourceforge.net/ | — | same service, different host machine; shows how much the terminal shaped the look |
| obsolete computing | VBIT2 — teletext packet server, hosts whole services on a local port | https://github.com/peterkvt80/vbit2 | — | lets a complete service be walked page by page rather than sampled |
| obsolete computing | ZXGuesser teletext packet server — serves historical t42 recordings, including a 1985 Ceefax broadcast | https://github.com/ZXGuesser/teletext-packet-server | — | a real broadcast day, replayable. Page transitions and rotating subpages are the interesting motion |
| obsolete computing | 16colo.rs — ANSI/ASCII artpack archive, packs by year 1990-2026, browsable by group and artist | https://16colo.rs/ | — | BBS-era textmode art. Renders to PNG and keeps the raw .ans, plus SAUCE headers carrying artist and technical credits |
| obsolete computing | Demozoo — demoscene database: ~189k productions, 63.6k graphics, 29k groups, 15.2k BBSes, 7,500+ DOS BBStros | https://demozoo.org/ | — | cracktros and BBStros are interface design under extreme constraint. Screenshots throughout; codebase public on GitHub |
| obsolete computing | Computer History Museum — Xerox Alto software: BRAVO, Smalltalk, Cedar, Neptune | https://www.computerhistory.org/revolution/input-output/14/347 | — | the origin point. BRAVO is the first WYSIWYG editor; Smalltalk overlapping windows vs Cedar tiled is the whole argument in two artifacts; Neptune used colour-coded mouse buttons |
| obsolete computing | Symbolics Open Genera 2.0 — Kalman Reti's 2013 demo, 822s screen recording | https://www.youtube.com/watch?v=o4-YnLpLgtk | `raw/.src/o4-YnLpLgtk.mp4` | opened the 39-frame scan sheet. Full-screen Dynamic Windows throughout: dense tiled text panes, banner headers, a persistent status line, a live inspector, and mouse-sensitive output. Uncut and sustained for the whole runtime |
| obsolete computing | Genera / Portable Genera 2.0.6, released 2024 — the OS still ships | https://en.wikipedia.org/wiki/Genera_(operating_system) | — | a running system beats footage; every part of it is inspectable by design |
| obsolete computing | Minitel Research Lab — terminals, peripherals, phone cards, ephemera, held at Indiana University | https://minitel.us/ | — | partial. Strong on hardware and ephemera, but no emulation and no service screenshots, so the screens themselves are still missing. Videotex remains an unworked seam |


## Veins worked

Record each pass, including the empty ones. A vein that turned out to hold nothing is worth
knowing exactly once.

| vein | pass date | rows added | notes |
| --- | --- | --- | --- |
| obsolete computing | 2026-08-29 | 12 | Teletext, BBS/ANSI, demoscene, Alto and Lisp machines all live. Two sources would not open: teletext.org.uk serves a self-signed certificate, platohistory.org refused the connection — PLATO is unworked, not empty. Videotex/Minitel screens still missing. Vein is opened, not exhausted: 16colo.rs and Demozoo are each large enough to be their own pass. |
