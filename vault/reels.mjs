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
 * It stops when failures look like a wall rather than like weather, and it took two wrong
 * guesses to find that line. Two consecutive misses was the first, and the second reel in the
 * queue is simply gone. A longer run of consecutive misses was the second, and it died on
 * Guardians of the Galaxy: Kit FUI lists eight identifiers for that one work, seven of them
 * pruned from the uploader's account years ago, one still live in the middle of the cluster.
 * Dead links arrive in clumps, because one entry lists many videos from one uploader and an
 * account is emptied all at once.
 *
 * So counting was the wrong instrument. The error text already says which kind of failure it
 * is: a 404 is gone forever and tells you nothing about the session, while a demand to sign in
 * is the wall itself and is worth stopping on immediately. Classify, do not tally.
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

// A missing or restricted video says nothing about whether we are allowed in; a demand for
// credentials says everything. Only the second kind is a reason to abandon the rest.
//
// Two corrections are baked in here. First, classify on yt-dlp's own ERROR line and nothing
// else: the previous version tested the whole of stderr, which includes youtube.mjs's own
// message about how a 403 page ends up in a vault -- so the word 403 in our own prose marked
// every failure as a wall. A detector that reads its own output is not a detector.
//
// Second, a bare 403 on one video is a restricted video, not a dead session. Vimeo returns it
// for things set to followers-only or blocked by region, and it arrives in the middle of a run
// of successes. The signal for an actual wall is a demand for credentials, in words.
const ERRLINE = /^ERROR:.*$/mi;
const WALL = /sign ?in|log ?in|logged[- ]in|cookies|credential|account|password required/i;
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
    execFileSync('node', [join(HERE, 'youtube.mjs'), ...pass],
      { stdio: ['ignore', 'inherit', 'pipe'] });
    appendFileSync(log, `ok ${q.id} ${q.key} ${q.work.title}\n`);
    misses = 0;
    got += 1;
  } catch (err) {
    const why = String(err.stderr || '');
    const line = (why.match(ERRLINE) || [''])[0];
    const gone = !WALL.test(line);
    appendFileSync(log, `${gone ? 'GONE' : 'FAIL'} ${q.id} ${q.key} ${q.work.title}\n`);
    if (gone) {
      console.log(`gone     ${q.id} ${q.work.title} -- ${line.slice(0, 90) || 'unavailable'}`);
      misses = 0;
      continue;
    }
    process.stderr.write(why);
    misses += 1;
    if (misses >= 2) {
      console.error(`\nreels.mjs: two failures that are not missing videos. That reads as the`
        + ` session rather than the list. Check the cookies are live and that yt-dlp is current --`
        + ` a stale extractor looks exactly like a hard refusal. ${got} fetched first.`);
      process.exit(1);
    }
  }
}
console.log(`\n${got} reels cached. Contact sheets are in /tmp; look at them, pick windows,`
  + ` then run clip.mjs or youtube.mjs with START= and DUR= for the ones worth keeping.`);
