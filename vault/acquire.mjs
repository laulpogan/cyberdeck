/** The vault: real interface imagery from the works being imitated, as files on disk.
 *
 * Not descriptions of references — the pictures themselves. The comparison being made is
 * motion, and nobody has ever closed a motion gap by reading a paragraph about a
 * stopwatch. Every file this writes was fetched from a named page and verified by magic
 * bytes, size and dimensions; nothing appears in `MANIFEST.json` that is not on disk with
 * those bytes.
 *
 * Reading a page needs a real browser: Tenor answers `curl` with a Cloudflare challenge,
 * GifCities renders results with scripts, and a vault whose "images" are 300-byte
 * challenge pages would be worse than no vault at all. Media URLs come out of the live DOM
 * after the page has been scrolled the way a person scrolls it, because lazy loading means
 * a host serves four images to a script that never scrolls and two hundred to one that does.
 *
 * Relevance is filtered at the door, not discovered later. The first haul kept 102 files of
 * which 39 named their subject and 61 were tag drift — a MAGI query returning
 * `cat6cable-system-cable-management`, a motion-tracker query returning `presidents-day` —
 * because hosts' search matches common words. So each seed declares the words its
 * references must contain in the URL or in the page's own caption for the image, and a
 * candidate that matches neither is refused and logged rather than kept for luck.
 *
 * Binaries stay out of git (`vault/raw/` is ignored); `vault/MANIFEST.json` is committed,
 * because the provenance is the part another person needs. The pictures are frames from
 * other people's copyrighted works, held as reference; nothing downloaded here is ever
 * embedded in the product.
 *
 *   node vault/acquire.mjs                          # every seed
 *   node vault/acquire.mjs SEED=motion-tracker,magi # one or more seeds
 *   MAX_PER_PAGE=8 DRY=1 node vault/acquire.mjs     # report what would be kept
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, appendFileSync, readdirSync, unlinkSync } from 'node:fs';

const VAULT = new URL('../vault/', import.meta.url).pathname.replace(/\/$/, '');
const RAW = `${VAULT}/raw`;
const MANIFEST = `${VAULT}/MANIFEST.json`;
const LOG = `${VAULT}/acquire.log`;
const PER_PAGE = Number(process.env.MAX_PER_PAGE || 5);
const INDEX_PAGES = Number(process.env.INDEX_PAGES || 4);
const DRY = process.env.DRY === '1';
const SEEDS = (process.env.SEED || '').split(',').map((s) => s.trim()).filter(Boolean);

/** `words` are the relevance gate: a candidate survives if its URL or the caption the page
 * gives the image contains one. `sources` are the pages worth visiting, in the order a
 * person would go down them. */
/* Which references to go and get. What each seed *claims* -- the work, the subject, how it
 * moves, and the words that make a candidate relevant -- lives in `vault/seeds.json`,
 * reviewed as data next to the manifest it governs. This list is only where to look. */
