/** One clip into the vault, with the derivation on the record.
 *
 * `acquire.mjs` harvests image hosts and reaches characters, banners and site logos — twelve of
 * 114 ranked moving files survive an eye looking for an interface filling the frame. A moving
 * diegetic interface is not mostly on GIF hosts; it is on hosts that serve the file when you ask
 * for the file. Wikimedia Commons does exactly that: no browser, no challenge, `upload.wikimedia.org`
 * answers with bytes. YouTube answers with `HTTP Error 403` from this network, which is why this
 * tool takes a DIRECT media URL or a file already on disk and never pretends to work around a
 * refusal it hit twice.
 *
 * What it produces is a derived GIF plus a manifest record, because the unit of measurement in
 * this vault is an animated file `vault/spec.py` can step through, and a segment of somebody's
 * eighty-second film is not a loop. The GIF is a WINDOW, and the record says so — `segment.start`,
 * `segment.seconds`, `derivedFrom` — so that a later `loopSeconds` is never mistaken for a claim
 * about how the source repeats. It does not. It is fourteen seconds of a descent.
 *
 *   node vault/clip.mjs FILE=/tmp/gcas.webm URL=https://upload.wikimedia.org/... START=22 DUR=14 \
 *     SLUG=f16-hud-gcas SOURCE_PAGE=https://commons.wikimedia.org/wiki/File:... \
 *     WORK="Auto-GCAS Saves Unconscious F-16 Pilot (USAF declassified footage)" \
 *     SHOWS="F-16 HUD: airspeed and altitude tapes scrolling under fixed pointers..."
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, 'raw');
const MANIFEST = join(HERE, 'MANIFEST.json');

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const i = a.indexOf('=');
  return i < 0 ? [a, '1'] : [a.slice(0, i), a.slice(i + 1)];
}));
const need = (k) => {
  if (!args[k]) {
    console.error(`clip.mjs needs ${k}= . It will not write a manifest record with a hole where`
      + ` the provenance goes — a file in raw/ that nobody can trace back is the thing this`
      + ` vault was built to stop being.`);
    process.exit(2);
  }
  return args[k];
};
const START = Number(args.START ?? 0);
const DUR = Number(args.DUR ?? 10);
const FPS = Number(args.FPS ?? 6);
const WIDTH = Number(args.WIDTH ?? 320);
const SLUG = need('SLUG');
const OUT = join(RAW, `${SLUG}.gif`);
const SHEET = args.SHEET || `/tmp/${SLUG}-sheet.png`;
const SHEET_W = Number(args.SHEET_WIDTH ?? 430);

mkdirSync(RAW, { recursive: true });

// 1. The source: a file someone already downloaded, or a direct URL. No search, no scraping.
const src = args.FILE ? resolve(args.FILE) : `/tmp/${SLUG}.source`;
if (args.FILE && !existsSync(src)) {
  console.error(`clip.mjs: FILE points at ${src}, which is not on disk.`);
  process.exit(2);
}
if (!args.FILE) {
  execFileSync('curl', ['-sSL', '--max-time', '300', '-o', src, need('URL')], { stdio: 'inherit' });
}
if (!existsSync(src) || statSync(src).size < 10_000) {
  console.error(`clip.mjs: the source is missing or ${existsSync(src) ? statSync(src).size : 0} bytes.`
    + ' A 403 page is not a reference, and recording one would be worse than recording nothing.');
  process.exit(2);
}

const probe = (field) => execFileSync('ffprobe', ['-v', 'error', '-show_entries', `format=${field}`,
  '-of', 'default=nw=1:nk=1', src], { encoding: 'utf8' }).trim();
const sourceSeconds = Number(probe('duration'));
const dims = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height',
  '-of', 'csv=s=x:p=0', src], { encoding: 'utf8' }).trim().split('\n')[0];

if (START + DUR > sourceSeconds + 0.5) {
  console.error(`clip.mjs: the source is ${sourceSeconds}s and the window asked for ${START}s`
    + ` + ${DUR}s. A window past the end of the film yields a GIF of whatever frames survive,`
    + ' which spec.py would then measure as motion the source never showed.');
  process.exit(2);
}

// 2. The window, as an animated GIF: the format the measurement tools already speak.
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(START), '-t', String(DUR), '-i', src,
  '-vf', `fps=${FPS},scale=${WIDTH}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
  OUT], { stdio: 'inherit' });

// 3. A strip for the eye. Nothing may be quoted before somebody has looked at it, and that
//    includes a clip chosen because its title sounded right.
const stripDir = `/tmp/${SLUG}-frames`;
execFileSync('mkdir', ['-p', stripDir]);
execFileSync('ffmpeg', ['-loglevel', 'error', '-i', OUT, '-vf', `scale=${SHEET_W}:-1`,
  join(stripDir, 'f-%03d.png')]);
execFileSync('python3', [join(HERE, 'clip-sheet.py'), stripDir, SHEET, `${SLUG}  ·  ${START}s`
  + ` +${DUR}s of a ${sourceSeconds.toFixed(1)}s source  ·  ${FPS} fps  ·  ${WIDTH}px wide`],
  { stdio: 'inherit' });

// 4. The record. `frames` and `loopSeconds` mean what they mean everywhere else in the manifest,
//    with the window that produced them kept beside them.
const gif = readFileSync(OUT);
// The frame count is counted out of the file, never computed from what the window asked for.
// The first version wrote `DUR * FPS` — 96 — into a GIF that had dropped its near-duplicate
// frames and held 80, which is a self-reported number in the one column every other tool
// trusts. The requested count stays in the record beside it, labelled as the request.
const actualFrames = Number(execFileSync('python3', ['-c',
  "import sys; from PIL import Image; im=Image.open(sys.argv[1]); n=0\n"
  + "while True:\n"
  + "    try: im.seek(n)\n    except EOFError: break\n    n+=1\n"
  + "print(n)", OUT], { encoding: 'utf8' }).trim());
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const key = `${SLUG}.gif`;
manifest.files[key] = {
  file: `raw/${key}`,
  seed: args.SEED || 'direct-clips',
  kind: 'gif',
  bytes: gif.length,
  frames: actualFrames,
  requestedFrames: Math.round(DUR * FPS),
  frameDelayCs: [Math.round(100 / FPS)],
  loopSeconds: Number((actualFrames / FPS).toFixed(2)),
  sha1: createHash('sha1').update(gif).digest('hex').slice(0, 16),
  mediaUrl: args.URL || `file:${src}`,
  sourcePage: need('SOURCE_PAGE'),
  status: 'unmarked',
  work: need('WORK'),
  // The derivation, stated rather than implied. spec.py will report "no return to frame zero"
  // for this file, which is true of the window and says nothing about the source.
  segment: { startSeconds: START, seconds: DUR, sourceSeconds: Number(sourceSeconds.toFixed(1)),
             sourceDims: dims, fps: FPS, derivedGifWidth: WIDTH },
  captionOnPage: args.SHOWS ? `what the eye is expected to check: ${args.SHOWS}` : 'not recorded',
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log(`derived  raw/${key}  ${gif.length} bytes  ${manifest.files[key].frames} frames`
  + `  (${START}s +${DUR}s of ${sourceSeconds.toFixed(1)}s at ${dims})`);
console.log(`sheet    ${SHEET}`);
console.log('next     look at the sheet, then: python3 vault/eyeball.py MARK '
  + `'raw/${key}=yes|what the frames actually show'`);
