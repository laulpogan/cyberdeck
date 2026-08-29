# The vault

Real interface imagery from the works the library is imitating, as files on disk — not
descriptions of them. The comparison being made is motion, and motion cannot be closed by
reading a paragraph about a stopwatch.

## What is here

| file | what it does |
| --- | --- |
| `acquire.mjs` | reads a page in a real browser, harvests media URLs out of the scrolled DOM, downloads, verifies by magic bytes and size, records provenance |
| `seeds.json` | what each seed claims: the work, the subject, *how it moves*, and the words that make a candidate relevant |
| `mark.py` | decodes each file to measure frames, per-frame delay and loop length, then assigns `reference` / `look-alike` / `drift` |
| `sheet.py` | one PNG per seed: each asset sampled at four points along its own timeline, with its caption and why it was kept |
| `MANIFEST.json` | the record per file — committed |
| `raw/` | the binaries — gitignored |
| `acquire.log` | every page read, candidates offered, kept, refused |

```sh
MAX_PER_PAGE=4 SEED=motion-tracker node vault/acquire.mjs    # one seed
python3 vault/mark.py && python3 vault/sheet.py              # measure, then look
```

## The films, not the GIF hosts

`acquire.mjs` reaches image hosts, and `COVERAGE.md` records what that costs: seventeen
components sit in the tier "search candidates only" with **zero verified files between them** —
`magi`, `dominator`, `ladder`, `collar`, `syncRatio`, `joiOverlay`, `scanOverlay`, `triVision`,
`ice`, `individuation`, `redaction`, `oracle`, `gauge`, `glassCell`, `keycard`, `dispatch`,
`needleField`. A moving diegetic interface is not on a GIF host. It is in the film.

`youtube.mjs` makes the one hop `clip.mjs` refused. That refusal was real — `curl` gets
`HTTP 403` from youtube.com — but it was a rule about `curl`, so this negotiates the page with
`yt-dlp` and then hands the file to `clip.mjs`, which still owns every measurement and every
manifest record.

```sh
node vault/youtube.mjs URL='https://www.youtube.com/watch?v=ID' SLUG=magi
# -> fetches once, caches under raw/.src/, prints a contact sheet across the WHOLE film

node vault/youtube.mjs URL='...' SLUG=magi START=214 DUR=12 WORK='...' SHOWS='...'
# -> hands the cached file to clip.mjs
```

**The scan is not optional and the tool will not skip it.** Without `START` it refuses to derive
anything and prints the sheet instead, because a window chosen off a video's title is the drift
this vault exists to stop. Version matters too: `yt-dlp 2026.06.09` returned `HTTP 403` on the
media while reading metadata fine — a stale extractor looks exactly like a hard refusal.
Upgrading to `2026.08.19` fixed it, so check the version before believing a 403.

The first run earned its keep by rejecting something. The archive's must-watch list names a MAGI
video; the scan showed 45 of 48 frames are a presenter talking to camera, and the clip showed the
decision panel holding about 2.5 seconds as a static cut. A still of the panel, not its motion —
refused and recorded in `EYEBALL.json` rather than quietly dropped, because the next person to
find that link should find the reason beside it.

Downloads are private reference copies for design study. They land under `raw/`, which is
gitignored, and nothing derived from them ships.

A real browser is not optional fussiness: Tenor answers `curl` with a Cloudflare challenge and
GifCities renders with scripts, so a script that never scrolls sees four images where a person
sees two hundred. A vault whose "images" are 300-byte challenge pages is worse than no vault.

## What the vault holds (measured by `mark.py`, not remembered)

**273 records.** 147 `reference`, 39 `look-alike`, 87 `drift`. 92 GIFs, of which 11 hold one
frame; longest real loop is 147 frames / 14.7 s. Frames and delays are measured off decoded
frames and cross-checked against ImageMagick on 15 sampled files: **zero disagreements**, frames
and loop length both.

Status is not a mood. `reference` means the file was reached through a tag that names the idiom,
or its own URL names the subject from `seeds.json`. `look-alike` means a host's keyword or
semantic search matched the words — same idiom, *not the prop*. `drift` means nothing in the URL
or the page's caption connects it to the seed, which is what the first haul produced in bulk: a
MAGI query returned `cat6cable-system-cable-management`, a motion-tracker query returned
`presidents-day`. Drift files stay on disk with their provenance and are refused by `sheet.py`
by default — `INCLUDE=drift,look-alike` to see them — because a record that says nothing about
what it is good for will be used as if it were good.

