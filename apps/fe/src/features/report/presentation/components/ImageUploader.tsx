'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Upload } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

/**
 * Image uploader component with drag & drop support.
 * Displays previews and allows removal of selected images.
 */
export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 3,
  maxSizeMB = 5,
  disabled = false,
}: ImageUploaderProps) {
  const t = useTranslations('report');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return t('error_invalid_file_type');
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return t('error_file_too_large', { maxSize: maxSizeMB });
    }

    return null;
  }, [maxSizeMB, t]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    const newImages: File[] = [];

    for (const file of fileArray) {
      if (images.length + newImages.length >= maxImages) {
        setError(t('error_max_images', { max: maxImages }));
        break;
      }

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      newImages.push(file);
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  }, [images, maxImages, onImagesChange, validateFile, t]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError(null);
  }, [images, onImagesChange]);

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors
            ${isDragging
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-[var(--color-text-secondary)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t('drag_drop_or_click')}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t('image_requirements', { max: maxImages, maxSize: maxSizeMB })}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group w-20 h-20 rounded-xl overflow-hidden border border-[var(--color-border)]"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0.5 right-0.5 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image count indicator */}
      <p className="text-xs text-[var(--color-text-secondary)]">
        {t('images_count', { count: images.length, max: maxImages })}
      </p>
    </div>
  );
}
