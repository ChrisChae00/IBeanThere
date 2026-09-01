'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import RegisterCafeForm from '@/components/cafe/RegisterCafeForm';
import { LoadingSpinner } from '@/shared/ui';
import { UserLocationIcon } from '@/shared/ui';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface-page">
      <LoadingSpinner size="lg" />
    </div>
  ),
});

export default function RegisterCafePage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const t = useTranslations('cafe.register');
  const tMap = useTranslations('map');
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { coords, getCurrentLocation, isLoading: locationLoading, error: locationError } = useLocation();
  
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  
  useEffect(() => {
    if (!authLoading && !user) {
      showToast(t('location_permission_required'), 'warning');
      router.push(`/${locale}/signin`);
    }
  }, [user, authLoading, locale, router, showToast, t]);
  
  useEffect(() => {
    if (coords) {
      setMapCenter({ lat: coords.latitude, lng: coords.longitude });
    } else if (!locationLoading && !locationError) {
      getCurrentLocation().catch(() => {
        // Location request failed, will show default or error state
      });
    }
  }, [coords, locationLoading, locationError, getCurrentLocation]);
  
  const handleMapClick = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
  };
  
  const handleReturnToCurrentLocation = () => {
    if (coords) {
      setMapCenter({ lat: coords.latitude, lng: coords.longitude });
      setSelectedLocation(null);
    }
  };
  
  const handleRegistrationSuccess = () => {
    showToast(t('success'), 'success');
    if (typeof window !== 'undefined') {
      localStorage.setItem('cafe_cache_needs_refresh', 'true');
    }
    router.push(`/${locale}/discover/explore-map`);
  };
  
  const handleCancel = () => {
    router.push(`/${locale}/discover/pending-spots`);
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-surface-page">
      {/* Page Title Section */}
      <section className="pt-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
            <h1 className="landing-display mb-2 text-[clamp(2.5rem,6vw,4.5rem)] text-ink-primary">
              {t('title')}
            </h1>
        </div>
      </section>
      
      {/* Main Content: Map on Left, Form on Right */}
      <section className="py-6">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Interactive Map */}
            <div className="flex flex-col rounded-(--radius-card) border border-edge-rule bg-surface-raised">
              <div className="p-6">
                <h2 className="mb-2 px-2 text-2xl text-ink-primary">
                  {tMap('map_title')}
                </h2>
                <div className="px-2 flex items-center justify-between gap-4">
                  <p className="text-ink-secondary">
                    {t('select_on_map_hint')}
                  </p>
                  <button
                    onClick={handleReturnToCurrentLocation}
                    className="flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
                    title={tMap('location_button')}
                    disabled={!coords}
                  >
                    <UserLocationIcon size={32} color="var(--marker-user)" />
                  </button>
                </div>
              </div>
              <div className="relative min-h-0 flex-1 p-6 pt-0">
                {mapCenter ? (
                  <InteractiveMap
                    cafes={[]}
                    center={mapCenter}
                    zoom={18}
                    userLocation={coords ? { lat: coords.latitude, lng: coords.longitude } : undefined}
                    selectedLocation={selectedLocation || undefined}
                    onMapClick={handleMapClick}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-surface-page">
                    <div className="text-center">
                      <LoadingSpinner size="lg" />
                      <p className="mt-4 text-ink-secondary">
                        {locationLoading ? tMap('loading_location') : tMap('location_permission_title')}
                      </p>
                      {!locationLoading && !locationError && (
                        <button
                          onClick={() => getCurrentLocation().catch(() => {})}
                          className="relief-control mt-4 min-h-11 rounded-(--btn-radius) bg-brand px-5 font-semibold text-ink-on-brand"
                        >
                          {tMap('share_location')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right: Registration Form */}
            <div className="rounded-(--radius-card) border border-edge-rule bg-surface-raised p-6">
              <RegisterCafeForm
                initialLocation={selectedLocation || undefined}
                userLocation={coords ? { lat: coords.latitude, lng: coords.longitude } : undefined}
                onSuccess={handleRegistrationSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

