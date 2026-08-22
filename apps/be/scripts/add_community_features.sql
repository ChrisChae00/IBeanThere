-- =========================================================
-- Add Community Features: Visit Likes & User Badges
-- =========================================================
-- This script adds:
-- 1. visit_likes table for "helpful" reactions on logs
-- 2. user_badges table for gamification badges

BEGIN;

-- =========================================================
-- 1. Visit Likes Table
-- =========================================================
-- Stores "helpful" likes on visit logs

CREATE TABLE IF NOT EXISTS public.visit_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  visit_id UUID NOT NULL REFERENCES public.cafe_visits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, visit_id)
);

CREATE INDEX IF NOT EXISTS idx_visit_likes_user ON public.visit_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_likes_visit ON public.visit_likes(visit_id);

-- =========================================================
-- 2. User Badges Table
-- =========================================================
-- Stores earned badges for users

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_code VARCHAR(50) NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_code)
);

-- Badge codes:
-- 'bean_sprout' - First log recorded
-- 'cafe_explorer' - 5 cafe verifications (Navigator/Vanguard)
-- 'coffee_connoisseur' - Trusted by 10 users
-- 'second_home' - 5 logs at same cafe on different days

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_code ON public.user_badges(badge_code);

-- =========================================================
-- Helper view: Get like count per visit
-- =========================================================

CREATE OR REPLACE VIEW public.visit_like_stats AS
SELECT 
  visit_id,
  COUNT(*) as like_count
FROM public.visit_likes
GROUP BY visit_id;

-- =========================================================
-- RLS Policies
-- =========================================================

-- Enable RLS
ALTER TABLE public.visit_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Visit Likes: Users can manage own likes, all can read
DROP POLICY IF EXISTS "Users can view all likes" ON visit_likes;
CREATE POLICY "Users can view all likes" ON visit_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like visits" ON visit_likes;
CREATE POLICY "Authenticated users can like visits" ON visit_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON visit_likes;
CREATE POLICY "Users can unlike their own likes" ON visit_likes
  FOR DELETE USING (auth.uid() = user_id);

-- User Badges: All can read, only service role can insert (via backend)
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON user_badges;
CREATE POLICY "Badges are viewable by everyone" ON user_badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage badges" ON user_badges;
CREATE POLICY "Service role can manage badges" ON user_badges
  FOR ALL USING (true);

COMMIT;

-- Verify tables created
SELECT 'visit_likes' as table_name, COUNT(*) as row_count FROM public.visit_likes
UNION ALL
SELECT 'user_badges' as table_name, COUNT(*) as row_count FROM public.user_badges;
