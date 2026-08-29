# The idea bank — 73 sources, 183 motifs, 15 roles

The wide pass. Every source below was mined for concrete interface mechanisms
rather than mood, and every mechanism carries the application it was proposed for.
Nothing here has been narrowed; narrowing is a later job, and doing it early is how
a library ends up with eight components and no vocabulary.

- Machine-readable: [`idea-bank.json`](idea-bank.json)
- Rendered page, with the full 73 x 15 co-occurrence matrix and cell explorer:
  [`pages/the-idea-bank.html`](pages/the-idea-bank.html)
- The same motifs drawn as vignettes: [`specimens.md`](specimens.md)
- The same sources with a verified video clip and a motion spec each:
  [`source-archive.md`](source-archive.md)

Motif fields: **what it is** in the source work, and **what it becomes** here.

## The fifteen roles

| Role | Class | What the surface owes it |
| --- | --- | --- |
| Owner-operator | cockpit | All-fleet cockpit, NEEDS YOU queue, bounded controls, receipts |
| Engineering lead | platform | Missions, dependency graph, outcome analytics, policy comparison |
| Platform operator | runtime | Hosts, endpoints, queues, leases, incidents, drain/stop |
| Reviewer / approver | decision | Frozen contract, diff, proof, bounded approve/reject |
| Mission owner | cockpit | Intent, success criteria, proposals, outcome report |
| Security / compliance | decision | Authority inspector, secret history, audit export |
| Autonomous manager | agent | Proposal ledger, STABLE_WAIT, decomposition rationale |
| Builder worker | agent | Frozen task contract, workspace, proof-ready states |
| Reviewer agent | agent | Independent assessment, PASS/FAIL/INCONCLUSIVE, lineage |
| Verifier / merge gate | decision | Deterministic proof runs, fail-closed states, receipts |
| Scheduler / dispatcher | runtime | Placement rationale, starvation, admission, backpressure |
| Recovery supervisor | runtime | Process timelines, fencing, salvage, terminal blocks |
| Dashboard Agent | conversation | Scoped chat, citations, per-target receipts, controller lock |
| Provider adapter | agent | Capability matrix, degraded states, cost/outcome compare |
| Wire identity | conversation | DID cards, presence, trust labels, authenticated provenance |


## Cybernetics — 8 sources, 22 motifs

### Wiener: feedback canon

- **Closed-loop diagram** — Sensor → comparator → effector → environment → sensor.
  *Applied:* Every Hive control renders its loop: command → Kanpai → Salud observation → cleared; the diagram IS the receipt trail  
  *Serves:* cockpit decision runtime
- **Error signal primacy** — The loop runs on deviation, not absolute state.
  *Applied:* Field default sorts by |error| — deviation from mission, not raw status  
  *Serves:* cockpit
- **Oscillation warning** — Overcorrection produces hunting.
  *Applied:* Retry-storm detector rendered as oscillation trace: the system hunting is a named pathology  
  *Serves:* runtime

### Ashby: requisite variety & homeostat

- **Law of requisite variety** — Controller variety must match disturbance variety.
  *Applied:* The Telegraph's existence justified on one slide: human decisions are the variety amplifier; show variety balance per fleet  
  *Serves:* cockpit decision
- **Homeostat step-change** — Random re-configuration until stability returns.
  *Applied:* Manager recovery search rendered as homeostat steps: each reconfiguration logged, convergence visible  
  *Serves:* agent
- **Essential variables** — A few variables that must stay in bounds or the system dies.
  *Applied:* Per-fleet essential-variable strip: the 3-5 bounds that define viability, always visible  
  *Serves:* runtime

### Beer: Viable System Model

- **S1-S5 recursion** — Operations, coordination, control, intelligence, identity — at every scale.
  *Applied:* The Organism's skeleton (kept in docs per earlier verdict) — but the recursion selector is UI: same panel grammar at fleet/mission/task scale  
  *Serves:* platform
- **Algedonic channel** — Pain/pleasure signals bypassing hierarchy.
  *Applied:* The Telegraph IS this — cite it; critical class must bypass every filter including snooze  
  *Serves:* cockpit
- **S3* audit channel** — Sporadic direct audit bypassing S2 reporting.
  *Applied:* Salud-as-S3*: spot-audit button that fetches direct evidence past every aggregation  
  *Serves:* decision

### Project Cybersyn opsroom

- **Hexagonal opsroom** — Seven chairs, wall screens, decision environment as designed room.
  *Applied:* The fleet-wall (IF-015) is Hive's opsroom: room-scale layout doctrine from 1972 Chile  
  *Serves:* cockpit
- **Flow diagrams as wall art** — Industrial flows as permanent large-format diagrams.
  *Applied:* Mission dependency wall: the standing large-format render, not a popup graph  
  *Serves:* platform
- **Armrest controls** — Big-button chair controls: decisions from seats, not keyboards.
  *Applied:* Touch-first decision controls: Telegraph actions as armrest-class big buttons (deck mode)  
  *Serves:* cockpit

### Forrester: system dynamics

- **Stock-and-flow notation** — Rectangles hold, valves flow, clouds are boundaries.
  *Applied:* Ledger rule made visual: every metric declares stock or flow in its glyph — the confusion the ledger bans  
  *Serves:* platform
- **Delay-marked links** — Delays drawn on the arrow, not hidden in behavior.
  *Applied:* Queue/pipeline arrows carry delay marks: admission→placement→execution with measured lags  
  *Serves:* runtime
