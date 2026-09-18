import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ibeanthere',
    short_name: 'ibeanthere',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF8F3',
    theme_color: '#8C5A3A',
    icons: [
      { src: '/icons/app-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/app-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/app-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
