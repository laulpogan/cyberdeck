import { Specimen } from '../components/Specimen.jsx';
import { MARK_KINDS, markText } from '../rules.js';
import { href } from '../router.js';
import { rewalk } from '../motion-bridge.js';
import { intent } from '../../../src/marks.js';

/** The rule, eleven ways.
 *
 * Each row is the same drawing twice: once with the measurement the mark asks for,
 * once without it. Nothing in the right-hand column is a picture of a refusal -- it
 * is the refusal, carrying the `data-still-reason` a reviewer would go and grep for,
 * quoted below the drawing in its own text so the sentence is readable at the same
 * size as the claim.
 *
 * The sentences come out of `src/marks.js`. The test that reads this page's data
 * looks for each one in that file, because the moment this page is allowed to
 * paraphrase, it becomes the app's opinion about the library rather than the
 * library's own account. */
export function Rules({ evidence = { globalOff: false } }) {
  const off = Boolean(evidence.globalOff);
  return (
    <div className="cd-page cd-page-rules">
      <p className="cd-kicker">{MARK_KINDS.length} marks · src/marks.js · one rule{off ? ' · evidence absent' : ''}</p>
      <h1 className="cd-display">Motion is a measurement<br />or it does not happen.</h1>
      <p className="cd-lede">
        Every animation in the library is one of these eleven attributes, and every
        one of them can be refused by the arguments it was handed. What follows is the
        pair on every row: the left drawing got its number, the right drawing did not.
        Nothing on the right was softened, defaulted, or replaced with a spinner -- it
        kept its shape, kept its words, and wrote the reason where you can inspect it.
      </p>

      {/* A screenshot of a page that has finished arriving shows two identical
          columns, which is the one thing this page must not look like. The replay is
          operator-caused, so it carries `intent`: the page has no loop of its own to
          demonstrate the rule, and a demo that animates itself to prove a point about
          not animating is the defect the page exists to report. */}
      <p className="cd-rule-replay">
        <button type="button" data-control="replay" onClick={() => rewalk(document)} {...intent('press')}>
          run the eleven again
        </button>
        <span>the left column moves, the right column does not</span>
      </p>

      {off && (
        <p className="cd-rule-replay" data-evidence="absent">
          <b>The rack switch is off.</b>
          <span>every left column below is now the refusal it was demonstrating: nothing on this page was supplied, so nothing on this page moves.</span>
        </p>
      )}

      <div className="cd-rules">
        {MARK_KINDS.map((kind) => {
          const measuredHtml = off ? kind.draw(kind.refuses) : kind.draw(kind.measured);
          const refusedHtml = kind.drawRefused ? kind.drawRefused() : kind.draw(kind.refuses);
          const reason = kind.refuses && kind.refuses['data-still-reason'];
          return (
            <article key={kind.kind} className="cd-rule" data-kind={kind.kind}>
              <header className="cd-rule-head">
                <h2 className="cd-h2">data-motion=&quot;{kind.kind}&quot;</h2>
                {kind.drawsRefused
                  ? <code className="cd-rule-attrs">{markText(kind.measured)}</code>
                  : <>
                    <code className="cd-rule-attrs" data-state="measured">{markText(kind.measured)}</code>
                    <code className="cd-rule-attrs" data-state="refused">{markText(kind.refuses)}</code>
                  </>}
              </header>
              <p className="cd-lede cd-rule-line">{kind.line}</p>
              <div className="cd-rule-pair">
                <figure className="cd-rule-cell" data-state={off ? 'refused' : 'measured'}>
                  <figcaption>{off
                    ? (kind.offNote || `the rack switch took it: ${kind.refuses['data-still-reason']}`)
                    : kind.given}</figcaption>
                  <div className="cd-scroll">
                    <Specimen html={measuredHtml} label={`rule-${kind.kind}`} />
                  </div>
                </figure>
                <figure className="cd-rule-cell" data-state="refused">
                  <figcaption>{kind.refused}</figcaption>
                  <div className="cd-scroll">
                    <Specimen html={refusedHtml} label={`rule-${kind.kind}-refused`} />
                  </div>
                  {reason && <p className="cd-rule-reason">
                    <code>data-still-reason=&quot;{reason}&quot;</code>
                  </p>}
                </figure>
              </div>
            </article>
          );
        })}
      </div>

      <p className="cd-footnote">
        Two of these are not kinds of motion at all. <code>still(reason)</code> is a
        declaration, and it exists because an element nobody marked and an element
        whose mark was forgotten would otherwise render identical HTML -- the rack’s
        counters can only count what says what it is. <code>attrs(mark)</code> is the
        seam that lets a mark travel as text, which is what lets a Python server and a
        React tree emit the same bytes: this page spreads those same objects into JSX.
      </p>

      <nav className="cd-page-nav" aria-label="Sections">
        <a href={href({ kind: 'overview' })}>The index</a>
        <a href={href({ kind: 'primitives' })}>The drawing exports →</a>
      </nav>
    </div>
  );
}