- **Causal loop polarity** — +/- loop labels exposing reinforcing spirals.
  *Applied:* Retry-cost spiral drawn as reinforcing loop on the cost panel — name the loop to break it  
  *Serves:* platform

### Rasmussen: ecological interface design

- **Abstraction hierarchy** — Purpose→function→physical layers navigable in one display.
  *Applied:* Scope stack formalized: why (mission) / what (work) / how (session) as EID layers, one keystroke apart  
  *Serves:* cockpit platform
- **Skill-rule-knowledge levels** — Interfaces serving all three cognition modes.
  *Applied:* Every surface passes SRK: glance (skill), pattern (rule), drill-down (knowledge) — the deck cut is skill-tier  
  *Serves:* cockpit
- **Constraint rendering** — Show boundaries of safe operation, not just current point.
  *Applied:* Capacity panels draw the safe envelope, not just the needle — operating point inside visible walls  
  *Serves:* runtime

### McCulloch-Pitts / Macy circle

- **Neural net diagrams 1943** — Threshold logic drawn as circles and arrows — the ur-graph.
  *Applied:* Delegation graph glyph language: threshold-gate aesthetic for agent decision points  
  *Serves:* agent
- **Heterarchy over hierarchy** — Circular preference structures; no single top.
  *Applied:* Actual-mode org rendering must allow cycles — heterarchy drawn honestly when observed  
  *Serves:* platform

### Shannon: information theory

- **Channel diagram** — Source→encoder→channel(noise)→decoder→destination.
  *Applied:* Wire trust rendering: every message drawn through its channel with noise source labeled (untrusted content injection point)  
  *Serves:* conversation
- **Signal-to-noise budget** — Capacity as measurable, spendable quantity.
  *Applied:* Notification budget: operator attention as channel capacity; Telegraph admission control cites it  
  *Serves:* cockpit


## Games — 23 sources, 61 motifs

### Cyberpunk 2077

- **Kiroshi scan overlay** — Look at anything → layered readout: name, affiliation, threat, exploitable ports.
  *Applied:* Hover-scan any cell/session: identity, authority, blocked reason, available commands in one layered pass  
  *Serves:* cockpit decision
- **Quickhack ladder** — Target-locked list of possible intrusions, each with RAM cost + upload time.
  *Applied:* Command list per subject priced in authority + expected wait; disabled rungs show the missing grant  
  *Serves:* decision agent
- **Relic malfunction glitch** — Reality-tear distortion marking corrupted state.
  *Applied:* Reserve the glitch treatment for exactly one thing: canonical-state corruption; never decorative  
  *Serves:* runtime
- **Netrunning depth dive** — Successive breach layers, each deeper with higher stakes.
  *Applied:* Dashboard Agent scope-descent: fleet → task → attempt shown as breach depth with rising authority cost  
  *Serves:* conversation

### Deus Ex: Human Revolution

- **Augment tree** — Capability unlocks as a body-map, each with cost + activation state.
  *Applied:* Agent profile as capability body-map: granted tools lit, ungranted greyed with the grant that unlocks them  
  *Serves:* platform agent
- **Black-gold triadic palette** — One metallic accent over near-black; renaissance-tech gravitas.
  *Applied:* A single gold-tier accent reserved for delivered/landing states — scarcity gives it meaning  
  *Serves:* cockpit
- **Hacking node graph** — Capture nodes toward registry while a trace races you.
  *Applied:* Verifier progress vs expiry as a race visual: proof nodes captured before the lease trace completes  
  *Serves:* runtime decision
- **Social battle readout** — Live personality-state gauge during persuasion.
  *Applied:* Dashboard Agent shows its evidence-confidence gauge as it answers; abstention is a visible state  
  *Serves:* conversation

### System Shock 1/2/Remake

- **MFD split deck** — Two independent multi-function displays under one viewport.
  *Applied:* Twin CRT Thread is this: left/right MFDs with swappable instrument cards  
  *Serves:* cockpit runtime
- **SHODAN presence** — The system speaks as a fractured overlay when degraded.
  *Applied:* Source-degradation banner with personality stripped: fragmented type only when truth is fragmenting  
  *Serves:* runtime
- **Audio-log breadcrumb** — History told through found recordings pinned to places.
  *Applied:* Attempt history as found receipts pinned to worktree locations — the River's stitch marks  
  *Serves:* agent
- **Cyberspace wireframe pocket** — Separate neon vector dimension for network actions.
  *Applied:* Netmap lens: pure-vector alternate rendering of the same canonical scene, one keypress away  
  *Serves:* conversation

### Observer

- **Dream-eater interrogation** — Walking inside a corrupted mind: layered visual noise as evidence decays.
  *Applied:* Evidence staleness as literal visual decay — receipts age into grain and chroma loss, never silently  
  *Serves:* decision
- **Tri-vision modes** — EM / bio / normal vision toggles over one scene.
  *Applied:* Field lens toggles: health / cost / authority vision over the same stable comb, hotkeyed  
  *Serves:* cockpit runtime
- **Retro-Polish devices** — CRT bulk, mechanical toggles, cassette-future switchgear.
  *Applied:* Physical toggle affordances for stop/drain — controls that look like commitments, not links  
  *Serves:* cockpit

### RUINER

- **KILL-YOU red brutalism** — Single saturated red carried as identity, not alarm.
  *Applied:* If Hive ever runs an incident theme, commit: red as the room, amber as the detail — never both diluted  
  *Serves:* cockpit
