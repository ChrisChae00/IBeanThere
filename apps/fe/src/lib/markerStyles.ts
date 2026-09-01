import L from 'leaflet';
import { CafeMarkerState } from '@/types/map';

/*
  Marker icons are imperative DOM: Leaflet builds each one once from an HTML string and
  never re-renders it. So the colours are written as `var(--token)` rather than resolved
  in JavaScript — the browser re-evaluates them on the element itself, which means a
  theme switch repaints existing markers with no rebuild and no effect dependency.
  Reading the computed value here instead would bake in whichever theme was active when
  the marker happened to be created.

  Pending vs verified is a dashed vs solid border first and a colour second: the two
  states must stay distinguishable without colour.
*/

const MARKER_SHADOW = 'box-shadow: var(--shadow-marker);';
const PIN_SHADOW = 'filter: drop-shadow(0 2px 4px var(--c-shadow));';

export function createCustomMarkerIcon(state: CafeMarkerState): L.DivIcon {
  const verified = state === 'verified';

  const iconHtml = `
    <div style="
      width: 32px;
      height: 32px;
      background-color: ${verified ? 'var(--marker-cafe)' : 'var(--marker-pending)'};
      border: 2px ${verified ? 'solid' : 'dashed'} ${verified ? 'var(--marker-ring)' : 'var(--marker-cafe)'};
      border-radius: 50%;
      ${MARKER_SHADOW}
    "></div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-cafe-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

export function createUserLocationIcon(size: number = 48): L.DivIcon {
  const svgIcon = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: ${size}px; height: ${size}px;">
      <g>
        <path
          d="M17 10C17 11.7279 15.0424 14.9907 13.577 17.3543C12.8967 18.4514 12.5566 19 12 19C11.4434 19 11.1033 18.4514 10.423 17.3543C8.95763 14.9907 7 11.7279 7 10C7 7.23858 9.23858 5 12 5C14.7614 5 17 7.23858 17 10Z"
          fill="var(--surface-page)"
          stroke="var(--marker-user)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14.5 10C14.5 11.3807 13.3807 12.5 12 12.5C10.6193 12.5 9.5 11.3807 9.5 10C9.5 8.61929 10.6193 7.5 12 7.5C13.3807 7.5 14.5 8.61929 14.5 10Z"
          fill="var(--surface-page)"
          stroke="var(--marker-user)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  `;

  return L.divIcon({
    html: `<div style="${PIN_SHADOW}">${svgIcon}</div>`,
    className: 'user-location-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
}

export type ClusterState = 'verified' | 'pending';

export function createSelectedLocationIcon(size: number = 36): L.DivIcon {
  const svgIcon = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: ${size}px; height: ${size}px;">
      <g>
        <path
          d="M16.577 8.52566L6.65811 5.21937C6.3578 5.11927 6.20764 5.06921 6.10382 5.14405C6 5.21888 6 5.37716 6 5.69371V13L16.577 9.47434C17.1653 9.27824 17.4594 9.18019 17.4594 9C17.4594 8.81981 17.1653 8.72176 16.577 8.52566Z"
          fill="var(--ink-primary)"
        />
        <path
          d="M6 13V5.69371C6 5.37716 6 5.21888 6.10382 5.14405C6.20764 5.06921 6.3578 5.11927 6.65811 5.21937L16.577 8.52566C17.1653 8.72176 17.4594 8.81981 17.4594 9C17.4594 9.18019 17.1653 9.27824 16.577 9.47434L6 13ZM6 13V18V19"
          stroke="var(--ink-primary)"
          stroke-width="0.5"
          stroke-linecap="round"
        />
      </g>
    </svg>
  `;

  return L.divIcon({
    html: `<div style="${PIN_SHADOW}">${svgIcon}</div>`,
    className: 'selected-location-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
}

export function createClusterIcon(count: number, state: ClusterState): L.DivIcon {
  const size = count <= 10 ? 40 : count <= 50 ? 50 : 60;
  const fontSize = count <= 10 ? 14 : count <= 50 ? 16 : 18;
  const verified = state === 'verified';

  const iconHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${verified ? 'var(--marker-cafe)' : 'var(--marker-pending)'};
      border: 2px ${verified ? 'solid' : 'dashed'} ${verified ? 'var(--marker-ring)' : 'var(--marker-cafe)'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      ${MARKER_SHADOW}
    ">
      <span style="
        color: var(--marker-ring);
        font-size: ${fontSize}px;
        font-weight: 600;
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
