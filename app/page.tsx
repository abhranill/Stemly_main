'use client';

import { useCallback, useState } from 'react';

import {
  Atom,
  BookOpen,
  BrainCircuit,
  FlaskConical,
  Menu,
  Play,
  Sparkles,
  X,
} from 'lucide-react';

import SearchInterface from '@/components/SearchInterface';
import TopicChips from '@/components/TopicChips';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import SimulationFrame from '@/components/SimulationFrame';

import type {
  ApiErrorBody,
  GenerateResponseBody,
} from '@/lib/types';

type Phase = 'idle' | 'loading' | 'ready' | 'error';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [topic, setTopic] = useState('');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  const generate = useCallback(async (nextTopic: string) => {
    setTopic(nextTopic);
    setPhase('loading');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: nextTopic,
        }),
      });

      const data: GenerateResponseBody | ApiErrorBody =
        await res.json();

      if (!res.ok || !('html' in data)) {
        setErrorMessage(
          ('error' in data && data.error) ||
            'Something went wrong. Please try again.'
        );

        setPhase('error');
        return;
      }

      setCode(data.html);
      setResetKey((key) => key + 1);
      setPhase('ready');
    } catch {
      setErrorMessage(
        'Could not reach the server. Check your connection and try again.'
      );

      setPhase('error');
    }
  }, []);

  const handleExhausted = useCallback(
    (lastError: string) => {
      setErrorMessage(
        `The simulation could not be repaired automatically. ${lastError}`
      );

      setPhase('error');
    },
    []
  );

  function reset() {
    setPhase('idle');
    setTopic('');
    setCode('');
    setErrorMessage('');
    setMobileMenu(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f8fc]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 stem-grid opacity-70" />

      <div className="hero-glow left-1/2 top-[-220px] -translate-x-1/2" />

      {/* Navigation */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <button
          onClick={reset}
          className="group flex items-center gap-2"
          aria-label="Go to STEMly home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-transform group-hover:rotate-3">
            <Atom size={19} strokeWidth={1.8} />
          </span>

          <span className="text-lg font-bold tracking-tight text-slate-950">
            STEM<span className="text-blue-600">ly</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#explore"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
          >
            Explore
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
          >
            How it works
          </a>

          <a
            href="#topics"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
          >
            Topics
          </a>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            GitHub
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenu((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? (
            <X size={19} />
          ) : (
            <Menu size={19} />
          )}
        </button>
      </header>

      {/* Mobile Navigation */}
      {mobileMenu && (
        <div className="relative z-30 mx-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:hidden">
          <div className="flex flex-col gap-1">
            <a
              href="#explore"
              onClick={() => setMobileMenu(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMobileMenu(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How it works
            </a>

            <a
              href="#topics"
              onClick={() => setMobileMenu(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Topics
            </a>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* =====================================================
            LANDING PAGE
        ====================================================== */}
        {phase === 'idle' && (
          <>
            {/* Hero */}
            <section
              id="explore"
              className="flex min-h-[calc(100vh-82px)] flex-col items-center justify-center pb-24 pt-14 text-center sm:pt-20"
            >
              {/* Badge */}
              <div className="animate-fade-up">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-blue-600" />

                  AI-powered interactive learning
                </div>

                {/* Main heading */}
                <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
                  Learn STEM by{' '}
                  <span className="gradient-text">
                    experimenting.
                  </span>
                </h1>

                {/* Description */}
                <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                  Turn any physics, chemistry, mathematics,
                  biology or statistics concept into an interactive
                  visual simulation you can actually explore.
                </p>
              </div>

              {/* Search */}
              <div className="mt-10 w-full max-w-2xl animate-fade-up [animation-delay:120ms]">
                <SearchInterface
                  onSubmit={generate}
                  autoFocus
                />
              </div>

              {/* Feature indicators */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} />
                  AI generated
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-300" />

                <span className="flex items-center gap-1.5">
                  <Play size={13} />
                  Live simulations
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-300" />

                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} />
                  Learn by doing
                </span>
              </div>

              {/* Popular topics */}
              <div
                id="topics"
                className="mt-20 w-full max-w-5xl text-left"
              >
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                      Start exploring
                    </p>

                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                      Popular concepts
                    </h2>
                  </div>

                  <span className="hidden text-xs text-slate-400 sm:block">
                    Pick one to generate a simulation
                  </span>
                </div>

                <TopicChips onSelect={generate} />
              </div>
            </section>

            {/* How it works */}
            <section
              id="how-it-works"
              className="border-t border-slate-200 py-24"
            >
              <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                {/* Section introduction */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    How it works
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    From question to
                    <br />
                    interactive experiment.
                  </h2>

                  <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                    STEMly turns abstract concepts into visual,
                    adjustable experiences so you can understand
                    what changes when you change the variables.
                  </p>
                </div>

                {/* Steps */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      number: '01',
                      title: 'Ask',
                      text: 'Describe the STEM concept you want to understand.',
                      icon: BrainCircuit,
                    },
                    {
                      number: '02',
                      title: 'Explore',
                      text: 'Get a live simulation with controls you can manipulate.',
                      icon: Play,
                    },
                    {
                      number: '03',
                      title: 'Understand',
                      text: 'Experiment with variables and see cause and effect.',
                      icon: FlaskConical,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.number}
                        className="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg hover:shadow-slate-200/40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">
                            {item.number}
                          </span>

                          <Icon
                            size={19}
                            className="text-blue-600"
                            strokeWidth={1.7}
                          />
                        </div>

                        <h3 className="mt-12 text-base font-bold text-slate-950">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-8">
              <div className="flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  STEMly — making complex ideas easier to
                  experiment with.
                </p>

                <p>
                  Built for learning, exploration & curiosity.
                </p>
              </div>
            </footer>
          </>
        )}

        {/* =====================================================
            LOADING STATE
        ====================================================== */}
        {phase === 'loading' && (
          <div className="min-h-[calc(100vh-100px)]">
            <LoadingState topic={topic} />
          </div>
        )}

        {/* =====================================================
            SIMULATION
        ====================================================== */}
        {phase === 'ready' && (
          <section className="py-8 sm:py-12">
            {/* Simulation header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={reset}
                  className="mb-4 text-xs font-medium text-slate-400 transition hover:text-blue-600"
                >
                  ← Back to explore
                </button>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-500" />

                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Interactive simulation
                  </span>
                </div>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {topic}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => generate(topic)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
              >
                <Sparkles size={15} />
                Regenerate
              </button>
            </div>

            {/* Simulation */}
            <SimulationFrame
              topic={topic}
              initialCode={code}
              resetKey={resetKey}
              onExhausted={handleExhausted}
            />
          </section>
        )}

        {/* =====================================================
            ERROR STATE
        ====================================================== */}
        {phase === 'error' && (
          <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
            <div className="w-full max-w-xl">
              <ErrorState
                message={errorMessage}
                onRetry={() => generate(topic)}
                onNewTopic={reset}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}