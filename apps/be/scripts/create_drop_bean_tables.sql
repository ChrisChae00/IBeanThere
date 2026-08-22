-- =========================================================
-- Drop Bean Feature - Database Migration
-- Creates tables for tracking user cafe visits with growth system
-- 
-- NOTE: This is SEPARATE from existing tables:
--   - cafe_checkins: Used for Founding Crew verification (navigator/vanguard)
--   - cafe_visits: Used for detailed coffee logs (ratings, photos, reviews)
--   - cafe_beans: Lightweight daily visit tracking with gamification (NEW)
-- =========================================================

BEGIN;

-- =========================================================
-- cafe_beans: Tracks user's relationship with each cafe
-- One row per user-cafe pair, tracks total drops and growth level
-- =========================================================
CREATE TABLE IF NOT EXISTS public.cafe_beans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Growth tracking
  drop_count INTEGER NOT NULL DEFAULT 1,
  growth_level INTEGER NOT NULL DEFAULT 1,  -- 1=Sleeping Bean, 2=Sprouting, 3=Growing, 4=Sapling, 5=Fruiting Tree
  
  -- Location data (for heatmap - last drop location)
  last_latitude DECIMAL(10, 8),
  last_longitude DECIMAL(11, 8),
  
  -- Timestamps
  first_dropped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_dropped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE (cafe_id, user_id),
  CONSTRAINT growth_level_check CHECK (growth_level BETWEEN 1 AND 5),
  CONSTRAINT drop_count_positive CHECK (drop_count > 0)
);

-- Indexes for cafe_beans
CREATE INDEX IF NOT EXISTS idx_cafe_beans_user ON public.cafe_beans(user_id);
CREATE INDEX IF NOT EXISTS idx_cafe_beans_cafe ON public.cafe_beans(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cafe_beans_level ON public.cafe_beans(growth_level);
CREATE INDEX IF NOT EXISTS idx_cafe_beans_last_dropped ON public.cafe_beans(last_dropped_at DESC);

-- =========================================================
-- cafe_bean_drops: Individual drop records for daily limit tracking
-- One row per drop action
-- =========================================================
CREATE TABLE IF NOT EXISTS public.cafe_bean_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bean_id UUID NOT NULL REFERENCES public.cafe_beans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  
  -- Location at time of drop
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Timestamp
  dropped_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cafe_bean_drops
CREATE INDEX IF NOT EXISTS idx_cafe_bean_drops_bean ON public.cafe_bean_drops(bean_id);
CREATE INDEX IF NOT EXISTS idx_cafe_bean_drops_user ON public.cafe_bean_drops(user_id);
CREATE INDEX IF NOT EXISTS idx_cafe_bean_drops_cafe ON public.cafe_bean_drops(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cafe_bean_drops_time ON public.cafe_bean_drops(dropped_at DESC);
-- Composite index for daily limit check (user + cafe + timestamp)
-- Note: Daily limit check will use timestamp range queries instead of date casting
CREATE INDEX IF NOT EXISTS idx_cafe_bean_drops_daily ON public.cafe_bean_drops(user_id, cafe_id, dropped_at);

-- =========================================================
-- Enable Row Level Security
-- =========================================================
ALTER TABLE public.cafe_beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_bean_drops ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS Policies for cafe_beans
-- =========================================================
-- Anyone can view beans (for leaderboards, heatmaps, etc.)
DROP POLICY IF EXISTS "Beans are viewable by everyone" ON public.cafe_beans;
CREATE POLICY "Beans are viewable by everyone" ON public.cafe_beans
  FOR SELECT USING (true);

-- Users can insert their own beans
DROP POLICY IF EXISTS "Users can insert own beans" ON public.cafe_beans;
CREATE POLICY "Users can insert own beans" ON public.cafe_beans
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own beans
DROP POLICY IF EXISTS "Users can update own beans" ON public.cafe_beans;
CREATE POLICY "Users can update own beans" ON public.cafe_beans
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- =========================================================
-- RLS Policies for cafe_bean_drops
-- =========================================================
-- Anyone can view drops
DROP POLICY IF EXISTS "Drops are viewable by everyone" ON public.cafe_bean_drops;
CREATE POLICY "Drops are viewable by everyone" ON public.cafe_bean_drops
  FOR SELECT USING (true);

-- Users can insert their own drops
DROP POLICY IF EXISTS "Users can insert own drops" ON public.cafe_bean_drops;
CREATE POLICY "Users can insert own drops" ON public.cafe_bean_drops
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- =========================================================
-- Function to calculate growth level from drop count
-- =========================================================
CREATE OR REPLACE FUNCTION public.calculate_growth_level(drop_count INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF drop_count >= 15 THEN RETURN 5;  -- Fruiting Tree
  ELSIF drop_count >= 10 THEN RETURN 4;  -- Sapling
  ELSIF drop_count >= 5 THEN RETURN 3;   -- Growing
  ELSIF drop_count >= 3 THEN RETURN 2;   -- Sprouting
  ELSE RETURN 1;                          -- Sleeping Bean
  END IF;
END;
$$;

-- =========================================================
-- Trigger to auto-update growth_level when drop_count changes
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_bean_growth_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.growth_level := public.calculate_growth_level(NEW.drop_count);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_bean_growth_level ON public.cafe_beans;
CREATE TRIGGER trg_update_bean_growth_level
  BEFORE INSERT OR UPDATE OF drop_count ON public.cafe_beans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bean_growth_level();

COMMIT;

-- =========================================================
-- Verification: Check tables and policies created
-- =========================================================
SELECT 'cafe_beans table:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cafe_beans';

SELECT 'cafe_bean_drops table:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cafe_bean_drops';

SELECT 'RLS Policies:' as info;
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('cafe_beans', 'cafe_bean_drops');
