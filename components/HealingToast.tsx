'use client';

export default function HealingToast() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center animate-fade-up">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-hairline bg-surface/95 px-4 py-2 shadow-md backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-accent animate-breathe" />
        <span className="font-body text-xs text-ink-soft">Smoothing out a rendering hiccup…</span>
      </div>
    </div>
  );
}
