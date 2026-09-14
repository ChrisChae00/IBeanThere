/**
 * Gallery-related type definitions for image display components
 */

/*
  `menu` is the only category the gallery filters on today, because it is the only
  one a reader goes looking for by name — the rest of a cafe's photographs are
  browsed, not searched. Nothing sets it yet: the field exists so the filter is
  wired to real data the day photographs start carrying it, rather than being
  retrofitted through every producer at once.
*/
export type GalleryCategory = 'menu';

export interface GalleryImage {
  url: string;
  alt?: string;
  source?: 'registration' | 'log';
  category?: GalleryCategory;
  logId?: string;
  createdAt?: string;
}

export interface ImageGalleryPreviewProps {
  images: GalleryImage[];
  maxDisplay?: number;
  onImageClick?: (index: number) => void;
  onViewAllClick?: () => void;
  className?: string;
}

export interface ImageLightboxProps {
  images: GalleryImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export interface ImageGalleryModalProps {
  images: GalleryImage[];
  isOpen: boolean;
  onClose: () => void;
  onImageClick?: (index: number) => void;
  title?: string;
}
