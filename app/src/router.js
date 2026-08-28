// Hash routing, deliberately.
//
// The library's own demos are single files that open from `file://` with no
// server, and a showcase that needs a rewrite rule to survive a refresh is
// a showcase that cannot be handed to anyone as a folder. Hash routes map
// one-to-one onto the paths in the brief: `#/families/river` IS
// `/families/river`, and `href()` is the only place the shape is written.

export const HOME = { kind: 'home' };

export function parseHash(hash) {
  const path = String(hash || '').replace(/^#/, '');
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return HOME;
  const [head, param] = parts;
  if (head === 'families' && param) return { kind: 'family', family: param };
  if (head === 'component' && param) return { kind: 'component', key: param };
  if (head === 'families' || head === 'components') return { kind: 'overview' };
  if (head === 'rules') return { kind: 'rules' };
  if (head === 'primitives') return { kind: 'primitives' };
  if (head === 'overview') return { kind: 'overview' };
  return { kind: 'unknown', path };
}

/** The link for a route. Every anchor in the app goes through here so the
 * two route shapes cannot both exist. */
export function href(route) {
  switch (route.kind) {
    case 'home': return '#/';
    case 'family': return `#/families/${route.family}`;
    case 'component': return `#/component/${route.key}`;
    case 'rules': return '#/rules';
    case 'primitives': return '#/primitives';
    case 'overview': return '#/overview';
    default: return '#/';
  }
}

export function sameRoute(a, b) {
  return a.kind === b.kind && a.family === b.family && a.key === b.key;
}

/** Subscribe to the current route. Kept out of the components so the
 * parser above is testable in node, where there is no history. */
export function currentRoute(win) {
  return parseHash(win.location.hash);
}

export function subscribeRoute(win, listener) {
  const handler = () => listener(currentRoute(win));
  win.addEventListener('hashchange', handler);
  return () => win.removeEventListener('hashchange', handler);
}

export function go(win, route) {
  win.location.hash = href(route).slice(1);
}
