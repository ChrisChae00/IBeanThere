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
        <div className="mb-4 p-3 bg-[var(--color-surface)] rounded-full text-[var(--color-primary)] shadow-[var(--ibean-shadow-soft)]">
          {icon}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-[var(--color-textSecondary)] max-w-2xl">
          {subtitle}
        </p>
      )}
      <div className="w-16 h-1 bg-[var(--color-primary)] mt-6 rounded-full" />
    </div>
  );
}
