# The vault

Real interface imagery from the works the library is imitating, as files on disk — not
descriptions of them. The comparison being made is motion, and motion cannot be closed by
reading a paragraph about a stopwatch.

## What is here

- `acquire.mjs` — fetches each reference set from a named page in a real browser, harvests
  the media URLs out of the live DOM, downloads them, and keeps a file only if it is a real
  image by magic bytes and larger than 4 KiB. Tenor answers `curl` with a redirect to a
  Cloudflare challenge; a vault whose "images" are 300-byte challenge pages would be worse
  than no vault, so the harvest runs in Chromium with the page scrolled the way a person
  scrolls it.
- `MANIFEST.json` — one record per kept file: media URL, source page, work, subject, the
  *claim about how it moves* that the frames will be read against, `sha1`, bytes, kind, and
  `retrievedAt`. Committed.
- `raw/` — the binaries. **Gitignored.** These are frames from other people's copyrighted
  works, held as reference; nothing downloaded here is ever embedded in the product.
- `acquire.log` — every page read, how many candidates it offered, how many were kept, and
  what was refused.

`MAX_PER_PAGE=4 node vault/acquire.mjs SEED=magi,rig` runs one set; without `SEED` it runs
the plan in `acquire.mjs`.

## What it measured on the first run — read this before using any file

`MANIFEST.json` currently holds **100 files** (48 GIFs, 52 WebP). They are genuine
images with honest provenance. They are **not yet a reference set**:

- **39 of 100** carry a slug that names their seed's subject. **61 are tag drift** — Tenor's
  search is fuzzy on common words, so a `magi` query returns `cat6cable-system-cable-management`,
  an `insertion-sync` query returns `dexters-laboratory` and `champion-black-belter`, and a
  `motion-tracker` query returns `presidents-day`. Reading motion specs out of those would
  put lies into the mapping, so the drift is measured and recorded here rather than left to
  be noticed mid-comparison.
- The WebP entries are largely preview variants of the same GIFs, so the vault holds about
  fifty distinct moving references, not a hundred.
- GIF frame counts: median 34, range 1–101. A 1-frame "GIF" is a still and is useless here.
- Filenames came out with a doubled extension (`…gif.gif`): the slug already carried it.
  Fixed in the writer, not retro-renamed; nothing reads the names except the manifest.

## What it needs before it is a reference set

1. A per-seed allowlist of work/subject words, applied at harvest, so a page's fuzzy
   matches are dropped at the door. The 61 drifted files stay in the log, out of the set.
2. Hosts that curate. In priority order, from the two search-council runs (union of 47 and
   12 URLs, `diversity_ratio` 1.47):
   `interfaceingame.com` and `gameui.net` (per-game HUD screens), `hudsandguis.com`,
   `scifiinterfaces.com` (it names the exact props: Aliens M513-3 motion tracker, F-16
   standby power instrument panel, Tron: Legacy identity disc, Minority Report globus),
   `gifcities.org` and `archive.org` metadata APIs (real GIF binaries, stable URLs),
   sakugabooru (curated animation tags; needs the browser, its JSON endpoint answers
   `curl` with a challenge), `fui.arden.nl`, `uwarp.design/huds-and-guis`, studio portfolios
   — Territory Studio (Blade Runner 2049), Perception, Praxinos, Ash Thorp.
3. Frame extraction into contact sheets, so a reference is *seen* moving and the app's
   filmstrip can be pasted underneath it in the same image.

The second council run named the blind spots it could see: anime-specific UI archives,
Tumblr and Imgur hosts where hand-cut HUD GIF sets actually live, Evageeks-style per-title
wikis, Are.na channels, and the distinction — which this vault has to respect — between
pages that serve real `.gif` binaries and pages that embed an MP4 behind the word "GIF".
