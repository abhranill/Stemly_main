'use client';

import { FormEvent, useState } from 'react';

interface SearchInterfaceProps {
  onSubmit: (topic: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
}

export default function SearchInterface({ onSubmit, initialValue = '', autoFocus = true }: SearchInterfaceProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="group flex items-center gap-3 rounded-xl border border-hairline bg-surface px-5 py-4 transition-all duration-300 focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--color-accent-soft)]">
        <span className="font-display text-lg text-ink-faint select-none">→</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter any STEM concept — wave interference, ionization energy, Bayes' theorem…"
          autoFocus={autoFocus}
          maxLength={200}
          className="w-full bg-transparent font-body text-base text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="shrink-0 rounded-lg bg-ink px-4 py-2 font-body text-sm font-medium text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent disabled:pointer-events-none disabled:opacity-30 disabled:hover:translate-y-0"
        >
          Visualize
        </button>
      </div>
    </form>
  );
}
