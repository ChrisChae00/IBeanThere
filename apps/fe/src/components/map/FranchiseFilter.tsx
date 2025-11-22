'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FranchiseFilter } from '@/types/map';
import SearchIcon from '@/components/ui/SearchIcon';

interface FranchiseFilterProps {
  filter: FranchiseFilter;
  onFilterChange: (filter: FranchiseFilter) => void;
  totalCafes: number;
  localCafes: number;
  franchiseCafes: number;
}

export default function FranchiseFilterComponent({ 
  filter, 
  onFilterChange, 
  totalCafes,
  localCafes,
  franchiseCafes
}: FranchiseFilterProps) {
  const t = useTranslations('map');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleModeChange = (mode: 'all' | 'local' | 'preferred') => {
    onFilterChange({
      ...filter,
      filterMode: mode,
      showFranchises: mode === 'all'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-2 sm:px-3 py-1.5 rounded-full hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-1 sm:gap-1.5 text-xs font-medium h-auto min-h-[32px] sm:min-h-[36px] min-w-[60px] sm:min-w-[80px] flex-shrink-0"
      >
        <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-text)] flex-shrink-0" />
        <span>{t('filter_cafes')}</span>
        <span className="text-xs bg-[var(--color-primary)] text-white rounded-full px-1.5 sm:px-2 py-0.5">
          {filter.filterMode === 'all' ? totalCafes : filter.filterMode === 'local' ? localCafes : 0}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl p-4 min-w-[280px] z-50">
          <h3 className="font-semibold text-[var(--color-text)] mb-3">{t('filter_options')}</h3>

          <div className="space-y-3">
            <button
              onClick={() => handleModeChange('all')}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-colors
                ${filter.filterMode === 'all' 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)]'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{t('show_all')}</span>
                <span className="text-xs opacity-75">{totalCafes}</span>
              </div>
            </button>

            <button
              onClick={() => handleModeChange('local')}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-colors
                ${filter.filterMode === 'local' 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)]'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{t('local_only')}</span>
                <span className="text-xs opacity-75">{localCafes}</span>
              </div>
            </button>

            <button
              onClick={() => handleModeChange('preferred')}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-colors
                ${filter.filterMode === 'preferred' 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)]'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{t('preferred_only')}</span>
                <span className="text-xs opacity-75">{filter.preferredFranchises.length}</span>
              </div>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
            <p>{t('showing')} {filter.filterMode === 'all' ? totalCafes : filter.filterMode === 'local' ? localCafes : 0} {t('cafes')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

