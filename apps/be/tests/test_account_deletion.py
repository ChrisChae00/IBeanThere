"""Run: python -m unittest discover -s tests -p test_account_deletion.py"""
import unittest
import asyncio
from types import SimpleNamespace
from unittest.mock import Mock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.api.v1.users import router
from app.api.deps import get_supabase_client, get_current_user
from fastapi import HTTPException
from app.services.account_deletion import delete_account


class AccountDeletionTests(unittest.TestCase):
    def setUp(self):
        self.db = Mock()
        self.db.auth.get_user.return_value = SimpleNamespace(user=SimpleNamespace(id='owner'))
        self.db.rpc.return_value.execute.return_value = SimpleNamespace(data=[])
        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[get_supabase_client] = lambda: self.db
        self.client = TestClient(app)
        self.headers = {'Authorization': 'Bearer valid'}

    def test_requires_auth_and_explicit_confirmation_and_rejects_target(self):
        self.assertIn(self.client.request('DELETE', '/users/me', json={'confirmation': 'DELETE'}).status_code, (401, 403))
        for body in ({}, {'confirmation': 'delete'}, {'confirmation': 'DELETE', 'user_id': 'victim'}):
            self.assertEqual(self.client.request('DELETE', '/users/me', headers=self.headers, json=body).status_code, 422)
        self.db.auth.admin.delete_user.assert_not_called()

    def test_only_deletes_authenticated_owner_after_all_file_batches(self):
        self.db.rpc.return_value.execute.side_effect = [
            SimpleNamespace(data=[{'bucket_id': 'avatars', 'name': 'owner/a.jpg'}]),
            SimpleNamespace(data=[{'bucket_id': 'reports', 'name': 'owner/nested/b.jpg'}]),
            SimpleNamespace(data=[]),
        ]
        response = self.client.request('DELETE', '/users/me', headers=self.headers, json={'confirmation': 'DELETE'})
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b'')
        self.db.auth.admin.delete_user.assert_called_once_with('owner')
        self.assertEqual(self.db.storage.from_.return_value.remove.call_count, 2)
        for call in self.db.rpc.call_args_list:
            self.assertEqual(call.args, ('account_deletion_files', {'target': 'owner'}))

    def test_storage_failure_is_retryable_and_does_not_delete_auth(self):
        self.db.rpc.return_value.execute.return_value = SimpleNamespace(data=[{'bucket_id': 'avatars', 'name': 'owner/a'}])
        self.db.storage.from_.return_value.remove.side_effect = RuntimeError('storage unavailable')
        response = self.client.request('DELETE', '/users/me', headers=self.headers, json={'confirmation': 'DELETE'})
        self.assertEqual(response.status_code, 503)
        self.db.auth.admin.delete_user.assert_not_called()
        self.db.storage.from_.return_value.remove.side_effect = None
        self.db.rpc.return_value.execute.return_value = SimpleNamespace(data=[])
        self.assertEqual(self.client.request('DELETE', '/users/me', headers=self.headers, json={'confirmation': 'DELETE'}).status_code, 204)

    def test_no_progress_or_bad_inventory_fails_closed(self):
        for files in (None, [{'bucket_id': 'avatars', 'name': 'owner/a'}]):
            self.db.rpc.return_value.execute.return_value = SimpleNamespace(data=files)
            with self.assertRaises(RuntimeError):
                delete_account(self.db, 'owner')
        self.db.auth.admin.delete_user.assert_not_called()

    def test_pending_account_cannot_use_normal_api(self):
        query = Mock()
        query.select.return_value = query
        query.eq.return_value = query
        query.limit.return_value = query
        query.execute.side_effect = [SimpleNamespace(data=[]), SimpleNamespace(data=[{'user_id': 'owner'}])]
        self.db.table.return_value = query
        with self.assertRaises(HTTPException) as error:
            asyncio.run(get_current_user(SimpleNamespace(credentials='valid'), self.db))
        self.assertEqual(error.exception.status_code, 403)

    def test_invalid_token_never_starts_deletion(self):
        self.db.auth.get_user.side_effect = RuntimeError('expired')
        response = self.client.request('DELETE', '/users/me', headers=self.headers, json={'confirmation': 'DELETE'})
        self.assertEqual(response.status_code, 401)
        self.db.table.assert_not_called()


if __name__ == '__main__':
    unittest.main()
