// The motion runtime. Walks the DOM, reads the marks, dispatches.
// Extracted verbatim from the system this library was lifted out of,
// where it is held by a review script across eight pages and three
// viewports. Behaviour is not re-derived here.
//
// Schema: cyberdeck.motion/1


(function () {
  'use strict';
  var M = window.Motion;
  var root = document.documentElement;

  // Three ways to be still, and they all end here: the operator's OS
  // preference, an explicit ?still=1 for a capture, and a missing engine.
  // The last one matters -- if the vendor bundle fails to load, the page
  // must be the static export, not a page stuck mid-transition.
  var reduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var asked = /[?&]still=1\b/.test(window.location.search)
    || root.hasAttribute('data-motion-off');
  var OFF = reduced || asked || !M || typeof M.animate !== 'function';

  function ms(name, fallback) {
    var raw = getComputedStyle(root).getPropertyValue(name).trim();
    if (!raw) return fallback;
    if (raw.slice(-2) === 'ms') return parseFloat(raw);
    if (raw.slice(-1) === 's') return parseFloat(raw) * 1000;
    return parseFloat(raw) || fallback;
  }

  var T = {};
  function readTokens() {
    T.enter = ms('--m-enter', 300);
    T.leave = ms('--m-leave', 200);
    T.flash = ms('--m-flash', 400);
    T.decay = ms('--m-decay', 15000);
    T.pulse = ms('--m-pulse', 2400);
    T.step  = ms('--m-step', 18);
  }

  var running = [];
  // Motion mini commits its final keyframe into inline style when an
  // animation finishes; the dial rewrites its transform origin to start
  // its loop, and the trace borrows the dash geometry while it draws.
  // Every element a handler styles is recorded here together with the
  // style the render wrote, and a settle puts every one of them back.
  // Only then is "a settled page IS the static export" literally true --
  // byte equality is the check, and appearance alone would not pass it.
  var firstStyle = new Map();
  function remember(node) {
    if (!firstStyle.has(node)) firstStyle.set(node, node.getAttribute('style'));
  }
  function play(el, keyframes, options) {
    remember(el);
    var handle = M.animate(el, keyframes, options);
    running.push(handle);
    return handle;
  }

  // Arrival. One enter, from slightly off and slightly faint, to exactly
  // where Python drew it. Never the reverse: an element must not be left
  // anywhere the static render did not put it.
  function arrival(el) {
    play(el, { opacity: [0, 1], transform: ['translateY(3px)', 'none'] },
      { duration: T.enter / 1000, easing: 'ease-out' });
  }

  // Decay. The element starts at the emphasis its age has already used up
  // and settles the rest of the way, so a value measured ten seconds into
  // a fifteen second window arrives two thirds faded -- the motion is the
  // remaining freshness, not a fresh animation over an old number.
  function decayed(el) {
    var spent = parseFloat(el.getAttribute('data-decay')) || 0;
    var left = Math.max(0, 1 - spent);
    if (left <= 0 || !T.decay) return;
    play(el, { opacity: [1 - spent * 0.45, 1] },
      { duration: (T.decay * left) / 1000, easing: 'ease-out' });
  }

  // Counting. Order is the payload's, not the DOM's guess at it, and the
  // whole reveal is capped so a wall of two hundred cells does not take
  // four seconds to admit it has two hundred cells.
  function counted(el) {
    var index = parseInt(el.getAttribute('data-index'), 10) || 0;
    var total = parseInt(el.getAttribute('data-total'), 10) || 1;
    // Floored as well as capped. A fleet console usually counts two or
    // three of a thing, and at the raw step that whole reveal was over in
    // fifty milliseconds -- a stagger nobody can see is not a stagger, it
    // is three elements appearing at once with extra machinery. The floor
    // makes small counts readable; the cap stops a wall of two hundred
    // cells taking four seconds to admit it has two hundred cells.
    var span = Math.max(T.enter * 0.6, Math.min(T.step * total, T.enter * 2));
    play(el, { opacity: [0, 1] }, {
      duration: T.enter / 1000, easing: 'ease-out',
      delay: (span * (index / Math.max(total, 1))) / 1000,
    });
  }

  // Traffic. The one loop, breathing at the producer's own interval, so a
  // tightening cadence is visibly a tightening cadence. Clamped at both
  // ends and only at the ends: under the floor it reads as a flicker
  // rather than a rhythm, over the ceiling it reads as stopped. The clamp
  // is a legibility bound on an honest number, not a rescaling of it, and
  // an element that hits either end still carries the real interval in
  // data-period for anything that wants to read it.
  function trafficking(el) {
    var period = parseFloat(el.getAttribute('data-period')) * 1000;
    if (!(period > 0)) return;
    period = Math.max(T.pulse / 4, Math.min(T.pulse * 4, period));
    play(el, { opacity: [1, 0.45, 1] }, {
      duration: period / 1000, repeat: Infinity, easing: 'ease-in-out',
    });
  }

  // The poll clock. Starts where the measurement says it already is and
  // takes exactly as long as the producer's remaining interval to finish,
  // so the bar arriving at the end and the next poll being due are the
  // same event rather than two things that drift apart.
  function cycling(el) {
    var spent = parseFloat(el.getAttribute('data-spent'));
    var period = parseFloat(el.getAttribute('data-period'));
    if (!(period > 0) || !(spent >= 0)) return;
    if (el.getAttribute('data-cycle-axis') === 'rotate') {
      // A dial rather than a bar. The radar's sweep sits at the angle the
      // freshness put it and goes round once per poll interval, so the
      // sweep an operator watches is the poll they are waiting for --
      // which is the one thing a radar drawn as a still picture cannot
      // say. Same clock, same refusals, different geometry.
      var from = spent * 360;
      // view-box, not fill-box. The origin the caller gives is a point in
      // the drawing's own coordinate system -- the dial's centre -- and
      // fill-box would have measured it against the wedge's bounding box
      // instead, spinning the sweep around its own middle somewhere off
      // in the corner of the panel.
      var origin = el.getAttribute('data-cycle-origin');
      // The dial's inline style belongs to the loop, not the render. It is
      // remembered before being written so the settle can hand the element
      // back exactly as the render had drawn it.
      remember(el);
      el.style.transformBox = 'view-box';
      el.style.transformOrigin = origin
        ? origin.split(/\s+/).map(function (n) { return n + 'px'; }).join(' ')
        : 'center';
      var first = play(el, { rotate: [from + 'deg', '360deg'] },
        { duration: period * (1 - spent), easing: 'linear' });
      if (first && first.finished && first.finished.then) {
        first.finished.then(function () {
          play(el, { rotate: ['0deg', '360deg'] },
            { duration: period, easing: 'linear', repeat: Infinity });
        }, function () {});
      }
      return;
    }
    var bar = el.querySelector('i') || el;
    // Linear, and this is the one place R11's ban on it is wrong. An
    // eased clock runs fast in the middle and slow at the ends, which
    // means the bar's position stops being the elapsed fraction -- the
    // single thing it is here to report. Easing this would be the motion
    // equivalent of a chart with an unlabelled y-axis.
    // Two animations, not one repeating animation. A single repeating
    // tween would restart every cycle at the position of the FIRST poll
    // rather than at zero, so the second minute of a thirty second dial
    // would begin fourteen percent through -- a clock that is right once
    // and drifts forever after.
    var first = play(bar, { transform: ['scaleX(' + spent + ')', 'scaleX(1)'] },
      { duration: (period * (1 - spent)), easing: 'linear' });
    if (first && first.finished && first.finished.then) {
      first.finished.then(function () {
        play(bar, { transform: ['scaleX(0)', 'scaleX(1)'] },
          { duration: period, easing: 'linear', repeat: Infinity });
      }, function () {});
    }
  }

  // The shared duration formatter. This mirrors `durationWords` in
  // src/marks.js, and test/marks.test.mjs runs the two against each
  // other across a table of values -- a format that drifts between the
  // markup and the browser would show up as a number that jumps the
  // instant the page starts counting.
  function words(seconds, style) {
    if (style === 'tenths') return seconds.toFixed(1) + 'S';
    seconds = Math.floor(seconds);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    if (style === 'tenths') return seconds.toFixed(1) + 'S';
    if (style === 'lower') {
      if (seconds < 60) return seconds + 's';
      if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
      if (seconds < 86400) return Math.floor(seconds / 3600) + 'h '
        + Math.floor((seconds % 3600) / 60) + 'm';
      return Math.floor(seconds / 86400) + 'd '
        + Math.floor((seconds % 86400) / 3600) + 'h';
    }
    if (seconds < 60) return seconds + 'S';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'M';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'H '
      + pad(Math.floor((seconds % 3600) / 60)) + 'M';
    return Math.floor(seconds / 86400) + 'D '
      + pad(Math.floor((seconds % 86400) / 3600)) + 'H';
  }
  window.__cyberdeckWords = words;   // read by the agreement test

  // Every running counter on one interval. A timer each would drift apart
  // and would also wake the page N times a second to do one page's worth
  // of work; the numbers all advance on the same edge instead, so two
  // counters showing the same measurement never disagree by a second.
  var clocks = [];
  var ticking = null;
  function elapsing(el) {
    var seconds = parseFloat(el.getAttribute('data-elapsed-seconds'));
    if (!(seconds >= 0)) return;
    var target = el.querySelector('[data-elapsed-text]') || el;
    clocks.push({ el: el, target: target, base: seconds,
                  rendered: target.textContent,
                  style: el.getAttribute('data-style') || 'upper' });
    if (ticking) return;
    var origin = performance.now();
    ticking = setInterval(function () {
      var since = (performance.now() - origin) / 1000;
      for (var i = 0; i < clocks.length; i++) {
        var c = clocks[i];
        var next = words(c.base + since, c.style);
        // Written only when the words change. A counter in hours restates
        // the same string 3599 times out of 3600, and rewriting text on
        // every tick is how a still page ends up costing a screenful of
        // layout a second.
        if (c.target.textContent !== next) c.target.textContent = next;
      }
    }, 1000);
    running.push({ cancel: function () {
      if (ticking) { clearInterval(ticking); ticking = null; }
      // Settling puts the words back to what Python wrote. This is the
      // only kind that edits the document rather than compositing over
      // it, so it is the only one that has to undo anything -- and if it
      // did not, "a settled page is the rendered page" would quietly stop
      // being true the moment a minute ticked over.
      for (var i = 0; i < clocks.length; i++) {
        clocks[i].target.textContent = clocks[i].rendered;
      }
      clocks.length = 0;
    } });
  }

  // A path drawing itself. The dash pattern is set from the geometry's
  // own measured length rather than a guess, so a short strand and a long
  // one both draw fully and neither overshoots into a gap.
  //
  // Whatever the path already had on stroke-dasharray is put back at the
  // end. Several drawings dash a line to mean "undelivered" or "nobody
  // tried this", and a trace that cleared it would have quietly turned
  // those into solid lines -- erasing a refusal by animating it.
  function traced(el) {
    // Every SVG geometry element, not just <path>. SVG2 put
    // getTotalLength on SVGGeometryElement, so a rect and a circle both
    // answer it -- and rects are most of what this system draws: the ICE
    // walls, the corridor doorframes, the dive frames. Leaving them out
    // of the selector meant the kind ran on almost nothing.
    var SHAPES = 'path, line, polyline, polygon, rect, circle, ellipse';
    var paths = el.tagName && /^(path|line|polyline|polygon|rect|circle|ellipse)$/i
      .test(el.tagName) ? [el] : el.querySelectorAll(SHAPES);
    var index = parseInt(el.getAttribute('data-index'), 10) || 0;
    var total = parseInt(el.getAttribute('data-total'), 10) || 1;
    var span = Math.max(T.enter * 0.6, Math.min(T.step * total, T.enter * 2));
    var delay = (span * (index / Math.max(total, 1))) / 1000;
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      if (!path.getTotalLength) continue;
      var length = 0;
      try { length = path.getTotalLength(); } catch (e) { continue; }
      if (!(length > 0)) continue;
      // Remembered before the borrow, not at play(): play would capture
      // the dash this handler is about to write and "restore" the borrow
      // instead of the render.
      remember(path);
      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = String(length);
      (function (node) {
        var handle = play(node, { strokeDashoffset: [String(length), '0'] },
          { duration: T.enter / 1000, easing: 'ease-out', delay: delay });
        var done = function () {
          // Clearing the properties is enough to let a rendered
          // stroke-dasharray shine through again -- writing the old value
          // back as a property would duplicate the attribute inline and
          // leave the settled page differing from the render by bytes.
          node.style.strokeDashoffset = '';
          node.style.strokeDasharray = '';
          // Clearing every property leaves an empty style attribute behind.
          // The static export never wrote one, so the settled page has to
          // not have one either.
          if (node.getAttribute('style') === '') node.removeAttribute('style');
        };
        if (handle && handle.finished && handle.finished.then) {
          handle.finished.then(done, done);
        }
      })(path);
    }
  }

  // A level draws itself out to where the measurement already put it.
  // It scales rather than resizing, and it scales from zero to the
  // rendered extent -- never past it and never to a rounder number --
  // so the end of the animation and the static render are the same frame.
  function levelled(el) {
    var bar = el.querySelector('i') || el;
    var axis = el.getAttribute('data-level-axis') || 'x';
    if (axis === 'slide') {
      // Some measurements are a position rather than an extent: the burn
      // marker rides the point on its track that the percentage puts it
      // at. Sliding it in from the start of the track draws that reading;
      // scaling it would have grown the marker itself, which measures
      // nothing.
      var level = parseFloat(el.getAttribute('data-level')) || 0;
      play(bar, { transform: ['translateX(' + (-100 * level) + '%)', 'none'] },
        { duration: T.enter / 1000, easing: 'ease-out' });
      return;
    }
    if (axis === 'fade') {
      // Some measurements have no bar to grow. The context burn is grain
      // closing in from the panel edges, and the honest reading of "this
      // much is gone" is the grain arriving at the density Python already
      // computed from the percentage -- not a bar drawn next to it.
      play(bar, { opacity: [0, 1] },
        { duration: T.enter / 1000, easing: 'ease-out' });
      return;
    }
    // To the measured extent, named -- not to `none`. `none` is the
    // identity transform, so animating to it threw away the inline
    // scale the server wrote and every bar finished at full width: a
    // twelve percent reading and an eighty-two percent reading drawn the
    // same length, by the kind whose whole job is extent.
    var level = parseFloat(el.getAttribute('data-level'));
    if (!(level >= 0)) level = 1;
    var fn = axis === 'y' ? 'scaleY' : 'scaleX';
    play(bar, { transform: [fn + '(0)', fn + '(' + level + ')'] },
      { duration: T.enter / 1000, easing: 'ease-out' });
  }

  var HANDLERS = {
    arrive: arrival, decay: decayed, count: counted, level: levelled,
    elapsed: elapsing, trace: traced, traffic: trafficking, cycle: cycling,
  };

  function start(scope) {
    readTokens();
    var nodes = (scope || document).querySelectorAll('[data-motion]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var kind = el.getAttribute('data-motion');
      // `still` and `intent` are deliberately absent from HANDLERS. The
      // first must never be touched; the second is CSS and needs no help.
      var handler = HANDLERS[kind];
      if (handler) { try { handler(el); } catch (e) { /* one bad mark
        must not stop the rest of the page from settling */ } }
    }
  }

  // What the review scripts call. Cancelling rather than finishing is the
  // point: every animation above rests at the rendered geometry, so a
  // cancelled page IS the static export. A `finish()` would have to agree
  // with Python about the end state, and two descriptions of one truth is
  // how they drift apart.
  function settle() {
    for (var i = 0; i < running.length; i++) {
      try { running[i].cancel(); } catch (e) {}
    }
    running.length = 0;
    if (document.getAnimations) {
      var all = document.getAnimations();
      for (var j = 0; j < all.length; j++) { try { all[j].cancel(); } catch (e) {} }
    }
    // Last in wins per node, and the map kept the FIRST sighting of each,
    // which is the style the render wrote. Replaying it back is what makes
    // the settled document byte-equal the exported one.
    var emptied = [];
    firstStyle.forEach(function (was, node) {
      if (was === null) { node.removeAttribute('style'); emptied.push(node); }
      else node.setAttribute('style', was);
    });
    firstStyle.clear();
    // Blink re-serialises a bare `style=""` attribute once when it flushes
    // the cancellations above -- no script writes it, so no script can be
    // trusted to not have written it. The settled page has to match the
    // export after that flush, not merely at the instant of the settle, so
    // the sweep returns one more time when the frame machinery has caught
    // up. A byte comparison between the two documents is the check.
    if (emptied.length && window.requestAnimationFrame) {
      requestAnimationFrame(function () {
        for (var k = 0; k < emptied.length; k++) {
          if (emptied[k].getAttribute('style') === '') {
            emptied[k].removeAttribute('style');
          }
        }
      });
    }
    root.setAttribute('data-motion-off', '');
  }

  window.CyberdeckMotion = {
    schema: 'cyberdeck.motion/1',
    off: OFF,
    settle: settle,
    start: start,
    count: function () { return running.length; },
  };

  if (!OFF) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { start(); });
    } else { start(); }
  }
})();
