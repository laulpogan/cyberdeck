// The wrapper every bounded specimen shares.
//
// These components go into a deck beside each other, so each one carries
// its own name and its own reason inside its own frame. The reason is
// read off the mark rather than passed alongside it, so a card cannot
// disagree with the drawing it holds.

import { attrs } from '../marks.js';
import { frame, hatched, line, text } from '../draw.js';

export const esc = (v) => String(v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The card's drawing area, in user units. One pair of numbers so a deck
 * of specimens shares a shape by construction rather than by every
 * component agreeing separately. */
export const W = 340, H = 200;

/** The drawing a refusal keeps.
 *
 * A refusal is not a blank. Every component that refuses with an empty body used to leave a
 * card holding nothing but a caption and a sentence, and a reader who arrived at the page for
 * the shape of the thing found a hole where it would have been -- which is how "no measurement"
 * got mistaken for "nothing to look at". So the card draws the absence: the hatching the rest
 * of the library uses for unmeasured ground above and below the word that names what is
 * missing. A component whose missing measurement has a shape — a twin deck, a fleet wall,
 * three reels — passes `ghost`, and the ghost is drawn where the reading would have stood,
 * without the bands: the outline of the absent thing is itself the hatch. The full sentence stays in the card's own line underneath:
 * drawn twice it reads as a caption written by someone who did not trust the drawing.
 *
 * It is the card's decision rather than twenty-seven call sites because the rule is one rule:
 * a refusal occupies the space of the drawing it refuses. Components pass `ghost` when the
 * shape that is missing deserves to be outlined; everything else gets the same honest hole.
 */
export function refusalFrame({ word = 'UNMEASURED', ghost = [], cite = null,
                               width = W, height = H } = {}) {
  const band = 16;
  const middle = height / 2;
  // Two bands of the library's unmeasured ink bracket the word. A component that supplies its
  // own empty geometry does not need them: the outline of the thing that is missing is already
  // the hatch, and laying ink over it would hide the shape the refusal exists to keep.
  const bands = ghost.length ? [] : [
    hatched(14, middle - band - 14, width - 28, band),
    hatched(14, middle + 14, width - 28, band),
  ];
  const g = [
    ...ghost,
    ...bands,
    text(width / 2, middle + 4, String(word).toUpperCase(),
      { size: 11, anchor: 'middle', weight: '600', opacity: '.85' }),
    // The cite only when there is one. A placeholder here would be a claim about
    // provenance printed where provenance goes.
    ...(cite ? [text(14, height - 12, cite, { size: 6, opacity: '.55' })] : []),
  ];
  return frame(width, height, g.join(''),
    { label: `Refused: ${word} — ${cite || 'no cite supplied'}` });
}

export function card(key, title, body, { mark = null, note = null, ghost = [],
                                         refusalWord = null } = {}) {
  const refused = mark && mark['data-motion'] === 'still';
  // An empty body over a refusal is not a drawing, and the refusal still has to hold the
  // space the measurement would have held. Read it off the mark, as everything here is.
  const drawn = refused && !String(body || '').trim()
    ? refusalFrame({ word: refusalWord || 'UNMEASURED', ghost, cite: mark['data-cite'] })
    : body;
  return `<figure class="cd-card" data-specimen="${key}"${refused ? attrs(mark) : ''}>
  <figcaption class="cd-card-name">${esc(title)}</figcaption>
  <div class="cd-card-body">${drawn}</div>
  ${refused ? `<i class="cd-why">${esc(mark['data-still-reason'])}</i>`
            : (note ? `<p class="cd-card-note">${esc(note)}</p>` : '')}
</figure>`;
}

/** Two or more lines where one would run past the edge of the box holding
 * it. SVG text does not wrap, so a caption sized for a card has to be
 * broken on purpose or it silently leaves the drawing -- and breaking it
 * by character count cuts words in half, which is worse than overflowing
 * because it looks deliberate. */
export function wrapped(x, y, value, chars, options = {}, leading = 9) {
  const words = String(value).split(/\s+/);
  const lines = [''];
  for (const word of words) {
    const line = lines[lines.length - 1];
    if (line && (line + ' ' + word).length > chars) lines.push(word);
    else lines[lines.length - 1] = line ? line + ' ' + word : word;
  }
  return lines.map((line, i) => text(x, y + i * leading, line, options)).join('');
}
