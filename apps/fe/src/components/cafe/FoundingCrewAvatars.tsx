'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/shared/ui';

interface FoundingCrewMember {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  role: 'navigator' | 'vanguard_2nd' | 'vanguard_3rd';
}

interface FoundingCrewAvatarsProps {
  navigator?: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  vanguard?: Array<{
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    role: 'vanguard_2nd' | 'vanguard_3rd';
  }>;
}

export default function FoundingCrewAvatars({ navigator, vanguard }: FoundingCrewAvatarsProps) {
  const t = useTranslations('cafe.modal');
  const tCommon = useTranslations('common');
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };

    if (activePopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activePopover]);

  const members: FoundingCrewMember[] = [];
  
  if (navigator) {
    members.push({ ...navigator, role: 'navigator' });
  }
  
  if (vanguard) {
    members.push(...vanguard.map(v => ({ ...v, role: v.role })));
  }

  if (members.length === 0) return null;

  const getRoleLabel = (role: FoundingCrewMember['role']) => {
    switch (role) {
      case 'navigator':
        return t('navigator');
      case 'vanguard_2nd':
        return '2nd';
      case 'vanguard_3rd':
        return '3rd';
    }
  };

  const getRoleDescription = (role: FoundingCrewMember['role']) => {
    switch (role) {
      case 'navigator':
        return t('first_discoverer');
      case 'vanguard_2nd':
      case 'vanguard_3rd':
        return t('vanguards');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <h3 className="text-base font-semibold text-[var(--color-cardTextSecondary)] leading-none translate-y-[1px]">
        {t('founding_crew')}:
      </h3>
      
      <div className="flex items-center -space-x-1" ref={popoverRef}>
        {members.map((member, index) => (
          <div key={member.user_id} className="relative">
            <button
              onClick={() => setActivePopover(activePopover === member.user_id ? null : member.user_id)}
              className="relative rounded-full transition-all hover:z-10 hover:scale-105 focus:outline-none flex items-center justify-center"
              style={{ zIndex: members.length - index }}
              aria-label={`${member.display_name || member.username || tCommon('unknown')} - ${getRoleLabel(member.role)}`}
            >
              <Avatar
                src={member.avatar_url}
                alt={member.display_name || member.username || tCommon('unknown')}
                size={member.role === 'navigator' ? 'xs' : 'xs'}
              />
            </button>

            {/* Popover */}
            {activePopover === member.user_id && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50 animate-in fade-in slide-in-from-bottom-1 duration-150"
              >
                <div className="bg-[var(--color-cardBackground)] border border-[var(--color-border)] rounded-md shadow-md px-2.5 py-1.5 min-w-[100px] text-center whitespace-nowrap">
                  {/* Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[var(--color-border)]" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-[1px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[var(--color-cardBackground)]" />
                  
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    member.role === 'navigator'
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                      : 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  }`}>
                    {getRoleLabel(member.role)}
                  </span>
                  <p className="text-xs font-medium text-[var(--color-cardText)] mt-0.5">
                    {member.display_name || member.username || tCommon('unknown')}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
