"""The header search looks people up by either name they go by."""
import unittest

from test_visit_privacy import make_client


class UserSearchTests(unittest.TestCase):
    def test_matches_display_name_or_username_with_syntax_stripped(self):
        client, db = make_client(self, {"users": []})
        response = client.get("/api/v1/users/search", params={"query": "mi(n),%s"})
        self.assertEqual(response.status_code, 200)
        filters = [f for q in db.queries if q.table == "users" for f in q.filters]
        self.assertIn(
            ("or", "display_name.ilike.%mi n  s%,username.ilike.%mi n  s%", None),
            filters,
        )

    def test_operator_accounts_are_never_offered(self):
        client, db = make_client(self, {"users": []})
        client.get("/api/v1/users/search", params={"query": "adm"})
        filters = [f for q in db.queries if q.table == "users" for f in q.filters]
        self.assertIn(("not.in", "username", ("admin",)), filters)

    def test_two_letters_are_enough_only_in_hangul(self):
        for query, searched in (("민석", True), ("ab", False), ("a민", True)):
            with self.subTest(query=query):
                client, db = make_client(self, {"users": []})
                response = client.get("/api/v1/users/search", params={"query": query})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(bool([q for q in db.queries if q.table == "users"]), searched)

    def test_query_that_is_only_syntax_searches_nothing(self):
        client, db = make_client(self, {"users": [{"username": "alice"}]})
        response = client.get("/api/v1/users/search", params={"query": "%%%"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])
        self.assertFalse([q for q in db.queries if q.table == "users"])


if __name__ == "__main__":
    unittest.main()
