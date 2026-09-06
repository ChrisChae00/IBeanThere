"""Nominatim's display_name carries administrative levels no envelope uses."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.osm_service import format_address


def test_drops_county_and_state_district():
    waterloo = {
        "name": "The Bevel",
        "display_name": (
            "The Bevel, 12, Merchant Avenue, The Barrel Yards, Waterloo, "
            "Region of Waterloo, Southwestern Ontario, Ontario, N2L 0C3, Canada"
        ),
        "address": {
            "amenity": "The Bevel",
            "house_number": "12",
            "road": "Merchant Avenue",
            "neighbourhood": "The Barrel Yards",
            "city": "Waterloo",
            "county": "Region of Waterloo",
            "state_district": "Southwestern Ontario",
            "state": "Ontario",
            "postcode": "N2L 0C3",
            "country": "Canada",
        },
    }
    assert format_address(waterloo) == (
        "The Bevel, 12 Merchant Avenue, Waterloo, Ontario, N2L 0C3, Canada"
    )


def test_falls_back_through_the_settlement_keys():
    village = {
        "address": {
            "road": "Main Street",
            "village": "Elora",
            "state": "Ontario",
            "country": "Canada",
        }
    }
    assert format_address(village) == "Main Street, Elora, Ontario, Canada"


def test_empty_payload_is_an_empty_string():
    assert format_address({}) == ""


if __name__ == "__main__":
    test_drops_county_and_state_district()
    test_falls_back_through_the_settlement_keys()
    test_empty_payload_is_an_empty_string()
    print("ok")
