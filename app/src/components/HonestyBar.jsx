import { useEffect, useState } from 'react';
import { honestyReadout } from '../honesty.js';

/** The four counters, on every screen.
 *
 * Sampled on an interval rather than derived from render, because the
 * animations being counted are not React's: they are handed to the browser
 * by a runtime that does not know a component tree exists. A count taken
 * at render time would report the page as it was a frame ago -- and
 * entrances are over in a few hundred milliseconds, so a page inspected
 * after settling reads zero whether or not anything moved. Same interval
 * the library's own demo pages use. */
export function HonestyBar({ doc, revision = '', tickMs = 250 }) {
  const [readout, setReadout] = useState({
    animations: 0, marks: 0, still: 0, movingWithoutEvidence: 0,
  });

  useEffect(() => {
    const report = () => setReadout(honestyReadout(doc));
    report();
    const id = setInterval(report, tickMs);
    return () => clearInterval(id);
  }, [doc, revision, tickMs]);

  const lying = readout.movingWithoutEvidence > 0;

  return (
    <div className="cd-honesty" role="status" aria-live="polite" data-lying={lying ? '1' : '0'}>
      <span className="cd-honesty-cell" data-counter="animations">
        <em>ANIMATIONS</em><b data-honesty="animations">{readout.animations}</b>
      </span>
      <span className="cd-honesty-cell" data-counter="marks">
        <em>MARKS</em><b data-honesty="marks">{readout.marks}</b>
      </span>
      <span className="cd-honesty-cell" data-counter="still">
        <em>DECLARED STILL</em><b data-honesty="still">{readout.still}</b>
      </span>
      <span className="cd-honesty-cell cd-honesty-verdict" data-counter="moving-without-evidence">
        <em>MOVING WITHOUT EVIDENCE</em>
        <b data-honesty="moving-without-evidence">{readout.movingWithoutEvidence}</b>
      </span>
      <span className="cd-honesty-note">
        {lying
          ? 'a running animation sits inside a declared stillness — this app is broken'
          : 'no animation runs under a refusal'}
      </span>
    </div>
  );
}
