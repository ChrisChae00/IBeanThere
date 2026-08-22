-- =========================================================
-- Fix Supabase Security Issues
-- =========================================================
-- This migration addresses:
-- 1. SECURITY DEFINER views -> SECURITY INVOKER
-- 2. Enable RLS on tables
-- 3. Fix function search_path
--
-- Run in Supabase SQL Editor
-- =========================================================

BEGIN;

-- =========================================================
-- 1. Fix SECURITY DEFINER Views (ERRORS)
-- =========================================================
-- Recreate views with security_invoker = true

DROP VIEW IF EXISTS public.user_trust_stats;
CREATE VIEW public.user_trust_stats 
WITH (security_invoker = true) AS
SELECT 
  trustee_id as user_id,
  COUNT(*) as trust_count
FROM public.user_trust
GROUP BY trustee_id;

DROP VIEW IF EXISTS public.visit_like_stats;
CREATE VIEW public.visit_like_stats 
WITH (security_invoker = true) AS
SELECT 
  visit_id,
  COUNT(*) as like_count
FROM public.visit_likes
GROUP BY visit_id;

-- =========================================================
-- 2. Enable RLS on Tables (ERRORS)
-- =========================================================

-- 2.1 public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create policies for users
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2.2 public.cafes
ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Cafes are viewable by everyone" ON public.cafes;
DROP POLICY IF EXISTS "Authenticated users can insert cafes" ON public.cafes;
DROP POLICY IF EXISTS "Cafe owners can update their cafes" ON public.cafes;

-- Create policies for cafes
CREATE POLICY "Cafes are viewable by everyone" ON public.cafes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert cafes" ON public.cafes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update cafes they navigated" ON public.cafes
  FOR UPDATE USING (auth.uid() = navigator_id);

-- 2.3 public.cafe_visits
ALTER TABLE public.cafe_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public visits are viewable by everyone" ON public.cafe_visits;
DROP POLICY IF EXISTS "Users can view own visits" ON public.cafe_visits;
DROP POLICY IF EXISTS "Users can insert own visits" ON public.cafe_visits;
DROP POLICY IF EXISTS "Users can update own visits" ON public.cafe_visits;
DROP POLICY IF EXISTS "Users can delete own visits" ON public.cafe_visits;

-- Create policies for cafe_visits
CREATE POLICY "Public visits are viewable by everyone" ON public.cafe_visits
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own visits" ON public.cafe_visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visits" ON public.cafe_visits
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own visits" ON public.cafe_visits
  FOR DELETE USING (auth.uid() = user_id);

-- 2.4 public.cafe_views
ALTER TABLE public.cafe_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Cafe views are viewable by everyone" ON public.cafe_views;
DROP POLICY IF EXISTS "Anyone can insert cafe views" ON public.cafe_views;

-- Create policies for cafe_views (analytics table, less restrictive)
CREATE POLICY "Cafe views are viewable by everyone" ON public.cafe_views
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert cafe views" ON public.cafe_views
  FOR INSERT WITH CHECK (true);

-- 2.5 public.cafe_checkins
ALTER TABLE public.cafe_checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Checkins are viewable by everyone" ON public.cafe_checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.cafe_checkins;

-- Create policies for cafe_checkins
CREATE POLICY "Checkins are viewable by everyone" ON public.cafe_checkins
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own checkins" ON public.cafe_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 3. Fix Function search_path (WARNINGS)
-- =========================================================
-- Recreate functions with SET search_path = ''

-- 3.1 set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- 3.2 update_has_review_from_rating
CREATE OR REPLACE FUNCTION public.update_has_review_from_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.has_review := (NEW.rating IS NOT NULL);
  NEW.has_photos := (NEW.photo_urls IS NOT NULL AND jsonb_array_length(NEW.photo_urls) > 0);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- 3.3 generate_slug
CREATE OR REPLACE FUNCTION public.generate_slug(name_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
  slug_text TEXT;
  counter INTEGER := 0;
  base_slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(trim(name_text));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  
  slug_text := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.cafes WHERE slug = slug_text) LOOP
    counter := counter + 1;
    slug_text := base_slug || '-' || counter;
  END LOOP;
  
  RETURN slug_text;
END;
$$;

-- 3.4 set_cafe_slug
CREATE OR REPLACE FUNCTION public.set_cafe_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

-- 3.5 handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- =========================================================
-- Note: The following functions may not exist in your database
-- If they exist, uncomment and run them separately
-- =========================================================

-- 3.6 update_cafe_aggregates (if exists)
-- CREATE OR REPLACE FUNCTION public.update_cafe_aggregates()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY INVOKER
-- SET search_path = 'public'
-- AS $$ ... $$;

-- 3.7 calculate_trending_score (if exists)
-- CREATE OR REPLACE FUNCTION public.calculate_trending_score()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY INVOKER
-- SET search_path = 'public'
-- AS $$ ... $$;

-- 3.8 update_all_trending_scores (if exists)
-- CREATE OR REPLACE FUNCTION public.update_all_trending_scores()
-- RETURNS void
-- LANGUAGE plpgsql
-- SECURITY INVOKER
-- SET search_path = 'public'
-- AS $$ ... $$;

-- 3.9 trigger_update_cafe_aggregates (if exists)
-- CREATE OR REPLACE FUNCTION public.trigger_update_cafe_aggregates()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY INVOKER
-- SET search_path = 'public'
-- AS $$ ... $$;

COMMIT;

-- =========================================================
-- Verification: Check what was fixed
-- =========================================================
SELECT 'Views check:' as info;
SELECT table_name, is_insertable_into 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('user_trust_stats', 'visit_like_stats');

SELECT 'RLS check:' as info;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'cafes', 'cafe_visits', 'cafe_views', 'cafe_checkins');

SELECT 'Security fixes applied successfully!' as message;
