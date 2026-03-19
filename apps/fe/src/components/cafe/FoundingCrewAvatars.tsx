'use client';

import { useTranslations } from 'next-intl';
import { Avatar, Tooltip } from '@/shared/ui';

interface FoundingCrewMember {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  role: 'navigator' | 'scout_1' | 'scout_2';
}

interface FoundingCrewAvatarsProps {
  navigator?: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  scouts?: Array<{
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    role: 'scout_1' | 'scout_2';
  }>;
}

export default function FoundingCrewAvatars({ navigator, scouts }: FoundingCrewAvatarsProps) {
  const t = useTranslations('cafe.modal');
  const tCommon = useTranslations('common');

  const members: FoundingCrewMember[] = [];

  if (navigator) {
    members.push({ ...navigator, role: 'navigator' });
  }

  if (scouts) {
    members.push(...scouts.map(v => ({ ...v, role: v.role })));
  }

  if (members.length === 0) return null;

  const getRoleLabel = (role: FoundingCrewMember['role']) => {
    switch (role) {
      case 'navigator':
        return t('navigator');
      case 'scout_1':
      case 'scout_2':
        return t('scout');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <h3 className="text-base font-semibold text-[var(--color-cardTextSecondary)] leading-none translate-y-[1px]">
        {t('founding_crew')}:
      </h3>

      <div className="flex items-center gap-1.5">
        {members.map((member) => {
          const name = member.display_name || member.username || tCommon('unknown');
          const isNavigator = member.role === 'navigator';
          const roleLabel = getRoleLabel(member.role);

          return (
            <div key={member.user_id} className="flex flex-col items-center gap-0.5">
              <Tooltip content={name} position="top">
                <Avatar
                  src={member.avatar_url}
                  alt={name}
                  size={'xs'}
                  className={isNavigator ? 'ring-2 ring-[var(--color-primary)]' : undefined}
                />
              </Tooltip>
              <span className="text-[10px] font-medium leading-none text-[var(--color-text)]">
                {roleLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
