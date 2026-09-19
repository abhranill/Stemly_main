import type Anthropic from '@anthropic-ai/sdk';

/**
 * Runs inside the sandboxed iframe, before any model-generated code.
 * Catches synchronous errors, promise rejections, and canvas-render
 * crashes, then reports them to the parent window via postMessage so
 * the app can trigger the self-healing loop without the tab crashing
 * or a blank white iframe being left behind.
 */
const ERROR_SHIM = `
<script>
(function () {
  var reported = false;
  function report(detail) {
    if (reported) return;
    reported = true;
    try {
      window.parent.postMessage({ source: 'stemly-sim', type: 'error', payload: detail }, '*');
    } catch (e) {
      /* parent unreachable, nothing more we can do */
    }
  }
  window.onerror = function (message, source, lineno, colno, error) {
    report({
      message: String(message),
      stack: error && error.stack ? String(error.stack) : undefined,
      source: source ? String(source) : undefined,
      lineno: lineno,
      colno: colno,
    });
    return true;
  };
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    report({
      message: 'Unhandled promise rejection: ' + (reason && reason.message ? reason.message : String(reason)),
      stack: reason && reason.stack ? String(reason.stack) : undefined,
    });
  });
  window.addEventListener('DOMContentLoaded', function () {
    try {
      window.parent.postMessage({ source: 'stemly-sim', type: 'ready' }, '*');
    } catch (e) {}
  });
})();
</script>
`;

const BASE_STYLE = `
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;
    color: #211D18;
  }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #E4DCCB; border-radius: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
</style>
`;

/**
 * Strips markdown code fences the model occasionally wraps output in,
 * despite being instructed not to.
 */
export function stripCodeFences(raw: string): string {
  let text = raw.trim();
  const fenceMatch = text.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }
  return text;
}

/** Ensures the string is a full HTML document, wrapping it defensively if not. */
export function ensureFullDocument(html: string): string {
  if (/<html[\s>]/i.test(html)) return html;
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>${html}</body></html>`;
}

/**
 * Injects the error-reporting shim and base reset styles into the
 * <head> of a full HTML document string, so the sandboxed iframe can
 * report crashes back to the parent for the auto-heal loop.
 */
export function buildSandboxDocument(rawHtml: string): string {
  const cleaned = ensureFullDocument(stripCodeFences(rawHtml));
  const injection = ERROR_SHIM + BASE_STYLE;

  if (/<head[^>]*>/i.test(cleaned)) {
    return cleaned.replace(/<head[^>]*>/i, (match) => `${match}\n${injection}`);
  }
  if (/<html[^>]*>/i.test(cleaned)) {
    return cleaned.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${injection}</head>`);
  }
  return `<!DOCTYPE html><html><head>${injection}</head><body>${cleaned}</body></html>`;
}

/** Pulls concatenated text blocks out of an Anthropic Messages API response. */
export function extractHtmlFromResponse(message: Anthropic.Message): string {
  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
  return stripCodeFences(text);
}
