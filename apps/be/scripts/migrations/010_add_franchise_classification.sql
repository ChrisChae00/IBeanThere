-- Franchise classification: brand-level verdict cache + per-cafe brand link.
-- Verdicts are computed from OpenStreetMap outlet counts. No brand names are hardcoded.

CREATE TABLE IF NOT EXISTS public.cafe_brands (
  brand_key      TEXT PRIMARY KEY,      -- lower(name) with all whitespace stripped
  display_name   TEXT NOT NULL,
  wikidata_id    TEXT,                  -- 'Q175106' when OSM supplies brand:wikidata
  outlet_count   INTEGER,               -- NULL = never successfully counted
  lookup_source  TEXT,                  -- 'wikidata' | 'name' | 'admin'
  admin_override BOOLEAN,               -- NULL = use outlet_count; set = wins over algorithm
  checked_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cafe_brands_wikidata ON public.cafe_brands(wikidata_id);

-- Per-cafe: which brand it resolved to, and whether classification ever succeeded.
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS brand_key TEXT;
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS brand_status TEXT NOT NULL DEFAULT 'unknown';
-- brand_status: 'local'   — classified, under the outlet threshold
--               'unknown' — classification failed or not attempted; admin review queue

CREATE INDEX IF NOT EXISTS idx_cafes_brand_key ON public.cafes(brand_key);
CREATE INDEX IF NOT EXISTS idx_cafes_brand_status ON public.cafes(brand_status)
  WHERE brand_status = 'unknown';

-- cafe_brands is read by the API through the service key only; no public access.
ALTER TABLE public.cafe_brands ENABLE ROW LEVEL SECURITY;
