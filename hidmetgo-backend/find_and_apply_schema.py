import os
import sys
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

# List of common Supabase AWS regions to check
REGIONS = [
    "ap-southeast-1", # Singapore
    "ap-south-1",     # Mumbai
    "us-east-1",      # N. Virginia
    "us-east-2",      # Ohio
    "us-west-1",      # N. California
    "us-west-2",      # Oregon
    "eu-central-1",   # Frankfurt
    "eu-west-1",      # Ireland
    "eu-west-2",      # London
    "me-central-1",   # Bahrain
    "ap-northeast-1", # Tokyo
    "ap-northeast-2", # Seoul
    "ap-southeast-2", # Sydney
    "ca-central-1",   # Canada
]

def find_and_apply():
    print("=" * 70)
    print(" HAAZIR (ODDJOBS) AUTOMATIC REGION DISCOVERY & SCHEMA DEPLOYER ")
    print("=" * 70)
    
    project_id = "kiojylgihmhptndqbzpg"
    password = "haazir!23!@!#"
    
    # URL encode the password for safety in connection string
    encoded_password = urllib.parse.quote_plus(password)
    
    import psycopg2
    
    schema_file = "schema.sql"
    if not os.path.exists(schema_file):
        print(f"[ERROR] Could not find {schema_file} in current directory.")
        return
        
    print("[INFO] Attempting to discover active database region...")
    
    success_region = None
    conn = None
    
    for region in REGIONS:
        host = f"aws-0-{region}.pooler.supabase.com"
        print(f"Trying region: {region} ({host})...", end=" ", flush=True)
        
        # Connection parameters for Supabase Pooler (Port 6543)
        # Note: Username format for connection pooling is postgres.PROJECT_ID
        conn_str = f"postgresql://postgres.{project_id}:{encoded_password}@{host}:6543/postgres?sslmode=require"
        
        try:
            # Short timeout so we don't hang long on inactive hosts
            conn = psycopg2.connect(conn_str, connect_timeout=4)
            print(" -> SUCCESS!")
            success_region = region
            break
        except Exception as e:
            # Host name lookup or connection failure
            print(f"x (Error: {e})")
            continue
            
    if not success_region:
        print("\n[ERROR] Could not find your active Supabase database region.")
        print("Please ensure your project is active and your password is correct.")
        print("=" * 70)
        return
        
    try:
        print(f"\n[INFO] Connected to Supabase region: {success_region}")
        cursor = conn.cursor()
        
        print(f"[INFO] Reading {schema_file}...")
        with open(schema_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()
            
        print("[INFO] Applying database schema... (Executing SQL)")
        cursor.execute(sql_script)
        
        conn.commit()
        print("\n[CONGRATULATIONS] Schema applied successfully! All tables and custom types are live.")
        
        # Update .env file with the discovered connection string
        env_file = ".env"
        if os.path.exists(env_file):
            print(f"[INFO] Updating {env_file} with working DATABASE_URL...")
            with open(env_file, 'r') as f:
                lines = f.readlines()
                
            new_lines = []
            has_db_url = False
            for line in lines:
                if line.startswith("DATABASE_URL="):
                    new_lines.append(f"DATABASE_URL=postgresql://postgres.{project_id}:{encoded_password}@aws-0-{success_region}.pooler.supabase.com:6543/postgres?sslmode=require\n")
                    has_db_url = True
                else:
                    new_lines.append(line)
                    
            if not has_db_url:
                new_lines.append(f"DATABASE_URL=postgresql://postgres.{project_id}:{encoded_password}@aws-0-{success_region}.pooler.supabase.com:6543/postgres?sslmode=require\n")
                
            with open(env_file, 'w') as f:
                f.writelines(new_lines)
                
            print("[SUCCESS] .env updated with the persistent, pooler-based connection string!")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n[ERROR] Failed to apply schema: {e}")
        if conn:
            conn.close()
            
    print("=" * 70)

if __name__ == "__main__":
    find_and_apply()
