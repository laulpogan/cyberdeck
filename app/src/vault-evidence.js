/** What the reference vault measured about motion that reports nothing.
 *
 * The app's chrome rule — no spinner, no shimmer, no ambient pulse, `MOVING WITHOUT EVIDENCE`
 * at zero — has always been stated as a rule. Here it is as a measurement, taken off two real
 * loaders that an eye verified (`vault/EYEBALL.json`) and `vault/spec.py` then measured. Neither
 * is re-enacted on this page: the app must not put a spinner on screen to argue against
 * spinners, so what follows is ink and numbers, with the file each number came from.
 *
 * Plain ESM with no JSX, like the rest of the app's logic, so `node --test` can read the
 * figures and fail if a copy edit drifts them away from what was measured.
 */

/** One row per reference the measurement is about. `numbers` are quoted from `vault/SPECS.md`;
 * `refusal` is what the library does instead, and each names the mark kind that carries it. */
export const FORBIDDEN_IDIOMS = [
  {
    idiom: 'A word that turns, a dot that follows it',
    measured: '2.4s of film · the changed pixels travel 0.36 of a frame · no extent anywhere',
    verdict: 'It moves a great deal. No measurement drives any of it — the travel is the '
      + 'rotation of a word, not a quantity crossing a lane.',
    file: 'fake-os-loaders--blob.gifcities.org_gifcities_2S4N3JQ6GIQGIKRNQ6CX4AAHKS6DQHE6.gif',
    source: 'https://blob.gifcities.org/gifcities/2S4N3JQ6GIQGIKRNQ6CX4AAHKS6DQHE6.gif',
  },
  {
    idiom: 'The ellipsis that grows to three and starts again',
    measured: '6 frames over 0.24s · travel 0.04 of a frame · the only quantity is the dot count',
    verdict: 'A count of dots says nothing about the thing it is waiting for.',
    file: 'fake-os-loaders--blob.gifcities.org_gifcities_34C5WYILX3AL74KKP36H6JB75QTVKCUD.gif',
    source: 'https://blob.gifcities.org/gifcities/34C5WYILX3AL74KKP36H6JB75QTVKCUD.gif',
  },
];

/** What the same instrument says motion *should* look like when there is a measurement. Quoted
 * next to the two above so the rule does not read as an aversion to movement. */