- **Boss intro cards** — Hard-cut full-screen title stamps.
  *Applied:* Attempt-start stamps in the River replay: A3 · MENDER · cut, hold, gone  
  *Serves:* agent
- **Glitch dash trails** — Motion communicated by displaced afterimages.
  *Applied:* Queue movement shown as afterimage trails on the placement panel — motion = state change only  
  *Serves:* runtime

### Transistor

- **Turn() planning bar** — Freeze time, queue actions against a budget bar, then execute.
  *Applied:* Batch-approval planning: queue bounded commands against an authority budget, review the plan, commit once  
  *Serves:* decision agent
- **Function combinatorics** — Abilities slot as verb+modifier+passive.
  *Applied:* Tool grants displayed as slotted combinations: base verb, scope modifier, standing passive  
  *Serves:* agent
- **Singing sword narrator** — The instrument itself speaks state softly.
  *Applied:* Dashboard Agent tone: quiet first-person status from the instrument, never chirpy  
  *Serves:* conversation

### Katana ZERO

- **Tape-scrub precognition** — Plan-fail-rewind rendered as VHS scrub.
  *Applied:* Attempt replay scrubber with VHS grammar: failures rewind visibly, the accepted take plays clean  
  *Serves:* decision
- **Dialogue interruption** — You can cut speech mid-line; the UI honors interruption as a first-class act.
  *Applied:* Interrupt in the Thread is a hard cut with visible scar — not a polite queued request  
  *Serves:* conversation

### The Last Night

- **2.5D parallax pixel city** — Pixel figures over volumetric light and depth.
  *Applied:* Field backdrop: parallax depth behind the comb, cells crisp, atmosphere deep  
  *Serves:* cockpit
- **Diegetic signage** — All exposition carried by in-world screens.
  *Applied:* Zero floating tooltips ambition: every label lives on a surface in the scene  
  *Serves:* cockpit

### VA-11 Hall-A

- **Drink-mix console** — Work happens in a fixed instrument panel while story flows past.
  *Applied:* Dashboard Agent tray as bartop: conversation flows, the instrument stays fixed and tactile  
  *Serves:* conversation
- **Jukebox pre-shift** — Operator sets the session soundtrack before work.
  *Applied:* Session-start ritual: pick ambience, see fleet status settle in — a deliberate opening beat  
  *Serves:* cockpit

### The Red Strings Club

- **Empathy lathe** — Shaping implants on a lathe to match psych profiles.
  *Applied:* Profile-fitting visual: worker profile turned against task contract until the fit is flush  
  *Serves:* agent
- **Bartender dialogue mixing** — Choosing what to serve alters what truth surfaces.
  *Applied:* Evidence-request composer: what you ask for shapes what the record can show — make the framing visible  
  *Serves:* decision

### Cloudpunk

- **Voxel delivery city** — Fleet-of-one logistics across a rain-soaked voxel metropolis.
  *Applied:* Placement map as city blocks: hosts as buildings, deliveries as routes, starvation as dark districts  
  *Serves:* runtime
- **HOVA dispatch voice** — Dispatcher speaks jobs in; the HUD stays minimal.
  *Applied:* Telegraph audio mode: decisions read out over a minimal visual tape for away-from-desk operation  
  *Serves:* conversation

### GhostRunner

- **One-hit clarity** — Absolute legibility at speed; UI nearly absent until death.
  *Applied:* Speed-mode Field: chrome collapses to nothing while all is nominal; only breaks surface  
  *Serves:* cockpit
- **Cybervoid puzzle space** — Abstract mind-space for capability unlocks.
  *Applied:* Capability-grant ceremonies in an abstract void scene — rare, memorable, bounded  
  *Serves:* agent

### Control

- **Brutalist Oldest House** — Shifting concrete architecture as living system.
  *Applied:* Org/Organism as brutalist floorplan: departments as halls, delegation as corridors that exist only when real  
  *Serves:* platform
- **Hotline ritual objects** — Mundane objects carry immense authority.
  *Applied:* Break-glass controls styled as ritual objects: the red phone is pickup-to-commit, with ceremony  
  *Serves:* decision
- **Threshold warnings** — Reality-boundary signage in institutional voice.
  *Applied:* Authority-boundary banners in flat institutional voice: 'EXTERNAL ACTION BOUNDARY. TYPED EFFECT REQUIRED.'  
  *Serves:* runtime

### SOMA

- **Structure-gel corruption** — Organic rot through machine surfaces.
  *Applied:* Degraded-adapter rendering: creeping desaturation at panel edges, spreading with age of last truth  
  *Serves:* runtime
- **Existential terminal logs** — Terminals that make you feel the stakes of copies.
  *Applied:* Fork/salvage dialogs must name what survives and what is abandoned — SOMA honesty about copies  
  *Serves:* agent

### F.E.A.R.

- **Slow-mo readability** — Bullet-time exists so the player can read chaos.
  *Applied:* Incident slow-mo: a replay speed where cascading events become individually readable  
  *Serves:* cockpit
- **Radio chatter ambience** — Squad state conveyed by overheard comms.
  *Applied:* Ambient agent chatter feed — Wire messages as low-volume radio, foregrounded only on mention  
  *Serves:* conversation

### Remember Me

