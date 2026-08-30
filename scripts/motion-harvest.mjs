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

const FRAMES = 8;

// Screen-motion scenes pulled for reference study (short excerpts,
// steeped into strips; the mp4 itself never enters the vault -- only
// timestamped stills and provenance). Steep several windows per clip:
// the UI-dense window is picked by eye afterwards, and strips that show
// no interface are deleted, not kept as filler.
const SCENES = [
  { file: '/tmp/esper.mp4', tag: 'esper-scene', origin: 'https://www.youtube.com/watch?v=qHepKd38pr0',
    note: 'Blade Runner: ESPER enhancement dive', windows: [[20, 100], [80, 80]] },
  { file: '/tmp/thermoptic.mp4', tag: 'ghost-in-the-shell', origin: 'https://www.youtube.com/watch?v=wixWLShOock',
    note: 'Ghost in the Shell 1995: thermo-optic cam HUD', windows: [[15, 100], [80, 55]] },
  { file: '/tmp/magi.mp4', tag: 'magi-scene', origin: 'https://www.youtube.com/watch?v=t9Lb2__oCdM',
    note: 'Evangelion: the MAGI system program screen', windows: [[0, 20]] },
  { file: '/tmp/muther.mp4', tag: 'muthur-scene', origin: 'https://www.youtube.com/watch?v=rkBhLjwuq20',
    note: 'Aliens: the MU/TH/UR terminal (Weyland-Yutani scene)', windows: [[40, 80], [120, 80], [200, 60]] },
  { file: '/tmp/optical.mp4', tag: 'ghost-in-the-shell', origin: 'https://www.youtube.com/watch?v=sSrQWUxy_Ew',
    note: 'Ghost in the Shell: opening optical-cam POV HUD', windows: [[2, 40]] },
  { file: '/tmp/dominator.mp4', tag: 'dominator-scene', origin: 'https://www.youtube.com/watch?v=rhmh3tyEEfs',
    note: 'Psycho-Pass: Dominator mode-call screens', windows: [[10, 80], [80, 49]] },
  { file: '/tmp/tron-lightcycle.mp4', tag: 'tron-lightcycle', origin: 'https://www.youtube.com/watch?v=VVzm8yyHCHE',
    note: 'TRON: Legacy light cycle battle -- trail-laid-as-you-go on the grid',
    windows: [[20, 50], [80, 50], [140, 50], [200, 50]] },
  { file: '/tmp/mr-computer.mp4', tag: 'precrime-desk', origin: 'https://www.youtube.com/watch?v=33Raqx9sFbo',
    note: 'Minority Report: precrime file review on the data gloves',
    windows: [[10, 50], [60, 45]] },
  { file: '/tmp/mr-ui.mp4', tag: 'precrime-desk', origin: 'https://www.youtube.com/watch?v=NwVBzx0LMNQ',
    note: 'Minority Report: interface compilation (pull/scroll/compare gestures)',
    windows: [[10, 60], [80, 60], [145, 45]] },
];

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
for (const sc of SCENES) {
  if (only && !sc.tag.includes(only)) continue;
  if (!fs.existsSync(sc.file)) { console.log(`missing ${sc.file}`); continue; }
  const dir = path.join(MOTION, sc.tag);
  fs.mkdirSync(dir, { recursive: true });
  for (const [start, len] of sc.windows) {
    // Include the source file stem: two clips under one tag otherwise
    // write the same strip name and the second silently overwrites the
    // first while both manifest rows survive.
    const stem = path.basename(sc.file, '.mp4');
    const step = (len - 1) / (FRAMES - 1);
    const files = [];
    for (let i = 0; i < FRAMES; i++) {
      const t = (start + i * step).toFixed(2);
      const out = path.join('/tmp', `${sc.tag}-${t}s.png`);
      run(['-y', '-ss', t, '-i', sc.file, '-vf', `scale=-2:${CELL_H}`, '-frames:v', '1', out]);
      files.push(out);
    }
    const strip = path.join(dir, `${stem === sc.tag ? stem : sc.tag + '-' + stem}-${start}s.png`);
    execFileSync('montage', [...files, '-tile', `${FRAMES}x1`, '-geometry', '+2+2',
      '-background', '#000', '-fill', '#ffb000', '-label', '%t',
      '-font', '/System/Library/Fonts/Supplemental/Andale Mono.ttf', '-pointsize', '12', strip]);
    fs.appendFileSync(MANIFEST, `${JSON.stringify({
      game: sc.tag, note: `${sc.note} -- window ${start}s+${len}s`,
      strip: path.relative(ROOT, strip), origin: sc.origin, frames: FRAMES,
      sha: crypto.createHash('sha256').update(fs.readFileSync(strip)).digest('hex'),
      at: new Date().toISOString(),
    })}\n`);
    made++;
    files.forEach((f) => fs.rmSync(f, { force: true }));
    console.log(`${sc.tag.padEnd(20)} window ${start}s+${len}s -> ${path.basename(strip)}`);
  }
}
console.log(`\nmotion vault: +${made} strips, ${skipped} dup/skip, ${failed} fail -> ${path.relative(process.cwd(), MOTION)}/`);
