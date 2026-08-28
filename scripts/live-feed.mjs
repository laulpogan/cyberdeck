// The demo producer for the showcase's /live route: a real process on a
// real wall clock, publishing a real cadence. This is not the library's
// clock -- fixtures keep theirs, frozen -- it is the feed's, and the page
// measures it exactly as it would measure a fleet: by polling age.
//
// The vocabulary ('fresh', 'stale', 'live') is the producer protocol the
// radar's own drawing reads, stated here so the seam is auditable: this
// file is the only place on the live path that invents values, and only
// values the radar's declared evidence paths can receive.
//
//   node scripts/live-feed.mjs [port]      -> http://127.0.0.1:8299/app/
//
// Stop it and the live page goes dark where its controls declare --
// which is the feature, not a failure.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
};

const PERIOD = 6;           // seconds, the radar's declared poll period
const WINDOWS = [60, 120];  // per-contact evidence windows, fixture's own

export function radarPatch(nowMs) {
  const t = nowMs / 1000;
  return {
    pollElapsed: Math.round((t % PERIOD) * 10) / 10,
    pollPeriod: PERIOD,
    sourceState: 'live',
    contacts: WINDOWS.map((window, i) => {
      const age = Math.round((t * (i % 2 ? 0.6 : 1) + i * 17) % window);
      return { age_seconds: age, band: age < window / 2 ? 'fresh' : 'stale' };
    }),
  };
}

export function startFeed({ port = 0, host = '127.0.0.1' } = {}) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${host}`);
    if (url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    if (url.pathname === '/feed/radar.json') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify(radarPatch(Date.now())));
      return;
    }
    const file = path.join(ROOT, path.normalize(decodeURIComponent(url.pathname)));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('nope'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((done) => server.listen(port, host, () => {
    done({ server, port: server.address().port });
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 8299);
  startFeed({ port }).then(({ port: got }) => {
    process.stdout.write(`feed on http://127.0.0.1:${got}/app/index.html#/live\n`);
  });
}
