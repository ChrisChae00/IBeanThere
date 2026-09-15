-- Apply after 024. No user data is changed.
BEGIN;

-- Supabase may grant these roles EXECUTE through default privileges separately
-- from PUBLIC. Revoking PUBLIC alone does not remove those explicit grants.
REVOKE ALL ON FUNCTION public.match_cafe_blacklist(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_cafe_with_history(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_cafe_blacklist(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_cafe_with_history(uuid) TO service_role;

-- Raw rows include user_id (and potentially identifying upload paths). Public
-- anonymous logs are served through the backend's redacted response instead.
-- Restrictive policy also constrains any older permissive SELECT policies.
ALTER TABLE public.cafe_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS visit_identity_guard ON public.cafe_visits;
CREATE POLICY visit_identity_guard ON public.cafe_visits
AS RESTRICTIVE FOR SELECT TO anon, authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (is_public IS TRUE AND anonymous IS FALSE)
);

COMMIT;
