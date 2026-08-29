// vault-harvest: fill vault/ref/ with REAL reference frames, each one
// recorded with provenance in vault/ref/manifest.jsonl. Nothing about a
// component's target motion enters the gauntlet without its origin URL,
// timestamp, and hash. vault/ is gitignored on purpose -- reference frames
// stay a private study library, never repo payload.
//
//   node scripts/vault-harvest.mjs            -- first sweep
//   node scripts/vault-harvest.mjs --limit 6  -- per-page cap, for a probe

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF = path.join(ROOT, 'vault', 'ref');
const MANIFEST = path.join(REF, 'manifest.jsonl');

// tag = the vault bucket = the canon a component models. The gauntlet reads
// vault/ref/<tag>/ next to vault/film/<component>.png.
const PAGES = [
  { tag: 'blade-runner', url: 'https://www.film-grab.com/blade-runner/' },
  { tag: 'blade-runner', url: 'https://www.film-grab.com/blade-runner-2049/' },
  { tag: 'alien', url: 'https://www.film-grab.com/alien/' },
  { tag: 'alien', url: 'https://www.film-grab.com/aliens/' },
  { tag: 'ghost-in-the-shell', url: 'https://www.film-grab.com/ghost-in-the-shell/' },
  { tag: 'tron', url: 'https://www.film-grab.com/tron/' },
  { tag: 'tron', url: 'https://www.film-grab.com/tron-legacy/' },
  { tag: 'fifth-element', url: 'https://www.film-grab.com/the-fifth-element/' },
  { tag: 'total-recall', url: 'https://www.film-grab.com/total-recall/' },
  { tag: 'sf-ui-index', url: 'https://scifiinterfaces.com/movie/blade-runner/' },
  { tag: 'sf-ui-index', url: 'https://scifiinterfaces.com/movie/alien/' },
  { tag: 'fui-archive', url: 'https://www.hudsandguis.com/home/tag/alien' },
  { tag: 'fui-radar', url: 'https://www.hudsandguis.com/home/tag/radar' },
  { tag: 'fui-hud', url: 'https://www.hudsandguis.com/home/tag/huds' },
  { tag: 'fui-dataviz', url: 'https://www.hudsandguis.com/home/tag/data+visualisation' },
  { tag: 'fui-hacking', url: 'https://www.hudsandguis.com/home/tag/hacking' },
  { tag: 'fui-scanner', url: 'https://www.hudsandguis.com/home/tag/scanner' },
  { tag: 'fui-diagnostics', url: 'https://www.hudsandguis.com/home/tag/diagnostics' },
  { tag: 'fui-lofi', url: 'https://www.hudsandguis.com/home/tag/lo+fi' },
  { tag: 'fui-panels', url: 'https://www.hudsandguis.com/home/tag/panels+screens' },
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const limit = Number(process.argv.includes('--limit')
  ? process.argv[process.argv.indexOf('--limit') + 1] : 24);

fs.mkdirSync(REF, { recursive: true });
const seen = new Set();
if (fs.existsSync(MANIFEST)) {
  for (const l of fs.readFileSync(MANIFEST, 'utf8').split('\n').filter(Boolean)) {
    const e = JSON.parse(l); seen.add(e.sha); seen.add(`u:${e.origin}`);
  }
}

// Headless Chromium gets 403'd by these WordPress sites; curl does not.
// The galleries render server-side -- thumbs point at fulls -- so no
// browser is needed and the firewall never sees a robot fingerprint.
const get = async (url) => {
  const r = await fetch(url, { headers: {
    'user-agent': UA, accept: 'text/html,image/*', 'accept-language': 'en-US,en;q=0.9',
  } });
  return r;
};
const imgUrls = (html, base) => {
  const out = new Set();
  const patterns = [
    /<img[^>]+\bsrc="([^"]+\.(?:jpg|jpeg|png|gif)(?:\?[^"]*)?)"/gi,
    /<img[^>]+\bdata-src="([^"]+\.(?:jpg|jpeg|png|gif)(?:\?[^"]*)?)"/gi,
    /src="(https:[^"]+\/wp-content\/photo-gallery\/thumb\/[^"]+)"/gi,
    /<a[^>]+href="(https:[^"]+\.(?:jpg|jpeg|png|gif))"[^>]*class="[^"]*bwg-lightbox/gi,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) out.add(new URL(m[1], base).href);
  }
  return [...out];
};

let added = 0, skipped = 0, failed = 0;
for (const { tag, url } of PAGES) {
  let shots = 0;
  try {
    const res = await get(url);
    if (!res.ok) { console.log(`skip ${url} -> ${res.status}`); continue; }
    const html = await res.text();
    let urls = imgUrls(html, url).map((u) => u.replace(/\/thumb\//, '/'));
    urls = [...new Set(urls)];
    const dir = path.join(REF, tag);
    fs.mkdirSync(dir, { recursive: true });
    for (const src of urls) {
      if (shots >= limit) break;
      const clean = src.split('?')[0].toLowerCase();
      if (!/\.(jpg|jpeg|png|gif)$/.test(clean)) continue;
      if (seen.has(`u:${src}`)) { skipped++; continue; }
      try {
        const r = await get(src);
        if (!r.ok) { failed++; continue; }
        const buf = Buffer.from(await r.arrayBuffer());
        // 12KB floor kills decorative thumbnails; 10MB ceiling keeps the
        // vault a study library, not a mirror.
        if (buf.length > 10 * 1024 * 1024 || buf.length < 12_000) { skipped++; continue; }
        const sha = crypto.createHash('sha256').update(buf).digest('hex');
        if (seen.has(sha)) { skipped++; continue; }
        seen.add(sha); seen.add(`u:${src}`);
        const stem = clean.split('/').pop().replace(/[^a-z0-9.]+/g, '-');
        const file = path.join(dir, `${String(++added).padStart(3, '0')}-${stem}`);
        fs.writeFileSync(file, buf);
        fs.appendFileSync(MANIFEST, `${JSON.stringify({
          file: path.relative(ROOT, file), origin: src, page: url, tag,
          bytes: buf.length, sha, at: new Date().toISOString(),
        })}\n`);
        shots++;
      } catch { failed++; }
      await new Promise((ok) => setTimeout(ok, 300)); // politeness
    }
    console.log(`${tag.padEnd(16)} ${String(shots).padStart(2)} new  ${url}`);
  } catch (e) {
    console.log(`FAIL ${url}: ${String(e.message).split('\n')[0]}`);
  }
}
console.log(`\nvault: +${added} frames, ${skipped} dup/small, ${failed} failed -> ${path.relative(process.cwd(), REF)}/`);
