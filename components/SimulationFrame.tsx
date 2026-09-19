'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildSandboxDocument } from '@/lib/sandbox';
import type { HealResponseBody, ApiErrorBody, SimError } from '@/lib/types';
import HealingToast from './HealingToast';

const MAX_HEAL_ATTEMPTS = 3;

interface SimulationFrameProps {
  topic: string;
  initialCode: string;
  /** Bumped by the parent to force a full remount (e.g. on regenerate). */
  resetKey: number;
  onExhausted: (lastError: string) => void;
}

export default function SimulationFrame({ topic, initialCode, resetKey, onExhausted }: SimulationFrameProps) {
  const [code, setCode] = useState(initialCode);
  const [healAttempts, setHealAttempts] = useState(0);
  const [isHealing, setIsHealing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const healAttemptsRef = useRef(0);
  const codeRef = useRef(initialCode);

  // Reset local state whenever the parent hands us a fresh generation.
  useEffect(() => {
    setCode(initialCode);
    codeRef.current = initialCode;
    setHealAttempts(0);
    healAttemptsRef.current = 0;
    setIsHealing(false);
  }, [resetKey, initialCode]);

  const heal = useCallback(
    async (error: SimError) => {
      if (healAttemptsRef.current >= MAX_HEAL_ATTEMPTS) {
        onExhausted(error.message);
        return;
      }
      setIsHealing(true);
      try {
        const res = await fetch('/api/heal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            code: codeRef.current,
            error,
            attempt: healAttemptsRef.current + 1,
          }),
        });
        const data: HealResponseBody | ApiErrorBody = await res.json();
        if (!res.ok || !('html' in data)) {
          onExhausted(('error' in data && data.error) || error.message);
          return;
        }
        healAttemptsRef.current += 1;
        setHealAttempts(healAttemptsRef.current);
        codeRef.current = data.html;
        setCode(data.html);
      } catch {
        onExhausted(error.message);
      } finally {
        setIsHealing(false);
      }
    },
    [topic, onExhausted],
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'stemly-sim') return;
      if (data.type === 'error' && data.payload) {
        void heal(data.payload as SimError);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [heal]);

  const sandboxDoc = buildSandboxDocument(code);

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface animate-fade-in">
      <iframe
        key={`${resetKey}-${healAttempts}`}
        ref={iframeRef}
        title={`STEMly simulation: ${topic}`}
        srcDoc={sandboxDoc}
        sandbox="allow-scripts"
        className="h-[70vh] min-h-[420px] w-full bg-paper"
      />
      {isHealing && <HealingToast />}
    </div>
  );
}
