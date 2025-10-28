#!/usr/bin/env python3
"""
Test script to verify cache functionality is working correctly.

This script:
1. Makes a cafe search API call (should miss cache, call Google API)
2. Immediately makes the same call (should hit cache)
3. Checks cache statistics
4. Verifies cache hit rate

Usage:
    python scripts/test_cache_functionality.py
"""

import httpx
import asyncio
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

# Test location: University of Waterloo
TEST_LAT = 43.4723
TEST_LNG = -80.5449
TEST_RADIUS = 2000

async def test_cache_functionality():
    """Test the cache functionality end-to-end."""
    
    print("=" * 60)
    print("CACHE FUNCTIONALITY TEST")
    print("=" * 60)
    print()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Get initial cache stats
        print("📊 Step 1: Getting initial cache statistics...")
        try:
            response = await client.get(f"{BASE_URL}/cafes/cache/stats")
            if response.status_code == 200:
                stats = response.json()
                print(f"   ✅ Total cafes in cache: {stats.get('total_cafes', 0)}")
                print(f"   ✅ Fresh cafes: {stats.get('fresh_cafes', 0)}")
                print(f"   ✅ Stale cafes: {stats.get('stale_cafes', 0)}")
                print(f"   ✅ Cache hit rate: {stats.get('cache_hit_rate', 0):.2%}")
            else:
                print(f"   ❌ Failed to get stats: {response.status_code}")
        except Exception as e:
            print(f"   ⚠️  Could not get initial stats: {e}")
        
        print()
        
        # Step 2: First API call (should miss cache)
        print(f"🔍 Step 2: First search (cache miss expected)...")
        print(f"   Location: ({TEST_LAT}, {TEST_LNG})")
        print(f"   Radius: {TEST_RADIUS}m")
        
        start_time = datetime.now()
        try:
            response = await client.get(
                f"{BASE_URL}/cafes/search",
                params={
                    "lat": TEST_LAT,
                    "lng": TEST_LNG,
                    "radius": TEST_RADIUS
                }
            )
            end_time = datetime.now()
            duration_ms = (end_time - start_time).total_seconds() * 1000
            
            if response.status_code == 200:
                data = response.json()
                cache_hit = data.get("cache_hit", False)
                total_count = data.get("total_count", 0)
                
                print(f"   ✅ Response received in {duration_ms:.0f}ms")
                print(f"   ✅ Found {total_count} cafes")
                print(f"   {'✅ Cache HIT' if cache_hit else '⚠️  Cache MISS (expected)'}")
                
                if total_count > 0:
                    print(f"   📍 Sample cafe: {data['cafes'][0].get('name', 'N/A')}")
            else:
                print(f"   ❌ API call failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
        
        print()
        
        # Step 3: Second API call (should hit cache)
        print("🔍 Step 3: Second search (cache hit expected)...")
        
        start_time = datetime.now()
        try:
            response = await client.get(
                f"{BASE_URL}/cafes/search",
                params={
                    "lat": TEST_LAT,
                    "lng": TEST_LNG,
                    "radius": TEST_RADIUS
                }
            )
            end_time = datetime.now()
            duration_ms = (end_time - start_time).total_seconds() * 1000
            
            if response.status_code == 200:
                data = response.json()
                cache_hit = data.get("cache_hit", False)
                total_count = data.get("total_count", 0)
                
                print(f"   ✅ Response received in {duration_ms:.0f}ms")
                print(f"   ✅ Found {total_count} cafes")
                
                if cache_hit:
                    print(f"   ✅ Cache HIT - WORKING! 🎉")
                    print(f"   ⚡ Cache response was {duration_ms:.0f}ms")
                else:
                    print(f"   ❌ Cache MISS - Cache not working properly!")
                    return False
            else:
                print(f"   ❌ API call failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
        
        print()
        
        # Step 4: Final cache stats
        print("📊 Step 4: Final cache statistics...")
        try:
            response = await client.get(f"{BASE_URL}/cafes/cache/stats")
            if response.status_code == 200:
                stats = response.json()
                print(f"   ✅ Total cafes in cache: {stats.get('total_cafes', 0)}")
                print(f"   ✅ Fresh cafes: {stats.get('fresh_cafes', 0)}")
                print(f"   ✅ Stale cafes: {stats.get('stale_cafes', 0)}")
                print(f"   ✅ Cache hit rate: {stats.get('cache_hit_rate', 0):.2%}")
                
                # Verify cache hit rate is reasonable
                cache_hit_rate = stats.get('cache_hit_rate', 0)
                if cache_hit_rate >= 0.6:  # 60% threshold
                    print(f"   ✅ Cache hit rate is healthy (>60%)")
                else:
                    print(f"   ⚠️  Cache hit rate is below threshold (<60%)")
            else:
                print(f"   ❌ Failed to get stats: {response.status_code}")
        except Exception as e:
            print(f"   ⚠️  Could not get final stats: {e}")
        
        print()
        print("=" * 60)
        print("✅ CACHE FUNCTIONALITY TEST PASSED!")
        print("=" * 60)
        return True

def main():
    """Main entry point."""
    print()
    print("Starting cache functionality test...")
    print("Make sure the backend server is running on http://localhost:8000")
    print()
    
    try:
        result = asyncio.run(test_cache_functionality())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