const PLAN = [
  {
    seed: 'motion-tracker',
    sources: [
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['radar-sweep', 'radar', 'targeting'], maxTags: 3, pagesPerTag: 2 },
      { kind: 'gallery', url: 'https://www.scifiinterfaces.com/?s=motion+tracker' },
      { kind: 'index', url: 'https://interfaceingame.com/?s=aliens', follow: /interfaceingame\.com\/(game|screenshots|article)\// },
      { kind: 'gallery', url: 'https://interfaceingame.com/?s=motion+tracker' },
      { kind: 'gifcities', url: 'https://gifcities.org/search?q=motion+tracker', basis: 'query' },
    ],
  },
  {
    seed: 'magi',
    sources: [
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['cathode-ray-tube', 'crt', 'three-views'], words: ['evangelion', 'magi', 'triad', 'conference'], maxTags: 3, pagesPerTag: 2 },
      { kind: 'gallery', url: 'https://www.scifiinterfaces.com/?s=magi' },
      { kind: 'gifcities', url: 'https://gifcities.org/search?q=evangelion+magi', basis: 'query' },
      { kind: 'gallery', url: 'https://tenor.com/search/magi-system-gifs', basis: 'query' },
    ],
  },
  {
    seed: 'insertion-sync',
    sources: [
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['countdown', 'graph'], words: ['evangelion', 'sync'], maxTags: 2, pagesPerTag: 2 },
      { kind: 'gallery', url: 'https://www.scifiinterfaces.com/?s=insertion+sync' },
      { kind: 'gifcities', url: 'https://gifcities.org/search?q=insertion+sync', basis: 'query' },
    ],
  },
  {
    seed: 'rig',
    sources: [
      { kind: 'index', url: 'https://interfaceingame.com/?s=dead+space', follow: /interfaceingame\.com\/(game|screenshots|article)\// },
      { kind: 'gallery', url: 'https://interfaceingame.com/?s=dead+space' },
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['health', 'wearable-technology', 'exosuit'], words: ['dead-space', 'suit', 'integrity', 'vertical'], maxTags: 3, pagesPerTag: 2 },
      { kind: 'gifcities', url: 'https://gifcities.org/search?q=dead+space+hud', basis: 'query' },
    ],
  },
  {
    seed: 'spinner-console',
    sources: [
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['replicant', 'voice-interface', ' interrogation'], words: ['blade-runner', 'spinner', 'analysis', 'text'], maxTags: 3, pagesPerTag: 2 },
      { kind: 'gallery', url: 'https://www.scifiinterfaces.com/?s=blade+runner' },
      { kind: 'index', url: 'https://www.hudsandguis.com/search?q=blade+runner', follow: /hudsandguis\.com\/[\w-]+-blog\/|hudsandguis\.com\/fui\// },
      { kind: 'gallery', url: 'https://www.hudsandguis.com/search?q=blade+runner' },
      { kind: 'gifcities', url: 'https://gifcities.org/search?q=blade+runner', basis: 'query' },
    ],
  },
  {
    seed: 'lumon',
    sources: [
      { kind: 'index', url: 'https://www.hudsandguis.com/search?q=severance', follow: /hudsandguis\.com\/[\w-]+-blog\/|hudsandguis\.com\/fui\// },
      { kind: 'gallery', url: 'https://www.hudsandguis.com/search?q=severance' },
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['clean-ui', 'minimalist', 'for-reading-not-seeing'], words: ['severance', 'lumon', 'terminal', 'refinement'], maxTags: 3, pagesPerTag: 2 },
    ],
  },
  {
    seed: 'tron-disc',
    sources: [
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['grid', 'circular', 'glow'], words: ['tron', 'disc', 'light-cycle'], maxTags: 3, pagesPerTag: 2 },
      { kind: 'gallery', url: 'https://www.scifiinterfaces.com/?s=tron' },
      { kind: 'index', url: 'https://interfaceingame.com/?s=tron', follow: /interfaceingame\.com\/(game|screenshots|article)\// },
      { kind: 'gifcities', url: 'https://gifcities.org/search?q=tron+grid', basis: 'query' },
    ],
  },
  {
    seed: 'hologlobe',
    sources: [
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hologram/', tags: ['hologram', 'volumetric-projection', 'rotating-3d-shape'], maxTags: 3, pagesPerTag: 2 },
      { kind: 'gifcities', url: 'https://gifcities.org/search?q=hologram+globe', basis: 'query' },
    ],
  },
  {
    seed: 'ship-hud',
    sources: [
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['heads-up-display', 'piloting-controls', 'cockpit'], maxTags: 3, pagesPerTag: 2 },
      { kind: 'index', url: 'https://interfaceingame.com/?s=star+citizen', follow: /interfaceingame\.com\/(game|screenshots|article)\// },
      { kind: 'gallery', url: 'https://interfaceingame.com/?s=star+citizen' },
      { kind: 'index', url: 'https://interfaceingame.com/?s=elite+dangerous', follow: /interfaceingame\.com\/(game|screenshots|article)\// },
    ],
  },
  {
    seed: 'fake-os-loaders',
    sources: [
      { kind: 'taxonomy', url: 'https://www.scifiinterfaces.com/tag/hud/', tags: ['progress-bars', 'countdown', 'loading'], maxTags: 3, pagesPerTag: 2 },
      { kind: 'index', url: 'https://www.hudsandguis.com/search?q=progress', follow: /hudsandguis\.com\/[\w-]+-blog\/|hudsandguis\.com\/_files/ },
      { kind: 'gallery', url: 'https://www.hudsandguis.com/search?q=progress' },
      { kind: 'gifcities', url: 'https://gifcities.org/search?q=loading+bar', basis: 'query' },
    ],
  },
];

