'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { registerCafe, searchLocationByPostcode, reverseGeocodeLocation } from '@/lib/api/cafes';
import { useLocation } from '@/hooks/useLocation';
import { validateInitialDistance } from '@/lib/utils/checkIn';
import { CafeRegistrationRequest } from '@/types/api';
import { ErrorAlert, LoadingSpinner } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

interface RegisterCafeFormProps {
  initialLocation?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

type LocationMode = 'current' | 'map' | 'postcode';

export default function RegisterCafeForm({
  initialLocation,
  userLocation: providedUserLocation,
  onSuccess,
  onCancel
}: RegisterCafeFormProps) {
  const t = useTranslations('cafe.register');
  const tErrors = useTranslations('errors');
  const { showToast } = useToast();
  
  const { coords, getCurrentLocation, isLoading: locationLoading } = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    postcode: '',
    source_url: ''
  });
  
  const [cafeLocation, setCafeLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [locationMode, setLocationMode] = useState<LocationMode>('current');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingPostcode, setIsSearchingPostcode] = useState(false);
  const [error, setError] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [isValidDistance, setIsValidDistance] = useState(false);
  const [addressFetched, setAddressFetched] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isDetectingCountry, setIsDetectingCountry] = useState(false);
  
  const userLocation = providedUserLocation || (coords ? { lat: coords.latitude, lng: coords.longitude } : null);
  
  // Country options
  const countries = [
    { code: 'ca', name: 'Canada' },
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'au', name: 'Australia' },
    { code: 'kr', name: 'South Korea' },
    { code: 'jp', name: 'Japan' },
    { code: 'de', name: 'Germany' },
    { code: 'fr', name: 'France' },
    { code: 'es', name: 'Spain' },
    { code: 'it', name: 'Italy' },
    { code: 'nl', name: 'Netherlands' },
    { code: 'be', name: 'Belgium' },
    { code: 'ch', name: 'Switzerland' },
    { code: 'at', name: 'Austria' },
    { code: 'se', name: 'Sweden' },
    { code: 'no', name: 'Norway' },
    { code: 'dk', name: 'Denmark' },
    { code: 'fi', name: 'Finland' },
    { code: 'pl', name: 'Poland' },
    { code: 'pt', name: 'Portugal' },
    { code: 'ie', name: 'Ireland' },
    { code: 'nz', name: 'New Zealand' },
    { code: 'sg', name: 'Singapore' },
    { code: 'my', name: 'Malaysia' },
    { code: 'th', name: 'Thailand' },
    { code: 'id', name: 'Indonesia' },
    { code: 'ph', name: 'Philippines' },
    { code: 'vn', name: 'Vietnam' },
    { code: 'tw', name: 'Taiwan' },
    { code: 'hk', name: 'Hong Kong' },
    { code: 'cn', name: 'China' },
    { code: 'in', name: 'India' },
    { code: 'br', name: 'Brazil' },
    { code: 'mx', name: 'Mexico' }
  ];
  
  // Detect country from user location on mount
  useEffect(() => {
    if (userLocation && !selectedCountry && !isDetectingCountry) {
      setIsDetectingCountry(true);
      reverseGeocodeLocation(userLocation.lat, userLocation.lng)
        .then((result) => {
          if (result?.country_code) {
            setSelectedCountry(result.country_code);
          }
          setIsDetectingCountry(false);
        })
        .catch(() => {
          setIsDetectingCountry(false);
        });
    }
  }, [userLocation, selectedCountry, isDetectingCountry]);
  
  useEffect(() => {
    if (locationMode === 'current' && coords && !cafeLocation) {
      setCafeLocation({ lat: coords.latitude, lng: coords.longitude });
    }
  }, [coords, locationMode, cafeLocation]);
  
  useEffect(() => {
    if (userLocation && cafeLocation) {
      const validation = validateInitialDistance(
        userLocation.lat,
        userLocation.lng,
        cafeLocation.lat,
        cafeLocation.lng,
        50
      );
      setDistance(validation.distance);
      setIsValidDistance(validation.valid);
    } else {
      setDistance(null);
      setIsValidDistance(false);
    }
  }, [userLocation, cafeLocation]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };
  
  const handleLocationModeChange = (mode: LocationMode) => {
    setLocationMode(mode);
    setError('');
    
    if (mode === 'current' && coords) {
      setCafeLocation({ lat: coords.latitude, lng: coords.longitude });
      setAddressFetched(false); // Reset to allow address auto-update
    }
  };
  
  const handlePostcodeSearch = async () => {
    if (!formData.postcode.trim()) {
      setError(t('postcode_required'));
      return;
    }
    
    setIsSearchingPostcode(true);
    setError('');
    
    try {
      const result = await searchLocationByPostcode(
        formData.postcode,
        userLocation || undefined,
        selectedCountry || undefined
      );
      
      if (result) {
        setCafeLocation({ lat: result.lat, lng: result.lng });
        if (!formData.address) {
          setFormData(prev => ({ ...prev, address: result.display_name }));
        }
        setLocationMode('postcode');
        showToast(t('postcode_search_success'), 'success');
      } else {
        setError(t('postcode_not_found'));
      }
    } catch (error) {
      console.error('Postcode search error:', error);
      setError(t('postcode_search_failed'));
    } finally {
      setIsSearchingPostcode(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!formData.name.trim()) {
      setError(t('name_required'));
      setIsLoading(false);
      return;
    }
    
    if (!cafeLocation) {
      setError(t('location_required'));
      setIsLoading(false);
      return;
    }
    
    if (!userLocation) {
      setError(t('location_permission_required'));
      setIsLoading(false);
      return;
    }
    
    if (!isValidDistance) {
      setError(t('distance_too_far'));
      setIsLoading(false);
      return;
    }
    
    try {
      const requestData: CafeRegistrationRequest = {
        name: formData.name,
        latitude: cafeLocation.lat,
        longitude: cafeLocation.lng,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        source_url: formData.source_url || undefined,
        user_location: userLocation,
        source_type: locationMode === 'current' ? 'manual' : locationMode === 'map' ? 'map_click' : 'postcode'
      };
      
      const response = await registerCafe(requestData);
      
      if (response.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        if (response.error === 'DUPLICATE_CAFE') {
          setError(t('duplicate_detected'));
        } else if (response.error === 'DISTANCE_TOO_FAR') {
          setError(t('distance_too_far'));
        } else if (response.error === 'NOT_AUTHENTICATED') {
          setError(tErrors('not_authenticated'));
        } else {
          setError(response.message || t('registration_failed'));
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error && error.message === 'NOT_AUTHENTICATED') {
        setError(tErrors('not_authenticated'));
      } else {
        setError(t('registration_failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCurrentLocationClick = () => {
    getCurrentLocation();
    handleLocationModeChange('current');
  };
  
  useEffect(() => {
    if (initialLocation) {
      setCafeLocation(initialLocation);
      setLocationMode('map');
      setAddressFetched(false);
      
      // Check distance first before auto-filling address
      if (userLocation) {
        const validation = validateInitialDistance(
          userLocation.lat,
          userLocation.lng,
          initialLocation.lat,
          initialLocation.lng,
          50
        );
        
        // Only auto-fill address if distance is valid (within 50m)
        if (validation.valid) {
          // Auto-fill address from coordinates
          reverseGeocodeLocation(initialLocation.lat, initialLocation.lng)
            .then((result) => {
              if (result && result.display_name) {
                setFormData(prev => ({ ...prev, address: result.display_name }));
                setAddressFetched(true);
              }
            })
            .catch((error) => {
              console.error('Error reverse geocoding:', error);
            });
        } else {
          // Distance is too far, don't update address
          setAddressFetched(true);
        }
      } else {
        // No user location, auto-fill address anyway
        reverseGeocodeLocation(initialLocation.lat, initialLocation.lng)
          .then((result) => {
            if (result && result.display_name) {
              setFormData(prev => ({ ...prev, address: result.display_name }));
              setAddressFetched(true);
            }
          })
          .catch((error) => {
            console.error('Error reverse geocoding:', error);
          });
      }
    }
  }, [initialLocation, userLocation]);
  
  useEffect(() => {
    if (locationMode === 'current' && coords && cafeLocation && !addressFetched) {
      // Auto-fill address when using current location
      reverseGeocodeLocation(cafeLocation.lat, cafeLocation.lng)
        .then((result) => {
          if (result && result.display_name) {
            setFormData(prev => ({ ...prev, address: result.display_name }));
            setAddressFetched(true);
          }
        })
        .catch((error) => {
          console.error('Error reverse geocoding:', error);
        });
    }
  }, [locationMode, coords, cafeLocation, addressFetched]);
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
          <ErrorAlert message={error} />
          
          {/* Location Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
              {t('location_select')}
            </label>
            
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={handleCurrentLocationClick}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors min-h-[44px] ${
                  locationMode === 'current'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                }`}
                disabled={locationLoading}
              >
                {locationLoading ? <LoadingSpinner size="sm" /> : t('use_current_location')}
              </button>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              {t('select_on_map_hint')}
            </p>
            
            {/* Postcode Search */}
            <div className="flex gap-2">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] min-h-[44px] text-sm appearance-none cursor-pointer pr-8 w-32"
                disabled={isDetectingCountry}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '12px 12px',
                  backgroundClip: 'padding-box'
                }}
              >
                <option value="">{t('country_select')}</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/80 min-h-[44px]"
                placeholder={t('postcode_placeholder')}
              />
              <button
                type="button"
                onClick={handlePostcodeSearch}
                disabled={isSearchingPostcode || !formData.postcode.trim()}
                className="px-4 py-2.5 bg-[var(--color-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] whitespace-nowrap"
              >
                {isSearchingPostcode ? <LoadingSpinner size="sm" /> : t('search_postcode')}
              </button>
            </div>
            
            {/* Distance Indicator */}
            {distance !== null && (
              <div className={`mt-3 px-4 py-2 rounded-lg ${
                isValidDistance
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
              }`}>
                <p className="text-sm font-medium">
                  {t('distance')}: {Math.round(distance)}m
                  {isValidDistance ? ` ${t('within_range')}` : ` ${t('out_of_range')}`}
                </p>
              </div>
            )}
            
            {/* GPS Accuracy Indicator */}
            {locationMode === 'current' && coords && coords.accuracy && (
              <div className={`mt-3 px-4 py-2 rounded-lg ${
                coords.accuracy > 50
                  ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                  : coords.accuracy > 20
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
              }`}>
                <p className="text-sm font-medium">
                  {t('location_accuracy')}: {t('location_accuracy_meters', { accuracy: Math.round(coords.accuracy) })}
                </p>
                {coords.accuracy > 50 && (
                  <p className="text-xs mt-1 opacity-90">
                    {t('location_accuracy_low_warning')}
                  </p>
                )}
              </div>
            )}
            
          </div>
          
          {/* Cafe Name */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              {t('name_label')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/80 min-h-[44px]"
              placeholder={t('name_placeholder')}
              required
            />
          </div>
          
          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              {t('address_label')}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/80 min-h-[44px]"
              placeholder={t('address_placeholder')}
            />
            {addressFetched && formData.address && (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {t('address_auto_filled')}
              </p>
            )}
            {!addressFetched && formData.address && (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {t('address_edit_hint')}
              </p>
            )}
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              {t('phone_label')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/80 min-h-[44px]"
              placeholder={t('phone_placeholder')}
            />
          </div>
          
          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              {t('website_label')}
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/80 min-h-[44px]"
              placeholder={t('website_placeholder')}
            />
          </div>
          
          {/* Google Maps URL */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              {t('google_maps_url_label')}
            </label>
            <input
              type="url"
              name="source_url"
              value={formData.source_url}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)]/80 min-h-[44px]"
              placeholder={t('google_maps_url_placeholder')}
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {t('google_maps_url_hint')}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors min-h-[44px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValidDistance || !formData.name.trim()}
              className="flex-1 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : t('submit')}
            </button>
          </div>
        </form>
    </div>
  );
}

