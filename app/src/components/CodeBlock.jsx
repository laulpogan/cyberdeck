import { useRef, useState } from 'react';
import { intent } from '../../../src/marks.js';

/** The copy-to-use block.
 *
 * The text is on screen before it is ever copied, because a snippet nobody can
 * read is a claim rather than an example. The button writes the same string the
 * <pre> shows; the failure path says so instead of looking like it worked, which
 * is the same rule the components run -- an action that did not happen gets a
 * sentence, not a reassuring nothing.
 *
 * Copying is an operator act, so the button carries `intent`. The page adds no
 * motion of its own to a clipboard write, and there is no toast that fades: a
 * fading box is an animation with a timer behind it and no measurement at all. */
export function CodeBlock({ text, label = 'copy-to-use' }) {
  const pre = useRef(null);
  const [status, setStatus] = useState(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch (error) {
      // Clipboard permissions are the browser's to refuse. Selecting the block is
      // the honest fallback: the visitor can still copy, and nothing pretended.
      const node = pre.current;
      if (node && typeof window.getSelection === 'function') {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setStatus('select it yourself · ' + (error && error.name ? error.name : 'refused'));
    }
  };

  return (
    <div className="cd-use" data-panel="use">
      <div className="cd-use-head">
        <b>{label}</b>
        <button type="button" data-control="copy" onClick={copy} {...intent('press')}>
          copy
        </button>
        {status && <span data-copy-state={status}>{status}</span>}
      </div>
      <pre ref={pre}><code>{text}</code></pre>
    </div>
  );
}
