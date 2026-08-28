// One place where the runtime is touched.
//
// `CyberdeckMotion.off` is computed once, at load, from three things the
// page does not get to overrule: the operator's reduced-motion preference,
// an explicit `?still=1`, and a vendor bundle that failed to parse. The
// runtime honours it for its own auto-start -- but `start()` does not
// check it, so any caller that calls start() on a page that decided it is
// the static export silently un-decides it. Under `prefers-reduced-motion`
// that is the difference between zero motion and a page that ignores the
// operator. So nothing in this app calls start() without passing through
// here first.

export function runtime() {
  return globalThis.CyberdeckMotion || null;
}

/** True when motion is available to be run at all. */
export function motionAvailable() {
  const motion = runtime();
  return Boolean(motion) && !motion.off;
}

/** Why the runtime already decided this page is the static export.
 * Returns null when it did not decide anything. */
export function stillnessReason(win = globalThis.window) {
  const motion = runtime();
  if (!motion) return 'the runtime never loaded';
  if (!motion.off) return null;
  if (win && win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'your system asks for reduced motion';
  }
  if (win && /[?&]still=1\b/.test(win.location.search)) return '?still=1 was requested';
  return 'the animation engine is unavailable';
}

/** Run the runtime over whatever markup is currently in the document. */
export function startMotion(scope) {
  if (!motionAvailable()) return false;
  runtime().start(scope);
  return true;
}

/** Cancel everything. Cancelling rather than finishing is the point: every
 * animation in the library rests at the geometry the markup already
 * declares, so a settled page IS the static export -- which is what makes
 * "settling leaves the markup byte-identical" an assertion rather than a
 * hope. */
export function settleMotion() {
  const motion = runtime();
  if (motion) motion.settle();
}

/** The kill switch, both ways. `settle()` stamps data-motion-off on the
 * root itself; the demos re-stamp it, and turning motion back on has to
 * remove it or every later `intent` response stays dead. */
export function setMotionOff(doc, off) {
  const root = doc.documentElement;
  if (off) {
    settleMotion();
    root.setAttribute('data-motion-off', '');
    return;
  }
  root.removeAttribute('data-motion-off');
  startMotion();
}

export function isMotionOff(doc) {
  return doc.documentElement.hasAttribute('data-motion-off');
}

/** The markup a settle() must not change.
 *
 * Measured on the body, not on the document element: settling is allowed
 * to stamp `data-motion-off` on <html> -- that attribute is the record
 * that the operator asked, and it is the one difference the assertion is
 * not about. */
export function renderedMarkup(doc) {
  return doc.body.innerHTML;
}
