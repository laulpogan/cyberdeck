// THE THREAD -- one session, held steady while it changes.
//
// A rack answers "what has this session attempted". These six answer the
// harder question an operator has while watching one running thing: what
// is it doing now, is it still moving, what would stopping it cost, what
// may I ask about it, which of these numbers did anyone actually see, and
// how much room is left.
//
// The family's recurring trap is the half-detector. Every component here
// wants two channels and is given one, and the discipline is to draw the
// half that exists and name the half that does not -- rather than
// reporting a whole verdict off a single lane.

import { frame, rect, line, dot, text, hatched, staticField, axis } from '../draw.js';
import { trace, count, level, still, attrs } from '../marks.js';
import { card, esc, W, H , refusalFrame } from './card.js';

const PAD = 12;
const SPAN = W - PAD * 2;

export const UNABLE = 'UNABLE TO COMPUTE';

/** Where the burn edge is marked. Not a red line an operator must not
 * cross -- a mark on the number, so the direction is legible without a
 * threshold nobody set. */
export const BURN_EDGE = 75;

/** Four bracket ticks. A pane is an instrument card and a plain 1px
 * rectangle does not read as one; the ticks are what make it look like a
 * thing that was installed rather than a div. */
function corners(x, y, w, h, span = 7) {
  return [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]
    .map(([cx, cy, dx, dy]) =>
      line(cx, cy, cx + dx * span, cy) + line(cx, cy, cx, cy + dy * span))
    .join('');
}

/** Twin MFD deck -- two readouts, switched separately.
 *
 * System Shock's two multi-function displays sit side by side and each is
 * switched on its own. That is the shape a session inspector needs and
 * never has: comparing runtime against timeline in one pane makes an
 * operator alternate and remember.
 *
 * The rule that matters is the dark pane. A readout whose producer is
 * silent renders its own unmeasured face; it never falls back to a
 * readout that does have data. A pane quietly showing something else is
 * worse than a dark one. */
export function mfd({ panes }) {
  if (!panes || panes.length < 2) {
    // The deck, unswitched. Two bezels and their labels, because the refusal is
    // about a deck that cannot be a deck, and the reader should see the pair of
    // instruments that is not there rather than a generic hole.
    const emptyDeck = [
      corners(PAD, 30, SPAN / 2 - 6, 108),
      corners(PAD + SPAN / 2 + 6, 30, SPAN / 2 - 6, 108),
      text(PAD + 4, 24, 'PANE A', { size: 6.5, opacity: '.5' }),
      text(PAD + SPAN / 2 + 10, 24, 'PANE B', { size: 6.5, opacity: '.5' }),
      text(PAD, 174, 'SWITCHED SEPARATELY', { size: 8, weight: '600', opacity: '.6' }),
    ];
    return card('mfd', 'Twin MFD deck', '',
      { refusalWord: 'ONE PANE SHORT', ghost: emptyDeck,
        mark: still('a twin deck needs two panes') });
  }
  const [a, b] = panes;
  const g = [];
  [[a, PAD], [b, PAD + SPAN / 2 + 6]].forEach(([pane, x], side) => {
    const w = SPAN / 2 - 6;
    g.push(`<g class="cd-th-pane" data-known="${pane.value ? 1 : 0}">`
      + corners(x, 30, w, 108) + '</g>');
    g.push(text(x + 4, 24, pane.label, { size: 7, opacity: '.75' }));
    if (pane.value) {
      g.push(`<g class="cd-th-read"${attrs(trace(true, { cite: pane.cite, order: side, total: 2 }))}>`
        + text(x + 10, 62, pane.value, { size: 12 })
        + line(x + 10, 72, x + w - 10, 72, { width: 1 }) + '</g>');
      g.push(text(x + 10, 88, pane.detail || '', { size: 6.5, opacity: '.6' }));
    } else {
      // The dark face. It names which producer went dark, which is a fact
      // worth having, and it is never the other pane's readout.
      g.push(`<g class="cd-th-dark"${attrs(still('this readout has no producer'))}>`
        + hatched(x + 8, 46, w - 16, 40)
        + text(x + w / 2, 70, 'NO PRODUCER', { size: 7.5, anchor: 'middle' })
        + '</g>');
      g.push(text(x + 10, 104, pane.cite, { size: 6, opacity: '.5' }));
    }
    g.push(text(x + 4, 152, `PANE ${side ? 'B' : 'A'}`,
      { size: 6.5, opacity: '.5' }));
  });
  g.push(text(PAD, 174, 'SWITCHED SEPARATELY', { size: 8, weight: '600' }));
  g.push(text(PAD, 186, 'a pane that silently shows something else is worse '
    + 'than a dark one', { size: 6.5, opacity: '.55' }));
  return card('mfd', 'Twin MFD deck',
    frame(W, H, g.join(''), {
      label: 'Two instrument panes switched independently, each rendering '
           + 'its own unmeasured face rather than falling back.' }),
    { note: 'Two readouts, switched separately.' });
}

