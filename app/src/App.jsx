import { useEffect, useState } from 'react';
import { currentRoute, subscribeRoute, href, HOME } from './router.js';
import { FAMILIES } from './catalog.js';
import { HonestyBar } from './components/HonestyBar.jsx';
import { Home } from './pages/Home.jsx';
import {
  readStoredTheme, storeTheme, applyTheme, effectiveTheme, attributeFor,
} from './theme.js';
import { isMotionOff, setMotionOff, stillnessReason, motionAvailable } from './motion-bridge.js';
import { intent } from '../../src/marks.js';

const NAV = [
  { route: HOME, label: 'The rule' },
  { route: { kind: 'overview' }, label: 'Families' },
  { route: { kind: 'rules' }, label: 'Mark kinds' },
  { route: { kind: 'primitives' }, label: 'Primitives' },
];

function routeKey(route) {
  return [route.kind, route.family || '', route.key || ''].join(':');
}

function isActive(navRoute, route) {
  if (navRoute.kind === 'overview') {
    return route.kind === 'overview' || route.kind === 'family' || route.kind === 'component';
  }
  return navRoute.kind === route.kind;
}

/** The family index. Every family is reachable from here in one click, and
 * the count beside each name is checked against the exports by
 * `test/app-registry.test.mjs`, so the number cannot go stale quietly. */
function Overview() {
  return (
    <div className="cd-page">
      <p className="cd-kicker">Seven families · one rule</p>
      <h1 className="cd-display">The families</h1>
      <p className="cd-lede">
        Each family answers one question about a fleet. Every component in every
        family is on the next page, running, with its measurement and its refusal
        beside each other.
      </p>
      <table className="cd-table">
        <thead>
          <tr><th>Family</th><th>The question it answers</th><th>Components</th></tr>
        </thead>
        <tbody>
          {FAMILIES.map((family) => (
            <tr key={family.slug}>
              <td>
                <a href={href({ kind: 'family', family: family.slug })}>{family.name}</a>
              </td>
              <td>{family.question}</td>
              <td data-count-for={family.slug}>—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pending({ route }) {
  return (
    <div className="cd-page">
      <p className="cd-kicker">Not wired yet</p>
      <h1 className="cd-display">{route.kind}</h1>
      <p className="cd-note">
        This route is on the way. It is declared rather than faked: the rule of
        this app is that nothing on screen pretends to be something it is not,
        and a page of stand-in content would be the app committing the thing the
        library exists to argue against.
      </p>
      <p className="cd-note">
        <a href={href(HOME)}>Back to the rule</a> ·{' '}
        <a href={href({ kind: 'overview' })}>The families</a>
      </p>
    </div>
  );
}

function Page({ route }) {
  if (route.kind === 'home') return <Home />;
  if (route.kind === 'overview') return <Overview />;
  return <Pending route={route} />;
}

export function App({ win = globalThis.window }) {
  const doc = win.document;
  const [route, setRoute] = useState(() => currentRoute(win));
  const [theme, setTheme] = useState(() => readStoredTheme(win.localStorage));
  const [off, setOff] = useState(() => isMotionOff(doc));

  useEffect(() => subscribeRoute(win, (next) => {
    setRoute(next);
    win.scrollTo(0, 0);
  }), [win]);

  useEffect(() => { applyTheme(doc, theme); }, [doc, theme]);

  // The route is the revision the specimens and the readout key off: new
  // page, new walk, fresh counts.
  const revision = routeKey(route);
  const reason = stillnessReason(win);
  const canRunMotion = motionAvailable();
  const painted = effectiveTheme(win, theme);

  const chooseTheme = (choice) => {
    setTheme(choice);
    storeTheme(win.localStorage, choice);
  };

  const toggleMotion = () => {
    const next = !off;
    setMotionOff(doc, next);
    setOff(isMotionOff(doc));
  };

  return (
    <>
      <header className="cd-rack">
        <div className="cd-rack-top">
          <a className="cd-mark" href={href(HOME)}>Cyberdeck<span>the showcase</span></a>
          <nav className="cd-nav" aria-label="Sections">
            {NAV.map((item) => (
              <a key={item.label} href={href(item.route)}
                 data-active={isActive(item.route, route) ? '1' : '0'}
                 {...intent('hover')}>{item.label}</a>
            ))}
          </nav>
          <div className="cd-switches">
            <span className="cd-switches-label">theme</span>
            <div className="cd-switches-group" role="group" aria-label="Theme">
              {['system', 'light', 'dark'].map((choice) => (
                <button key={choice} type="button" data-theme-choice={choice}
                        data-active={theme === choice ? '1' : '0'}
                        aria-pressed={theme === choice}
                        onClick={() => chooseTheme(choice)}
                        {...intent('press')}>{choice}</button>
              ))}
            </div>
            <span className="cd-switches-label">motion</span>
            <div className="cd-switches-group">
              <button type="button" data-control="motion" onClick={toggleMotion}
                      disabled={!canRunMotion}
                      aria-pressed={off}
                      title={reason || 'settle every animation the runtime is running'}
                      {...intent('press')}>
                {reason ? `still · ${reason}` : (off ? 'motion on' : 'motion off')}
              </button>
            </div>
          </div>
        </div>
        <HonestyBar doc={doc} revision={revision} />
      </header>

      <main className="cd-main" data-route={route.kind} data-theme-painted={painted}
            data-theme-choice={theme} data-attribute={attributeFor(theme) || 'none'}>
        <Page route={route} />
      </main>

      <footer className="cd-footer">
        Cyberdeck · MIT · every component on this page is the library function
        called with a fixture, rendered by the real runtime. Nothing here is a
        screenshot, and nothing here moves without a number behind it.
      </footer>
    </>
  );
}
