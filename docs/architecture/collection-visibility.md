# Collection visibility

Two switches decide whether anyone but the owner can read a collection, and both
have to agree.

| Switch | Column | What it means |
|---|---|---|
| Profile | `users.collections_public` | Publish my collections at all |
| Collection | `cafe_collections.is_public` | Include this one when they are published |

The profile switch is the coarse one and lives on the profile page. The collection
switch is the opt-out inside it and lives in the collection's own dialog, labelled
"Show on my profile" rather than "Public", because a collection is never public on
its own: turning the profile switch off hides everything regardless.

Both reads enforce the pair:

- `GET /api/v1/users/{username}/collections` filters on `is_public` after checking
  the owner's `collections_public`.
- `GET /api/v1/collections/{id}` refuses a non-owner unless both are true. Checking
  only the collection's flag let a private profile's rows be fetched by id.

Share links are a third, separate path: a share token grants access to one
collection regardless of either switch, because handing someone the link *is* the
permission. Revoking the link is what closes it.

`tests/test_collection_privacy.py` fixes both rules.

## Rollout

`is_public` shipped defaulting to `FALSE` with nothing able to set it: no API caller
sent the field and no screen offered it, so every stored row is `FALSE`. Enforcing
the pair without a backfill would therefore publish nothing at all, for everyone.

Apply `apps/be/scripts/migrations/026_collection_visibility.sql` **after 025**. It
sets existing rows to `TRUE` and moves the column default to `TRUE`. Nothing chosen
is overwritten, because nobody could choose. After it, the profile switch means what
it meant before, and the per-collection switch is a real opt-out.