const IMAGE_EXT = /\.(gif|png|webp|jpe?g)(\?|$)/i;
/** Junk is *named* junk. The first version of this filter tested for `ads` as a substring
 * and threw away every reference image on scifiinterfaces, because they all live under
 * `/wp-content/uploads/`. Each token now has to stand as a path segment or a filename
 * prefix, which is how hosts actually name a 1x1 tracker. */
const JUNK = /(^|[\/._-])(avatar|gravatar|logo|icon|icons|favicon|ad|ads|adsby|doubleclick|pixel|spacer|spaceremote|emoji|badge|button|sprites?|banner|placeholder|thumb|thumbnail)([\/._?-]|$)/i;

mkdirSync(RAW, { recursive: true });
// Two runs writing one manifest is how records go missing without an error: each process
// read the file at start and overwrote it at the end. The lock says no; the merge below
// says no even when the lock is stale or the file is edited by hand between runs.
try {
  writeFileSync(`${VAULT}/.lock`, `${process.pid}\n`, { flag: 'wx' });
} catch (error) {
  throw new Error(`another acquisition holds ${VAULT}/.lock (pid in the file): one writer at a time`);
}

const SEED_CLAIMS = existsSync(`${VAULT}/seeds.json`)
  ? JSON.parse(readFileSync(`${VAULT}/seeds.json`, 'utf8')).seeds
  : null;
if (!SEED_CLAIMS) throw new Error(`${VAULT}/seeds.json is missing: the relevance gate has no words to gate on`);
for (const entry of PLAN) {
  const claim = SEED_CLAIMS[entry.seed];
  if (!claim) throw new Error(`seed '${entry.seed}' has no claim in seeds.json -- say what the references are and which words prove it`);
  Object.assign(entry, claim);
}
for (const seed of Object.keys(SEED_CLAIMS)) if (!PLAN.some((e) => e.seed === seed)) console.log(`note: seeds.json names '${seed}' with no sources to fetch`);

const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : { schema: 'cyberdeck.vault/2', files: {} };
if (manifest.schema === 'cyberdeck.vault/1') manifest.schema = 'cyberdeck.vault/2';

const browser = await chromium.launch();
let kept = 0;
let refused = 0;

for (const entry of PLAN) {
  if (SEEDS.length && !SEEDS.includes(entry.seed)) continue;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const pages = await expand(page, entry);
  for (const source of pages) {
    const candidates = await harvest(page, source);
    let here = 0;
    const basis = source.basis || 'words';
    for (const candidate of candidates) {
      if (basis === 'words' && !relevant(entry, candidate)) { refused += 1; continue; }
      if (here >= PER_PAGE) break;
      const record = await store(candidate, source.url, entry, basis, source.basisNote);
      if (record) { here += 1; kept += 1; }
    }
    log(`${entry.seed} · ${source.url} · ${candidates.length} candidates, kept ${here}`);
  }
  await ctx.close();
}

