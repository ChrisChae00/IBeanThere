-- ONLY an empty disposable database: psql -v ON_ERROR_STOP=1 -f tests/check_account_deletion.sql
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE SCHEMA storage;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE TABLE public.users(id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE);
CREATE TABLE public.user_blacklist(user_id uuid REFERENCES public.users ON DELETE CASCADE, status text);
CREATE TABLE public.cafes(id int PRIMARY KEY, navigator_id uuid REFERENCES auth.users ON DELETE SET NULL, vanguard_ids jsonb, main_image text);
CREATE TABLE public.cafe_visits(user_id uuid REFERENCES auth.users ON DELETE CASCADE);
CREATE TABLE public.fraud_logs(user_id uuid REFERENCES auth.users ON DELETE CASCADE, reviewed_by uuid REFERENCES auth.users);
CREATE TABLE storage.objects(bucket_id text, name text, owner_id text);
\ir ../scripts/migrations/024_account_deletion.sql
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
INSERT INTO public.users SELECT id FROM auth.users;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
INSERT INTO public.cafe_visits VALUES(auth.uid());
INSERT INTO public.cafes VALUES (1, auth.uid(), jsonb_build_array(auth.uid()::text, 'other'), 'https://example.com/storage/v1/object/public/cafe-images/' || auth.uid()::text || '/a.jpg');
INSERT INTO public.fraud_logs VALUES ('00000000-0000-0000-0000-000000000002', auth.uid());
INSERT INTO storage.objects VALUES
 ('avatars', auth.uid()::text || '/a.jpg', null),
 ('reports', auth.uid()::text || '/nested/b.jpg', auth.uid()::text),
 ('other-bucket', 'legacy-owned.jpg', auth.uid()::text),
 ('avatars', '00000000-0000-0000-0000-000000000002/a.jpg', '00000000-0000-0000-0000-000000000002');
DO $$ BEGIN
 ASSERT public.account_not_blocked();
 ASSERT (SELECT count(*) FROM public.account_deletion_files(auth.uid())) = 3;
 ASSERT NOT has_function_privilege('authenticated', 'public.account_deletion_files(uuid)', 'EXECUTE');
 ASSERT NOT has_table_privilege('authenticated', 'public.account_deletion_requests', 'INSERT');
END $$;
INSERT INTO public.account_deletion_requests(user_id) VALUES(auth.uid());
DO $$ BEGIN ASSERT NOT public.account_not_blocked(); END $$;
DELETE FROM auth.users WHERE id = auth.uid();
DO $$ BEGIN
 ASSERT NOT public.account_not_blocked(); -- unexpired token
 ASSERT (SELECT count(*) FROM public.users) = 1;
 ASSERT NOT EXISTS(SELECT 1 FROM public.cafe_visits);
 ASSERT NOT EXISTS(SELECT 1 FROM public.account_deletion_requests);
 ASSERT (SELECT navigator_id IS NULL AND main_image IS NULL AND vanguard_ids = '["other"]'::jsonb FROM public.cafes);
 ASSERT (SELECT reviewed_by IS NULL FROM public.fraud_logs);
 ASSERT (SELECT count(*) FROM storage.objects) = 4; -- never delete Storage metadata with SQL
END $$;
\echo 'Account deletion SQL checks passed'
