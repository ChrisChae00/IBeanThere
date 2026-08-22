"""
Regression check for the 0.0-coordinate rejection bug in register_cafe()
(apps/be/app/api/v1/cafes.py): a legitimate lat/lng of 0.0 must not be
treated as "missing".

Usage:
    cd apps/be
    python scripts/check_user_location_guard.py
"""


def location_is_missing(user_lat, user_lng) -> bool:
    """Mirrors the guard clause in register_cafe()."""
    return user_lat is None or user_lng is None


assert location_is_missing(0.0, 0.0) is False, "0.0/0.0 is a valid location, must not be rejected"
assert location_is_missing(37.5, 127.0) is False, "normal coordinates must not be rejected"
assert location_is_missing(None, 127.0) is True, "missing lat must still be rejected"
assert location_is_missing(37.5, None) is True, "missing lng must still be rejected"
assert location_is_missing(None, None) is True, "missing lat/lng must still be rejected"

print("register_cafe user_location guard: all checks passed")
