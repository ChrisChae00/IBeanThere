'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Avatar, LoadingSpinner } from '@/shared/ui';
import Modal from '@/shared/ui/Modal';
import { getTrustList, type TrustDirection } from '@/lib/api/users';
import type { UserPublicResponse } from '@/types/api';

/*
  Who is behind a count. Opened from either number in the profile header; which one is
  the only difference, so it is one component and not two.

  The list is fetched when the modal opens rather than with the profile: a reader who
  never taps the number never pays for it, and on a profile with hundreds of followers
  the list is much larger than the page that names it.
*/
export default function TrustListModal({
  username,
  direction,
  onClose,
}: {
  username: string;
  direction: TrustDirection | null;
  onClose: () => void;
}) {
  const t = useTranslations('profile');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [people, setPeople] = useState<UserPublicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!direction) return;

    let cancelled = false;
    setIsLoading(true);
    setError(false);

    getTrustList(username, direction)
      .then((list) => {
        if (!cancelled) setPeople(list);
      })
      .catch(() => {
        // A list that failed to load is not an empty list, and saying "nobody follows
        // this person" because a request timed out is a lie about somebody else.
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username, direction]);

  return (
    <Modal
      isOpen={direction !== null}
      onClose={onClose}
      title={direction === 'following' ? t('following') : t('followers')}
      size="sm"
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <p className="py-10 text-center text-ink-secondary">{t('trust_list_error')}</p>
      ) : people.length === 0 ? (
        <p className="py-10 text-center text-ink-secondary">{t('trust_list_empty')}</p>
      ) : (
        <ul>
          {people.map((person) => (
            <li key={person.username}>
              <Link
                href={`/${locale}/profile/${person.username}`}
                onClick={onClose}
                className="-mx-2 flex items-center gap-3 rounded-(--radius-control) border-b border-edge-rule px-2 py-3 last:border-0 hover:bg-surface-hover"
              >
                <Avatar src={person.avatar_url} alt={person.display_name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ink-primary">{person.display_name}</span>
                  <span className="block truncate text-sm text-ink-secondary">
                    @{person.username}
                  </span>
                </span>
                {(person.trust_count ?? 0) > 0 && (
                  <span className="landing-micro shrink-0 text-ink-secondary">
                    {t('followers_count', { count: person.trust_count ?? 0 })}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
