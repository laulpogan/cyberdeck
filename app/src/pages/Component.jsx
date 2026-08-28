import { useRef } from 'react';
import { Specimen } from '../components/Specimen.jsx';
import { EvidenceControls } from '../components/EvidenceControls.jsx';
import { RefusalLedger } from '../components/RefusalLedger.jsx';
import { CodeBlock } from '../components/CodeBlock.jsx';
import { resolveModel } from '../evidence.js';
import { copyBlock } from '../copy-to-use.js';
import { href } from '../router.js';
import { componentByKey, familyBySlug } from '../registry/index.js';
import { intent } from '../../../src/marks.js';

function NotFound({ key: keyParam }) {
  return (
    <div className="cd-page">
      <p className="cd-kicker">Not in the registry</p>
      <h1 className="cd-display">{keyParam}</h1>
      <p className="cd-note">
        No component of that name is rendered here. The showcase refuses to
        invent one: <a href={href({ kind: 'overview' })}>the family index</a> lists
        the fifty-one that exist.
      </p>
    </div>
  );
}

/** One component, full-bleed, with its measurement under a control.
 *
 * The order is the argument: the drawing first, then the switch that takes its
 * number away, then the stillness that switch produces quoted out of the markup,
 * then where the number came from, then the code that would put it in your app.
 * Every panel reads off the same model the specimen rendered with. */
export function ComponentPage({ componentKey, evidence, onToggleField }) {
  const component = componentByKey(componentKey);
  if (!component) return <NotFound key={componentKey} />;

  const family = familyBySlug(component.family);
  const model = resolveModel(componentKey, evidence);
  const html = component.fn(model);
  const stage = useRef(null);

  const siblings = family.components.map((sibling) => sibling.key);
  const index = siblings.indexOf(componentKey);
  const back = siblings[index - 1];
  const forward = siblings[index + 1];

  return (
    <div className="cd-page cd-page-component" data-component={componentKey}
         data-evidence={evidence.globalOff ? 'absent' : 'present'}>
      <p className="cd-kicker">
        <a href={href({ kind: 'family', family: family.slug })}>{family.name}</a>
        {' · '}component {index + 1} of {siblings.length}
        {' · '}{family.file}
      </p>
      <h1 className="cd-display">{component.title}</h1>
      <p className="cd-lede">{component.note}</p>

      <div className="cd-stage" ref={stage} data-evidence-count={component.fields.length}>
        <Specimen html={html} label={componentKey}
                  className={component.fullWidth ? 'is-full-width' : ''} />
      </div>

      <div className="cd-panels">
        <section className="cd-panel" data-panel="evidence">
          <h2 className="cd-h2">Evidence</h2>
          <p className="cd-note">
            Each field below is one the drawing reads a measurement from. Remove
            one and the motion that depended on it stops; the specimen keeps its
            frame and its words either way.
          </p>
          <EvidenceControls componentKey={componentKey} state={evidence}
                            onToggleField={(path) => onToggleField(path)}
                            disabled={evidence.globalOff} />
        </section>

        <section className="cd-panel" data-panel="refusals">
          <h2 className="cd-h2">What it says instead</h2>
          <p className="cd-note">
            Read out of the specimen’s own markup, after render. This is the
            sentence a reviewer can grep for, which is the point of writing refusals
            into HTML at all.
          </p>
          <RefusalLedger scope={stage} revision={html} drawnOnly={component.refusalText} />
        </section>

        <section className="cd-panel" data-panel="cite">
          <h2 className="cd-h2">Where the numbers come from</h2>
          <p className="cd-cite" data-producer={component.producer}>
            {component.producer}
          </p>
          <p className="cd-note cd-refusal-quote">
            <b>Its own words:</b> <q>{component.refusal}</q>
          </p>
        </section>

        <CodeBlock text={copyBlock(componentKey, model)} />
      </div>

      <nav className="cd-page-nav" aria-label="Within this family">
        {back
          ? <a href={href({ kind: 'component', key: back })} {...intent('hover')}>← {back}</a>
          : <span />}
        <a href={href({ kind: 'family', family: family.slug })}>{family.name}</a>
        {forward
          ? <a href={href({ kind: 'component', key: forward })} {...intent('hover')}>{forward} →</a>
          : <span />}
      </nav>
    </div>
  );
}
