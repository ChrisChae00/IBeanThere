"""
Coffee traits: what a cafe is, according to the people who went there.

The model is an **observation**, not a vote. Three questions decide the design:

- *Can it say a place stopped?* A vote count cannot. Withdrawing your own yes leaves
  everyone else's older yes standing, so the tally grows more confident as it grows
  more wrong. An observation carries a `value`, so "no, not any more" is sayable.
- *When was it true?* `observed_at` is the day it was seen; `created_at` is the day it
  was typed. Someone writing up last month's trip must not look like today's evidence.
- *Who is claiming it?* A user observation and a row we seeded from a spreadsheet are
  not the same kind of statement, so they never share a count.

The rule is deliberately blunt: **the newest user observation is the state.** One
person saying "no" today outranks five people who said "yes" last year. That is the
intended behaviour early on, and it means one registered account can drop a cafe out
of a filter. Revisit it when there are enough observations for that to matter.

Nothing is stored precomputed. The state is derived on every read, so deleting an
observation takes effect immediately with no cache to invalidate.

**Evidence decides whether a claim waits.** Registering a cafe means passing a 100m
check while standing in it; logging a purchase means having just bought the bag. Those
write `approved` rows and count at once. A claim made from the cafe page carries no
such evidence -- the reader may never have been there -- so it is written `pending`
and counts for nothing until a person approves it. `summarise` enforces that here
rather than trusting each caller's query to remember the filter.
"""
import logging
from datetime import date
from typing import Any, Dict, Iterable, List, Optional

logger = logging.getLogger(__name__)

# Order is the reading order on the page. The two that take a note come first, because
# "yes, and here is which" is a fuller answer than a bare yes, and a reader scanning for
# somewhere to buy coffee wants those two before they want the roasting question.
TRAITS = ("sells_beans", "filter_coffee", "roasts_on_site")

# Only these two have a follow-up question worth asking. "Roasts on site" is answered by
# yes or no; an empty box under it would just invite filling.
NOTE_TRAITS = ("sells_beans", "filter_coffee")

NOTE_MAX_LENGTH = 200

APPROVED = "approved"
PENDING = "pending"

# Every column the aggregation reads. One list, so a caller cannot select a subset that
# silently drops `status` and starts counting suggestions.
OBSERVATION_COLUMNS = "trait, value, source, user_id, observed_at, created_at, status, note"


def is_valid_trait(trait: str) -> bool:
    return trait in TRAITS


def clean_note(trait: str, value: bool, note: Optional[str]) -> Optional[str]:
    """
    The note as it may be stored, or None.

    A note only means anything attached to a yes on one of the two traits that take
    one: "no, and here is which beans" is not a sentence. Anything else is dropped
    rather than refused -- the claim is still worth recording without it.
    """
    if not note or trait not in NOTE_TRAITS or value is not True:
        return None
    cleaned = " ".join(note.split())[:NOTE_MAX_LENGTH].strip()
    return cleaned or None


def check_observed_at(observed_at: Optional[date]) -> Optional[date]:
    """
    Reject a future observation date.

    Without this, one row dated 2099 wins every ordering below forever.
    """
    if observed_at is not None and observed_at > date.today():
        raise ValueError("observed_at cannot be in the future")
    return observed_at


def _sort_key(row: Dict[str, Any]):
    """Newest observation first: by the day it was seen, then by when it was written."""
    return (row.get("observed_at") or "", row.get("created_at") or "")


