-- ONLY an empty disposable database: psql -v ON_ERROR_STOP=1 -f tests/check_e2e_security.sql
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$
 SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
-- Reproduce Supabase's explicit role grants, which survive a PUBLIC revoke.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
CREATE FUNCTION public.match_cafe_blacklist(jsonb) RETURNS uuid
LANGUAGE sql SECURITY DEFINER AS $$ SELECT null::uuid $$;
CREATE FUNCTION public.delete_cafe_with_history(uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER AS $$ SELECT false $$;
REVOKE ALL ON FUNCTION public.match_cafe_blacklist(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_cafe_with_history(uuid) FROM PUBLIC;
CREATE TABLE public.cafe_visits(id int PRIMARY KEY, user_id uuid, is_public boolean, anonymous boolean);
GRANT SELECT ON public.cafe_visits TO anon;
GRANT ALL ON public.cafe_visits TO authenticated, service_role;
CREATE POLICY legacy_read ON public.cafe_visits FOR SELECT USING (is_public OR auth.uid() = user_id);
CREATE POLICY owner_write ON public.cafe_visits FOR ALL TO authenticated
 USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY blocked_account_guard ON public.cafe_visits AS RESTRICTIVE FOR ALL TO authenticated
 USING (current_setting('request.test.blocked', true) IS DISTINCT FROM 'true')
 WITH CHECK (current_setting('request.test.blocked', true) IS DISTINCT FROM 'true');
INSERT INTO public.cafe_visits VALUES
 (1, '00000000-0000-0000-0000-000000000001', true, false),
 (2, '00000000-0000-0000-0000-000000000001', true, true),
 (3, '00000000-0000-0000-0000-000000000001', false, false),
 (4, '00000000-0000-0000-0000-000000000001', true, null);
\ir ../scripts/migrations/025_e2e_security.sql
\ir ../scripts/migrations/025_e2e_security.sql
DO $$ BEGIN
 ASSERT NOT has_function_privilege('anon', 'public.delete_cafe_with_history(uuid)', 'EXECUTE');
 ASSERT NOT has_function_privilege('authenticated', 'public.delete_cafe_with_history(uuid)', 'EXECUTE');
 ASSERT NOT has_function_privilege('anon', 'public.match_cafe_blacklist(jsonb)', 'EXECUTE');
 ASSERT NOT has_function_privilege('authenticated', 'public.match_cafe_blacklist(jsonb)', 'EXECUTE');
END $$;
SET ROLE anon;
DO $$ BEGIN ASSERT (SELECT array_agg(id) FROM public.cafe_visits) = ARRAY[1]; END $$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
SET ROLE authenticated;
DO $$ BEGIN ASSERT (SELECT array_agg(id) FROM public.cafe_visits) = ARRAY[1]; END $$;
UPDATE public.cafe_visits SET anonymous=false WHERE id=2;
DELETE FROM public.cafe_visits WHERE id=3;
RESET ROLE;
DO $$ BEGIN
 ASSERT (SELECT anonymous FROM public.cafe_visits WHERE id=2);
 ASSERT EXISTS(SELECT 1 FROM public.cafe_visits WHERE id=3);
END $$;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SET ROLE authenticated;
DO $$ BEGIN ASSERT (SELECT count(*) FROM public.cafe_visits) = 4; END $$;
UPDATE public.cafe_visits SET anonymous=false WHERE id=2;
DELETE FROM public.cafe_visits WHERE id=3;
DO $$ BEGIN
 ASSERT NOT (SELECT anonymous FROM public.cafe_visits WHERE id=2);
 ASSERT (SELECT count(*) FROM public.cafe_visits) = 3;
END $$;
SELECT set_config('request.test.blocked', 'true', false);
DO $$ BEGIN ASSERT NOT EXISTS(SELECT 1 FROM public.cafe_visits); END $$;
RESET ROLE;
SET ROLE service_role;
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM public.cafe_visits) = 3;
 ASSERT public.delete_cafe_with_history('00000000-0000-0000-0000-000000000000') = false;
 ASSERT public.match_cafe_blacklist('{}') IS NULL;
END $$;
RESET ROLE;
\echo 'E2E security SQL checks passed'
