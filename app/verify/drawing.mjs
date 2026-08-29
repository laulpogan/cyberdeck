/** The instrument behind "a refusal keeps its space", in one place so it can be falsified.
 *
 * What the rule is about: pulling the measurement out must not take the *picture* with it. A
 * card may legitimately get shorter — a refusal of a four-row measurement is one line, not four,
 * and demanding that an absence reproduce the height of a presence would be demanding padding.
 * What it must not do is become a caption with nothing drawn in it.
 *
 * Two earlier versions of this measurement failed in opposite directions. The first ran only on
 * the evidence-present page, where nothing is refused, so the sweep stayed green for weeks while
 * twelve components answered "no measurement" with an empty card body — the globe 445px down to
 * 15. The second compared total card height across the switch at 60%, and then reported a false
 * failure on a refusal that is honestly shorter than what it refuses. A ratio cannot tell a
 * vanished picture from a smaller absence.
 *
 * So the instrument asks which *kinds* of picture a specimen draws, and whether the refusal still
 * draws each one. Kinds rather than counts, because the globe is drawn twice — the turning mesh
 * and the layer the pins sit in — and a rule that watched only the first stayed quiet while the
 * mesh was deleted out from under it; multiplicity is deliberately not compared, because a list
 * cannot refuse in four equal rows. A height floor stays as the backstop against a drawing that
 * survives at a size nobody could read.
 *
 * A "picture region" is `svg`, `canvas`, or an element the component stamps `data-drawing` —
 * eight specimens draw with HTML furniture (the MU/TH/UR console, the killmail receipt, the
 * decision tape), and a gate that only looks for `<svg>` is blind to exactly those.
 *
 * `app/verify/negative-control.mjs` proves this bites: it deletes a drawing from a live page and
 * requires the rule to name it, then requires silence on the same page untouched. An assertion
 * nobody has watched fail is a rumour.
 */
export const DRAWING_SELECTOR = 'svg, canvas, [data-drawing]';

/** A backstop, not the rule: a drawing region that survives at less than this height is not
 * showing anything. The number is one line of the library's smallest drawn type plus its
 * padding, which is the only calibration it can honestly claim — the first cut used 100px
 * because the collapsed refusals measured 15–97px, and that turned out to be an eyeballed
 * constant which then conflicted with a refusal that is legitimately short: the decision tape's
 * blank slot is 79px, one slot because nothing is queued. Presence of each drawing region is the
 * sharp half of this instrument; every collapse it was written for failed the presence test
 * outright (no drawing left, or a region deleted), and none of them needed the floor. */
export const MIN_DRAWING_PX = 48;

export function drawingVerdict(pairs) {
  const failures = [];
  for (const pair of pairs) {
    const measured = pair.measured;
    const refused = pair.refused;
    const measuredKinds = (measured.regions || []).map((r) => r.kind);
    if (!measuredKinds.length) continue; // never a picture, owes none
    const refusedKinds = new Set((refused.regions || []).map((r) => r.kind));
    if (!refusedKinds.size) {
      failures.push(`${pair.label} loses its drawing entirely when the evidence goes `
        + `(it draws ${measuredKinds.join(', ')} — ${measured.height}px of picture; refused: `
        + `nothing left to look at)`);
      continue;
    }
    const missing = measuredKinds.filter((kind) => !refusedKinds.has(kind));
    if (missing.length) {
      failures.push(`${pair.label} stops drawing ${missing.join(' and ')} when the evidence goes `
        + `(with its measurement it draws ${measuredKinds.join(', ')}; a refusal keeps the drawing `
        + `it refuses)`);
      continue;
    }
    // Per kind, not summed. The globe is two regions — the turning mesh and the pin layer —
    // and a summed floor stayed silent while the mesh was crushed to 60px behind a healthy
    // 420px layer. A picture that survives unreadably small is not a picture kept. The floor
    // is capped by what the measurement itself drew, so a refusal that is honestly smaller
    // than four rows of measurement is not required to pad out to them.
    const tallest = new Map();
    for (const region of refused.regions) {
      tallest.set(region.kind, Math.max(tallest.get(region.kind) || 0, region.height));
    }
    for (const region of measured.regions) {
      const floor = Math.min(MIN_DRAWING_PX, region.height);
      const now = tallest.get(region.kind) || 0;
      if (now < floor) {
        failures.push(`${pair.label}'s ${region.kind} collapses to ${now}px when the evidence goes `
          + `(it holds ${region.height}px with its measurement; a refusal keeps at least `
          + `${floor}px of that drawing)`);
      }
    }
  }
  return failures;
}

/** Evaluate this in the browser with `page.evaluate(eval(DRAWING_PROBE), DRAWING_SELECTOR)`. */
export const DRAWING_PROBE = `(selector) => [...document.querySelectorAll('[data-specimen-view]')]
  .map((n) => {
    const found = [...n.querySelectorAll(selector)];
    const kindOf = (el) => [
      el.tagName.toLowerCase(),
      (el.getAttribute('class') || '').split(/\\s+/).filter(Boolean)[0] || 'unclassed',
      el.getAttribute('data-drawing') || '',
    ].join(':');
    const byKind = new Map();
    for (const el of found) {
      const kind = kindOf(el);
      const h = Math.round(el.getBoundingClientRect().height);
      byKind.set(kind, Math.max(byKind.get(kind) || 0, h));
    }
    return {
      label: n.getAttribute('data-specimen-view') || '?',
      regions: [...byKind].map(([kind, height]) => ({ kind, height })),
      height: found.reduce((sum, el) => sum + Math.round(el.getBoundingClientRect().height), 0),
    };
  })`;
