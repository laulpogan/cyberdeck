// The data adapter: the seam between a live producer and a fixture.
//
// Rules it keeps, because the rest of the library would be theatre
// without them:
// - A feed may only supply values on the paths the component's evidence
//   controls declare -- the paths the drawing itself cites. A patch that
//   carries a field the render never claimed to read is rejected field by
//   field, not trusted wholesale: a producer cannot add claims to a
//   drawing it does not animate.
// - With no reading yet, or a failed one, the model is the dark model:
//   declared paths nulled, refusals in the markup, the same refusal the
//   evidence toggle shows. There is no third state, because a third
//   state is where stale dashboards live.
// - Staleness is measured from the poll clock against the source's own
//   period, which is what the traffic and cycle marks are for: a stale
//   reading is rendered as stale, not re-labelled live.

import { clone, getPath, setPath } from './util.js';
import { FIXTURES } from './fixtures/index.js';

export function covers(pattern, leafPath) {
  const segs = pattern.split('.').flatMap((seg) => {
    const m = seg.match(/^(.*?)\[([*\d]+)\]$/);
    if (!m) return [seg];
    return [m[1], m[2] === '*' ? '*' : m[2]].filter((s) => s !== '');
  });
  const leaf = leafPath.split('.');
  if (segs.length !== leaf.length) return false;
  return segs.every((seg, i) => seg === '*' ? /^\d+$/.test(leaf[i]) : seg === leaf[i]);
}

function leavesOf(node, prefix, out) {
  if (node === null || typeof node !== 'object') { out.set(prefix, node); return out; }
  const entries = Array.isArray(node) ? node.entries() : Object.entries(node);
  for (const [k, v] of entries) leavesOf(v, prefix ? `${prefix}.${k}` : String(k), out);
  return out;
}

export function declaredPaths(spec) {
  return spec.controls.flatMap((c) => c.paths);
}

// Keep only the leaves of `patch` the spec's controls declare. Returns
// [accepted, rejected] leaf lists: a silent drop would hide a producer
// that believes it is saying more than the drawing can hear.
export function filterPatch(spec, patch) {
  const paths = declaredPaths(spec);
  const accepted = new Map(); const rejected = [];
  leavesOf(patch, '', new Map()).forEach((value, path) => {
    if (paths.some((p) => covers(p, path))) accepted.set(path, value);
    else rejected.push(path);
  });
  return [accepted, rejected];
}

export function applyPatch(fixture, accepted) {
  return [...accepted.entries()].reduce((m, [p, v]) => setPath(m, p, v), clone(fixture));
}

export function darkModel(spec) {
  return spec.controls.reduce(
    (m, c) => c.paths.reduce((mm, p) => setPath(mm, p, c.off), m), clone(FIXTURES[spec.key]));
}

export function createAdapter({ spec, fetchJson, periodMs, sourceStatePath, staleAfterFactor = 2 }) {
  let state = { at: null, polls: 0, fails: 0, error: null, accepted: null, rejected: [] };
  const stale = (now) => state.at !== null && now - state.at > periodMs * staleAfterFactor;

  return {
    state: () => ({ ...state }),

    async poll(now = Date.now()) {
      state.polls += 1;
      try {
        const patch = await fetchJson();
        const [accepted, rejected] = filterPatch(spec, patch);
        state = { ...state, at: now, error: null, accepted, rejected };
      } catch (err) {
        // The reading goes dark the moment its producer fails: holding
        // stale values under a live label is the failure mode this
        // whole library exists to refuse.
        state = {
          ...state, at: null, accepted: null, rejected: [],
          fails: state.fails + 1, error: String(err && err.message || err),
        };
      }
      return this.model(now);
    },

    // The model the page renders RIGHT NOW, computed from the last
    // reading and its measured age -- never from a label the feed wrote.
    model(now = Date.now()) {
      if (!state.accepted) return darkModel(spec);
      const model = applyPatch(FIXTURES[spec.key], state.accepted);
      if (stale(now) && sourceStatePath) {
        const current = getPath(model, sourceStatePath);
        if (current === 'live') return setPath(model, sourceStatePath, 'stale');
      }
      return model;
    },

    isStale: (now) => stale(now),
    ageSeconds: (now) => (state.at === null ? null : Math.round((now - state.at) / 10) / 10),
  };
}
