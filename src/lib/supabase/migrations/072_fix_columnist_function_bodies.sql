-- Urgent fix for 071: ALTER TABLE/FUNCTION RENAME updates RLS policy
-- expressions automatically (Postgres stores those as parsed/compiled
-- expression trees), but it does NOT rewrite the stored SOURCE TEXT of
-- `language sql` function bodies — those are re-parsed fresh on every call
-- against whatever the body literally says. current_user_columnist_id()
-- and current_user_terms_accepted() still said author_id/authors/
-- current_user_author_id() internally after 071 renamed those away,
-- so every call failed with "column author_id does not exist" — which,
-- since these run inside RLS policies with no `TO role` restriction,
-- broke the public "Public can read published articles" SELECT too
-- (Postgres evaluates every applicable policy's USING clause as part of
-- the combined row filter, so one broken policy's function call errors
-- the whole query, even for anonymous reads).
BEGIN;

CREATE OR REPLACE FUNCTION public.current_user_columnist_id() RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT columnist_id FROM user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_terms_accepted() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT terms_accepted_at IS NOT NULL FROM columnists WHERE id = current_user_columnist_id();
$$;

COMMIT;
