'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { UserPublicResponse, Collection } from '@/types/api';
import { Button, LoadingSpinner, HeartIcon, BookmarkIcon } from '@/shared/ui';
import { UserPlus, Check, ArrowLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { ReportButton, ReportModal, useReportModal } from '@/features/report';
import { getUserPublicCollections } from '@/lib/api/collections';
import { getPublicProfile, getTasteMates, setTrust } from '@/lib/api/users';
import ProfileHeader from './ProfileHeader';
import CollectionDetailModal from './CollectionDetailModal';

interface PublicProfileClientProps {
  username: string;
}

export default function PublicProfileClient({ username }: PublicProfileClientProps) {
  const t = useTranslations('profile');
  const tCommunity = useTranslations('community');
  const tReport = useTranslations('report');
  const tCollections = useTranslations('collections');
  const tErrors = useTranslations('errors');
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { modalState, openUserReport, closeModal } = useReportModal();

  const [profile, setProfile] = useState<UserPublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrusted, setIsTrusted] = useState(false);
  const [trustLoading, setTrustLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setProfile(await getPublicProfile(username));
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const checkTrustStatus = useCallback(async () => {
    if (!currentUser) return;

    try {
      const mates = await getTasteMates();
      setIsTrusted(mates.some((m) => m.username === username));
    } catch (error) {
      console.error('Error checking trust status:', error);
    }
  }, [currentUser, username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile && currentUser) {
      checkTrustStatus();
    }
  }, [profile, currentUser, checkTrustStatus]);

  useEffect(() => {
    if (!profile || !profile.collections_public) return;

    const fetchCollections = async () => {
      try {
        setCollections(await getUserPublicCollections(username));
      } catch {
        // Silently fail
      }
    };

    fetchCollections();
  }, [profile, username]);

  const handleTrust = async () => {
    if (!currentUser) {
      router.push('/signin');
      return;
    }

    setTrustLoading(true);
    try {
      await setTrust(username, !isTrusted);
      setIsTrusted(!isTrusted);
      setProfile((prev) =>
        prev ? { ...prev, trust_count: (prev.trust_count || 0) + (isTrusted ? -1 : 1) } : null,
      );
    } catch (error) {
      /*
        A toast, not `alert()`: a browser dialog blocks the page until it is dismissed,
        and the message it carried was an untranslated English string straight out of
        the API response.
      */
      console.error('Trust action failed:', error);
      showToast(tErrors('unknown'), 'error');
    } finally {
      setTrustLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-bold text-ink-primary">
          {tCommunity('no_users_found')}
        </h2>
        <Button onClick={() => router.back()} variant="outline">
          {t('go_back')}
        </Button>
      </div>
    );
  }

  const isMe = currentUser?.user_metadata?.username === username;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-sm text-ink-secondary transition-colors hover:text-ink-primary"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        {t('back')}
      </button>

      <ProfileHeader
        avatarUrl={profile.avatar_url}
        displayName={profile.display_name}
        username={profile.username}
        bio={profile.bio}
        tasteTags={profile.taste_tags}
        navigatorCount={profile.founding_stats?.navigator_count || 0}
        regularCount={profile.founding_stats?.regular_count || 0}
        trustCount={profile.trust_count ?? 0}
        createdAt={profile.created_at}
        actions={
          !isMe && (
            <div className="flex items-center gap-2">
              <ReportButton
                onClick={() => openUserReport(profile.username, username)}
                size="md"
                label={tReport('report_user')}
              />
              {/*
                Trusting is this page's one primary action, so it takes the fill and
                gives it up once it is done -- the state is the fill, not a green wash
                out of the raw Tailwind palette, which did not move with the theme.
              */}
              <Button
                variant={isTrusted ? 'outline' : 'primary'}
                size="md"
                onClick={handleTrust}
                loading={trustLoading}
                leftIcon={isTrusted ? <Check size={18} /> : <UserPlus size={18} />}
              >
                {isTrusted ? tCommunity('following') : tCommunity('follow')}
              </Button>
            </div>
          )
        }
      />

      {profile.collections_public && collections.length > 0 && (
        <div className="rounded-(--radius-card) border border-edge-rule bg-surface-raised p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink-primary">
            {t('public_collections')}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...collections]
              .sort((a, b) => {
                if (a.icon_type === 'favourite') return -1;
                if (b.icon_type === 'favourite') return 1;
                if (a.icon_type === 'save_later') return -1;
                if (b.icon_type === 'save_later') return 1;
                return a.position - b.position;
              })
              .map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection)}
                  className="menu-item group flex items-center gap-3 px-3 py-3 text-left"
                >
                  <span className="shrink-0">
                    {collection.icon_type === 'favourite' ? (
                      <HeartIcon filled size={20} className="text-collection-favourite" />
                    ) : collection.icon_type === 'save_later' ? (
                      <BookmarkIcon filled size={20} className="text-collection-saved" />
                    ) : (
                      <span className="block h-5 w-5 rounded-(--radius-pill) bg-brand" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink-primary">
                      {collection.icon_type === 'favourite'
                        ? tCollections('favourite')
                        : collection.icon_type === 'save_later'
                          ? tCollections('save_later')
                          : collection.name}
                    </span>
                    <span className="text-sm text-ink-secondary">
                      {tCollections('cafes', { count: collection.item_count || 0 })}
                    </span>
                  </span>
                  <ChevronRight className="menu-mark h-4 w-4 shrink-0" />
                </button>
              ))}
          </div>
        </div>
      )}

      {/*
        The report modal itself, which was imported and never rendered: pressing Report
        opened the hook's state and nothing on screen.
      */}
      <ReportModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        targetType={modalState.targetType}
        targetId={modalState.targetId}
        targetUrl={modalState.targetUrl}
      />

      {selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          isOpen={!!selectedCollection}
          onClose={() => setSelectedCollection(null)}
          isOwnProfile={false}
        />
      )}
    </div>
  );
}
