"""Public profile visibility must not publish a private collection or its preview."""
import unittest

from test_visit_privacy import FakeQuery, make_client


class FilteringQuery(FakeQuery):
    def execute(self):
        for operation, field, value in self.filters:
            if operation == "eq":
                self.rows = [row for row in self.rows if row.get(field) == value]
        return super().execute()


class CollectionPrivacyTests(unittest.TestCase):
    def test_profile_and_collection_visibility_are_both_required(self):
        for profile_public in (False, True):
            with self.subTest(profile_public=profile_public):
                collections = [
                    dict(id=key, user_id=owner, name=key, is_public=public,
                         created_at="2026-09-15T00:00:00Z")
                    for key, owner, public in (
                        ("visible", "owner", True),
                        ("private", "owner", False),
                        ("someone-else", "other", True),
                    )
                ]
                client, db = make_client(self, {
                    "users": [{"id": "owner", "username": "alice",
                               "collections_public": profile_public}],
                    "cafe_collections": collections,
                    "collection_items": [{"id": "secret", "collection_id": "private",
                                          "cafe_id": "secret-cafe"}],
                })
                db.table = lambda name: FilteringQuery(name, db.tables.get(name, []), db.queries)
                response = client.get("/api/v1/users/alice/collections")
                self.assertEqual(response.status_code, 200)
                self.assertEqual([row["id"] for row in response.json()],
                                 ["visible"] if profile_public else [])
                self.assertNotIn("secret", response.text)
                if not profile_public:
                    self.assertEqual(db.queries_on("cafe_collections"), [])


class CollectionDetailAccessTests(unittest.TestCase):
    """Reading one collection by id needs both switches, not just the collection's."""

    def _client(self, collections_public, is_public):
        client, db = make_client(self, {
            "users": [{"id": "owner", "username": "alice",
                       "collections_public": collections_public}],
            "cafe_collections": [{"id": "c1", "user_id": "owner", "name": "Beans",
                                  "is_public": is_public, "icon_type": "custom",
                                  "created_at": "2026-09-15T00:00:00Z"}],
            "collection_items": [],
        }, user_id="someone-else")
        return client

    def test_a_private_profile_is_not_readable_by_id(self):
        response = self._client(collections_public=False, is_public=True).get(
            "/api/v1/collections/c1")
        self.assertEqual(response.status_code, 403)

    def test_a_hidden_collection_is_not_readable_by_id(self):
        response = self._client(collections_public=True, is_public=False).get(
            "/api/v1/collections/c1")
        self.assertEqual(response.status_code, 403)

    def test_both_switches_on_opens_it(self):
        response = self._client(collections_public=True, is_public=True).get(
            "/api/v1/collections/c1")
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
