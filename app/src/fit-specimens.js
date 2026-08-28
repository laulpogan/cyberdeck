/** Give a drawing the width it was drawn at, and let the container do the fitting.
 *
 * `card()` promises a 340-unit figure, and most components keep to it. Some — the
 * sibling constellation, the redacted channel, the redaction sheet — are drawn against
 * 470 or 590 units because that is what the thing they show needs. Squeezed into a
 * phone-width cell they come out at 63% of their own size: not a responsive drawing,
 * but type nobody can read, and the library's instrument floor is only a few units
 * below that. So a specimen is never reduced beneath its own viewBox width. It keeps
 * that width and the scroll container it already sits in (`app/styles/app.css`) scrolls.
 *
 * The number is read from the drawing, not written into the registry: the viewBox is
 * the truth about the drawing and a registry entry would be a transcription of it,
 * due to drift the first time a component was redrawn wider.
 */
export function fitToDesign(node) {
  // The svg that sets the specimen's coordinate system -- not a nested symbol inside it,
  // which has its own units and is sized by the library on purpose.
  // The drawing the container sizes: a svg with its own `width` attribute is a symbol at
  // a size the library picked — the 48-unit disc drawn at 30 — and giving the specimen a
  // min-width from *that* number would be sizing a card by its bullet.
  const svg = [...node.querySelectorAll('svg[viewBox]')]
    .find((candidate) => {
      const given = candidate.getAttribute('width') || '';
      return !given || given.endsWith('%');
    });
  const box = svg && svg.viewBox && svg.viewBox.baseVal;
  if (!box || !box.width) return;
  // Only where something is already prepared to scroll. Set on a plain grid cell this
  // would widen the track instead, and the page would scroll sideways — which is the
  // defect this app treats as a failure.
  const scroll = node.closest('.cd-scroll, .cd-cell-specimen');
  if (!scroll) return;
  node.style.minWidth = box.width > scroll.clientWidth + 1 ? `${box.width}px` : '';
}

/** Fit every specimen currently on the page. Returns the count that needed it. */
export function fitSpecimens(root = document) {
  let fitted = 0;
  for (const node of root.querySelectorAll('[data-specimen-view]')) {
    const before = node.style.minWidth;
    fitToDesign(node);
    if (node.style.minWidth !== before) fitted += 1;
  }
  return fitted;
}
