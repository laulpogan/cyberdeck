import { collar } from '../../../src/components/river.js';
import { Specimen } from '../components/Specimen.jsx';
import { resolveModel, evidenceSummary, emptyEvidenceState } from '../evidence.js';
import { darkFor } from '../../fixtures/index.js';

// The landing page has one job: make a visitor understand the rule in
// under fifteen seconds by watching something refuse. So this is not an
// introduction to the library, it is the collar.
//
// The collar is the sharpest refusal in the set because it is the one a
// viewer can check for themselves in three seconds: a countdown needs an
// instant to count down to, nobody supplies one, so the collar counts up
// and the ring stays open. Given a measured elapsed it animates; take the
// measurement away and it stops, keeps its shape, and says why in its own
// markup. The copy below is the component's own sentence, not a paraphrase.

// The models are the registry's, not a second copy written for this page: the
// collar a visitor sees here is the collar at `#/component/collar`, with the same
// numbers and the same code block underneath it.

export function Home({ evidence = emptyEvidenceState() }) {
  // The rack switch reaches the landing too. With evidence absent, the left collar
  // loses its elapsed the same as the right one, and the caption says so instead of
  // leaving two specimens that look like the same refusal by accident. A page that
  // kept animating while declaring nothing on it was supplied would be exactly the
  // defect `MOVING WITHOUT EVIDENCE` exists to catch.
  const measured = resolveModel('collar', evidence);
  const unmeasured = darkFor('collar');
  const taken = evidenceSummary('collar', evidence).removed > 0;

  return (
    <div className="cd-page cd-page-home">
      <p className="cd-kicker">Cyberdeck · sixty components · seven families · one rule</p>
      <h1 className="cd-display">
        Motion is a measurement<br />or it does not happen.
      </h1>
      <p className="cd-lede">
        Every animation in this library is a function of a number some producer
        actually supplied. When that number is missing the animation is not
        softened, defaulted, or filled in with a spinner. It is refused, and the
        refusal is written into the markup where a person can read it.
      </p>

      <div className="cd-pair" data-evidence-pair="collar">
        <figure className="cd-pair-cell" data-measured={taken ? '0' : '1'}>
          <figcaption>
            <b>{taken ? 'EVIDENCE ABSENT' : 'MEASURED'}</b>
            <span>{taken
              ? 'the rack switch took the elapsed reading: nothing on this page was supplied'
              : 'evidence.operator.deadline_at supplies how long it has run'}</span>
          </figcaption>
          <Specimen html={collar(measured)} label="collar-measured" />
        </figure>
        <figure className="cd-pair-cell" data-measured="0">
          <figcaption>
            <b>UNMEASURED</b>
            <span>the same component, the same shape, one field removed</span>
          </figcaption>
          <Specimen html={collar(unmeasured)} label="collar-unmeasured" />
        </figure>
      </div>

      <p className="cd-pair-verdict">
        The left collar counts because somebody measured how long it has run. The
        right collar does not count, because nobody did. It keeps its frame, its
        dial and its words — the dial goes dashed and reads <code>UNMEASURED</code>{' '}
        — and it writes the reason where a person can inspect it:
      </p>
      <pre className="cd-cite-line">data-motion=&quot;still&quot;
data-still-reason=&quot;no duration was measured&quot;</pre>
      <p className="cd-pair-verdict">
        The two readings under the dial are <code>2h 36m</code> and <code>10m</code>, and
        they will read <code>2h 37m</code> and <code>11m</code> when the next minute has
        been measured. They do not tick, because the producer reports minutes, and a
        counter that moved faster than its source would be theatre. What the readings did
        do is draw the ring: the arc across the dial <em>is</em> the elapsed measurement,
        and the right collar has no arc to draw.
      </p>
      <p className="cd-pair-verdict">
        Nothing was softened and nothing was filled in. One field went away and a
        motion stopped happening. That is the whole library, sixty times over.
      </p>

      <h2 className="cd-display cd-h2">What it refuses</h2>
      <table className="cd-table">
        <thead>
          <tr><th>Situation</th><th>What happens</th></tr>
        </thead>
        <tbody>
          <tr><td>A route delivered nothing</td><td>The path does not draw itself</td></tr>
          <tr><td>The feed went stale</td><td>The clock stops and the pulse stops</td></tr>
          <tr><td>Nobody counted the population</td><td>The stagger is refused, not invented</td></tr>
          <tr><td>A quantity was never measured</td><td>The bar does not grow to zero</td></tr>
          <tr><td>A poll is overdue</td><td>The cycle refuses rather than wrapping</td></tr>
        </tbody>
      </table>
      <p className="cd-footnote">
        The last one is the whole design in miniature. A poll due forty seconds
        ago that has not landed <em>is the finding</em>. An indicator that
        quietly wrapped and started again would erase it.
      </p>
    </div>
  );
}
