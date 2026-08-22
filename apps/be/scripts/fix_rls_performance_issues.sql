-- =========================================================
-- Fix RLS Performance Issues
-- =========================================================
-- This migration addresses performance warnings from Supabase linter:
-- 1. auth_rls_initplan: Wrap auth.uid() in (select auth.uid()) for
--    single evaluation per query instead of per-row
-- 2. multiple_permissive_policies: Remove duplicate policies
--
-- Run in Supabase SQL Editor
-- =========================================================

BEGIN;

-- =========================================================
-- 1. Fix auth_rls_initplan - user_taste_tags
-- =========================================================

DROP POLICY IF EXISTS "Users can insert own taste tags" ON public.user_taste_tags;
CREATE POLICY "Users can insert own taste tags" ON public.user_taste_tags
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own taste tags" ON public.user_taste_tags;
CREATE POLICY "Users can delete own taste tags" ON public.user_taste_tags
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =========================================================
-- 2. Fix auth_rls_initplan - user_trust
-- =========================================================

DROP POLICY IF EXISTS "Users can insert own trusts" ON public.user_trust;
CREATE POLICY "Users can insert own trusts" ON public.user_trust
  FOR INSERT WITH CHECK ((select auth.uid()) = truster_id);

DROP POLICY IF EXISTS "Users can delete own trusts" ON public.user_trust;
CREATE POLICY "Users can delete own trusts" ON public.user_trust
  FOR DELETE USING ((select auth.uid()) = truster_id);

-- =========================================================
-- 3. Fix auth_rls_initplan - user_trust_daily_count
-- =========================================================

DROP POLICY IF EXISTS "Users can view own daily count" ON public.user_trust_daily_count;
CREATE POLICY "Users can view own daily count" ON public.user_trust_daily_count
  FOR SELECT USING ((select auth.uid()) = user_id);

-- Also drop the duplicate "Service can manage daily count" policy
-- Keep one policy that covers service role access
DROP POLICY IF EXISTS "Service can manage daily count" ON public.user_trust_daily_count;
-- Note: service_role bypasses RLS anyway, so we don't need a special policy for it

-- =========================================================
-- 4. Fix auth_rls_initplan - cafes
-- =========================================================

DROP POLICY IF EXISTS "Users can update cafes they navigated" ON public.cafes;
CREATE POLICY "Users can update cafes they navigated" ON public.cafes
  FOR UPDATE USING ((select auth.uid()) = navigator_id);

DROP POLICY IF EXISTS "Authenticated users can insert cafes" ON public.cafes;
CREATE POLICY "Authenticated users can insert cafes" ON public.cafes
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =========================================================
-- 5. Fix auth_rls_initplan & multiple_permissive_policies - visit_likes
-- =========================================================

-- Drop all existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own likes" ON public.visit_likes;
DROP POLICY IF EXISTS "Authenticated users can like visits" ON public.visit_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.visit_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.visit_likes;

-- Recreate with optimized auth.uid() calls (using select wrapper)
-- Only one INSERT policy and one DELETE policy
CREATE POLICY "Authenticated users can like visits" ON public.visit_likes
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.visit_likes
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =========================================================
-- 6. Fix auth_rls_initplan - users
-- =========================================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- =========================================================
-- 7. Fix auth_rls_initplan - cafe_visits
-- =========================================================

DROP POLICY IF EXISTS "Public visits are viewable by everyone" ON public.cafe_visits;
CREATE POLICY "Public visits are viewable by everyone" ON public.cafe_visits
  FOR SELECT USING (is_public = true OR (select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own visits" ON public.cafe_visits;
CREATE POLICY "Users can insert own visits" ON public.cafe_visits
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own visits" ON public.cafe_visits;
CREATE POLICY "Users can update own visits" ON public.cafe_visits
  FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own visits" ON public.cafe_visits;
CREATE POLICY "Users can delete own visits" ON public.cafe_visits
  FOR DELETE USING ((select auth.uid()) = user_id);

-- =========================================================
-- 8. Fix auth_rls_initplan - cafe_checkins
-- =========================================================

DROP POLICY IF EXISTS "Users can insert own checkins" ON public.cafe_checkins;
CREATE POLICY "Users can insert own checkins" ON public.cafe_checkins
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- =========================================================
-- 9. Fix multiple_permissive_policies - user_badges
-- =========================================================

-- Drop duplicate policies
DROP POLICY IF EXISTS "Service can manage badges" ON public.user_badges;
DROP POLICY IF EXISTS "Service role can manage badges" ON public.user_badges;
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.user_badges;
DROP POLICY IF EXISTS "Users can view all badges" ON public.user_badges;

-- Keep only one SELECT policy (public read) and rely on service_role bypassing RLS for writes
CREATE POLICY "Badges are viewable by everyone" ON public.user_badges
  FOR SELECT USING (true);

-- Service role automatically bypasses RLS, so no need for a separate policy

COMMIT;

-- =========================================================
-- Verification: Check that policies are created correctly
-- =========================================================

SELECT 'RLS Policies on user_taste_tags:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_taste_tags';

SELECT 'RLS Policies on user_trust:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_trust';

SELECT 'RLS Policies on user_trust_daily_count:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_trust_daily_count';

SELECT 'RLS Policies on visit_likes:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'visit_likes';

SELECT 'RLS Policies on user_badges:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_badges';

SELECT 'RLS Policies on cafes:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'cafes';

SELECT 'RLS Policies on cafe_visits:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'cafe_visits';

SELECT 'RLS Policies on cafe_checkins:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'cafe_checkins';

SELECT 'RLS Policies on users:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

SELECT 'Performance fixes applied successfully!' as message;
