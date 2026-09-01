-- Atomic billing guard for Google Place Photo. Run before enabling the feature.
CREATE TABLE IF NOT EXISTS public.google_api_usage (
  sku TEXT NOT NULL,
  billing_month DATE NOT NULL,
  reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (sku, billing_month)
);

ALTER TABLE public.google_api_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.google_api_usage FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.reserve_google_api_slot(
  p_sku TEXT,
  p_billing_month DATE,
  p_cap INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_cap < 1 THEN
    RETURN 0;
  END IF;

  INSERT INTO public.google_api_usage (sku, billing_month, reserved_count)
  VALUES (p_sku, p_billing_month, 1)
  ON CONFLICT (sku, billing_month) DO UPDATE
    SET reserved_count = public.google_api_usage.reserved_count + 1,
        updated_at = now()
    WHERE public.google_api_usage.reserved_count < p_cap
  RETURNING reserved_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_google_api_slot(TEXT, DATE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_google_api_slot(TEXT, DATE, INTEGER) TO service_role;
