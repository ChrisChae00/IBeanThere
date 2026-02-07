'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, ShareIcon, LoadingSpinner } from '@/shared/ui';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title?: string;
  description?: string;
}

/**
 * ShareModal component for sharing cafes and collections.
 * Supports clipboard copy and native Web Share API.
 */
export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  title = '',
  description = '',
}: ShareModalProps) {
  const t = useTranslations('share');
  
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${shareUrl}`
    : shareUrl;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [fullUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;
    
    setIsSharing(true);
    try {
      await navigator.share({
        title: title || 'IBeanThere',
        text: description,
        url: fullUrl,
      });
    } catch (err) {
      // User cancelled or error
      console.log('Share cancelled or failed');
    } finally {
      setIsSharing(false);
    }
  }, [fullUrl, title, description]);

  const handleTwitterShare = useCallback(() => {
    const text = encodeURIComponent(title || 'Check out this cafe collection!');
    const url = encodeURIComponent(fullUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }, [fullUrl, title]);

  const handleFacebookShare = useCallback(() => {
    const url = encodeURIComponent(fullUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }, [fullUrl]);

  const handleKakaoShare = useCallback(() => {
    // KakaoTalk sharing requires Kakao SDK initialization
    // For now, just copy the link and show a message
    handleCopyLink();
  }, [handleCopyLink]);

  const supportsNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
      <div className="space-y-4">
        {/* URL Copy Section */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fullUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-cardText)] truncate"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]'
            }`}
          >
            {copied ? `✓ ${t('copied')}` : t('copy_link')}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--color-border)]"></div>
          <span className="text-sm text-[var(--color-textSecondary)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]"></div>
        </div>

        {/* Social Share Buttons */}
        <div className="flex justify-center gap-4">
          {/* Native Share (Mobile) */}
          {supportsNativeShare && (
            <button
              onClick={handleNativeShare}
              disabled={isSharing}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--color-background)] transition-colors"
            >
              {isSharing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                  <ShareIcon size={20} color="white" />
                </div>
              )}
              <span className="text-xs text-[var(--color-textSecondary)]">Share</span>
            </button>
          )}

          {/* Twitter */}
          <button
            onClick={handleTwitterShare}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--color-background)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-xs text-[var(--color-textSecondary)]">X</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--color-background)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span className="text-xs text-[var(--color-textSecondary)]">Facebook</span>
          </button>

          {/* KakaoTalk */}
          <button
            onClick={handleKakaoShare}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--color-background)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#FEE500] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3C1E1E]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-5.5 0-10 3.58-10 8 0 2.84 1.88 5.34 4.72 6.76-.2.77-.78 2.86-.9 3.3-.14.55.2.55.43.4.17-.12 2.78-1.9 3.9-2.67.6.09 1.21.14 1.85.14 5.5 0 10-3.58 10-8s-4.5-8-10-8z" />
              </svg>
            </div>
            <span className="text-xs text-[var(--color-textSecondary)]">KakaoTalk</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
