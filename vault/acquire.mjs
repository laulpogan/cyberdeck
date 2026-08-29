/** The vault: real interface imagery from the works being imitated, as files on disk.
 *
 * Not descriptions of references — the pictures themselves, because the thing being
 * compared is motion, and nobody has ever closed a motion gap by reading a paragraph
 * about a stopwatch. Every file this writes was fetched from a named page and verified
 * by magic bytes and dimensions; nothing is recorded in the manifest that is not on disk
 * with those bytes.
 *
 * How a page is read: a real browser (Chromium through Playwright), because the useful
 * hosts are behind Cloudflare challenges that answer `curl` with a redirect to a
 * challenge URL, and a vault with 400-byte "images" in it would be worse than no vault.
 * Media URLs are harvested out of the live DOM rather than guessed from a scheme, and
 * each candidate is downloaded and checked before it is kept.
 *
 * Binaries stay out of git (`vault/raw/` is gitignored); `vault/MANIFEST.json` is
 * committed, because the provenance is the part another person needs and the pictures are
 * copyrighted material of other people's works — reference, not asset. Nothing in this
 * repository ever embeds a downloaded frame into the product.
 *
 *   node vault/acquire.mjs                    # everything in the plan below
 *   node vault/acquire.mjs SEED=magi,tracker  # one reference set
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';

const VAULT = new URL('../vault/', import.meta.url).pathname.replace(/\/$/, '');
const RAW = `${VAULT}/raw`;
const MANIFEST = `${VAULT}/MANIFEST.json`;
const LOG = `${VAULT}/acquire.log`;
const MAX_PER_PAGE = Number(process.env.MAX_PER_PAGE || 6);
const SEEDS = (process.env.SEED || '').split(',').map((s) => s.trim()).filter(Boolean);

/** What to fetch, and why. `moves` is the claim to be checked against the frames, not a
 * description of the picture: it says what happens over time, which is the only thing the
 * library is trying to learn. */
const PLAN = [
  { seed: 'magi', work: 'Neon Genesis Evangelion', subject: 'MAGI system conference screen',
    moves: 'three triangular cores discuss; verdict arrives after a vote, not on load',
    from: ['https://tenor.com/search/magi-evangelion-gifs', 'https://tenor.com/search/magi-system-gifs'] },
  { seed: 'insertion-sync', work: 'Neon Genesis Evangelion', subject: 'insertion sync / entry plug countdown',
    moves: 'percentage climbs in real time, warning stripes flash while a value is being measured',
    from: ['https://tenor.com/search/evangelion-insertion-sync-gifs', 'https://tenor.com/search/entry-plug-gifs'] },
  { seed: 'motion-tracker', work: 'Aliens', subject: 'M513-3 motion tracker sweep',
    moves: 'a radial sweep turns at a fixed period; a contact blip appears when the sweep passes it',
    from: ['https://tenor.com/search/aliens-motion-tracker-gifs', 'https://tenor.com/search/motion-tracker-gifs'] },
  { seed: 'rig', work: 'Dead Space', subject: 'RIG spine / stasis and kinesis',
    moves: 'spine segments fill downward as suit integrity is spent; stasis slows the world it is drawn over',
    from: ['https://tenor.com/search/dead-space-rig-gifs', 'https://tenor.com/search/dead-space-gifs'] },
  { seed: 'akira-capsule', work: 'Akira', subject: 'capsule test chamber console',
    moves: 'counters and oscilloscope traces run continuously; the number is the reading, not decoration',
    from: ['https://tenor.com/search/akira-capsule-gifs', 'https://tenor.com/search/akira-lab-gifs'] },
  { seed: 'gits-optic', work: 'Ghost in the Shell', subject: 'optic / cyberspace readouts',
    moves: 'text fields scroll and resolve; a scan line passes over data already present',
    from: ['https://tenor.com/search/ghost-in-the-shell-interface-gifs', 'https://tenor.com/search/ghost-in-the-shell-gifs'] },
  { seed: 'cyberpunk-hud', work: 'Cyberpunk 2077', subject: 'HUD: health, focus, scan',
    moves: 'damage numbers pop and decay; scan reticles snap to edges of the world',
    from: ['https://tenor.com/search/cyberpunk-2077-hud-gifs', 'https://tenor.com/search/cyberpunk-2077-scanning-gifs'] },
  { seed: 'lumon', work: 'Severance', subject: 'Lumon macrodata refinement terminal',
    moves: 'numbers settle as a choice is taken; nothing moves until the operator does',
    from: ['https://tenor.com/search/severance-lumon-gifs', 'https://tenor.com/search/severance-refinement-gifs'] },
  { seed: 'spinner', work: 'Blade Runner 2049', subject: 'spinner console and analyzer',
    moves: 'a baseline breathes; analysis lines resolve slowly under a scanning pass',
    from: ['https://tenor.com/search/blade-runner-2049-interface-gifs', 'https://tenor.com/search/blade-runner-2049-gifs'] },
  { seed: 'star-citizen', work: 'Star Citizen', subject: 'ship HUD and mining overlay',
    moves: 'compass tape, reticle states and target lock — motion belongs to the lock, not the frame',
    from: ['https://tenor.com/search/star-citizen-hud-gifs'] },
  { seed: 'tron-grid', work: 'Tron: Legacy', subject: 'identity disc and grid overlays',
    moves: 'arc segments trace themselves as a thing travels; a stalled thing stays drawn',
    from: ['https://tenor.com/search/tron-legacy-interface-gifs', 'https://tenor.com/search/tron-light-cycle-gifs'] },
  { seed: 'fake-os-loaders', work: 'progress bar 95', subject: 'fake operating systems and their loaders',
    moves: 'each fictional OS has its own progress idiom; the animation is the whole content of the screen',
    from: ['https://tenor.com/search/progressbar95-gifs', 'https://tenor.com/search/fake-os-gifs'] },
  { seed: 'generic-hud', work: 'various', subject: 'interface and HUD motion in general',
    moves: 'used only to find shapes the list above missed',
    from: ['https://tenor.com/search/hud-gifs', 'https://tenor.com/search/interface-gifs'] },
];

