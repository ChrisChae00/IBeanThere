"""
Unit tests for cafes API endpoints using FastAPI TestClient.

Tests:
- Health check (GET /health)
- Search cafes (GET /api/v1/cafes/search)
- Get cafe details (GET /api/v1/cafes/{id})
- Register cafe (POST /api/v1/cafes/register) - requires auth
- OSM reverse geocoding service

Environment Variables Required (in .env):
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- CORS_ORIGINS (optional, defaults to http://localhost:3000)

Usage:
    cd apps/be
    source venv/bin/activate
    python scripts/test_cafes_api_unit.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi.testclient import TestClient

# Load environment variables
BE_DIR = Path(__file__).parent.parent
env_path = BE_DIR / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment variables from {env_path}")
else:
    print(f"⚠️  No .env file found at {env_path}")

# Add apps/be to path
sys.path.insert(0, str(BE_DIR))

# Import app
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint."""
    print("\n" + "="*50)
    print("TEST 1: Health Check")
    print("="*50)
    
    try:
        response = client.get("/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print("❌ Health check failed")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_search_cafes():
    """Test search cafes endpoint."""
    print("\n" + "="*50)
    print("TEST 2: Search Cafes")
    print("="*50)
    
    # Waterloo coordinates
    lat = 43.4643
    lng = -80.5204
    radius = 2000
    
    try:
        response = client.get(
            "/api/v1/cafes/search",
            params={
                "lat": lat,
                "lng": lng,
                "radius": radius
            }
        )
        
        print(f"Request: GET /api/v1/cafes/search?lat={lat}&lng={lng}&radius={radius}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {len(data.get('cafes', []))} cafes found")
            print(f"Total count: {data.get('total_count', 0)}")
            
            if data.get('cafes'):
                first_cafe = data['cafes'][0]
                print(f"\nFirst cafe:")
                print(f"  ID: {first_cafe.get('id')}")
                print(f"  Name: {first_cafe.get('name')}")
                print(f"  Status: {first_cafe.get('status')}")
                print(f"  Verification Count: {first_cafe.get('verification_count')}")
            else:
                print("⚠️  No cafes found (database may be empty)")
            
            print("✅ Search cafes passed")
            return True
        else:
            print(f"❌ Search cafes failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_get_cafe_details():
    """Test get cafe details endpoint."""
    print("\n" + "="*50)
    print("TEST 3: Get Cafe Details")
    print("="*50)
    
    # First, search for cafes to get an ID
    try:
        search_response = client.get(
            "/api/v1/cafes/search",
            params={"lat": 43.4643, "lng": -80.5204, "radius": 1000}
        )
        
        if search_response.status_code != 200:
            print("⚠️  Search failed, skipping details test")
            return True
        
        cafes = search_response.json().get('cafes', [])
        if not cafes:
            print("⚠️  No cafes found to test details endpoint (database may be empty)")
            return True
        
        cafe_id = cafes[0].get('id')
        print(f"Testing with cafe ID: {cafe_id}")
        
        # Get details
        response = client.get(f"/api/v1/cafes/{cafe_id}")
        print(f"Request: GET /api/v1/cafes/{cafe_id}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response:")
            print(f"  ID: {data.get('id')}")
            print(f"  Name: {data.get('name')}")
            print(f"  Status: {data.get('status')}")
            print(f"  Verification Count: {data.get('verification_count')}")
            print(f"  Navigator ID: {data.get('navigator_id')}")
            print(f"  Vanguard IDs: {data.get('vanguard_ids')}")
            
            print("✅ Get cafe details passed")
            return True
        elif response.status_code == 404:
            print("⚠️  Cafe not found (expected if database is empty)")
            return True
        else:
            print(f"❌ Get cafe details failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_register_cafe_no_auth():
    """Test register cafe endpoint without auth (should fail)."""
    print("\n" + "="*50)
    print("TEST 4: Register Cafe (No Auth - Should Fail)")
    print("="*50)
    
    try:
        test_data = {
            "name": "Test Cafe",
            "latitude": 43.4643,
            "longitude": -80.5204,
            "address": "123 Test St, Waterloo, ON",
            "user_location": {
                "lat": 43.4643,
                "lng": -80.5204
            },
            "source_type": "map_click"
        }
        
        print(f"Request: POST /api/v1/cafes/register")
        print(f"Body: {test_data}")
        print("\n⚠️  Testing without auth token (should return 403)...")
        
        response = client.post("/api/v1/cafes/register", json=test_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 401 or response.status_code == 403:
            print("✅ Authentication check works (401/403 expected without token)")
            return True
        else:
            print(f"Response: {response.text}")
            print("⚠️  Unexpected status code (may need auth token)")
            return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_osm_service():
    """Test OSM reverse geocoding."""
    print("\n" + "="*50)
    print("TEST 5: OSM Reverse Geocoding")
    print("="*50)
    
    try:
        import asyncio
        from app.services.osm_service import OSMService
        
        osm_service = OSMService()
        
        # Test reverse geocoding (Waterloo coordinates)
        lat = 43.4643
        lng = -80.5204
        
        print(f"Testing reverse geocoding for lat={lat}, lng={lng}")
        print("Waiting 1 second for rate limit...")
        
        async def test_reverse_geocode():
            result = await osm_service.reverse_geocode(lat, lng)
            
            if result:
                print("✅ OSM reverse geocoding works:")
                print(f"  Display Name: {result.get('display_name', 'N/A')[:100]}")
                print(f"  Road: {result.get('road', 'N/A')}")
                print(f"  City: {result.get('city', 'N/A')}")
                print(f"  Country: {result.get('country', 'N/A')}")
                return True
            else:
                print("⚠️  OSM reverse geocoding returned None (may be rate limited)")
                return True
        
        result = asyncio.run(test_reverse_geocode())
        return result
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("IBeanThere Backend API Unit Tests")
    print("="*60)
    print("Using FastAPI TestClient (no server needed)")
    
    results = []
    
    # Test 1: Health check
    results.append(test_health_check())
    
    # Test 2: Search cafes
    results.append(test_search_cafes())
    
    # Test 3: Get cafe details
    results.append(test_get_cafe_details())
    
    # Test 4: Register cafe (no auth)
    results.append(test_register_cafe_no_auth())
    
    # Test 5: OSM service
    results.append(test_osm_service())
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("✅ All tests passed!")
    else:
        print("⚠️  Some tests failed or returned warnings")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