export const SYNC = {
  in_sync: ['IN SYNC', 'Output and state-space both moving.'],
  spinning: ['SPINNING', 'Tokens flowing, state-space static.'],
  stalled: ['STALLED', 'Neither output nor state-space moving.'],
  unmeasured: ['SYNC UNMEASURED', 'One or both channels have no producer.'],
};

/** Sync ratio -- two channels on one axis, and the ratio nobody kept.
 *
 * The number that says whether the pilot and the machine are moving
 * together. The two channels are OUTPUT (the worker is still emitting)
 * and STATE (the work is still advancing). Both moving is healthy; output
 * alone is SPINNING, the pathology this console exists to catch.
 *
 * The detector usually runs on one of its two channels, because nothing
 * stamps a last-output instant -- there are cumulative turn and tool-call
 * counters, and a total is not a rate. Reading "turns > 0" as "still
 * emitting" would fire SPINNING on every finished session in the fleet.
 * So the output lane is drawn dark, named, and the verdict is SYNC
 * UNMEASURED rather than a half-detector reporting as a whole one.
 *
 * The ratio is a second hole: a ratio is a relationship over time and one
 * snapshot cannot carry one, so the drift track stays dark rather than
 * showing a curve drawn through a single sample. */
export function syncRatio({ output, state, verdict = null,
                            ratioCite = 'source.progress_history()' }) {
  const lanes = [['OUTPUT', output], ['STATE-SPACE', state]];
  const lane = 20, gap = 16;
  let y = 26;
  const g = [];
  lanes.forEach(([label, channel]) => {
    const known = Boolean(channel && channel.known);
    g.push(`<g class="cd-th-lane" data-known="${known ? 1 : 0}"`
      + `${attrs(still('no series was retained for this lane'))}>`);
    g.push(text(PAD, y - 4, label, { size: 7, opacity: '.8' }));
    if (known) {
      g.push(hatched(PAD, y, SPAN - 10, lane));
      g.push(dot(PAD + SPAN - 4, y + lane / 2, 3.4));
      g.push(text(PAD + SPAN - 12, y - 4, 'ONE SAMPLE',
        { size: 6, anchor: 'end', opacity: '.7' }));
    } else {
      g.push(hatched(PAD, y, SPAN, lane));
      g.push(text(W / 2, y + lane / 2 + 2.5, 'NO PRODUCER',
        { size: 7.5, anchor: 'middle' }));
    }
    g.push('</g>');
    y += lane + gap;
  });
  g.push('<g class="cd-th-ratio">');
  g.push(text(PAD, y - 4, 'RATIO', { size: 7, opacity: '.8' }));
  g.push(hatched(PAD, y, SPAN, lane));
  g.push(text(W / 2, y + lane / 2 + 2.5, 'NO SERIES RETAINED',
    { size: 7.5, anchor: 'middle' }));
  g.push('</g>');
  y += lane + 6;
  // The axis is a frame, and a frame does not travel. A recorder was meant to
  // sit on it; drawing the frame is how the missing one stays visible, and
  // animating it would put motion on the one element that exists precisely
  // because nothing was recorded. `trace` belongs to a path something crossed.
  g.push(`<g class="cd-th-axis"${attrs(still('the axis is a frame; nothing travelled it'))}>`
    + `<g transform="translate(${PAD},0)">${axis(SPAN, y)}</g></g>`);
  const known = lanes.every(([, c]) => c && c.known);
  const key = verdict && SYNC[verdict] ? verdict : (known ? 'stalled' : 'unmeasured');
  const [word, why] = SYNC[key];
  // A verdict of "unmeasured" wearing the measured-and-well colour is the
  // half-detector problem again, one layer up.
  g.push(`<g class="cd-th-verdict" data-state="${key}">`
    + text(PAD, y + 26, word, { size: 10, weight: '600' })
    + text(PAD, y + 38, why, { size: 6.5, opacity: '.6' }) + '</g>');
  g.push(text(PAD, y + 52, ratioCite, { size: 6, opacity: '.45' }));
  return card('sync', 'Sync ratio',
    frame(W, H, g.join(''), {
      label: 'Two sync channels over one axis. Every span but the present '
           + 'instant is hatched: nothing retained a series.' }),
    key === 'unmeasured'
      ? { note: 'Half a detector reporting as a whole one is the failure here.' }
      : { note: 'Drift is a relationship over time, and nobody kept one.' });
}

