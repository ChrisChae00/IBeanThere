from timezonefinder import TimezoneFinder
from typing import Optional

_tf = TimezoneFinder()


def get_timezone_from_coords(latitude: float, longitude: float) -> Optional[str]:
    """Return IANA timezone string for the given coordinates, or None if not found."""
    return _tf.timezone_at(lat=latitude, lng=longitude)
