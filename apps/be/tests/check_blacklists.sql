-- Run ONLY against an empty disposable PostgreSQL database:
-- psql -v ON_ERROR_STOP=1 -f tests/check_blacklists.sql "$TEST_DATABASE_URL"
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE SCHEMA storage;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE TABLE public.users(id uuid PRIMARY KEY, role text);
CREATE TABLE public.cafes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text, address text,
 latitude float8, longitude float8, osm_id bigint, google_place_id text, source_url text,
 source_type text, status text DEFAULT 'pending', admin_verified boolean DEFAULT false, verified_at timestamptz);
CREATE TABLE public.test_child(cafe_id uuid REFERENCES public.cafes(id) ON DELETE CASCADE);
CREATE TABLE storage.objects(id int);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_users ON public.users FOR SELECT TO authenticated USING (true);
GRANT USAGE ON SCHEMA public, auth, storage TO authenticated, service_role;
GRANT SELECT ON public.users TO authenticated;
GRANT ALL ON public.cafes, public.test_child TO service_role;
\ir ../scripts/migrations/022_admin_blacklists.sql

INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000001', 'user');
INSERT INTO public.cafes(id,name,address,latitude,longitude,osm_id) VALUES
 ('00000000-0000-0000-0000-000000000010','Cafe One','10 King St',43.45,-80.49,123);
INSERT INTO public.test_child VALUES ('00000000-0000-0000-0000-000000000010');
SET ROLE service_role;
SELECT public.delete_cafe_with_history('00000000-0000-0000-0000-000000000010');
DO $$ BEGIN
 ASSERT NOT EXISTS(SELECT 1 FROM public.cafes);
 ASSERT NOT EXISTS(SELECT 1 FROM public.test_child);
 ASSERT (SELECT count(*) FROM public.cafe_blacklist) = 1;
 ASSERT public.match_cafe_blacklist('{"osm_id":123}') IS NOT NULL;
 ASSERT public.match_cafe_blacklist('{"name":"CAFE ONE", "latitude":43.4501,"longitude":-80.49}') IS NOT NULL;
 ASSERT public.match_cafe_blacklist('{"name":"Cafe One", "latitude":44,"longitude":-80.49}') IS NULL;
 ASSERT public.match_cafe_blacklist('{"name":"Different Cafe", "latitude":43.45,"longitude":-80.49}') IS NULL;
 BEGIN
   INSERT INTO public.cafes(name,latitude,longitude,osm_id,source_type) VALUES ('Cafe One',43.45,-80.49,123,'app_seed');
   RAISE EXCEPTION 'seed guard failed' USING ERRCODE = 'check_violation';
 EXCEPTION WHEN raise_exception THEN NULL;
 END;
END $$;
INSERT INTO public.cafes(id,name,latitude,longitude,osm_id,status,admin_verified) VALUES
 ('00000000-0000-0000-0000-000000000020','Cafe One',43.45,-80.49,123,'verified',true);
UPDATE public.cafes SET status='verified';
DO $$ BEGIN
 ASSERT (SELECT status FROM public.cafes) = 'pending';
 ASSERT (SELECT blacklist_history_id FROM public.cafes) IS NOT NULL;
END $$;
UPDATE public.cafes SET status='verified', admin_verified=true;
DO $$ BEGIN ASSERT (SELECT status FROM public.cafes) = 'verified'; END $$;
INSERT INTO public.user_blacklist(user_id,status,reason) VALUES ('00000000-0000-0000-0000-000000000001','blocked','test');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SET ROLE authenticated;
DO $$ BEGIN
 ASSERT NOT public.account_not_blocked();
 ASSERT (SELECT count(*) FROM public.users) = 0;
 BEGIN
   PERFORM public.delete_cafe_with_history('00000000-0000-0000-0000-000000000020');
   RAISE EXCEPTION 'RPC must be service-only';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
RESET ROLE;
UPDATE public.user_blacklist SET status='watch';
SET ROLE authenticated;
DO $$ BEGIN
 ASSERT public.account_not_blocked();
 ASSERT (SELECT count(*) FROM public.users) = 1;
END $$;
RESET ROLE;
\echo 'blacklist SQL checks passed'

-- A failed cascade must roll back the history insert too.
CREATE FUNCTION public.refuse_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'test delete failure'; END $$;
CREATE TRIGGER refuse_delete BEFORE DELETE ON public.cafes FOR EACH ROW EXECUTE FUNCTION public.refuse_delete();
SET ROLE service_role;
DO $$ BEGIN
 BEGIN
   PERFORM public.delete_cafe_with_history('00000000-0000-0000-0000-000000000020');
 EXCEPTION WHEN raise_exception THEN NULL;
 END;
 ASSERT (SELECT count(*) FROM public.cafes) = 1;
 ASSERT (SELECT count(*) FROM public.cafe_blacklist) = 1;
END $$;
RESET ROLE;
\echo 'atomic deletion rollback check passed'
