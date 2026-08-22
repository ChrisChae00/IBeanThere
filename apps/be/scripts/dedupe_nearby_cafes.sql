-- Find/remove duplicate cafes: same normalized name AND within 50 m of each other.
-- Requires the earthdistance + cube extensions (already used by idx_cafes_location).
--
-- Survivor rule per duplicate group: highest verification_count, then oldest created_at, then lowest id.
-- Everything else in the group is a "loser".
--
-- WARNING: deleting a cafe CASCADES to every table with an FK to cafes.
-- Step 3 therefore deletes ONLY losers with no dependent rows anywhere.
-- Step 4 lists the rest for manual merge.

-- Counts rows in every table that has an FK to cafes, for one cafe id.
-- Catalog-driven, so it stays correct as tables come and go.
CREATE OR REPLACE FUNCTION public.cafe_child_rows(p_cafe_id UUID)
RETURNS BIGINT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; n BIGINT; total BIGINT := 0;
BEGIN
  FOR r IN
    SELECT con.conrelid::regclass AS tbl, att.attname AS col
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
    WHERE con.contype = 'f'
      AND con.confrelid = 'public.cafes'::regclass
      AND array_length(con.conkey, 1) = 1
  LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE %I = $1', r.tbl, r.col) INTO n USING p_cafe_id;
    total := total + n;
  END LOOP;
  RETURN total;
END $$;

CREATE OR REPLACE VIEW public.v_cafe_dupes AS
WITH norm AS (
  SELECT id, name, address, latitude, longitude, verification_count, created_at,
         lower(regexp_replace(coalesce(normalized_name, name), '\s+', '', 'g')) AS key
  FROM public.cafes
),
pairs AS (
  SELECT a.id AS loser_id, b.id AS keep_id,
         round(earth_distance(ll_to_earth(a.latitude, a.longitude),
                              ll_to_earth(b.latitude, b.longitude))::numeric, 1) AS meters
  FROM norm a
  JOIN norm b
    ON a.key = b.key
   AND a.id <> b.id
   AND earth_distance(ll_to_earth(a.latitude, a.longitude),
                      ll_to_earth(b.latitude, b.longitude)) <= 50
   -- b wins over a
   AND (b.verification_count, -extract(epoch FROM b.created_at), b.id::text)
     > (a.verification_count, -extract(epoch FROM a.created_at), a.id::text)
)
SELECT DISTINCT ON (p.loser_id)
       p.loser_id, l.name AS loser_name, l.address AS loser_address, l.created_at AS loser_created_at,
       p.keep_id,  k.name AS keep_name,  k.address AS keep_address,
       p.meters,
       public.cafe_child_rows(p.loser_id) AS child_rows
FROM pairs p
JOIN public.cafes l ON l.id = p.loser_id
JOIN public.cafes k ON k.id = p.keep_id
ORDER BY p.loser_id, p.meters;

-- 1) Preview everything
SELECT * FROM public.v_cafe_dupes ORDER BY loser_name, meters;

-- 2) How many are safe to delete
SELECT count(*) FILTER (WHERE child_rows = 0) AS safe_to_delete,
       count(*) FILTER (WHERE child_rows > 0) AS needs_manual_merge
FROM public.v_cafe_dupes;

-- 3) DELETE the safe ones (uncomment to run)
-- DELETE FROM public.cafes c
-- USING public.v_cafe_dupes d
-- WHERE c.id = d.loser_id AND d.child_rows = 0;

-- 4) Leftovers that still hold data — merge by hand or repoint children to keep_id first
SELECT * FROM public.v_cafe_dupes WHERE child_rows > 0 ORDER BY child_rows DESC;
