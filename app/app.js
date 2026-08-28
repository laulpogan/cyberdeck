// The showcase shell. Vanilla modules over the library's own contract:
// components are functions returning HTML strings, the runtime walks the
// DOM after they land. A framework that fought innerHTML and post-mount
// imperative work would cost more than it gave -- this file is the
// connective tissue and nothing else.
//
// Every state change re-renders: settle() cancels everything, the view is
// rebuilt from the fixtures and the current evidence flags, and start()
// hands the page back to the runtime. A page rebuilt with motion off is
// the static export -- which is the invariant the kill switch asserts.

import { SPECS, FAMILIES, FAMILY_BY_ID, controlOn } from './registry.js';
import { FIXTURES } from './fixtures/index.js';
import { clone, setPath } from './util.js';
import { copyFor } from './copy.js';
import { markBays, primitiveBays } from './galleries.js';
import { paintHonesty } from './honesty.js';
import { liveView, liveStart, liveStop } from './live.js';
import { paintGlobe } from '../src/components/globe.js';

const root = document.documentElement;
const view = document.getElementById('view');
const nav = document.getElementById('nav');
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const prefersReduced = window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const askedStill = /[?&]still=1\b/.test(window.location.search);

const state = {
  // Every control of every component starts with its evidence present.
  flags: {},                 // key -> boolean[] (false = that field removed)
  motionOff: prefersReduced || askedStill,
  theme: localStorage.getItem('cd-theme') || 'system',
};

function flagsFor(key) {
  if (!state.flags[key]) {
    state.flags[key] = SPECS[key].controls.map(() => true);
  }
  return state.flags[key];
}

export function currentModel(key) {
  const spec = SPECS[key];
  return spec.controls.reduce((model, control, i) => {
    if (flagsFor(key)[i] !== false) return model;
    return control.paths.reduce((m, path) => setPath(m, path, control.off), model);
  }, clone(FIXTURES[key]));
}

const evidenceAllPresent = () => Object.keys(SPECS).every(
  (k) => flagsFor(k).every(Boolean));
const setEvidenceAll = (on) => {
  for (const key of Object.keys(SPECS)) state.flags[key] = SPECS[key].controls.map(() => on);
};

const keysOfFamily = (famId) => Object.values(SPECS).filter((s) => s.family === famId).map((s) => s.key);

// ------------------------------------------------------------- rendering

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
  if (!parts.length) return { page: 'landing' };
  if (parts[0] === 'families' && parts[1]) return { page: 'family', id: parts[1] };
  if (parts[0] === 'component' && parts[1] && SPECS[parts[1]]) return { page: 'component', key: parts[1] };
  if (parts[0] === 'rules') return { page: 'rules' };
  if (parts[0] === 'primitives') return { page: 'primitives' };
  if (parts[0] === 'live') return { page: 'live' };
  return { page: 'missing', want: parts.join('/') };
}

const href = (key) => `#/component/${key}`;
const link = (key, label) => `<a href="${href(key)}">${esc(label ?? SPECS[key].name)}</a>`;

function bayHtml(spec) {
  return `<section class="bay${spec.wide ? ' wide' : ''}" id="bay-${spec.key}">
    <a class="bay-link" href="${href(spec.key)}">
      <span>${esc(spec.name)}</span><span class="fn">${esc(spec.exportName)}()</span>
    </a>
    <div class="bay-body" data-render="${spec.key}"></div>
  </section>`;
}

function stageHtml(key) {
  return `<div class="specimen-stage" data-render="${key}" id="stage"></div>`;
}

