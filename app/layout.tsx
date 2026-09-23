import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STEMly — Interactive STEM Learning',
  description:
    'Turn any STEM concept into an interactive simulation and learn by experimenting.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}