'use client';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  id?: string;
}

export default function SectionHeader({ title, subtitle, icon, id }: SectionHeaderProps) {
  return (
    <div id={id} className="flex flex-col items-center text-center mb-12 scroll-mt-24">
      {icon && (
        <div className="mb-4 p-3 bg-surface rounded-full text-primary shadow-(--ibean-shadow-warm-sm)">
          {icon}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-text mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-textSecondary max-w-2xl">
          {subtitle}
        </p>
      )}
      <div className="w-16 h-1 bg-primary mt-6 rounded-full" />
    </div>
  );
}
