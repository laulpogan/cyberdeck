// Load order is load-bearing, and it is the whole reason the runtime can be
// imported rather than script-tagged: the engine must exist before the
// runtime reads it, and both must exist before any specimen mounts.
//
// `src/runtime.js` and `vendor/motion.min.js` are imported from where they
// live. The app has no copy of the library, and a showcase rendering a copy
// would be a second implementation of the truth.
import '../../vendor/motion.min.js';
import '../../src/runtime.js';

import '../../src/tokens.css';
import '../../src/motion.css';
import '../../src/components/components.css';
import '../styles/app.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { applyTheme, readStoredTheme } from './theme.js';
import { startMotion, stillnessReason } from './motion-bridge.js';

// Applied before the first paint of the tree, so an explicit theme choice
// does not flash the system palette first. `system` stamps nothing at all,
// which is what lets the media query in tokens.css decide.
applyTheme(document, readStoredTheme(globalThis.localStorage));

// Which checkout rendered this page. `__CD_WORKTREE__` is defined in vite.config.js from the `cwd` of
// the dev server, and the verify tools refuse to measure a build that cannot identify itself — two
// worktrees can answer the same port, and the rendered DOM of the wrong branch looks fine.
if (typeof __CD_WORKTREE__ === 'string' && __CD_WORKTREE__) {
  document.documentElement.setAttribute('data-cd-worktree', __CD_WORKTREE__);
}

// One start for the whole document. The runtime owns the document, not a
// component subtree, because motion marks routinely sit on SVG geometry
// rendered by code that has never heard of this library. Specimens restart
// it over their own subtree as their fixtures change; `startMotion` is the
// only caller, and it refuses when the runtime has already decided this page
// is the static export.
if (!startMotion()) {
  // Recorded rather than silent: a page with no motion because the operator
  // asked is a different claim from a page with no motion because a file
  // failed to load, and the chrome says which one it is.
  globalThis.__cyberdeckStillness = stillnessReason(globalThis.window);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App win={globalThis.window} />
  </StrictMode>,
);