function evidenceListHtml(key) {
  const spec = SPECS[key];
  if (!spec.controls.length) {
    return `<ul class="evidence-list"><li><label><span class="path">this specimen draws nothing
      from a removable measurement -- its own doc comment says so</span></label></li></ul>`;
  }
  return `<ul class="evidence-list" data-evidence="${key}">${spec.controls.map((c, i) => `
    <li data-off="${flagsFor(key)[i] ? 0 : 1}">
      <label${i === 0 ? ` data-motion="intent" data-intent="press"` : ''}>
        <input type="checkbox" data-key="${key}" data-idx="${i}"
          ${flagsFor(key)[i] ? 'checked' : ''}>
        <span>${esc(c.label)}</span>
        <span class="path">${esc(c.paths.join('  '))}</span>
      </label>
    </li>`).join('')}</ul>`;
}

function viewLanding() {
  return `<div class="hero">
    <h1>Motion is a measurement<br><em>or it does not happen</em></h1>
    <p class="lede">Cyberdeck is a component library whose every animation is a
      function of a number some producer actually supplied. When that number is
      missing, the animation is not softened, defaulted, or filled with a
      spinner. It is <b>refused</b>, and the refusal is written into the markup
      where a person can read it.</p>
    <p class="landing-counter-demo">Watch the counters in the bar above, then use either
      switch: <b>REMOVE THE EVIDENCE</b> takes the poll interval and the
      contact ages away from the radar on the right. The sweep stops, the word
      <code>NO&nbsp;SWEEP</code> is what draws, and the counters report the
      refusal honestly. <a href="#/component/radar">Open the radar with its own controls →</a></p>
    <div class="hero-pair">
      <div class="stage-cell measured"><h3>Measured -- the poll is running</h3>
        <div data-render="radar-hero-true"></div></div>
      <div class="stage-cell refused"><h3>Unmeasured -- the refusal, in the markup</h3>
        <div data-render="radar-hero-false"></div></div>
    </div>
  </div>
  ${FAMILIES.map((f) => `
    <h2 class="family-head"><a href="#/families/${f.id}" style="color:inherit;text-decoration:none">${esc(f.name)}</a>
      <span style="color:var(--cd-steel-muted)"> · ${keysOfFamily(f.id).length}</span></h2>
    <p class="family-arg">${esc(f.question)}</p>
    <div class="rack-grid">${keysOfFamily(f.id).map((k) => bayHtml(SPECS[k])).join('')}</div>`).join('')}
  <p class="landing-foot">The rule in full: <a href="#/rules">the marks and their refusals</a> ·
    the geometry under everything: <a href="#/primitives">the drawing primitives</a> ·
    every component, one per screen: pick any name in the rack above.</p>`;
}

function viewFamily(fam) {
  return `<p class="crumb"><a href="#/">CYBERDECK</a> / FAMILIES / ${esc(fam.name)}</p>
    <h1>${esc(fam.name)} — <em>${keysOfFamily(fam.id).length} components</em></h1>
    <p class="lede">${esc(fam.question)}</p>
    <p class="family-arg">${esc(fam.argument)}</p>
    <p class="specimen-note">Evidence can be removed per component on its own
      page; the EVIDENCE switch in the bar removes it from everything on
      screen at once. Each name links to the component's controls, cites, and
      copy-to-use.</p>
    <div class="rack-grid">${keysOfFamily(fam.id).map((k) => bayHtml(SPECS[k])).join('')}</div>`;
}

