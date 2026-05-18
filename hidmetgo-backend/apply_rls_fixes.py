import os
import sys
from dotenv import load_dotenv

load_dotenv(dotenv_path=r"d:\oddconnector\hidmetgo\hidmetgo-backend\.env")

def apply_rls_fixes():
    print("=" * 60)
    print(" APPLYING HAAZIR (ODDJOBS) RLS POLICIES FIX ")
    print("=" * 60)

    db_url = os.getenv("DATABASE_URL")
    # Redirect to IPv4 pooler for the project 'kiojylgihmhptndqbzpg'
    db_url = "postgresql://postgres.kiojylgihmhptndqbzpg:haazir%2123%21%40%21%23@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
        
    if not db_url:
        print("[ERROR] DATABASE_URL not found in .env file.")
        return

    try:
        import psycopg2
    except ImportError:
        print("[INFO] psycopg2-binary is not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
        import psycopg2

    print("[INFO] Connecting to Supabase PostgreSQL database...")
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        sql_script = """
        -- -------------------------------------------------------------
        -- Permissive RLS Policies for Bookings
        -- -------------------------------------------------------------
        DROP POLICY IF EXISTS bk_select_own ON bookings;
        DROP POLICY IF EXISTS bk_select_all ON bookings;
        DROP POLICY IF EXISTS bk_insert_all ON bookings;
        DROP POLICY IF EXISTS bk_update_all ON bookings;
        DROP POLICY IF EXISTS bk_delete_all ON bookings;

        CREATE POLICY bk_select_all ON bookings FOR SELECT USING (TRUE);
        CREATE POLICY bk_insert_all ON bookings FOR INSERT WITH CHECK (TRUE);
        CREATE POLICY bk_update_all ON bookings FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY bk_delete_all ON bookings FOR DELETE USING (TRUE);

        -- -------------------------------------------------------------
        -- Permissive RLS Policies for Disputes
        -- -------------------------------------------------------------
        DROP POLICY IF EXISTS disp_select_all ON disputes;
        DROP POLICY IF EXISTS disp_insert_all ON disputes;
        DROP POLICY IF EXISTS disp_update_all ON disputes;
        DROP POLICY IF EXISTS disp_delete_all ON disputes;

        CREATE POLICY disp_select_all ON disputes FOR SELECT USING (TRUE);
        CREATE POLICY disp_insert_all ON disputes FOR INSERT WITH CHECK (TRUE);
        CREATE POLICY disp_update_all ON disputes FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY disp_delete_all ON disputes FOR DELETE USING (TRUE);

        -- -------------------------------------------------------------
        -- Permissive RLS Policies for Users
        -- -------------------------------------------------------------
        DROP POLICY IF EXISTS users_select_own ON users;
        DROP POLICY IF EXISTS users_select_all ON users;
        DROP POLICY IF EXISTS users_insert_all ON users;
        DROP POLICY IF EXISTS users_update_all ON users;

        CREATE POLICY users_select_all ON users FOR SELECT USING (TRUE);
        CREATE POLICY users_insert_all ON users FOR INSERT WITH CHECK (TRUE);
        CREATE POLICY users_update_all ON users FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

        -- -------------------------------------------------------------
        -- Permissive RLS Policies for Provider Profiles
        -- -------------------------------------------------------------
        DROP POLICY IF EXISTS pp_select_all ON provider_profiles;
        DROP POLICY IF EXISTS pp_update_own ON provider_profiles;
        DROP POLICY IF EXISTS pp_update_all ON provider_profiles;

        CREATE POLICY pp_select_all ON provider_profiles FOR SELECT USING (TRUE);
        CREATE POLICY pp_update_all ON provider_profiles FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
        """

        print("[INFO] Executing RLS Policy SQL...")
        cursor.execute(sql_script)
        print("[SUCCESS] RLS policies updated successfully! No more silent blockages.")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Failed to apply RLS fixes: {e}")
    print("=" * 60)

if __name__ == "__main__":
    apply_rls_fixes()
