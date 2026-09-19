# STEMly

Type any STEM concept — *wave interference*, *ionization energy*, *Bayes'
theorem* — and STEMly generates a live, interactive simulation of it on the
spot: sliders and toggles you can drag to see cause and effect, not a static
diagram.

## How it works

1. **You type a topic.** `SearchInterface` sends it to `/api/generate`.
2. **The server asks Claude to build a simulation.** `app/api/generate/route.ts`
   calls the Anthropic Messages API with a detailed system prompt
   (`lib/prompts.ts`) that asks for one self-contained HTML document: inline
   CSS, inline JS, real `<input type="range">` controls wired to a live
   Canvas/SVG visualization, styled to match STEMly's own palette.
3. **It renders in a sandboxed iframe.** `components/SimulationFrame.tsx`
   drops the returned HTML into an `<iframe sandbox="allow-scripts" srcDoc=…>`.
   Before the generated code runs, `lib/sandbox.ts` injects a small shim that
   installs `window.onerror` / `unhandledrejection` listeners.
4. **If it crashes, it heals itself.** The shim `postMessage`s the exact
   error back to the parent page. The parent calls `/api/heal` with the
   topic, the last code, and the error — Claude returns a corrected
   document, and the iframe remounts with it. This repeats up to 3 times
   before falling back to a plain error screen, so a bad generation never
   just shows the user a broken white box.

## Project layout

```
app/
  page.tsx                 the idle / loading / ready / error flow
  layout.tsx                fonts (Fraunces + Space Grotesk) & metadata
  globals.css                design tokens + base styles
  api/generate/route.ts      calls Claude to build the first simulation
  api/heal/route.ts          calls Claude to repair a crashed one
components/
  SearchInterface.tsx         the topic input
  TopicChips.tsx               example topics
  SimulationFrame.tsx           the sandboxed iframe + auto-heal loop
  LoadingState.tsx, ErrorState.tsx, HealingToast.tsx
lib/
  prompts.ts        the generation & healing prompts
  sandbox.ts          error-shim injection + response parsing
  theme.ts             shared palette/font tokens
  types.ts              shared TypeScript types
```

## Local setup

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
# then put your key in .env.local:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Open http://localhost:3000.

Get a key at https://console.anthropic.com/ (Settings → API Keys).

## Deploying to Vercel

1. Push this folder to a new GitHub repository.
2. In Vercel, **Add New → Project**, and import that repo. Vercel
   auto-detects Next.js — no build settings to change.
3. Under **Project Settings → Environment Variables**, add
   `ANTHROPIC_API_KEY` with your key, for the Production (and Preview, if
   you want) environment.
4. Deploy.

Both API routes set `maxDuration = 60` since a full simulation generation
can take longer than a typical serverless default. Vercel's Hobby plan
currently allows this, but plan limits do change — if a deploy caps the
duration lower than expected, either raise it under your plan's function
settings or shorten `max_tokens` in `lib/prompts.ts`.

## Customizing

- **Model** — change `MODEL` in `app/api/generate/route.ts` and
  `app/api/heal/route.ts`. It's currently set to `claude-sonnet-5`.
- **Palette / fonts** — edit `lib/theme.ts` (used both by the generation
  prompt and, via the matching CSS variables, by `app/globals.css`).
- **Heal attempts** — `MAX_HEAL_ATTEMPTS` in `components/SimulationFrame.tsx`
  (currently 3).
- **Allowed simulation libraries** — the exact cdnjs script tags the model
  is permitted to reach for (three.js, p5.js, d3, mathjs, Chart.js) are
  listed in `lib/prompts.ts`; add or remove from that list as you like.

## A note on this build

This project was scaffolded and written file-by-file in an offline sandbox
without network access, so `npm install` / `npm run build` could not be run
here to verify a clean compile end-to-end. Everything follows current
Next.js 14 App Router, Tailwind 3, and `@anthropic-ai/sdk` conventions
carefully, but please run `npm run build` locally (or let Vercel's build
step catch it) before you rely on the deploy — and open an issue against
yourself if something needs a tweak, that's normal for a first pass.

## Ideas for later

- Per-IP rate limiting on `/api/generate` (there isn't any yet).
- Caching generated simulations for popular topics.
- A "save this simulation" / shareable link feature.
- Dark mode (the CSS variable structure in `globals.css` makes this a
  fairly small addition).
