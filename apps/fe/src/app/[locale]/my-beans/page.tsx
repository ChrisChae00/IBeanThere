'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { GrowthIcon, getGrowthLevel, GROWTH_THRESHOLDS } from '@/components/cafe/GrowthIcon';
import { Sprout, Trees, MapPin, ChevronRight, Info, Flame } from 'lucide-react';
import Modal from '@/shared/ui/Modal';


interface BeanData {
  id: string;
  cafe_id: string;
  cafe_name: string;
  cafe_slug?: string;
  cafe_address?: string;
  latitude: number;
  longitude: number;
  drop_count: number;
  growth_level: number;
  growth_level_name: string;
  first_dropped_at: string;
  last_dropped_at: string;
}

interface UserBeansResponse {
  beans: BeanData[];
  total_count: number;
}

interface StreakData {
  current_streak: number;
  max_streak: number;
  last_drop_date: string | null;
  streak_active: boolean;
}

export default function MyBeansPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = useTranslations('my_beans');
  const tDropBean = useTranslations('drop_bean');
  const { user, isLoading: authLoading } = useAuth();
  
  const [beans, setBeans] = useState<BeanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [streak, setStreak] = useState<StreakData | null>(null);


  useEffect(() => {
    if (!authLoading && user) {
      fetchUserBeans();
      fetchUserStreak();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchUserBeans = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const { createClient } = await import('@/shared/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${apiUrl}/api/v1/cafes/user/beans?limit=100`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch beans');
      }

      const data: UserBeansResponse = await response.json();
      setBeans(data.beans);
    } catch (err) {
      console.error('Error fetching beans:', err);
      setError('Failed to load your beans');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStreak = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const { createClient } = await import('@/shared/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${apiUrl}/api/v1/users/me/streak`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStreak(data);
      }
    } catch (err) {
      console.error('Error fetching streak:', err);
    }
  };

  // Calculate stats
  const totalCafes = beans.length;
  const totalDrops = beans.reduce((sum, b) => sum + b.drop_count, 0);
  const maxLevel = beans.length > 0 ? Math.max(...beans.map(b => b.growth_level)) : 0;

  // Group beans by growth level
  const beansByLevel = beans.reduce((acc, bean) => {
    const level = bean.growth_level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(bean);
    return acc;
  }, {} as Record<number, BeanData[]>);

  if (!user && !authLoading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center py-16">
            <Trees className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary)]" />
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
              {t('login_required_title')}
            </h1>
            <p className="text-[var(--color-textSecondary)] mb-6">
              {t('login_required_description')}
            </p>
            <Link
              href={`/${locale}/signin`}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-colors"
            >
              {t('sign_in')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2 flex items-center gap-3">
            <Trees className="w-8 h-8 text-[var(--color-primary)]" />
            {t('title')}
          </h1>
          <p className="text-[var(--color-textSecondary)]">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-[var(--color-primary)]">{totalCafes}</div>
            <div className="text-sm text-[var(--color-textSecondary)]">{t('stats.cafes')}</div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-[var(--color-accent)]">{totalDrops}</div>
            <div className="text-sm text-[var(--color-textSecondary)]">{t('stats.drops')}</div>
          </div>
          <button
            onClick={() => setShowLevelModal(true)}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]/80 transition-all cursor-pointer group relative"
          >
            <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <Info className="w-4 h-4 text-[var(--color-textSecondary)]" />
            </div>
            <div className="flex justify-center mb-1">
              <GrowthIcon level={maxLevel} size={32} />
            </div>
            <div className="text-sm text-[var(--color-textSecondary)]">{t('stats.highest')}</div>
          </button>
        </div>

        {/* Streak Badge */}
        {streak && streak.current_streak > 0 && (
          <div className={`mb-8 p-4 rounded-xl border ${
            streak.streak_active 
              ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30' 
              : 'bg-[var(--color-surface)] border-[var(--color-border)]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${streak.streak_active ? 'bg-orange-500/20' : 'bg-[var(--color-border)]'}`}>
                  <Flame className={`w-6 h-6 ${streak.streak_active ? 'text-orange-500' : 'text-[var(--color-textSecondary)]'}`} />
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-text)]">
                    {t('streak.current')}: {streak.current_streak === 1 ? t('streak.day') : t('streak.days', { count: streak.current_streak })}
                  </div>
                  <div className="text-sm text-[var(--color-textSecondary)]">
                    {t('streak.best')}: {streak.max_streak === 1 ? t('streak.day') : t('streak.days', { count: streak.max_streak })}
                  </div>
                </div>
              </div>
              {streak.streak_active && (
                <span className="text-sm font-medium text-orange-500">
                  {t('streak.active')}
                </span>
              )}
            </div>
            {!streak.streak_active && streak.current_streak > 0 && (
              <p className="mt-2 text-sm text-[var(--color-textSecondary)]">
                {t('streak.info')}
              </p>
            )}
          </div>
        )}


        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--color-textSecondary)]">{t('loading')}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && beans.length === 0 && (
          <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <Sprout className="w-16 h-16 mx-auto mb-4 text-[var(--color-textSecondary)]" />
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              {t('empty.title')}
            </h2>
            <p className="text-[var(--color-textSecondary)] mb-6">
              {t('empty.description')}
            </p>
            <Link
              href={`/${locale}/discover/dropbean`}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-primaryText)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-colors"
            >
              {t('empty.cta')}
            </Link>
          </div>
        )}

        {/* Beans List */}
        {!isLoading && beans.length > 0 && (
          <div className="space-y-6">
            {/* Fruiting Trees (Level 5) */}
            {beansByLevel[5] && (
              <BeanLevelSection
                level={5}
                beans={beansByLevel[5]}
                locale={locale}
                title={tDropBean('levels.5')}
              />
            )}
            
            {/* Saplings (Level 4) */}
            {beansByLevel[4] && (
              <BeanLevelSection
                level={4}
                beans={beansByLevel[4]}
                locale={locale}
                title={tDropBean('levels.4')}
              />
            )}
            
            {/* Growing (Level 3) */}
            {beansByLevel[3] && (
              <BeanLevelSection
                level={3}
                beans={beansByLevel[3]}
                locale={locale}
                title={tDropBean('levels.3')}
              />
            )}
            
            {/* Sprouting (Level 2) */}
            {beansByLevel[2] && (
              <BeanLevelSection
                level={2}
                beans={beansByLevel[2]}
                locale={locale}
                title={tDropBean('levels.2')}
              />
            )}
            
            {/* Sleeping Beans (Level 1) */}
            {beansByLevel[1] && (
              <BeanLevelSection
                level={1}
                beans={beansByLevel[1]}
                locale={locale}
                title={tDropBean('levels.1')}
              />
            )}
          </div>
        )}

        {/* Level Info Modal */}
        <LevelInfoModal
          isOpen={showLevelModal}
          onClose={() => setShowLevelModal(false)}
          currentLevel={maxLevel}
          t={t}
          tDropBean={tDropBean}
        />
      </div>
    </main>
  );
}

