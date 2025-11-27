'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import RegisterCafeForm from '@/components/cafe/RegisterCafeForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UserLocationIcon from '@/components/ui/UserLocationIcon';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[var(--color-background)]">
      <LoadingSpinner size="lg" />
    </div>
  ),
});

function getCSSVariable(name: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;
  }
  return fallback;
}

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
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Page Title Section */}
      <section className="pt-6  bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)]/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-2">
              {t('title')}
            </h1>
        </div>
      </section>
      
      {/* Main Content: Map on Left, Form on Right */}
      <section className="py-6">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Interactive Map */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-lg flex flex-col">
              <div className="p-6">
                <h2 className="px-2 text-2xl font-bold text-[var(--color-text)] mb-2">
                  {tMap('map_title')}
                </h2>
                <div className="px-2 flex items-center justify-between gap-4">
                  <p className="text-[var(--color-text-secondary)]">
                    {t('select_on_map_hint')}
                  </p>
                  <button
                    onClick={handleReturnToCurrentLocation}
                    className="flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                    title={tMap('location_button')}
                    disabled={!coords}
                  >
                    <UserLocationIcon 
                      size={32} 
                      color={getCSSVariable('--color-userMarkerMap') || getCSSVariable('--color-secondary') || '#8C5A3A'} 
                    />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative min-h-0 p-6 mt-[-30px]">
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
                  <div className="flex items-center justify-center h-full bg-[var(--color-background)]">
                    <div className="text-center">
                      <LoadingSpinner size="lg" />
                      <p className="mt-4 text-[var(--color-text-secondary)]">
                        {locationLoading ? tMap('loading_location') : tMap('location_permission_title')}
                      </p>
                      {!locationLoading && !locationError && (
                        <button
                          onClick={() => getCurrentLocation().catch(() => {})}
                          className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
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
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
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

