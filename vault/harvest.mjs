/** Pull examples in bulk from the sources that publish structured data.
 *
 * The catalog was built by hand, one row at a time, and that is the right way to record a
 * source but the wrong way to reach a thousand instances. Two of the sources already found
 * publish their contents as data rather than as pages: Are.na answers a JSON API, and
 * Interface In Game publishes attachment sitemaps naming every screenshot it holds. Between
 * them there are several thousand entries, each already carrying a title and a link back to
 * where it came from.
 *
 * What this writes is an index, never the pictures. A row is a title, the channel or game it
 * sat in, and the URL it points at. That is the same thing the hand-written rows are, minus
 * the judgement, and the judgement is what a later pass adds on top rather than something this
 * should fake.
 *
 *   node vault/harvest.mjs ARENA=1        # every listed Are.na channel
 *   node vault/harvest.mjs IIG=1          # Interface In Game screenshot sitemaps
 *   node vault/harvest.mjs ARENA=1 IIG=1  # both, into vault/EXAMPLES.json
 *
 * Counts printed at the end are counts of what came back, not of what is any good. Nothing
 * here decides whether a block is an interface; a channel called American Retrofuturism turned
 * out to be eight hundred photographs of clothes.
 */
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const i = a.indexOf('=');
  return i < 0 ? [a, '1'] : [a.slice(0, i), a.slice(i + 1)];
}));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36';

// Verified channels, with the counts a pass actually confirmed rather than the ones repeated
// around the web. `american-retrofuturism` is deliberately absent: 813 blocks, and they are
// fashion photographs. Size is not relevance.
const CHANNELS = [
  'sci-fi-ui', 'fictional-interface', 'sci-fi-hud', 'anime-interfaces-qnbnimspwp4',
  'fui-4juwyutzzfq', 'sci-fi-control-panels', 'control-panel-machine-interface',
  'terminal-ruins', 'software-cyberdeck', 'digital-interfaces-dos-hud', 'hud-fui-design',
  'fui-blefelchw6s', 'ui-and-hud', 'cockpit', 'human-computer-interface-soztjwama18',
  'whitehat-infosec-service-uis',
  'hacker-exploit-kit-uis-security-tools-promotional-imagery',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function arena () {
  const out = [];
  for (const slug of CHANNELS) {
    let page = 1;
    let title = slug;
    for (;;) {
      const url = `https://api.are.na/v2/channels/${slug}/contents?per=100&page=${page}`;
      let body;
      try {
        const res = await fetch(url, { headers: { 'User-Agent': UA } });
        if (!res.ok) { console.log(`  ${slug} p${page} -> HTTP ${res.status}, stopping`); break; }
        body = await res.json();
      } catch (e) { console.log(`  ${slug} p${page} -> ${e.message}`); break; }
      const items = body.contents || [];
      if (!items.length) break;
      for (const b of items) {
        // A block's own title is often a production filename, which is the useful part --
        // `Avengers_Fury_Monitor_Screen_Graphics_battleMode` names a screen and its state.
        const name = b.title || b.generated_title || '';
        const src = b.source?.url || b.image?.original?.url || null;
        if (!name && !src) continue;
        out.push({ from: 'are.na', set: slug, title: name.slice(0, 200),
          kind: b.class, source: src });
      }
      if (items.length < 100) break;
      page += 1;
      await sleep(350);              // their API is free and answering; do not hammer it
    }
    console.log(`  ${slug}: ${out.filter((o) => o.set === slug).length}`);
    await sleep(350);
  }
  return out;
}

async function iig () {
  const out = [];
  const idx = await (await fetch('https://interfaceingame.com/sitemap_index.xml',
    { headers: { 'User-Agent': UA } })).text();
  const maps = [...idx.matchAll(/<loc>([^<]*attachment-sitemap[^<]*)<\/loc>/g)].map((m) => m[1]);
  console.log(`  ${maps.length} attachment sitemaps`);
  for (const m of maps) {
    try {
      const xml = await (await fetch(m, { headers: { 'User-Agent': UA } })).text();
      // These sitemaps carry no image titles at all -- the first version of this looked for
      // <image:title> and <image:loc> and harvested seventeen thousand rows with no game and no
      // name on any of them. An unlabelled URL is not an example; it is a URL. The label is in
      // the slug: /screenshots/assassins-creed-valhalla-warden-of-war/ names the game and the
      // screen in one string, which is the whole reason this source is worth harvesting.
      for (const loc of [...xml.matchAll(/<loc>([^<]+screenshots\/[^<]+)<\/loc>/g)].map((m) => m[1])) {
        const slug = loc.match(/\/screenshots\/([^/]+)/)?.[1];
        if (!slug) continue;
        out.push({ from: 'interfaceingame', set: slug.split('-').slice(0, 3).join('-'),
          title: slug.replace(/-/g, ' '), kind: 'screenshot', source: loc });
      }
    } catch (e) { console.log(`  ${m} -> ${e.message}`); }
    await sleep(300);
  }
  return out;
}

const dest = join(HERE, 'EXAMPLES.json');
const have = existsSync(dest) ? JSON.parse(readFileSync(dest, 'utf8')) : [];
const fresh = [];
if (args.ARENA) { console.log('are.na'); fresh.push(...await arena()); }
if (args.IIG) { console.log('interface in game'); fresh.push(...await iig()); }
if (!fresh.length) { console.error('harvest.mjs needs ARENA=1 and/or IIG=1'); process.exit(2); }

const seen = new Set(have.map((r) => `${r.from}|${r.set}|${r.source}|${r.title}`));
const merged = have.concat(fresh.filter((r) => {
  const k = `${r.from}|${r.set}|${r.source}|${r.title}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
}));
writeFileSync(dest, JSON.stringify(merged, null, 1));
const bySet = merged.reduce((a, r) => (a[r.from] = (a[r.from] || 0) + 1, a), {});
console.log(`\n${merged.length} examples indexed (${JSON.stringify(bySet)}) -> ${dest}`);
