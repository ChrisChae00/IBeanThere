# Settings and account deletion

Settings follows the existing editorial design language: ruled sections, semantic
colour tokens and native theme/language selects. Account identity, password management,
record management and policy links are available in English and Korean. OAuth-only
accounts are directed to their provider for password management.

## Release order

Apply `apps/be/scripts/migrations/024_account_deletion.sql` **after 022 and before the
backend release**. The authenticated API guard now reads `account_deletion_requests`;
an absent table deliberately returns 503. No accounts are removed by the migration.
Deploy backend and frontend after verifying the migration. Do not roll the database
back while any deletion requests remain unfinished.

## Deletion flow

1. The user types `DELETE` and submits the confirmation dialog.
2. A server action forwards their session token and confirmation to `DELETE /users/me`.
   The API validates the token with Auth and derives the target; supplied IDs are rejected.
   Blocked accounts may also delete themselves.
3. Persist deletion intent. Existing restrictive RLS policies and the authenticated API
   guard deny further app access while removal is in progress. The delete endpoint stays
   available for retries. A user may return to Settings to retry after refreshing.
4. A service-only RPC enumerates up to 100 Storage objects by owner or the app's user
   folder convention. Remove each batch using the Storage API, not SQL metadata deletion.
   A failed batch stops before Auth deletion; repeated calls resume remaining files.
5. Auth admin deletion removes the account and FK-dependent records atomically. A trigger
   removes the crew ID and owned cover URL from shared cafes. The reviewer FK in fraud
   logs is changed to SET NULL; shared cafe/bean/roaster entities remain.
6. The server action invalidates cafe/detail and trending caches, then the browser clears
   its local session and shows completion. RLS rejects even an unexpired deleted-user JWT.

Storage and Auth are separate services: deletion is not an all-or-nothing transaction
across both. Once started, files already removed cannot be restored; errors explicitly
ask the user to retry. The persisted intent must not be cleared to cancel a partial run.
There is no background worker; support can resume an unfinished request through the
same `delete_account` service with the recorded ID after confirming the request.

## Verification

```sh
cd apps/be
.venv/bin/python -m unittest discover -s tests
# An EMPTY DISPOSABLE PostgreSQL instance only (creates roles and fixture schemas):
psql -v ON_ERROR_STOP=1 -f tests/check_account_deletion.sql "$TEST_DATABASE_URL"
```

The SQL fixture verifies file inventory isolation, RPC permissions, cascade removal,
shared cafe preservation, reviewer detachment and rejection of pending/deleted IDs.
It does not establish the state of production FKs, triggers or policies. Before live
rollout inspect those constraints, then exercise a newly created disposable account
with an upload and a personal record; never use an existing user's account for this test.