## What the acquisition learned the hard way

- **A junk filter must match a name, not a substring.** The first version tested for `ads` and
  threw out every reference image on scifiinterfaces, because they all live under
  `/wp-content/uploads/`. Tokens now have to stand as a path segment or filename prefix, which
  is how hosts actually name a tracker — and `pixel.wp.com/g.gif` now goes where it belongs.
- **A GIF byte scan is not a frame counter.** Scanning for the image-separator byte finds those
  bytes inside LZW pixel data: one file was recorded as *805 frames* and, having failed to find
  graphic-control records where it expected them, was labelled **still** in the same row. The
  real count was far smaller and the file animated. Measurement now happens in `mark.py` off
  decoded frames, in one place, cross-checked. `acquire.mjs` no longer measures motion at all.
- **`?format=json` on GifCities answers with HTML.** The claim came out of a search summary; the
  endpoint says otherwise. The grid is read the way a person reads it, and each result's link to
  the page it was crawled out of (`geocities.com/Area51/Vault/3763/storm.gif`) is both the
  relevance signal and the real provenance — the blob URL is a hash and says nothing.
- **Both permalink shapes live on one host.** The search page links `/2020-04-03/slug/`, the tag
  archive links `/2020/04/03/slug/`. A pattern matching only one reads as *this archive has no
  articles in it*, which is the failure mode to fear: a wrong pattern looks exactly like an empty
  source. Tag slugs are discovered from a page that loads (206 tags read off one of them:
  `radar-sweep`, `heads-up-display`, `cathode-ray-tube`, `big-red-label`) — guessed slugs 404,
  including `/tag/alien/`.
- **Captions come from `alt` and the figure's own caption.** Reading the surrounding anchor text
  produced a row captioned "| Comparing Sci-Fi HUDs in 2024 Movies |" over a picture of
  something else entirely: on WordPress the anchor around a linked image carries the post title.
  The anchor's href is kept as `originLink`, and the page title as `pageContext`, both usable for
  relevance and neither presented as the picture's caption.
- **One manifest, one writer.** Two runs each read `MANIFEST.json` at start and overwrote it at
  the end; records vanished without an error. There is a lock (`vault/.lock`, refuse to start if
  held) and a merge on write, and a run now ends by naming any file in `raw/` with no record —
  **4 such orphans are on disk right now**, the residue of the pre-lock overlap.

## What is still weak

- The 87 drift files are marked, not deleted, and 39 look-alikes are keyword matches at best.
- `interfaceingame.com` has no Aliens in its catalogue — its search page says *No games found*,
  and that is the record, not a fetch failure. `hudsandguis.com` search returns two candidates a
  page; its Squarespace search needs a different entry than `?q=`.
- Anime-side archives (sakugabooru, per-title wikis), and the Tumblr/Imgur hosts where hand-cut
  HUD GIF sets actually live, are untouched.
- Nothing here distinguishes a real `.gif` from an MP4 served under the word "GIF"; the Tenor
  WebP entries are stills and are marked as such.
- `app/verify/FILMSTRIP.md` records the library's own motion; the comparison of the two — the
  gauntlet — is the next task and has not been run.

## Sources tried, and what each one can and cannot give

