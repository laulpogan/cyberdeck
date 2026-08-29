/** The motion signature of every component in THIS tree, as one line of JSON on stdout.
 *
 * Kept as a real module at `app/verify/` — and copied by `motion-transitions.mjs` into the same
 * relative depth of whatever worktree it is sweeping — for two reasons. Its imports then resolve
 * identically in this repository and in a detached checkout of an old commit; and the app's own
 * import checker (`test/app-shell.test.mjs`) reads files as text, so embedding these import lines
 * inside a generator's string made it report an import that pointed nowhere. A tool that fails an
 * honesty check because of how it was written is not a tool worth keeping.
 */
import { allComponents } from '../../app/src/registry/index.js';
import { brightFor } from '../../app/fixtures/index.js';

const out = {};
for (const component of allComponents()) {
  try {
    const html = component.fn(brightFor(component.key));
    const marks = {};
    for (const g of html.matchAll(/data-motion="([a-z]+)"/g)) marks[g[1]] = (marks[g[1]] || 0) + 1;
    out[component.key] = Object.keys(marks).length ? marks : { none: 1 };
  } catch (err) {
    // A commit that cannot render is recorded as such: an empty object here would read as
    // "this component stopped moving" and the sweep would call a broken tree a clean history.
    out[component.key] = { threw: String(err.message).slice(0, 60) };
  }
}
process.stdout.write(JSON.stringify(out));