- **Memory remix editor** — Scrub a memory, flip small causes, watch outcomes re-derive.
  *Applied:* Counterfactual viewer for attempts: flip an input receipt, see which downstream proofs would invalidate — analysis only, clearly non-canonical  
  *Serves:* decision
- **Sensen glow lines** — Neural augment traces on skin as status.
  *Applied:* Session liveness as faint circuit traces on the cell — brightness = recency of meaningful output  
  *Serves:* agent

### Ace Combat 3: Electrosphere

- **Full-FUI cockpit canon** — The entire game speaks fictional-UI: nav meshes, datalink chatter, corporate nets.
  *Applied:* The gold standard for total-diegesis: every Hive chrome element should pass the 'could this exist in-cockpit' test  
  *Serves:* cockpit
- **Mission-select data terminal** — Briefings as terminal documents with live annotations.
  *Applied:* Mission editor as briefing terminal: intent, criteria, expiry annotated live on the document  
  *Serves:* cockpit platform
- **Electrosphere net dive** — Network shown as translucent layered geodesics.
  *Applied:* Scope-descent transition: brief geodesic dive between fleet and task levels — 300ms, then still  
  *Serves:* conversation

### Perfect Dark

- **Weapon secondary modes** — Every tool has a hidden second function.
  *Applied:* Every panel gets one power-user secondary mode on long-press — inspect beneath the reading  
  *Serves:* cockpit
- **N64 spy-tech minimal HUD** — Low-res clarity: what survives 240p survives anything.
  *Applied:* Legibility floor test: render each Field cell at 64px; if unreadable, redesign  
  *Serves:* cockpit

### Armored Core series

- **Garage assembly** — Machine built from part cards with stat deltas.
  *Applied:* Profile assembly: swap model/tools/scope as garage parts, each swap showing the outcome-history delta  
  *Serves:* agent
- **AC test hangar** — Try the build in a consequence-free bay.
  *Applied:* Dry-run bay: rehearse a command against recorded state, output marked NON-CANONICAL in hazard stripes  
  *Serves:* decision

### NieR:Automata

- **Diegetic OS chrome** — Menus are the android's own OS; damage corrupts your menus.
  *Applied:* Hive chrome degrades with its own health: a stale adapter greys the panel chrome itself, not just data  
  *Serves:* cockpit runtime
- **Plug-in chip HUD budget** — HUD elements cost chips; showing more costs capability.
  *Applied:* Operator chooses HUD load-out against a real budget — density as a spent resource, defaulting lean  
  *Serves:* cockpit
- **Hacking twin-stick void** — Drop into minimal geometric sub-game for intrusion.
  *Applied:* Bounded sub-mode rendering for sandboxed actions — visually quarantined space = sandboxed authority  
  *Serves:* agent

### Alien: Isolation

- **Working-class cassette future** — Sevastopol: CRT greens, tape drives, mechanical keyboards.
  *Applied:* The Hive material palette already lives here — commit to switchgear, don't drift to glass  
  *Serves:* cockpit
- **Motion tracker dread** — One instrument, one number, total attention.
  *Applied:* The Telegraph pulse is a motion tracker: distance-to-decision as audio ping cadence  
  *Serves:* cockpit
- **Access rewire panels** — Physical rewiring to trade subsystem power.
  *Applied:* Capacity trades as rewire panels: drain here lights there, conservation made visible  
  *Serves:* runtime

### Death Stranding

- **Chiral network coverage** — Connected territory renders services; dark zones don't.
  *Applied:* Coverage map: where Salud observes, terrain lit; unmeasured regions literally unrendered  
  *Serves:* runtime
- **Cargo balance physics** — Load shown as physical stack with tipping risk.
  *Applied:* Queue load as stacked cargo: overcommit visibly tips; balance is the admission story  
  *Serves:* runtime
- **Strand contracts** — Bridges built by cumulative small contributions.
  *Applied:* Delivery history as strand-building: each landing thickens the route between repo and prod  
  *Serves:* platform

### EVE Online

- **Overview grid doctrine** — The famous sortable threat grid — thousands of objects, one disciplined table.
  *Applied:* The Organism WORK table borrows overview doctrine: dense, sortable, savable per-role presets  
  *Serves:* platform runtime
- **Fleet broadcast bar** — One-click intent broadcast to hundreds of pilots.
  *Applied:* Owner broadcast strip: DRAIN/HOLD/RESUME intents as one-tap broadcasts with receipt fan-out  
  *Serves:* cockpit
- **Killmail receipts** — Every loss is an immutable public receipt.
  *Applied:* Attempt post-mortems as killmails: exact fit, exact damage, exact cost — immutable and linkable  
  *Serves:* decision


## Film — 14 sources, 37 motifs

### Blade Runner (1982)

- **ESPER photo dive** — Voice-driven pan/zoom into an image beyond its resolution.
  *Applied:* Evidence drawer ESPER mode: voice or key-driven zoom through artifact layers, every enhancement logged  
  *Serves:* decision
- **Voight-Kampff instrument** — Bellows, iris close-up, needle — an instrument measuring the immeasurable.
  *Applied:* Review verdicts get instrument gravity: verdict needle settles slowly; no instant green checkmarks  
  *Serves:* decision
- **Spinner cockpit type** — Chunky phosphor readouts, unhurried refresh.
  *Applied:* Refresh cadence as aesthetic: sub-second data may render at 2Hz deliberately — calm over jitter  
  *Serves:* cockpit

### Blade Runner 2049 (Territory Studio)

