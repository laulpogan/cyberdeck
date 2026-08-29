# Cyberdeck UI Library — Master Source Archive

A handoff archive for the cyberdeck build agent. Every property below carries: (1) the **transfer note** — the precise UI behavior to replicate, written as a design rule; (2) **Check against** — a real, verified video clip (and image/GIF where found) showing the source material in motion; (3) a one-line motion/visual spec. Properties are grouped exactly as they sit on the Hive contact sheet. Treat the video links as the source-of-truth renderings — watch them before implementing, and compare your component against the frame.

Verification: all video URLs were found via live search on 2026-08-29 and resolve on YouTube / the cited host. Tool and asset licenses were verified against each repo's LICENSE file or GitHub API. Anything unconfirmed is marked **n.a.**

> **Preserved 2026-08-29 from the handoff archive.** Two things changed and
> nothing else. Fifteen embedded stills were dropped: they were CloudFront URLs
> signed to expire on 2026-09-05, so committing them would have shipped links
> that rot within a week, and the frames are third-party film and game imagery
> this repository does not hold a licence to redistribute. Every one of them is
> still reachable — the gallery below keeps each caption and its permanent
> source link. This preamble is the second change.
>
> Overlap with the rest of `docs/reference/` is deliberate; this file is a
> self-contained handoff and is meant to be readable alone. Part 0 is the same
> doctrine as [`doctrine.md`](doctrine.md), Part 6 the same canon as
> [`cybernetics-canon.md`](cybernetics-canon.md), and Parts 2–8 cover the same
> sources as [`idea-bank.md`](idea-bank.md) — but only this file carries the
> per-property video links, the evidence tags, and the motion specs. Parts 9 and
> 10, the licence-verified tool index and the acceptance checklist, exist nowhere
> else.

## Contact-sheet inventory

The library is built from this inventory (preserve these counts as acceptance gates):

| Metric | Count |
|---|---|
| Specimens | 50 |
| Total components | 77 |
| Built in Cyberdeck | 3 (gauge · river · globe) |
| Portable from Python | 50 |
| Canvas-only rebuilds | 15 |

Frame groups: Specimen Drawer (50 specimens · 9 frames) · HIVE // DECK (4 surfaces · 4 frames) · One Instrument, Five Projections (5 projections · 4 frames) · Idea Bank (6 diagrams + matrix · 15 frames) · Substitution Matrix (3 charts · 4 frames).

## Must-watch first

If the build agent watches nothing else, watch these 13 clips — they cover the load-bearing motion patterns:

