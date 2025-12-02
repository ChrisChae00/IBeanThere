'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import CameraIcon from './CameraIcon';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  maxSizeMB?: number;
}

export default function PhotoUpload({ photos, onChange, maxPhotos = 5, maxSizeMB = 5 }: PhotoUploadProps) {
  const t = useTranslations('cafe.log');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newPhotos: string[] = [];

    for (const file of filesToProcess) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(t('photo_too_large', { maxSize: maxSizeMB }));
        continue;
      }

      if (!file.type.startsWith('image/')) {
        alert(t('invalid_file_type'));
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newPhotos.push(base64);
      } catch (error) {
        console.error('Error reading file:', error);
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

      {photos.length < maxPhotos && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
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
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}

