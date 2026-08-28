// THE FIELD -- eight models, each with the one measurement it draws from
// named, so the dark variant is a subtraction and not a second story.
//
// Values are lifted from `demo/field.html` where that page already had a good
// one: the demo is the library's own reference for what a plausible fleet looks
// like, and inventing a fresher fiction would make the showcase disagree with
// the documentation.
//
// Two rules held throughout. Nothing here reads the clock or a random number.
// Where a shape is generated rather than written -- the contour series -- the
// generator is deterministic and the output is rounded, because `Math.sin` is
// implementation-defined in its last bits and a fixture that differs by an
// ULP between engines is a screenshot review that cannot compare captures.

import { NOW_S, beforeS } from './time.js';

/** Five contour lines, 26 samples each, rounded to a precision every engine
 * agrees on. A contour is a series, so a series is what the component is given;
 * the dark variant takes the whole series away rather than flattening it. */
const contours = [0, 1, 2, 3, 4].map((i) => Array.from({ length: 26 }, (_, j) => [
  Number((j / 25).toFixed(4)),
  Number((0.5 + Math.sin(j / 3.4 + i) * 0.16 - i * 0.09).toFixed(4)),
]));

const GLYPHS = [
  ['working', 'WORKING'], ['blocked', 'BLOCKED'], ['needs_you', 'NEEDS YOU'],
  ['unmeasured', 'UNMEASURED'], ['landed', 'LANDED'], ['draining', 'DRAINING'],
].map(([key, label]) => ({ key, label }));

export const FIELD_FIXTURES = {
  scanOverlay: {
    // The overlay annotates the map with three readings and a change stamp. The
    // leader to a field nobody read is refused, and the arrival needs a
    // timestamp -- `arrive` compares two stamps and this component's window is
    // 30 *seconds*, so the stamps are seconds, not milliseconds.
    fields: ['subject.changed_at', 'subject.identity', 'subject.authority', 'subject.blocked'],
    model: {
      subject: {
        name: 's-incident',
        state: 'needs_human',
        settled: true,
        changed_at: beforeS(8),
        now: NOW_S,
        identity: 's-incident · hermes · dellpromax',
        authority: 'RETRY · NO_GRANT',
        blocked: 'Credential expired mid-run',
      },
      cite: 'sessions[].id',
    },
  },

  triVision: {
    // Ten cells, one of which nobody measured, under whichever lens is up. The
    // per-field control can strip the readings and leave the comb standing --
    // that is the hatched cell under a live lens, which is the case worth
    // watching. The dark variant goes further and takes the population, because
    // that is the only version with a refusal in the markup: an unmeasured cell
    // here is drawn hatched and says nothing about itself.
    fields: ['cells', 'cells[].health', 'cells[].cost', 'cells[].authority'],
    model: {
      lens: 'health',
      cells: Array.from({ length: 10 }, (_, i) => ({
        measured: true,
        health: i === 7 ? null : 'ok',
        cost: i === 7 ? null : `${2 + (i % 4)}¢`,
        authority: i === 7 ? null : (i % 3 ? 'AUTO' : 'REQUIRES TWO'),
        hot: i === 4,
      })),
    },
  },

  scaleCrush: {
    // The wall is a population. Nobody counted it and there is no stagger, and
    // the stagger is the only motion the component has.
    fields: ['count'],
    model: { count: 54, bleeding: [4, 11, 27, 41], cite: 'fleet.cells' },
  },

  coverage: {
    // Observed ground draws; the dark box is drawn either way, because the
    // unmeasured region is a fact about the map rather than a missing value.
    // Strip the series and the contours stop drawing themselves -- and the card
    // says the sentence nobody reads: terrain quietly left flat is
    // indistinguishable from terrain measured as flat.
    // The posts along the coast are a population: the library staggers them on
    // the count it was given, so the count is a measurement and comes out with
    // the rest. `coverage` iterates endpoints without a null guard, so absence
    // is declared as the empty set it is rather than as null.
    fields: ['contours', { path: 'endpoints', value: [] }],
    model: { contours, dark: true, endpoints: [{ id: 'dell-local', x: 60, y: 96 }],
      cite: 'coverage.observed' },
  },

  chipBudget: {
    // A spend is a measurement. Unpriced chips are listed and marked rather
    // than counted as free, and the budget bar hatches instead of growing to
    // zero -- an empty bar is a spend of zero, and nobody measured a zero.
    fields: ['chips[].cost', 'chips'],
    model: {
      ceiling: 64,
      chips: [
        { name: 'FLEET BAR', cost: 12, on: true },
        { name: 'QUEUE', cost: 8, on: true },
        { name: 'COST STRIP', cost: 10, on: false },
        { name: '3D LENS', cost: 22, on: false },
        { name: 'WALLS', cost: 6, on: true },
      ],
      cite: 'hud.channel_budget',
    },
  },

  radar: {
    // The sweep runs the producer's own poll interval, which is the only thing
    // that makes it a measurement rather than a metronome. Remove the period and
    // the sweep is refused; let the elapsed run past an intact period and the
    // component refuses differently -- `poll is overdue`, rather than wrapping and
    // starting again, which would erase the finding.
    fields: ['pollElapsed', 'pollPeriod', 'contacts'],
    model: {
      sourceState: 'live',
      pollElapsed: 3,
      pollPeriod: 10,
      contacts: [
        { age_seconds: 2, bearing: -0.2, window: 60, band: 'fresh' },
        { age_seconds: 18, bearing: 0.9, window: 60, band: 'fresh' },
        { age_seconds: 44, bearing: 2.6, window: 60, band: 'stale' },
        { age_seconds: null, bearing: 4.0, window: 60, band: 'unknown' },
      ],
      cite: 'source.poll_interval_ms',
    },
  },

  needleField: {
    // Direction is measured, magnitude is not, which is why every needle is the
    // same length. A worker that reported no constraint gets a hollow ring
    // instead of a plausible bearing, and the dark variant is twenty-eight of
    // those.
    fields: ['workers[].bearing'],
    model: {
      workers: Array.from({ length: 28 }, (_, i) => ({
        bearing: i === 5 ? -1.2 : Number((0.9 + (i % 7) * 0.1).toFixed(3)),
        hot: i === 5,
      })),
      cite: 'sessions[].constraint',
    },
  },

  standardSheet: {
    // The legend. Nothing on it is measured, so nothing on it may move, and the
    // card declares that regardless of the fixture -- there is no field whose
    // arrival would make a legend a reading. `fields` is empty because the
    // refusal is structural, and the honesty readout counts it as a declared
    // stillness on both sides of the toggle.
    fields: [],
    model: { glyphs: GLYPHS },
  },
};
