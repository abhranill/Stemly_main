'use client';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onNewTopic: () => void;
}

export default function ErrorState({ message, onRetry, onNewTopic }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-hairline bg-surface px-8 py-16 text-center animate-fade-in">
      <p className="font-display text-xl text-ink">That one didn&rsquo;t come together</p>
      <p className="max-w-measure font-body text-sm text-ink-soft">{message}</p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={onRetry}
          className="rounded-lg bg-ink px-4 py-2 font-body text-sm font-medium text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent"
        >
          Try again
        </button>
        <button
          onClick={onNewTopic}
          className="link-reveal rounded-lg px-4 py-2 font-body text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Pick a new topic
        </button>
      </div>
    </div>
  );
}
