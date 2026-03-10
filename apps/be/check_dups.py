import sys
import os
from collections import defaultdict

backend_path = "/Users/chae/Projects/IBeanThere/apps/be"
sys.path.append(backend_path)
os.chdir(backend_path)
from dotenv import load_dotenv
load_dotenv('.env')

from app.database.supabase import get_supabase_client

supabase = get_supabase_client()
res = supabase.table("cafes").select("id, name, latitude, longitude").execute()
cafes = res.data or []
print(f"Total cafes: {len(cafes)}")

# Check for duplicates by exact lat/long
coords = defaultdict(list)
for c in cafes:
    coords[(c['latitude'], c['longitude'])].append(c)

for (lat, lng), dups in coords.items():
    if len(dups) > 1:
        print(f"DUPLICATE LOCATION {lat}, {lng}:")
        for d in dups:
            print(f"  - {d['id']}: {d['name']}")
