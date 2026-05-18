import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("[ERROR] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env")
        return

    print("=" * 60)
    print(" HAAZIR (ODDJOBS) SUPABASE CONNECTION CHECK ")
    print("=" * 60)
    print(f"Connecting to REST API: {url}...")

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }

    try:
        # Test query to see if users table exists via direct REST API call
        print("Checking if 'users' table is present in the database...")
        res = requests.get(f"{url}/rest/v1/users?select=id&limit=1", headers=headers)
        
        if res.status_code == 200:
            print("[SUCCESS] Connected successfully! The 'users' table is live.")
        elif res.status_code == 404:
            print("[ERROR] 404: Table 'users' not found. Please apply the schema.")
        else:
            print(f"[ERROR] HTTP {res.status_code}: {res.text}")
            return
        
        # Check other key tables
        tables = [
            "consumer_profiles", 
            "provider_profiles", 
            "provider_services", 
            "provider_sectors", 
            "bookings", 
            "reviews", 
            "disputes"
        ]
        
        present = []
        missing = []
        
        for t in tables:
            r = requests.get(f"{url}/rest/v1/{t}?select=*&limit=1", headers=headers)
            if r.status_code in [200, 201, 204]:
                present.append(t)
            else:
                missing.append(t)
                
        print(f"\nTables present: {', '.join(present)}")
        if missing:
            print(f"Tables missing or not created: {', '.join(missing)}")
            print("\n[TIP] It looks like the schema has not been fully applied yet.")
            print("Please copy the contents of 'schema.sql' and run it in the Supabase SQL Editor.")
        else:
            print("\n[CONGRATULATIONS] All core database tables are fully live and accessible!")
            
    except Exception as e:
        print("\n[ERROR] Connection failed.")
        print(str(e))
    print("=" * 60)

if __name__ == "__main__":
    test_connection()
