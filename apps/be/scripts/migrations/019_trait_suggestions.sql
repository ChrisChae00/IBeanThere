-- A trait claim from the cafe page is a suggestion; one made on the spot is a fact.
--
-- The same sentence ("this place sells beans") carries different evidence depending on
-- where it was said. Registering a cafe means passing a 100m check while standing in
-- it. Logging a bean purchase means having just bought the bag. Pressing a button on a
-- cafe page means none of that -- the reader may never have been there. So the first
-- two write straight into the record and the third waits for a person to look at it.
--
-- One column rather than a second table: approving is then an UPDATE, and the original
-- observer and observation date survive it. A separate suggestions table would have to
-- copy `user_id` and `observed_at` across on approval, and every copy is a chance to
-- lose the two fields that make an observation an observation.
--
-- Existing rows are all seed or register-time, so 'approved' is the right default and
-- the backfill is the default itself.

ALTER TABLE public.cafe_trait_observations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

ALTER TABLE public.cafe_trait_observations
  DROP CONSTRAINT IF EXISTS cafe_trait_observations_status_check;

ALTER TABLE public.cafe_trait_observations
  ADD CONSTRAINT cafe_trait_observations_status_check
  CHECK (status IN ('pending', 'approved'));

-- Only a person can suggest. A seeded row is never pending -- it came from the review
-- that the queue exists to perform.
ALTER TABLE public.cafe_trait_observations
  DROP CONSTRAINT IF EXISTS cafe_trait_observations_seed_approved_check;

ALTER TABLE public.cafe_trait_observations
  ADD CONSTRAINT cafe_trait_observations_seed_approved_check
  CHECK (source = 'user' OR status = 'approved');

-- The queue reads this: everything waiting, oldest first.
CREATE INDEX IF NOT EXISTS cafe_trait_obs_pending_idx
  ON public.cafe_trait_observations (created_at)
  WHERE status = 'pending';

-- Check afterwards:
--   SELECT status, source, count(*) FROM public.cafe_trait_observations GROUP BY 1, 2;
