/** The hop `clip.mjs` refused to make: a YouTube page into a file on disk.
 *
 * `clip.mjs` says it takes a DIRECT media URL or a file already on disk, and "never pretends to
 * work around a refusal it hit twice" — the refusal being `HTTP Error 403` when curl asks
 * youtube.com for bytes. That refusal was real and the rule was right. It was also a rule about
 * curl, not about YouTube: `yt-dlp` negotiates the same page and hands back a file. So this tool
 * makes exactly that one hop and then gets out of the way. Every measurement, every manifest
 * record and every provenance rule still belongs to `clip.mjs`, which this calls rather than
 * reimplements.
 *
 * Why it is worth making. `COVERAGE.md` has seventeen components in the tier "search candidates
 * only — opened and, where checked, refused": magi, dominator, ladder, collar, syncRatio,
 * joiOverlay, scanOverlay, triVision, ice, individuation, redaction, oracle, gauge, glassCell,
 * keycard, dispatch, needleField. Zero verified files between them. The reason is stated in
 * `vault/README.md`: a moving diegetic interface is not on GIF hosts. It is in the films, and the
 * films are on YouTube.
 *
 * Hosts that want a session get one from the operator, never from this tool: pass
 * COOKIES=<file> (an export scoped to that host, preferred) or COOKIES_FROM=<browser>.
 *
 * Two modes, and the first one is not optional.
 *
 *   node vault/youtube.mjs URL=https://www.youtube.com/watch?v=ID SLUG=magi
 *     -> fetches once, caches, and prints a contact sheet across the WHOLE video.
 *        It does not choose a window. Nobody can pick the twelve seconds where an
 *        interface fills the frame without looking, and a window chosen off a title
 *        is the drift this vault exists to stop.
 *
 *   node vault/youtube.mjs URL=... SLUG=magi START=214 DUR=12 \
 *     WORK="Neon Genesis Evangelion (1995)" SHOWS="the three MAGI ..."
 *     -> hands the cached file to clip.mjs, which derives the GIF, builds the strip,
 *        and writes the record with segment.startSeconds beside it.
 *
 * The download is a private reference copy for design study. It lands under `vault/raw/`, which
 * is gitignored, and nothing derived from it is shipped — the same standing rule the rest of the
 * vault runs under.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'raw', '.src');

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const i = a.indexOf('=');
  return i < 0 ? [a, '1'] : [a.slice(0, i), a.slice(i + 1)];
}));
const need = (k, why) => {
  if (!args[k]) {
    console.error(`youtube.mjs needs ${k}= . ${why}`);
    process.exit(2);
  }
  return args[k];
};

const URL_ = need('URL', 'Give it the watch page, not a search — this tool does not look for'
  + ' anything, it fetches what you already decided to look at.');
const SLUG = need('SLUG', 'The slug names the record and the derived GIF; a file in raw/ that'
  + ' nobody can trace back is the thing this vault was built to stop being.');
const MAX_HEIGHT = args.MAX_HEIGHT ?? '720';

// Some hosts serve metadata to anyone and media only to a signed-in client -- Vimeo is the
// live example. That is a locked door, not a refusal: the operator opens it with their own
// account and hands the session over. So the credentials are an input, never something this
// tool acquires, and it holds no password at any point.
//   COOKIES=/path/to/cookies.txt   an export scoped to the one host (preferred)
//   COOKIES_FROM=chrome            yt-dlp reads the browser's whole cookie store
// The file form is the default advice because the browser form decrypts every cookie the
// browser holds, for every site, to fetch one video.
const auth = args.COOKIES ? ['--cookies', args.COOKIES]
  : args.COOKIES_FROM ? ['--cookies-from-browser', args.COOKIES_FROM]
  : [];

// 1. Identity first. This also proves the page is reachable before anything is written to disk,
//    and costs one metadata request rather than a download that fails at 90%.
let id;
let title;
let durationText;
try {
  [id, title, durationText] = execFileSync('yt-dlp',
    ['-q', '--no-warnings', ...auth, '--print', '%(id)s\n%(title)s\n%(duration)s', URL_],
    { encoding: 'utf8' }).trim().split('\n');
} catch {
  console.error(`youtube.mjs: yt-dlp could not read ${URL_}. A page that will not identify`
    + ' itself is not a reference, and guessing past that is how a 403 page ends up in a vault.');
  if (!auth.length) {
    console.error('         If the error mentions signing in, this host wants a session. Pass'
      + ' COOKIES=<file> or COOKIES_FROM=<browser> once the operator has logged in themselves.');
  }
  process.exit(2);
}

mkdirSync(SRC, { recursive: true });
const cached = join(SRC, `${id}.mp4`);

// 2. The fetch, once. A second run against the same video reads the cache, so scanning a long
//    film and then cutting three windows out of it costs one download.
if (!existsSync(cached)) {
  console.log(`fetch    ${id}  ${title}  (${durationText}s)`);
  execFileSync('yt-dlp', ['-q', '--no-warnings', '--no-playlist', ...auth,
    '-f', `bestvideo[height<=${MAX_HEIGHT}]+bestaudio/best[height<=${MAX_HEIGHT}]/best`,
    '--merge-output-format', 'mp4', '-o', cached, URL_], { stdio: 'inherit' });
} else {
  console.log(`cached   ${cached}`);
}
if (!existsSync(cached) || statSync(cached).size < 100_000) {
  console.error(`youtube.mjs: the download is missing or ${existsSync(cached) ? statSync(cached).size : 0}`
    + ' bytes. Refusing rather than handing clip.mjs something to measure motion off.');
  if (existsSync(cached)) rmSync(cached);
  process.exit(2);
}

const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'default=nw=1:nk=1', cached], { encoding: 'utf8' }).trim());

// 3. No START means scan. The sheet is the whole film at a fixed interval, and the caption
//    carries the arithmetic so the eye is never asked to guess which second it is looking at.
if (args.START === undefined) {
  const want = Number(args.SAMPLES ?? 48);
  const interval = Math.max(1, Math.round(seconds / want));
  const dir = `/tmp/${SLUG}-scan`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  execFileSync('ffmpeg', ['-loglevel', 'error', '-i', cached,
    '-vf', `fps=1/${interval},scale=260:-1`, '-fps_mode', 'vfr', join(dir, 's-%03d.png')]);
  const n = readdirSync(dir).length;
  const sheet = args.SHEET || `/tmp/${SLUG}-scan.png`;
  execFileSync('python3', [join(HERE, 'clip-sheet.py'), dir, sheet,
    `${SLUG} SCAN  ·  ${title}  ·  ${seconds.toFixed(0)}s at 1 frame / ${interval}s`
    + `  ·  frame #n is at (n-1)x${interval}s`], { stdio: 'inherit' });
  console.log(`scan     ${sheet}  (${n} frames, one every ${interval}s)`);
  console.log('next     look at the sheet, pick the window where the interface fills the frame,');
  console.log(`         then rerun with START=<seconds> DUR=<seconds> WORK=... SHOWS=...`);
  process.exit(0);
}

// 4. A window was chosen by an eye. clip.mjs owns everything from here: the GIF, the strip, the
//    frame count read out of the file, and the record with the derivation stated on it.
const pass = ['FILE', 'SLUG', 'START', 'DUR', 'FPS', 'WIDTH', 'WORK', 'SHOWS', 'SHEET']
  .map((k) => (k === 'FILE' ? `FILE=${cached}` : args[k] !== undefined ? `${k}=${args[k]}` : null))
  .filter(Boolean);
execFileSync('node', [join(HERE, 'clip.mjs'), ...pass,
  `URL=${URL_}`, `SOURCE_PAGE=${URL_}`, `SEED=${args.SEED || 'youtube'}`], { stdio: 'inherit' });