/** Interrupt hard-cut -- instant, and priced before it is offered.
 *
 * Katana ZERO cuts. No fade, no dissolve, and the cut is the honest
 * rendering of what interruption is: the state before it is simply gone.
 * Every console softens this and the softening is a lie about
 * reversibility.
 *
 * A price list is the wrong instrument. The cut is a fact about a shape --
 * everything above the line survives, everything below was never going to
 * happen -- so the work in flight is drawn as bars and the cut is one hard
 * rule across all of them. When the change set has no producer the bars
 * cannot be drawn, and that region is hatched rather than left blank: a
 * scar over an empty panel says the cut is free, which is the one claim
 * this component exists to refuse. */
export function hardCut({ changed = null, inFlight = null, attempt = null,
                          branch = null, cite = 'evidence.git.changed_files' }) {
  const priced = changed !== null && changed !== undefined;
  // The stack of work in flight is as long as the change set, and the card it is
  // drawn in is 200 units tall with a readout below the scar that needs about 52
  // of them. Fixed 13-unit rows fit six; a seventh pushed the labels over the
  // card's own note, which is how a measurement ends up struck through by the
  // sentence that named it. So the pitch is what is left divided by what was
  // measured -- every bar still drawn, none of them off the bottom.
  const drawn = priced ? Math.max(1, Math.trunc(changed) + (inFlight ? 1 : 0)) : 1;
  const pitch = Math.max(4, Math.min(13, 78 / drawn));
  const bar = Math.max(2.5, pitch - 6);
  const gap = pitch - bar;
  let y = 22;
  const g = [];
  if (priced) {
    // Lengths taper. A transcript is not a bar chart, and equal bars would
    // read as a measurement of size.
    const rows = Math.trunc(changed) || 0;
    for (let i = 0; i < rows; i++) {
      g.push(`<g class="cd-th-flight">` + rect(PAD, y, SPAN * (.86 - .07 * i), bar, {
        fill: 'currentColor', width: 0,
        extra: 'opacity=".55"' + attrs(count(i, rows)) }) + '</g>');
      y += bar + gap;
    }
    if (inFlight) {
      g.push('<g class="cd-th-flight">' + rect(PAD, y, SPAN * .62, bar,
        { fill: 'currentColor', width: 0, extra: 'opacity=".85"' })
        + text(PAD + SPAN * .62 + 6, y + bar - 1, 'IN FLIGHT',
            { size: 7, opacity: '.8' }) + '</g>');
      y += bar + gap;
    }
    if (!rows && !inFlight) {
      g.push(text(PAD, y + bar, 'NOTHING IN FLIGHT', { size: 7.5 }));
      y += bar + gap;
    }
  } else {
    g.push(hatched(PAD, y, SPAN, 34));
    g.push(text(W / 2, y + 21, 'CHANGE SET UNMEASURED',
      { size: 7.5, anchor: 'middle' }));
    y += 34 + gap;
  }
  const scar = y + 6;
  // The scar travels only when the change set it strikes through was
  // measured. Drawn travelling over a hatched panel it animates a cost
  // nobody counted -- and inside a card that has already refused, which
  // makes it motion under a declared stillness.
  g.push(`<g class="cd-th-scar"${attrs(trace(priced, { cite }))}>`
    + line(PAD, scar, PAD + SPAN, scar, { width: 2.5 }) + '</g>');
  g.push(`<g class="cd-th-scar">`
    + text(W / 2, scar + 13,
        `— CUT — ATTEMPT ${attempt ?? 'UNMEASURED'} LOST —`,
        { size: 7.5, anchor: 'middle' }) + '</g>');
  g.push(text(W / 2, scar + 30, 'NOTHING RESUMES BELOW THIS',
    { size: 7, anchor: 'middle', opacity: '.55' }));
  const rows = [['ATTEMPT LOST', attempt], ['IN FLIGHT', inFlight],
                ['UNCOMMITTED', changed], ['BRANCH', branch]];
  rows.forEach(([label, value], i) => {
    const ry = scar + 48 + i * 13;
    g.push(text(PAD, ry, label, { size: 6.5, opacity: '.6' }));
    g.push(text(W - PAD, ry, value == null ? 'UNMEASURED' : String(value),
      { size: 7, anchor: 'end', opacity: value == null ? '.55' : null }));
  });
  return card('cut', 'Interrupt hard-cut',
    frame(W, H, g.join(''), {
      label: 'Work in flight struck through by the cut. Nothing is drawn '
           + 'below the line.' }),
    priced
      ? { note: 'No fade. The bars are what the cut costs.' }
      : { mark: still('the cut is unpriced, and a free-looking cut is a lie') });
}

