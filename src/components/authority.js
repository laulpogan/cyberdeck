// AUTHORITY -- the Dominator rule. How a control is allowed to look.
//
// Psycho-Pass's Dominator will not fire until the system says it may, and
// it tells the holder why in the same breath. That is the whole pattern,
// and it is the one rendering rule every control in this library obeys:
//
//     a control that lacks its grant is not a greyed-out button.
//     It is inert glass that NAMES the authority it is missing.
//
// "Disabled" is the failure mode this replaces. A disabled button teaches
// an operator to click it again; it hides whether the block is policy,
// plumbing, identity, or a permit the producer never issued. Those are
// four different problems with four different fixes, and only one of them
// is the operator's.
//
// Three states:
//     GRANTED         a grant covers this verb for this identity -- act
//     NO GRANT        inert glass, naming exactly one missing authority
//     CEREMONY REQ.   the grant exists and the action is irreversible, so
//                     it takes staged steps and a window, never one click

import { attrs, refusal, still } from '../marks.js';
import { card, esc } from './card.js';

export const ACTING_MODE = 'act-reversible';

const WORD = {
  granted: 'GRANTED',
  no_grant: 'NO GRANT',
  ceremony_required: 'CEREMONY REQ.',
};

/** The epistemic class of a block, which is what decides its colour.
 *
 *   unknown   nobody said. The cannot-see colour.
 *   refused   somebody said no. A measured, explicit denial.
 *   absent    we looked at our own runtime and the thing is not there.
 *
 * Painting all three the same put "the producer has not said whether this
 * is permitted" and "the subject's evidence refuses this verb" in the
 * same ink, side by side, meaning opposite things. */
const refused = (missing, why, kind = 'absent') =>
  ({ state: 'no_grant', word: WORD.no_grant, missing, why, kind });

/** The sentence this module exists to keep: a producer that has not answered is not a producer
 * that said no. It is printed **once per card**, not once per row — the row already carries the
 * word `PERMIT UNMEASURED`, and repeating the paragraph under every verb in a fourteen-rung
 * ladder made the refused state 54px taller than the measured one. Words the refusal must say
 * are allowed exactly their own line; a paragraph multiplied by a population is layout, and the
 * layout of a specimen belongs to the measurement, not to the epistemic state. */
const SILENCE_IS_NOT_CONSENT = 'The producer has not said whether this is permitted.'
  + ' Silence is not consent.';


/** Which of the three states a control renders in, and why.
 *
 * The ladder stops at the FIRST missing authority. The order is
 * deliberate -- outermost policy first, the subject's own permit last --
 * so an operator is never sent to argue about a permit that a read-only
 * mode made irrelevant. An operator told "operator authentication" fixes
 * that and comes back; being handed four blockers at once is being handed
 * none. */
export function evaluate(verb, env) {
  if (env.mode !== ACTING_MODE) {
    return refused(`EFFECTIVE MODE ${String(env.mode || 'observe').toUpperCase()}`,
      'This deck is not in an acting mode. No command may leave the page.',
      'refused');
  }
  if (env.operator === null || env.operator === undefined) {
    // A server-rendered page cannot see the client's session. Saying "no
    // operator" would be a guess and saying "granted" would be a lie, so
    // the control names where the session actually lives.
    return refused('OPERATOR SESSION UNCONFIRMED',
      'This render cannot see a session. Confirm it where the session lives.',
      'unknown');
  }
  if (!env.operator) {
    return refused('OPERATOR AUTHENTICATION',
      'No operator session is bound to this request.', 'absent');
  }
  if (!env.adapter) {
    return refused('COMMAND ADAPTER',
      'The command boundary is not reachable from this process.', 'absent');
  }
  if (!(env.capabilities || []).includes(verb.commandType)) {
    return refused(`VERB ${String(verb.commandType).toUpperCase()}`,
      'The orchestrator exposes no mutation of this type. The seam does not '
      + 'exist yet.', 'absent');
  }
  if (verb.permit === null || verb.permit === undefined) {
    // "Nobody told us" and "we were told no" are different facts, and
    // collapsing them is how a console starts lying quietly.
    // One clause on the row — the sentence itself is at the card, once.
    return refused('PERMIT UNMEASURED', 'The producer has not said.', 'unknown');
  }
  if (verb.permit === false) {
    return refused('PERMIT WITHHELD',
      "The subject's own evidence refuses this verb, and the deck will not "
      + 'override it.', 'refused');
  }
  if (verb.irreversible) {
    return { state: 'ceremony_required', word: WORD.ceremony_required,
      missing: 'ACCEPTANCE CEREMONY',
      why: 'Irreversible. Two keys and an abort window, never one click.',
      kind: 'refused' };
  }
  return { state: 'granted', word: WORD.granted, missing: null,
    why: 'A grant covers this verb for this identity.', kind: null };
}

