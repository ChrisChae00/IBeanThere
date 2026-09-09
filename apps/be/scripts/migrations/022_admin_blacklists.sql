-- Apply before deploying blacklist APIs. No historical deletion can be recovered here.
BEGIN;
CREATE TABLE public.cafe_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_cafe_id uuid NOT NULL UNIQUE,
  name text NOT NULL,
  address text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  osm_id text,
  google_place_id text,
  source_url text,
  deleted_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_blacklist (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('watch', 'blocked')),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cafe_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blacklist ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cafe_blacklist, public.user_blacklist FROM anon, authenticated;
GRANT ALL ON public.cafe_blacklist, public.user_blacklist TO service_role;
ALTER TABLE public.cafes ADD COLUMN blacklist_history_id uuid REFERENCES public.cafe_blacklist(id) ON DELETE SET NULL;

CREATE FUNCTION public.match_cafe_blacklist(candidate jsonb) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT b.id FROM public.cafe_blacklist b WHERE
   (NULLIF(candidate->>'osm_id', '') IS NOT NULL AND b.osm_id = candidate->>'osm_id') OR
   (NULLIF(candidate->>'google_place_id', '') IS NOT NULL AND b.google_place_id = candidate->>'google_place_id') OR
   (NULLIF(candidate->>'source_url', '') IS NOT NULL AND b.source_url = candidate->>'source_url') OR
   (regexp_replace(lower(b.name), '[^[:alnum:]]', '', 'g') <> '' AND
    regexp_replace(lower(b.name), '[^[:alnum:]]', '', 'g') = regexp_replace(lower(candidate->>'name'), '[^[:alnum:]]', '', 'g') AND
    ((NULLIF(b.address, '') IS NOT NULL AND lower(b.address) = lower(candidate->>'address')) OR
     (sqrt(power(b.latitude - (candidate->>'latitude')::float8, 2) +
           power((b.longitude - (candidate->>'longitude')::float8) * cos(radians(b.latitude)), 2)) * 111320 <= 50)))
 ORDER BY b.deleted_at DESC, b.id LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.match_cafe_blacklist(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_cafe_blacklist(jsonb) TO service_role;

CREATE FUNCTION public.delete_cafe_with_history(target uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE c public.cafes%ROWTYPE;
BEGIN
 SELECT * INTO c FROM public.cafes WHERE id = target FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO public.cafe_blacklist(original_cafe_id, name, address, latitude, longitude, osm_id, google_place_id, source_url)
 VALUES(c.id, c.name, c.address, c.latitude, c.longitude, c.osm_id::text, c.google_place_id, c.source_url)
 ON CONFLICT (original_cafe_id) DO NOTHING;
 DELETE FROM public.cafes WHERE id = target;
 RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_cafe_with_history(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_cafe_with_history(uuid) TO service_role;

CREATE FUNCTION public.guard_cafe_blacklist() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF TG_OP = 'INSERT' THEN
   NEW.blacklist_history_id := public.match_cafe_blacklist(to_jsonb(NEW));
   IF NEW.blacklist_history_id IS NOT NULL THEN
     IF NEW.source_type = 'app_seed' THEN
       RAISE EXCEPTION 'Cafe has deletion history; skip this seed candidate';
     END IF;
     NEW.status := 'pending'; NEW.admin_verified := false; NEW.verified_at := NULL;
   END IF;
 ELSE
   -- Direct Data API clients cannot erase the review gate or approve themselves.
   IF current_setting('role', true) <> 'service_role' THEN
     NEW.blacklist_history_id := OLD.blacklist_history_id;
     IF OLD.blacklist_history_id IS NOT NULL THEN NEW.admin_verified := OLD.admin_verified; END IF;
   END IF;
   IF NEW.blacklist_history_id IS NOT NULL AND NOT coalesce(NEW.admin_verified, false) THEN
     NEW.status := 'pending'; NEW.verified_at := NULL;
   END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER cafe_blacklist_guard BEFORE INSERT OR UPDATE ON public.cafes
FOR EACH ROW EXECUTE FUNCTION public.guard_cafe_blacklist();

-- Restrictive policies combine with existing ownership policies; they grant no access.
CREATE FUNCTION public.account_not_blocked() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT NOT EXISTS (SELECT 1 FROM public.user_blacklist WHERE user_id = auth.uid() AND status = 'blocked');
$$;
REVOKE ALL ON FUNCTION public.account_not_blocked() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_not_blocked() TO authenticated;
DO $$ DECLARE t record; BEGIN
 FOR t IN SELECT schemaname, tablename FROM pg_tables
   WHERE schemaname = 'public' AND rowsecurity AND tablename NOT IN ('user_blacklist', 'cafe_blacklist')
   OR (schemaname = 'storage' AND tablename = 'objects')
 LOOP
   EXECUTE format('CREATE POLICY blocked_account_guard ON %I.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((SELECT public.account_not_blocked())) WITH CHECK ((SELECT public.account_not_blocked()))', t.schemaname, t.tablename);
 END LOOP;
END $$;
COMMIT;
