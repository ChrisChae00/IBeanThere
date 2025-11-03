import L from 'leaflet';
import { CafeMarkerState } from '@/types/map';

function getCSSVariable(name: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }
  return '';
}

export function createCustomMarkerIcon(state: CafeMarkerState): L.DivIcon {
  const primaryColor = getCSSVariable('--color-primary') || '#8C5A3A';
  const pendingColor = getCSSVariable('--color-pending') || '#9CA3AF';
  const whiteColor = getCSSVariable('--color-white') || '#FFFFFF';
  
  const config = {
    'pending-1': {
      bg: pendingColor,
      border: primaryColor,
      dash: true,
      badge: null
    },
    'pending-2': {
      bg: pendingColor,
      border: primaryColor,
      dash: true,
      badge: '2'
    },
    'verified': {
      bg: primaryColor,
      border: whiteColor,
      dash: false,
      badge: null
    }
  };

  const style = config[state];
  
  const iconHtml = `
    <div style="
      width: 32px;
      height: 32px;
      background-color: ${style.bg};
      border: 2px solid ${style.border};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ${style.dash ? 'border-style: dashed;' : ''}
    ">
      ${style.badge ? `
        <span style="
          color: ${whiteColor};
          font-size: 12px;
          font-weight: bold;
        ">${style.badge}</span>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-cafe-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

export function createUserLocationIcon(): L.DivIcon {
  const primaryColor = getCSSVariable('--color-primary') || '#8C5A3A';
  const iconHtml = `
    <div style="
      width: 24px;
      height: 24px;
      background-color: ${primaryColor};
      border: 3px solid ${primaryColor};
      filter: brightness(0.8);
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

export type ClusterState = 'verified' | 'pending';

export function createClusterIcon(
  count: number,
  state: ClusterState
): L.DivIcon {
  const primaryColor = getCSSVariable('--color-primary') || '#8C5A3A';
  const pendingColor = getCSSVariable('--color-pending') || '#9CA3AF';
  const whiteColor = getCSSVariable('--color-white') || '#FFFFFF';
  
  let size: number;
  if (count <= 10) {
    size = 40;
  } else if (count <= 50) {
    size = 50;
  } else {
    size = 60;
  }
  
  const fontSize = count <= 10 ? 14 : count <= 50 ? 16 : 18;
  
  const config = {
    verified: {
      bg: primaryColor,
      border: whiteColor,
      borderStyle: 'solid'
    },
    pending: {
      bg: pendingColor,
      border: primaryColor,
      borderStyle: 'dashed'
    }
  };
  
  const style = config[state];
  
  const iconHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${style.bg};
      border: 2px ${style.borderStyle} ${style.border};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      <span style="
        color: ${whiteColor};
        font-size: ${fontSize}px;
        font-weight: bold;
        line-height: 1;
      ">${count}</span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: `custom-cluster-icon ${state}-cluster`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

