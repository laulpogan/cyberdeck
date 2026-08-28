import { Specimen } from '../components/Specimen.jsx';
import { PRIMITIVES } from '../primitives.js';
import { href } from '../router.js';

/** The vocabulary the components are cut from.
 *
 * Seventeen exports that return strings of SVG. They are shown here because the
 * library's claim is that nothing is decoration, and a shape you can only see inside
 * somebody else's chart is a shape you cannot check. Each one is the export itself,
 * called with the arguments the components pass it. */
export function Primitives() {
  return (
    <div className="cd-page cd-page-primitives">
      <p className="cd-kicker">{PRIMITIVES.length} exports · src/draw.js</p>
      <h1 className="cd-display">The drawing exports</h1>
      <p className="cd-lede">
        Every component in the library is built from these. They take numbers and
        return strings of SVG, they are deterministic, and three of them exist only to
        draw an absence: the hatch, the grain, and an axis with nothing on it.
      </p>

      <div className="cd-primitives">
        {PRIMITIVES.map((primitive) => (
          <section key={primitive.name} className="cd-primitive" data-primitive={primitive.name}>
            <header>
              <b>{primitive.name}</b>
              <code>{primitive.call}</code>
            </header>
            <div className="cd-scroll">
              <Specimen html={primitive.html()} label={`primitive-${primitive.name}`} />
            </div>
            {primitive.note && <p className="cd-primitive-note">{primitive.note}</p>}
          </section>
        ))}
      </div>

      <nav className="cd-page-nav" aria-label="Sections">
        <a href={href({ kind: 'rules' })}>← The mark kinds</a>
        <a href={href({ kind: 'overview' })}>The index</a>
      </nav>
    </div>
  );
}
