BEGIN;

-- =========================================================
-- Extensions
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- =========================================================
-- Utility: updated_at 자동 갱신 트리거
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- =========================================================
-- DROP (존재 시) - 의존관계 고려 순서
-- =========================================================
-- cafe_views가 실제로 어떤 타입인지 확인 후 안전 삭제
DO $$
DECLARE
  obj_oid oid;
  obj_kind char;
BEGIN
  SELECT c.oid, c.relkind
    INTO obj_oid, obj_kind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'cafe_views'
  LIMIT 1;

  IF obj_oid IS NOT NULL THEN
    IF obj_kind = 'v' THEN
      EXECUTE 'DROP VIEW IF EXISTS public.cafe_views CASCADE;';
    ELSIF obj_kind = 'm' THEN
      EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS public.cafe_views CASCADE;';
    ELSE
      EXECUTE 'DROP TABLE IF EXISTS public.cafe_views CASCADE;';
    END IF;
  END IF;
END$$;

-- 테이블들 안전 삭제
DROP TABLE IF EXISTS public.cafe_checkins CASCADE;
DROP TABLE IF EXISTS public.cafe_visits CASCADE;
DROP TABLE IF EXISTS public.cafes CASCADE;

-- =========================================================
-- cafes (마스터)
-- =========================================================
CREATE TABLE public.cafes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  -- Verification
  status VARCHAR NOT NULL DEFAULT 'pending',
  verification_count INTEGER NOT NULL DEFAULT 1,
  verified_at TIMESTAMPTZ,

  -- Founding Crew
  navigator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vanguard_ids JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Source
  source_type VARCHAR,           -- 'google_url' | 'map_click' | 'manual'
  source_url TEXT,
  normalized_name TEXT,
  normalized_address TEXT,

  -- Metadata
  phone TEXT,
  website TEXT,
  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT cafes_status_check CHECK (status IN ('pending', 'verified', 'disputed'))
);

-- updated_at 트리거
DROP TRIGGER IF EXISTS trg_cafes_updated_at ON public.cafes;
CREATE TRIGGER trg_cafes_updated_at
BEFORE UPDATE ON public.cafes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 인덱스
CREATE INDEX idx_cafes_status        ON public.cafes(status);
CREATE INDEX idx_cafes_location      ON public.cafes USING GIST (ll_to_earth(latitude, longitude));
CREATE INDEX idx_cafes_navigator     ON public.cafes(navigator_id);
CREATE INDEX idx_cafes_normalized    ON public.cafes(normalized_name);

-- =========================================================
-- cafe_visits (방문 기록; 필요시 사용)
-- =========================================================
CREATE TABLE public.cafe_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cafe_visits_cafe ON public.cafe_visits(cafe_id);
CREATE INDEX idx_cafe_visits_user ON public.cafe_visits(user_id);
CREATE INDEX idx_cafe_visits_time ON public.cafe_visits(visited_at DESC);

-- =========================================================
-- cafe_checkins (Founding Crew 검증용 1~3회)
-- =========================================================
CREATE TABLE public.cafe_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  checkin_order INTEGER NOT NULL,                 -- 1 | 2 | 3
  founding_role VARCHAR NOT NULL,                 -- 'navigator' | 'vanguard'
  triggered_verification BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (cafe_id, user_id),
  CONSTRAINT checkin_order_check CHECK (checkin_order BETWEEN 1 AND 3),
  CONSTRAINT founding_role_check CHECK (founding_role IN ('navigator', 'vanguard'))
);

CREATE INDEX idx_checkins_cafe  ON public.cafe_checkins(cafe_id);
CREATE INDEX idx_checkins_user  ON public.cafe_checkins(user_id);
CREATE INDEX idx_checkins_order ON public.cafe_checkins(cafe_id, checkin_order);
CREATE INDEX idx_checkins_role  ON public.cafe_checkins(founding_role);

-- =========================================================
-- View: cafe_views (예시 - 요약 뷰)
-- =========================================================
CREATE VIEW public.cafe_views AS
SELECT
  c.id,
  c.name,
  c.address,
  c.latitude,
  c.longitude,
  c.status,
  c.verification_count,
  c.verified_at,
  c.navigator_id,
  c.vanguard_ids,
  c.created_at,
  c.updated_at
FROM public.cafes c;

-- =========================================================
-- 안전한 “완전 초기화” (원하면 아래 블록만 단독 재실행 가능)
-- =========================================================
DO $$
BEGIN
  IF to_regclass('public.cafe_checkins') IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE public.cafe_checkins RESTART IDENTITY CASCADE;';
  END IF;

  IF to_regclass('public.cafe_visits') IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE public.cafe_visits RESTART IDENTITY CASCADE;';
  END IF;

  IF to_regclass('public.cafes') IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE public.cafes RESTART IDENTITY CASCADE;';
  END IF;
END$$;

COMMIT;