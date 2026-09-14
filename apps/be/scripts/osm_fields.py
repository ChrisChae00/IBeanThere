"""
OpenStreetMap tags to `cafes` columns.

One copy, because there were two: `seed_real_cafes.py` and
`update_osm_opening_hours.py` each carried their own `parse_osm_opening_hours`, and the
two had already drifted in formatting on their way to drifting in behaviour. Pure
functions only -- no Supabase client, no network -- so a script can import this and
still run with no credentials in the environment.
"""
import re
from urllib.parse import quote


def wikimedia_image_url(tags: dict) -> str | None:
    image = tags.get("image")
    if image and image.startswith("http"):
        return image
    commons = tags.get("wikimedia_commons")
    if commons:
        filename = commons.split(":", 1)[-1]
        return f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}"
    return None


def build_address(tags: dict) -> str | None:
    parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:city"),
        tags.get("addr:province"),
        tags.get("addr:postcode"),
    ]
    parts = [p for p in parts if p]
    return ", ".join(parts) if parts else None


DAY_MAP = {
    'mo': 'monday', 'tu': 'tuesday', 'we': 'wednesday', 'th': 'thursday',
    'fr': 'friday', 'sa': 'saturday', 'su': 'sunday'
}
DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
DAY_ABBRS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']


def parse_osm_opening_hours(raw_hours: str) -> dict | None:
    if not raw_hours or not isinstance(raw_hours, str):
        return None
    s = raw_hours.strip()
    if s == '24/7':
        return {d: {'open': '00:00', 'close': '24:00', 'closed': False} for d in DAYS_ORDER}
    result = {d: {'open': '', 'close': '', 'closed': True} for d in DAYS_ORDER}
    parts = [p.strip() for p in s.replace(';', ',').split(',') if p.strip()]
    parsed_any = False
    for part in parts:
        m = re.match(r'^([A-Za-z\s,-]+)\s+(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}|off|closed)$', part, re.IGNORECASE)
        if not m:
            continue
        days_part, time_part = m.group(1).lower().strip(), m.group(2).lower().strip()
        target_days = []
        for day_token in days_part.split():
            day_token = day_token.strip(',')
            if '-' in day_token:
                parts_d = day_token.split('-', 1)
                start_d, end_d = parts_d[0], parts_d[1]
                if start_d in DAY_ABBRS and end_d in DAY_ABBRS:
                    start_idx, end_idx = DAY_ABBRS.index(start_d), DAY_ABBRS.index(end_d)
                    if start_idx <= end_idx:
                        target_days.extend([DAYS_ORDER[i] for i in range(start_idx, end_idx + 1)])
                    else:
                        target_days.extend([DAYS_ORDER[i] for i in range(start_idx, 7)])
                        target_days.extend([DAYS_ORDER[i] for i in range(0, end_idx + 1)])
            elif day_token in DAY_MAP:
                target_days.append(DAY_MAP[day_token])
        if not target_days:
            continue
        if time_part in ('off', 'closed'):
            for d in target_days:
                result[d] = {'open': '', 'close': '', 'closed': True}
                parsed_any = True
        else:
            times = time_part.split('-')
            if len(times) == 2:
                open_t, close_t = times[0].strip().zfill(5), times[1].strip().zfill(5)
                for d in target_days:
                    result[d] = {'open': open_t, 'close': close_t, 'closed': False}
                    parsed_any = True
    return result if parsed_any else None
