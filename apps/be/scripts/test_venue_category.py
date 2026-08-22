"""
Unit checks for the coffee-only venue classifier. No network.

Usage:
    cd apps/be
    python scripts/test_venue_category.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services import venue_category as vc


def check(label, got, want):
    ok = got == want
    print(f"{'✅' if ok else '❌'} {label} (got {got!r}, want {want!r})")
    return ok


def test_bubble_tea_excluded():
    return check("cuisine=bubble_tea is excluded",
                 vc.classify_venue({"cuisine": "bubble_tea"}), vc.EXCLUDED)


def test_coffee_shop_passes():
    return check("cuisine=coffee_shop passes",
                 vc.classify_venue({"cuisine": "coffee_shop"}), vc.COFFEE)


def test_coffee_wins_over_tea():
    return check("a place serving both coffee and bubble tea passes",
                 vc.classify_venue({"cuisine": "bubble_tea;coffee_shop"}), vc.COFFEE)


def test_multi_value_cuisine_parsed():
    return check("semicolon-separated cuisine is split",
                 vc.classify_venue({"cuisine": "breakfast;coffee_shop;sandwich"}), vc.COFFEE)


def test_juice_excluded():
    return check("cuisine=juice is excluded",
                 vc.classify_venue({"cuisine": "juice"}), vc.EXCLUDED)


def test_donut_is_not_excluded():
    return check("donut shops are kept (they sell coffee)",
                 vc.classify_venue({"cuisine": "donut"}), vc.UNKNOWN)


def test_missing_tags_are_unknown():
    results = [
        vc.classify_venue(None),
        vc.classify_venue({}),
        vc.classify_venue({"amenity": "cafe"}),
        vc.classify_venue({"cuisine": ""}),
    ]
    return check("absent or empty cuisine is unknown, never a rejection",
                 set(results), {vc.UNKNOWN})


def test_traits_roastery_and_bakery():
    roastery = vc.derive_traits({"craft": "coffee_roastery", "cuisine": "coffee_shop"})
    bakery = vc.derive_traits({"shop": "bakery"})
    beans = vc.derive_traits({"shop": "coffee"})
    ok = ("roastery" in roastery and "coffee" in roastery
          and bakery == ["bakery"] and beans == ["sells_beans"])
    print(f"{'✅' if ok else '❌'} traits: roastery={roastery}, bakery={bakery}, beans={beans}")
    return ok


def test_traits_empty_not_none():
    got = vc.derive_traits(None)
    return check("no tags yields an empty list, not None", got, [])


def test_traits_do_not_change_the_verdict():
    tags = {"cuisine": "dessert", "shop": "confectionery"}
    ok = "dessert" in vc.derive_traits(tags) and vc.classify_venue(tags) == vc.UNKNOWN
    print(f"{'✅' if ok else '❌'} a dessert trait does not by itself exclude a venue")
    return ok


def main():
    tests = [
        test_bubble_tea_excluded,
        test_coffee_shop_passes,
        test_coffee_wins_over_tea,
        test_multi_value_cuisine_parsed,
        test_juice_excluded,
        test_donut_is_not_excluded,
        test_missing_tags_are_unknown,
        test_traits_roastery_and_bakery,
        test_traits_empty_not_none,
        test_traits_do_not_change_the_verdict,
    ]
    results = [test() for test in tests]
    passed = sum(results)
    print(f"\n{passed}/{len(results)} passed")
    sys.exit(0 if passed == len(results) else 1)


if __name__ == "__main__":
    main()