/** MU/TH/UR query mode -- what may be asked, and what may not.
 *
 * Alien's ship computer answers what it can and prints UNABLE TO COMPUTE
 * for the rest, and the refusal is why it reads as trustworthy. This is
 * not a chat box. It is the fixed list of questions this console can be
 * asked about a subject, each with either its answer and the field it came
 * from, or the refusal and the producer that would supply it.
 *
 * The refusals get the same prompt and the same rule as the answers. They
 * ARE answers, and demoting them to grey footnotes is how a console starts
 * to look more capable than it is. */
export function muthur({ answers }) {
  if (!answers || !answers.length) {
    // The terminal, unasked. MU/TH/UR's refusals are answers with the same prompt,
    // so the refusal is drawn as one prompt in the console rather than as a generic
    // frame: the CRT furniture is the shape this specimen is about, and an SVG hole
    // in its place lost a fifth of the card's height on a narrow screen.
    return card('muthur', 'MU/TH/UR query mode',
      `<div class="cd-th-crt">
        <p class="cd-th-crt-head">INTERROGATIVE</p>
        <ol class="cd-th-queries"><li data-answered="0">
          <b><i>&gt;</i>NO QUESTION LIST</b>
          <span>${esc(UNABLE)}</span>
          <cite>no question list is defined for this subject</cite></li></ol>
        <p class="cd-th-crt-foot">AWAITING OPERATOR. NO FURTHER ENHANCEMENT.<i
          class="cd-th-cursor" aria-hidden="true"></i></p>
      </div>
      <p class="cd-th-edge"><b>NOTHING ASKED OF THIS CONSOLE</b></p>`,
      { mark: still('no question list is defined for this subject') });
  }
  const answered = answers.filter((a) => a.answer != null).length;
  const rows = answers.map((row, i) => {
    const ok = row.answer != null;
    return `<li data-answered="${ok ? 1 : 0}"${attrs(count(i, answers.length))}>
      <b><i>&gt;</i>${esc(row.question)}</b>
      <span>${esc(ok ? row.answer : UNABLE)}</span>
      <cite>${esc(row.cite)}</cite></li>`;
  });
  return card('muthur', 'MU/TH/UR query mode',
    `<div class="cd-th-crt">
      <p class="cd-th-crt-head">INTERROGATIVE</p>
      <ol class="cd-th-queries">${rows.join('')}</ol>
      <p class="cd-th-crt-foot">AWAITING OPERATOR. NO FURTHER ENHANCEMENT.<i
        class="cd-th-cursor" aria-hidden="true"></i></p>
    </div>
    <p class="cd-th-edge"><b>${answered} OF ${answers.length} ANSWERABLE</b></p>`,
    { note: 'Every refusal names the producer that would answer it.' });
}

