'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, ChevronDown, ChevronUp, MessageSquare, Clock, User } from 'lucide-react';
import { Button } from '@/shared/ui';
import type { AdminReport, ReportStatus, UpdateReportData } from '../../domain';
import { STATUS_COLORS, TARGET_TYPE_ICONS } from '../../domain';

interface ReportCardProps {
  report: AdminReport;
  onUpdateStatus: (reportId: string, data: UpdateReportData) => Promise<void>;
}

/**
 * Card component displaying a single report with actions.
 */
export default function ReportCard({ report, onUpdateStatus }: ReportCardProps) {
  const t = useTranslations('admin.reports');
  const [isExpanded, setIsExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const statusColors = STATUS_COLORS[report.status];
  const targetIcon = TARGET_TYPE_ICONS[report.targetType];

  const handleStatusChange = async (newStatus: ReportStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(report.id, { status: newStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(report.id, { adminNotes });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatReportType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="bg-[var(--color-cardBackground)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Type and Target */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-lg">{targetIcon}</span>
              <span className="text-sm font-medium text-[var(--color-text)]">
                {formatReportType(report.reportType)}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}>
                {report.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Reporter info */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <User size={14} />
              <span>{report.reporterDisplayName || report.reporterUsername || 'Unknown'}</span>
              <span>•</span>
              <Clock size={14} />
              <span>{formatDate(report.createdAt)}</span>
            </div>
          </div>

          {/* Target link */}
          {report.targetUrl && (
            <a
              href={report.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
            >
              <span>{t('view_target')}</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Description preview */}
        <p className="mt-3 text-sm text-[var(--color-text)] line-clamp-2">
          {report.description}
        </p>

        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              {t('show_less')}
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              {t('show_more')}
            </>
          )}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-[var(--color-surface)]">
          {/* Full description */}
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">{t('description')}</h4>
            <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Attached images */}
          {report.imageUrls.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">
                {t('attached_images')} ({report.imageUrls.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                  >
                    <img
                      src={url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text)] mb-2 flex items-center gap-2">
              <MessageSquare size={14} />
              {t('admin_notes')}
            </h4>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={t('admin_notes_placeholder')}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-cardBackground)] text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
            />
            {adminNotes !== (report.adminNotes || '') && (
              <Button
                onClick={handleSaveNotes}
                disabled={isUpdating}
                size="sm"
                variant="secondary"
                className="mt-2"
              >
                {t('save_notes')}
              </Button>
            )}
          </div>

          {/* Status actions */}
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">{t('change_status')}</h4>
            <div className="flex flex-wrap gap-2">
              {report.status !== 'in_progress' && (
                <Button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isUpdating}
                  size="sm"
                  variant="secondary"
                >
                  🔄 {t('mark_in_progress')}
                </Button>
              )}
              {report.status !== 'resolved' && (
                <Button
                  onClick={() => handleStatusChange('resolved')}
                  disabled={isUpdating}
                  size="sm"
                  variant="primary"
                >
                  ✅ {t('mark_resolved')}
                </Button>
              )}
              {report.status !== 'rejected' && (
                <Button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isUpdating}
                  size="sm"
                  variant="danger"
                >
                  ❌ {t('mark_rejected')}
                </Button>
              )}
            </div>
          </div>

          {/* Resolved info */}
          {report.resolvedAt && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t('resolved_at')}: {formatDate(report.resolvedAt)}
            </p>
          )}
        </div>
      )}

      {/* Image modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImageIndex(null)}
        >
          <img
            src={report.imageUrls[selectedImageIndex]}
            alt={`Full size ${selectedImageIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
