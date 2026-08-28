// The live page: the showcase's one consumer that does not read a
// fixture. The adapter owns the model; this module owns the DOM seam --
// replacing one slot on every poll, restarting motion only on that slot,
// only while motion is allowed -- so the rest of the rack's rules (kill
// switch, reduced motion, honesty bar) hold over live data unchanged.
//
// The poll itself is the measured cadence the traffic chip pulses at:
// period 6000ms is the producer's declared interval, and the chip's
// live/stale state is computed from the age of the last good fetch, not
// from a wish. Stop the feed and this page goes dark exactly where the
// radar's controls declare -- which is the demonstration.

import { SPECS } from './registry.js';
import { createAdapter } from './adapter.js';
import * as M from '../src/marks.js';

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PERIOD_MS = 6000;   // the producer's declared poll period
const POLL_MS = 2000;     // the page asks more often than the source answers

let adapter = null;
let timer = null;

function fetchJson() {
  return fetch('/feed/radar.json', { cache: 'no-store' })
    .then((r) => {
      if (!r.ok) throw new Error(`feed returned HTTP ${r.status}`);
      return r.json();
    });
}

export function liveView() {
  return `<p class="crumb"><a href="#/">CYBERDECK</a> / live</p>
    <h1>LIVE FEED <em style="font-size:.55em">· radar()</em></h1>
    <p class="lede">The only page in this rack that does not read a fixture.
      The model arrives over <code>fetch</code> from <code>scripts/live-feed.mjs</code>,
      through an adapter that may only touch the paths the radar's evidence
      controls declare. Everything else on this page -- the sweep, the bands,
      the refusals, the counters in the bar above -- is the same machinery
      the fixtures run.</p>
    <p class="lede">Stop the feed process and this page will go dark where its
      controls declare, with the component's own refusal reasons in the
      markup. A producer stopping is not a licence to invent: the drawing
      says what it can no longer see.</p>
    <h2 class="family-head">Poll state</h2>
    <div class="live-readout" id="live-readout"><span class="rule-reason-inline">awaiting first poll</span></div>
    <h2 class="family-head">Live</h2>
    <div class="specimen-stage" id="live-slot"><p class="live-note"
      ${M.attrs(M.still('no poll has come back yet')).trim()}>AWAITING FIRST POLL</p></div>`;
}

export function liveStart(motionAllowed) {
  liveStop();
  adapter = createAdapter({
    spec: SPECS.radar,
    fetchJson,
    periodMs: PERIOD_MS,
    sourceStatePath: 'sourceState',
  });
  const tick = async () => {
    if (timer === null) return;
    const model = await adapter.poll();
    if (timer === null) return;
    const slot = document.getElementById('live-slot');
    const readout = document.getElementById('live-readout');
    if (!slot) return;
    slot.innerHTML = SPECS.radar.fn(model);
    const now = Date.now();
    const st = adapter.state();
    const age = adapter.ageSeconds(now);
    // A producer that has not answered is stale in the bar no matter what
    // the last patch claimed: "no answer" and "answered long ago" are the
    // same state to the operator, and both refuse.
    const answering = st.accepted !== null;
    const feedState = answering && !adapter.isStale(now) ? 'live' : 'stale';
    readout.innerHTML = [
      `<span${M.attrs(M.traffic(PERIOD_MS / 1000, feedState,
        { cite: 'adapter.poll@/feed/radar.json' }))}>POLL ${st.polls} · ${answering ? `ANSWERED ${age}S AGO` : 'NO ANSWER'}</span>`,
      age !== null ? `<span${M.attrs(M.elapsed(age, feedState,
        { cite: 'adapter.last_good_poll', style: 'tenths' }))}><b data-elapsed-text>0.0S</b> since last reading</span>` : '',
      st.fails ? `<span class="live-fail">last failure: ${esc(st.error)} · ${st.fails} failed</span>` : '',
      st.rejected.length ? `<span class="live-fail">patch fields with no declared path, rejected: ${esc(st.rejected.join(', '))}</span>` : '',
    ].join(' ');
    if (motionAllowed()) {
      window.CyberdeckMotion.start(slot);
      window.CyberdeckMotion.start(readout);
    }
  };
  // The interval first: tick guards on the timer's existence, and the
  // first poll must not beat its own permission to run.
  timer = setInterval(tick, POLL_MS);
  tick();
}

export function liveStop() {
  if (timer !== null) { clearInterval(timer); timer = null; }
}
