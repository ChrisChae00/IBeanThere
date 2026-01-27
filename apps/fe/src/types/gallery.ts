/**
 * Gallery-related type definitions for image display components
 */

export interface GalleryImage {
  url: string;
  alt?: string;
  source?: 'registration' | 'log';
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
