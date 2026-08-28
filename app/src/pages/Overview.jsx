import { href } from '../router.js';
import { REGISTRY, allComponents } from '../registry/index.js';
import { fieldsFor } from '../../fixtures/index.js';
import { intent } from '../../../src/marks.js';

/** The whole library at once.
 *
 * This is the page that proves "every component is reachable by a link" -- one
 * row per specimen, its family, the fields the evidence toggle removes, and the
 * producer path a number can be chased back to. It is deliberately the plainest
 * thing here: an index that needs decoration has stopped being an index.
 *
 * It is also an eight-column table at 390px, which is why it sits in its own
 * scroll container and why `app/verify` asserts the body itself never scrolls
 * sideways. */
export function Overview() {
  const components = allComponents();

  return (
    <div className="cd-page cd-page-overview">
      <p className="cd-kicker">{components.length} components · {REGISTRY.length} groups · one rule</p>
      <h1 className="cd-display">The families</h1>
      <p className="cd-lede">
        Every family answers one question about a fleet. Every component in every
        family runs on this page’s links -- not a picture of one, not a description
        of one. Flip the rack’s evidence switch and every specimen on every page
        loses the number it draws from.
      </p>

      <div className="cd-scroll">
        <table className="cd-table cd-index">
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Family</th>
              <th scope="col">Draws from</th>
              <th scope="col">Evidence fields</th>
            </tr>
          </thead>
          <tbody>
            {components.map((component) => (
              <tr key={component.key} data-component={component.key}>
                <td>
                  <a href={href({ kind: 'component', key: component.key })} {...intent('hover')}>
                    {component.title}
                  </a>
                  <code>{component.key}</code>
                </td>
                <td>
                  <a href={href({ kind: 'family', family: component.family })}>{component.familyName}</a>
                </td>
                <td className="cd-index-producer">{component.producer}</td>
                <td className="cd-index-fields">
                  {fieldsFor(component.key).length || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="cd-display cd-h2">Also on this site</h2>
      <ul className="cd-index-links">
        <li><a href={href({ kind: 'rules' })}>The mark kinds</a> — the eleven marks, each live, each with its refusal</li>
        <li><a href={href({ kind: 'primitives' })}>The drawing exports</a> — the SVG primitives the components are built from</li>
      </ul>
    </div>
  );
}
