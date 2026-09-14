'use client';

import { useTranslations } from 'next-intl';
import { Avatar, Tooltip } from '@/shared/ui';

/*
  Who put this cafe on the map.

  There used to be a second and third seat here, filled by whoever dropped a bean
  after the navigator. Three separate people still verify a cafe -- that has not
  changed -- but arriving second is not an achievement, and captioning it as one
  turned a shared map into a queue. One person now, so the stack variant is a stack
  of one; it is kept because the caller places it over a photograph and wants the
  ring and the caption-free form, not because there is anything to overlap.
*/
interface FoundingCrewMember {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface FoundingCrewAvatarsProps {
  variant?: 'row' | 'stack';
  navigator?: FoundingCrewMember;
}

export default function FoundingCrewAvatars({ navigator, variant = 'row' }: FoundingCrewAvatarsProps) {
  const t = useTranslations('cafe.modal');
  const tCommon = useTranslations('common');

  if (!navigator) return null;

  const name = navigator.display_name || navigator.username || tCommon('unknown');

  if (variant === 'stack') {
    return (
      <Tooltip content={`${name} · ${t('navigator')}`} position="bottom">
        <Avatar
          src={navigator.avatar_url}
          alt={name}
          size="sm"
          /* The ring is what separates the avatar from the photograph underneath,
             so it is the media ink rather than a surface colour. */
          className="ring-2 ring-ink-on-media/80 transition-transform duration-200 hover:-translate-y-0.5"
        />
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <h3 className="text-base font-semibold text-cardTextSecondary leading-none translate-y-px">
        {t('founding_crew')}:
      </h3>

      <div className="flex flex-col items-center gap-0.5">
        <Tooltip content={name} position="top">
          <Avatar src={navigator.avatar_url} alt={name} size="xs" className="ring-2 ring-primary" />
        </Tooltip>
        <span className="text-[10px] font-medium leading-none text-text">{t('navigator')}</span>
      </div>
    </div>
  );
}
