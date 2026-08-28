import { useRef } from 'react';

/** One live component from the library, in the real DOM, with the real runtime
 * walking it.
 *
 * The markup arrives as a string because that is what every component in the
 * library returns -- a function taking a model and giving back HTML. The container
 * is deliberately opaque to React: the runtime mutates the nodes after mount (it
 * hands them to the browser's animation engine, and some kinds write text into
 * them as they count), and a diff that did not make those writes would fight them.
 * So React owns the chrome and never reaches inside a specimen.
 *
 * Keeping that promise takes one deliberate line. React compares the value of
 * `dangerouslySetInnerHTML` by reference, and the value is an object literal, so a
 * re-render of *anything* -- the theme switch, the kill switch, a counter ticking
 * -- hands React a new `{ __html }` with the same string in it, React decides the
 * property changed, and the browser reparses the whole specimen. Every animation
 * the runtime started is then attached to a node that is no longer on the page, and
 * the counters keep writing text into it. The cache below makes the object identity
 * track the string, which is what "opaque to React" actually has to mean.
 *
 * This component does not start the runtime. One caller does: `App`, through
 * `rewalk()`, after the whole tree has committed -- because the runtime's only
 * cancel is global, and starting per-specimen would mean the animations of a tree
 * that is on its way out are never cancelled at all. */
export function Specimen({ html, label, className = '' }) {
  const host = useRef(null);
  const cache = useRef({ html: null, markup: { __html: '' } });
  if (cache.current.html !== html) cache.current = { html, markup: { __html: html } };

  return (
    <div
      ref={host}
      className={className ? `cd-specimen ${className}` : 'cd-specimen'}
      data-specimen-view={label || undefined}
      dangerouslySetInnerHTML={cache.current.markup}
    />
  );
}