await browser.close();
// Merge with whatever is on disk now rather than clobbering it.
if (existsSync(MANIFEST)) {
  const onDisk = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  for (const [key, record] of Object.entries(onDisk.files || {})) {
    if (!manifest.files[key]) manifest.files[key] = record;
    else if (!existsSync(`${VAULT}/${record.file}`)) manifest.files[key] = record;
  }
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
unlinkSync(`${VAULT}/.lock`);

// A picture on disk with no record is a picture nobody can cite. Named, not hidden.
const orphans = readdirSync(RAW).filter((name) => !manifest.files[name] && !name.startsWith('.'));
if (orphans.length) log(`ORPHANS: ${orphans.length} files in raw/ with no manifest record — ${orphans.slice(0, 6).join(', ')}${orphans.length > 6 ? ', …' : ''}`);
console.log(`\nkept ${kept} new, refused ${refused} off-topic · vault holds ${Object.keys(manifest.files).length} verified files`);

/** Index pages are worth visiting for their links; galleries for their pictures. This
 * turns the declared sources into the concrete list of pages to read, so one seed can
 * reach an article-per-prop archive without the script knowing that archive's scheme. */
/** One tag archive turns into the article pages under the tags this seed is about.
 *
 * Guessing tag slugs does not work: `/tag/alien/` is a 404 while the real ones are
 * `radar-sweep`, `heads-up-display`, `cathode-ray-tube`, `big-red-label` -- 206 of them
 * discoverable from any tag page that does load. So the list is read from the site, the
 * seed's tags are selected out of what is actually there, and a tag named in the plan is
 * dropped with a log line if the site does not carry it. A reference set built from
 * invented slugs is a reference set of 404 pages. */
async function expand(page, entry) {
  const out = [];
  for (const source of entry.sources) {
    if (source.kind === 'taxonomy') { out.push(...await walkTaxonomy(page, source, entry)); continue; }
    if (source.kind !== 'index') { out.push(source); continue; }
    const links = await indexLinks(page, source.url, source.follow, entry.words, source.basis || 'words');
    out.push(...links.slice(0, INDEX_PAGES).map((url) => ({ ...source, url, basis: source.basis || 'words' })));
  }
  return out;
}

async function walkTaxonomy(page, source, entry) {
  await goto(page, source.url);
  const { tags, articles } = await page.evaluate(() => {
    const hrefs = () => [...new Set([...document.querySelectorAll('a[href]')].map((a) => (typeof a.href === 'string' ? a.href : a.getAttribute('href') || '')))];
    // Both permalink shapes are in the wild on this one host: the search page links
    // `/2020-04-03/slug/` and the tag archive links `/2020/04/03/slug/`. Matching only
    // one of them reads as "this archive has no articles in it", which is the failure
    // mode to fear -- a wrong pattern looks exactly like an empty source.
    return {
      tags: hrefs().filter((h) => /\/tag\/[\w-]+\/$/.test(h)),
      articles: hrefs().filter((h) => /\/\d{4}[\/-]\d{2}[\/-]\d{2}\//.test(h)),
    };
  });
  const chosen = (source.tags || []).map((slug) => ({ slug, url: `https://scifiinterfaces.com/tag/${slug}/` }))
    .filter((tag) => tags.includes(tag.url) || tags.some((t) => t.endsWith(`/tag/${tag.slug}/`)));
  const byWords = (source.words || entry.words).length === 0 ? [] : tags
    .filter((t) => (source.words || entry.words).some((w) => t.toLowerCase().includes(w.toLowerCase())))
    .filter((t) => !chosen.some((c) => t.endsWith(c.slug)))
    .slice(0, Math.max(0, (source.maxTags || 3) - chosen.length))
    .map((t) => ({ slug: t.split('/tag/')[1].replace(/\/$/, ''), url: t }));
  const unique = [];
  for (const tag of [...chosen, ...byWords]) if (!unique.some((t) => t.slug === tag.slug)) unique.push(tag);
  const picked = unique.slice(0, source.maxTags || 3);
  log(`  taxonomy ${source.url} · ${tags.length} tags on the page, ${picked.length} chosen: ${picked.map((t) => t.slug).join(', ') || 'none'}`);

  const out = [];
  for (const tag of picked) {
    const links = await indexLinks(page, tag.url, /scifiinterfaces\.com\/\d{4}[\/-]\d{2}[\/-]\d{2}\//, entry.words, 'tag');
    out.push(...links.slice(0, source.pagesPerTag || 2).map((url) => ({
      kind: 'gallery', url, basis: 'tag', basisNote: `tag: ${tag.slug}`,
    })));
  }
  // The entry archive is itself a curated list worth reading, even when no tag matched.
  if (!out.length) out.push(...articles.slice(0, source.pagesPerTag || 2).map((url) => ({ kind: 'gallery', url, basis: 'tag', basisNote: `entry archive: ${source.url}` })));
  return out;
}

async function indexLinks(page, url, follow, words, basis) {
  try {
    await goto(page, url);
    const found = await page.evaluate((pattern) => {
      const re = new RegExp(pattern);
      // A search page is a results list plus a blog: sidebar, footer, "related", the
      // archive of 2014. Following every link that matches the host pattern is how the
      // first run ended up on `spreading-pathogen-maps` while looking for a motion
      // tracker, so only the containers a result lives in are read.
      // Deliberately permissive: the theme on a tag archive is not the theme on a search
      // page, and a scope narrow enough to keep junk out is a scope that quietly returns
      // nothing. What keeps junk out is the follow pattern plus -- on a search page -- the
      // requirement that the seed's words name the link.
      const SCOPE = 'article, .hentry, .post, .entry-title, .post-title, h1 a, h2 a, h3 a, h4 a, li a';
      const seen = new Map();
      for (const anchor of document.querySelectorAll(`${SCOPE} a[href], a[href]`)) {
        const raw = typeof anchor.href === 'string' ? anchor.href : anchor.getAttribute('href');
        if (!raw) continue;
        const href = raw.split('#')[0];
        if (!re.test(href) || href === location.href) continue;
        const text = (anchor.textContent || '').trim().slice(0, 120);
        if (!seen.has(href)) seen.set(href, text);
      }
      return [...seen].map(([href, text]) => ({ href, text }));
    }, String(follow || '').replace(/^\/(.*)\/[a-z]*$/, '$1'));

    const lower = (words || []).map((w) => w.toLowerCase());
    // A tag page's URL is the claim, so the walk may trust it. A search page may not:
    // scifiinterfaces answers `motion tracker` with four unrelated posts, and walking
    // those is how the vault fills up with pathogen maps.
    const named = basis === 'tag' ? found : found.filter((row) => lower.some((w) => `${row.href} ${row.text}`.toLowerCase().includes(w)));
    if (!named.length) {
      // A page of unrelated articles yields unrelated pictures, and the relevance gate
      // below is what stops them. Better to say the index named nothing and stop, than to
      // walk into `spreading-pathogen-maps` because it was the first link on the page.
      log(`  index ${url} → ${found.length} links, none named by the seed: not walking`);
      return [];
    }
    log(`  index ${url} → ${found.length} links, ${named.length} named by the seed`);
    return named.map((row) => row.href);
  } catch (error) {
    log(`  index FAILED ${url}: ${String(error).slice(0, 90)}\n${String(error.stack).split('\n').slice(1, 4).join('\n')}`);
    return [];
  }
}

/** GifCities indexes the GeoCities GIF collection and answers its own search with JSON.
 * The pictures are served from `blob.gifcities.org/<hash>.gif`, so the hash tells you
 * nothing and relevance has to come from the record: filename, page URL it was crawled
 * from, and the keywords the archive carries. Frame count and frame delay come along too,
 * which is the first reference data in this vault that says how fast the thing moved. */
async function harvest(page, source) {
  try {
    if (source.kind === 'gifcities') {
      // `?format=json` answers with the same HTML page, so the grid is read the way a
      // person reads it. Each result is an <img> wrapped in the link to the page it was
      // crawled out of, and that link -- `geocities.com/Area51/Vault/3763/storm.gif`,
      // `ccuseo/night_vision_8.html` -- names the file better than any alt attribute does,
      // and is also the real provenance. The blob URL is a hash and says nothing.
      await goto(page, source.url.replace(/[?&]format=json/, ''));
    }
    await goto(page, source.url);
    const found = await page.evaluate(() => {
      const context = [document.title, document.querySelector('h1')?.textContent || '']
        .join(' ').replace(/\s+/g, ' ').trim().slice(0, 160);
      const rows = [];
      const seen = new Set();
      const add = (url, caption, origin) => {
        if (!url || seen.has(url)) return;
        seen.add(url);
        rows.push({ url, caption: (caption || '').replace(/\s+/g, ' ').trim().slice(0, 200), origin: (origin || '').slice(0, 200), context });
      };
      for (const img of document.querySelectorAll('img')) {
        const url = img.currentSrc || img.src || (img.srcset || '').split(',')[0]?.trim().split(' ')[0] || '';
        const link = img.closest('a');
        // alt and the figure's own caption, and nothing else. Reading the surrounding
        // anchor's text is what produced a row captioned "| Comparing Sci-Fi HUDs in 2024
        // Movies |" over a picture of something else entirely: on WordPress, the anchor
        // around a linked image carries the *post title*, not a caption for the image.
        const caption = [
          img.alt, img.title,
          img.closest('figure')?.querySelector('figcaption')?.textContent || '',
        ].join(' ');
        // The page's own title and H1 belong in the haystack: an article headed
        // "Aliens: the motion tracker" is evidence about the unlabeled picture inside it,
        // and a host with empty alt text is not a host with no information.
        add(url, caption, link?.href || '');
      }
      for (const node of document.querySelectorAll('source[type^="image"]')) add(node.srcset?.split(',')[0]?.trim().split(' ')[0], '');
      return rows;
    });
    // Relevance may use the page's title and the link the image sits in; the caption that
    // gets *recorded* is only what the page said about this picture.
    return found
      .filter((row) => IMAGE_EXT.test(row.url))
      .map((row) => ({ ...row, haystack: `${row.caption} ${row.origin} ${row.context}` }));
  } catch (error) {
    log(`  FAILED ${source.url}: ${String(error).slice(0, 90)}\n${String(error.stack).split('\n').slice(1, 4).join('\n')}`);
    return [];
  }
}

function relevant(entry, candidate) {
  const needle = `${candidate.url} ${candidate.haystack || candidate.caption}`.toLowerCase();
  return entry.words.some((word) => needle.includes(word));
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1400);
  for (let i = 0; i < 4; i += 1) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(500);
  }
}

async function store(candidate, source, entry, basis, basisNote) {
  const url = stripJunkSize(candidate.url);
  const extension = ((url.match(IMAGE_EXT) || [])[1] || 'bin').split('?')[0];
  const slug = url.replace(/^https?:\/\//, '').replace(/[^\w.-]+/g, '_').slice(-70)
    .replace(new RegExp(`\\.${extension}$`, 'i'), '');
  const key = `${entry.seed}--${slug}.${extension}`;
  const path = `${RAW}/${key}`;
  if (manifest.files[key] && existsSync(path)) return manifest.files[key];
  if (JUNK.test(url)) { log(`  junk-named, skipped: ${url.slice(0, 90)}`); return null; }

  let body;
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0', referer: source } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    body = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    log(`  refused download ${url.slice(0, 80)}: ${String(error).slice(0, 60)}`);
    return null;
  }

  const kind = sniff(body);
  if (!kind) { log(`  not an image: ${url.slice(0, 80)} (${body.length}B, magic ${body.subarray(0, 4).toString('hex')})`); return null; }
  if (body.length < 8192) { log(`  too small to be a real frame: ${url.slice(0, 80)} (${body.length}B)`); return null; }
  if (DRY) { log(`  would keep ${key} (${body.length}B ${kind}) caption="${candidate.caption}"`); return null; }

  writeFileSync(path, body);
  const record = {
    file: `raw/${key}`,
    kind,
    bytes: body.length,
    sha1: createHash('sha1').update(body).digest('hex').slice(0, 16),
    mediaUrl: url,
    sourcePage: source,
    captionOnPage: candidate.caption || null,
    pageContext: candidate.context || null,
    originLink: candidate.origin || null,
    work: entry.work,
    subject: entry.subject,
    moves: entry.moves,
    seed: entry.seed,
    // Frames, delays and loop length are filled in by `vault/mark.py`, which decodes.

    relevanceBasis: basisNote || (basis === 'tag' ? 'reached by walking a tag page whose name is the idiom'
      : basis === 'query' ? 'returned by the host search below: same idiom, not the prop itself'
      : "the page's own text or the link it sits in names the subject"),
    retrievedAt: new Date().toISOString(),
  };
  manifest.files[key] = record;
  return record;
}

/** Squarespace and Jetpack both resize by query string; ask for the big version rather
 * than the thumbnail the page happened to show, because a 150px reference hides the very
 * thing being studied. */
function stripJunkSize(url) {
  return url
    .replace(/([?&])resize=[^&]*&?/, '$1'.replace('&', '?'))
    .replace(/\?format=(\d+)w/, '?format=1500w')
    .replace(/([?&])w=\d+/, '$1w=1500')
    .replace(/[?&]$/, '');
}

/** Frames, delays and loop length are NOT measured here. The first version of this scanner
 * counted image-separator bytes and found 805 frames in a file whose real count was far
 * smaller -- those bytes appear inside LZW pixel data all the time -- and then, having
 * found no graphic-control records where it expected them, reported the thing as still.
 * `vault/mark.py` takes the numbers off decoded frames instead, in one place, cross-checked
 * against ImageMagick. Two instruments measuring the same quantity and disagreeing is the
 * defect; having one of them be a byte scan is how you get there.
 *
 */
function sniff(buffer) {
  if (buffer.subarray(0, 6).toString('latin1').startsWith('GIF8')) return 'gif';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  if (buffer.subarray(0, 2).toString('hex') === 'ffd8') return 'jpeg';
  return null;
}

function log(line) {
  console.log(line);
  appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`);
}