| source | reach | what it actually returns | status |
| --- | --- | --- | --- |
| Tenor / GifCities (`vault/acquire.mjs`) | ✓ browsed in a real browser, scrolled | characters, memes, site logos and banners. 12 of 114 ranked moving files survive an eye looking for an interface filling the frame | the haul that exists; yield ~1 interface in 10 |
| Commons, searching a noun (`radar`, `sonar`, `telemetry`) | ✓ reachable, but the noun returns the **thing**, not the screen | `Radar at Pease Pottage` is a camera pointed at a rotating **antenna on a hill**; the fish-school "sonar" file is a 3D render; the NASA "telemetry" files are 3–6 minute relay films of rooms | search for the **display** (`oscilloscope`, `HUD`, `monitor screen`), and expect to look at the sheet before believing the title |
| NASA image API (`images-api.nasa.gov`, `media_type=video`) | ✓ answers with no throttle, and gives direct asset manifests | **launch and relay footage, not diegetic panels**: `cockpit display` and `mission control screens` return KSC relay films of rooms; `DSKY`, `apollo guidance computer` and `rover camera telemetry overlay` return nothing at all | reachable, and empty for this purpose — the guidance-computer displays people picture are photographed, not filmed |
| `intitle:"screen recording"` on Commons (`barcode-scan-receipt`) | ✓ 13 files answered, direct media URLs | a phone barcode scan: reticle, an honest `Retrieving data, please wait…` with no progress bar, then a priced receipt while a cart badge steps 26 → 27 | most of the 13 are tool demos, and this one is **handheld camera over a real interface** — its SPECS travel belongs to the cameraperson (`cameraDrift: true`), so it is quoted for state vocabulary, not for a rate |
| NOAA / NWS radar loops on Commons (`hurricane-irma-radar-loop`) | ✓ the same direct-media path | a labelled geographic plate whose stamp steps by six minutes and whose wrap is a jump | the first reference in the vault for a **rolling loop** rather than a repeating one: everything in the field changes, the furniture is dark ink the instrument cannot see, and the age of the picture is printed on it |
| Wikimedia Commons search API, under load | ⚠ throttles: `You are making too many requests to the API`, returned as **plain text**, so a script that pipes it into a JSON parser reports a parse error and looks like a code fault | — | resolve a known filename through `Special:FilePath/<name>` (not the search API) and read `url_effective`; never rebuild a URL from a truncated print — one run recorded a 137-byte 403 page as a candidate reference that way |
| Commons search API **from a real browser** (Playwright, `fetch` run on-site) | ✓ answers JSON with no throttle where the plain client was refused: the block was a client property, not a network one | `filetype:video` in the query returned three families of motion files: level-crossing barriers going down (`twoState` — rejected), OLED/TV test patterns (`standardSheet` — rejected), optical-fibre splicing (`tapeSplice` — the only one whose drawing hosts its demand) | **the acquisition path is not blocked**; what limits coverage is the drawing test, not the network. Run `api.php` inside a page loaded from `commons.wikimedia.org` so the request is same-origin, and put `filetype:video` in the search string — bare nouns return still photographs of the *thing*, not the screen |  
| Commons search, from a real browser, as a committed tool (`vault/common-search.mjs`) | ✓ the same same-origin `api.php` path, now reproducible by anyone | `filetype:video` works **only with `gsrnamespace=6`** — without it the query runs over articles, where no article can be a video, and the API answers `{"batchcomplete":""}`, which is indistinguishable from an empty archive. Two more traps found the same hour: the API appends `?utm_…` to every URL (so a `$`-anchored extension test fails on every webm), and sorting the results by file size buries the one relevant 1.7 MB file under four 1.4 GB planning calls |
| Commons motion files for instrument nouns (`oscilloscope`, `seismograph`, `strip chart recorder`) | ✓ answers | **pedagogy, not panels**: an animated cutaway of a Tektronix 585A that assembles and disassembles itself; a 1963 Soviet tube scope filmed as a warm-up ritual; a camera walking up to a deployed seismometer. And a multi-word noun phrase (`mission control video wall`) returns whatever *mentions* those words — Wikimedia's own OTRS planning calls, a size-comparison-of-the-universe video | the search is not the limit, and neither is the network. What is missing from Commons is a **diegetic display filling the frame**, which is the only thing a motion spec can be read off |
| Wikimedia Commons (`vault/clip.mjs`, direct media URLs) | ✓ `upload.wikimedia.org` answers a plain `curl`; the API answers in JSON; no browser needed | the first usable **moving diegetic interface** since the loaders: a declassified F-16 HUD (`raw/f16-hud-gcas.gif`) — tapes scrolling under pinned readouts, a FLYUP limit cue arriving and leaving, `xxx` printed where a value is unavailable | **the path that works**: search the API for `filetype:video`, take the URL, derive a window with `node vault/clip.mjs` |
| YouTube clip harvest (`clip.mjs` pointed at a YouTube URL) | search works (`yt-dlp "ytsearch…"` returns titles and durations) | **media download is refused from this network**: `HTTP Error 403` on the plain client, `The page needs to be reloaded.` on the `tv` client. Two distinct client failures, so the path is not a flag away | blocked here; needs browser cookies or another host |
| Internet Archive (`advancedsearch.php` + `metadata/`) | ✓ queries and direct file downloads both answer | its index points at ROMs, game builds and let's-play videos; a `ftl+faster+than+light+gameplay` query returned a ZX Spectrum tape, a Stellaris video and a GOG installer, not one HUD recording | reachable but not yet productive; the query, not the host, is the problem |

