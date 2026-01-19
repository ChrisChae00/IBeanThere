'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/shared/lib/supabase/client';
import { 
  submitReport, 
  uploadReportImage, 
  getReportTypesForTarget,
  ReportType,
  TargetType,
  ReportCreateRequest 
} from '@/lib/api/reports';
import ImageUploader from './ImageUploader';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: TargetType;
  targetId?: string;
  targetUrl?: string;
  preselectedReportType?: ReportType;
}

/**
 * Modal for submitting reports/feedback.
 * Supports different report types based on target (user, cafe, review, website).
 */
export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetUrl,
  preselectedReportType,
}: ReportModalProps) {
  const t = useTranslations('report');
  const { user } = useAuth();
  
  const [selectedType, setSelectedType] = useState<ReportType | ''>(preselectedReportType || '');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reportTypes = getReportTypesForTarget(targetType);

  const resetForm = useCallback(() => {
    setSelectedType(preselectedReportType || '');
    setDescription('');
    setImages([]);
    setError(null);
    setSuccess(false);
  }, [preselectedReportType]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  }, [isSubmitting, onClose, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError(t('error_login_required'));
      return;
    }

    if (!selectedType) {
      setError(t('error_select_type'));
      return;
    }

    if (description.length < 10) {
      setError(t('error_description_too_short'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get session from Supabase for access token
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.access_token) {
        setError(t('error_login_required'));
        setIsSubmitting(false);
        return;
      }

      const accessToken = sessionData.session.access_token;
      
      // Upload images first
      const imageUrls: string[] = [];
      
      for (const file of images) {
        const url = await uploadReportImage(file, user.id, supabase);
        imageUrls.push(url);
      }

      // Submit report
      const reportData: ReportCreateRequest = {
        report_type: selectedType,
        target_type: targetType,
        target_id: targetId,
        target_url: targetUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
        description,
        image_urls: imageUrls,
      };

      await submitReport(reportData, accessToken);
      
      setSuccess(true);
      
      // Close modal after brief delay
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (err) {
      console.error('Report submission error:', err);
      if (err instanceof Error) {
        if (err.message === 'duplicate_report') {
          setError(t('error_duplicate_report'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('error_submit_failed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Get title based on target type
  const getTitle = () => {
    switch (targetType) {
      case 'user': return t('title_report_user');
      case 'cafe': return t('title_report_cafe');
      case 'review': return t('title_report_review');
      case 'website': return t('title_feedback');
      default: return t('title_report');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] rounded-2xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-t-2xl">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {getTitle()}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              {t('success_title')}
            </h3>
            <p className="text-[var(--color-text-secondary)]">
              {t('success_message')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t('select_type')} *
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ReportType)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">{t('select_type_placeholder')}</option>
                {reportTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`types.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t('description')} *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                minLength={10}
                maxLength={2000}
                placeholder={t('description_placeholder')}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {description.length}/2000
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t('attach_images')}
              </label>
              <ImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={3}
                maxSizeMB={5}
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedType || description.length < 10}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[var(--color-primary)] text-[var(--color-primaryText)] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('submit')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
