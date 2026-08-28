// The honesty readout. The point of the whole page in four numbers, and
// the fourth one is the law: an animation whose target sits inside a
// declared stillness is the bug this library exists to prevent, and the
// counter must read 0 at all times -- in both themes, on every route,
// with the kill switch thrown or not.

export function honestyCounts(doc) {
  const animations = doc.getAnimations ? doc.getAnimations() : [];
  let movingWithoutEvidence = 0;
  for (const animation of animations) {
    const target = animation.effect && animation.effect.target;
    if (target && target.closest && target.closest('[data-motion="still"]')) {
      movingWithoutEvidence++;
    }
  }
  return {
    animations: animations.length,
    marks: doc.querySelectorAll('[data-motion]').length,
    declaredStill: doc.querySelectorAll('[data-motion="still"]').length,
    movingWithoutEvidence,
  };
}

export const HONESTY_IDS = {
  animations: 'h-anim',
  marks: 'h-marks',
  declaredStill: 'h-still',
  movingWithoutEvidence: 'h-lying',
};

export function paintHonesty(doc, counts = honestyCounts(doc)) {
  for (const [key, id] of Object.entries(HONESTY_IDS)) {
    const el = doc.getElementById(id);
    if (el) el.textContent = String(counts[key]);
  }
  const lying = doc.getElementById(HONESTY_IDS.movingWithoutEvidence);
  if (lying) {
    const bad = counts.movingWithoutEvidence > 0;
    lying.closest('.honesty-item').setAttribute('data-bad', bad ? '1' : '0');
  }
  return counts;
}