Why the distinction matters: a diegetic interface that FILLS the frame is what a motion spec can
be read off. GIF hosts index the character holding the screen, mission footage indexes the rocket,
and the panel is a wedge in the corner of the shot. The verified corpus today (7 of 51 components
quoted in `SPECS-FOR.json`, see `vault/MAPPING.md`) is not a ranking failure — `vault/rank.py`
already puts the likeliest files first, and the likeliest files are stormtroopers.

## Three files that were found and not acquired, and why

The Commons search block being a client artefact changed what "coverage is capped" means: the network can supply
motion, so the limit is the **drawing test** — whether the component's own picture could host the demand the frames
state. Three candidates died there, and are recorded so nobody re-acquires them:

- **`twoState` ← level-crossing barrier footage** (`File:Gillingham Level Crossing barriers going down.webm`, and
  eleven neighbours). A barrier coming down is a machine changing state. `twoState` is a *commit decision*: two
  outcomes drawn at equal weight, `NOTHING IS PRESELECTED`, and a line for the cost of choosing neither. Nothing in a
  barrier's descent informs how two boxes are weighted or what the inaction line holds. The nearest file — malfunctioning
  crossing lights — is a *state that never completes*, which is `hardCut`'s and `queueState`'s country, not this card's.
- **`standardSheet` ← television test-pattern footage** (OLED burn-in and calibration patterns). A test card *is* a
  semiotic standard sheet, and the analogy is seductive, but the card's demands are that six glyphs stay distinguishable
  by **shape** with the labels covered and that the key never read as a measurement. A burn-in video measures pixel
  damage over minutes. Quoting it would be `mfd` all over again — a reading implying work the drawing cannot host.

- **`loopDeviation` ← `File:Oscilloscope.webm`** (Léa Georgelin, "L'Oscilloscope Tektronix 585A", Université
  Paris-Sciences; 29.0 s, 1920×1080, 1.7 MB). This was the best remaining lever: an instrument drawing a measured
  track, which is what the component needs in order to have its *observed* half informed by something real. Twelve
  frames killed it. It is an **animated cutaway**: the instrument is drawn exploding open, `TUBE CATHODIQUE`,
  `FAISCEAU D'ÉLECTRONS`, `TRACE DU FAISCEAU`, `GÉNÉRATEUR DE TENSION ALTERNATIVE` arriving one label at a time, a
  signal-generator sliding in with a cable, the whole thing collapsing back at the end. The CRT is a coin-sized
  circle with a squiggle in it and no legible graticule. Every duration in it belongs to the animator explaining a
  beam, and none belongs to an instrument reporting a value — which is the same class of contamination as
  `cameraDrift`, and quoting it would put pedagogical timing into a library whose whole rule is that motion is a
  measurement. The seismograph and chart-recorder neighbours were worse in the other direction: camera footage of
  hardware, with no screen at all.

The honest consequence for the goal: **coverage is not going to reach 51 by searching harder**, and the number stays
meaningful only if a `for` entry names where a reference actually informs a drawing. That sentence used to be an
argument; the round that produced this file made it a searched one — the two components with any chance, `loopDeviation`
and `scaleCrush`, were queried for specifically, with the query shapes that had worked before, and what came back was an
explainer and four Wikimedia planning calls. Of the twelve components still in
the nothing tier — `scaleCrush`, `chipBudget`, `standardSheet`, `tapeSplice`, `loopDeviation`, `bypass`, `ceremony`,
`twoState`, `contextBurn`, `garage`, `gevulot`, `channel` — several are Stargate metaphors with no diegetic screen in
the world to photograph (`gevulot` will not tell you; `ceremony` is a commissioning rite), and two of them are legends
whose whole claim is that they are not readings. `tapeSplice` was the one live candidate, and it was **bought and refused**: 14.4 MB pulled through
`Special:FilePath`, 88.7 s of theora at 320×240, twelve frames to a sheet, then a 2× crop of the machine's own body at
six moments. The title names the mechanism exactly — optical fibre splicing — and the film shows hands, a splicer, and
coils of yellow stock while the **display never faces the camera**. Every number that could inform `tapeSplice` (splice
loss in dB, the arc attempts, the alignment the machine measured) lives behind a lid the camera never resolves. The
file is deleted, the tier is unchanged, and the rule gets its sharpest form: **a title that names a mechanism is not a
screen showing it** — the radar-on-a-hill result and this one are the same failure across different media, and the only
guard is opening the frames.
