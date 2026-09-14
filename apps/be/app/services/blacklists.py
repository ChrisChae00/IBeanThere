"""Seed checks use the same database matcher as user re-registration."""


def is_blacklisted(db, candidate):
    # Lookup errors must stop the seed, not silently restore a deleted cafe.
    fields = ("name", "address", "latitude", "longitude", "osm_id", "google_place_id", "source_url")
    return bool(db.rpc("match_cafe_blacklist", {
        "candidate": {key: candidate.get(key) for key in fields},
    }).execute().data)


def filter_seed_candidates(db, candidates):
    return [row for row in candidates if not is_blacklisted(db, row)]