- **Monochrome data sculpture** — LAPD interfaces: single-hue volumetric readouts, no chrome.
  *Applied:* Globe/graph lenses in one hue with depth — Territory's restraint: data as sculpture, zero ornament  
  *Serves:* cockpit conversation
- **DNA archive microfiche** — Analog-digital archive scrub with satisfying mechanism.
  *Applied:* History scrubbing with mechanical feel: flywheel inertia on the River scrubber  
  *Serves:* agent
- **Joi projection layering** — Translucent presence over reality, boundaries honest.
  *Applied:* Dashboard Agent renders as overlay presence — translucent, never pretending to be canonical chrome  
  *Serves:* conversation

### The Matrix

- **Digital rain** — Falling glyph curtain as the world's source code.
  *Applied:* Reserved for one place: raw-payload drawer background — the only spot Hive shows 'code as weather'  
  *Serves:* conversation
- **Operator console** — Tank reads the Matrix through cascading glyphs; headset directs live.
  *Applied:* Co-drive spectator mode: operator view with live annotation channel to the acting agent  
  *Serves:* conversation
- **Pill choice framing** — Binary commitment staged with total clarity.
  *Applied:* Irreversible confirmations: two large states, full consequence text, no third button  
  *Serves:* decision

### TRON: Legacy (GMUNK boardroom)

- **Boardroom hex globe** — The Encom boot: hex earth, cascading panels, choreographed reveal.
  *Applied:* Already mined for the deck artifact — keep the choreography grammar for cold-boot only  
  *Serves:* cockpit
- **Light-trail identity** — Every entity leaves a colored wake.
  *Applied:* Session wakes in the River: identity-colored trails that decay honestly with data age  
  *Serves:* agent
- **Identity disc dossier** — A person's whole record as a carried object.
  *Applied:* Agent identity disc: profile, grants, history as one inspectable object handed between views  
  *Serves:* agent

### Minority Report

- **Gestural scrubbing** — Two-handed timeline conducting.
  *Applied:* Quest 2 River: grab-and-stretch the tape with hands; pinch a seal to open its receipt  
  *Serves:* decision
- **Precog uncertainty** — Three oracles, majority report, visible dissent.
  *Applied:* Reviewer-agent triads render dissent explicitly: 2-1 verdicts show the minority report, always  
  *Serves:* decision

### Iron Man / JARVIS

- **Exploded holo teardown** — Grab a component, explode the assembly in air.
  *Applied:* Quest 2 Organism: grab a fleet, explode into missions/tasks/attempts in hand-space  
  *Serves:* agent
- **Suit-up telemetry** — Assembly progress as bodily HUD sequence.
  *Applied:* Session-spawn sequence: contract-freeze → workspace → tools mounting as a 2s suit-up strip  
  *Serves:* agent
- **Conversational co-pilot** — JARVIS proposes, Tony disposes; interruptible mid-render.
  *Applied:* Dashboard Agent proposal etiquette: renders options, yields instantly to operator interrupt  
  *Serves:* conversation

### Oblivion (2013, GMUNK)

- **Glass desert console** — The tower desk: transparent panels over sky, serene monitoring.
  *Applied:* Owner morning-review mode: Field over horizon gradient, chrome at 10% — the calm shift-start  
  *Serves:* cockpit
- **Drone status trinity** — Each drone: ID, integrity, disposition at a glance.
  *Applied:* Per-endpoint trinity badge: identity, health, disposition — the whole endpoint story in 3 marks  
  *Serves:* runtime
- **Sky-tower isolation** — One operator, planetary scope, domestic calm.
  *Applied:* Design target: planetary scope must feel domestic — Hive as a desk, not a war room  
  *Serves:* cockpit

### The Expanse

- **Hard-vacuum pragmatism** — Screens are tools: amber monochrome, physical handles, no decoration.
  *Applied:* Platform surfaces go full Expanse: amber mono, big handles, everything grabbable under stress  
  *Serves:* runtime
- **Float-screen handoff** — Flick a pane from wrist to wall to table.
  *Applied:* Quest 2 pane-handoff: flick panels between wrist-dock, desk, and room-wall anchors  
  *Serves:* conversation
- **Comms lag honesty** — Light-delay shown, never hidden.
  *Applied:* Freshness-lag rendered as distance: stale adapters drift visually farther away  
  *Serves:* runtime

### Alien / Nostromo (1979)

- **MU/TH/UR terminal room** — White-void room, green phosphor liturgy, question-answer ritual.
  *Applied:* Dashboard Agent full-screen mode: the MU/TH/UR room — query liturgy, slow phosphor answers  
  *Serves:* conversation
- **Semiotic standard icons** — Ron Cobb's ship iconography: institutional, load-bearing.
  *Applied:* Hive needs its semiotic standard: one icon sheet for states, printed like ship signage  
  *Serves:* cockpit
- **Self-destruct ceremony** — Bolt-turn, key, countdown — irreversibility as physical liturgy.
  *Applied:* Fleet-stop ceremony: staged physical steps with abort window — the anti-single-click  
  *Serves:* decision

### Westworld (HBO)

- **Ribbon dialogue analysis** — Host speech scored live as scrolling waveform ribbons.
  *Applied:* Thread conversation ribbon: model output scored for confidence/novelty as a quiet side-waveform  
  *Serves:* conversation
- **Tablet vivisection UI** — Clinical white porcelain surgical readouts.
  *Applied:* Review workbench alt-skin: porcelain clinical — evidence as biopsy, findings as pathology  
  *Serves:* decision
