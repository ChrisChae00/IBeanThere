"""
Which badges a person has earned, and the one place that decides.

Badges here work the way GitHub's do: earned once, kept, no ranking between people.
Nothing is taken away when somebody else does more, and nothing is a leaderboard --
the point is to mark that you did a thing, not to say you did it better.

`regular_*` is the new one, and it deliberately reuses the bean drop that already
exists rather than inventing a second notion of "came back". `cafe_beans.growth_level`
goes above 1 at three drops, so a cafe at level 2 or higher is one this person
returned to. Counting cafes, not drops: twenty visits to one cafe is a regular of one
place, and that is what the badge should say.

Awarding never blocks the action it follows. Every caller wraps this in try/except --
a badge that fails to insert must not lose somebody's coffee log.
"""
import logging
from collections import defaultdict
from typing import List

logger = logging.getLogger(__name__)

# growth_level 2 is reached at three drops (see calculate_growth_level): the third
# visit is the first one that cannot be a coincidence.
REGULAR_LEVEL = 2

# Cafes-you-are-a-regular-at thresholds, and the badge each one earns.
REGULAR_THRESHOLDS = ((15, "regular_15"), (5, "regular_5"), (1, "regular_1"))


def regular_cafe_count(supabase, user_id: str) -> int:
    """How many cafes this person has come back to."""
    result = supabase.table("cafe_beans").select("id").eq(
        "user_id", user_id
    ).gte("growth_level", REGULAR_LEVEL).execute()
    return len(result.data or [])


def founding_stats(supabase, user_id: str) -> dict:
    """
    The two numbers a profile shows about what somebody has built.

    This used to be `{navigator_count, vanguard_count}`, computed by four copies of
    the same pair of queries. Vanguard is gone -- it ranked the second and third
    person through the door against the first, which is a race nobody entered -- and
    `regular_count` took its place, which is about coming back rather than arriving.
    """
    navigators = supabase.table("cafes").select("id", count="exact").eq(
        "navigator_id", user_id
    ).execute()
    return {
        "navigator_count": navigators.count or 0,
        "regular_count": regular_cafe_count(supabase, user_id),
    }


def _second_home(visits: list) -> bool:
    """Five logs at one cafe on five different days."""
    days_by_cafe = defaultdict(set)
    for visit in visits:
        visited_at = visit.get("visited_at")
        if visited_at:
            days_by_cafe[visit["cafe_id"]].add(visited_at[:10])
    return any(len(days) >= 5 for days in days_by_cafe.values())


def award_badges(supabase, user_id: str) -> List[str]:
    """
    Award every badge this person now qualifies for. Returns the new codes.

    Safe to call as often as you like: each badge is checked against what is already
    stored and only the missing ones are written.
    """
    existing = supabase.table("user_badges").select("badge_code").eq(
        "user_id", user_id
    ).execute()
    earned = {row["badge_code"] for row in (existing.data or [])}

    newly_awarded = []

    def grant(code: str):
        supabase.table("user_badges").insert({
            "user_id": user_id,
            "badge_code": code,
        }).execute()
        earned.add(code)
        newly_awarded.append(code)

    if "bean_sprout" not in earned:
        logs = supabase.table("cafe_visits").select("id", count="exact").eq(
            "user_id", user_id
        ).execute()
        if (logs.count or 0) >= 1:
            grant("bean_sprout")

    if "cafe_explorer" not in earned:
        # Navigators only now. This used to add the vanguard count, so it could be
        # earned by being second through five doors -- the threshold is effectively
        # higher, and it now means what its name says: you put five cafes on the map.
        cafes = supabase.table("cafes").select("id", count="exact").eq(
            "navigator_id", user_id
        ).execute()
        if (cafes.count or 0) >= 5:
            grant("cafe_explorer")

    if "coffee_connoisseur" not in earned:
        trust = supabase.table("user_trust").select("id", count="exact").eq(
            "trustee_id", user_id
        ).execute()
        if (trust.count or 0) >= 10:
            grant("coffee_connoisseur")

    if "second_home" not in earned:
        visits = supabase.table("cafe_visits").select("cafe_id, visited_at").eq(
            "user_id", user_id
        ).execute()
        if _second_home(visits.data or []):
            grant("second_home")

    # All three regular badges are checked, not just the highest: somebody whose
    # count jumps past a threshold should still hold the ones below it.
    missing_regular = [code for _, code in REGULAR_THRESHOLDS if code not in earned]
    if missing_regular:
        count = regular_cafe_count(supabase, user_id)
        for threshold, code in REGULAR_THRESHOLDS:
            if code in missing_regular and count >= threshold:
                grant(code)

    return newly_awarded


def award_badges_quietly(supabase, user_id: str) -> None:
    """
    `award_badges`, for callers whose real work has already succeeded.

    A badge is a decoration on something that already happened. If awarding it throws,
    the coffee log or the bean drop still stands and the person still gets their
    response -- they will pick the badge up on the next action that checks.
    """
    try:
        award_badges(supabase, user_id)
    except Exception:
        logger.warning("Badge award failed for user %s", user_id, exc_info=True)
