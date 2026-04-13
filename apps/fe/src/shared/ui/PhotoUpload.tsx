'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import CameraIcon from './CameraIcon';
import { uploadCafeImage } from '@/shared/lib/supabase/storage';
import { isHeicFile, convertHeicToWebp, HeicNotSupportedError } from '@/shared/lib/image/convertHeicToWebp';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  userId: string;
  maxPhotos?: number;
  maxSizeMB?: number;
}

export default function PhotoUpload({ photos, onChange, userId, maxPhotos = 5, maxSizeMB = 5 }: PhotoUploadProps) {
  const t = useTranslations('cafe.log');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [convertingCount, setConvertingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newPhotos: string[] = [];

    for (let file of filesToProcess) {
      // Convert HEIC to WebP before any other processing
      if (isHeicFile(file)) {
        setConvertingCount(prev => prev + 1);
        try {
          file = await convertHeicToWebp(file);
        } catch (error) {
          console.error('Error converting HEIC file:', error);
          alert(error instanceof HeicNotSupportedError
            ? t('heic_browser_not_supported')
            : t('heic_conversion_failed'));
          setConvertingCount(prev => prev - 1);
          continue;
        }
        setConvertingCount(prev => prev - 1);
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(t('photo_too_large', { maxSize: maxSizeMB }));
        continue;
      }

      if (!file.type.startsWith('image/')) {
        alert(t('invalid_file_type'));
        continue;
      }

      setUploadingCount(prev => prev + 1);
      try {
        const url = await uploadCafeImage(file, userId);
        newPhotos.push(url);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploadingCount(prev => prev - 1);
      }
    }

    if (newPhotos.length > 0) {
      onChange([...photos, ...newPhotos]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const isProcessing = uploadingCount > 0 || convertingCount > 0;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-cardTextSecondary)]">
        {t('photos')} ({photos.length}/{maxPhotos})
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
              <img
                src={photo}
                alt={`${t('photo')} ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {convertingCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-cardTextSecondary)]">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t('converting')}...
        </div>
      )}

      {uploadingCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-cardTextSecondary)]">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t('uploading')}...
        </div>
      )}

      {photos.length < maxPhotos && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isProcessing
              ? 'border-[var(--color-border)] opacity-50 cursor-not-allowed'
              : isDragging
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 cursor-pointer'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 cursor-pointer'
          }`}
        >
          <CameraIcon className="w-8 h-8 mx-auto mb-2 text-[var(--color-cardTextSecondary)]" />
          <p className="text-sm text-[var(--color-cardTextSecondary)]">
            {t('drag_drop_photos')} {t('or')} {t('click_to_upload')}
          </p>
          <p className="text-xs text-[var(--color-cardTextSecondary)] mt-1">
            {t('max_photos', { max: maxPhotos })} ({t('max_size')}: {maxSizeMB}MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isProcessing}
          />
        </div>
      )}
    </div>
  );
}
