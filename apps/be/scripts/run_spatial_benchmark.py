"""
Spatial Index Benchmark Script for IBeanThere cafes table.
Runs isolated in a temporary local Docker postgres:17 container.
"""
import os
import sys
import time
import random
import subprocess
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

DOCKER_CONTAINER_NAME = "ibeanthere-benchmark-db"
DB_PORT = 5433
DB_USER = "postgres"
DB_PASS = "benchmark_pass"
DB_NAME = "postgres"
TARGET_TOTAL_ROWS = 10000

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]


def start_docker_postgres():
    print("1. Starting Docker container (postgres:17)...")
    # Stop/remove container if already exists
    subprocess.run(f"docker rm -f {DOCKER_CONTAINER_NAME}", shell=True, capture_output=True)
    
    cmd = (
        f"docker run -d --name {DOCKER_CONTAINER_NAME} "
        f"-p {DB_PORT}:5432 -e POSTGRES_PASSWORD={DB_PASS} postgres:17"
    )
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Failed to start Docker: {res.stderr}")
    
    print("   Waiting for PostgreSQL to be ready...")
    for _ in range(30):
        try:
            conn = psycopg2.connect(
                host="localhost", port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME
            )
            conn.close()
            print("   PostgreSQL is ready!")
            return
        except Exception:
            time.sleep(1)
    raise RuntimeError("PostgreSQL timed out waiting to start")


def setup_schema(conn):
    print("2. Creating extensions and cafes schema...")
    with conn.cursor() as cur:
        cur.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        cur.execute("CREATE EXTENSION IF NOT EXISTS cube;")
        cur.execute("CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;")
        
        cur.execute("""
        CREATE TABLE cafes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            address TEXT,
            latitude NUMERIC NOT NULL,
            longitude NUMERIC NOT NULL,
            status VARCHAR DEFAULT 'verified',
            verification_count INT4 DEFAULT 0,
            verified_at TIMESTAMPTZ,
            navigator_id UUID,
            vanguard_ids JSONB DEFAULT '[]'::jsonb,
            source_type VARCHAR,
            source_url TEXT,
            normalized_name TEXT,
            normalized_address TEXT,
            phone TEXT,
            website TEXT,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            admin_verified BOOL DEFAULT FALSE,
            view_count_total INT4 DEFAULT 0,
            view_count_14d INT4 DEFAULT 0,
            visit_count_total INT4 DEFAULT 0,
            visit_count_14d INT4 DEFAULT 0,
            trending_score NUMERIC DEFAULT 0,
            trending_rank INT4,
            trending_updated_at TIMESTAMPTZ,
            business_hours JSONB,
            slug VARCHAR,
            main_image TEXT,
            timezone TEXT
        );
        """)
    conn.commit()


def seed_real_and_synthetic_data(conn):
    print("3. Fetching real cafes from Supabase and populating synthetic data...")
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    res = supabase.table("cafes").select("*").execute()
    real_cafes = res.data or []
    print(f"   Fetched {len(real_cafes)} real cafes from Supabase.")
    
    rows_to_insert = []
    real_coords = []
    
    for c in real_cafes:
        lat = float(c["latitude"])
        lon = float(c["longitude"])
        real_coords.append((lat, lon))
        rows_to_insert.append((
            c.get("id"),
            c.get("name"),
            c.get("address"),
            lat,
            lon,
            "verified", # Set to verified for query benchmarking
            c.get("source_type", "app_seed"),
            c.get("source_url")
        ))
        
    # Generate synthetic rows to reach TARGET_TOTAL_ROWS
    needed = TARGET_TOTAL_ROWS - len(rows_to_insert)
    print(f"   Generating {needed} synthetic cafe rows around real coordinates...")
    
    if not real_coords:
        real_coords = [(43.47, -80.54), (43.65, -79.38)]  # KW and Toronto defaults
        
    for i in range(needed):
        base_lat, base_lon = random.choice(real_coords)
        # Jitter within ~50km bounding box
        lat_jitter = random.uniform(-0.4, 0.4)
        lon_jitter = random.uniform(-0.4, 0.4)
        syn_lat = round(base_lat + lat_jitter, 6)
        syn_lon = round(base_lon + lon_jitter, 6)
        
        rows_to_insert.append((
            None, # DEFAULT UUID
            f"Synthetic Cafe #{i+1}",
            f"{random.randint(1, 999)} Synthetic St, Ontario",
            syn_lat,
            syn_lon,
            "verified" if random.random() < 0.8 else "pending",
            "synthetic_benchmark",
            None
        ))
        
    insert_sql = """
    INSERT INTO cafes (id, name, address, latitude, longitude, status, source_type, source_url)
    VALUES %s
    """
    
    with conn.cursor() as cur:
        # Prepare values for batch insert
        formatted_rows = [
            (
                r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]
            ) for r in rows_to_insert
        ]
        # execute_values with template
        execute_values(cur, """
            INSERT INTO cafes (id, name, address, latitude, longitude, status, source_type, source_url)
            VALUES %s
        """, [
            (
                r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]
            ) if r[0] else (
                psycopg2.extensions.AsIs("gen_random_uuid()"), r[1], r[2], r[3], r[4], r[5], r[6], r[7]
            ) for r in rows_to_insert
        ])
        
        cur.execute("ANALYZE cafes;")
        cur.execute("SELECT COUNT(*) FROM cafes;")
        total_in_db = cur.fetchone()[0]
        print(f"   Successfully seeded {total_in_db} cafes in local Postgres!")


