/** Search Wikimedia Commons for MOVING files, from inside a page loaded from Commons.
 *
 * Why a browser and not `curl`: the plain client is answered with `You are making too many requests
 * to the API` **as plain text**, so a script that pipes it into a JSON parser dies with a parse
 * error and looks like a code fault (that cost a whole session's estimate of what was reachable).
 * The block turned out to be a client property, not a network one — the same `api.php` answers
 * instantly when the request is same-origin from a real page.
 *
 * Why `filetype:video` in the query string: bare nouns return photographs of the *thing* — a
 * "radar" query returns a camera pointed at an antenna on a hill, a "sonar" query returns a 3D
 * render — and a motion spec cannot be read off either. Putting `filetype:video` in the search
 * string is what turns Commons into a motion archive instead of a photo archive — but only with
 * `gsrnamespace=6`. `filetype:` is matched against File-namespace pages, so without it the query runs
 * over *articles*, where nothing can be a video, and the API answers `{"batchcomplete":""}` — a clean
 * empty result that looks exactly like an archive with nothing in it. `list=search` with the same
 * string returns zero for the same reason, which is how I nearly concluded twice that the path was dead.
 *
 * This prints candidates and nothing else. Nothing here is ever "verified": a title that names the
 * subject is a search result, not a reference. Verification is opening the frames and applying the
 * drawing test (`vault/sheet.py`, then `vault/mark.py`), and most candidates die there.
 *
 *   node vault/common-search.mjs "strip chart recorder" "oscilloscope screen"
 *   LIMIT=8 node vault/common-search.mjs "video wall control room"
 */
import { chromium } from 'playwright';

const LIMIT = Number(process.env.LIMIT || 12);
const queries = process.argv.slice(2);
if (!queries.length) {
  console.error('usage: node vault/common-search.mjs <query> [query …]   (filetype:video is added)');
  process.exit(2);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  // Any Commons page will do; the fetch has to be same-origin for the throttle not to apply.
  await page.goto('https://commons.wikimedia.org/wiki/Main_Page', { waitUntil: 'domcontentloaded' });

  for (const q of queries) {
    const out = await page.evaluate(async ({ query, limit }) => {
      const u = new URL('/w/api.php', location.origin);
      u.search = new URLSearchParams({
        action: 'query', format: 'json', generator: 'search',
        gsrsearch: `filetype:video ${query}`, gsrlimit: String(limit),
        gsrnamespace: '6',
        prop: 'imageinfo', iiprop: 'url|size|mime|mediatype|timestamp',
      }).toString();
      const res = await fetch(u);
      const text = await res.text();
      try { return { json: JSON.parse(text) }; } catch { return { text: text.slice(0, 160) }; }
    }, { query: q, limit: LIMIT });

    console.log(`\n=== ${q} — filetype:video`);
    if (out.text) { console.log(`  NOT JSON (throttled or challenged): ${out.text}`); continue; }
    const pages = Object.values(out.json?.query?.pages || {});
    if (!pages.length) { console.log('  no results'); continue; }
    // Keep the API's own relevance order. Sorting by size — which is what this did first — promotes a
    // 1.7 GB Wikimedia planning call over the small file that actually matched the query, and a
    // reader concludes the archive holds nothing when the tool has simply buried the one hit.
    pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const p of pages) {
      const ii = p.imageinfo?.[0] || {};
      const mb = (ii.width ? `${ii.width}x${ii.height}` : '?');
      const kind = String(ii.mime || '?').replace('video/', '').replace('image/', '');
      const bare = String(ii.url || '').split('?')[0];   // the API appends utm query params
      console.log(`  #${String(p.index ?? '?').padEnd(8)} ${kind.padEnd(9)} ${mb.padEnd(11)} ${(ii.size / 1e6).toFixed(1).padStart(7)} MB  ${p.title}`);
      console.log(`      ${bare}`);
      if (!/\.(gif|webm|ogv)$/i.test(bare)) {
        console.log('      (container needs a window derived with vault/clip.mjs)');
      }
    }
  }
} finally {
  await browser.close();
}
