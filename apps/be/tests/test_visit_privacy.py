"""
The privacy claims this pivot makes, as tests.

The claims:

1. A private log contributes nothing to what a cafe publicly shows.
2. An anonymous log counts, but carries no author out.
3. Nobody edits or deletes somebody else's log.
4. `bean_id: null` unlinks; leaving `bean_id` out keeps.
5. A purchase needs no rating -- and turning one back into a drink does.
6. A future observation date is refused.
7. The shared bean catalogue never reports who added a row.

Claims 1-3 are the reason there is no `cafe_bean_offerings` table, so they are tested
against the endpoints rather than against a helper: the design only holds if the
wiring holds. No database -- a fake client records what the query asked for.
"""

import sys
import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.api.deps import get_current_user, get_optional_user
from app.api.v1 import cafes as cafes_api
from app.api.v1 import visits as visits_api
from app.database.supabase import get_supabase_client
from app.main import app
from app.models.cafe import TraitSummary
from app.models.visit import (
    BeanRef,
    CafeLogPublicResponse,
    CafeVisitCreate,
    CafeVisitUpdate,
    validate_merged_log,
)
from app.services import traits as traits_service
from app.services.coffee_logs import public_logs, with_bean


class FakeQuery:
    """Records every filter applied, and answers with whatever rows it was given."""

    def __init__(self, table, rows, log):
        self.table = table
        self.rows = rows
        self.log = log
        self.filters = []
        self.payload = None
        self.op = "select"
        self.one = False

    # -- filters, all chainable ------------------------------------------------
    def select(self, *_a, **_k):
        return self

    def eq(self, field, value):
        self.filters.append(("eq", field, value))
        return self

    def or_(self, expr):
        self.filters.append(("or", expr, None))
        return self

    def in_(self, field, values):
        self.filters.append(("in", field, tuple(values)))
        return self

    def order(self, *_a, **_k):
        return self

    def limit(self, *_a, **_k):
        return self

    def range(self, *_a, **_k):
        return self

    def single(self):
        # Real PostgREST `.single()` puts one object in `.data`, not a list. The
        # endpoints index into it directly, so the fake has to match or every
        # ownership check dies on a TypeError and answers 500.
        self.one = True
        return self

    @property
    def not_(self):
        return _Negated(self)

    # -- writes ---------------------------------------------------------------
    def insert(self, payload):
        self.op, self.payload = "insert", payload
        return self

    def update(self, payload):
        self.op, self.payload = "update", payload
        return self

    def delete(self):
        self.op = "delete"
        return self

    def execute(self):
        self.log.append(self)
        data = self.rows
        if self.op in ("update", "insert") and isinstance(self.rows, list) and self.rows:
            data = [{**self.rows[0], **(self.payload or {})}]
        if self.op == "delete":
            data = []
        if self.one:
            data = data[0] if isinstance(data, list) and data else data
        return FakeResult(data)


class _Negated:
    def __init__(self, query):
        self.query = query

    def is_(self, field, value):
        self.query.filters.append(("not.is", field, value))
        return self.query


class FakeResult:
    def __init__(self, data):
        if isinstance(data, list):
            self.data = data
            self.count = len(data)
        else:
            self.data = data
            self.count = 1 if data else 0


class FakeSupabase:
    def __init__(self, tables):
        self.tables = tables
        self.queries = []

    def table(self, name):
        return FakeQuery(name, self.tables.get(name, []), self.queries)

    def queries_on(self, name):
        return [q for q in self.queries if q.table == name]


class FakeUser:
    def __init__(self, user_id):
        self.id = user_id
        self.role = "user"


OWNER = "user-owner"
STRANGER = "user-stranger"