- **Narrative loop tracing** — Character loops drawn as circuits with deviation flags.
  *Applied:* Manager pass timeline as loop-trace: routine circuits with deviation flags where plans diverged  
  *Serves:* agent

### Max Headroom

- **20 minutes into the future** — Broadcast-tech dystopia: TV static, network feeds as power.
  *Applied:* Wire/comms lens: channels as broadcast feeds, trust classes as signal quality  
  *Serves:* conversation
- **Stuttering AI presence** — Max's glitch is personality, honestly artificial.
  *Applied:* Dashboard Agent may glitch-stamp its non-canonical speculations — artificiality made visible  
  *Serves:* conversation

### Dredd (2012)

- **Slo-mo drug vision** — Time-dilated hyper-saturation as altered state.
  *Applied:* Incident replay slow-mo inherits FEAR note: cascades at 1/10 speed with saturation lift  
  *Serves:* runtime
- **Peach Trees lockdown** — One tower, sealed, systems turned hostile floor by floor.
  *Applied:* Containment view: quarantined fleet as sealed tower, floors = write-scopes, locked in sequence  
  *Serves:* runtime

### Upgrade (2018)

- **STEM body camera lock** — Camera hard-locks to the acting body: mechanical precision reads as possession.
  *Applied:* Co-drive visual: when an agent acts under operator lock, the frame hard-locks — control provenance felt  
  *Serves:* agent
- **Implant negotiation voice** — The system asks permission mid-action, contract renegotiated live.
  *Applied:* Mid-action authority escalation: agent pauses visibly, asks for the exact next grant, resumes on receipt  
  *Serves:* conversation

### Ex Machina

- **Glass-cell sessions** — Interview through glass; power asymmetry in architecture.
  *Applied:* Review sessions framed as glass-cell: reviewer sees all of the candidate, candidate sees nothing of the reviewer  
  *Serves:* decision
- **Keycard access gradient** — One card, doors it opens and doors it won't.
  *Applied:* Authority inspector as keycard trace: walk any identity through every door it can and cannot open  
  *Serves:* decision


## Anime — 12 sources, 31 motifs

### Ghost in the Shell (1995)

- **Thermoptic dissolve** — Presence fading into environment, edge-shimmer.
  *Applied:* Session archive/detach: cells thermoptic-fade rather than vanish — departure is visible  
  *Serves:* agent
- **Dive sequence grammar** — Net-dive as slow vertical descent with depth markers.
  *Applied:* Scope-descent keeps GitS pacing: slow, weighted, depth-marked — not a snap cut  
  *Serves:* conversation
- **Puppet Master dialogue** — Speaking with an emergent intelligence across a glass boundary.
  *Applied:* The template for agent-to-operator gravity: measured type-on, long holds, no chirp  
  *Serves:* conversation

### GitS: Stand Alone Complex

- **Tachikoma parallel chatter** — Identical units diverge through experience; their chatter shows individuation.
  *Applied:* Same-profile workers rendered as siblings whose small histories visibly diverge — individuation from receipts  
  *Serves:* agent
- **Laughing Man overlay** — A symbol that live-replaces identity in every feed.
  *Applied:* Redaction done honestly: withheld identities get one canonical overlay mark, never silent absence  
  *Serves:* decision
- **Section 9 ops table** — Team around a shared tactical surface, roles annotating one scene.
  *Applied:* Multi-operator co-presence: shared Field with per-identity annotation layers  
  *Serves:* cockpit

### Akira

- **Neo-Tokyo scale crush** — City as overwhelming mass with singular red accents.
  *Applied:* Fleet-wall mode (IF-015): the massive view — thousand-cell comb as cityscape, red only where it bleeds  
  *Serves:* cockpit
- **Capsule telemetry** — Tetsuo's monitoring: medical readouts straining against the unmeasurable.
  *Applied:* Overload rendering: when a metric exceeds instrument range, show the strain, not a clipped lie  
  *Serves:* runtime
- **Espers' oracle room** — Wizened children speak in fragments; prophecy needs interpretation.
  *Applied:* Manager STABLE_WAIT surfaced as oracle fragments: partial rationale honestly incomplete  
  *Serves:* agent

### Neon Genesis Evangelion

- **MAGI trinity vote** — Three minds, visible dissent, majority commit.
  *Applied:* Already in the deck artifact — extend to reviewer-agent panels: three lenses, dissent rendered  
  *Serves:* decision
- **Sync-ratio gauge** — Pilot-machine coupling as one number with drift.
  *Applied:* Operator-agent sync: co-drive coupling as a drifting ratio — attention decay made visible  
  *Serves:* agent
- **AT-field hex barrier** — Defense as visible geometric field.
  *Applied:* Write-scope protection: protected paths shimmer hex when a worker approaches the boundary  
  *Serves:* decision
- **Emergency liturgy** — Klaxon typography, pattern-blue stamps, command hierarchy in fonts.
  *Applied:* The seven red conditions get EVA liturgy: stamped condition class, chain of authority, klaxon reserved  
  *Serves:* runtime

### Serial Experiments Lain

- **Navi bedroom sprawl** — Consumer machine growing into life-consuming apparatus.
  *Applied:* Anti-pattern to design against: Hive must stay a desk instrument, never the room  
  *Serves:* cockpit
