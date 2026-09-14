"""
The shape of a coffee log, in one place.

Two things kept getting out of step across `api/v1/visits.py` and `api/v1/cafes.py`:

1. **What counts as a public log.** It used to be `is_public AND rating IS NOT NULL`,
   written out at each call site. A bought bag has no rating until it is brewed at
   home, so that condition silently hid every purchase. Fixing it in the list query
   but not in the count query gives a page that says "12 logs" and shows 9.
2. **Which columns to select.** The list query names its columns in one long hand
   written string. PostgREST answers an unknown column with an error, but a column
   that was renamed elsewhere and forgotten here just stops arriving — the field goes
   null and nothing complains.

Both live here now.
"""
from typing import Any, Dict, Optional

# Columns every log read needs, plus the bean it points at.
#
# `beans(...)` and the nested `roasters(name)` are PostgREST embeds over the two
# foreign keys added in migration 016. The nested select is deliberately narrow:
# `beans.created_by` is the id of whoever first added that bean to the catalogue,
# and it must not travel out on a log written by someone else.
LOG_COLUMNS = (
    "id, cafe_id, visited_at, mode, rating, comment, photo_urls, coffee_type, "
    "dessert, price, price_currency, anonymous, updated_at, user_id, "
    "atmosphere_rating, atmosphere_tags, acidity_rating, body_rating, "
    "sweetness_rating, bitterness_rating, aftertaste_rating, aroma_rating, "
    "overall_taste_rating, bean_id, bean_name_raw, want_again, "
    "beans(id, name, roasters(name))"
)

# PostgREST `or` syntax. A log is public when its author said so AND it says
# something: a rating for a cup, or the fact of a purchase.
_PUBLIC_OR = "rating.not.is.null,mode.eq.purchase"


def public_logs(query):
    """
    Narrow a `cafe_visits` query to the logs a stranger may see.

    Apply this to the list query, the count query and every aggregate over logs.
    A filter that is not applied everywhere is a filter that leaks.
    """
    return query.eq("is_public", True).or_(_PUBLIC_OR)


def bean_ref(visit: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Flatten the embedded bean into `{id, name, roaster_name}`, or None.

    PostgREST returns the embed as a nested object (or a one-element list, depending
    on how it reads the relationship), so both shapes are handled here rather than at
    each call site.
    """
    bean = visit.get("beans")
    if isinstance(bean, list):
        bean = bean[0] if bean else None
    if not bean:
        return None

    roaster = bean.get("roasters")
    if isinstance(roaster, list):
        roaster = roaster[0] if roaster else None

    return {
        "id": bean.get("id"),
        "name": bean.get("name"),
        "roaster_name": roaster.get("name") if roaster else None,
    }


def with_bean(visit: Dict[str, Any]) -> Dict[str, Any]:
    """
    A log row ready to hand to a response model: the raw row plus a flat `bean`,
    without the nested embed.

    Handing the row through instead of copying 25 fields by name is the point — the
    response models prune what they do not declare, so adding a column is one edit
    rather than four.
    """
    out = {k: v for k, v in visit.items() if k != "beans"}
    out["bean"] = bean_ref(visit)
    return out
