/** Walk the reel list Kit FUI gave us, one work at a time.
 *
 * `KIT-FUI.json` holds 135 Vimeo identifiers across 47 works, and that list is the thing the
 * film-and-television pass could not assemble by searching: studio process reels, where the
 * screen graphics play out uncut because no editor has cut away from them yet. This walks the
 * list and hands each one to `youtube.mjs`, which caches the file and prints a contact sheet
 * across the whole runtime. It measures nothing and decides nothing; an eye still picks the
 * window afterwards.
 *
 *   node vault/reels.mjs COOKIES=~/vimeo.txt              # everything not already cached
 *   node vault/reels.mjs COOKIES=~/vimeo.txt STUDIO=territory-studio
 *   node vault/reels.mjs COOKIES=~/vimeo.txt LIMIT=5 DRY=1
 *
 * Vimeo serves metadata to anyone and media only to a signed-in client. The operator logs in
 * themselves and passes the session; this file never sees a password. Without COOKIES or
 * COOKIES_FROM it refuses rather than starting a run that would fail 135 times.
 *
 * It also stops after two consecutive failures. A run that keeps going against a wall turns
 * one clear diagnosis into a hundred identical log lines, and the second failure is where the
 * useful information already was.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const i = a.indexOf('=');
  return i < 0 ? [a, '1'] : [a.slice(0, i), a.slice(i + 1)];
}));

if (!args.COOKIES && !args.COOKIES_FROM && !args.DRY) {
  console.error('reels.mjs needs COOKIES=<file> or COOKIES_FROM=<browser>. Vimeo hands media'
    + ' only to a signed-in client, so without a session this walks 135 identifiers into the'
    + ' same wall. Log in first, then pass the session. DRY=1 lists the queue without fetching.');
  process.exit(2);
}

const db = JSON.parse(readFileSync(join(HERE, 'KIT-FUI.json'), 'utf8'));
const queue = [];
for (const [key, work] of Object.entries(db)) {
  if (args.STUDIO && !work.studios.includes(args.STUDIO)) continue;
  if (args.TYPE && work.type !== args.TYPE) continue;
  for (const id of work.vimeo) queue.push({ key, id, work });
}
const todo = queue.filter((q) => !existsSync(join(HERE, 'raw', '.src', `${q.id}.mp4`)));
const run = args.LIMIT ? todo.slice(0, Number(args.LIMIT)) : todo;

console.log(`${queue.length} reels listed, ${queue.length - todo.length} already cached,`
  + ` ${run.length} to fetch.`);
if (args.DRY) {
  for (const q of run) console.log(`  ${q.id}  ${q.work.title}  [${q.work.studios.join(', ') || 'no studio credited'}]`);
  process.exit(0);
}

const log = join(HERE, 'reels.log');
let misses = 0;
let got = 0;
for (const q of run) {
  const slug = `${q.key.replace(/\W+/g, '-')}-${q.id}`;
  const pass = ['URL=https://vimeo.com/' + q.id, `SLUG=${slug}`, 'SEED=reel'];
  if (args.COOKIES) pass.push(`COOKIES=${args.COOKIES}`);
  if (args.COOKIES_FROM) pass.push(`COOKIES_FROM=${args.COOKIES_FROM}`);
  if (args.SAMPLES) pass.push(`SAMPLES=${args.SAMPLES}`);
  try {
    execFileSync('node', [join(HERE, 'youtube.mjs'), ...pass], { stdio: 'inherit' });
    appendFileSync(log, `ok ${q.id} ${q.key} ${q.work.title}\n`);
    misses = 0;
    got += 1;
  } catch {
    appendFileSync(log, `FAIL ${q.id} ${q.key} ${q.work.title}\n`);
    misses += 1;
    if (misses >= 2) {
      console.error(`\nreels.mjs: two in a row failed. Stopping rather than walking the rest of`
        + ` the list into the same wall. Check the session is live and that yt-dlp is current --`
        + ` a stale extractor looks exactly like a hard refusal. ${got} fetched before this.`);
      process.exit(1);
    }
  }
}
console.log(`\n${got} reels cached. Contact sheets are in /tmp; look at them, pick windows,`
  + ` then run clip.mjs or youtube.mjs with START= and DUR= for the ones worth keeping.`);
