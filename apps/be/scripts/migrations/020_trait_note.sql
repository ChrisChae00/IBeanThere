-- A short note beside a yes: which beans, which filter method.
--
-- "Sells beans: yes" answers whether to go. It does not answer which bag, and that is
-- the next question a person asks. 200 characters is room for "Detour Coffee, rotating
-- single origin" and not room for a review.
--
-- Characters rather than words: a word count is fuzzy across languages -- Korean does
-- not space the way English does -- and it cannot be shown back as a live remaining
-- count that agrees with the server's check.
--
-- The length limit is a CHECK, not just client validation. The backend holds the
-- service key and bypasses RLS, so the database is the last place a 10,000-character
-- note can be stopped.
--
-- Only two traits take one. "Roasts on site" is answered by yes or no; there is no
-- follow-up question, and an empty box invites filling it with something else.

ALTER TABLE public.cafe_trait_observations
  ADD COLUMN IF NOT EXISTS note TEXT;

ALTER TABLE public.cafe_trait_observations
  DROP CONSTRAINT IF EXISTS cafe_trait_observations_note_check;

ALTER TABLE public.cafe_trait_observations
  ADD CONSTRAINT cafe_trait_observations_note_check
  CHECK (
    note IS NULL
    OR (
      char_length(note) <= 200
      AND trait IN ('sells_beans', 'filter_coffee')
      AND value IS TRUE
    )
  );

-- Check afterwards:
--   SELECT trait, count(*) FILTER (WHERE note IS NOT NULL) FROM public.cafe_trait_observations GROUP BY 1;
