-- =========================================================
-- 009: Fix trending score computation
-- =========================================================
-- The previous calculate_trending_score() read columns that do not exist
-- (cafes.google_rating, cafes.last_synced_at) and a table that does not exist
-- (public.reviews). It raised on every call, so update_all_trending_scores()
-- always failed and every cafes.trending_score stayed at its 0.0 default —
-- which made ORDER BY trending_score DESC return arbitrary row order.
--
-- This rewrite uses only columns that exist:
--   views    -> cafes.view_count_14d      (from public.cafe_views)
--   visits   -> cafes.visit_count_14d     (from public.cafe_visits, confirmed)
--   reviews  -> public.cafe_visits with a comment in the last 14 days
--   rating   -> AVG(public.cafe_visits.rating)
--
-- The old time-decay factor is removed: every input is already windowed to
-- 14 days, so recency is already expressed.
--
-- Run in the Supabase SQL Editor. Idempotent.
-- =========================================================

BEGIN;

-- Safety: the tiebreak ordering below depends on admin_verified, which is added
-- by add_admin_system.sql. Guarantee it exists so ordering can never silently break.
ALTER TABLE public.cafes
  ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------
-- 1. calculate_trending_score (single cafe)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_trending_score(p_cafe_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
  v_views_14d   INTEGER;
  v_visits_14d  INTEGER;
  v_reviews_14d INTEGER;
  v_rating      DECIMAL;
BEGIN
  SELECT COALESCE(view_count_14d, 0), COALESCE(visit_count_14d, 0)
  INTO v_views_14d, v_visits_14d
  FROM public.cafes
  WHERE id = p_cafe_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  SELECT
    COUNT(*) FILTER (
      WHERE comment IS NOT NULL AND visited_at > NOW() - INTERVAL '14 days'
    ),
    COALESCE(AVG(rating) FILTER (WHERE rating IS NOT NULL), 0)
  INTO v_reviews_14d, v_rating
  FROM public.cafe_visits
  WHERE cafe_id = p_cafe_id;

  RETURN (
    COALESCE(v_views_14d, 0)   * 1.0 +   -- Views: lowest weight
    COALESCE(v_visits_14d, 0)  * 5.0 +   -- Visits: high weight
    COALESCE(v_reviews_14d, 0) * 10.0 +  -- Reviews: highest weight
    COALESCE(v_rating, 0)      * 2.0     -- Rating: moderate weight
  );
END;
$$;

-- ---------------------------------------------------------
-- 2. update_all_trending_scores (whole table, set-based)
-- ---------------------------------------------------------
-- Replaces the old per-row plpgsql loop (one UPDATE per cafe) with three
-- set-based statements. Also refreshes the 14-day aggregates first: the
-- per-row triggers only recompute the window when a cafe gets new activity,
-- so a cafe that was busy 20 days ago would otherwise keep a stale
-- view_count_14d forever.
CREATE OR REPLACE FUNCTION public.update_all_trending_scores()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- 2a. Refresh rolling aggregates for every cafe
  WITH view_stats AS (
    SELECT
      cafe_id,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE viewed_at > NOW() - INTERVAL '14 days') AS d14
    FROM public.cafe_views
    GROUP BY cafe_id
  ),
  visit_stats AS (
    SELECT
      cafe_id,
      COUNT(*) FILTER (WHERE confirmed) AS total,
      COUNT(*) FILTER (
        WHERE confirmed AND visited_at > NOW() - INTERVAL '14 days'
      ) AS d14
    FROM public.cafe_visits
    GROUP BY cafe_id
  )
  UPDATE public.cafes c
  SET
    view_count_total  = COALESCE(vw.total, 0),
    view_count_14d    = COALESCE(vw.d14, 0),
    visit_count_total = COALESCE(vs.total, 0),
    visit_count_14d   = COALESCE(vs.d14, 0)
  FROM (SELECT id FROM public.cafes) src
  LEFT JOIN view_stats  vw ON vw.cafe_id = src.id
  LEFT JOIN visit_stats vs ON vs.cafe_id = src.id
  WHERE c.id = src.id;

  -- 2b. Recompute trending_score from the fresh aggregates
  WITH review_stats AS (
    SELECT
      cafe_id,
      COUNT(*) FILTER (
        WHERE comment IS NOT NULL AND visited_at > NOW() - INTERVAL '14 days'
      ) AS reviews_14d,
      COALESCE(AVG(rating) FILTER (WHERE rating IS NOT NULL), 0) AS avg_rating
    FROM public.cafe_visits
    GROUP BY cafe_id
  )
  UPDATE public.cafes c
  SET
    trending_score = (
      COALESCE(c.view_count_14d, 0)   * 1.0 +
      COALESCE(c.visit_count_14d, 0)  * 5.0 +
      COALESCE(rs.reviews_14d, 0)     * 10.0 +
      COALESCE(rs.avg_rating, 0)      * 2.0
    ),
    trending_updated_at = NOW()
  FROM (SELECT id FROM public.cafes) src
  LEFT JOIN review_stats rs ON rs.cafe_id = src.id
  WHERE c.id = src.id;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- 2c. Assign ranks to every cafe (not only scored ones), using the same
  -- deterministic tiebreak the API orders by, so rank matches list position.
  WITH ranked_cafes AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY
          trending_score DESC,
          admin_verified DESC,
          verification_count DESC,
          created_at DESC,
          id
      ) AS rank
    FROM public.cafes
  )
  UPDATE public.cafes c
  SET trending_rank = rc.rank
  FROM ranked_cafes rc
  WHERE c.id = rc.id;

  RETURN v_updated_count;
END;
$$;

-- ---------------------------------------------------------
-- 3. Index supporting the deterministic ordering
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cafes_trending_order
  ON public.cafes (
    trending_score DESC,
    admin_verified DESC,
    verification_count DESC,
    created_at DESC,
    id
  );

COMMIT;

-- =========================================================
-- 4. Schedule hourly recompute (optional, requires pg_cron)
-- =========================================================
-- Nothing scheduled this before, so scores only moved when someone manually
-- hit POST /api/v1/admin/update-trending-scores. If pg_cron is unavailable,
-- this block is skipped with a notice and the admin endpoint remains the
-- fallback.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  PERFORM cron.unschedule('update-trending-scores')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'update-trending-scores');

  PERFORM cron.schedule(
    'update-trending-scores',
    '0 * * * *',
    $cron$SELECT public.update_all_trending_scores();$cron$
  );

  RAISE NOTICE 'Scheduled hourly trending score recompute via pg_cron.';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron unavailable (%). Trigger recomputes via POST /api/v1/admin/update-trending-scores.', SQLERRM;
END;
$$;

-- Backfill immediately so the fix takes effect without waiting for the cron.
SELECT public.update_all_trending_scores() AS cafes_updated;
