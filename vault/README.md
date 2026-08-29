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
| YouTube clip harvest (planned `vault/clip.mjs`) | search works (`yt-dlp "ytsearch…"` returns titles and durations) | **media download is refused from this network**: `HTTP Error 403` on the plain client, `The page needs to be reloaded.` on the `tv` client. Two distinct client failures, so the path is not a flag away | blocked here; needs browser cookies or another host |
| Internet Archive (`advancedsearch.php` + `metadata/`) | ✓ queries and direct file downloads both answer | its index points at ROMs, game builds and let's-play videos; a `ftl+faster+than+light+gameplay` query returned a ZX Spectrum tape, a Stellaris video and a GOG installer, not one HUD recording | reachable but not yet productive; the query, not the host, is the problem |

Why the distinction matters: a diegetic interface that FILLS the frame is what a motion spec can
be read off. GIF hosts index the character holding the screen, mission footage indexes the rocket,
and the panel is a wedge in the corner of the shot. The verified corpus today (7 of 51 components
quoted in `SPECS-FOR.json`, see `vault/MAPPING.md`) is not a ranking failure — `vault/rank.py`
already puts the likeliest files first, and the likeliest files are stormtroopers.
