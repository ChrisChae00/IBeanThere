'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CafeDetailResponse } from '@/types/api';
import { GalleryImage } from '@/types/gallery';
import CafeInfoSection from '@/components/cafe/CafeInfoSection';
import CoffeeLogFeed from '@/components/cafe/CoffeeLogFeed';
import DropBeanButton from '@/components/cafe/DropBeanButton';
import { StarRating, ImageGalleryModal, ImageLightbox } from '@/shared/ui';
import { useAuth } from '@/hooks/useAuth';
import { ReportButton, ReportModal, useReportModal } from '@/features/report';


interface CafeDetailClientProps {
  cafe: CafeDetailResponse;
}

export default function CafeDetailClient({ cafe }: CafeDetailClientProps) {
  const t = useTranslations('cafe.detail');
  const tReport = useTranslations('report');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const { modalState, openCafeReport, closeModal } = useReportModal();
  
  // Gallery state
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Convert images to GalleryImage format
  const galleryImages: GalleryImage[] = (cafe.images || []).map((url, index) => ({
    url,
    alt: `${cafe.name} photo ${index + 1}`,
    source: 'log' as const
  }));

  const handleWriteLog = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push(`/${locale}/signin`);
      return;
    }
  };

  const handleReportClick = () => {
    if (!user) {
      router.push(`/${locale}/signin`);
      return;
    }
    openCafeReport(cafe.id, cafe.name);
  };

  const cafePath = cafe.slug || cafe.id;
  const logPagePath = `/${locale}/cafes/${cafePath}/log`;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Cafe Info Section Card */}
      <div className="mb-6 p-6 bg-[var(--color-cardBackground)] rounded-lg shadow-[var(--color-cardShadow)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-cardText)]">{cafe.name}</h1>
          <div className="flex items-center gap-2">
            <ReportButton
              onClick={handleReportClick}
              size="md"
              label={tReport('report_issue')}
            />
            <DropBeanButton
              cafeId={cafe.id}
              cafeLat={cafe.latitude}
              cafeLng={cafe.longitude}
              size="md"
              showGrowthInfo={true}
            />
          </div>
        </div>
        <div className="h-px bg-[var(--color-border)] mb-4"></div>
        <CafeInfoSection cafe={cafe} />
      </div>

      {/* Photos Section - Google Maps Style */}
      {galleryImages.length > 0 && (
        <div className="mb-6 p-4 bg-[var(--color-cardBackground)] rounded-lg shadow-[var(--color-cardShadow)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--color-cardText)]">
              {t('photos')}
            </h2>
            {galleryImages.length > 1 && (
              <button
                onClick={() => setGalleryModalOpen(true)}
                className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
              >
                {t('view_all')} ({galleryImages.length})
              </button>
            )}
          </div>
          {/* Compact horizontal scrollable gallery */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {galleryImages.slice(0, 6).map((image, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Show remaining count on last visible image */}
                {index === 5 && galleryImages.length > 6 && (
                  <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryModalOpen(true);
                    }}
                  >
                    <span className="text-white text-sm font-semibold">
                      +{galleryImages.length - 6}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Card */}
      {(cafe.average_rating !== undefined || (cafe.total_beans_dropped ?? 0) > 0 || (cafe.log_count ?? 0) > 0) && (
        <div className="mb-6 p-6 bg-[var(--color-cardBackground)] rounded-lg shadow-[var(--color-cardShadow)]">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-[var(--color-cardTextSecondary)]">{t('average_rating')}</p>
              <p className="text-2xl font-bold text-[var(--color-cardText)]">
                {cafe.average_rating ? `${cafe.average_rating.toFixed(1)}/5` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-cardTextSecondary)]">{t('total_logs')}</p>
              <p className="text-2xl font-bold text-[var(--color-cardText)]">{cafe.log_count}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-cardTextSecondary)]">{t('beans_dropped') || '심긴 콩'}</p>
              <p className="text-2xl font-bold text-[var(--color-primary)]">{cafe.total_beans_dropped || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Coffee Logs Feed Card */}
      <div className="mb-8 p-6 bg-[var(--color-cardBackground)] rounded-lg shadow-[var(--color-cardShadow)]">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[var(--color-cardText)]">{t('coffee_logs')}</h2>
            {user ? (
              <Link
                href={logPagePath}
                className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors text-sm font-medium flex items-center gap-1.5"
                aria-label={t('write_log')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('write_log')}
              </Link>
            ) : (
              <button
                onClick={handleWriteLog}
                className="bg-[var(--color-primary)] text-[var(--color-primaryText)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors text-sm font-medium flex items-center gap-1.5"
                aria-label={t('write_log')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('write_log')}
              </button>
            )}
          </div>
          <div className="h-px bg-[var(--color-border)]"></div>
        </div>
        <CoffeeLogFeed cafeId={cafe.id} initialLogs={cafe.recent_logs || []} />
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        targetType={modalState.targetType}
        targetId={modalState.targetId}
        targetUrl={modalState.targetUrl}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={galleryImages}
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        title={cafe.name}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}


