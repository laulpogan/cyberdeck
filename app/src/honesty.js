// The honesty readout's arithmetic, kept out of React so a test can read
// it and so the number on the page is provably the same number a test
// asserts. There is one implementation of each count.
//
// `MOVING WITHOUT EVIDENCE` is the count the whole app is judged by: an
// animation whose target sits inside a subtree that has declared itself
// still. It is not a stylistic preference. A page where it is non-zero is
// a page where motion is running over a refusal, which is the specific lie
// this library exists to make findable.

/** @param {Document|Element} scope the subtree to count marks in */
export function countMarks(scope) {
  return scope.querySelectorAll('[data-motion]').length;
}

/** @param {Document|Element} scope */
export function countStill(scope) {
  return scope.querySelectorAll('[data-motion="still"]').length;
}

/** @param {Document} doc */
export function animationsOf(doc) {
  const list = typeof doc.getAnimations === 'function' ? doc.getAnimations() : [];
  return Array.prototype.slice.call(list);
}

/** Animations running inside a declared stillness. This is the filter,
 * lifted from the demo pages, kept here so the gate and the readout
* cannot drift apart. */
export function movingWithoutEvidence(animations) {
  return animations.filter((a) => {
    const target = a.effect && a.effect.target;
    return target && target.closest && target.closest('[data-motion="still"]');
  }).length;
}

/** The four counters, in the order the bar shows them.
 *
 * `scope` is the content subtree the counts describe: the whole document,
 * so the chrome's own motion is counted alongside the specimens'. Hiding
 * the chrome from the count would be the cheapest way to keep the last
 * number at zero, and the least honest. */
export function honestyReadout(doc, scope = doc) {
  const animations = animationsOf(doc);
  return {
    animations: animations.length,
    marks: countMarks(scope),
    still: countStill(scope),
    movingWithoutEvidence: movingWithoutEvidence(animations),
  };
}
