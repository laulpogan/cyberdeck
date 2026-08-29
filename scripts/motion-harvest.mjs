// motion-harvest: the reference side of the gauntlet.
//
// Still frames capture look, not move. This tool pulls REAL interface
// motion clips and steeps each one into a labelled contact strip -- the
// same shape motion-film produces for our own pages -- so a component's
// target motion and its execution sit side by side in the same view.
//
//   node scripts/motion-harvest.mjs               -- harvest the curated list
//   node scripts/motion-harvest.mjs --only ghost  -- subset by name
//
// Each clip: download (interfaceingame hosts them directly), probe with
// ffprobe, extract evenly spaced frames scaled to a common height, tile
// them with a timestamp burnt in, write the strip to vault/motion/<game>/,
// and record provenance in a gitignored manifest. The tool needs ffmpeg
// on PATH; it refuses rather than faking a strip without it.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOTION = path.join(ROOT, 'vault', 'motion');
const MANIFEST = path.join(MOTION, 'manifest.jsonl');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// Real game-UI motion clips, pulled from interfaceingame.com/screenshots/.
// Direct mp4s (the game galleries are JS-gated; this index is not). These
// are the ones that model what our components claim to animate.
const CLIPS = [
  { game: 'ghost-recon-breakpoint', note: 'inventory headwear state transition', url: 'https://interfaceingame.com/wp-content/uploads/tom-clancys-ghost-recon-breakpoint/tom-clancys-ghost-recon-breakpoint-headwear-transition.mp4' },
  { game: 'the-division-2', note: 'inventory open and tab', url: 'https://interfaceingame.com/wp-content/uploads/tom-clancys-the-division-2/tom-clancys-the-division-2-inventory.mp4' },
  { game: 'dishonored-2', note: 'main menu motion', url: 'https://interfaceingame.com/wp-content/uploads/dishonored-2/dishonored-2-main-menu.mp4' },
  { game: 'dishonored-2', note: 'apply settings confirm', url: 'https://interfaceingame.com/wp-content/uploads/dishonored-2/dishonored-2-apply-settings.mp4' },
  { game: 'overwatch', note: 'match report top-player callout', url: 'https://interfaceingame.com/wp-content/uploads/overwatch/overwatch-match-top-player.mp4' },
];

const FRAMES = 6;
const CELL_H = 200;

function hasFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; }
  catch { return false; }
}
function run(args) { return execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] }); }

const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1] : '';

if (!hasFfmpeg()) {
  console.error('motion-harvest needs ffmpeg on PATH -- refusing to fake a strip.');
  process.exit(1);
}
fs.mkdirSync(MOTION, { recursive: true });
const seen = new Set(fs.existsSync(MANIFEST)
  ? fs.readFileSync(MANIFEST, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).sha) : []);

let made = 0, skipped = 0, failed = 0;
for (const clip of CLIPS) {
  if (only && !clip.game.includes(only)) continue;
  const tmp = path.join('/tmp', clip.url.split('/').pop());
  try {
    const r = await fetch(clip.url, { headers: { 'user-agent': UA, referer: 'https://interfaceingame.com/' } });
    if (!r.ok) { console.log(`skip ${clip.url} -> ${r.status}`); failed++; continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 60 * 1024 * 1024) { console.log(`too big ${clip.note}`); skipped++; continue; }
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    if (seen.has(sha)) { skipped++; continue; }
    seen.add(sha);
    fs.writeFileSync(tmp, buf);
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=nw=1:nk=1', tmp], { encoding: 'utf8' }).trim());
    const step = (dur * 1000 * (FRAMES - 1) ? (dur - 0.1) / (FRAMES - 1) : 0.1);
    const dir = path.join(MOTION, clip.game);
    fs.mkdirSync(dir, { recursive: true });
    const base = clip.url.split('/').pop().replace(/\.mp4$/, '').replace(/[^a-z0-9]+/gi, '-');
    const strip = path.join(dir, `${base}.png`);
    // Extract FRAMES evenly spaced frames at a common height. This box's
    // ffmpeg has no drawtext (no libfreetype), so montage burns the
    // timestamp from each filename into the strip's label instead.
    const files = [];
    for (let i = 0; i < FRAMES; i++) {
      const t = (i * step).toFixed(2);
      const out = path.join('/tmp', `${base}_${t}s.png`);
      run(['-y', '-ss', t, '-i', tmp, '-vf', `scale=-2:${CELL_H}`, '-frames:v', '1', out]);
      files.push(out);
    }
    execFileSync('montage', [...files, '-tile', `${FRAMES}x1`, '-geometry', '+2+2',
      '-background', '#000', '-fill', '#ffb000', '-label', '%t',
      '-font', '/System/Library/Fonts/Supplemental/Andale Mono.ttf', '-pointsize', '12', strip]);
    fs.appendFileSync(MANIFEST, `${JSON.stringify({
      game: clip.game, note: clip.note, strip: path.relative(ROOT, strip),
      origin: clip.url, dur: Math.round(dur * 10) / 10, frames: FRAMES, bytes: buf.length,
      sha, at: new Date().toISOString(),
    })}\n`);
    made++;
    console.log(`${clip.game.padEnd(24)} ${String(Math.round(dur * 10) / 10 + 's').padStart(6)}  ${clip.note}`);
    files.forEach((f) => fs.rmSync(f, { force: true }));
  } catch (e) {
    failed++;
    console.log(`FAIL ${clip.note}: ${String(e.message).split('\n')[0].slice(0, 100)}`);
  }
}
console.log(`\nmotion vault: +${made} strips, ${skipped} dup/skip, ${failed} fail -> ${path.relative(process.cwd(), MOTION)}/`);
