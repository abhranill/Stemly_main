'use client';

import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onNewTopic: () => void;
}

export default function ErrorState({
  message,
  onRetry,
  onNewTopic,
}: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <AlertTriangle size={23} strokeWidth={1.7} />
      </div>

      <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
        We hit a small problem
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          <RefreshCw size={16} />
          Try again
        </button>

        <button
          onClick={onNewTopic}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          New topic
        </button>
      </div>
    </div>
  );
}