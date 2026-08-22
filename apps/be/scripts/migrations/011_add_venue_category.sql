-- Coffee-only rule: bubble tea shops, tea houses and juice bars do not belong here.
-- Plus descriptive traits collected now for future filtering (not read yet).

ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS serves_coffee BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS category_source TEXT NOT NULL DEFAULT 'unverified';
-- category_source: 'osm' (map tags said so) | 'self_declared' (registrant confirmed)
--                  | 'unverified' (rows that predate this rule)

-- Filled by registration and the purge sweep; nothing filters on these yet.
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS venue_traits TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS osm_tags JSONB;

CREATE INDEX IF NOT EXISTS idx_cafes_serves_coffee ON public.cafes(serves_coffee)
  WHERE serves_coffee = false;
CREATE INDEX IF NOT EXISTS idx_cafes_venue_traits ON public.cafes USING GIN (venue_traits);
