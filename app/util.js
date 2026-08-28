// The two moves the evidence toggle needs: read a field out of a model,
// and write a value into a copy of it, addressed by a path string like
// `subject.authority` or `cells[*].health`.
//
// The dark fixture is derived by setPath alone, never hand-written, so
// the measured and unmeasured models of one component cannot drift the
// way two literals drift. The wildcard `[*]` maps a removal over every
// element of an array, which is what "the population was never
// enumerated per-cell" actually means -- removing one cell's reading by
// hand would be a different claim.

export const clone = (value) => structuredClone(value);

export function parsePath(path) {
  const segments = [];
  String(path).replace(/\[(\*|\d+)\]|[^.[\]]+/g, (match, bracket) => {
    if (bracket !== undefined) segments.push(bracket === '*' ? '*' : Number(bracket));
    else segments.push(match);
    return match;
  });
  return segments;
}

export function getPath(root, path) {
  return walkGet(root, parsePath(path));
}

function walkGet(node, segments) {
  if (!segments.length) return node;
  const [head, ...rest] = segments;
  if (head === '*') {
    return Array.isArray(node) ? node.map((el) => walkGet(el, rest)) : [];
  }
  if (node === null || node === undefined) return undefined;
  return walkGet(node[head], rest);
}

export function setPath(root, path, value) {
  return walkSet(root, parsePath(path), value);
}

function walkSet(node, segments, value) {
  const [head, ...rest] = segments;
  if (head === '*') {
    if (!Array.isArray(node)) return node;
    return node.map((el) => walkSet(el, rest, value));
  }
  if (!rest.length) {
    if (Array.isArray(node)) {
      const copy = node.slice();
      copy[head] = value;
      return copy;
    }
    return { ...(node ?? {}), [head]: value };
  }
  const copy = Array.isArray(node) ? node.slice() : { ...(node ?? {}) };
  copy[head] = walkSet(node?.[head], rest, value);
  return copy;
}

// Key order is insertion order and both models come from the same
// literal through the same structuredClone, so serialisation is stable
// enough to compare what a path currently holds.
export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
