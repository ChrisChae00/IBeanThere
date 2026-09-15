-- Apply after 026, before deploying per-collection profile visibility.
BEGIN;
-- Acquire schema locks before writes, avoiding lock upgrades against live RLS reads.
LOCK TABLE public.users, public.cafe_collections, public.collection_items IN ACCESS EXCLUSIVE MODE NOWAIT;
-- Preserve what was actually hidden by the retired profile-wide switch.
UPDATE public.cafe_collections c SET is_public = false
FROM public.users u WHERE c.user_id = u.id AND u.collections_public IS NOT TRUE;
-- Retain the legacy column for older clients, but new code uses only is_public.
UPDATE public.users SET collections_public = true WHERE collections_public IS NOT TRUE;
ALTER TABLE public.users ALTER COLUMN collections_public SET DEFAULT true;
ALTER TABLE public.cafe_collections ALTER COLUMN is_public SET DEFAULT true;

-- A share token is a capability, not permission to enumerate every shared row.
DROP POLICY IF EXISTS collection_visibility_guard ON public.cafe_collections;
CREATE POLICY collection_visibility_guard ON public.cafe_collections
AS RESTRICTIVE FOR SELECT TO anon, authenticated
USING (user_id = (SELECT auth.uid()) OR is_public IS TRUE);
DROP POLICY IF EXISTS collection_item_visibility_guard ON public.collection_items;
CREATE POLICY collection_item_visibility_guard ON public.collection_items
AS RESTRICTIVE FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.cafe_collections c
 WHERE c.id = collection_id AND (c.user_id = (SELECT auth.uid()) OR c.is_public IS TRUE)));

-- One transaction creates both the collection and its items; no link to the source
-- remains. Source edits/deletion and a new share token cannot change this copy.
CREATE OR REPLACE FUNCTION public.copy_shared_collection(source_token text, target_user uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE source public.cafe_collections%ROWTYPE; copied_id uuid;
BEGIN
 SELECT * INTO source FROM public.cafe_collections WHERE share_token = source_token FOR SHARE;
 IF NOT FOUND THEN RETURN NULL; END IF;
 INSERT INTO public.cafe_collections(user_id, name, description, icon_type, color, is_public, position)
 VALUES(target_user, source.name, source.description, 'custom', source.color, true,
   (SELECT coalesce(max(position), -1) + 1 FROM public.cafe_collections WHERE user_id = target_user))
 RETURNING id INTO copied_id;
 INSERT INTO public.collection_items(collection_id, cafe_id, note)
 SELECT copied_id, cafe_id, note FROM public.collection_items WHERE collection_id = source.id;
 RETURN copied_id;
END;
$$;
REVOKE ALL ON FUNCTION public.copy_shared_collection(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.copy_shared_collection(text, uuid) TO service_role;
COMMIT;
