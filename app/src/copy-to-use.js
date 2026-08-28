// The block a visitor copies out of the showcase.
//
// It is assembled from the same two objects the page rendered with -- the
// component's export name and the model currently on screen -- rather than being
// written next to them. A snippet hand-tuned to look like the call is the kind of
// thing a documentation page does and a showcase must not: the moment the fixture
// changes, the copy becomes a second version of the truth.

import { IMPORT_PATH } from './registry/index.js';
import { callFor } from '../fixtures/index.js';

/** The import line. `cyberdeck-ui/components` is the real subpath from
 * `package.json` exports, not a path that only works inside this repo. */
export function importLine(key) {
  return `import { ${key} } from '${IMPORT_PATH}';`;
}

/** Import, blank line, call. The call is the exact one the page made. */
export function copyBlock(key, model) {
  return `${importLine(key)}\n\n${callFor(key, model)}`;
}

/** The call text on its own, for the test that runs it back through the
 * component and for the specimen that renders from it. */
export function callText(key, model) {
  return callFor(key, model);
}

/** The payload as it appears in the block -- extracted rather than trusted, so
 * the check is against what a visitor would paste. */
export function payloadOf(key, block) {
  const prefix = `${key}(`;
  const start = block.indexOf(prefix);
  if (start < 0) throw new Error(`block does not call ${key}()`);
  const body = block.slice(start + prefix.length, block.lastIndexOf(')'));
  return JSON.parse(body);
}
