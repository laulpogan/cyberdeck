import { paintGlobe } from '../../src/components/globe.js';

/** The canvas the runtime cannot reach.
 *
 * `globe()` returns a `<canvas>` and an SVG layer, and it does not paint the mesh:
 * the host is expected to call `paintGlobe(figure)` once per figure, which the
 * library's own demo does by hand. Without it the component renders as an empty
 * black box with a caption -- present, marked, and completely invisible, which is
 * the worst failure a drawing can have.
 *
 * Once is load-bearing. `paintGlobe` starts a frame callback and a MutationObserver
 * on the root; run it twice on the same figure and the globe turns at double the
 * measured interval, and the interval is the whole reading. So the set below tracks
 * the figures this page has painted -- a re-render hands us a new element, which is
 * a figure that has genuinely never been painted, and the old one goes away with the
 * nodes its callbacks held.
 *
 * This is host glue, not app logic: it belongs next to the runtime call for the same
 * reason -- both run after the DOM has landed, and neither is a React concern. */
const painted = new WeakSet();

export function paintGlobes(scope = document) {
  const figures = [...scope.querySelectorAll('.cd-globe')];
  for (const figure of figures) {
    if (painted.has(figure)) continue;
    painted.add(figure);
    paintGlobe(figure);
  }
  return figures.length;
}

/** For the tests: has this figure already been given a frame loop? */
export function globeIsPainted(figure) {
  return painted.has(figure);
}
