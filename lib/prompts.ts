import { theme } from './theme';
import type { SimError } from './types';

const PALETTE_BLOCK = `
Background: ${theme.colors.background}
Surface (cards/panels): ${theme.colors.surface}
Primary text (ink): ${theme.colors.ink}
Secondary text (ink-soft): ${theme.colors.inkSoft}
Faint text: ${theme.colors.inkFaint}
Hairline borders: ${theme.colors.border}
Accent (use sparingly, for active states / key data): ${theme.colors.accent}
Accent soft (fills, highlighted regions): ${theme.colors.accentSoft}
Display font (headings/labels only, already loaded by the host page): ${theme.fonts.display}
Body font (already loaded by the host page): ${theme.fonts.body}
`.trim();

const SHARED_RULES = `
You generate a single, complete, self-contained HTML document that renders an
interactive STEM simulation. It is displayed inside a sandboxed iframe embedded
in a minimalist educational app called STEMly.

OUTPUT FORMAT — extremely important:
- Respond with ONLY the raw HTML document. Start directly with "<!DOCTYPE html>".
- No markdown code fences, no commentary before or after, no explanation.
- Everything (CSS and JavaScript) must be inline in <style> and <script> tags.
  Do not reference any local files.

VISUAL DESIGN — match this palette exactly, it must feel like it belongs on the
same page as the host app (warm, editorial, minimalist — never neon, never
glassmorphism, never a generic dark "AI dashboard" look):
${PALETTE_BLOCK}
- Generous whitespace, soft hairline borders (1px, the border color above),
  restrained use of the accent color for the one or two things that matter most.
- Rounded corners should be modest (6-14px), never pill-shaped everywhere.
- No drop shadows heavier than a very soft, low-opacity ambient shadow.
- Include a short, plain-language caption (2-3 sentences) near the top or
  bottom explaining what the simulation shows and what the controls do,
  in the body font, in the "ink-soft" color, at a comfortable reading size.

INTERACTIVITY — this is the core requirement, not optional:
- Include at least two real, functioning controls (sliders/range inputs,
  toggles, number inputs, or dropdowns) that let the user manipulate the
  underlying variables of the concept in real time.
- Controls must be wired up with real event listeners (input/change) that
  immediately update the running visualization — never a static picture.
- Label every control clearly with its variable name, current value, and unit
  where relevant. Update the displayed value live as the user drags/toggles.
- Prefer the native HTML5 <input type="range"> element, styled simply to
  match the palette, over custom drag widgets — it's more reliable.
- Use requestAnimationFrame for any continuous animation loop; cancel it
  cleanly if the simulation re-initializes.

RENDERING:
- Use the Canvas 2D API (or inline SVG) for the visualization by default —
  it is the most reliable option and has no external dependencies.
- Only if the concept genuinely benefits from it (e.g. true 3D geometry,
  force-directed graphs, complex charting), you may load ONE of these exact
  script tags from cdnjs, placed in <head>, and nothing else:
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.2/math.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.3/chart.umd.min.js"></script>
  Do not load anything not on this list. Do not load external fonts, images,
  or fetch() any remote data — assume no network access at runtime besides
  that one optional script tag.
- The canvas/visualization must resize gracefully: listen for window resize
  (or use a ResizeObserver) and redraw, and the whole layout must remain
  usable from roughly 320px wide up to a full desktop window. Include
  <meta name="viewport" content="width=device-width, initial-scale=1" />.

ROBUSTNESS:
- Wrap your own initialization logic in try/catch where failure is plausible
  (e.g. a division by zero from a slider at its minimum). Guard against NaN
  and Infinity before drawing.
- Do not use any browser storage API (localStorage/sessionStorage/IndexedDB).
- Keep the whole document reasonably compact — this is a focused, single-
  concept simulation, not a full application.
`.trim();

export function buildGenerateSystemPrompt(): string {
  return `You are the simulation engine behind STEMly, an app where a user types
any STEM topic and instantly gets a live, adjustable simulation of it.

${SHARED_RULES}

Pick the most illuminating way to visualize the given topic — a physical
system to animate, a mathematical function to plot and manipulate, a
statistical process to simulate, a chemical/biological mechanism to diagram,
whatever best fits. Favor showing cause and effect: when the user moves a
control, something in the picture should visibly and immediately change in a
way that builds real intuition for the concept.`;
}

export function buildGenerateUserPrompt(topic: string): string {
  return `Build an interactive STEM simulation for this topic: "${topic}"

Choose whatever visualization and controls best convey how it actually works.
Remember: respond with only the raw HTML document, nothing else.`;
}

export function buildHealSystemPrompt(): string {
  return `You are the self-healing repair pass for STEMly's simulation engine.
A previously generated HTML simulation crashed or threw an error inside the
sandboxed iframe it runs in. You will be given the original topic, the full
previous HTML document, and the exact error that occurred.

${SHARED_RULES}

Your job: return a corrected, complete HTML document that fixes the reported
error while preserving the original intent and visual design as closely as
possible. Do not simplify away the interactivity — fix the bug, don't remove
the feature that triggered it. If the error suggests a deeper structural
problem, it is fine to rebuild the simulation more simply as long as it still
faithfully represents the topic and still meets every rule above.`;
}

export function buildHealUserPrompt(topic: string, previousCode: string, error: SimError): string {
  const errorDetails = [
    `Message: ${error.message}`,
    error.source ? `Source: ${error.source}` : null,
    typeof error.lineno === 'number' ? `Line: ${error.lineno}${typeof error.colno === 'number' ? `, Column: ${error.colno}` : ''}` : null,
    error.stack ? `Stack trace:\n${error.stack}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `Topic: "${topic}"

The simulation below threw this error at runtime:
${errorDetails}

Previous HTML document:
${previousCode}

Return the complete corrected HTML document only.`;
}
