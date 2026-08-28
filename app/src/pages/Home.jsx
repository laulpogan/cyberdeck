import { collar } from '../../../src/components/river.js';
import { Specimen } from '../components/Specimen.jsx';

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

const MEASURED = {
  elapsedSeconds: 9400,
  waitingSeconds: 640,
  sourceState: 'live',
  cite: 'evidence.operator.deadline_at',
};

const UNMEASURED = {
  elapsedSeconds: null,
  waitingSeconds: null,
  sourceState: 'live',
  cite: 'evidence.operator.deadline_at',
};

export function Home() {
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
        <figure className="cd-pair-cell" data-measured="1">
          <figcaption>
            <b>MEASURED</b>
            <span>evidence.operator.deadline_at supplies how long it has run</span>
          </figcaption>
          <Specimen html={collar(MEASURED)} revision="home-measured" label="collar" />
        </figure>
        <figure className="cd-pair-cell" data-measured="0">
          <figcaption>
            <b>UNMEASURED</b>
            <span>the same component, the same shape, one field removed</span>
          </figcaption>
          <Specimen html={collar(UNMEASURED)} revision="home-unmeasured" label="collar" />
        </figure>
      </div>

      <p className="cd-pair-verdict">
        The left collar counts because somebody measured how long it has run. The
        right collar does not count, because nobody did. It keeps its frame, its
        dial and its words — the dial goes dashed and reads <code>UNMEASURED</code>{' '}
        — and it writes the reason where you can inspect it:
      </p>
      <pre className="cd-cite-line">data-motion=&quot;still&quot;
data-still-reason=&quot;no duration was measured&quot;</pre>
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
