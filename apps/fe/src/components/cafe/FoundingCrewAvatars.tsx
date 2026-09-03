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
  /*
    `stack` is the form the crew takes over a photograph: overlapping avatars, no
    heading, no role captions -- the names are in the tooltips. Reading order runs
    left to right, so the leftmost avatar overlaps the one after it rather than
    being buried under it, which is the opposite of what a default stack does.
  */
  variant?: 'row' | 'stack';
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

export default function FoundingCrewAvatars({ navigator, scouts, variant = 'row' }: FoundingCrewAvatarsProps) {
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

  if (variant === 'stack') {
    return (
      <div className="flex -space-x-2.5">
        {members.map((member, index) => {
          const name = member.display_name || member.username || tCommon('unknown');
          return (
            <div
              key={member.user_id}
              /* Descending, so the first avatar sits on top of the second. */
              style={{ zIndex: members.length - index }}
              className="relative"
            >
              <Tooltip content={`${name} · ${getRoleLabel(member.role)}`} position="bottom">
                <Avatar
                  src={member.avatar_url}
                  alt={name}
                  size="sm"
                  /* The ring is what separates one avatar from the one it overlaps
                     and from the photograph underneath, so it is the media ink
                     rather than a surface colour. */
                  className="ring-2 ring-ink-on-media/80 transition-transform duration-200 hover:-translate-y-0.5"
                />
              </Tooltip>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <h3 className="text-base font-semibold text-cardTextSecondary leading-none translate-y-px">
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
                  className={isNavigator ? 'ring-2 ring-primary' : undefined}
                />
              </Tooltip>
              <span className="text-[10px] font-medium leading-none text-text">
                {roleLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
