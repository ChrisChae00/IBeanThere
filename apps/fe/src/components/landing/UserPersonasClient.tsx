'use client';

import { Map, BookOpen, Share2 } from 'lucide-react';

type UserPersonasClientProps = {
  messages: {
    navigator: { title: string; description: string };
    archivist: { title: string; description: string };
    curator: { title: string; description: string };
  };
};

export default function UserPersonasClient({ messages }: UserPersonasClientProps) {
  const personas = [
    {
      id: 'navigator',
      icon: <Map className="w-12 h-12 mb-4 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />,
      hoverBorder: 'hover:border-blue-500',
      ...messages.navigator
    },
    {
      id: 'archivist',
      icon: <BookOpen className="w-12 h-12 mb-4 text-amber-500 dark:text-amber-400" strokeWidth={1.5} />,
      hoverBorder: 'hover:border-amber-500',
      ...messages.archivist
    },
    {
      id: 'curator',
      icon: <Share2 className="w-12 h-12 mb-4 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />,
      hoverBorder: 'hover:border-orange-500',
      ...messages.curator
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {personas.map((persona) => (
        <div
          key={persona.id}
          className={`relative p-8 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:scale-105 hover:shadow-xl ${persona.hoverBorder}`}
        >
          <div className="flex flex-col items-center text-center">
            <div>
                {persona.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-[var(--color-text)]">
              {persona.title}
            </h3>
            <p className="text-[var(--color-textSecondary)] leading-relaxed">
              {persona.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
