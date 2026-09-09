"""
Which surface a trait claim came through decides whether it counts yet.

The same sentence -- "this place sells beans" -- carries different evidence depending
on where it was said:

- Registering a cafe means passing a 100m check while standing in it.
- Logging a bean purchase means having just bought the bag.
- Pressing a button on a cafe page means neither; the reader may never have been there.

So the first two write approved rows and count at once, and the third waits. These
tests pin that split, and pin the thing that makes the split worth having: a pending
row must never reach a count, a flag, or a map filter.
"""

import sys
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.services import traits

from test_visit_privacy import FakeSupabase

CAFE = "cafe-1"
SOMEONE = "user-1"
SOMEONE_ELSE = "user-2"


def _obs(**overrides):
    row = {
        "trait": "sells_beans",
        "value": True,
        "source": "user",
        "user_id": SOMEONE,
        "observed_at": "2026-09-01",
        "created_at": "2026-09-01T10:00:00+00:00",
        "status": traits.APPROVED,
    }
    row.update(overrides)
    return row


def _of(summaries, trait="sells_beans"):
    return next(s for s in summaries if s["trait"] == trait)


class PendingIsNotTheRecordTests(unittest.TestCase):
    def test_a_pending_row_is_not_counted(self):
        summary = _of(traits.summarise([_obs(status=traits.PENDING)]))
        self.assertEqual((summary["yes"], summary["no"]), (0, 0))
        self.assertIsNone(summary["latest_value"])

    def test_a_pending_row_does_not_raise_a_map_flag(self):
        """The filter promises places that ARE something. A request is not an answer."""
        self.assertFalse(traits.flags([_obs(status=traits.PENDING)])["sells_beans"])

    def test_a_pending_no_cannot_overturn_an_approved_yes(self):
        # The whole point: one unreviewed "no" must not drop a cafe out of a filter.
        rows = [
            _obs(value=True, observed_at="2026-09-01"),
            _obs(value=False, user_id=SOMEONE_ELSE, observed_at="2026-09-08",
                 status=traits.PENDING),
        ]
        summary = _of(traits.summarise(rows))
        self.assertEqual((summary["yes"], summary["no"]), (1, 0))
        self.assertIs(summary["latest_value"], True)

    def test_my_own_pending_claim_is_not_reported_back_as_mine(self):
        """`mine` says what the record holds for you, not what you have asked for."""
        summary = _of(traits.summarise([_obs(status=traits.PENDING)], viewer_id=SOMEONE))
        self.assertIsNone(summary["mine"])

    def test_a_row_with_no_status_still_counts(self):
        """Rows written before the column existed are the record, not suggestions."""
        row = _obs()
        del row["status"]
        self.assertEqual(_of(traits.summarise([row]))["yes"], 1)


class WritePathTests(unittest.TestCase):
    def test_evidence_backed_writes_are_approved(self):
        supabase = FakeSupabase({"cafe_trait_observations": []})
        traits.record_observation(supabase, CAFE, "sells_beans", True, SOMEONE)
        self.assertEqual(supabase.queries[0].payload["status"], traits.APPROVED)
        self.assertEqual(supabase.queries[0].payload["source"], "user")

    def test_the_cafe_page_writes_pending(self):
        supabase = FakeSupabase({"cafe_trait_observations": []})
        traits.record_observation(
            supabase, CAFE, "sells_beans", True, SOMEONE, status=traits.PENDING
        )
        self.assertEqual(supabase.queries[0].payload["status"], traits.PENDING)

    def test_observed_at_defaults_to_today_not_to_null(self):
        supabase = FakeSupabase({"cafe_trait_observations": []})
        traits.record_observation(supabase, CAFE, "sells_beans", True, SOMEONE)
        self.assertEqual(supabase.queries[0].payload["observed_at"], date.today().isoformat())

    def test_an_unknown_trait_is_dropped_rather_than_written(self):
        supabase = FakeSupabase({"cafe_trait_observations": []})
        traits.record_observations_quietly(
            supabase, CAFE, {"sells_beans": True, "wifi": True}, SOMEONE
        )
        written = [q.payload["trait"] for q in supabase.queries if q.op == "insert"]
        self.assertEqual(written, ["sells_beans"])

    def test_a_failed_trait_never_reaches_the_caller(self):
        """Registration and the log have already succeeded by the time this runs."""
        class Exploding(FakeSupabase):
            def table(self, name):
                raise RuntimeError("boom")

        traits.record_observations_quietly(
            Exploding({}), CAFE, {"sells_beans": True}, SOMEONE
        )  # must not raise


class MapFlagQueryTests(unittest.TestCase):
    def test_the_map_asks_the_database_for_approved_rows_only(self):
        supabase = FakeSupabase({"cafe_trait_observations": []})
        traits.load_flags(supabase, [CAFE])
        self.assertIn(("eq", "status", traits.APPROVED), supabase.queries[0].filters)


if __name__ == "__main__":
    unittest.main()