function viewComponent(key) {
  const spec = SPECS[key];
  const fam = FAMILY_BY_ID[spec.family];
  const famKeys = keysOfFamily(spec.family);
  const idx = famKeys.indexOf(key);
  const model = currentModel(key);
  return `<p class="crumb"><a href="#/">CYBERDECK</a> / <a href="#/families/${fam.id}">${esc(fam.name)}</a> / ${esc(spec.key)}</p>
    <h1>${esc(spec.name)} <em style="font-size:.55em">· ${esc(spec.exportName)}()</em></h1>
    <p class="lede">${esc(fam.question)}.</p>
    <h2 class="family-head">Remove the evidence</h2>
    <p class="specimen-note">Each line is the exact field this component draws its
      motion from. Uncheck one: the animation stops, the refusal reason appears,
      and the component still occupies its space and still says what it
      wanted.</p>
    ${evidenceListHtml(key)}
    <h2 class="family-head">Live</h2>
    <div id="refuse-slot"></div>
    ${stageHtml(key)}
    <div class="detail-grid">
      <div class="detail"><h3>What it refuses, in its own sentence</h3>
        <blockquote class="quote">${esc(spec.refuse)}</blockquote></div>
      <div class="detail"><h3>Producer paths this drawing cites</h3>
        <ul class="cite-list" id="cite-slot"><li class="none">…</li></ul></div>
    </div>
    <h2 class="family-head">Copy to use</h2>
    <p class="specimen-note">The exact import and the exact call with the model
      currently on screen.</p>
    <button type="button" class="hbtn copy-btn" id="btn-copy"${` data-motion="intent" data-intent="press"`}>COPY THE CALL</button>
    <pre class="code-block" id="copy-slot">${esc(copyFor(spec, model))}</pre>
    <p class="pager">
      ${idx > 0 ? `« ${link(famKeys[idx - 1])}` : ''}
      <span class="mid">${famKeys.indexOf(key) + 1} of ${famKeys.length} in ${esc(fam.name)}</span>
      ${idx < famKeys.length - 1 ? `${link(famKeys[idx + 1])} »` : ''}
    </p>`;
}

function viewRules() {
  const bays = markBays();
  return `<p class="crumb"><a href="#/">CYBERDECK</a> / RULES</p>
    <h1>The marks — <em>measure or refuse</em></h1>
    <p class="lede">A mark is a plain object of <code>data-*</code> attributes.
      That is the whole interface: no component ships animation code, which is
      what lets a test assert honesty without a browser. Each bay below is one
      mark kind, called live -- left with evidence, right without. The printed
      attributes are exactly what the function returned.</p>
    <div class="rule-grid">${bays.map((b) => `
      <div class="rule-bay">
        <h3>${esc(b.name)}</h3>
        <p class="q">${esc(b.question)} · needs ${esc(b.needs)}</p>
        <div class="rule-pair">
          <div class="yes"><h4>Evidence present</h4>${b.measured()}</div>
          <div class="no"><h4>Refused</h4>${b.refused()}</div>
        </div>
        <i class="rule-reason">${esc(b.reason)}</i>
      </div>`).join('')}</div>`;
}

function viewPrimitives() {
  return `<p class="crumb"><a href="#/">CYBERDECK</a> / PRIMITIVES</p>
    <h1>The drawing primitives — <em>geometry, never a claim</em></h1>
    <p class="lede">Every component above is built from these. They inherit
      currentColor rather than naming a colour, and they refuse rather than
      draw: <code>wall()</code> returns null for an uncounted board,
      <code>curve()</code> returns null through one sample, because a chart
      drawn through one point is the most convincing lie a series can tell.</p>
    <div class="rule-grid">${primitiveBays().map((b) => `
      <div class="rule-bay"><h3>${esc(b.name)}</h3>
        <p class="q">${esc(b.note)}</p>${b.body}</div>`).join('')}</div>`;
}

function viewMissing(want) {
  return `<h1>NO ROUTE <em>${esc(want)}</em></h1>
    <p class="lede">The routes: <code>#/</code> landing · <code>#/families/&lt;family&gt;</code> ·
      <code>#/component/&lt;key&gt;</code> · <code>#/rules</code> · <code>#/primitives</code>.</p>`;
}

// ------------------------------------------------------------- mounting

const paintedGlobes = new WeakSet();
let lastHash = null;

