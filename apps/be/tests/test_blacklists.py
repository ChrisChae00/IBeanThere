"""API guards are exercised without network calls; SQL behavior has its own check."""
import asyncio
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock
from uuid import UUID

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi import HTTPException
from app.api.deps import get_current_user, require_admin_role
from app.api.v1.moderation import set_user, UserDecision
from app.services.blacklists import filter_seed_candidates
from app.api.v1.cafes import get_pending_cafes, get_all_cafes_admin, admin_delete_cafe
from test_visit_privacy import FakeSupabase


class BlacklistTests(unittest.TestCase):
    def client(self, rows):
        db = Mock()
        db.auth.get_user.return_value = SimpleNamespace(user=SimpleNamespace(id='user-1'))
        query = db.table.return_value
        query.select.return_value = query
        query.eq.return_value = query
        query.limit.return_value = query
        query.execute.return_value = SimpleNamespace(data=rows)
        return db, query

    def test_blocked_valid_token_is_denied(self):
        db, _ = self.client([{'user_id': 'user-1'}])
        with self.assertRaises(HTTPException) as err:
            asyncio.run(get_current_user(SimpleNamespace(credentials='valid'), db))
        self.assertEqual(err.exception.status_code, 403)

    def test_status_failure_does_not_allow_writes(self):
        db, query = self.client([])
        query.execute.side_effect = RuntimeError('offline')
        with self.assertRaises(HTTPException) as err:
            asyncio.run(get_current_user(SimpleNamespace(credentials='valid'), db))
        self.assertEqual(err.exception.status_code, 503)

    def test_admin_cannot_be_blacklisted(self):
        db, _ = self.client([{'role': 'admin'}])
        with self.assertRaises(HTTPException) as err:
            set_user(UUID(int=1), UserDecision(status='blocked', reason='test'), db)
        self.assertEqual(err.exception.status_code, 400)
        db.table.return_value.upsert.assert_not_called()

    def test_non_admin_denied(self):
        with self.assertRaises(HTTPException) as err:
            asyncio.run(require_admin_role(SimpleNamespace(role='user')))
        self.assertEqual(err.exception.status_code, 403)

    def test_seed_skip_and_failure(self):
        db = Mock()
        db.rpc.return_value.execute.side_effect = [SimpleNamespace(data='history-id'), SimpleNamespace(data=None)]
        self.assertEqual(filter_seed_candidates(db, [{'name': 'deleted'}, {'name': 'new'}]), [{'name': 'new'}])
        db.rpc.return_value.execute.side_effect = RuntimeError('offline')
        with self.assertRaises(RuntimeError):
            filter_seed_candidates(db, [{'name': 'unknown'}])

    def test_admin_lists_mark_history_and_search_both_queries(self):
        db = FakeSupabase({'cafes': [{
            'id': 'cafe-1', 'name': 'Reopened', 'latitude': 43.45, 'longitude': -80.49,
            'status': 'pending', 'blacklist_history_id': 'history-1',
        }]})
        result = asyncio.run(get_pending_cafes(current_user=SimpleNamespace(role='admin'), supabase=db))
        self.assertTrue(result.cafes[0].has_deletion_history)
        db.queries.clear()
        result = asyncio.run(get_all_cafes_admin(
            page=1, page_size=20, q='Reopened,()%*', cafe_status=None, brand_status=None,
            current_user=SimpleNamespace(role='admin'), supabase=db,
        ))
        self.assertTrue(result.cafes[0].has_deletion_history)
        self.assertEqual(result.total_count, 1)
        for query in db.queries_on('cafes'):
            self.assertIn(('or', 'name.ilike.%Reopened%,address.ilike.%Reopened%', None), query.filters)

    def test_admin_deletion_uses_atomic_rpc(self):
        db = Mock()
        db.rpc.return_value.execute.return_value = SimpleNamespace(data=True)
        result = asyncio.run(admin_delete_cafe('cafe-1', SimpleNamespace(role='admin'), db))
        self.assertEqual(result['cafe_id'], 'cafe-1')
        db.rpc.assert_called_once_with('delete_cafe_with_history', {'target': 'cafe-1'})
        db.table.assert_not_called()
