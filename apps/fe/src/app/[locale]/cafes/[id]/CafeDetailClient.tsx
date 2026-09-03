'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Images, Plus } from 'lucide-react';
import { CafeDetailResponse } from '@/types/api';
import { GalleryImage } from '@/types/gallery';
import CafeInfoSection from '@/components/cafe/CafeInfoSection';
import FoundingCrewAvatars from '@/components/cafe/FoundingCrewAvatars';
import CafePhotoHero from '@/components/cafe/CafePhotoHero';
import CafeActionsMenu from '@/components/cafe/CafeActionsMenu';
import CoffeeLogFeed from '@/components/cafe/CoffeeLogFeed';
import DropBeanButton from '@/components/cafe/DropBeanButton';
import SaveButtons from '@/components/cafe/SaveButtons';
import CollectionSelectorModal from '@/components/cafe/CollectionSelectorModal';
import { useAuth } from '@/hooks/useAuth';
import { ReportModal, useReportModal } from '@/features/report';

const ImageGalleryModal = dynamic(() => import('@/shared/ui/ImageGalleryModal'), { ssr: false });

interface CafeDetailClientProps {
  cafe: CafeDetailResponse;
}

/*
  The page opens on the photograph. Everything that used to compete with it — a
  strip of six thumbnails in its own titled section, a "View All" link, a stats
  card of three numbers — either folded into the cards below or became one door:
  the photograph itself opens the collection, and so does the count beside the
  cafe's details.
*/
export default function CafeDetailClient({ cafe }: CafeDetailClientProps) {
  const t = useTranslations('cafe.detail');
  const tReport = useTranslations('report');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const { modalState, openCafeReport, closeModal } = useReportModal();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  /* Closing the picker is the moment the save buttons can be wrong, so it is the
     moment they re-read what is actually saved. */
  const [saveSync, setSaveSync] = useState(0);

  /* The API calls them `vanguard`; everything drawn from them calls them scouts. */
  const foundingCrew = cafe.founding_crew;
  const scouts = (foundingCrew?.vanguard || []).map((v) => ({
    ...v,
    role: (v.role === 'vanguard_2nd' ? 'scout_1' : 'scout_2') as 'scout_1' | 'scout_2',
  }));

  const galleryImages: GalleryImage[] = (cafe.images || [])
    .filter((url) => url && typeof url === 'string' && url.trim().length > 0)
    .map((url, index) => ({
      url,
      alt: `${cafe.name} photo ${index + 1}`,
      source: 'log' as const
    }));

  const requireAuth = (then: () => void) => (e?: React.MouseEvent) => {
    if (user) {
      then();
      return;
    }
    e?.preventDefault();
    router.push(`/${locale}/signin`);
  };

  const cafePath = cafe.slug || cafe.id;
  const logPagePath = `/${locale}/cafes/${cafePath}/log`;
  const hasStats =
    cafe.average_rating !== undefined ||
    (cafe.total_beans_dropped ?? 0) > 0 ||
    (cafe.log_count ?? 0) > 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/*
        The photograph and the cafe's details are one card, not two: they are the same
        subject, and a gap between them read as the photograph belonging to the page
        rather than to this cafe. The image is flush to the card's edges, so the card's
        own radius is what rounds it.
      */}
      <section className="mb-8 overflow-hidden rounded-(--radius-card) border border-edge-rule bg-surface-raised">
        <CafePhotoHero
          images={galleryImages}
          cafeName={cafe.name}
          onOpen={() => setGalleryOpen(true)}
          /*
            The overflow lives on the photograph's far corner, away from the crew and
            away from the actions the reader came for.
          */
          cornerAction={
            <CafeActionsMenu
              label={t('more_actions')}
              onMedia
              items={[
                {
                  key: 'report',
                  label: tReport('report_issue'),
                  onClick: requireAuth(() => openCafeReport(cafe.id, cafe.name)),
                },
              ]}
            />
          }
          overlay={
            foundingCrew && (foundingCrew.navigator || scouts.length > 0) ? (
              <FoundingCrewAvatars
                variant="stack"
                navigator={foundingCrew.navigator}
                scouts={scouts}
              />
            ) : null
          }
        />

        <div className="p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            {/* A cafe's name is data, not the page's own voice: body face, like the cards. */}
            <h1 className="font-sans text-3xl font-bold wrap-break-word text-ink-primary">
              {cafe.name}
            </h1>
            <div className="flex shrink-0 flex-wrap items-center gap-1">
              <SaveButtons
                cafeId={cafe.id}
                syncToken={saveSync}
                onOpenCollectionSelector={() => setCollectionModalOpen(true)}
              />
              <DropBeanButton
                cafeId={cafe.id}
                cafeLat={cafe.latitude}
                cafeLng={cafe.longitude}
                size="sm"
                showGrowthInfo={true}
              />
            </div>
          </div>

          {/* Every rule on this page is drawn in the brand: these separate the card's
              own sections rather than dividing fields inside one, and the brand is what
              says the section belongs to this app rather than to the record. */}
          <div className="mt-2 mb-4 h-px bg-brand" />

          <CafeInfoSection cafe={cafe} showFoundingCrew={false} />

          {galleryImages.length > 0 && (
            /*
              The second door into the collection, for a reader who has scrolled
              past the photograph and is reading the details.
            */
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="control-flat mt-6 inline-flex min-h-11 items-center gap-2 rounded-(--btn-radius) px-5 text-sm font-medium"
            >
              <Images className="size-4" aria-hidden />
              {t('photos')} {galleryImages.length}
            </button>
          )}

          {hasStats && (
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-brand pt-6">
              <div>
                <p className="landing-micro text-ink-secondary">{t('average_rating')}</p>
                <p className="mt-1 text-2xl font-bold text-ink-primary">
                  {cafe.average_rating ? `${cafe.average_rating.toFixed(1)}/5` : '-'}
                </p>
              </div>
              <div>
                <p className="landing-micro text-ink-secondary">{t('total_logs')}</p>
                <p className="mt-1 text-2xl font-bold text-ink-primary">{cafe.log_count}</p>
              </div>
              <div>
                <p className="landing-micro text-ink-secondary">{t('beans_dropped')}</p>
                <p className="mt-1 text-2xl font-bold text-ink-primary">
                  {cafe.total_beans_dropped || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8 rounded-(--radius-card) border border-edge-rule bg-surface-raised">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-ink-primary">{t('coffee_logs')}</h2>
            {user ? (
              <Link
                href={logPagePath}
                className="btn-line relative inline-flex items-center gap-1.5 rounded-(--radius-control) px-3 py-1.5 text-xs font-medium text-ink-primary before:absolute before:inset-x-0 before:-inset-y-[7px] before:content-['']"
                aria-label={t('write_log')}
              >
                <Plus className="size-4" aria-hidden />
                {t('write_log')}
              </Link>
            ) : (
              <button
                onClick={requireAuth(() => router.push(logPagePath))}
                className="btn-line relative inline-flex items-center gap-1.5 rounded-(--radius-control) px-3 py-1.5 text-xs font-medium text-ink-primary before:absolute before:inset-x-0 before:-inset-y-[7px] before:content-['']"
                aria-label={t('write_log')}
              >
                <Plus className="size-4" aria-hidden />
                {t('write_log')}
              </button>
            )}
          </div>
          {/* Ruled in the ink, not the hairline: this line closes the card's header
              rather than dividing two fields inside it. */}
          <div className="mb-4 h-px bg-brand" />
          <CoffeeLogFeed cafeId={cafe.id} initialLogs={cafe.recent_logs || []} />
        </div>
      </section>

      <ReportModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        targetType={modalState.targetType}
        targetId={modalState.targetId}
        targetUrl={modalState.targetUrl}
      />

      <ImageGalleryModal
        images={galleryImages}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={cafe.name}
      />

      {/*
        Opened by the save press itself, so the cafe is already filed under "Saved for
        later" by the time the list appears: choosing a list moves it rather than
        adding a second copy.
      */}
      <CollectionSelectorModal
        isOpen={collectionModalOpen}
        onClose={() => {
          setCollectionModalOpen(false);
          setSaveSync((n) => n + 1);
        }}
        moveOutOfSaveLater
        cafeId={cafe.id}
        cafeName={cafe.name}
      />
    </div>
  );
}