- **Wired presence bleed** — Network presence leaking into rooms as hum and shadow.
  *Applied:* Ambient presence: fleet hum as barely-audible room tone that stops when all is landed — silence = done  
  *Serves:* conversation
- **Layer navigation** — 'Layers' as both episodes and reality strata.
  *Applied:* Scope stack shown as Lain layers: each descent adds a stratum chip; Esc peels one  
  *Serves:* conversation

### Psycho-Pass

- **Dominator readout** — Weapon speaks its authorization state aloud, changes form by verdict.
  *Applied:* Command affordances literally transform by authority: a button without grant renders as inert glass  
  *Serves:* decision
- **Hue/crime coefficient** — Society scored by continuous psychometric color.
  *Applied:* Risk scoring rendered as hue-shift with the measurement method always one tap away — scores cite instruments  
  *Serves:* platform
- **Sibyl collective reveal** — The scorer is itself a committee with conflicts.
  *Applied:* Any composite score must decompose on demand into its member judgments — Sibyl honesty  
  *Serves:* decision

### Bubblegum Crisis / AD Police

- **Hardsuit HUD wraps** — Visor readouts hugging peripheral vision.
  *Applied:* Quest 2 peripheral instruments: status at gaze edge, detail on look-at  
  *Serves:* cockpit
- **Boomer breakdown horror** — Machine failure as body horror escalation.
  *Applied:* Cascade rendering: correlated failures visually merge into one growing incident mass, not N separate pings  
  *Serves:* runtime

### Cowboy Bebop

- **Bounty broadcast 'Big Shot'** — Work arrives as lo-fi TV show listings.
  *Applied:* Queue-refill moments styled as bounty postings: new tasks announced with contract and price  
  *Serves:* agent
- **Ship CRT clutter** — Lived-in cockpit: sticky notes on radar.
  *Applied:* Operator pinboard: personal annotations pinned onto canonical panels, clearly non-canonical ink  
  *Serves:* cockpit

### Cyberpunk: Edgerunners

- **Cyberpsychosis creep** — Augment overload as accumulating visual corruption.
  *Applied:* Context-burn gauge: session context exhaustion as creeping edge-static on the cell — burnout visible early  
  *Serves:* agent
- **Trigger-style color pops** — Held monochrome broken by total color commits.
  *Applied:* Landing celebrations: one full-color pop through the affected path, then back to phosphor  
  *Serves:* cockpit

### Patlabor

- **Industrial mecha paperwork** — Giant robots met with clipboards, permits, maintenance bays.
  *Applied:* The anti-glamour truth: Organism includes the paperwork lens — permits, leases, maintenance windows  
  *Serves:* platform
- **Hangar downtime scenes** — Most of the time machines just sit; readiness is the story.
  *Applied:* Idle is a state worth rendering well: hangar view of parked capacity with readiness checks  
  *Serves:* runtime

### Cyber City Oedo 808

- **Collar countdown** — Sentenced operatives with visible deadline hardware.
  *Applied:* Lease expiry as worn hardware: sessions carry their countdown; expiry is never a surprise  
  *Serves:* agent
- **OVA neon grime** — 80s cel grain over neon — texture as honesty.
  *Applied:* Grain treatments belong to recorded history (River replays), never to live canonical data  
  *Serves:* cockpit

### Knights of Sidonia

- **Mass-driver launch ritual** — Sortie as industrial catapult sequence with cutaways.
  *Applied:* Dispatch moments: task-launch as brief catapult strip — contract locked, lane cleared, away  
  *Serves:* agent
- **Gravity-festival scarcity** — Resource events as communal ritual.
  *Applied:* Budget refresh/rollover as visible fleet event, not silent counter reset  
  *Serves:* platform


## Books — 8 sources, 19 motifs

### Neuromancer

- **Cyberspace 'consensual hallucination'** — Data as navigable cityscape of light.
  *Applied:* The Organism's netmap lens license: abstract data-city, strictly labeled as projection  
  *Serves:* conversation
- **Ice / countermeasures** — Defensive software as visible geometric armor.
  *Applied:* Sandbox walls rendered as ice: layered translucent barriers showing what they refuse  
  *Serves:* decision
- **Simstim switching** — Riding another's senses with a hard switch.
  *Applied:* Co-drive POV toggle: hard-switch between operator view and agent's-eye view, provenance stamped  
  *Serves:* conversation
- **Dixie Flatline construct** — A dead expert as consultable ROM with honest limits.
  *Applied:* Archived-agent consults: query a retired profile's history; it answers only from receipts, labeled ROM  
  *Serves:* agent

### Snow Crash

- **Metaverse Street** — One shared spatial mainstreet with avatar presence rules.
  *Applied:* Quest 2 shared ops room: one Street-like spine; role determines what renders on your side  
  *Serves:* conversation
- **Librarian daemon** — Instant-recall research daemon that only cites.
  *Applied:* Dashboard Agent citation discipline is the Librarian: every claim carries its stack lookup  
  *Serves:* conversation
- **Gargoyle overload** — Wearable-everything operator drowning in feeds.
  *Applied:* The cautionary figure: Hive's mobile cut must refuse gargoyle mode — pager, not firehose  
  *Serves:* cockpit

### Altered Carbon

- **Sleeve/stack duality** — Mind as portable stack, body as replaceable sleeve.
  *Applied:* Session-vs-process rendering: durable work identity (stack) distinct from host process (sleeve) — resleeving = restart with continuity receipts  
  *Serves:* agent