const IMAGE_EXT = /\.(gif|png|webp|jpe?g)(\?|$)/i;

mkdirSync(RAW, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { schema: 'cyberdeck.vault/1', files: {} };
const browser = await chromium.launch();

for (const entry of PLAN) {
  if (SEEDS.length && !SEEDS.includes(entry.seed)) continue;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const source of entry.from) {
    const candidates = await harvest(page, source);
    let kept = 0;
    for (const url of candidates) {
      if (kept >= MAX_PER_PAGE) break;
      const record = await store(url, source, entry);
      if (record) { kept += 1; }
    }
    log(`${entry.seed} · ${source} · ${candidates.length} candidates, kept ${kept}`);
  }
  await ctx.close();
}

await browser.close();
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\nvault holds ${Object.keys(manifest.files).length} verified files — ${MANIFEST}`);

/** Ask the live page for its media URLs.
 *
 * Everything is read from the DOM after scripts have run, which is also where lazy
 * loading is forced: scrolling once to the bottom is what makes a host's own code fetch
 * the media, so a page that hands back 4 images when you scroll and 0 when you do not is
 * not silently counted as an empty source.
 */
async function harvest(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);
    for (let i = 0; i < 4; i += 1) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(600);
    }
    const found = await page.evaluate(() => {
      const urls = new Set();
      for (const img of document.querySelectorAll('img, source')) {
        const src = img.currentSrc || img.src || img.srcset?.split(' ')[0] || '';
        if (src) urls.add(src);
      }
      for (const node of document.querySelectorAll('[data-src], [data-gif-src], video source')) {
        if (node.dataset && (node.dataset.src || node.dataset.gifSrc)) urls.add(node.dataset.src || node.dataset.gifSrc);
      }
      return [...urls];
    });
    return found.filter((u) => IMAGE_EXT.test(u) && !/avatar|icon|logo|ads|pixel|spacer|emoji/i.test(u));
  } catch (error) {
    log(`FAILED to read ${url}: ${String(error).slice(0, 120)}`);
    return [];
  }
}

async function store(url, source, entry) {
  const extension = ((url.match(IMAGE_EXT) || [])[1] || 'gif').split('?')[0];
  // The slug is the URL's own tail and usually already ends in the extension, so appending
  // it again gives `magi-system-magi.gif.gif`. A name nobody reads except the manifest is
  // still a name nobody should have to explain.
  const slug = url.replace(/^https?:\/\//, '').replace(/[^\w.-]+/g, '_').slice(-70)
    .replace(new RegExp(`\\.${extension}$`, 'i'), '');
  const key = `${entry.seed}--${slug}.${extension}`;
  const path = `${RAW}/${key}`;
  if (manifest.files[key] && existsSync(path)) return manifest.files[key];

  let body;
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0', referer: source } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    body = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    log(`  refused ${url.slice(0, 90)}: ${String(error).slice(0, 60)}`);
    return null;
  }

  const kind = sniff(body);
  if (!kind) { log(`  not an image: ${url.slice(0, 90)} (${body.length} bytes, magic ${body.subarray(0, 4).toString('hex')})`); return null; }
  if (body.length < 4096) { log(`  too small to be a real frame: ${url.slice(0, 90)} (${body.length}B)`); return null; }

  writeFileSync(path, body);
  const record = {
    file: `raw/${key}`,
    kind,
    bytes: body.length,
    sha1: createHash('sha1').update(body).digest('hex').slice(0, 16),
    mediaUrl: url,
    sourcePage: source,
    work: entry.work,
    subject: entry.subject,
    moves: entry.moves,
    seed: entry.seed,
    retrievedAt: new Date().toISOString(),
  };
  manifest.files[key] = record;
  return record;
}

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
