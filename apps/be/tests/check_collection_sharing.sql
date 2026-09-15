-- ONLY an empty disposable database: psql -v ON_ERROR_STOP=1 -f tests/check_collection_sharing.sql
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$
 SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE TABLE public.users(id uuid PRIMARY KEY, collections_public boolean DEFAULT false);
CREATE TABLE public.cafes(id uuid PRIMARY KEY);
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
\ir ../scripts/create_cafe_collections.sql
GRANT SELECT ON public.cafe_collections, public.collection_items TO anon;
GRANT ALL ON public.cafe_collections, public.collection_items TO authenticated, service_role;
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000001', false), ('00000000-0000-0000-0000-000000000002', true);
INSERT INTO public.cafes VALUES ('00000000-0000-0000-0000-000000000003');
INSERT INTO public.cafe_collections(id,user_id,name,is_public,share_token) VALUES
 ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Source',true,'secret'),
 ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002','Already public',true,NULL);
INSERT INTO public.collection_items(collection_id,cafe_id,note) VALUES
 ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000003','Original note');
\ir ../scripts/migrations/027_collection_sharing.sql
\ir ../scripts/migrations/027_collection_sharing.sql
DO $$ BEGIN
 ASSERT NOT (SELECT is_public FROM public.cafe_collections WHERE name='Source');
 ASSERT (SELECT is_public FROM public.cafe_collections WHERE name='Already public');
 ASSERT NOT has_function_privilege('anon','public.copy_shared_collection(text,uuid)','EXECUTE');
 ASSERT NOT has_function_privilege('authenticated','public.copy_shared_collection(text,uuid)','EXECUTE');
 ASSERT has_function_privilege('service_role','public.copy_shared_collection(text,uuid)','EXECUTE');
END $$;
SET ROLE anon;
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM public.cafe_collections)=1;
 ASSERT NOT EXISTS(SELECT 1 FROM public.cafe_collections WHERE share_token='secret');
 ASSERT NOT EXISTS(SELECT 1 FROM public.collection_items);
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
SET ROLE authenticated;
DO $$ BEGIN ASSERT (SELECT count(*) FROM public.collection_items)=1; END $$;
RESET ROLE;
SET ROLE service_role;
SELECT public.copy_shared_collection('secret','00000000-0000-0000-0000-000000000002');
RESET ROLE;
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM public.cafe_collections WHERE name='Source')=2;
 ASSERT EXISTS(SELECT 1 FROM public.cafe_collections WHERE name='Source' AND user_id='00000000-0000-0000-0000-000000000002' AND is_public AND share_token IS NULL AND icon_type='custom');
 ASSERT (SELECT count(DISTINCT id) FROM public.collection_items)=2;
 ASSERT public.copy_shared_collection('missing','00000000-0000-0000-0000-000000000002') IS NULL;
END $$;
-- Insertion failure must not leave a partial collection behind.
CREATE FUNCTION public.fail_copy_item() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test failure'; END $$;
CREATE TRIGGER fail_copy BEFORE INSERT ON public.collection_items FOR EACH ROW EXECUTE FUNCTION public.fail_copy_item();
DO $$ BEGIN
 BEGIN
  PERFORM public.copy_shared_collection('secret','00000000-0000-0000-0000-000000000002');
  RAISE EXCEPTION 'expected item failure';
 EXCEPTION WHEN raise_exception THEN ASSERT SQLERRM='test failure';
 END;
 ASSERT (SELECT count(*) FROM public.cafe_collections)=3;
END $$;
DROP TRIGGER fail_copy ON public.collection_items;
UPDATE public.collection_items SET note='Changed source' WHERE collection_id='00000000-0000-0000-0000-000000000004';
DO $$ BEGIN ASSERT EXISTS(SELECT 1 FROM public.collection_items WHERE note='Original note'); END $$;
DELETE FROM public.cafe_collections WHERE id='00000000-0000-0000-0000-000000000004';
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM public.collection_items)=1;
 ASSERT (SELECT note FROM public.collection_items)='Original note';
END $$;
\echo 'Collection sharing SQL checks passed'
