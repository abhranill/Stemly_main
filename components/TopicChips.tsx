'use client';

import {
  Atom,
  BarChart3,
  Dna,
  FlaskConical,
  FunctionSquare,
  Waves,
} from 'lucide-react';

const TOPICS = [
  {
    name: 'Wave interference',
    label: 'Physics',
    icon: Waves,
  },
  {
    name: 'Projectile motion',
    label: 'Physics',
    icon: Atom,
  },
  {
    name: 'Bayesian inference',
    label: 'Statistics',
    icon: BarChart3,
  },
  {
    name: 'Ionization energy',
    label: 'Chemistry',
    icon: FlaskConical,
  },
  {
    name: 'Enzyme kinetics',
    label: 'Biology',
    icon: Dna,
  },
  {
    name: 'RC circuit charging',
    label: 'Engineering',
    icon: FunctionSquare,
  },
];

interface TopicChipsProps {
  onSelect: (topic: string) => void;
}

export default function TopicChips({
  onSelect,
}: TopicChipsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TOPICS.map((topic) => {
        const Icon = topic.icon;

        return (
          <button
            key={topic.name}
            onClick={() => onSelect(topic.name)}
            className="topic-card group rounded-2xl border border-slate-200 bg-white p-4 text-left"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={18} strokeWidth={1.8} />
              </div>

              <span className="text-xs text-slate-400 transition-colors group-hover:text-blue-500">
                Explore →
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-900">
              {topic.name}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {topic.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}