- **Needlecast transfer** — Identity transmission as costly, logged, irreversible.
  *Applied:* Cross-host migration as needlecast: cost, duration, and no-going-back stated before commit  
  *Serves:* runtime

### The Quantum Thief

- **Gevulot privacy contracts** — Memory-sharing as negotiated per-glance contracts.
  *Applied:* Per-viewer redaction: role-scoped visibility contracts on every panel — what security sees vs owner  
  *Serves:* decision
- **Exomemory city** — A city that remembers everything for everyone.
  *Applied:* The retention story: exomemory as explicit budget — what Hive remembers, for whom, until when  
  *Serves:* platform

### Rainbow's End

- **Wearable consensus overlays** — Competing reality-skins over one physical world.
  *Applied:* Skin system formalized: NERV / porcelain / Expanse-amber as consensus overlays on one canonical scene  
  *Serves:* cockpit
- **Belief circles** — Groups literally see different worlds together.
  *Applied:* Role-lens co-presence: two roles in the same room see role-true renderings of the same fleet  
  *Serves:* conversation

### Daemon (Suarez)

- **Distributed daemon persistence** — A dead man's process executing through the world.
  *Applied:* Automation watchdogs given honest presence: cron/routines as visible daemons with kill-paths  
  *Serves:* agent
- **Darknet reputation HUD** — Persistent skill/rep scores over people.
  *Applied:* Worker outcome-reputation: accepted-outcome history as the only rep number, method cited  
  *Serves:* agent

### The Diamond Age

- **Primer adaptive book** — A document that watches its reader and reshapes.
  *Applied:* Onboarding surface: the Hive primer adapts to role and observed confusion, always citing canon  
  *Serves:* conversation
- **Matter compiler feeds** — Physical goods streamed from feed infrastructure.
  *Applied:* Provision pipeline lens: model/tool provisioning as feed lines with pressure and rations  
  *Serves:* runtime

### Burning Chrome

- **'The street finds its own uses'** — Tools repurposed beyond design intent.
  *Applied:* Leave seams visible: exposed data attributes so operators can bolt their own scripts onto panels  
  *Serves:* cockpit
- **Chrome's ice run** — A heist told as instrument readouts.
  *Applied:* High-stakes command runs get run-telemetry framing: approach, ice, breach, receipts  
  *Serves:* decision


## FUI studios & libraries — 4 sources, 6 motifs

### Territory Studio corpus

- **Narrative screens doctrine** — Every screen tells story state, briefs like film beats.
  *Applied:* Panel briefs: each Hive panel has a one-line narrative job statement in the design doc  
  *Serves:* cockpit
- **Restraint under complexity** — BR2049/The Martian: dense but single-voiced.
  *Applied:* Complexity budget per screen: one voice, one hue family, one motion idea  
  *Serves:* cockpit

### GMUNK corpus

- **Procedural geometry choreography** — TRON boardroom, Oblivion: geometry as performance.
  *Applied:* Reserved for boot and landing ceremonies — choreography as rare event, never idle animation  
  *Serves:* cockpit

### eDEX-UI / DataV lineage

- **Fullscreen mosaic doctrine** — Everything visible, theatrically dense.
  *Applied:* The fleet-wall preset borrows the mosaic; workday preset stays lean — two densities, named  
  *Serves:* cockpit
- **SVG frame component kit** — DataV's borders/decorations as data-driven components.
  *Applied:* Port 3-4 DataV frame primitives into nerv-ui.css as the panel chrome kit  
  *Serves:* cockpit

### Arwes / cosmic-ui lineage

- **Frame/bleep/reveal system** — Componentized sci-fi chrome with sound hooks.
  *Applied:* Audit their reveal + bleep APIs for the Telegraph's sound design — patterns only, no dependency  
  *Serves:* conversation


## Music & demoscene — 4 sources, 7 motifs

### Perturbator / Dan Terminus scene

- **Album-art chrome grids** — Sun-grid horizons, chrome type, VHS wash.
  *Applied:* Login/boot splash only — the one place scene aesthetics may run pure  
  *Serves:* cockpit
- **Sidechain pulse** — Everything ducks to the kick.
  *Applied:* Motion doctrine: ambient motion ducks when a Telegraph item lands — attention sidechained  
  *Serves:* cockpit

### Ed Harrison: NeoTokyo NSF

- **Melancholy patrol ambience** — Long-form mood for sustained vigilance.
  *Applied:* The overnight-ops soundscape: sparse, non-looping-feel, alarms tuned against it  
  *Serves:* cockpit

### Demoscene (Assembly/Revision)

- **Size-limited excellence** — 64k intros: extreme craft under hard budget.
  *Applied:* The deck build discipline: whole deck UI under 100KB as a stated constraint  
  *Serves:* cockpit
- **Sync-to-music choreography** — Visuals locked to soundtrack timeline.
  *Applied:* Boot sequence beats locked to its audio stings — one authored timeline, then silence  
  *Serves:* cockpit

### Cassette futurism corpus

- **Beige-and-phosphor materiality** — Plastic housings, membrane keys, printed labels.
  *Applied:* Hive print kit: physical labels/type-sheet for the deck hardware — the interface extends onto the case  
  *Serves:* cockpit
- **Tape as medium of record** — Rewind, splice, dub — records you can touch.
  *Applied:* River tape grammar already adopted — extend: splice marks where history was reconciled  
  *Serves:* decision

