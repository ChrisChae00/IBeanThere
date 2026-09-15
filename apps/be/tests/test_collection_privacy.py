"""Collection visibility, and the two folders every account is supposed to have."""
import unittest
from unittest.mock import Mock

from test_visit_privacy import OWNER, FakeQuery, FakeResult, make_client
from app.api.deps import get_current_user, get_optional_user
from app.main import app


class FilteringQuery(FakeQuery):
    """`FakeQuery` answers with whatever rows it holds; these endpoints filter."""

    def execute(self):
        # An insert into an empty table has no row to merge into, and the endpoint
        # treats an empty answer as a failure. Echo the payload instead.
        if self.op == "insert" and not self.rows:
            payload = self.payload if isinstance(self.payload, list) else [self.payload]
            return FakeResult([{"id": f"new-{row.get('icon_type')}",
                                "created_at": "2026-09-15T00:00:00Z", **row} for row in payload])
        for operation, field, value in self.filters:
            if operation == "eq":
                self.rows = [row for row in self.rows if row.get(field) == value]
        return super().execute()


class CollectionPrivacyTests(unittest.TestCase):
    def test_only_collection_visibility_controls_public_listing(self):
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
                                 ["visible"])
                self.assertNotIn("secret", response.text)


class CollectionDetailAccessTests(unittest.TestCase):
    """Private rows require ownership; public rows allow guests."""

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

    def test_legacy_profile_flag_does_not_hide_public_collection(self):
        response = self._client(collections_public=False, is_public=True).get(
            "/api/v1/collections/c1")
        self.assertEqual(response.status_code, 200)

    def test_a_hidden_collection_is_not_readable_by_id(self):
        response = self._client(collections_public=True, is_public=False).get(
            "/api/v1/collections/c1")
        self.assertEqual(response.status_code, 403)

    def test_public_collection_is_readable(self):
        response = self._client(collections_public=True, is_public=True).get(
            "/api/v1/collections/c1")
        self.assertEqual(response.status_code, 200)

    def test_guest_access(self):
        for public, status in ((True, 200), (False, 403)):
            client = self._client(collections_public=True, is_public=public)
            app.dependency_overrides[get_optional_user] = lambda: None
            self.assertEqual(client.get('/api/v1/collections/c1').status_code, status)


class SharedCopyTests(unittest.TestCase):
    def test_copy_uses_authenticated_owner_and_requires_auth_and_valid_token(self):
        client, db = make_client(self, {
            'cafe_collections': [{'id': 'copy', 'user_id': OWNER, 'name': 'Copy',
                'is_public': True, 'created_at': '2026-09-15T00:00:00Z'}],
            'collection_items': [],
        })
        db.rpc = Mock()
        db.rpc.return_value.execute.return_value = FakeResult('copy')
        response = client.post('/api/v1/collections/shared/token/copy', json={'target_user': 'victim'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['user_id'], OWNER)
        db.rpc.assert_called_once_with('copy_shared_collection', {'source_token': 'token', 'target_user': OWNER})
        db.rpc.return_value.execute.return_value = FakeResult(None)
        self.assertEqual(client.post('/api/v1/collections/shared/missing/copy').status_code, 404)
        del app.dependency_overrides[get_current_user]
        db.rpc.reset_mock()
        self.assertIn(client.post('/api/v1/collections/shared/token/copy').status_code, (401, 403))
        db.rpc.assert_not_called()


class DefaultCollectionsTests(unittest.TestCase):
    """The heart and the bookmark need somewhere visible to put things, from day one."""

    def test_a_new_account_still_lists_both_folders(self):
        client, db = make_client(self, {"cafe_collections": [], "collection_items": []})
        db.table = lambda name: FilteringQuery(name, db.tables.get(name, []), db.queries)

        response = client.get("/api/v1/collections")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([row["icon_type"] for row in response.json()],
                         ["favourite", "save_later"])
        self.assertTrue(all(row["item_count"] == 0 for row in response.json()))
        self.assertTrue(all(row["is_public"] for row in response.json()))

    def test_existing_folders_are_not_duplicated(self):
        client, db = make_client(self, {
            "cafe_collections": [
                {"id": "f", "user_id": OWNER, "name": "Favourites", "icon_type": "favourite",
                 "is_public": True, "position": 0, "created_at": "2026-09-01T00:00:00Z"},
                {"id": "s", "user_id": OWNER, "name": "Save for Later", "icon_type": "save_later",
                 "is_public": True, "position": 1, "created_at": "2026-09-01T00:00:00Z"},
            ],
            "collection_items": [],
        })
        db.table = lambda name: FilteringQuery(name, db.tables.get(name, []), db.queries)

        response = client.get("/api/v1/collections")

        self.assertEqual([row["id"] for row in response.json()], ["f", "s"])


if __name__ == "__main__":
    unittest.main()
