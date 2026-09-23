/**
 * Runs inside the sandboxed iframe, before any model-generated code.
 *
 * Catches:
 * - Synchronous JavaScript errors
 * - Unhandled promise rejections
 * - Runtime/rendering crashes
 *
 * Then reports the error to the parent window through postMessage so
 * STEMly can trigger the Gemini self-healing loop.
 */

const ERROR_SHIM = `
<script>
(function () {
  var reported = false;

  function report(detail) {
    if (reported) return;

    reported = true;

    try {
      window.parent.postMessage(
        {
          source: 'stemly-sim',
          type: 'error',
          payload: detail
        },
        '*'
      );
    } catch (e) {
      /* Parent unreachable, nothing more we can do */
    }
  }

  window.onerror = function (
    message,
    source,
    lineno,
    colno,
    error
  ) {
    report({
      message: String(message),
      stack:
        error && error.stack
          ? String(error.stack)
          : undefined,
      source:
        source
          ? String(source)
          : undefined,
      lineno: lineno,
      colno: colno
    });

    return true;
  };

  window.addEventListener(
    'unhandledrejection',
    function (event) {
      var reason = event.reason;

      report({
        message:
          'Unhandled promise rejection: ' +
          (
            reason && reason.message
              ? reason.message
              : String(reason)
          ),

        stack:
          reason && reason.stack
            ? String(reason.stack)
            : undefined
      });
    }
  );

  window.addEventListener(
    'DOMContentLoaded',
    function () {
      try {
        window.parent.postMessage(
          {
            source: 'stemly-sim',
            type: 'ready'
          },
          '*'
        );
      } catch (e) {}
    }
  );
})();
</script>
`;

const BASE_STYLE = `
<style>
  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  body {
    font-family:
      'Space Grotesk',
      'Helvetica Neue',
      Arial,
      sans-serif;

    color: #211D18;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #E4DCCB;
    border-radius: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }
</style>
`;

/**
 * Removes markdown code fences if the AI model
 * accidentally wraps the generated HTML in them.
 */
export function stripCodeFences(raw: string): string {
  let text = raw.trim();

  const fenceMatch = text.match(
    /^```(?:html)?\s*([\s\S]*?)\s*```$/i
  );

  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  return text;
}

/**
 * Ensures the generated content is a complete HTML document.
 *
 * If Gemini returns only a fragment, we wrap it in
 * <!DOCTYPE html>, <html>, <head> and <body>.
 */
export function ensureFullDocument(html: string): string {
  if (/<html[\s>]/i.test(html)) {
    return html;
  }

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
  </head>

  <body>
    ${html}
  </body>
</html>
`;
}

/**
 * Injects:
 *
 * 1. Error reporting
 * 2. Base styling
 *
 * into the generated HTML before it is rendered
 * inside the sandboxed iframe.
 */
export function buildSandboxDocument(rawHtml: string): string {
  const cleaned = ensureFullDocument(
    stripCodeFences(rawHtml)
  );

  const injection =
    ERROR_SHIM +
    BASE_STYLE;

  if (/<head[^>]*>/i.test(cleaned)) {
    return cleaned.replace(
      /<head[^>]*>/i,
      (match) => `${match}\n${injection}`
    );
  }

  if (/<html[^>]*>/i.test(cleaned)) {
    return cleaned.replace(
      /<html[^>]*>/i,
      (match) =>
        `${match}\n<head>${injection}</head>`
    );
  }

  return `
<!DOCTYPE html>
<html>
  <head>
    ${injection}
  </head>

  <body>
    ${cleaned}
  </body>
</html>
`;
}

/**
 * Extracts the actual HTML returned by Gemini.
 *
 * Gemini returns generated text rather than an
 * Anthropic Message object, so this function simply
 * cleans the returned string.
 */
export function extractHtmlFromResponse(
  rawText: string
): string {
  const text = rawText.trim();

  return stripCodeFences(text);
}