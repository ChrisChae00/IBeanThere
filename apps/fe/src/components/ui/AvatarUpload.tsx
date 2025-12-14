'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar } from './Avatar';

export interface AvatarUploadProps {
  currentAvatarUrl?: string;
  displayName?: string;
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  size?: 'md' | 'lg';
}

export default function AvatarUpload({
  currentAvatarUrl,
  displayName = 'User',
  onFileSelect,
  isUploading = false,
  size = 'lg',
}: AvatarUploadProps) {
  const t = useTranslations('profile');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const sizeClasses = {
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Notify parent
    onFileSelect(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className={`
          relative rounded-full overflow-hidden group
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
          transition-all duration-200
          ${isUploading ? 'cursor-wait' : 'cursor-pointer'}
          ${sizeClasses[size]}
        `}
      >
        <Avatar
          src={displayUrl}
          alt={displayName}
          size="xl"
          className={`${sizeClasses[size]} border-4 border-[var(--color-background)]`}
        />
        
        {/* Hover overlay */}
        <div className={`
          absolute inset-0 bg-black/50 flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity
          ${isUploading ? 'opacity-100' : ''}
        `}>
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
      </button>
      
      <span className="text-xs text-[var(--color-text-secondary)]">
        {t('change_avatar')}
      </span>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
