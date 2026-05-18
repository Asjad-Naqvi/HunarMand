import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=r"d:\oddconnector\hidmetgo\hidmetgo-backend\.env")

regions = [
    ("ap-southeast-1", "aws-0"),
    ("ap-southeast-1", "aws-1"),
    ("ap-southeast-1", "aws-2"),
    ("ap-southeast-1", "aws-3"),
    ("us-east-1", "aws-0"),
    ("us-east-1", "aws-1"),
    ("us-east-2", "aws-0"),
    ("eu-central-1", "aws-0")
]

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

def find_and_run():
    project_ref = "kiojylgihmhptndqbzpg"
    password = "haazir!23!@!#"
    
    print("=" * 70)
    print(" SEARCHING FOR VALID GLOBAL SUPABASE POOLER REGION ")
    print("=" * 70)
    
    for r, prefix in regions:
        host = f"{prefix}-{r}.pooler.supabase.com"
        print(f"[Testing] Region: {r} (Host: {host})...")
        try:
            conn = psycopg2.connect(
                host=host,
                port=6543,
                database="postgres",
                user=f"postgres.{project_ref}",
                password=password,
                connect_timeout=3
            )
            print(f"[SUCCESS] Connected to pooler region: {r}!")
            conn.autocommit = True
            cursor = conn.cursor()
            
            print("[INFO] Executing RLS Policy DDL Script...")
            cursor.execute(sql_script)
            print("[SUCCESS] RLS policies applied successfully!")
            
            cursor.close()
            conn.close()
            print("=" * 70)
            return True
        except Exception as e:
            err_msg = str(e).strip()
            # If the error is FATAL tenant not found, we continue to check other regions
            if "tenant/user" in err_msg and "not found" in err_msg:
                print(f"  -> Region mismatch (tenant not found)")
            else:
                print(f"  -> Connection error: {err_msg}")
                
    print("[ERROR] None of the global poolers worked.")
    print("=" * 70)
    return False

if __name__ == "__main__":
    find_and_run()
