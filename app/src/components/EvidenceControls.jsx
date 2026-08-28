import { fieldRemoved, evidenceSummary } from '../evidence.js';
import { fieldsFor } from '../../fixtures/index.js';
import { intent } from '../../../src/marks.js';

/** The per-field evidence controls.
 *
 * One control per field the component draws a measurement from, labelled with
 * the field's own path rather than a friendly noun, because the point of the
 * page is that a visitor can chase a number back to who supplies it -- and a
 * label that says `pollPeriod` is the same string as the cite.
 *
 * There is no "restore" button and no reset: the control is a switch per field,
 * and a button that clears all of them at once would be one more thing to
 * accidentally believe.
 *
 * These controls are chrome, so nothing here moves. The button responds to the
 * press and is marked `intent`, which is the library's way of saying the
 * interface answered rather than the fleet. */
export function EvidenceControls({ componentKey, state, onToggleField, disabled }) {
  const summary = evidenceSummary(componentKey, state);

  if (summary.total === 0) {
    return (
      <div className="cd-evidence" data-evidence-controls="none">
        <p className="cd-evidence-note">{summary.label}.</p>
      </div>
    );
  }

  return (
    <div className="cd-evidence" data-evidence-controls="fields">
      <p className="cd-evidence-summary" data-evidence-scope={summary.scope}>
        <b>{summary.removed}</b> / {summary.total} fields removed
        {summary.scope === 'global' && <span> · by the rack switch</span>}
      </p>
      <ul className="cd-evidence-list">
        {fieldsFor(componentKey).map((field) => {
          const off = fieldRemoved(componentKey, field.path, state) || disabled;
          return (
            <li key={field.path} data-field={field.path} data-measured={off ? '0' : '1'}>
              <button type="button" data-control="field"
                      aria-pressed={!off}
                      disabled={disabled}
                      onClick={() => onToggleField(field.path)}
                      {...intent('press')}>
                {off ? 'restore' : 'remove'}
              </button>
              <code>{field.path}</code>
            </li>
          );
        })}
      </ul>
      {disabled && (
        <p className="cd-evidence-note">
          The rack switch has already removed every measurement this page has. Per-field
          controls come back when evidence is on.
        </p>
      )}
    </div>
  );
}