function BeanLevelSection({
  level,
  beans,
  locale,
  title,
}: {
  level: number;
  beans: BeanData[];
  locale: string;
  title: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <GrowthIcon level={level} size={24} />
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {title}
        </h3>
        <span className="text-sm text-[var(--color-textSecondary)]">
          ({beans.length})
        </span>
      </div>
      <div className="space-y-2">
        {beans.map((bean) => (
          <Link
            key={bean.id}
            href={`/${locale}/cafes/${bean.cafe_slug || bean.cafe_id}`}
            className="flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] transition-colors"
          >
            <div>
              <div className="font-medium text-[var(--color-text)]">
                {bean.cafe_name}
              </div>
              {bean.cafe_address && (
                <div className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {bean.cafe_address}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {bean.drop_count} drops
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-textSecondary)]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Level thresholds for display
const LEVEL_DATA = [
  { level: 1, threshold: 1 },
  { level: 2, threshold: 3 },
  { level: 3, threshold: 5 },
  { level: 4, threshold: 10 },
  { level: 5, threshold: 15 },
];

interface LevelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tDropBean: any;
}

function LevelInfoModal({ isOpen, onClose, currentLevel, t, tDropBean }: LevelInfoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('level_info.title')}
      description={t('level_info.subtitle')}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-textSecondary)]">
          {t('level_info.how_to_level')}
        </p>
        
        <div className="space-y-2">
          {LEVEL_DATA.map(({ level, threshold }) => (
            <div
              key={level}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                level === currentLevel
                  ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30'
                  : 'bg-[var(--color-surface)]'
              }`}
            >
              <GrowthIcon level={level} size={28} />
              <div className="flex-1">
                <div className={`font-medium ${
                  level === currentLevel ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                }`}>
                  {tDropBean(`levels.${level}`)}
                </div>
              </div>
              <div className={`text-sm ${
                level === currentLevel ? 'text-[var(--color-primary)]' : 'text-[var(--color-textSecondary)]'
              }`}>
                {t('level_info.drops_required', { count: threshold })}
              </div>
              {level === currentLevel && (
                <span className="text-xs bg-[var(--color-primary)] text-[var(--color-primaryText)] px-2 py-0.5 rounded-full">
                  {t('level_info.current_highest')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
