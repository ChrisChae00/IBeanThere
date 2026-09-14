"""
Which badges get handed out, and which no longer exist.

`regular_*` is the new one and it reuses the bean drop rather than inventing a second
idea of "came back": a cafe whose growth_level has passed 1 is one this person
returned to. Cafes are counted, not drops.

Two things this suite pins down beyond the counting: a badge already held is never
re-inserted, and awarding never raises into the caller -- a badge is a decoration on
something that already happened, so a coffee log must survive a badge failure.
"""

import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.services import badges

from test_visit_privacy import FakeSupabase

USER = "user-1"


def _beans(count, level=2):
    return [{"id": f"bean-{i}", "user_id": USER, "growth_level": level} for i in range(count)]


def _tables(**overrides):
    tables = {
        "user_badges": [],
        "cafe_visits": [],
        "cafes": [],
        "user_trust": [],
        "cafe_beans": [],
    }
    tables.update(overrides)
    return tables


class RegularBadgeTests(unittest.TestCase):
    def test_counts_cafes_not_drops(self):
        supabase = FakeSupabase(_tables(cafe_beans=_beans(5)))
        awarded = badges.award_badges(supabase, USER)

        self.assertIn("regular_1", awarded)
        self.assertIn("regular_5", awarded)
        self.assertNotIn("regular_15", awarded)

    def test_only_counts_cafes_come_back_to(self):
        """
        The count asks the database for `growth_level >= 2`, and for this user only.

        Asserted as the query rather than as a number: the fake records filters, it
        does not evaluate them, so a row-count assertion here would only prove the
        fake returns what it was handed.
        """
        supabase = FakeSupabase(_tables(cafe_beans=_beans(9)))
        badges.regular_cafe_count(supabase, USER)

        applied = supabase.queries_on("cafe_beans")[0].filters
        self.assertIn(("gte", "growth_level", badges.REGULAR_LEVEL), applied)
        self.assertIn(("eq", "user_id", USER), applied)

    def test_lower_thresholds_are_not_skipped(self):
        """Somebody who jumps straight past 5 still holds regular_1."""
        supabase = FakeSupabase(_tables(cafe_beans=_beans(6)))
        awarded = badges.award_badges(supabase, USER)
        self.assertEqual(
            [code for code in awarded if code.startswith("regular")],
            ["regular_5", "regular_1"],
        )

    def test_a_badge_already_held_is_not_written_again(self):
        supabase = FakeSupabase(_tables(
            user_badges=[{"badge_code": "regular_1"}],
            cafe_beans=_beans(1),
        ))
        awarded = badges.award_badges(supabase, USER)

        self.assertNotIn("regular_1", awarded)
        self.assertEqual([q for q in supabase.queries_on("user_badges") if q.op == "insert"], [])


class FoundingStatsTests(unittest.TestCase):
    def test_reports_navigator_and_regular(self):
        supabase = FakeSupabase(_tables(
            cafes=[{"id": "cafe-1"}, {"id": "cafe-2"}],
            cafe_beans=_beans(3),
        ))
        self.assertEqual(
            badges.founding_stats(supabase, USER),
            {"navigator_count": 2, "regular_count": 3},
        )

    def test_says_nothing_about_vanguards(self):
        """The retired badge must not come back through the profile."""
        supabase = FakeSupabase(_tables())
        self.assertNotIn("vanguard_count", badges.founding_stats(supabase, USER))


class ExplorerTests(unittest.TestCase):
    def test_counts_navigators_only(self):
        # Five cafes put on the map, none of them by arriving second.
        supabase = FakeSupabase(_tables(cafes=[{"id": f"cafe-{i}"} for i in range(5)]))
        self.assertIn("cafe_explorer", badges.award_badges(supabase, USER))

        nav_query = supabase.queries_on("cafes")[0]
        self.assertIn(("eq", "navigator_id", USER), nav_query.filters)
        self.assertNotIn("vanguard_ids", str(nav_query.filters))


class QuietFailureTests(unittest.TestCase):
    def test_a_broken_award_does_not_reach_the_caller(self):
        supabase = FakeSupabase(_tables())
        with mock.patch.object(badges, "award_badges", side_effect=RuntimeError("boom")):
            badges.award_badges_quietly(supabase, USER)  # must not raise


if __name__ == "__main__":
    unittest.main()
