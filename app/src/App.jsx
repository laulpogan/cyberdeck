import { useEffect, useState } from 'react';
import { applyTheme, readStoredTheme, storeTheme, effectiveTheme } from './theme.js';
import { currentRoute, subscribeRoute, href } from './router.js';
import { HonestyBar } from './components/HonestyBar.jsx';
import { Home } from './pages/Home.jsx';
import { Overview } from './pages/Overview.jsx';
import { FamilyPage } from './pages/Family.jsx';
import { ComponentPage } from './pages/Component.jsx';
import { Rules } from './pages/Rules.jsx';
import { Primitives } from './pages/Primitives.jsx';
import { emptyEvidenceState, withGlobal, withField } from './evidence.js';
import { rewalk, motionAvailable, stillnessReason } from './motion-bridge.js';
import { paintGlobes } from './globe-paint.js';
import { intent } from '../../src/marks.js';

/** The rack the library hangs in.
 *
 * Three pieces of chrome are load-bearing: the theme switch, the evidence switch,
 * and the kill switch. They are in the rack rather than on a page because the
 * claim they demonstrate is about every screen, including the one that says the
 * screen is honest.
 *
 * The evidence switch is not a “dark mode for data”. It changes which models get
 * handed to the components, which changes what they refuse to animate -- so a
 * model change re-walks the runtime exactly the way a route change does. Whatever
 * was animating before belonged to a claim that is no longer on the page. */
export function App() {
  const [theme, setTheme] = useState(() => readStoredTheme(typeof window !== 'undefined' ? window.localStorage : null));
  const [route, setRoute] = useState(() =>
    typeof window === 'undefined' ? { kind: 'home' } : currentRoute(window));
  const [settled, setSettled] = useState(false);
  const [evidence, setEvidence] = useState(emptyEvidenceState);

  useEffect(() => subscribeRoute(window, setRoute), []);

  useEffect(() => {
    applyTheme(document, theme);
    storeTheme(window.localStorage, theme);
    // The choice and the result are different facts. Under `system` the attribute
    // is absent -- which is the only way an explicit light choice survives a dark
    // OS -- so what the page is painted as has to be read, not assumed.
    document.documentElement.dataset.painted = effectiveTheme(window, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.evidence = evidence.globalOff ? 'absent' : 'present';
  }, [evidence]);

  // The one place the runtime is started. It runs after the whole tree has
  // committed, because the runtime's only cancel is global: settle, lift the
  // operator's stamp unless they asked for stillness, then walk what is actually
  // on screen. See `rewalk()` in motion-bridge.js for what leaks otherwise.
  useEffect(() => {
    rewalk(document, { stopped: settled });
    // The globe's mesh is canvas, and the runtime has no reach into a bitmap: the
    // host is expected to call `paintGlobe` per figure, which is what the library's
    // own demo does. Skip it and the component renders as a black box with a
    // caption -- marked, present, invisible. After `rewalk`, because the mesh reads
    // `data-motion` on its own wrapper to decide whether it may turn at all.
    paintGlobes(document);
  }, [route, evidence, settled]);

  // Under `prefers-reduced-motion`, or with no engine, the runtime decided this is
  // the static export before this component existed. The switch says so and does
  // not offer to un-decide it: `start()` does not consult `off`, so the only way to
  // honour that decision is not to call it.
  const refused = !motionAvailable();

  const kill = () => {
    if (refused) return;
    setSettled((current) => !current);
  };

  const pageProps = { evidence, settled };
  let page = <Overview />;
  if (route.kind === 'home') page = <Home {...pageProps} />;
  else if (route.kind === 'family') page = <FamilyPage slug={route.family} {...pageProps} />;
  else if (route.kind === 'rules') page = <Rules evidence={evidence} />;
  else if (route.kind === 'primitives') page = <Primitives />;
  else if (route.kind === 'component') {
    page = (
      <ComponentPage
        componentKey={route.key}
        evidence={evidence}
        onToggleField={(path) => setEvidence((current) => withField(current, route.key, path))}
      />
    );
  }

  // Everything the counters are supposed to describe: the tree on screen, the
  // models it was handed, and whether the runtime is stopped. The readout polls on
  // its own interval; this only makes it re-read on the beat the change lands.
  const revision = [route.kind, route.family ?? '', route.key ?? '',
    evidence.globalOff ? 'off' : 'on', JSON.stringify(evidence.perKey), settled ? 'still' : 'moving'].join('|');

  return (
    <div className="cd-app">
      <header className="cd-rack">
        <div className="cd-rack-top">
          <a className="cd-mark" href={href({ kind: 'home' })}>
            CYBERDECK<span>SHOWCASE</span>
          </a>
          <nav className="cd-nav" aria-label="Sections">
            {[['overview', 'INDEX'], ['rules', 'MARKS'], ['primitives', 'PRIMITIVES']].map(
              ([kind, label]) => (
                <a key={kind} href={href({ kind })}
                   data-active={route.kind === kind ? '1' : '0'}>{label}</a>
              ),
            )}
          </nav>
          <div className="cd-switches">
            <span className="cd-switches-label">theme</span>
            <div className="cd-switches-group" role="group" aria-label="Theme">
              {['light', 'dark', 'system'].map((option) => (
                <button key={option} type="button" data-theme-option={option}
                        aria-pressed={theme === option}
                        onClick={() => setTheme(option)} {...intent('press')}>
                  {option}
                </button>
              ))}
            </div>
            <span className="cd-switches-label">evidence</span>
            <button type="button" data-control="evidence" aria-pressed={!evidence.globalOff}
                    aria-label={evidence.globalOff
                      ? 'Evidence absent: switch measurements back on'
                      : 'Evidence present: switch measurements off'}
                    onClick={() => setEvidence((current) => withGlobal(current, !current.globalOff))}
                    {...intent('press')}>
              {evidence.globalOff ? 'ABSENT' : 'PRESENT'}
            </button>
            <span className="cd-switches-label">motion</span>
            <button type="button" data-control="kill" aria-pressed={settled || refused}
                    disabled={refused} title={refused ? stillnessReason() : undefined}
                    aria-label={refused ? `Motion refused: ${stillnessReason()}`
                      : (settled ? 'Motion is stopped: run it again' : 'Stop every animation')}
                    onClick={kill} {...intent('press')}>
              {refused ? 'REFUSED' : (settled ? 'STOPPED' : 'SETTLE')}
            </button>
          </div>
        </div>
        <HonestyBar doc={typeof document !== 'undefined' ? document : undefined} revision={revision} />
      </header>

      <main key={`${route.kind}:${route.family ?? route.key ?? ''}`}
            data-evidence={evidence.globalOff ? 'absent' : 'present'}>
        {page}
      </main>

      <footer className="cd-footer">
        <span>cyberdeck-ui · motion is a measurement or it does not happen</span>
        <span>every specimen is the library function running, not a capture of it</span>
      </footer>
    </div>
  );
}