/** One control, rendered honestly.
 *
 * GRANTED renders a real button. The other two render a span -- not a
 * disabled button -- because a disabled button is still a button and
 * still invites the press. Inert glass is a different object. */
export function control(verb, grant) {
  const wait = verb.expectedWait
    ? `<span class="cd-grant-wait">${esc(verb.expectedWait)}</span>`
    : '<span class="cd-grant-wait" data-unmeasured="1">WAIT UNMEASURED</span>';
  const body = `<span class="cd-grant-label">${esc(verb.label)}</span>`
    + `<span class="cd-grant-word">${esc(grant.word)}</span>${wait}`;
  const shell = grant.state === 'granted'
    ? `<button type="button" class="cd-grant" data-grant="granted" `
      + `data-command-type="${esc(verb.commandType)}">${body}</button>`
    : `<span class="cd-grant" role="note" data-grant="${esc(grant.state)}" `
      + `data-command-type="${esc(verb.commandType)}" aria-disabled="true">${body}</span>`;
  const missing = grant.missing
    ? `<span class="cd-grant-missing" data-kind="${esc(grant.kind || 'absent')}">`
      + `<b>${grant.kind === 'unknown' ? 'UNKNOWN' : 'MISSING'}</b>`
      + `${esc(grant.missing)}</span>`
    : '';
  return `<span class="cd-grant-cell" data-grant-state="${esc(grant.state)}">${shell}`
    + `<span class="cd-grant-why">${missing}`
    + `<span class="cd-grant-reason">${esc(grant.why)}</span>`
    + (verb.cite ? `<cite>${esc(verb.cite)}</cite>` : '')
    + '</span></span>';
}

/** The Dominator control, as a specimen.
 *
 * Three verbs against one environment, so the three states stand next to
 * each other and the difference between them is legible without reading
 * the labels. */
export function dominator({ verbs, env }) {
  if (!verbs || !verbs.length) {
    return card('dominator', 'The Dominator control', '',
      { mark: refusal('no verb was offered') });
  }
  const graded = verbs.map((verb) => [verb, evaluate(verb, env)]);
  return card('dominator', 'The Dominator control',
    `<div class="cd-grant-stack" data-drawing="grant">${
      graded.map(([verb, grant]) => control(verb, grant)).join('')}</div>`,
    { note: `Inert glass names the authority it is missing. ${SILENCE_IS_NOT_CONSENT}` });
}

/** Command ladder -- every verb, priced in authority.
 *
 * The quickhack menu is the reference, and the reason it works is that
 * the unaffordable rungs STAY ON THE LIST. Hiding a verb an operator
 * lacks authority for hides the system's shape; showing it inert teaches
 * the shape in one glance. */
export function ladder({ verbs, env, label = 'Command ladder' }) {
  if (!verbs || !verbs.length) {
    return card('ladder', 'Command ladder', '',
      { mark: refusal('the orchestrator exposes no verbs') });
  }
  const graded = verbs.map((verb) => [verb, evaluate(verb, env)]);
  const granted = graded.filter(([, g]) => g.state === 'granted').length;
  // The card already carries the name. Repeating it inside is a second
  // heading for one thing.
  return card('ladder', label,
    `<div class="cd-ladder" data-drawing="ladder">
      <header><span>${granted} OF ${verbs.length} GRANTED</span></header>
      <ul>${graded.map(([verb, grant]) =>
        `<li data-grant-state="${esc(grant.state)}">${control(verb, grant)}</li>`).join('')}</ul>
    </div>`,
    { note: `The rungs you cannot afford stay on the list. ${SILENCE_IS_NOT_CONSENT}` });
}