/** Joi overlay presence -- projected over the observation, never onto it.
 *
 * Blade Runner 2049's Joi is projected over the world and the film never
 * lets you forget it. Any value derived or inferred rather than observed
 * is drawn as an overlay: lifted out of the panel, clearly on top, and
 * clearly not part of what was seen.
 *
 * Offsetting a row and dashing its border says "different" but not "not
 * real". A badge reading "inferred" beside an identically weighted number
 * is exactly the failure this rule prevents, with a label on it. */
export function joiOverlay({ rows }) {
  const split = (kind) => (rows || []).filter((r) => r.kind === kind);
  const render = (list) => (list.length ? list : [null]).map((row) => row
    ? `<li class="cd-th-row"${row.value == null ? ' data-unmeasured="1"' : ''}>
        <b>${esc(row.label)}</b>
        <span>${esc(row.value == null ? 'UNMEASURED' : row.value)}</span>
        <cite>${esc(row.cite)}</cite></li>`
    : '<li class="cd-th-row" data-unmeasured="1"><b>NOTHING</b>'
      + '<span>UNMEASURED</span></li>').join('');
  return card('joi', 'Joi overlay presence',
    `<div class="cd-th-projection">
      <ul class="cd-th-canon"><li class="cd-th-head">OBSERVED</li>
        ${render(split('observed'))}</ul>
      <ul class="cd-th-overlay"${attrs(still('a projection is not a reading'))}>
        <li class="cd-th-head">PROJECTED</li>${render(split('projected'))}</ul>
    </div>`,
    { note: 'An overlay is not a reading.' });
}

/** Context-burn creep -- a direction, not a threshold.
 *
 * Edgerunners' cyberpsychosis meter is a creep, not a gauge: the point is
 * the direction. A bar reads as a budget with room left in it. The creep
 * reads as what context exhaustion is -- the working area itself closing
 * in from the edges.
 *
 * Nothing is drawn for an unmeasured subject. A clean panel is exactly
 * what a fresh session looks like, so a worker whose telemetry is absent
 * must not be given one. */
export function contextBurn({ percent = null, subject = null,
                              edge = BURN_EDGE,
                              cite = 'telemetry.context_percent' }) {
  if (percent === null || percent === undefined) {
    return card('burn', 'Context-burn creep',
      refusalFrame({ word: 'CONTEXT UNMEASURED' }),
      { mark: still('context was not measured, and a worker whose telemetry is absent, '
        + 'drawn clean, reads as a fresh one') });
  }
  const value = Number(percent);
  const top = 24, height = 132;
  const edgeX = PAD + SPAN * edge / 100;
  const g = [rect(PAD, top, SPAN, height)];
  // The grain is deterministic, so two captures of one payload are the
  // same bytes and a review can diff them.
  g.push(`<g class="cd-th-grain"${attrs(level(value, 100, { measured: true, cite }))} `
    + `data-level-axis="fade">`
    + staticField(PAD, top, SPAN, height, { density: value / 100,
        seed: Math.trunc(value) }) + '</g>');
  g.push(text(PAD + 10, top + 20, (subject && subject.id) || 'UNIDENTIFIED',
    { size: 9 }));
  g.push(text(PAD + 10, top + 32,
    String((subject && subject.state) || 'unmeasured').toUpperCase(),
    { size: 7, opacity: '.75' }));
  g.push(`<g class="cd-th-edgemark">`
    + line(edgeX, top + height, edgeX, top + height + 6)
    + text(edgeX, top + height + 14, `EDGE ${edge}%`,
        { size: 6.5, anchor: 'middle' }) + '</g>');
  g.push(`<g class="cd-th-burnread">`
    + text(W - PAD - 10, top + height - 12, `${Math.trunc(value)}% BURNED`,
        { size: 11, anchor: 'end' }) + '</g>');
  return card('burn', 'Context-burn creep',
    frame(W, H, g.join(''), {
      extra: `data-past-edge="${value >= edge ? 1 : 0}"`,
      label: `The working panel with ${Math.trunc(value)}% of its context `
           + 'burned, drawn as grain closing in from the edges.' }),
    { note: 'A direction, not a threshold.' });
}
