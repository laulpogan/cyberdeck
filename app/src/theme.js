// The theme, as the tokens define it: three states, not two.
//
// `src/tokens.css` carries a complete light palette on bare `:root`, a
// dark palette under `prefers-color-scheme: dark` guarded as
// `:root:not([data-theme="light"])`, and the dark palette again under
// `:root[data-theme="dark"]`. So "system" is the absence of an attribute,
// and an explicit choice has to stamp one in *both* directions -- a
// light choice under a dark OS is only light because `[data-theme="light"]`
// keeps the media query from applying.

export const THEMES = ['system', 'light', 'dark'];
const STORE_KEY = 'cyberdeck.app.theme';

/** The attribute value a choice stamps, or null for "follow the OS". */
export function attributeFor(theme) {
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return null;
}

export function normalizeTheme(value, fallback = 'system') {
  return THEMES.includes(value) ? value : fallback;
}

export function readStoredTheme(storage) {
  if (!storage) return 'system';
  try {
    return normalizeTheme(storage.getItem(STORE_KEY));
  } catch (e) {
    return 'system';
  }
}

export function storeTheme(storage, theme) {
  if (!storage) return;
  try {
    storage.setItem(STORE_KEY, normalizeTheme(theme));
  } catch (e) {
    /* a private-mode store costs the choice, never the page */
  }
}

export function applyTheme(doc, theme) {
  const value = attributeFor(normalizeTheme(theme));
  if (value) doc.documentElement.setAttribute('data-theme', value);
  else doc.documentElement.removeAttribute('data-theme');
  return value;
}

/** What the page is actually painted as, once the media query and any
 * explicit stamp are both accounted for. */
export function effectiveTheme(win, theme) {
  const value = attributeFor(normalizeTheme(theme));
  if (value) return value;
  if (win && win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}