def make_client(test_case, tables, user_id=OWNER):
    """
    A TestClient wired to a fake database.

    Two mechanisms, because the codebase uses two. `cafes.py` takes the client
    through `Depends`, which `dependency_overrides` can replace. `visits.py` calls
    `get_supabase_client()` inside the function body instead, so FastAPI never sees
    it as a dependency and the override does not apply -- without the patches below
    those endpoints reach the real Supabase, which is how this suite first came to
    take three minutes and answer 500.
    """
    supabase = FakeSupabase(tables)

    app.dependency_overrides[get_supabase_client] = lambda: supabase
    app.dependency_overrides[get_current_user] = lambda: FakeUser(user_id)
    app.dependency_overrides[get_optional_user] = lambda: FakeUser(user_id)
    test_case.addCleanup(app.dependency_overrides.clear)

    for module in (visits_api, cafes_api):
        patcher = mock.patch.object(module, "get_supabase_client", lambda: supabase)
        patcher.start()
        test_case.addCleanup(patcher.stop)

    return TestClient(app), supabase


def _row(**overrides):
    """A stored `cafe_visits` row, complete enough for `CafeVisitResponse` to build."""
    row = {
        "id": "visit-1",
        "cafe_id": "cafe-1",
        "user_id": OWNER,
        "visited_at": "2026-09-01T10:00:00+00:00",
        "auto_detected": False,
        "confirmed": True,
        "has_review": True,
        "has_photos": False,
        "is_public": True,
        "anonymous": False,
        "mode": "drink",
        "rating": 4,
        "photo_urls": [],
    }
    row.update(overrides)
    return row


class PublicLogFilterTests(unittest.TestCase):
    """Claim 1: the public filter is one thing, applied whole."""

    def test_requires_is_public_and_says_something(self):
        supabase = FakeSupabase({"cafe_visits": []})
        public_logs(supabase.table("cafe_visits").select("*")).execute()
        applied = supabase.queries[0].filters

        self.assertIn(("eq", "is_public", True), applied)
        self.assertIn(("or", "rating.not.is.null,mode.eq.purchase", None), applied)

    def test_purchase_without_rating_is_not_excluded(self):
        """
        The old condition was `is_public AND rating IS NOT NULL`. A bag bought and not
        yet brewed has no rating, so that filter hid every purchase -- the exact
        record this app most wants.
        """
        supabase = FakeSupabase({"cafe_visits": []})
        public_logs(supabase.table("cafe_visits").select("*")).execute()
        self.assertNotIn(
            ("not.is", "rating", "null"),
            supabase.queries[0].filters,
            "a bare rating filter would hide purchases",
        )


class CafeBeansEndpointTests(unittest.TestCase):
    """Claims 1 and 2, at the endpoint that shows a cafe's beans."""

    ROWS = [
        {
            "mode": "drink",
            "visited_at": "2026-09-01T10:00:00+00:00",
            "bean_id": "bean-1",
            "beans": {
                "id": "bean-1",
                "name": "Kieni",
                "origin": "Kenya",
                "roast_level": "light",
                "roasters": {"name": "Detour"},
                "created_by": "user-someone",
            },
        },
        {
            "mode": "purchase",
            "visited_at": "2026-08-20T10:00:00+00:00",
            "bean_id": "bean-2",
            "beans": {
                "id": "bean-2",
                "name": "Bombe",
                "origin": "Ethiopia",
                "roast_level": "light",
                "roasters": {"name": "Pilot"},
                "created_by": "user-someone",
            },
        },
    ]

    def test_asks_only_for_public_logs(self):
        client, supabase = make_client(self, {"cafe_visits": self.ROWS})
        client.get("/api/v1/cafes/cafe-1/beans")

        filters = supabase.queries_on("cafe_visits")[0].filters
        self.assertIn(("eq", "is_public", True), filters)
        self.assertIn(("or", "rating.not.is.null,mode.eq.purchase", None), filters)

    def test_drink_and_purchase_stay_separate(self):
        """A bag sold here is not proof the cafe pours it, and the reverse."""
        client, _ = make_client(self, {"cafe_visits": self.ROWS})
        body = client.get("/api/v1/cafes/cafe-1/beans").json()

        self.assertEqual([b["bean_id"] for b in body["drink"]], ["bean-1"])
        self.assertEqual([b["bean_id"] for b in body["purchase"]], ["bean-2"])

    def test_carries_no_author_out(self):
        client, _ = make_client(self, {"cafe_visits": self.ROWS})
        raw = client.get("/api/v1/cafes/cafe-1/beans").text

        for leaked in ("user_id", "created_by", "user-someone"):
            self.assertNotIn(leaked, raw)

    def test_last_seen_is_the_visit_day(self):
        """Not `created_at`: writing up last month's trip is not today's evidence."""
        client, _ = make_client(self, {"cafe_visits": self.ROWS})
        body = client.get("/api/v1/cafes/cafe-1/beans").json()
        self.assertTrue(body["drink"][0]["last_seen_at"].startswith("2026-09-01"))


