'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from '@base-ui/react/dialog';
import { Avatar, AchievementBadge, TasteTag } from '@/shared/ui';
import type { TasteTag as TasteTagType } from '@/types/api';

/*
  The one profile header. It was written twice -- once in `ProfileClient` for your own
  page and once in `PublicProfileClient` for someone else's -- and the two had already
  drifted: only the public one grew an action row, and a change to the identity block
  had to be made in both or in neither.

  What differs between the two pages is only what you can *do* on them, so that is the
  one thing the header takes as a slot. Everything above it -- who this is, what they
  have earned, what they like -- is the same panel on both.
*/

interface ProfileHeaderProps {
  avatarUrl?: string;
  displayName: string;
  username: string;
  bio?: string;
  /** Nullable, not just optional: the API sends `null` for a profile with no tags. */
  tasteTags?: TasteTagType[] | null;
  navigatorCount: number;
  regularCount: number;
  trustCount: number;
  createdAt: string;
  /** The page's own controls: edit on your profile, trust and report on someone else's. */
  actions?: ReactNode;
}

export default function ProfileHeader({
  avatarUrl,
  displayName,
  username,
  bio,
  tasteTags,
  navigatorCount,
  regularCount,
  trustCount,
  createdAt,
  actions,
}: ProfileHeaderProps) {
  const t = useTranslations('profile');
  const tags = tasteTags ?? [];

  return (
    <div className="rounded-(--radius-card) border border-edge-rule bg-surface-raised p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/*
          No ring and no shadow. Both were there to lift the avatar off the panel, and
          the panel is already framed -- one elevation step per region.
        */}
        <div className="shrink-0">
          <ZoomableAvatar src={avatarUrl} alt={displayName} />
        </div>

        <div className="w-full flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/*
                `font-sans`: a person's name is data of unknown length, not the page's
                own voice, and `h1` carries the display serif by default.
              */}
              <h1 className="font-sans text-2xl font-bold text-ink-primary md:text-3xl">
                {displayName}
              </h1>

              <div className="flex items-center gap-2">
                <AchievementBadge type="navigator" count={navigatorCount} size="sm" />
                <AchievementBadge type="regular" count={regularCount} size="sm" />
              </div>
            </div>

            {actions}
          </div>

          <p className="font-medium text-ink-secondary">@{username}</p>

          {bio && <p className="max-w-2xl leading-relaxed text-ink-secondary">{bio}</p>}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => (
                <TasteTag key={tag} tag={tag} size="sm" />
              ))}
            </div>
          )}

          {/*
            The meta row, as micro-labels rather than as a tinted pill and a hand-built
            sentence. The trust count used to be rendered by asking next-intl for
            "{count} people trust" and then cutting the number back out of the result
            with `.replace()`, so the number could be styled on its own -- which reads
            the translation as though it were English word order and breaks the moment a
            locale puts the count anywhere else. The whole string is printed now.
          */}
          <div className="landing-micro flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-ink-secondary">
            {trustCount > 0 && <span>{t('trust_count', { count: trustCount })}</span>}
            <span>
              {t('member_since', { date: new Date(createdAt).toISOString().split('T')[0] })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  Tap the picture and it grows out of the panel, tap again and it shrinks back -- the
  gesture everyone already knows from a profile photo on a phone.

  A dialog rather than an overlay of this file's own: the enlarged photograph covers the
  page, so it needs Escape, a focus trap and focus restore, and those come with the
  primitive. The growing and shrinking is Base UI's own starting and ending style, which
  means the shrink actually plays -- an element removed from the tree on close cannot
  animate on its way out.

  Only a photograph opens. The fallback silhouette is not a picture of anyone, so
  enlarging it shows nothing that was not already there.
*/
function ZoomableAvatar({ src, alt }: { src?: string; alt: string }) {
  const t = useTranslations('profile');
  const avatar = <Avatar src={src} alt={alt} size="inherit" className="h-24 w-24 md:h-28 md:w-28" />;

  if (!src) return avatar;

  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={
          <button
            type="button"
            aria-label={t('view_photo')}
            className="cursor-zoom-in rounded-(--radius-pill) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          />
        }
      >
        {avatar}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--z-nav-scrim) bg-(--scrim-media)/70 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        {/*
          The popup is the photograph itself and nothing else, so everything around it
          is backdrop -- which the dialog already closes on. Pressing the picture closes
          it too, the way it opened.
        */}
        <Dialog.Close
          nativeButton={false}
          render={
            <Dialog.Popup
              className="fixed top-1/2 left-1/2 z-(--z-nav-drawer) size-[min(78vw,60vh)] -translate-x-1/2 -translate-y-1/2 cursor-zoom-out outline-none transition-[opacity,scale] duration-200 data-[ending-style]:scale-75 data-[ending-style]:opacity-0 data-[starting-style]:scale-75 data-[starting-style]:opacity-0"
            />
          }
        >
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <Avatar src={src} alt={alt} size="inherit" className="h-full w-full" />
        </Dialog.Close>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
