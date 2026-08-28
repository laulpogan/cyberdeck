// The browser pass the project's own rule demands: the gates that node
// cannot prove -- honesty counters, kill-switch byte-identity, reduced
// motion, overflow, console cleanliness -- run here against the real app.
// Skips (does not fail) where Playwright or a browser is not installed.

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The library carries no dependencies, so this suite resolves an already
// installed Playwright rather than adding one: an explicit override, the
// repo's own tree, the npm global root, then known skill tool-trees.
async function resolveChromium() {
  const tries = [
    () => import('playwright'),
  ];
  const dirs = [];
  if (process.env.PLAYWRIGHT_MODULE_DIR) dirs.push(process.env.PLAYWRIGHT_MODULE_DIR);
  try {
    const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
    dirs.push(path.join(root, 'playwright'));
  } catch { /* no global root */ }
  dirs.push(path.join(os.homedir(), '.claude/skills/deck-render/node_modules/playwright'));
  for (const dir of dirs) {
    if (!fs.existsSync(path.join(dir, 'package.json'))) continue;
    tries.push(() => import(pathToFileURL(path.join(dir, 'index.mjs')).href));
  }
  for (const tryImport of tries) {
    try {
      const mod = await tryImport();
      if (mod?.chromium) return mod.chromium;
    } catch { /* next candidate */ }
  }
  return null;
}

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
};

function serve() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    const file = path.join(ROOT, path.normalize(decodeURIComponent(url.pathname)));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('nope'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done({ server, port: server.address().port })));
}

const chromium = await resolveChromium();
const skip = chromium ? false : 'playwright not resolvable here';

const ROUTES = [
  '', '#/families/field', '#/families/river', '#/families/telegraph',
  '#/families/thread', '#/families/organism', '#/families/decision',
  '#/families/agents', '#/families/instruments',
  '#/component/radar', '#/component/lanes', '#/component/tracker', '#/component/mfd',
  '#/component/collar', '#/component/magi', '#/component/dossier', '#/component/globe',
  '#/rules', '#/primitives',
];

const MISSING = ['#/component/nope', '#/families/nope', '#/nowhere'];

const counters = (page) => page.evaluate(() => ({
  anim: Number(document.getElementById('h-anim').textContent),
  marks: Number(document.getElementById('h-marks').textContent),
  still: Number(document.getElementById('h-still').textContent),
  lying: Number(document.getElementById('h-lying').textContent),
}));

