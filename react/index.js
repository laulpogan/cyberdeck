// React, honestly: there is almost nothing here, and that is the point.
//
// A mark is an object whose keys are already `data-*` strings, so JSX
// spreads one directly:
//
//     <path {...trace(route.delivered, { cite: 'routes[].delivered' })} />
//
// No wrapper component, no context, no render prop. Every mark function
// from the core works unchanged in a React tree, which is the property
// the attribute contract was chosen for. What React genuinely needs is a
// way to start the runtime once and to restart it when a subtree
// re-renders with new marks -- so that is what this file provides, and
// nothing more. A component library on top of this would be a matter of
// taste; the marks are not.

import { useEffect } from 'react';

export * from '../src/marks.js';

/** Start the motion runtime for the lifetime of the app.
 *
 * Call once, near the root. Returns nothing: the runtime owns the
 * document, not a React subtree, because motion marks routinely sit on
 * SVG geometry rendered by code that has never heard of this library. */
export function useMotion({ enabled = true } = {}) {
  useEffect(() => {
    const motion = globalThis.CyberdeckMotion;
    if (!motion) return undefined;
    if (!enabled) {
      motion.settle();
      return undefined;
    }
    motion.start();
    // Settling on unmount rests every animation at the geometry the
    // markup already declares, so a page torn down mid-entrance leaves
    // the DOM in the state it would have had with no runtime at all.
    return () => motion.settle();
  }, [enabled]);
}

/** Re-run the runtime over marks that appeared since the last pass.
 *
 * React adds and removes marked nodes as state changes, and the runtime
 * walks the DOM rather than subscribing to a component tree. Pass the
 * values whose change introduces new marks -- usually the same list you
 * are rendering.
 *
 * The runtime settles before it re-walks, so calling this more often than
 * necessary costs a pass, never a double animation. */
export function useMotionEffect(deps = []) {
  useEffect(() => {
    const motion = globalThis.CyberdeckMotion;
    if (!motion) return;
    motion.settle();
    motion.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