1. [Alien: Isolation — UI design](https://www.youtube.com/watch?v=dL3AUBcGLcU) (motion-tracker cadence, cassette-future materiality)
2. [Blade Runner 2049 — Territory Studio UI reel](https://www.youtube.com/watch?v=H07HumKRQKE) (single-hue data sculpture)
3. [TRON: Legacy — boardroom break-in](https://www.youtube.com/watch?v=y-86iKkn6k0) (GMUNK cold-boot choreography)
4. [Oblivion — GFX UI/HUD montage (GMUNK)](https://www.youtube.com/watch?v=j3r4GE1KDtk) (calm planetary-scope console)
5. [Minority Report — UI innovation analysis](https://www.youtube.com/watch?v=VBceT1TkxU4) (gestural scrub + minority report)
6. [Ghost in the Shell (1995) — thermoptic + dive](https://www.youtube.com/watch?v=ARTLckN9e7I) (thermoptic dissolve, dive grammar)
7. [Evangelion — MAGI supercomputer](https://www.youtube.com/watch?v=oLJoIZ3jQhE) (trinity vote)
8. [Psycho-Pass — the Dominator](https://www.youtube.com/watch?v=jQv3s9-aTks) (authority-transforming affordance)
9. [NieR:Automata — OS chip removal](https://www.youtube.com/watch?v=7rzQeMrSPMs) (diegetic OS chrome that degrades)
10. [EVE Online — overview (2026)](https://www.youtube.com/watch?v=01XK4ynOoaA) (dense per-role overview doctrine)
11. [Project Cybersyn — opsroom](https://en.wikipedia.org/wiki/Cybersyn) (room-scale decision environment)
12. [Revision 2024 — PC 64K intro](https://www.youtube.com/watch?v=DNXCW7kEaJw) (size-limited choreography)
13. [Alien (1979) — MU/TH/UR 6000](https://www.youtube.com/watch?v=Ib3XYAl-QYU) (query liturgy, slow phosphor)

## Evidence-quality legend

Every "Check against" link is tagged so the agent knows how directly it shows the source UI:

- **A** — direct source clip / in-game footage of the actual interface
- **B** — official studio breakdown / making-of / designer reel
- **C** — review / analysis / explainer clip
- **D** — indirect; needs a stronger clip (find an A/B before relying on it)
- **n.a.** — not found; do not treat as confirmed

Where a property lists multiple links, tags are in the same order. Embedded stills/GIFs are reference-only — do not copy them into shipped assets.

## Visual reference gallery

Stills and GIFs showing the source UIs in motion. Each links out to its full video clip in the property section below.

> *Reference still — “Matrix digital rain” — not committed. Open it from the source link below.*

The Matrix — digital rain. Code-as-weather, reserved to one drawer. Source: [Gif Abyss](https://gifs.alphacoders.com/gifs/view/214311). Full clip: [Matrix raining-code screensaver](https://www.youtube.com/watch?v=l4ghF3PzY2M).

> *Reference still — “Green-phosphor CRT HUD” — not committed. Open it from the source link below.*

Green-phosphor monochrome CRT HUD — barrel distortion, scanlines, pixelation. The reference render for phosphor decay and CRT effects. Source: [INT10h — simulating CRT monitors](https://int10h.org/blog/2021/02/simulating-crt-monitors-ffmpeg-pt-2-monochrome/).

> *Reference still — “Cassette-futurism control station” — not committed. Open it from the source link below.*

Cassette futurism — beige molded plastic, monochrome cathode displays, mechanical keypads, rocker switches. The Hive material palette. Source: [Roman Klčo on Dribbble](https://dribbble.com/shots/26155232-Cassette-Futurism).

> *Reference still — “Blade Runner 2049 DNA archive” — not committed. Open it from the source link below.*

Blade Runner 2049 (Territory Studio) — single-hue volumetric data as sculpture, microfiche dossiers, cybernetic bezel borders. Source: [vfxblog — screen graphics of BR2049](https://vfxblog.com/2017/11/08/a-visual-journey-through-the-screen-graphics-of-blade-runner-2049/). Full reel: [Territory Studio UI Reel](https://www.youtube.com/watch?v=H07HumKRQKE).

> *Reference still — “Ghost in the Shell hologlobe” — not committed. Open it from the source link below.*

Ghost in the Shell (1995) — volumetric point-cloud holography inside a wireframe dome. The reference for thermoptic dissolve and dive-sequence grammar. Source: [HUDS+GUIS — GitS FUI](https://www.hudsandguis.com/home/2017/4/17/ghostintheshell-fui).

> *Reference still — “Cyberpunk 2077 breach protocol” — not committed. Open it from the source link below.*

Cyberpunk 2077 — breach protocol hex matrix and sequence solver. The reference for the netrunning depth-dive and quickhack ladder. Source: [Steam — netrunning/hacking guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2318375253). Full clip: [Breach Protocol guide](https://www.youtube.com/watch?v=1ffmb7tYNxo).

> *Reference still — “Alien: Isolation Sevastolink terminal” — not committed. Open it from the source link below.*

Alien: Isolation — monochrome green CRT Sevastolink terminal (menu, scanlines, curvature). The reference for working-class cassette-future switchgear and motion-tracker dread. Source: [Lucas Pettersson — Unity recreation](https://www.lucaspettersson.net/alienterminal.html). Full clip: [UI design of Alien: Isolation](https://www.youtube.com/watch?v=dL3AUBcGLcU).

> *Reference still — “Oblivion GMUNK UI” — not committed. Open it from the source link below.*

Oblivion (2013, GMUNK) — calm telemetry dashboard: angular vector graphs, radar sweeps, gauges in cyan/white/orange on black. The reference for planetary-scope domestic-calm consoles. Source: [GMUNK — Oblivion GFX](https://gmunk.com/Oblivion-GFX). Full clip: [Oblivion GFX UI/HUD montage](https://www.youtube.com/watch?v=j3r4GE1KDtk).

---

## Part 0 — Hive doctrine (the load-bearing rules)

These override every property-specific note below. If a property transfer and a doctrine rule conflict, the doctrine wins.

### Standing honesty rules
- Every mark is canonical; absences are printed — magenta owns **UNMEASURED** everywhere.
- No invented topology, progress, causality, or cost; the tape breaks rather than interpolates.
- A control without authority renders as **inert glass** (the Dominator rule); fake buttons are referent drift.
- Composite scores decompose on demand (the Sibyl rule).
- Recorded vs live is a material difference: grain belongs to history only.

### Sound + motion doctrine
Think radios and instruments, not notification chimes; silence is the nominal state.
- **Telegraph proximity:** Alien motion-tracker cadence — ping interval = decision urgency, one instrument only.
- **Ambient hum:** Lain room-tone under live fleets; full silence = everything landed; quiet as reward.
- **Landing:** single tape-stop clunk; acceptance: bolt-turn; refusal: dry relay click — mechanical, sub-200ms.
- **Critical class:** EVA klaxon liturgy, the only sustained alarm, unmutable by design.
- **Overnight preset:** NeoTokyo NSF register — sparse patrol ambience the alarms are tuned against.
- **Sidechain rule:** all ambience ducks when a Telegraph item lands.
- **Motion (motion.dev):** motion = state change, nothing else; idle animation only in the two ceremonies (boot, landing).
- 150–250ms springs on instruments; flywheel inertia on River scrub; hard cuts for interrupts (Katana ZERO honors interruption).
- Choreography is spent once per session: GMUNK boot, then stillness; reveals never gate content.
- Glitch grammar is semantic: reserved for canonical-state corruption and Dashboard-Agent speculation stamps.
- Phosphor decay for anything historical; live data never trails.

### Quest 2 — the spatial cut
Standalone WebXR target, 72–90Hz, ~20 PPD; text is the scarce resource; design for glance-at-distance, grab-for-detail.
- The Field curves as a 210° comb wall at 2.5m (Cybersyn opsroom geometry, cells ≥ 2° visual angle).
- The River runs as a physical tape table at waist height (Minority Report scrub: grab, stretch, pinch a seal for its receipt).
- The Organism explodes in hand-space (JARVIS teardown: grab a fleet, open it like an assembly).
- Telegraph on the wrist (BGC hardsuit periphery: glance-triggered, decisions read aloud, commit is a physical twist).
- Panes hand off by flick (Expanse grammar: wrist → desk → room-wall anchors).
- **Hard constraints:** text floor ~1.5° cap height; JetBrains Mono holds up, serif display does not — titles become signage. Phosphor-on-black is ideal OLED-era palette but Quest 2 is LCD: lift blacks to `#0A0A08`, rely on bloom sparingly. 72Hz budget: canvas instruments cap at 3; comb renders as instanced mesh, not DOM. No locomotion — everything comes to the operator; scope-descent is a GitS dive of the scene, seated. Session length ~25min: design the shift ritual (VA-11 pre-shift in, landing afterglow out).
- **Honesty in VR:** depth is a claim — only measured relationships get z-separation; unmeasured stays flat, printed UNMEASURED. Presence is a claim — agent avatars only where identity is Wire-verified, else featureless glass. The room lies easily (Rainbow's End belief circles): stamp every skin with its role-lens name.

### Operator roles
Owner-operator · Engineering lead · Platform operator · Reviewer / approver · Mission owner · Security / compliance · Autonomous manager · Builder worker · Reviewer agent · Verifier / merge gate · Scheduler / dispatcher · Recovery supervisor · Dashboard Agent · Provider adapter · Wire identity.

---

## Part 1 — Specimen families (the deck)

### HIVE // DECK — the operator deck (4 surfaces)
- **MAGI consensus dials** — three-lens voting dials (Evangelion MAGI trinity).
- **ENCOM globe** — hex-earth choreographed cold-boot (TRON: Legacy boardroom).
- **Phosphor river** — the tape-table River; phosphor decay for historical entries.
- **Pinned telegraph tape** — the Telegraph as one physical strip, one sound.

### One Instrument, Five Projections (5 projections)
The same fleet seen five ways — the comb, the thread, the river, the organism — each projection stating what it cannot show.

### The Idea Bank — cybernetics canon redrawn
The textbook diagrams drawn fresh, each mapping to a live Hive mechanism. These are load-bearing pictures, not decoration (see Part 6).

### The Substitution Matrix (3 charts)
Ability against substitution; the six that matter; the mobile doctrine.

---

## Part 2 — Games

### Cyberpunk 2077
- **Kiroshi scan overlay** — Hover-scan any cell/session: identity, authority, blocked reason, available commands in one layered pass. Look at anything → layered readout: name, affiliation, threat, exploitable ports.
- **Quickhack ladder** — Command list per subject priced in authority + expected wait; disabled rungs show the missing grant.
- **Relic malfunction glitch** — Reserve the glitch treatment for exactly one thing: canonical-state corruption; never decorative.
- **Netrunning depth dive** — Dashboard Agent scope-descent: fleet → task → attempt shown as breach depth with rising authority cost.
> *Reference still — “Cyberpunk 2077 breach protocol” — not committed. Open it from the source link below.*

- **Check against:** [Cyberpunk 2077 — Kiroshi scan in "The Hunt"](https://www.youtube.com/watch?v=QAwyFP9GIn8); [Breach Protocol / hacking minigame guide](https://www.youtube.com/watch?v=1ffmb7tYNxo).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** layered HUD readouts snap in over the scene; breach protocol is a timed hex-grid ladder with a moving trace.

### Deus Ex: Human Revolution
- **Black-gold triadic palette** — one metallic accent over near-black; renaissance-tech gravitas. A single gold-tier accent reserved for delivered/landing states — scarcity gives it meaning.
- **Augment tree** — agent profile as capability body-map: granted tools lit, ungranted greyed with the grant that unlocks them.
- **Hacking node graph** — verifier progress vs expiry as a race visual: proof nodes captured before the lease trace completes.
- **Social battle readout** — Dashboard Agent shows its evidence-confidence gauge as it answers; abstention is a visible state.
- **Check against:** [Restored Gold UI mod showcase](https://www.youtube.com/watch?v=b42mzApkaCw); [hacking guide](https://www.youtube.com/watch?v=WP_l7kNrDtA); [augmentation tutorial](https://www.youtube.com/watch?v=fBLgGLjSh3k).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** gold-on-black; hacking is a node-capture race against an expiry trace; confidence gauge visibly settles.

### System Shock 1/2 / Remake
- **MFD split deck** — twin CRT: left/right MFDs with swappable instrument cards. Two independent multi-function displays under one viewport.
- **SHODAN presence** — source-degradation banner with personality stripped: fragmented type only when truth is fragmenting.
- **Audio-log breadcrumb** — attempt history as found receipts pinned to worktree locations (the River's stitch marks).
- **Cyberspace wireframe pocket** — netmap lens: pure-vector alternate rendering of the same canonical scene, one keypress away.
- **Check against:** [SHODAN — PROfiles](https://www.youtube.com/watch?v=aS-gadZjddg); [System Shock Remake (2023) collectibles run](https://www.youtube.com/watch?v=NtUrd-w4KqU); [research-labs cyberspace walkthrough](https://www.youtube.com/watch?v=3z-d75sq2-o).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** swappable MFD cards; SHODAN's text fragments when canonical state fragments; cyberspace is a pure-wireframe alt render.

### Observer
- **Tri-vision modes** — field-lens toggles: health / cost / authority vision over the same stable comb, hotkeyed. EM / bio / normal vision toggles over one scene.
- **Retro-Polish devices** — physical toggle affordances for stop/drain — controls that look like commitments, not links. CRT bulk, mechanical toggles, cassette-future switchgear.
- **Dream-eater interrogation** — evidence staleness as literal visual decay: receipts age into grain and chroma loss, never silently.
- **Check against:** [Observer: System Redux — next-gen first look (4K)](https://www.youtube.com/watch?v=Zuzh49lsl2s); [full gameplay walkthrough](https://www.youtube.com/watch?v=G66cWsyX9PI).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** vision-mode toggles over one stable scene; stale evidence visibly decays to grain/chroma loss.

### RUINER
- **KILL-YOU red brutalism** — single saturated red carried as identity, not alarm. If Hive ever runs an incident theme, commit: red as the room, amber as the detail — never both diluted.
- **Boss intro cards** — attempt-start stamps in the River replay: "A3 · MENDER · cut, hold, gone."
- **Glitch dash trails** — queue movement shown as afterimage trails on the placement panel; motion = state change only.
- **Check against:** [RUINER — Best Cyberpunk Game (Renegade Cut)](https://www.youtube.com/watch?v=dbDdT92BuMo); [impressions gameplay](https://www.youtube.com/watch?v=qe2rZSVTN14).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** one saturated red as identity; dash afterimages show state change only; boss cards are stamped and cut.

### Transistor
- **Turn() planning bar** — batch-approval planning: queue bounded commands against an authority budget, review the plan, commit once.
- **Function combinatorics** — tool grants displayed as slotted combinations: base verb, scope modifier, standing passive.
- **Singing sword narrator** — Dashboard Agent tone: quiet first-person status from the instrument, never chirpy.
- **Check against:** [Transistor — Planning() guide (all stability tests)](https://www.youtube.com/watch?v=5OhC1wX09l0); [stability tests](https://www.youtube.com/watch?v=B7ynTwpbmR4).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** turn() is a bounded-plan-then-commit bar; function slots compose verb+scope+passive.

### Katana ZERO
- **Tape-scrub precognition** — attempt replay scrubber with VHS grammar: failures rewind visibly, the accepted take plays clean.
- **Dialogue interruption** — interrupt in the Thread is a hard cut with visible scar — not a polite queued request.
- **Check against:** [New Gameplay Today — Katana Zero](https://www.youtube.com/watch?v=_TJOVDiHqgs); [full walkthrough](https://www.youtube.com/watch?v=fhlGXQxXa_Y).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** VHS-grammar rewind on failure; clean play on accept; interrupts are hard cuts with a scar.

### The Last Night
- **2.5D parallax pixel city** — field backdrop: parallax depth behind the comb, cells crisp, atmosphere deep. Pixel figures over volumetric light and depth.
- **Diegetic signage** — zero floating-tooltips ambition: every label lives on a surface in the scene. All exposition carried by in-world screens.
- **Check against:** [The Last Night — the journey to one of the most beautiful games](https://www.youtube.com/watch?v=UJfeziEzSg4); [2.5D action platformer trailer](https://www.youtube.com/watch?v=Q9zBIx8pCf0).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** deep parallax pixel layers; all labels are diegetic in-world screens, never floating chrome.

### VA-11 Hall-A
- **Jukebox pre-shift** — session-start ritual: pick ambience, see fleet status settle in — a deliberate opening beat. Operator sets the session soundtrack before work.
- **Drink-mix console** — Dashboard Agent tray as bartop: conversation flows, the instrument stays fixed and tactile.
- **Check against:** [VA-11 Hall-A — 5-minute review](https://www.youtube.com/watch?v=ltG79r9k8e8); [bartender action gameplay](https://www.youtube.com/watch?v=6XTZ_UJ-dQ4).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** a deliberate pre-shift ambience-pick ritual; the console is a fixed tactile bartop while conversation flows.

### The Red Strings Club
- **Empathy lathe** — profile-fitting visual: worker profile turned against task contract until the fit is flush.
- **Bartender dialogue mixing** — evidence-request composer: what you ask for shapes what the record can show — make the framing visible.
- **Check against:** [The Red Strings Club — cyberpunk game review](https://www.youtube.com/watch?v=oN_ROLYM0HQ); [Let's Play Part 4](https://www.youtube.com/watch?v=C8KRnXVWrg8).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** dialogue is a mixing/composition act where the framing determines the visible record.

### Cloudpunk
- **Voxel delivery city** — placement map as city blocks: hosts as buildings, deliveries as routes, starvation as dark districts.
- **HOVA dispatch voice** — telegraph audio mode: decisions read out over a minimal visual tape for away-from-desk operation.
- **Check against:** [Cloudpunk — incredible future city gameplay](https://www.youtube.com/watch?v=HFKdEzGl7YE); [full game walkthrough](https://www.youtube.com/watch?v=ER0EBUB9J0E).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** voxel city; dispatch is a voice-over minimal tape for away-from-desk operation.

### Ghostrunner
- **One-hit clarity** — speed-mode field: chrome collapses to nothing while all is nominal; only breaks surface. Absolute legibility at speed; UI nearly absent until death.
- **Cybervoid puzzle space** — capability-grant ceremonies in an abstract void scene — rare, memorable, bounded.
- **Check against:** [Ghostrunner — tips, tricks, and game mechanics](https://www.youtube.com/watch?v=hCLTlEfwUPY); [ultra-low settings](https://www.youtube.com/watch?v=J5SoWvXk3-U).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** near-zero chrome at speed; UI surfaces only on break/death; grants happen in a bounded void.

### Control
- **Brutalist Oldest House** — org/organism as brutalist floorplan: departments as halls, delegation as corridors that exist only when real.
- **Hotline ritual objects** — break-glass controls styled as ritual objects: the red phone is pickup-to-commit, with ceremony.
- **Threshold warnings** — authority-boundary banners in flat institutional voice: "EXTERNAL ACTION BOUNDARY. TYPED EFFECT REQUIRED."
- **Check against:** [Control — dev diary: The Oldest House](https://www.youtube.com/watch?v=Y-u-dloIvWI); [what is The Oldest House](https://www.youtube.com/watch?v=dzYaOsznSg8).
- **Evidence tags:** B (per legend; classify each link by its title).
- **Motion spec:** brutalist floorplan; break-glass ritual objects; flat institutional threshold banners.

### SOMA
- **Structure-gel corruption** — degraded-adapter rendering: creeping desaturation at panel edges, spreading with age of last truth.
- **Existential terminal logs** — fork/salvage dialogs must name what survives and what is abandoned — SOMA honesty about copies.
- **Check against:** [SOMA — cortex chip and structure gel](https://www.youtube.com/watch?v=rhWDozNn7pw); [Omicron part 11](https://www.youtube.com/watch?v=FLPuqPmeL0U).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** creeping edge desaturation that spreads with staleness; terminal dialogs explicitly name what is abandoned.

### F.E.A.R.
- **Slow-mo readability** — incident slow-mo: a replay speed where cascading events become individually readable. Bullet-time exists so the player can read chaos.
- **Radio chatter ambience** — ambient agent chatter feed: Wire messages as low-volume radio, foregrounded only on mention.
- **Check against:** [F.E.A.R. — 4K/60FPS full-game walkthrough](https://www.youtube.com/watch?v=YShyMjt4iAo); [slow-mo deathmatch](https://www.youtube.com/watch?v=WBdBgOYikFg).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** slow-mo exists to make cascades readable; ambient chatter is low-volume radio, foregrounded on mention.

### Remember Me
- **Memory remix editor** — counterfactual viewer for attempts: flip an input receipt, see which downstream proofs would invalidate — analysis only, clearly non-canonical.
- **Sensen glow lines** — session liveness as faint circuit traces on the cell; brightness = recency of meaningful output.
- **Check against:** [IGN Plays Remember Me — Memory Remix](https://www.youtube.com/watch?v=kBdsgHGgLhE); [Forlan memory remix](https://www.youtube.com/watch?v=R6hUxu3z4Mo).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** a counterfactual editor showing downstream invalidation; clearly labeled non-canonical; liveness = trace brightness.

### Ace Combat 3: Electrosphere
- **Full-FUI cockpit canon** — the gold standard for total diegesis: every Hive chrome element should pass the "could this exist in-cockpit" test. The entire game speaks fictional-UI: nav meshes, datalink chatter, corporate nets.
- **Mission-select data terminal** — mission editor as briefing terminal: intent, criteria, expiry annotated live on the document.
- **Electrosphere net dive** — scope-descent transition: brief geodesic dive between fleet and task levels — 300ms, then still.
- **Check against:** [Ace Combat 3: Electrosphere is shockingly ambitious](https://www.youtube.com/watch?v=wwV-vwaVfqc); [first run Part 1](https://www.youtube.com/watch?v=qZxUZFsKtHw).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** total-diegesis cockpit; mission briefings are live-annotated terminal docs; scope descent is a 300ms geodesic dive then still.

### Perfect Dark
- **Weapon secondary modes** — every panel gets one power-user secondary mode on long-press: inspect beneath the reading. Every tool has a hidden second function.
- **N64 spy-tech minimal HUD** — legibility floor test: render each Field cell at 64px; if unreadable, redesign. Low-res clarity: what survives 240p survives anything.
- **Check against:** [Perfect Dark — PC port 4K 60FPS](https://www.youtube.com/watch?v=On-VjCJd4yQ); [N64 decompiled for PC](https://www.youtube.com/watch?v=p5aT7kszKOk).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** minimal HUD that must survive 240p; long-press reveals a secondary mode beneath every reading.

### Armored Core series
- **Garage assembly** — profile assembly: swap model/tools/scope as garage parts, each swap showing the outcome-history delta.
- **AC test hangar** — dry-run bay: rehearse a command against recorded state, output marked NON-CANONICAL in hazard stripes.
- **Check against:** [AC6 assembly footage discussion](https://www.reddit.com/r/armoredcore/comments/14bzk2r/people_missed_a_lot_in_the_armored_core_6/); [garage music](https://www.reddit.com/r/armoredcore/comments/15i2a9k/does_the_garage_music_change_in_ac6/).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** garage shows outcome-history delta per part swap; dry-run output is striped NON-CANONICAL.

### NieR:Automata
- **Diegetic OS chrome** — Hive chrome degrades with its own health: a stale adapter greys the panel chrome itself, not just data. Menus are the android's own OS; damage corrupts your menus.
- **Plug-in chip HUD budget** — operator chooses HUD load-out against a real budget — density as a spent resource, defaulting lean. HUD elements cost chips; showing more costs capability.
- **Hacking twin-stick void** — bounded sub-mode rendering for sandboxed actions — visually quarantined space = sandboxed authority.
- **Check against:** [NieR:Automata — OS chip removal](https://www.youtube.com/watch?v=7rzQeMrSPMs); [all 48 hacking games showcase](https://www.youtube.com/watch?v=xXOa4xqtnfE).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** menus are the OS and visibly degrade with damage; HUD density is a spendable chip budget; hacking is a quarantined twin-stick void.

### Alien: Isolation (curated)
- **Motion-tracker Telegraph** — decision proximity as ping cadence; the owner's phone cut is one instrument, one sound.
- **Working-class cassette future** — the Hive material palette already lives here: commit to switchgear, don't drift to glass. Sevastopol: CRT greens, tape drives, mechanical keyboards.
- **Motion tracker dread** — the Telegraph pulse is a motion tracker: distance-to-decision as audio ping cadence. One instrument, one number, total attention.
- **Access rewire panels** — capacity trades as rewire panels: drain here lights there, conservation made visible.
> *Reference still — “Alien: Isolation Sevastolink terminal” — not committed. Open it from the source link below.*

- **Check against:** [The incredible UI design of Alien: Isolation](https://www.youtube.com/watch?v=dL3AUBcGLcU); [3D-printed motion tracker build](https://www.reddit.com/r/LV426/comments/1vgftqn/my_3d_printed_motion_tracker_from_alien_isolation/).
- **Evidence tags:** A (UI design clip), D (3D-print build).
- **Production note (verified):** Alien: Isolation's lo-fi UI was achieved physically — menus and scan-line loading screens were dumped to VHS, replayed on SD CRT tube TVs, re-filmed, and glitched with cables and magnets before reimport ([Engadget interview](https://www.engadget.com/2014-10-07-alien-isolation-launch-interview.html)). This is the canonical reference for "organic hardware degradation."
- **Motion spec:** motion tracker = one instrument, ping cadence = distance to decision; CRT greens, tape drives, mechanical switchgear.

### Death Stranding
- **Chiral network coverage** — coverage map: where Salud observes, terrain is lit; unmeasured regions literally unrendered.
- **Cargo balance physics** — queue load as stacked cargo: overcommit visibly tips; balance is the admission story.
- **Strand contracts** — delivery history as strand-building: each landing thickens the route between repo and prod.
- **Check against:** [Death Stranding 2 — deliver the Chiral Network Gateway](https://www.youtube.com/watch?v=iHju93lc2uA); [retrieve the chiral printer](https://www.youtube.com/watch?v=fl_pqHr23Zc).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** coverage lights only measured terrain (unmeasured is unrendered); cargo overcommit visibly tips.

### EVE Online (curated)
- **Fleet broadcast bar** — owner broadcast strip: DRAIN/HOLD/RESUME intents as one-tap broadcasts with receipt fan-out. One-click intent broadcast to hundreds of pilots.
- **Overview grid doctrine** — the Organism WORK table borrows overview doctrine: dense, sortable, savable per-role presets.
- **Killmail receipts** — attempt post-mortems as killmails: exact fit, exact damage, exact cost — immutable and linkable.
- **Check against:** [Copy my UPDATED EVE overview (2026)](https://www.youtube.com/watch?v=01XK4ynOoaA); [broadcast settings](https://www.youtube.com/watch?v=cm8BPFh4ImI).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** one-tap broadcast intents with receipt fan-out; dense sortable per-role overview presets; immutable killmail receipts.

---

## Part 3 — Film / TV

### Blade Runner (1982)
- **Spinner cockpit type** — refresh cadence as aesthetic: sub-second data may render at 2Hz deliberately — calm over jitter. Chunky phosphor readouts, unhurried refresh.
- **ESPER photo dive** — evidence drawer ESPER mode: voice- or key-driven zoom through artifact layers, every enhancement logged.
- **Voight-Kampff instrument** — review verdicts get instrument gravity: the verdict needle settles slowly; no instant green checkmarks.
- **Check against:** [Esper photo analysis scene](https://www.youtube.com/watch?v=QkcU0gwZUdg); [Esper sequence](https://www.youtube.com/watch?v=dswKyUUhKMI); [Voight-Kampff test (4K opening)](https://www.youtube.com/watch?v=mKBdTy6dWDE).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** unhurried 2Hz phosphor refresh; ESPER is voice-driven layered zoom with logged enhancements; the Voight-Kampff needle settles slowly.

### Blade Runner 2049 (Territory Studio)
- **Monochrome data sculpture** — globe/graph lenses in one hue with depth: Territory's restraint, data as sculpture, zero ornament. LAPD interfaces: single-hue volumetric readouts, no chrome.
- **DNA archive microfiche** — history scrubbing with mechanical feel: flywheel inertia on the River scrubber.
- **Joi projection layering** — Dashboard Agent renders as overlay presence — translucent, never pretending to be canonical chrome.
> *Reference still — “Blade Runner 2049 DNA archive” — not committed. Open it from the source link below.*

- **Check against:** [Blade Runner 2049 — UI Reel by Territory Studio](https://www.youtube.com/watch?v=H07HumKRQKE); [screen graphics on Behance](https://www.behance.net/gallery/58693247/Blade-Runner-2049-Screen-Graphics).
- **Evidence tags:** B (per legend; classify each link by its title).
- **Motion spec:** single-hue volumetric data sculpture; flywheel-inertia scrubbing; Joi is a translucent overlay, never canonical chrome.

### The Matrix
- **Digital rain** — reserved for one place: raw-payload drawer background — the only spot Hive shows "code as weather."
- **Operator console** — co-drive spectator mode: operator view with live annotation channel to the acting agent.
- **Pill choice framing** — irreversible confirmations: two large states, full consequence text, no third button.
> *Reference still — “Matrix digital rain” — not committed. Open it from the source link below.*

- **Check against:** [Matrix raining-code screensaver (12h, 4K)](https://www.youtube.com/watch?v=l4ghF3PzY2M); [digital rain screensaver](https://www.youtube.com/watch?v=4eAzk2Y-P2A).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** digital rain is code-as-weather, reserved to one drawer; irreversible choices get two large states, no third button.

### TRON: Legacy (GMUNK boardroom)
- **Boardroom hex globe** — already mined for the deck artifact; keep the choreography grammar for cold-boot only. The Encom boot: hex earth, cascading panels, choreographed reveal.
- **Light-trail identity** — session wakes in the River: identity-colored trails that decay honestly with data age.
- **Identity disc dossier** — agent identity disc: profile, grants, history as one inspectable object handed between views.
- **Check against:** [Sam breaks into ENCOM (boardroom scene)](https://www.youtube.com/watch?v=y-86iKkn6k0); [Sam enters the Grid](https://www.youtube.com/watch?v=sfrZ7_nNhsA).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** choreographed hex-globe cold-boot reveal; identity trails decay with data age; identity disc is one inspectable dossier object.

### Minority Report
- **Gestural scrubbing** — Quest 2 River: grab-and-stretch the tape with hands; pinch a seal to open its receipt.
- **Precog uncertainty** — reviewer-agent triads render dissent explicitly: 2-1 verdicts show the minority report, always.
- **Check against:** [Minority Report UI innovation analysis](https://www.youtube.com/watch?v=VBceT1TkxU4); [the future of advertising](https://www.youtube.com/watch?v=gcimRZF8g3Y).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Production note (verified):** the gestural interface was built with gestural-UI specialist John Underkoffler and production designer Alex McDowell, prototyped through film/animation tests ([Imaginary Forces](https://imaginaryforces.com/project/minority-report)).
- **Motion spec:** hand-grab scrub/stretch; pinch-to-open receipts; 2-1 verdicts always show the minority report.

### Iron Man / JARVIS
- **Exploded holo teardown** — Quest 2 Organism: grab a fleet, explode into missions/tasks/attempts in hand-space.
- **Suit-up telemetry** — session-spawn sequence: contract-freeze → workspace → tools mounting as a 2s suit-up strip.
- **Conversational co-pilot** — Dashboard Agent proposal etiquette: renders options, yields instantly to operator interrupt.
- **Check against:** [Iron Man — JARVIS holographic display](https://www.youtube.com/watch?v=SXttEcS8Atw); [JARVIS HUD interface footage](https://www.youtube.com/watch?v=HYoUJWzO-50).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** exploded holo teardown into missions/tasks; 2s suit-up spawn strip; co-pilot yields instantly to interrupt.

### Oblivion (2013, GMUNK) (curated)
- **Glass desert console** — owner morning-review mode: Field over horizon gradient, chrome at 10% — the calm shift-start. The tower desk: transparent panels over sky, serene monitoring.
- **Sky-tower isolation** — design target: planetary scope must feel domestic — Hive as a desk, not a war room. One operator, planetary scope, domestic calm.
- **Drone status trinity** — per-endpoint trinity badge: identity, health, disposition — the whole endpoint story in 3 marks.
> *Reference still — “Oblivion GMUNK UI” — not committed. Open it from the source link below.*

- **Check against:** [Oblivion GFX UI/HUD montage (GMUNK)](https://www.youtube.com/watch?v=j3r4GE1KDtk); [Creating the World of Oblivion](https://www.youtube.com/watch?v=sFiG0dz45mQ).
- **Evidence tags:** B (GMUNK montage), C (making-of).
- **Motion spec:** transparent panels over sky; 10% chrome morning calm; per-endpoint identity/health/disposition trinity.

### The Expanse
- **Hard-vacuum pragmatism** — platform surfaces go full Expanse: amber mono, big handles, everything grabbable under stress.
- **Float-screen handoff** — Quest 2 pane-handoff: flick panels between wrist-dock, desk, and room-wall anchors.
- **Comms lag honesty** — freshness-lag rendered as distance: stale adapters drift visually farther away.
- **Check against:** [Rocinante sets fit in the exterior VFX model](https://www.youtube.com/watch?v=4fGZsAR5lLQ); [Roci set build time-lapse](https://www.youtube.com/watch?v=5v1nRybSz7Y).
- **Evidence tags:** B (per legend; classify each link by its title).
- **Motion spec:** amber mono, big grabbable handles; flick pane handoff between anchors; staleness renders as visual distance.

### Alien / Nostromo (1979)
- **Semiotic standard icons** — Hive needs its semiotic standard: one icon sheet for states, printed like ship signage. Ron Cobb's ship iconography: institutional, load-bearing.
- **MU/TH/UR terminal room** — Dashboard Agent full-screen mode: the MU/TH/UR room — query liturgy, slow phosphor answers.
- **Self-destruct ceremony** — fleet-stop ceremony: staged physical steps with abort window — the anti-single-click.
- **Check against:** [Alien (1979) — MUTHUR 6000 "Mother"](https://www.youtube.com/watch?v=Ib3XYAl-QYU); [recreating MUTHUR as a live interactive system](https://www.reddit.com/r/mothershiprpg/comments/1meopnv/recreating_muthur_from_alien_1979_as_a_live/).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** MU/TH/UR is a query-liturgy terminal with slow phosphor answers; self-destruct is staged physical steps with an abort window.

### Westworld (HBO)
- **Ribbon dialogue analysis** — thread conversation ribbon: model output scored for confidence/novelty as a quiet side-waveform.
- **Tablet vivisection UI** — review workbench alt-skin: porcelain clinical — evidence as biopsy, findings as pathology.
- **Narrative loop tracing** — manager pass timeline as loop-trace: routine circuits with deviation flags where plans diverged.
- **Check against:** [The technology of Westworld — Ars Technica](https://www.youtube.com/watch?v=9ncLC01WQ2c); [the tablet in real life](https://www.reddit.com/r/westworld/comments/1qemwlc/got_to_try_the_tablet_from_westworld_in_real_life/).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** confidence/novelty as a quiet side-waveform; porcelain-clinical review skin; manager timeline as a loop-trace with deviation flags.

### Max Headroom
- **20 minutes into the future** — Wire/comms lens: channels as broadcast feeds, trust classes as signal quality.
- **Stuttering AI presence** — Dashboard Agent may glitch-stamp its non-canonical speculations — artificiality made visible.
- **Check against:** [Max Headroom clip](https://www.youtube.com/watch?v=7TyS0DwLUkU); [the famous broadcast coup](https://www.reddit.com/r/GenX/comments/1iqgeps/the_famous_max_headroom_broadcast_coup_w/).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** channels as broadcast feeds with signal-quality trust classes; the agent glitch-stamps its own speculations as visibly artificial.

### Dredd (2012)
- **Slo-mo drug vision** — incident replay slow-mo inherits the FEAR note: cascades at 1/10 speed with saturation lift.
- **Peach Trees lockdown** — containment view: quarantined fleet as sealed tower, floors = write-scopes, locked in sequence.
- **Check against:** [Dredd — slo-mo dealer raid scene](https://www.youtube.com/watch?v=lzj9I1Wni0E); [slo-mo drug detail](https://www.reddit.com/r/MovieDetails/comments/8d648z/in_the_movie_dredd_when_the_characters_took_the/).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** 1/10-speed cascades with a saturation lift; containment as a sealed tower of sequential write-scopes.

### Upgrade (2018)
- **STEM body camera lock** — co-drive visual: when an agent acts under operator lock, the frame hard-locks — control provenance felt.
- **Implant negotiation voice** — mid-action authority escalation: agent pauses visibly, asks for the exact next grant, resumes on receipt.
- **Check against:** [UPGRADE — "STEM Implant" clip (2018)](https://www.youtube.com/watch?v=4jnxPHFcKLs); [STEM takes over](https://www.youtube.com/watch?v=-DqmTaUK-Ow).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** frame hard-locks under operator lock (provenance felt); mid-action the agent visibly pauses to request the next grant.

### Ex Machina
- **Glass-cell sessions** — review sessions framed as glass-cell: reviewer sees all of the candidate, candidate sees nothing of the reviewer.
- **Keycard access gradient** — authority inspector as keycard trace: walk any identity through every door it can and cannot open.
- **Check against:** [First time meeting Ava](https://www.youtube.com/watch?v=zx5c4pJ4sIc); [Ava escapes (final scene)](https://www.youtube.com/watch?v=JtpWO_mxEv4).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** asymmetric glass-cell visibility (reviewer sees all, candidate sees nothing); authority traced as a keycard walk through every door.

### Ghost in the Shell (1995)
- **Thermoptic dissolve** — session archive/detach: cells thermoptic-fade rather than vanish — departure is visible.
- **Dive sequence grammar** — scope-descent keeps GitS pacing: slow, weighted, depth-marked — not a snap cut.
- **Puppet Master dialogue** — the template for agent-to-operator gravity: measured type-on, long holds, no chirp.
> *Reference still — “Ghost in the Shell hologlobe” — not committed. Open it from the source link below.*

- **Check against:** [Ghost in the Shell — thermoptic camouflage scene (4K HDR)](https://www.youtube.com/watch?v=wixWLShOock); [the dive sequence](https://www.youtube.com/watch?v=JXhVxlDW3I4); [montage sequence HD](https://www.youtube.com/watch?v=ARTLckN9e7I).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** thermoptic fade (departure is visible, never a vanish); slow weighted depth-marked scope descent; measured type-on dialogue with long holds.

---

## Part 4 — Anime

### Ghost in the Shell: Stand Alone Complex
- **Section 9 ops table** — multi-operator co-presence: shared Field with per-identity annotation layers. A team around a shared tactical surface, roles annotating one scene.
- **Tachikoma parallel chatter** — same-profile workers rendered as siblings whose small histories visibly diverge — individuation from receipts.
- **Laughing Man overlay** — redaction done honestly: withheld identities get one canonical overlay mark, never silent absence.
- **Check against:** [Ghost in the Shell — Section 9](https://www.youtube.com/watch?v=zgHRitIflwk); [The full story of the Laughing Man](https://www.youtube.com/watch?v=AIdSZdwlQZY).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** shared tactical surface with per-identity annotation layers; sibling workers diverge visibly from receipts; redaction is one canonical overlay mark, never silent absence.

### Akira
- **Neo-Tokyo scale crush** — fleet-wall mode (IF-015): the massive view — thousand-cell comb as cityscape, red only where it bleeds. City as overwhelming mass with singular red accents.
- **Capsule telemetry** — overload rendering: when a metric exceeds instrument range, show the strain, not a clipped lie.
- **Espers' oracle room** — manager STABLE_WAIT surfaced as oracle fragments: partial rationale honestly incomplete.
- **Check against:** [Akira — the chase](https://www.youtube.com/watch?v=MMQIrVQXp8c); [the architecture of Neo-Tokyo](https://www.youtube.com/watch?v=Fe45ZeXqjfk); [opening bike scene](https://www.youtube.com/watch?v=W7b38A9cRME).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** overwhelming city mass with singular red accents; telemetry overload shows strain, not clipped lies; manager rationale surfaces as honestly-incomplete oracle fragments.

### Neon Genesis Evangelion
- **MAGI trinity vote** — already in the deck artifact; extend to reviewer-agent panels: three lenses, dissent rendered.
- **Sync-ratio gauge** — operator-agent sync: co-drive coupling as a drifting ratio — attention decay made visible.
- **AT-field hex barrier** — write-scope protection: protected paths shimmer hex when a worker approaches the boundary.
- **Emergency liturgy** — the seven red conditions get EVA liturgy: stamped condition class, chain of authority, klaxon reserved.
- **Check against:** [MAGI — the supercomputer with a human soul](https://www.youtube.com/watch?v=oLJoIZ3jQhE); [Unit 01 sync ratio 400%](https://www.youtube.com/watch?v=52DEqj7gmes).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** three-lens MAGI vote with rendered dissent; sync as a drifting ratio (attention decay); hex shimmer on write-scope approach; red conditions get stamped liturgy + reserved klaxon.

### Serial Experiments Lain
- **Navi bedroom sprawl** — anti-pattern to design against: Hive must stay a desk instrument, never the room. A consumer machine growing into a life-consuming apparatus.
- **Wired presence bleed** — ambient presence: fleet hum as barely-audible room tone that stops when all is landed — silence = done.
- **Layer navigation** — scope stack shown as Lain layers: each descent adds a stratum chip; Esc peels one.
- **Check against:** [Navi progression — Serial Experiments Lain](https://www.youtube.com/watch?v=UdXHdAPHVWE); [the PS1 game](https://www.youtube.com/watch?v=BC6o85endm0).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** the anti-pattern (don't become the room); fleet hum is barely-audible room tone, silence = done; scope stack as stratum chips, Esc peels one.

### Psycho-Pass
- **Dominator readout** — command affordances literally transform by authority: a button without grant renders as inert glass.
- **Hue/crime coefficient** — risk scoring rendered as hue-shift with the measurement method always one tap away — scores cite instruments.
- **Sibyl collective reveal** — any composite score must decompose on demand into its member judgments — Sibyl honesty.
- **Check against:** [The Dominator — PSYCHO-PASS](https://www.youtube.com/watch?v=jQv3s9-aTks); [crime coefficient — episode 1](https://www.youtube.com/watch?v=g6CrXYzbWXU); [the Sibyl system](https://www.youtube.com/watch?v=TwmDI54Qnkg).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** the Dominator physically transforms by authority (no grant = inert glass); risk is a hue-shift with the measurement method one tap away; composite scores decompose on demand.

### Bubblegum Crisis / AD Police
- **Hardsuit HUD wraps** — Quest 2 peripheral instruments: status at gaze edge, detail on look-at. Visor readouts hugging peripheral vision.
- **Boomer breakdown horror** — cascade rendering: correlated failures visually merge into one growing incident mass, not N separate pings.
- **Check against:** [Bubblegum Crisis — armor anatomy explained](https://www.youtube.com/watch?v=iL8mkwoyiic); [hardsuits OVA showcase](https://www.youtube.com/watch?v=dnYQj-6NI_o).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** peripheral-visor HUD (status at gaze edge, detail on look-at); correlated failures merge into one growing incident mass.

### Cowboy Bebop
- **Ship CRT clutter** — operator pinboard: personal annotations pinned onto canonical panels, clearly non-canonical ink. A lived-in cockpit: sticky notes on radar.
- **Bounty broadcast "Big Shot"** — queue-refill moments styled as bounty postings: new tasks announced with contract and price.
- **Check against:** [Big Shot — session 2 sequence](https://www.youtube.com/watch?v=ogsSQPZjW08); [the ships of Cowboy Bebop](https://www.reddit.com/r/cowboybebop/comments/83sbue/the_ships_of_cowboy_bebop/).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** lived-in cockpit with non-canonical sticky-note annotations on canonical panels; queue-refill as bounty postings with contract and price.

### Cyberpunk: Edgerunners
- **Trigger-style color pops** — landing celebrations: one full-color pop through the affected path, then back to phosphor. Held monochrome broken by total color commits.
- **Cyberpsychosis creep** — context-burn gauge: session context exhaustion as creeping edge-static on the cell — burnout visible early.
- **Check against:** [The art of Cyberpunk: Edgerunners by Studio Trigger](https://www.youtube.com/watch?v=kjSCQxgEdjQ); [animation analysis](https://www.youtube.com/watch?v=3PTX0lO7tpU); [cyberpsycho vs NCPD](https://www.youtube.com/watch?v=YRL74JmhVgk).
- **Evidence tags:** B (per legend; classify each link by its title).
- **Motion spec:** held monochrome broken by total-color commits on the affected path; burnout shows as creeping edge-static on the cell.

### Patlabor
- **Industrial mecha paperwork** — the anti-glamour truth: the Organism includes the paperwork lens — permits, leases, maintenance windows.
- **Hangar downtime scenes** — idle is a state worth rendering well: hangar view of parked capacity with readiness checks.
- **Check against:** [Patlabor — battle with Soviet Labors (HD)](https://www.youtube.com/watch?v=3xaFTjl4JCU); [essential anime — Patlabor](https://www.youtube.com/watch?v=5rNvcdbFaqc).
- **Evidence tags:** C (per legend; classify each link by its title).
- **Motion spec:** unglamorous paperwork lens (permits/leases/maintenance); idle hangar view with readiness checks rendered well.

### Cyber City Oedo 808
- **OVA neon grime** — grain treatments belong to recorded history (River replays), never to live canonical data. 80s cel grain over neon — texture as honesty.
- **Collar countdown** — lease expiry as worn hardware: sessions carry their countdown; expiry is never a surprise.
- **Check against:** [Cyber City Oedo 808 remastered — episode 1](https://www.youtube.com/watch?v=ycGoKn1Jfws); [opening "Burning World"](https://www.youtube.com/watch?v=PYVtZTsJBHQ).
- **Evidence tags:** A (per legend; classify each link by its title).
- **Motion spec:** cel grain only on recorded/replayed data, never live; lease expiry is a worn-hardware countdown, never a surprise.

### Knights of Sidonia
- **Mass-driver launch ritual** — dispatch moments: task-launch as brief catapult strip — contract locked, lane cleared, away.
- **Gravity-festival scarcity** — budget refresh/rollover as visible fleet event, not silent counter reset.
- **Check against:** [Knights of Sidonia — creditless opening (4K 60FPS)](https://www.youtube.com/watch?v=taU4zSqt0EU); [official Netflix trailer](https://www.youtube.com/watch?v=htgcz87-Wqk).
- **Evidence tags:** A (opening footage), C (trailer).
- **Motion spec:** task-launch is a brief catapult strip (contract locked, lane cleared, away); budget rollover is a visible fleet event, never a silent reset.

---

## Part 5 — Books (concept + adaptation visual)

Books are novels — there is no screen UI. For each, the adaptation/cover visual is the checkable rendering of the concept; the written concept is the design rule.

### Neuromancer — William Gibson
- **Cyberspace "consensual hallucination"** — the Organism's netmap lens license: abstract data-city, strictly labeled as projection.
- **Ice / countermeasures** — sandbox walls rendered as ice: layered translucent barriers showing what they refuse.
- **Simstim switching** — co-drive POV toggle: hard-switch between operator view and agent's-eye view, provenance stamped.
- **Dixie Flatline construct** — archived-agent consults: query a retired profile's history; it answers only from receipts, labeled ROM.
- **Check against:** [Neuromancer — official trailer (2026)](https://www.youtube.com/watch?v=_-AH9-XTaiQ); [the "consensual hallucination" quote (Goodreads)](https://www.goodreads.com/quotes/14638-cyberspace-a-consensual-hallucination-experienced-daily-by-billions-of-legitimate); [Gibson — Provocations (MIT)](https://web.mit.edu/m-I-t/provocations/gibson.html).
- **Motion spec:** cyberspace is an explicitly-labeled abstract projection; ice is translucent refusal-barriers; simstim is a provenance-stamped POV hard-switch; constructs answer only from receipts, labeled ROM.

### Snow Crash — Neal Stephenson
- **Gargoyle overload** — the cautionary figure: Hive's mobile cut must refuse gargoyle mode — pager, not firehose. A wearable-everything operator drowning in feeds.
- **Metaverse Street** — Quest 2 shared ops room: one Street-like spine; role determines what renders on your side.
- **Librarian daemon** — Dashboard Agent citation discipline is the Librarian: every claim carries its stack lookup.
- **Check against:** [Snow Crash — Wikipedia](https://en.wikipedia.org/wiki/Snow_Crash); [the modern gargoyle](https://www.thedigitalapothecary.com/musings/2015/1/11/snow-crash-and-medicine-the-rise-of-the-modern-gargoyle); [book notes](https://www.grahammann.net/book-notes/snow-crash-neal-stephenson).
- **Motion spec:** mobile cut is a pager, never a gargoyle firehose; shared ops room on one spine, role-gated rendering; every agent claim carries a citation lookup.

### Altered Carbon — Richard K. Morgan
- **Sleeve/stack duality** — session-vs-process rendering: durable work identity (stack) distinct from host process (sleeve) — resleeving = restart with continuity receipts.
- **Needlecast transfer** — cross-host migration as needlecast: cost, duration, and no-going-back stated before commit.
- **Check against:** [Altered Carbon — building the world (Netflix)](https://www.youtube.com/watch?v=TAM5ke5PgGg); [cortical stack wiki](https://altered-carbon.fandom.com/wiki/Cortical_Stack).
- **Motion spec:** durable identity (stack) vs host process (sleeve); resleeving restarts with continuity receipts; needlecast states cost/duration/no-going-back before commit.

### The Quantum Thief — Hannu Rajaniemi
- **Gevulot privacy contracts** — per-viewer redaction: role-scoped visibility contracts on every panel — what security sees vs owner.
- **Exomemory city** — the retention story: exomemory as explicit budget — what Hive remembers, for whom, until when.
- **Check against:** [highlights from The Quantum Thief](https://alper.nl/posts/the-quantum-thief-highlights/); [gevulot wiki](https://exomemory.fandom.com/wiki/Gevulot); [glossary](https://www.karangill.com/glossary-quantum-thief-fractal-prince-jean-le-flambeur/).
- **Motion spec:** per-panel role-scoped visibility contracts (gevulot); retention is an explicit memory budget (what/for-whom/until-when).

### Rainbow's End — Vernor Vinge
- **Wearable consensus overlays** — skin system formalized: NERV / porcelain / Expanse-amber as consensus overlays on one canonical scene. Competing reality-skins over one physical world.
- **Belief circles** — role-lens co-presence: two roles in the same room see role-true renderings of the same fleet.
- **Check against:** [Rainbow's End — Wikipedia](https://en.wikipedia.org/wiki/Rainbows_End_(Vinge_novel)); [Templeton Gate](http://templetongate.net/rainbows-end.htm).
- **Motion spec:** competing consensus-skins over one canonical scene; two roles in one room see role-true renderings of the same fleet.

### Daemon — Daniel Suarez
- **Distributed daemon persistence** — automation watchdogs given honest presence: cron/routines as visible daemons with kill-paths.
- **Darknet reputation HUD** — worker outcome-reputation: accepted-outcome history as the only rep number, method cited.
- **Check against:** [Daemon (novel) — Wikipedia](https://en.wikipedia.org/wiki/Daemon_(novel)); [review](https://www.words-and-dirt.com/words/review-daniel-suarezs-daemon/).
- **Motion spec:** cron/routines are visible daemons with explicit kill-paths; reputation is accepted-outcome history, method cited.

### The Diamond Age — Neal Stephenson
- **Primer adaptive book** — onboarding surface: the Hive primer adapts to role and observed confusion, always citing canon.
- **Matter compiler feeds** — provision pipeline lens: model/tool provisioning as feed lines with pressure and rations.
- **Check against:** [The Diamond Age — bookshelf](https://calv.info/bookshelf/diamond-age); [illustrated primer](https://manuscrypts.com/2015/08/23/the-diamond-age-or-a-young-ladys-illustrated-primer/).
- **Motion spec:** onboarding primer adapts to role/confusion and cites canon; provisioning is feed lines with pressure and rations.

### Burning Chrome — William Gibson
- **"The street finds its own uses"** — leave seams visible: exposed data attributes so operators can bolt their own scripts onto panels. Tools repurposed beyond design intent.
- **Chrome's ice run** — high-stakes command runs get run-telemetry framing: approach, ice, breach, receipts.
- **Check against:** [Burning Chrome — full text (archive PDF)](https://archive.mith.umd.edu/digitalstorytelling/wp-content/uploads/GibsonW_Burning_Chrome.pdf); [Wikipedia](https://en.wikipedia.org/wiki/Burning_Chrome).
- **Motion spec:** expose data-attribute seams for operator scripting; high-stakes runs are framed as approach/ice/breach/receipts telemetry.

---

## Part 6 — Cybernetics canon (the load-bearing diagrams)

These are the textbook diagrams, redrawn fresh. Each maps to a live Hive mechanism. Find the canonical figure, not a stylized substitute.

### Wiener — closed-loop feedback
- **Concept:** sort everything by error signal. The comb's default order is deviation-from-mission, not alphabetical. Every Hive control renders its loop: command → Kanpai → Salud observation → cleared; the diagram IS the receipt trail. Sensor → comparator → effector → environment → sensor. Field default sorts by |error|. Retry-storm detector rendered as oscillation trace: the system hunting is a named pathology.
- **Check against:** [Cybernetics — Wikipedia](https://en.wikipedia.org/wiki/Cybernetics); [Norbert Wiener — Linda Hall](https://www.lindahall.org/about/news/scientist-of-the-day/norbert-wiener/); [negative feedback in electronics](https://www.electronics-lab.com/article/the-negative-feedback-in-electronics/).

### Ashby — requisite variety & homeostat
- **Concept:** only variety absorbs variety — V(C) ≥ V(D). The Telegraph is the variety amplifier: human judgment covers the disturbance classes automation cannot. Render the balance per fleet. Manager recovery search rendered as homeostat steps: each reconfiguration logged, convergence visible. Per-fleet essential-variable strip: the 3–5 bounds that define viability, always visible.
- **Check against:** [Ashby's law of requisite variety — chapter 4](https://powermaps.net/tpost/rmbjvasm51-chapter-4-ashbys-law-of-requisite-variet); [video explainer](https://www.youtube.com/watch?v=L2gT1QuCBQ8); [Intelligent Organisations](https://intelligente-organisationen.de/ashbys-law-of-requisite-variety).

### Beer — Viable System Model (VSM) + Cybersyn opsroom
- **Concept:** S1–S5 recursion; the algedonic channel — pain/pleasure signals bypassing hierarchy. The Telegraph IS the algedonic channel (cite it); critical class must bypass every filter including snooze. Kanpai=S3, Salud=S3*, manager=S4, operator mission=S5; the red dashed line is the Telegraph's critical class. The Organism's skeleton is the recursion selector: same panel grammar at fleet/mission/task scale. Salud-as-S3*: spot-audit button that fetches direct evidence past every aggregation.
- **Project Cybersyn opsroom (curated):** the fleet-wall (IF-015) is Hive's opsroom — room-scale layout doctrine from 1972 Chile. Seven chairs, wall screens, decision environment as designed room. Armrest controls: Telegraph actions as armrest-class big buttons (deck mode). Flow diagrams as wall art: the standing large-format render, not a popup graph.
- **Check against:** [Project Cybersyn — Wikipedia](https://en.wikipedia.org/wiki/Cybersyn); [VSM — Metaphorum](https://metaphorum.org/staffords-work/viable-system-model); [VSM — Toolshero](https://www.toolshero.com/management/viable-system-model/); [Cybersyn — Archis](https://archis.org/volume/project-cybersyn/).

### Forrester — system dynamics
- **Concept:** stock-and-flow notation — the ledger rule made visual: every metric declares stock or flow in its glyph. Delay-marked links: queue/pipeline arrows carry delay marks (admission→placement→execution with measured lags). Causal loop polarity: the retry-cost spiral drawn as a reinforcing loop on the cost panel — name the loop to break it. Clouds = boundary; delays drawn ON the arrow.
- **Check against:** [Stocks and flows — converting from causal loop diagrams (The Systems Thinker)](https://thesystemsthinker.com/step-by-step-stocks-and-flows-converting-from-causal-loop-diagrams/); [stock and flow diagrams — Transentis](https://www.transentis.com/page/stock-and-flow-diagrams).

### Rasmussen — ecological interface design (EID)
- **Concept:** abstraction hierarchy — scope stack formalized: why (mission) / what (work) / how (session) as EID layers, one keystroke apart. Purpose→function→physical layers navigable in one display. Skill-rule-knowledge levels: every surface passes SRK — glance (skill), pattern (rule), drill-down (knowledge); the deck cut is skill-tier. Constraint rendering: capacity panels draw the safe envelope, not just the needle — operating point inside visible walls.
- **Check against:** [Ecological interface design — Wikipedia](https://en.wikipedia.org/wiki/Ecological_interface_design); [EID theoretical foundations (DTU PDF)](https://backend.orbit.dtu.dk/ws/files/158017888/SMC.PDF); [MIT Press chapter](https://direct.mit.edu/books/oa-monograph/chapter-pdf/2246883/c003900_9780262369886.pdf).

### McCulloch-Pitts / Macy circle
- **Concept:** neural net diagrams (1943) — delegation-graph glyph language: threshold-gate aesthetic for agent decision points. Heterarchy over hierarchy: actual-mode org rendering must allow cycles — heterarchy drawn honestly when observed.
- **Check against:** [Neural Networks 4: McCulloch & Pitts neuron](https://www.youtube.com/watch?v=osa3zIEJjgw); [the McCulloch-Pitts neuron (O'Reilly)](https://www.oreilly.com/library/view/artificial-intelligence-by/9781788990547/97eeab76-9e0e-4f41-87dc-03a65c3efec3.xhtml); [Macy conferences — Wikipedia](https://en.wikipedia.org/wiki/Macy_conferences); [Macy conferences summary (ASC)](https://www.asc-cybernetics.org/foundations/history/MacySummary.htm).
- **Evidence tags:** C, C, C, C.

### Shannon — information theory
- **Concept:** signal-to-noise budget — operator attention as channel capacity; Telegraph admission control cites it. Capacity as a measurable, spendable quantity. Channel diagram: every Wire message drawn through its channel with the noise source labeled (untrusted content injection point). Source → encoder → channel (with noise) → decoder → destination.
- **Check against:** [Shannon and Weaver model of communication](https://www.communicationtheory.org/shannon-and-weaver-model-of-communication/); [Shannon information — Towards Data Science](https://towardsdatascience.com/shannon-information-theory-discovering-particles-of-information-ab2c136c6a25/).

---

## Part 7 — Music / scene

### Perturbator / Dan Terminus
- **Concept:** album-art chrome grids — sun-grid horizons, chrome type, VHS wash. Login/boot splash only — the one place scene aesthetics may run pure. Sidechain pulse: ambient motion ducks when a Telegraph item lands — attention sidechained; everything ducks to the kick.
- **Check against:** [Perturbator — I Am The Program (SynthpopWorld)](https://www.synthpopworld.com/perturbator-i-am-the-program-mega-drive/); [Perturbator — New Model review (Vehlinggo)](https://vehlinggo.com/2017/09/09/perturbator-new-model-review/); [Dan Terminus — The Wrath of Code feat. Perturbator (Bandcamp)](https://dan-terminus.bandcamp.com/track/the-wrath-of-code-feat-perturbator-2).
- **Evidence tags:** C, C, A (Dan Terminus audio/source).

### Ed Harrison — NeoTokyo (NSF)
- **Concept:** melancholy patrol ambience — the overnight-ops soundscape: sparse, non-looping-feel, alarms tuned against it. Long-form mood for sustained vigilance.
- **Check against:** [Neotokyo NSF — Ed Harrison (Bandcamp)](https://edharrison.bandcamp.com/album/neotokyo-nsf); [Departure](https://edharrison.bandcamp.com/track/departure); [OST release](https://stumpyfrog.com/sfr08ab-neotokyo-4lp-2cd/).

### Demoscene (Assembly / Revision)
- **Concept:** size-limited excellence — the deck build discipline: whole deck UI under 100KB as a stated constraint (64k intros: extreme craft under hard budget). Sync-to-music choreography: boot sequence beats locked to its audio stings — one authored timeline, then silence. Visuals locked to soundtrack timeline.
- **Check against:** [Revision 2024 — PC 64K intro compo](https://www.youtube.com/watch?v=DNXCW7kEaJw); [Revision 2025 — 64K intro](https://www.youtube.com/watch?v=etsb_C8ufh0); [best 64Kb prods 2001–2008](https://www.youtube.com/watch?v=xPiOcFkFOIc).

### Cassette futurism corpus
- **Concept:** beige-and-phosphor materiality — Hive print kit: physical labels/type-sheet for the deck hardware; the interface extends onto the case. Plastic housings, membrane keys, printed labels. Tape as medium of record: the River tape grammar — splice marks where history was reconciled.
> *Reference still — “Cassette-futurism control station” — not committed. Open it from the source link below.*

- **Check against:** [r/cassettefuturism — getting it right](https://www.reddit.com/r/cassettefuturism/comments/1vf8lry/if_you_want_to_get_your_cassette_futurism_right/); [Cassette Futurism — DESIGN.md](https://designmd.app/library/cassette-futurism); [Martin Fieber](https://martin-fieber.de/blog/cassette-futurism/); [TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/CassetteFuturism).

---

## Part 8 — FUI studios

### Territory Studio
- **Concept:** narrative-screens doctrine — panel briefs: each Hive panel has a one-line narrative job statement in the design doc. Every screen tells story state, briefs like film beats. Restraint under complexity: complexity budget per screen — one voice, one hue family, one motion idea (BR2049/The Martian: dense but single-voiced).
- **Check against:** [Blade Runner 2049 — UI Reel (Territory Studio)](https://www.youtube.com/watch?v=H07HumKRQKE); [screen graphics on Behance](https://www.behance.net/gallery/58693247/Blade-Runner-2049-Screen-Graphics); [Motionographer award writeup](https://motionographer.com/2020/05/13/blade-runner-i-mean-come-on-they-claimed-their-territory-and-their-prize-motion-award-winner/).

### GMUNK
- **Concept:** procedural geometry choreography — reserved for boot and landing ceremonies; choreography as rare event, never idle animation (TRON boardroom, Oblivion: geometry as performance).
- **Check against:** [TRON: ARES — GMUNK Computer Vision Reel 4K](https://www.youtube.com/watch?v=ZCurZKMSwyU); [Creating the World of Oblivion](https://www.youtube.com/watch?v=sFiG0dz45mQ); [TRON: Legacy VFX breakdown by Digital Domain](https://www.youtube.com/watch?v=75O8rgUbdQE).

### eDEX-UI / DataV lineage
- **Concept:** fullscreen mosaic doctrine — the fleet-wall preset borrows the mosaic; the workday preset stays lean (two densities, named). Everything visible, theatrically dense. SVG frame component kit: port 3–4 DataV frame primitives into the panel chrome kit — DataV's borders/decorations as data-driven components.
- **Check against:** [eDEX-UI — GitHub (GitSquared)](https://github.com/GitSquared/edex-ui); [eDEX-UI mirror (h4x-host)](https://github.com/h4x-host/e-DEX-UI); [GeeksforGeeks overview](https://www.geeksforgeeks.org/linux-unix/edex-ui-terminal-for-windows-mac-and-linux/); [DataV aesthetic lineage — sci-fi dashboards](https://crashlaker.github.io/2021/11/27/sci-fi_dashboards.html).
- **License:** eDEX-UI is **GPL-3.0** (copyleft) — study freely; do not copy its source into a permissively-licensed library without inheriting GPL-3.0. DataV aesthetic conventions are reference-only.

### Arwes / cosmic-ui lineage
- **Concept:** frame/bleep/reveal system — audit their reveal + bleep APIs for the Telegraph's sound design; patterns only, no dependency.
- **Check against:** [Arwes — GitHub](https://github.com/arwes/arwes); [Arwes docs](https://arwes.dev/docs); [cosmic-ui — SVG sci-fi UI components (GitHub)](https://github.com/rizkimuhammada/cosmic-ui); [cosmic-ui overview](https://next.jqueryscript.net/tailwind-css/sci-fi-ui-components-cosmic/).
- **License:** Arwes and cosmic-ui are **MIT** — safe to adapt patterns from.

---

## Part 9 — Tools & assets index (verified licenses)

### Reference archives (reference-only — cite conventions, not assets)
- [Sci-Fi Interfaces (scifiinterfaces.com)](https://scifiinterfaces.com/) — Chris Noessel's HCI analysis of film/TV interfaces, with per-film report cards and the annual "Fritzies." Reference-only; no reuse license.
- [HUDS+GUIS (hudsandguis.com)](http://www.hudsandguis.com/) — Jono Yuen's FUI/HUD archive across film, TV, games, automotive; tag-organized (cockpit, tablet, holographic). Reference-only.
- [The Cyberdeck Cafe (cyberdeck.cafe)](https://cyberdeck.cafe/) — community blog of physical cyberdeck builds; documents real screen sizes, macropads, enclosures — your hardware targets. License n.a.
- [r/cassettefuturism](https://www.reddit.com/r/cassettefuturism/) (~148k) and [r/cyberDeck](https://www.reddit.com/r/cyberDeck/) (~128k) — visual corpus + real build constraints. Reference-only.

### Terminal / shell resources
- [Terminals Are Sexy (terminalsare.sexy)](https://terminalsare.sexy/) — awesome-list of terminal frameworks, plugins, themes; repo [k4m4/terminals-are-sexy](https://github.com/k4m4/terminals-are-sexy). **CC0-1.0** (public domain). Note: `terminals.sexy` is not the project; [terminal.sexy](https://terminal.sexy/) is a separate palette designer (license n.a.).
- [cool-retro-term](https://github.com/Swordfish90/cool-retro-term) — the canonical CRT-look reference implementation; named presets **Default Amber**, **Default Green**, **IBM DOS** are ready theme tokens. **GPL-3.0-or-later** (copyleft) — study, don't copy shaders into a permissive lib.
- [xterm.js](https://github.com/xtermjs/xterm.js) — browser terminal component (used by VS Code); theme with phosphor palettes, layer CRT shaders over. **MIT**.
- [terminal.css](https://github.com/Gioni06/terminal.css) — terminal-aesthetic CSS framework. **MIT**.
- [augmented-ui](https://github.com/propjockey/augmented-ui) — pure-CSS sci-fi panel geometry (clipped/notched corners, bevels, scaffold borders via `--aug-*`). **BSD-2-Clause**.
- [98.css](https://github.com/jdan/98.css) — Windows 98 chrome as CSS (authentic beveled cassette-futurism controls). **MIT**.
- [BOOTSTRA.386](https://github.com/kristopolous/BOOTSTRA.386) — 1980s DOS-terminal Bootstrap theme. **Apache-2.0**.

### CRT shaders (verify license per file)
- [blurbusters/crt-beam-simulator](https://github.com/blurbusters/crt-beam-simulator) — real-time electron-beam simulation (rolling-scan motion, not just static scanlines). **MIT** — the only permissively-licensed option; safe for commercial reuse with attribution. Top pick for the CRT effect layer.
- [libretro/glsl-shaders](https://github.com/libretro/glsl-shaders) — the de-facto CRT shader library (crt-easymode, crt-geom, crt-pi, crt-royale). **Per-file GPL** (no repo-wide license; check each file header). Treat as copyleft.
- [akgunter/crt-royale-reshade](https://github.com/akgunter/crt-royale-reshade) — the most feature-complete CRT simulation (mask, bloom, geometry, halation). **GPL-2.0** (copyleft).
- [bloc97/Anime4K](https://github.com/bloc97/Anime4K) — real-time upscaling/denoising GLSL for MPV (not a CRT shader). **MIT**.
- **Shadertoy** ([terms](https://www.shadertoy.com/terms)) — default **CC BY-NC-SA 3.0** (non-commercial). Do not ship a Shadertoy shader in a commercial library unless that specific shader's header states a permissive license. Search results are bot-blocked; use credited mirrors such as [RSRetroArch](https://github.com/Matsilagi/RSRetroArch) and [quark-shaders](https://github.com/hizzlekizzle/quark-shaders) (Timothy Lottes' CRT scan-line shader is mirrored as public-domain there).

### Fonts (all freely licensed for UI use)
| Font | License | Notes |
|---|---|---|
| [Fixedsys Excelsior](https://github.com/kika/fixedsys) | **CC0 / public domain** | Closest authentic DOS 8×16 bitmap; least obligation. Top pick for authentic terminal text. |
| [Terminus](https://terminus-font.sourceforge.net/) | OFL-1.1 | Bitmap 6×12–16×32, with CRT VGA-bold variants. |
| [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | OFL-1.1 | Holds up at VR text floor (Quest 2); ligature-free `NL` variant exists. |
| [IBM Plex Mono](https://github.com/IBM/plex) | OFL-1.1 | Corporate-precise mono. |
| [Fira Code](https://github.com/tonsky/FiraCode) | OFL-1.1 | Programming ligatures. |
| [Iosevka](https://github.com/be5invis/Iosevka) | OFL-1.1 | 6 monospace subfamilies, 9 weights. |

### Phosphor color tokens (verified)
| Token | Hex | Source |
|---|---|---|
| P1 green (Apple II / "P1 Phosphor") | `#33FF33` | [CRT Phosphor Wavelengths](https://publish.obsidian.md/xybre/permalink/e397c38e-aa6f-45eb-831f-f02a3836abc4); [Encyc — Monochrome monitor](https://encyc.org/wiki/Monochrome_monitor) |
| P1 green (classic green-screen) | `#33FF00` | [Encyc — Monochrome monitor](https://encyc.org/wiki/Monochrome_monitor) |
| P3 amber (canonical) | `#FFB000` | [CRT Phosphor Wavelengths](https://publish.obsidian.md/xybre/permalink/e397c38e-aa6f-45eb-831f-f02a3836abc4); [color-hex](https://www.color-hex.com/color/ffb000) |
| P3 amber (IBM 5151 reference) | bg `#0a0500`, dim `#c88500`, bright `#ffd070` | [Claude Themes gallery](https://clausqr.github.io/claude-themes/GALLERY.html) |
| Monochrome CRT "off" background | `#282828` | [Encyc — Monochrome monitor](https://encyc.org/wiki/Monochrome_monitor) |
| P4 white phosphor | **n.a.** (no sourced hex; 565/540 nm emission) | [Wikipedia — Phosphor](https://en.wikipedia.org/wiki/Phosphor) |

**Correction (verified):** P39 is **long-persistence green**, not white — use it for trail/afterglow behavior, not a white theme. The white monochrome phosphor is P4 ([Wikipedia — Phosphor](https://en.wikipedia.org/wiki/Phosphor), [Monochrome monitor](https://en.wikipedia.org/wiki/Monochrome_monitor)). Caveat: estimated phosphor hex "are not necessarily the perceived colors of real displays" ([CRT Phosphor Wavelengths](https://publish.obsidian.md/xybre/permalink/e397c38e-aa6f-45eb-831f-f02a3836abc4)); amber cannot be reproduced exactly on RGB (must mix red+green subpixels).

---

## Part 10 — Build-agent acceptance checklist

Before marking any component done, verify against the source clip:
- [ ] Watched the linked video and matched palette, grid, motion timing, and diegetic-vs-non-diegetic placement.
- [ ] Component passes the honesty rules: no invented topology/progress/causality; absences printed (magenta UNMEASURED); a control without authority renders inert glass.
- [ ] Motion = state change only; idle animation only in boot/landing ceremonies; phosphor decay only on historical data, never live.
- [ ] Sound follows the doctrine: silence is nominal; tape-stop/bolt-turn/relay-click are sub-200ms mechanical; the EVA klaxon is the only unmutable sustained alarm.
- [ ] Density is a spent budget (NieR chip rule); default lean; 240p / 64px legibility floor (Perfect Dark / N64).
- [ ] Composite scores decompose on demand (Sibyl); irreversible confirmations have two large states, no third button (Matrix pill rule).
- [ ] All reused code/assets carry a permissive license (MIT/BSD-2/CC0/OFL); GPL-3.0, GPL-2.0, and CC BY-NC-SA 3.0 sources are reference-only and not shipped.
- [ ] Phosphor tokens use the verified hex above; P39 is reserved for afterglow, not a white theme.

---

*Archive compiled 2026-08-29. Video URLs verified live on the cited hosts; tool/asset licenses verified against each repo's LICENSE or GitHub API. Unconfirmable items are marked n.a. and should not be treated as confirmed.*