class VisitOwnershipTests(unittest.TestCase):
    """
    Claim 3. The backend connects with the service key, which bypasses row-level
    security, so ownership has to be checked in the endpoint. RLS is the second line.
    """

    STORED = [_row(mode="drink", rating=4)]

    def test_stranger_cannot_patch(self):
        client, supabase = make_client(self, {"cafe_visits": self.STORED}, user_id=STRANGER)
        response = client.patch("/api/v1/visits/visit-1", json={"comment": "mine now"})

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            [q for q in supabase.queries_on("cafe_visits") if q.op == "update"],
            [],
            "a rejected request must not have written anything",
        )

    def test_owner_can_patch(self):
        client, _ = make_client(self, {"cafe_visits": self.STORED})
        response = client.patch("/api/v1/visits/visit-1", json={"comment": "still mine"})
        self.assertEqual(response.status_code, 200)


class PatchSemanticsTests(unittest.TestCase):
    """Claim 4: an explicit null is an instruction, an absent field is silence."""

    def test_explicit_null_is_distinguishable_from_omitted(self):
        self.assertIn("bean_id", CafeVisitUpdate(bean_id=None).model_fields_set)
        self.assertNotIn("bean_id", CafeVisitUpdate(rating=3).model_fields_set)

    def test_null_bean_id_reaches_the_update_payload(self):
        stored = [_row(mode="purchase", rating=None, bean_id="bean-1")]
        client, supabase = make_client(self, {"cafe_visits": stored})

        client.patch("/api/v1/visits/visit-1", json={"bean_id": None})

        writes = [q for q in supabase.queries_on("cafe_visits") if q.op == "update"]
        self.assertEqual(len(writes), 1)
        self.assertIn("bean_id", writes[0].payload)
        self.assertIsNone(writes[0].payload["bean_id"])

    def test_omitted_bean_id_is_left_alone(self):
        stored = [_row(mode="purchase", rating=None, bean_id="bean-1")]
        client, supabase = make_client(self, {"cafe_visits": stored})

        client.patch("/api/v1/visits/visit-1", json={"comment": "nice"})

        writes = [q for q in supabase.queries_on("cafe_visits") if q.op == "update"]
        self.assertNotIn("bean_id", writes[0].payload)


class LogModeTests(unittest.TestCase):
    """Claim 5."""

    def test_drink_requires_a_rating(self):
        with self.assertRaises(Exception):
            CafeVisitCreate(cafe_id="cafe-1")

    def test_purchase_does_not(self):
        self.assertEqual(CafeVisitCreate(cafe_id="cafe-1", mode="purchase").mode, "purchase")

    def test_unknown_mode_refused(self):
        with self.assertRaises(Exception):
            CafeVisitCreate(cafe_id="cafe-1", rating=3, mode="sniffed")

    def test_merged_state_is_what_is_validated(self):
        """
        Switching a rating-less purchase to a drink is invalid, and the request body
        alone cannot see that -- it carries only `mode`.
        """
        stored = [_row(mode="purchase", rating=None)]
        client, _ = make_client(self, {"cafe_visits": stored})

        response = client.patch("/api/v1/visits/visit-1", json={"mode": "drink"})
        self.assertEqual(response.status_code, 422)

        ok = client.patch("/api/v1/visits/visit-1", json={"mode": "drink", "rating": 4})
        self.assertEqual(ok.status_code, 200)

    def test_helper_agrees_with_the_endpoint(self):
        with self.assertRaises(ValueError):
            validate_merged_log("drink", None)
        validate_merged_log("purchase", None)