def summarise(
    rows: Iterable[Dict[str, Any]],
    viewer_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Turn raw observation rows into one summary per trait.

    `rows` is every observation for one cafe. Returns a list in `TRAITS` order:

        {trait, yes, no, latest_value, last_observed_at, seed_value,
         seed_observed_at, mine}

    - `yes`/`no` count **people**, not rows: each user contributes their most recent
      observation and nothing older.
    - `latest_value` is that same set's newest entry. It falls back to the seed row
      only when no user has said anything.
    - `mine` is the viewer's own current answer, or None. It is computed here, from
      the same rows, so the button a reader sees can never disagree with the count
      beside it.

    No `user_id` appears in the output.
    """
    # Filtered here, not left to the caller's `.eq()`. A pending row is a request to
    # change the record, not a change to it, and one endpoint forgetting the clause
    # would publish unreviewed claims as counts.
    rows = [r for r in rows if r.get("status", APPROVED) == APPROVED]
    by_trait: Dict[str, List[Dict[str, Any]]] = {t: [] for t in TRAITS}
    for row in rows:
        trait = row.get("trait")
        if trait in by_trait:
            by_trait[trait].append(row)

    summaries = []
    for trait in TRAITS:
        trait_rows = by_trait[trait]

        # One observation per person: their latest.
        latest_by_user: Dict[str, Dict[str, Any]] = {}
        for row in sorted((r for r in trait_rows if r.get("source") == "user"), key=_sort_key):
            latest_by_user[row["user_id"]] = row

        current = list(latest_by_user.values())
        yes = sum(1 for r in current if r.get("value"))
        no = len(current) - yes

        newest_user = max(current, key=_sort_key) if current else None

        seed_rows = [r for r in trait_rows if r.get("source") == "seed"]
        newest_seed = max(seed_rows, key=_sort_key) if seed_rows else None

        # A person who went there outranks a spreadsheet, however recent the
        # spreadsheet is. The seed only speaks when nobody else has.
        state = newest_user or newest_seed

        mine = latest_by_user.get(viewer_id) if viewer_id else None

        summaries.append({
            "trait": trait,
            "yes": yes,
            "no": no,
            "latest_value": state.get("value") if state else None,
            "last_observed_at": newest_user.get("observed_at") if newest_user else None,
            "seed_value": newest_seed.get("value") if newest_seed else None,
            "seed_observed_at": newest_seed.get("observed_at") if newest_seed else None,
            "mine": mine.get("value") if mine else None,
            # The note belongs to the observation that is currently the state, not to
            # whichever row happens to have one. A note left on a claim that has since
            # been superseded describes a cafe that has moved on.
            "note": state.get("note") if state else None,
        })

    return summaries


def flags(rows: Iterable[Dict[str, Any]]) -> Dict[str, bool]:
    """
    The map and search shape: `{trait: True}` only where the current state is yes.

    This is what a filter chip reads. Unknown and "no" are both False -- a filter
    promises the places that ARE something, so it must not offer up the ones nobody
    has checked.
    """
    return {
        s["trait"]: s["latest_value"] is True
        for s in summarise(rows)
    }


def load_flags(supabase, cafe_ids: List[str]) -> Dict[str, Dict[str, bool]]:
    """
    `{cafe_id: {trait: bool}}` for a page of cafes, in one query.

    One query for the whole page, not one per cafe: a 50-result map view would
    otherwise open 50 connections to answer a question about three booleans.

    Returns `{}` on failure rather than raising. A filter chip that shows nothing is
    a worse day than a search that returns no cafes at all.
    """
    if not cafe_ids:
        return {}

    try:
        result = supabase.table("cafe_trait_observations").select(
            f"cafe_id, {OBSERVATION_COLUMNS}"
        ).in_("cafe_id", cafe_ids).eq("status", APPROVED).execute()
    except Exception:  # pragma: no cover - network shape
        return {}

    by_cafe: Dict[str, List[Dict[str, Any]]] = {}
    for row in result.data or []:
        by_cafe.setdefault(row["cafe_id"], []).append(row)

    return {cafe_id: flags(rows) for cafe_id, rows in by_cafe.items()}


def record_observation(
    supabase,
    cafe_id: str,
    trait: str,
    value: bool,
    user_id: str,
    observed_at: Optional[date] = None,
    status: str = APPROVED,
    note: Optional[str] = None,
) -> None:
    """
    Write one user observation.

    `status` is the caller's to decide and never the client's: it is set from which
    surface the claim came through, not from anything in the request body. Registering
    a cafe and logging a purchase pass `APPROVED`; the cafe page passes `PENDING`.
    """
    supabase.table("cafe_trait_observations").insert({
        "cafe_id": cafe_id,
        "trait": trait,
        "value": value,
        "source": "user",
        "user_id": user_id,
        "observed_at": (observed_at or date.today()).isoformat(),
        "status": status,
        "note": clean_note(trait, value, note),
    }).execute()


def record_observations_quietly(
    supabase,
    cafe_id: str,
    values: Dict[str, bool],
    user_id: str,
) -> None:
    """
    Record what somebody reported while doing something else, and never fail them for it.

    Used by cafe registration and by saving a bean purchase. Both have already
    succeeded by the time this runs; a trait that will not insert must not take the
    cafe or the log down with it.
    """
    for trait, value in (values or {}).items():
        if not is_valid_trait(trait) or value is None:
            continue
        try:
            record_observation(supabase, cafe_id, trait, bool(value), user_id)
        except Exception:  # pragma: no cover - network shape
            logger.warning(
                "Trait observation failed (%s on cafe %s)", trait, cafe_id, exc_info=True
            )
