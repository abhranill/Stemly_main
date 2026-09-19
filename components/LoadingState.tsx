'use client';

import { useEffect, useState } from 'react';

const STATUS_MESSAGES = [
  'Reading up on the concept…',
  'Sketching the visualization…',
  'Wiring up the controls…',
  'Tuning the details…',
];

interface LoadingStateProps {
  topic: string;
}

export default function LoadingState({ topic }: LoadingStateProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-28 text-center animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-accent animate-breathe" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent animate-breathe" style={{ animationDelay: '0.2s' }} />
        <span className="h-2.5 w-2.5 rounded-full bg-accent animate-breathe" style={{ animationDelay: '0.4s' }} />
      </div>
      <div>
        <p className="font-display text-xl italic text-ink">Building &ldquo;{topic}&rdquo;</p>
        <p className="mt-2 font-body text-sm text-ink-faint transition-opacity duration-300">
          {STATUS_MESSAGES[statusIndex]}
        </p>
      </div>
    </div>
  );
}
