'use client';

import { useEffect, useState } from 'react';
import {
  Atom,
  BrainCircuit,
  FlaskConical,
  Sparkles,
} from 'lucide-react';

const STATUS_MESSAGES = [
  'Understanding the concept…',
  'Designing the experiment…',
  'Building the visualization…',
  'Connecting the variables…',
];

interface LoadingStateProps {
  topic: string;
}

export default function LoadingState({
  topic,
}: LoadingStateProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex(
        (index) => (index + 1) % STATUS_MESSAGES.length
      );
    }, 1600);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="absolute inset-0 scale-150 rounded-full bg-blue-100 blur-2xl" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl">
          <Atom
            size={29}
            strokeWidth={1.5}
            className="animate-pulse-soft"
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          <Sparkles size={13} />
          Building your experiment
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {topic}
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          {STATUS_MESSAGES[statusIndex]}
        </p>
      </div>

      <div className="mt-10 flex gap-3">
        {[BrainCircuit, FlaskConical, Atom].map(
          (Icon, index) => (
            <div
              key={index}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              <Icon size={17} />
            </div>
          )
        )}
      </div>
    </div>
  );
}