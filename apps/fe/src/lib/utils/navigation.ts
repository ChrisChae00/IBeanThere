export type NavigationApp = 'google' | 'apple' | 'waze';

export interface NavigationAppInfo {
  id: NavigationApp;
  labelKey: string;
}

/**
 * Gets the deep link URL for a specific navigation app
 */
export function getNavigationUrl(lat: number, lng: number, app: NavigationApp): string {
  switch (app) {
    case 'google':
      // Google Maps deep link
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    case 'apple':
      // Apple Maps deep link
      return `https://maps.apple.com/?daddr=${lat},${lng}`;
    case 'waze':
      // Waze deep link
      return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    default:
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
}

/**
 * Opens the specific navigation app in a new tab/window
 */
export function openNavigation(lat: number, lng: number, app: NavigationApp): void {
  const url = getNavigationUrl(lat, lng, app);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Returns the list of supported navigation apps
 */
export function getNavigationApps(): NavigationAppInfo[] {
  return [
    { id: 'google', labelKey: 'google_maps' },
    { id: 'apple', labelKey: 'apple_maps' },
    { id: 'waze', labelKey: 'waze' },
  ];
}
