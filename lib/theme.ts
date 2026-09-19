// Shared design tokens.
//
// These mirror the CSS custom properties defined in app/globals.css.
// They're duplicated here (rather than imported by the Tailwind config)
// so that lib/prompts.ts can describe the palette to the model in plain
// values, keeping generated simulations visually consistent with the
// rest of the app without any build-time coupling.

export const theme = {
  colors: {
    background: '#FAF6EF',
    surface: '#FFFFFF',
    ink: '#211D18',
    inkSoft: '#57514A',
    inkFaint: '#8A8175',
    border: '#E4DCCB',
    accent: '#B5502E',
    accentSoft: '#EFD9C6',
  },
  fonts: {
    display: "'Fraunces', Georgia, 'Iowan Old Style', serif",
    body: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
  },
} as const;