function mount() {
  const route = parseRoute();

  // Cancelling rather than finishing is the whole design: every animation
  // rests where the markup already drew it, so a settled page IS the static
  // export. Re-render from that state, then hand it back to the runtime.
  window.CyberdeckMotion.settle();

  let html;
  let activeFam = '';
  switch (route.page) {
    case 'family': {
      const fam = FAMILY_BY_ID[route.id];
      html = fam ? viewFamily(fam) : viewMissing(`families/${route.id}`);
      activeFam = fam ? `#/families/${route.id}` : '';
      break;
    }
    case 'component': {
      const spec = SPECS[route.key];
      html = spec ? viewComponent(route.key) : viewMissing(`component/${route.key}`);
      activeFam = spec ? `#/families/${spec.family}` : '';
      break;
    }
    case 'rules': html = viewRules(); activeFam = '#/rules'; break;
    case 'primitives': html = viewPrimitives(); activeFam = '#/primitives'; break;
    case 'live': html = liveView(); break;
    case 'missing': html = viewMissing(route.want); break;
    default: html = viewLanding();
  }
  view.innerHTML = html;

  nav.innerHTML = [
    ...FAMILIES.map((f) => `<a href="#/families/${f.id}">${esc(f.name)}</a>`),
    '<a href="#/rules">RULES</a>',
    '<a href="#/primitives">PRIMITIVES</a>',
    '<a href="#/live">LIVE</a>',
  ].map((a) => a.replace('<a ', `<a ${a.includes(`href="${activeFam}"`) ? 'aria-current="page" ' : ''}`))
    .join('');

  // Render every live specimen the view asked for. The component functions
  // are the only thing that touches their markup.
  view.querySelectorAll('[data-render]').forEach((slot) => {
    let key = slot.dataset.render;
    let model;
    if (key === 'radar-hero-true') {
      // The hero pair is fixed on purpose: the MEASURED label can never be
      // shown holding a darkened model by a global toggle -- it would be a
      // label arguing with its own drawing.
      key = 'radar'; model = clone(FIXTURES.radar);
    } else if (key === 'radar-hero-false') {
      key = 'radar';
      model = SPECS.radar.controls.reduce((m, c) =>
        c.paths.reduce((mm, p) => setPath(mm, p, c.off), m), clone(FIXTURES.radar));
    } else model = currentModel(key);
    slot.innerHTML = SPECS[key].fn(model);
  });

  view.querySelectorAll('.cd-globe').forEach((figure) => {
    if (paintedGlobes.has(figure)) return;
    paintedGlobes.add(figure);
    paintGlobe(figure);
  });

  wire(route);
  applyMotion();
  if (route.page === 'component' && SPECS[route.key]) collectAfterRender(route.key);
  // The live page owns its own update beat; every other route stops it.
  // `() => !state.motionOff` is read at each poll, so a kill switch
  // thrown while the page is open still reaches the next frame's data.
  if (route.page === 'live') liveStart(() => !state.motionOff);
  else liveStop();
  // A re-render because an evidence box was ticked is not a navigation:
  // only a changed route resets the scroll, so the control you just
  // clicked stays under the cursor.
  if (lastHash !== location.hash) {
    lastHash = location.hash;
    window.scrollTo(0, 0);
  }
  document.title = route.page === 'component' && SPECS[route.key]
    ? `Cyberdeck — ${SPECS[route.key].name}` : 'Cyberdeck — motion is a measurement';
  // The readout and the evidence button are part of the render: a page
  // painted but reporting yesterday's counts is the lie this bar exists
  // to catch in other people's dashboards.
  paintEvidenceBtn();
  paintHonesty(document);
}

// The cites and refusals a viewer should see are properties of the RENDER,
// so they are read back off the mounted DOM rather than restated from the
// registry -- the page cannot then disagree with the drawing.
function collectAfterRender(key) {
  const stage = view.querySelector('#stage');
  const cites = [...new Set([...stage.querySelectorAll('[data-cite]')]
    .map((el) => el.getAttribute('data-cite'))
    .filter((c) => c && !/^https?:/.test(c)))];
  const slot = view.querySelector('#cite-slot');
  slot.innerHTML = cites.length
    ? cites.map((c) => `<li>${esc(c)}</li>`).join('')
    : '<li class="none">no data-cite on this render -- nothing on it claims a producer path</li>';

  const reasons = [...new Set([...stage.querySelectorAll('[data-still-reason]')]
    .map((el) => el.getAttribute('data-still-reason')))].filter(Boolean);
  const refuse = view.querySelector('#refuse-slot');
  refuse.innerHTML = reasons.length
    ? reasons.map((r) => `<span class="refuse-line">REFUSED HERE: ${esc(r)}</span>
        <code class="mark-attrs"> data-motion="still" data-still-reason="${esc(r)}"</code>`).join('')
    : '';
}

