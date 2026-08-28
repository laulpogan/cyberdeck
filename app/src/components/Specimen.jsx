import { useEffect, useRef } from 'react';
import { startMotion } from '../motion-bridge.js';

/** One live component from the library, in the real DOM, with the real
 * runtime walking it.
 *
 * The markup arrives as a string because that is what every component in
 * the library returns -- a function taking a model and giving back HTML.
 * The container is deliberately opaque to React: the runtime mutates the
 * nodes after mount (it hands them to the browser's animation engine, and
 * some kinds write text into them as they count), and a diff that did not
 * make those writes would fight them. So React owns the chrome and never
 * reaches inside a specimen.
 *
 * `revision` is what changed -- the fixture, the evidence switches, the
 * route. The runtime settles before it re-walks, so calling it more often
 * than necessary costs a pass, never a double animation. */
export function Specimen({ html, revision = '', label, className = '' }) {
  const host = useRef(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return undefined;
    // Not the shared `useMotionEffect`: that calls start() unconditionally,
    // and start() does not consult the runtime's own decision about
    // reduced motion. See motion-bridge.js.
    startMotion(node);
    return undefined;
  }, [revision]);

  return (
    <div
      ref={host}
      className={className ? `cd-specimen ${className}` : 'cd-specimen'}
      data-specimen-view={label || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
