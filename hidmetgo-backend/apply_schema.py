import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def apply_schema():
    print("=" * 60)
    print(" HUNARMAND (ODDJOBS) DATABASE SCHEMA MIGRATOR ")
    print("=" * 60)

    # Check for DATABASE_URL in .env
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[WARNING] DATABASE_URL not found in .env file.")
        print("\nTo run this script automatically, please add your PostgreSQL Connection String to .env:")
        print("DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres")
        print("\nAlternatively, you can manually apply the schema:")
        print("1. Open your Supabase Dashboard (https://supabase.com/dashboard)")
        print("2. Navigate to 'SQL Editor' in the left menu.")
        print("3. Click 'New Query' -> 'Blank Query'.")
        print("4. Copy the entire contents of 'schema.sql' and paste it in the editor.")
        print("5. Click 'Run' at the bottom right.")
        print("=" * 60)
        return

    try:
        import psycopg2
    except ImportError:
        print("[INFO] psycopg2-binary is not installed. Attempting to install it...")
        try:
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
            import psycopg2
            print("[SUCCESS] psycopg2-binary installed successfully!\n")
        except Exception as e:
            print(f"[ERROR] Failed to install psycopg2-binary: {e}")
            print("Please run: pip install psycopg2-binary")
            print("Or apply the schema manually via the Supabase SQL Editor.")
            print("=" * 60)
            return

    schema_file = "schema.sql"
    if not os.path.exists(schema_file):
        # Check parent directory or common paths
        if os.path.exists("../schema.sql"):
            schema_file = "../schema.sql"
        else:
            print(f"[ERROR] Could not find {schema_file}. Please ensure you are running the script from the directory containing it.")
            print("=" * 60)
            return

    print(f"[INFO] Connecting to Supabase PostgreSQL database...")
    try:
        # Connect to Postgres
        conn = psycopg2.connect(db_url)
        conn.autocommit = False
        cursor = conn.cursor()
        
        print(f"[INFO] Reading {schema_file}...")
        with open(schema_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        print("[INFO] Executing schema SQL script... (This may take a moment)")
        # Execute the entire script
        cursor.execute(sql_script)
        
        # Commit transaction
        conn.commit()
        print("\n[SUCCESS] Schema applied successfully! All custom types, tables, constraints, and indexes are now live.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"\n[ERROR] An error occurred while applying the schema:")
        print(str(e))
        print("\nIf you are getting a connection timeout, please check your network connection and ensure your Supabase database is active.")
    print("=" * 60)

if __name__ == "__main__":
    apply_schema()