function wire(route) {
  view.querySelectorAll('input[data-key]').forEach((input) => {
    input.addEventListener('change', () => {
      const key = input.dataset.key;
      const idx = Number(input.dataset.idx);
      flagsFor(key)[idx] = input.checked;
      mount();
    });
  });

  const copy = view.querySelector('#btn-copy');
  if (copy) copy.addEventListener('click', async () => {
    const text = view.querySelector('#copy-slot').textContent;
    try { await navigator.clipboard.writeText(text); }
    catch { /* headless or denied -- the block below is already selectable */ }
    copy.dataset.copied = '1';
    copy.textContent = 'COPIED -- IT IS ALSO SELECTABLE BELOW';
  });

  // Shutter strips in the tape card are real interface response: the
  // operator caused them, so they move, and intent() marks them.
  view.querySelectorAll('.cd-tg-head').forEach((head) => {
    head.addEventListener('click', () => {
      const open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      const body = head.nextElementSibling;
      if (body) body.hidden = open;
    });
  });
}

// ------------------------------------------------------------- chrome

function applyMotion() {
  const btn = document.getElementById('btn-motion');
  if (state.motionOff) {
    window.CyberdeckMotion.settle();
    btn.textContent = 'OFF';
    btn.setAttribute('aria-pressed', 'false');
  } else {
    root.removeAttribute('data-motion-off');
    window.CyberdeckMotion.start();
    btn.textContent = 'ON';
    btn.setAttribute('aria-pressed', 'true');
  }
  // The same words however the page got here: a preference-held page and a
  // kill-switch-held page must be indistinguishable in the markup, or the
  // static export and the settled live page stop being the same document.
  btn.title = state.motionOff
    ? 'settled -- zero motion, by operator command'
    : 'live -- kill switch armed';
}

function applyTheme() {
  if (state.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', state.theme);
  document.querySelectorAll('[data-theme-choice]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.themeChoice === state.theme)));
}

function paintEvidenceBtn() {
  const btn = document.getElementById('btn-evidence');
  const on = evidenceAllPresent();
  btn.textContent = on ? 'PRESENT' : 'ABSENT';
  btn.setAttribute('aria-pressed', String(on));
}

document.getElementById('btn-motion').addEventListener('click', () => {
  if (prefersReduced || askedStill) return; // the preference is the producer here; it wins
  state.motionOff = !state.motionOff;
  applyMotion();
});

document.getElementById('btn-evidence').addEventListener('click', () => {
  setEvidenceAll(!evidenceAllPresent());
  mount();
});

document.querySelectorAll('[data-theme-choice]').forEach((b) => {
  b.addEventListener('click', () => {
    state.theme = b.dataset.themeChoice;
    localStorage.setItem('cd-theme', state.theme);
    applyTheme();
  });
});

window.addEventListener('hashchange', mount);

// The readout reports the LIVE truth of the page on its own beat -- the
// counters must never be quoted from a stale frame.
setInterval(() => paintHonesty(document), 400);

applyTheme();

// The runtime auto-starts on DOMContentLoaded. A module runs before that
// event, so the first render has to wait for it and start second: mount
// first and start() runs over the finished deck, mount at module time and
// it races its own animations -- a page where every mark moves twice and
// the counter reports twice the motion the eye sees.
function boot() {
  mount();
  paintEvidenceBtn();
}
if (document.readyState === 'loading' || document.readyState === 'interactive') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

// For tests: a deterministic hook to re-render without a browser dance.
window.__cyberdeckApp = { mount, state, currentModel, parseRoute, evidenceAllPresent };
