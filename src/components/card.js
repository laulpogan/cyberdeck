// The wrapper every bounded specimen shares.
//
// These components go into a deck beside each other, so each one carries
// its own name and its own reason inside its own frame. The reason is
// read off the mark rather than passed alongside it, so a card cannot
// disagree with the drawing it holds.

import { attrs } from '../marks.js';

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
