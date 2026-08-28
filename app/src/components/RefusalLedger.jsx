import { useEffect, useState } from 'react';

/** The declared stillnesses on screen, read off the DOM after render.
 *
 * This is the "watch it refuse" half of the toggle. A refusal inside an SVG group
 * is honest but invisible -- `data-motion="still"` on a contour path says nothing
 * to a visitor who is not looking at the inspector -- so the page quotes every
 * `data-still-reason` in the specimen, with the element that carries it. Nothing
 * here is authored: the list is exactly what the markup says, in the order the
 * document holds it, and an empty list is the honest answer when the component
 * refuses by drawing rather than by declaring.
 *
 * It re-reads on `revision`, which is the fixture, the evidence state and the
 * route. The runtime's own effects run before this one because the specimen sits
 * earlier in the tree, so the marks it reports are the ones now on screen. */
export function RefusalLedger({ scope, revision, drawnOnly = null }) {
  const [refusals, setRefusals] = useState([]);

  useEffect(() => {
    const node = scope && scope.current;
    if (!node) {
      setRefusals([]);
      return undefined;
    }
    const found = [...node.querySelectorAll('[data-still-reason]')].map((el) => ({
      reason: el.getAttribute('data-still-reason'),
      carrier: el.getAttribute('class') || el.tagName.toLowerCase(),
    }));
    // Two elements can declare the same reason -- the collar's two counters, the
    // three bands of a tracker. Counting them is more truthful than listing three
    // identical lines.
    const grouped = new Map();
    for (const item of found) {
      const existing = grouped.get(item.reason);
      if (existing) existing.count += 1;
      else grouped.set(item.reason, { ...item, count: 1 });
    }
    setRefusals([...grouped.values()]);
    return undefined;
  }, [scope, revision]);

  if (!refusals.length) {
    return (
      <div className="cd-ledger" data-ledger="empty">
        <p className="cd-ledger-line cd-ledger-none">
          No declared stillness in this specimen.
          {drawnOnly ? <> It refuses in ink instead: <code>{drawnOnly}</code>. That is a
            refusal a person can see and a review script cannot find -- there is no
            {' '}<code>data-motion=&quot;still&quot;</code> anywhere in its markup.</> : null}
        </p>
      </div>
    );
  }

  return (
    <ul className="cd-ledger" data-ledger="listed">
      {refusals.map((item) => (
        <li key={item.reason} data-still-carrier={item.carrier}>
          <code>data-still-reason=&quot;{item.reason}&quot;</code>
          <span>×{item.count} on <em>{item.carrier}</em></span>
        </li>
      ))}
    </ul>
  );
}
