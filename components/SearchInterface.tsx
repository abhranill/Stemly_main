'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SearchInterfaceProps {
  onSubmit: (topic: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
}

export default function SearchInterface({
  onSubmit,
  initialValue = '',
  autoFocus = true,
}: SearchInterfaceProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = value.trim();

    if (!trimmed) return;

    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="search-shell flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 pl-5 shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
        <Sparkles
          size={20}
          strokeWidth={1.8}
          className="shrink-0 text-blue-600"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about a STEM concept..."
          autoFocus={autoFocus}
          maxLength={200}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
        />

        <button
          type="submit"
          disabled={!value.trim()}
          className="group flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-600 disabled:pointer-events-none disabled:opacity-35 sm:px-5"
        >
          <span className="hidden sm:inline">Explore</span>

          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        Try something like{' '}
        <span className="font-medium text-slate-500">
          wave interference
        </span>
        ,{' '}
        <span className="font-medium text-slate-500">
          projectile motion
        </span>{' '}
        or{' '}
        <span className="font-medium text-slate-500">
          enzyme kinetics
        </span>
      </p>
    </form>
  );
}