class TraitObservationTests(unittest.TestCase):
    """Claim 6, plus the aggregation rules that make traits mean anything."""

    def test_future_observation_refused(self):
        with self.assertRaises(ValueError):
            traits_service.check_observed_at(date.today() + timedelta(days=1))
        traits_service.check_observed_at(date.today())

    def test_newest_observation_per_person_wins(self):
        rows = [
            _obs("sells_beans", True, "u1", "2026-08-01"),
            _obs("sells_beans", False, "u1", "2026-09-05"),
            _obs("sells_beans", True, "u2", "2026-08-20"),
        ]
        summary = _find(traits_service.summarise(rows), "sells_beans")

        self.assertEqual((summary["yes"], summary["no"]), (1, 1))
        self.assertIs(summary["latest_value"], False)

    def test_same_day_takes_the_later_write(self):
        rows = [
            _obs("filter_coffee", True, "u1", "2026-09-05", created="2026-09-05T09:00:00Z"),
            _obs("filter_coffee", False, "u1", "2026-09-05", created="2026-09-05T18:00:00Z"),
        ]
        summary = _find(traits_service.summarise(rows), "filter_coffee")
        self.assertIs(summary["latest_value"], False)
        self.assertEqual((summary["yes"], summary["no"]), (0, 1))

    def test_seed_never_joins_the_human_count(self):
        rows = [
            _obs("roasts_on_site", True, None, "2026-09-01", source="seed"),
            _obs("roasts_on_site", True, "u1", "2026-08-01"),
        ]
        summary = _find(traits_service.summarise(rows), "roasts_on_site")

        self.assertEqual(summary["yes"], 1, "the seed row must not be counted as a person")
        self.assertIs(summary["seed_value"], True)

    def test_a_person_outranks_the_seed(self):
        rows = [
            _obs("sells_beans", True, None, "2026-09-07", source="seed"),
            _obs("sells_beans", False, "u1", "2026-08-01"),
        ]
        summary = _find(traits_service.summarise(rows), "sells_beans")
        self.assertIs(summary["latest_value"], False)

    def test_mine_matches_the_counts_it_sits_beside(self):
        rows = [
            _obs("sells_beans", True, "u1", "2026-08-01"),
            _obs("sells_beans", False, "u1", "2026-09-05"),
        ]
        summary = _find(traits_service.summarise(rows, viewer_id="u1"), "sells_beans")
        self.assertIs(summary["mine"], False)

    def test_flags_treat_unknown_and_no_alike(self):
        """A filter promises places that ARE something, not ones nobody checked."""
        rows = [_obs("sells_beans", False, "u1", "2026-09-01")]
        self.assertEqual(
            traits_service.flags(rows),
            {"sells_beans": False, "roasts_on_site": False, "filter_coffee": False},
        )

    def test_summary_shape_carries_no_user_id(self):
        self.assertNotIn("user_id", TraitSummary.model_fields)


class CatalogueAuthorTests(unittest.TestCase):
    """Claim 7: adding a bean while writing a private log must not expose you."""

    def test_bean_ref_drops_everything_but_the_name(self):
        flat = with_bean({
            "id": "v1",
            "beans": {"id": "b1", "name": "Kieni", "created_by": "user-x",
                      "roasters": {"name": "Detour", "created_by": "user-x"}},
        })
        self.assertEqual(flat["bean"], {"id": "b1", "name": "Kieni", "roaster_name": "Detour"})
        self.assertNotIn("beans", flat)

    def test_response_models_do_not_declare_authors(self):
        self.assertNotIn("created_by", BeanRef.model_fields)
        self.assertNotIn("user_id", CafeLogPublicResponse.model_fields)


def _obs(trait, value, user_id, observed, source="user", created=None):
    return {
        "trait": trait,
        "value": value,
        "source": source,
        "user_id": user_id,
        "observed_at": observed,
        "created_at": created or f"{observed}T12:00:00Z",
    }


def _find(summaries, trait):
    return next(s for s in summaries if s["trait"] == trait)


if __name__ == "__main__":
    unittest.main(verbosity=2)
