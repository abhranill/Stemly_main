'use client';

import { useCallback, useState } from 'react';
import SearchInterface from '@/components/SearchInterface';
import TopicChips from '@/components/TopicChips';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import SimulationFrame from '@/components/SimulationFrame';
import type { ApiErrorBody, GenerateResponseBody } from '@/lib/types';

type Phase = 'idle' | 'loading' | 'ready' | 'error';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [topic, setTopic] = useState('');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const generate = useCallback(async (nextTopic: string) => {
    setTopic(nextTopic);
    setPhase('loading');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: nextTopic }),
      });
      const data: GenerateResponseBody | ApiErrorBody = await res.json();
      if (!res.ok || !('html' in data)) {
        setErrorMessage(('error' in data && data.error) || 'Something went wrong. Please try again.');
        setPhase('error');
        return;
      }
      setCode(data.html);
      setResetKey((k) => k + 1);
      setPhase('ready');
    } catch {
      setErrorMessage('Could not reach the server. Check your connection and try again.');
      setPhase('error');
    }
  }, []);

  const handleExhausted = useCallback((lastError: string) => {
    setErrorMessage(
      `This simulation kept running into the same problem (${lastError}) even after a few automatic repair attempts.`,
    );
    setPhase('error');
  }, []);

  function reset() {
    setPhase('idle');
    setTopic('');
    setCode('');
    setErrorMessage('');
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-16 sm:px-10">
      <header className="mb-12 flex items-center justify-between">
        <button onClick={reset} className="font-display text-lg text-ink transition-opacity hover:opacity-70">
          STEM<span className="text-accent">ly</span>
        </button>
        {phase === 'ready' && (
          <div className="flex items-center gap-4 font-body text-sm">
            <button onClick={() => generate(topic)} className="link-reveal text-ink-soft transition-colors hover:text-ink">
              Regenerate
            </button>
            <button onClick={reset} className="link-reveal text-ink-soft transition-colors hover:text-ink">
              New topic
            </button>
          </div>
        )}
      </header>

      {phase === 'idle' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-10 pb-24 text-center animate-fade-up">
          <div className="space-y-4">
            <h1 className="font-display text-4xl italic text-ink sm:text-5xl">See any STEM concept, live.</h1>
            <p className="mx-auto max-w-measure font-body text-base text-ink-soft">
              Type a topic from physics, chemistry, biology, math, or statistics — STEMly builds an
              interactive simulation of it, with live controls, right on the spot.
            </p>
          </div>
          <div className="w-full max-w-xl space-y-6">
            <SearchInterface onSubmit={generate} />
            <TopicChips onSelect={generate} />
          </div>
        </div>
      )}

      {phase === 'loading' && <LoadingState topic={topic} />}

      {phase === 'ready' && (
        <div className="flex-1">
          <div className="mb-4">
            <p className="font-display text-2xl italic text-ink">{topic}</p>
          </div>
          <SimulationFrame topic={topic} initialCode={code} resetKey={resetKey} onExhausted={handleExhausted} />
        </div>
      )}

      {phase === 'error' && (
        <div className="flex flex-1 items-center justify-center">
          <ErrorState message={errorMessage} onRetry={() => generate(topic)} onNewTopic={reset} />
        </div>
      )}

      <footer className="mt-16 text-center font-body text-xs text-ink-faint">
        Every simulation is generated on the spot — give it a moment.
      </footer>
    </main>
  );
}
