-- Apply after 025.
--
-- `cafe_collections.is_public` shipped defaulting to FALSE with no way to set it:
-- no API caller sent it and no screen offered it, so every row is FALSE. Now that
-- a public profile only publishes collections whose own flag is true, those rows
-- would publish nothing at all.
--
-- Turning them on restores exactly the behaviour people already had, because the
-- profile's `collections_public` switch is still what decides whether any of this
-- is published. Nobody chose FALSE here, so nothing chosen is being overwritten.
BEGIN;

UPDATE public.cafe_collections SET is_public = TRUE WHERE is_public IS DISTINCT FROM TRUE;

ALTER TABLE public.cafe_collections ALTER COLUMN is_public SET DEFAULT TRUE;

COMMIT;
