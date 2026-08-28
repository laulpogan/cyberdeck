// The wrapper every bounded specimen shares.
//
// These components go into a deck beside each other, so each one carries
// its own name and its own reason inside its own frame. The reason is
// read off the mark rather than passed alongside it, so a card cannot
// disagree with the drawing it holds.

import { attrs } from '../marks.js';
import { text } from '../draw.js';

export const esc = (v) => String(v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The card's drawing area, in user units. One pair of numbers so a deck
 * of specimens shares a shape by construction rather than by every
 * component agreeing separately. */
export const W = 340, H = 200;

export function card(key, title, body, { mark = null, note = null } = {}) {
  const refused = mark && mark['data-motion'] === 'still';
  return `<figure class="cd-card" data-specimen="${key}"${refused ? attrs(mark) : ''}>
  <figcaption class="cd-card-name">${esc(title)}</figcaption>
  <div class="cd-card-body">${body}</div>
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
