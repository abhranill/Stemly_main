'use client';

const EXAMPLE_TOPICS = [
  'Wave interference',
  'Projectile motion',
  'Bayesian inference',
  'Ionization energy',
  'Enzyme kinetics',
  'RC circuit charging',
];

interface TopicChipsProps {
  onSelect: (topic: string) => void;
}

export default function TopicChips({ onSelect }: TopicChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {EXAMPLE_TOPICS.map((topic, i) => (
        <button
          key={topic}
          onClick={() => onSelect(topic)}
          style={{ animationDelay: `${i * 60}ms` }}
          className="animate-fade-up rounded-full border border-hairline bg-surface px-4 py-1.5 font-body text-sm text-ink-soft opacity-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-sm"
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