def run_explain(conn, query, title):
    print(f"\n--- {title} ---")
    with conn.cursor() as cur:
        cur.execute(f"EXPLAIN (ANALYZE, BUFFERS) {query}")
        plan_lines = [r[0] for r in cur.fetchall()]
        plan_text = "\n".join(plan_lines)
        print(plan_text)
        return plan_text


def main():
    start_docker_postgres()
    
    conn = psycopg2.connect(
        host="localhost", port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME
    )
    
    try:
        setup_schema(conn)
        seed_real_and_synthetic_data(conn)
        
        target_query_bbox = """
        SELECT id, name, latitude, longitude,
               (3959 * 2 * asin(sqrt(sin(radians((latitude - 43.47) / 2))^2 +
                cos(radians(43.47)) * cos(radians(latitude)) *
                sin(radians((longitude + 80.5) / 2))^2))) AS distance
        FROM cafes
        WHERE latitude BETWEEN (43.47 - 1.0) AND (43.47 + 1.0)
          AND longitude BETWEEN (-80.5 - 1.0) AND (-80.5 + 1.0)
          AND status = 'verified'
        ORDER BY distance
        LIMIT 20;
        """
        
        # BEFORE BENCHMARK
        plan_before = run_explain(conn, target_query_bbox, "BEFORE: Current Bbox Query (No Index)")
        
        # CREATE INDEXES
        print("\n4. Creating Spatial GiST Index & Composite B-Tree Index...")
        with conn.cursor() as cur:
            cur.execute("CREATE INDEX idx_cafes_ll_earth ON cafes USING GIST(ll_to_earth(latitude, longitude));")
            cur.execute("CREATE INDEX idx_cafes_status_lat_lng ON cafes (status, latitude, longitude);")
            cur.execute("ANALYZE cafes;")
        conn.commit()
        print("   Indexes created successfully!")
        
        # AFTER BENCHMARK - Bbox with B-Tree Index
        plan_after_bbox = run_explain(conn, target_query_bbox, "AFTER 1: Bbox Query with Composite B-Tree Index")
        
        # AFTER BENCHMARK - GiST Index with earthdistance function (100km & 5km radius)
        target_query_gist_5km = """
        SELECT id, name, latitude, longitude,
               (earth_distance(ll_to_earth(43.47, -80.5), ll_to_earth(latitude, longitude)) / 1609.344) AS distance_miles
        FROM cafes
        WHERE status = 'verified'
          AND earth_box(ll_to_earth(43.47, -80.5), 5000) @> ll_to_earth(latitude, longitude)
        ORDER BY ll_to_earth(43.47, -80.5) <-> ll_to_earth(latitude, longitude)
        LIMIT 20;
        """
        plan_after_gist = run_explain(conn, target_query_gist_5km, "AFTER 2: Earthdistance GiST Spatial Index Query (5km Nearby Radius)")
        
        print("\n=======================================================")
        print("BENCHMARK COMPLETED SUCCESSFULLY!")
        print("To clean up Docker container when finished:")
        print(f"  docker stop {DOCKER_CONTAINER_NAME} && docker rm {DOCKER_CONTAINER_NAME}")
        print("=======================================================")
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()