test('app browser pass', { skip }, async (t) => {
  const { server, port } = await serve();
  const base = `http://127.0.0.1:${port}/app/index.html`;
  const browser = await chromium.launch();

  const openPage = async (ctx, opts = {}) => {
    const page = await ctx.newPage();
    const noise = [];
    page.on('console', (m) => { if (m.type() === 'error') noise.push(m.text()); });
    page.on('pageerror', (e) => noise.push(String(e)));
    page.on('requestfailed', (r) => noise.push(`net ${r.url()}`));
    return { page, noise, ...opts };
  };

  try {
    await t.test('every route renders with an honest console', async () => {
      const ctx = await browser.newContext();
      for (const route of [...ROUTES, ...MISSING]) {
        const { page, noise } = await openPage(ctx);
        await page.goto(base + route);
        await page.waitForTimeout(500);
        assert.deepEqual(noise, [], `${route || 'landing'}: console errors`);
        const state = await page.evaluate(() => ({
          filled: document.getElementById('view').children.length > 0,
          missing: /NO ROUTE/.test(document.getElementById('view').textContent),
          cards: document.querySelectorAll('#view a[href^="#/component/"]').length,
        }));
        assert.ok(state.filled, `${route || 'landing'}: rendered an empty view`);
        const wantMissing = MISSING.includes(route);
        assert.equal(state.missing, wantMissing,
          `${route || 'landing'}: ${wantMissing ? 'rendered content where it should say NO ROUTE'
            : 'fell through to NO ROUTE -- the route never resolved'}`);
        if (/^#\/families\//.test(route) && !wantMissing) {
          assert.ok(state.cards > 0, `${route}: family page lists no components`);
        }
        assert.equal((await counters(page)).lying, 0, `${route}: moving without evidence`);
        await page.close();
      }
      await ctx.close();
    });

    await t.test('motion runs and never moves inside a still subtree, both themes', async () => {
      const ctx = await browser.newContext();
      const { page, noise } = await openPage(ctx);
      await page.goto(base);
      await page.waitForTimeout(900);
      let c = await counters(page);
      assert.ok(c.anim > 0, 'the landing page renders no motion at all');
      assert.ok(c.marks > 100, `only ${c.marks} marks on a whole rack`);
      assert.equal(c.lying, 0);
      for (const theme of ['dark', 'light', 'system']) {
        await page.click(`[data-theme-choice="${theme}"]`);
        await page.waitForTimeout(700);
        c = await counters(page);
        assert.equal(c.lying, 0, `moving without evidence in ${theme} theme`);
        assert.ok(c.anim > 0, `no motion in ${theme} theme`);
      }
      assert.deepEqual(noise, []);
      await ctx.close();
    });

    await t.test('removing evidence shrinks motion and grows declarations, and only into still', async () => {
      const ctx = await browser.newContext();
      const { page } = await openPage(ctx);
      await page.goto(base + '#/component/radar');
      await page.waitForTimeout(900);
      const kinds = () => page.evaluate(() => {
        const all = [...document.querySelectorAll('#view [data-motion]')];
        return {
          lit: new Set(all.map((e) => e.getAttribute('data-motion'))).size,
          list: [...new Set(all.map((e) => e.getAttribute('data-motion')))].sort().join(','),
          still: all.filter((e) => e.getAttribute('data-motion') === 'still').length,
        };
      });
      const before = await kinds();
      assert.ok(before.still === 0 || before.list.includes('still'));
      await page.click('#btn-evidence');
      await page.waitForTimeout(900);
      const after = await kinds();
      assert.ok(after.still >= before.still, 'refusing evidence produced fewer declarations');
      const litOnly = after.list.split(',').filter((k) => k !== 'still');
      for (const kind of litOnly) {
        assert.ok(before.list.split(',').includes(kind),
          `evidence removal manufactured new motion kind "${kind}"`);
      }
      assert.equal((await counters(page)).lying, 0);
      await page.click('#btn-evidence');
      await page.waitForTimeout(600);
      assert.deepEqual((await kinds()).list, before.list, 'evidence does not restore what it removed');
      await ctx.close();
    });

    await t.test('kill switch leaves the page byte-identical to the static export', async () => {
      const ctx = await browser.newContext();
      // collar carries the clocks (the only marks that edit the document
      // rather than composite over it); radar carries an infinite loop.
      // Both settled pages must be the same document as their never-started
      // exports -- identical bytes, not just identical appearance.
      for (const spec of ['collar', 'radar']) {
        const staticPage = await ctx.newPage();
        await staticPage.goto(`${base}?still=1#/component/${spec}`);
        await staticPage.waitForTimeout(800);
        const exported = await staticPage.evaluate(() => document.body.innerHTML);
        await staticPage.close();

        const { page, noise } = await openPage(ctx);
        await page.goto(base + `#/component/${spec}`);
        await page.waitForTimeout(1500);
        const alive = await page.evaluate(() => document.getAnimations().length
          + document.querySelectorAll('[data-elapsed-text]').length);
        assert.ok(alive > 0, `${spec}: nothing was alive to settle`);
        if (spec === 'radar') {
          assert.ok(await page.evaluate(() => document.getAnimations().length) > 0,
            'the cycle loop should still be running');
        }
        await page.click('#btn-motion');
        await page.waitForTimeout(650); // the readout repaints on its own beat
        const settled = await page.evaluate(() => document.body.innerHTML);
        assert.equal(settled, exported,
          `${spec}: settled markup differs from the markup a never-started page renders`);
        assert.equal((await counters(page)).lying, 0);
        assert.deepEqual(noise, [], spec);
        await page.close();
      }
      await ctx.close();
    });

    await t.test('reduced motion renders the whole rack at zero animation', async () => {
      const ctx = await browser.newContext({ reducedMotion: 'reduce' });
      const { page, noise } = await openPage(ctx);
      await page.goto(base);
      await page.waitForTimeout(900);
      const live = await page.evaluate(() => document.getAnimations().length);
      assert.equal(live, 0, 'prefers-reduced-motion page is still moving');
      const c = await counters(page);
      assert.equal(c.anim, 0);
      assert.equal(c.lying, 0);
      assert.ok(c.marks > 100, 'the refusal page lost its marks too');
      assert.equal(await page.getAttribute('#btn-motion', 'aria-pressed'), 'false');
      assert.deepEqual(noise, []);
      await ctx.close();
    });

    await t.test('no page scrolls sideways at 390px', async () => {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      for (const route of ['', '#/families/field', '#/component/radar',
        '#/component/collar', '#/component/dossier', '#/rules', '#/primitives']) {
        const { page } = await openPage(ctx);
        await page.goto(base + route);
        await page.waitForTimeout(500);
        const over = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(over <= 0, `${route || 'landing'}: ${over}px of horizontal overflow`);
        await page.close();
      }
      await ctx.close();
    });

    await t.test('the rack chrome owns no colour literal of its own', async () => {
      const files = fs.readdirSync(path.join(ROOT, 'app'), { recursive: true })
        .map(String).filter((f) => /\.(css|js|html)$/.test(f) && !f.startsWith('fixtures'));
      const offenders = [];
      for (const f of files) {
        const text = fs.readFileSync(path.join(ROOT, 'app', f), 'utf8');
        const hits = text.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g);
        if (hits) offenders.push(`${f}: ${[...new Set(hits)].join(' ')}`);
      }
      assert.deepEqual(offenders, [], 'app chrome colours belong in tokens.css');
    });
  } finally {
    await browser.close();
    server.close();
  }
});
