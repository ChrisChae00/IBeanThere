'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter();
  const t = useTranslations('common');

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center text-sm text-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors ${className}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="mr-2"
      >
        <path d="m12 19-7-7 7-7"/>
        <path d="M19 12H5"/>
      </svg>
      {t('back')}
    </button>
  );
}
