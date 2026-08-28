import { Specimen } from '../components/Specimen.jsx';
import { resolveModel } from '../evidence.js';
import { href } from '../router.js';
import { familyBySlug } from '../registry/index.js';
import { intent } from '../../../src/marks.js';

function UnknownFamily({ slug }) {
  return (
    <div className="cd-page">
      <p className="cd-kicker">Not a family</p>
      <h1 className="cd-display">{slug}</h1>
      <p className="cd-note">
        Nothing here answers to that name. <a href={href({ kind: 'overview' })}>The index</a>{' '}
        lists the seven families and the instruments.
      </p>
    </div>
  );
}

/** A whole family on one page, every component running.
 *
 * Rendered from the registry rather than written per family, so a family cannot
 * be wired today and quietly forgotten tomorrow -- and so that adding a component
 * upstream puts it on this page the moment it has a fixture, or fails the
 * coverage test.
 *
 * Full-width specimens (the lane chart, the overview grid, the globe) get a row of
 * their own inside an `overflow-x: auto` container. The page body never scrolls
 * sideways for their sake; they scroll themselves, or they do not fit. */
export function FamilyPage({ slug, evidence }) {
  const family = familyBySlug(slug);
  if (!family) return <UnknownFamily slug={slug} />;

  return (
    <div className="cd-page cd-page-family" data-family={family.slug}>
      <p className="cd-kicker">{family.components.length} components · {family.file}</p>
      <h1 className="cd-display">{family.name}</h1>
      <p className="cd-lede">{family.question}. {family.argument}</p>

      <div className="cd-deck">
        {family.components.map((component) => {
          const model = resolveModel(component.key, evidence);
          const html = component.fn(model);
          return (
            <section key={component.key}
                     className={`cd-deck-item${component.fullWidth ? ' is-wide' : ''}`}
                     data-component={component.key}>
              {/* The card inside draws its own title, so the head would be saying it
                  twice. The head carries the key instead -- the string a visitor
                  types in an import, and the thing they are clicking to get to. */}
              <header className="cd-deck-head">
                <a href={href({ kind: 'component', key: component.key })} {...intent('hover')}>
                  {component.key}<span aria-hidden="true"> ↗</span>
                </a>
                <span className="cd-deck-cite" data-producer={component.producer}>
                  {component.producer}
                </span>
              </header>
              <div className="cd-scroll">
                <Specimen html={html} label={component.key} />
              </div>
            </section>
          );
        })}
      </div>

      <nav className="cd-page-nav" aria-label="Families">
        <a href={href({ kind: 'overview' })}>All families</a>
      </nav>
    </div>
  );
}
