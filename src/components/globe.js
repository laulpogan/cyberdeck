// The globe stays canvas, and this file is the argument for why.
//
// A wireframe sphere is a few hundred arcs redrawn every frame while it
// turns. That is the case canvas exists for: as SVG it would be several
// hundred DOM nodes mutating sixty times a second, which is slower and no
// more honest, because the shapes are a mesh rather than readings. The
// mesh means "this is a globe". Only the endpoints mean anything.
//
// So the seam moves. The wrapper carries the marks, the endpoints are
// real DOM on top of the bitmap where they can be marked and read, and
// the rotation is gated: this component never spins on its own clock. It
// asks the runtime, and the runtime asks whether the feed is live. An
// unattended globe turning over a dead source is exactly the lie the
// library exists to refuse -- and it is the easiest one to ship, because
// a turning globe looks like health.

import { traffic, trace, count, still, attrs } from '../marks.js';

/**
 * @param {object} o
 * @param {Array} o.endpoints  [{ id, lat, lon, workers, awaiting }]
 * @param {string} o.cite      payload path the endpoints came from
 * @param {number|null} o.periodSeconds  the producer's own refresh interval
 * @param {string} o.sourceState 'live' | 'stale' | 'unavailable' | 'measured_empty'
 */
export function globe({ endpoints, cite, periodSeconds = null,
                        sourceState = 'unavailable', size = 420 }) {
  // The turn is the one ambient loop, so it answers to `traffic`: a live
  // feed and a measured interval, or the globe holds still.
  const turn = traffic(periodSeconds, sourceState, { cite: 'source.refresh_ms' });
  const turning = turn['data-motion'] === 'traffic';

  if (!endpoints || !endpoints.length) {
    return `<figure class="cd-globe"${attrs(still('no endpoint was observed'))}>
  <i class="cd-why">no endpoint was observed</i></figure>`;
  }

  // Endpoints are readings, so they are elements, not paint. They sit in
  // an SVG layer over the canvas -- marked, hit-testable, and readable by
  // the same review that walks every other component.
  const pins = endpoints.map((e, i) => {
    const awaiting = Boolean(e.awaiting);
    return `<g class="cd-globe-pin" data-awaiting="${awaiting ? 1 : 0}"
      data-lat="${e.lat}" data-lon="${e.lon}"${attrs(count(i, endpoints.length))}>
      <circle class="cd-globe-dot" r="4"/>
      ${awaiting ? '<circle class="cd-globe-halo" r="9"/>' : ''}
      <title>${e.id} · ${e.workers} workers</title>
    </g>`;
  }).join('');

  // Arcs are membership, not traffic -- so they trace on the fact that a
  // worker is placed there, and the label says which, because an arc
  // between two points is the most convincing way to claim flow.
  const arcs = endpoints.map((e, i) =>
    `<path class="cd-globe-arc" data-endpoint="${e.id}"${attrs(
      trace(e.workers > 0, { cite, order: i, total: endpoints.length }))}/>`).join('');

  return `<figure class="cd-globe"${attrs(turn)} data-source-state="${sourceState}"
        style="--cd-globe-size:${size}px">
  <canvas class="cd-globe-mesh" width="${size}" height="${size}" aria-hidden="true"></canvas>
  <svg class="cd-globe-layer" viewBox="0 0 ${size} ${size}" role="img"
       aria-label="${endpoints.length} endpoints">${arcs}${pins}</svg>
  <figcaption>${turning
    ? 'ARCS ARE MEMBERSHIP, NOT TRAFFIC'
    : `NOT TURNING — ${turn['data-still-reason']}`}</figcaption>
</figure>`;
}

/** Paint the mesh, and only ever when the wrapper says it may turn.
 *
 * The rotation reads its rate off the same measured period the wrapper
 * was marked with, so there is no house tempo to drift from the producer,
 * and a wrapper that refused leaves this drawing a still sphere. */
export function paintGlobe(figure) {
  const canvas = figure.querySelector('.cd-globe-mesh');
  const layer = figure.querySelector('.cd-globe-layer');
  if (!canvas || !layer) return;
  const size = canvas.width;
  const R = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  const ctx = canvas.getContext('2d');
  const style = getComputedStyle(figure);
  // Colours come off the tokens like everything else. A canvas cannot
  // inherit a custom property, so it is read once and passed in.
  const mesh = style.getPropertyValue('--cd-globe-mesh-colour').trim() || 'currentColor';

  const turning = figure.getAttribute('data-motion') === 'traffic';
  const period = Number(figure.getAttribute('data-period')) || 0;
  // One full turn per measured interval. The rate IS the reading.
  const rate = turning && period > 0 ? (Math.PI * 2) / (period * 60) : 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The library's off switch has to reach in here too. A canvas loop is
  // outside the runtime's reach -- it owns Animation objects, and this
  // owns a frame callback -- so settling stopped every marked element on
  // the page and left this one turning. One control has to settle the
  // whole page or it is not a control, so the loop reads the same flag
  // the runtime sets rather than keeping its own idea of whether it is on.
  const stopped = () => document.documentElement.hasAttribute('data-motion-off');
  let rot = 0;

  const project = (lat, lon) => {
    const p = (lat * Math.PI) / 180;
    const l = (lon * Math.PI) / 180 + rot;
    return [cx + R * Math.cos(p) * Math.sin(l), cy - R * Math.sin(p),
            Math.cos(p) * Math.cos(l)];
  };

  const draw = () => {
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = mesh;
    ctx.lineWidth = 0.7;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      for (let lon = 0; lon <= 360; lon += 4) {
        const [x, y, z] = project(lat, lon);
        if (z < 0) { ctx.moveTo(x, y); continue; }
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let lon = 0; lon < 360; lon += 30) {
      ctx.beginPath();
      for (let lat = -90; lat <= 90; lat += 4) {
        const [x, y, z] = project(lat, lon);
        if (z < 0) { ctx.moveTo(x, y); continue; }
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

    // The pins are DOM, so they are moved rather than painted.
    layer.querySelectorAll('.cd-globe-pin').forEach((pin) => {
      const [x, y, z] = project(Number(pin.dataset.lat), Number(pin.dataset.lon));
      pin.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      pin.style.opacity = z < 0 ? '0.18' : '1';
    });

    if (rate && !reduced && !stopped()) { rot += rate; requestAnimationFrame(draw); }
  };
  draw();

  // And it has to come back when motion does, without a second control.
  const observer = new MutationObserver(() => {
    if (rate && !reduced && !stopped()) draw();
  });
  observer.observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-motion-off'] });
}
