BEGIN;

-- =========================================================
-- Add price_currency field to cafe_visits table
-- =========================================================
-- This migration adds the price_currency field to store the currency code
-- for the price field (e.g., USD, KRW, EUR, etc.)

ALTER TABLE public.cafe_visits
ADD COLUMN IF NOT EXISTS price_currency VARCHAR(10);

-- Add comment for documentation
COMMENT ON COLUMN public.cafe_visits.price_currency IS 'Currency code for price (e.g., USD, KRW, EUR, JPY, GBP, CNY, AUD, CAD)';

COMMIT;

