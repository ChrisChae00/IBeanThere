'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import CameraIcon from './CameraIcon';

interface PhotoUploadWithMainProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  mainIndex: number;
  onMainIndexChange: (index: number) => void;
  maxPhotos?: number;
  maxSizeMB?: number;
}

export default function PhotoUploadWithMain({
  photos,
  onChange,
  mainIndex,
  onMainIndexChange,
  maxPhotos = 5,
  maxSizeMB = 5
}: PhotoUploadWithMainProps) {
  const t = useTranslations('cafe.register');
  const tLog = useTranslations('cafe.log');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newPhotos: string[] = [];

    for (const file of filesToProcess) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(tLog('photo_too_large', { maxSize: maxSizeMB }));
        continue;
      }

      if (!file.type.startsWith('image/')) {
        alert(tLog('invalid_file_type'));
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
      const updatedPhotos = [...photos, ...newPhotos];
      onChange(updatedPhotos);
      
      // If this is the first photo, auto-select as main
      if (photos.length === 0) {
        onMainIndexChange(0);
      }
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
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
    
    // Adjust main index if needed
    if (newPhotos.length === 0) {
      onMainIndexChange(0);
    } else if (mainIndex === index) {
      // If removing main photo, select first remaining
      onMainIndexChange(0);
    } else if (mainIndex > index) {
      // Adjust main index if removing a photo before it
      onMainIndexChange(mainIndex - 1);
    }
  };

  const setAsMain = (index: number) => {
    onMainIndexChange(index);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-text)]">
        {t('photos_label')} ({photos.length}/{maxPhotos})
      </label>
      <p className="text-xs text-[var(--color-text-secondary)] mb-2">
        {t('photos_hint')}
      </p>
      
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
              <img
                src={photo}
                alt={`${tLog('photo')} ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Main indicator / Set as main button */}
              <button
                type="button"
                onClick={() => setAsMain(index)}
                className={`absolute top-1 left-1 p-1.5 rounded-full transition-all ${
                  mainIndex === index
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-[var(--color-accent)] hover:text-white'
                }`}
                title={mainIndex === index ? t('main_photo') : t('set_as_main')}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-error)]"
                title={tLog('remove')}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Main label */}
              {mainIndex === index && (
                <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-accent)] text-white text-xs text-center py-1 font-medium">
                  {t('main_photo')}
                </div>
              )}
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
          <CameraIcon className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-secondary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            {tLog('drag_drop_photos')} {tLog('or')} {tLog('click_to_upload')}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {tLog('max_photos', { max: maxPhotos })} ({tLog('max_size')}: {maxSizeMB}MB)
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
