/** Which app is this tool actually looking at — and the refusal to measure the wrong one.
 *
 * Two worktrees of this repository exist side by side, and both `vite.config.js` files claimed port
 * 5199 with `strictPort: true`. Whoever started first won the port, and every verify tool whose default
 * `BASE` was 5199 kept pointing at the port, not at the tree. Run `npm run verify:gauntlet` in one
 * worktree while the other holds 5199 and the gauntlet measures **the other branch's build** — 33 rows
 * of green printed over code this branch never changed. Nothing in the output looked wrong: the routes
 * resolve, the fixtures exist in both trees, and the components are 95% the same file. A gate that can
 * watch the wrong tree is worse than no gate, because it produces the exact artifact people trust.
 *
 * So two things, both small:
 *
 * 1. **The default comes from this tree's config.** `defaultBase()` reads the `server.port` out of the
 *    `vite.config.js` next to this file. Six tools used to hardcode one or the other port, and the two
 *    numbers drifted apart inside this one directory (four files said 5199, four said 5299).
 *
 * 2. **The page states which checkout rendered it.** `vite.config.js` defines `__CD_WORKTREE__` from
 *    `process.cwd()` and `app/src/main.jsx` stamps it on `<html data-cd-worktree=…>`. A rendered page is
 *    the only thing in this arrangement that knows where it came from, so it has to say so.
 *
 * When the stamp is missing the run stops rather than proceeding: an app that predates the stamp, or
 * that is not this app at all, cannot be told apart from the other tree's app by looking at it.
 *
 *   node app/verify/gauntlet.mjs                      # this tree's port, no env needed
 *   BASE=http://127.0.0.1:5199/ node app/verify/gauntlet.mjs   # refused, both paths named
 */
import { realpathSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The repository root this tool's own source lives under — not `process.cwd()`, which is wherever
 *  whoever typed the command happened to be standing. */
export function repoRoot() {
  const guess = resolve(here, '../..');
  try { return realpathSync(guess); } catch { return guess; }
}

/** `http://127.0.0.1:<the port this tree's vite config claims>/` */
export function defaultBase() {
  let port = null;
  try {
    const cfg = readFileSync(resolve(repoRoot(), 'vite.config.js'), 'utf8');
    const server = /server:\s*\{([^}]*)\}/.exec(cfg);
    const hit = server && /port:\s*(\d+)/.exec(server[1]);
    if (hit) port = hit[1];
  } catch { /* fall through: the refusal below is more informative than a crash here */ }
  if (!port) {
    console.error(`app-identity: cannot read server.port from ${resolve(repoRoot(), 'vite.config.js')} — `
      + `pass BASE explicitly rather than guessing a port.`);
    process.exit(2);
  }
  return `http://127.0.0.1:${port}/`;
}

/** Load the app once and believe it only if it identifies this checkout.
 *
 * Stops the run rather than recording rows: a measurement of another tree is not a partial result, it is
 * a false one, and `summary.json` written over the previous honest run is how a wrong green survives.
 */
export async function assertServedThisCheckout(browser, base = defaultBase(), tool = 'verify') {
  const want = repoRoot();
  const page = await browser.newPage();
  let got = null;
  let loadError = null;
  try {
    try {
      await page.goto(base.replace(/\/+$/, '') + '/', { waitUntil: 'commit' });
      // The stamp is set when the entry module evaluates, which under a cold dev server is after
      // `commit`. Poll rather than sleep: the answer is usually there in well under a second.
      await page.waitForFunction(
        () => !!document.documentElement.getAttribute('data-cd-worktree'),
        null, { timeout: 8000 },
      ).catch(() => { /* reported below as "no identity", which is the finding */ });
      got = await page.evaluate(() => document.documentElement.getAttribute('data-cd-worktree'));
    } catch (e) {
      loadError = e.message.split('\n')[0];
    }
  } finally {
    await page.close();
  }

  if (loadError) {
    console.error(`${tool}: nothing answered at ${base} (${loadError}). This tree expects its own dev `
      + `server on the port in vite.config.js; start it with \`npm run app\` from ${want}.`);
    process.exit(2);
  }
  if (!got) {
    console.error(`${tool}: the app at ${base} does not say which checkout it came from. Either it is `
      + `not this app, or its dev server started before app/src/main.jsx stamped the worktree — restart `
      + `it from ${want}. Refusing to measure an unidentified build.`);
    process.exit(2);
  }
  let real = got;
  try { real = realpathSync(got); } catch { /* compare the string as given */ }
  if (real !== want) {
    console.error(`${tool}: ${base} is serving a DIFFERENT CHECKOUT.\n  serving: ${got}\n  this run: ${want}`
      + `\nTwo worktrees of this repository can hold the same port, and this tool measures what the port `
      + `answers, not what the directory says. Rows were not written. Start this tree's server on its own `
      + `port (vite.config.js) and pass BASE=… if you meant to measure the other one.`);
    process.exit(2);
  }
  return got;
}