export const PERMITTED_IDIOMS = [
  {
    idiom: 'A marker crossing a named lane',
    measured: '0.70 of the frame crossed · 0.46 of the way along at half the duration · '
      + '4 of 12 grid cells never move',
    verdict: 'Constant rate, furniture still: the travel is the measurement. The library '
      + 'travels a head along the named lane with `trace` and puts the extent in `level`.',
    kind: 'trace',
    file: 'fake-os-loaders--blob.gifcities.org_gifcities_36SZVJ74JXC6QPNLGBGDNMW26HNU7TFW.gif',
    source: 'https://blob.gifcities.org/gifcities/36SZVJ74JXC6QPNLGBGDNMW26HNU7TFW.gif',
  },
  {
    // The fourth row is the one the instrument could not see, and it is kept because the
    // blindness is the lesson: an audio editor's playhead is a dark hairline on a light
    // window, so the bright-ink tracker prints `no bright marker crosses the frame` while the
    // eye watched it cross the whole strip. Quote what the instrument printed; do not quote it
    // as if it had measured something.
    idiom: 'A marker crossing a strip that is already ink',
    measured: '48 frames over 8.0s · motion amplitude (max difference from frame zero): 5.4 · '
      + 'no bright marker crosses the frame',
    verdict: 'The waveform, the ruler and the labels are drawn before anything moves, and the '
      + 'only motion is a hairline crossing them at a clock\'s constant rate. A series that '
      + 'grows itself into being is animating the data instead of reading it.',
    kind: 'decay',
    file: 'scope-envelope-violin.gif',
    source: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/'
      + 'Envelope_comparison_between_violin_pizz_and_piano.webm',
  },
  {
    idiom: 'A route drawn by the thing that arrived along it',
    measured: '0.77 of the frame crossed · 1.0 — the far end — by half the duration · '
      + 'the route it drew stays on screen',
    verdict: 'Ease out and hold. A trace that keeps moving has not arrived.',
    kind: 'trace',
    file: 'spinner-console--blob.gifcities.org_gifcities_2EABIEZLK7C7RZMCFOOHZKIPRAPVWALH.gif',
    source: 'https://blob.gifcities.org/gifcities/2EABIEZLK7C7RZMCFOOHZKIPRAPVWALH.gif',
  },
  {
    idiom: 'A beam tipping to the difference between two counts',
    measured: '0.93 of the way over by half the duration, then it holds',
    verdict: 'Front-loaded, because a load arrives and then sits there.',
    kind: 'level',
    library: '`axis: "tilt"` — the third dialect of an extent. The travel sits in a middle '
      + 'keyframe rather than in an easing word: asking the engine for `ease-out` measured 0.48 '
      + 'of the way over at half the animation, and putting 0.93 of the travel in the first half '
      + 'of the swing measures 0.91-0.92 run to run, against the 0.93 those frames were quoted '
      + 'with. It starts from '
      + 'the counter-rotation, so the angle the server drew stays the angle the page rests at.',
    file: 'motion-tracker--blob.gifcities.org_gifcities_25G2DJC3DOO6R72EAGURMGNK5YW7FRZC.gif',
    source: 'https://blob.gifcities.org/gifcities/25G2DJC3DOO6R72EAGURMGNK5YW7FRZC.gif',
  },
  {
    idiom: 'A mesh turning at the interval it declares',
    measured: '0.367 of the frame crossed · 0.43 of the way along at half the duration · '
      + '21 frames over 4.2s',
    verdict: 'The rate is the reading. A globe that turns faster on a faster screen is not '
      + 'measuring anything; it is being refreshed.',
    kind: 'traffic',
    library: 'The turn is derived from elapsed time against `data-period`, not from an increment '
      + 'per animation frame. Counting frames was a 60 Hz assumption wearing a measurement: the '
      + 'same mark declared 4s and turned in 1.1s on a compositor with no refresh lock. It '
      + 'measures 4.00s per turn now, with no spread between turns.',
    file: 'hologlobe--blob.gifcities.org_gifcities_2BDK66BWLK42ADEG52TMSEUEDO6IZDTX.gif',
    source: 'https://blob.gifcities.org/gifcities/2BDK66BWLK42ADEG52TMSEUEDO6IZDTX.gif',
  },
];

/** The two rules these rows were gathered to support, in the app's own words. */
export const RULES_HELD = [
  'Chrome motion is a measurement or it does not happen.',
  'A distinction that lives only in hue is gone in monochrome — carry it in shape first.',
];

// The count in the sentence is the count of rows below it. A total written by hand next to a
// table that can count itself is the drift this library refuses everywhere else (finding #6).
const ROWS = FORBIDDEN_IDIOMS.length + PERMITTED_IDIOMS.length;
// Both figures are held to their source by `test/app-vault-evidence.test.mjs`: VERIFIED_COUNT
// against vault/EYEBALL.json, MOVING_COUNT against the list vault/RANK.json ranks. The first
// draft of this line said 131 from memory, and the test named 114 — which is what the ranking
// actually contains.
export const VERIFIED_COUNT = 16;
export const MOVING_COUNT = 114;
export const VAULT_NOTE = `${MOVING_COUNT} moving reference files were ranked for how much of `
  + `the frame they move and how dark their ground is; ${VERIFIED_COUNT} of them survived an `
  + `eye looking for an interface filling the frame. These ${ROWS} are the ones the figures `
  + `below were taken from, and every number on this page is reproducible with `
  + `\`python3 vault/spec.py\`.`;
