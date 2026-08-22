-- =========================================================
-- Add Taste Tags & Trust (Taste Mate) System
-- =========================================================
-- This script adds:
-- 1. user_taste_tags table for storing user coffee preferences
-- 2. user_trust table for Taste Mate (trust) relationships
-- 3. Daily trust limit tracking

BEGIN;

-- =========================================================
-- 1. User Taste Tags Table
-- =========================================================
-- Stores coffee preference tags per user (max 5 tags enforced at API level)

CREATE TABLE IF NOT EXISTS public.user_taste_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_user_taste_tags_user_id ON public.user_taste_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_taste_tags_tag ON public.user_taste_tags(tag);

-- =========================================================
-- 2. User Trust Table (Taste Mate System)
-- =========================================================
-- Stores trust relationships between users
-- - truster_id: The user who is trusting
-- - trustee_id: The user being trusted
-- - Self-trust is prevented via CHECK constraint

CREATE TABLE IF NOT EXISTS public.user_trust (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truster_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  trustee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(truster_id, trustee_id),
  CHECK(truster_id != trustee_id)
);

CREATE INDEX IF NOT EXISTS idx_user_trust_truster ON public.user_trust(truster_id);
CREATE INDEX IF NOT EXISTS idx_user_trust_trustee ON public.user_trust(trustee_id);

-- =========================================================
-- 3. Daily Trust Limit Tracking
-- =========================================================
-- Tracks how many trusts a user has made per day (limit: 5/day)

CREATE TABLE IF NOT EXISTS public.user_trust_daily_count (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  trust_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trust_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, trust_date)
);

CREATE INDEX IF NOT EXISTS idx_user_trust_daily_user_date ON public.user_trust_daily_count(user_id, trust_date);

-- =========================================================
-- Helper view: Get trust count per user (trustee)
-- =========================================================

CREATE OR REPLACE VIEW public.user_trust_stats AS
SELECT 
  trustee_id as user_id,
  COUNT(*) as trust_count
FROM public.user_trust
GROUP BY trustee_id;

-- =========================================================
-- RLS Policies
-- =========================================================

-- Enable RLS
ALTER TABLE public.user_taste_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_daily_count ENABLE ROW LEVEL SECURITY;

-- Taste Tags: Users can CRUD their own tags, everyone can read
CREATE POLICY "Users can view all taste tags" ON public.user_taste_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own taste tags" ON public.user_taste_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own taste tags" ON public.user_taste_tags
  FOR DELETE USING (auth.uid() = user_id);

-- Trust: Users can manage their own trusts, everyone can read
CREATE POLICY "Users can view all trusts" ON public.user_trust
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own trusts" ON public.user_trust
  FOR INSERT WITH CHECK (auth.uid() = truster_id);

CREATE POLICY "Users can delete own trusts" ON public.user_trust
  FOR DELETE USING (auth.uid() = truster_id);

-- Daily Count: Only service role access (managed via API)
CREATE POLICY "Users can view own daily count" ON public.user_trust_daily_count
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage daily count" ON public.user_trust_daily_count
  FOR ALL USING (true);

COMMIT;

-- Verify tables created
SELECT 'user_taste_tags' as table_name, COUNT(*) as row_count FROM public.user_taste_tags
UNION ALL
SELECT 'user_trust' as table_name, COUNT(*) as row_count FROM public.user_trust
UNION ALL
SELECT 'user_trust_daily_count' as table_name, COUNT(*) as row_count FROM public.user_trust_daily_count;
