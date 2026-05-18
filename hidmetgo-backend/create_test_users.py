import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

TEST_USERS = [
    {
        "email": "923111234509@haazir.app",
        "phone": "+923111234509",
        "password": "password123",
        "name": "Test Customer",
        "role": "consumer"
    },
    {
        "email": "923111234510@haazir.app",
        "phone": "+923111234510",
        "password": "password123",
        "name": "Test Provider",
        "role": "provider"
    }
]

def create_users():
    print("=" * 60)
    print(" PURGING AND RE-CREATING CLEAN TEST ACCOUNTS ")
    print("=" * 60)

    # 1. Fetch all existing auth users
    get_res = requests.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers)
    if not get_res.ok:
        print(f"[-] Failed to fetch existing users: {get_res.text}")
        return

    users_list = get_res.json().get("users", [])
    
    # 2. Identify and delete any colliding auth and public rows
    # Fetch all database public.users to clean up duplicate records locally
    db_users_res = requests.get(f"{SUPABASE_URL}/rest/v1/users", headers=headers)
    if db_users_res.ok:
        db_users = db_users_res.json()
        for du in db_users:
            du_phone = (du.get("phone") or "").replace("+", "").replace(" ", "")
            for tu in TEST_USERS:
                tu_phone = tu["phone"].replace("+", "").replace(" ", "")
                if du_phone == tu_phone or du.get("email") == tu["email"]:
                    print(f"[!] Purging database collision: ID {du['id']} ({du.get('phone')} / {du.get('email')})")
                    # Delete sub-tables first
                    requests.delete(f"{SUPABASE_URL}/rest/v1/provider_availability?provider_id=eq.{du['id']}", headers=headers)
                    requests.delete(f"{SUPABASE_URL}/rest/v1/provider_sectors?provider_id=eq.{du['id']}", headers=headers)
                    requests.delete(f"{SUPABASE_URL}/rest/v1/provider_services?provider_id=eq.{du['id']}", headers=headers)
                    requests.delete(f"{SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.{du['id']}", headers=headers)
                    requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?consumer_id=eq.{du['id']}", headers=headers)
                    requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{du['id']}", headers=headers)
                    # Delete from public.users
                    requests.delete(f"{SUPABASE_URL}/rest/v1/users?id=eq.{du['id']}", headers=headers)

    for u in TEST_USERS:
        target_phone_clean = u["phone"].replace("+", "").replace(" ", "")
        
        for ext in users_list:
            ext_phone_clean = (ext.get("phone") or "").replace("+", "").replace(" ", "")
            ext_email = ext.get("email") or ""
            ext_id = ext.get("id")
            
            # Match by email or phone
            if ext_email == u["email"] or ext_phone_clean == target_phone_clean:
                print(f"[!] Auth collision found. Purging old Auth user ID: {ext_id} ({ext_email} / {ext.get('phone')})")
                
                # Delete sub-tables for provider to avoid cascade errors
                requests.delete(f"{SUPABASE_URL}/rest/v1/provider_availability?provider_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/provider_sectors?provider_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/provider_services?provider_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?consumer_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{ext_id}", headers=headers)
                
                # Delete from public.users first (cascade constraint safety)
                requests.delete(f"{SUPABASE_URL}/rest/v1/users?id=eq.{ext_id}", headers=headers)
                
                # Delete from auth.users
                requests.delete(f"{SUPABASE_URL}/auth/v1/admin/users/{ext_id}", headers=headers)

    # 3. Create fresh clean users
    for u in TEST_USERS:
        print(f"\n[+] Creating fresh user: {u['name']} ({u['role']})")
        
        # Create user in Auth
        auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
        auth_payload = {
            "email": u["email"],
            "password": u["password"],
            "phone": u["phone"],
            "email_confirm": True,
            "phone_confirm": True,
            "user_metadata": {
                "name": u["name"],
                "phone": u["phone"],
                "role": u["role"]
            }
        }
        res = requests.post(auth_url, headers=headers, json=auth_payload)
        
        if res.status_code in (200, 201):
            user_id = res.json()["id"]
            print(f"  [OK] Auth user created. ID: {user_id}")
        else:
            print(f"  [ERROR] Auth user creation failed ({res.status_code}): {res.text}")
            continue

        # Sync profile in public.users
        db_url = f"{SUPABASE_URL}/rest/v1/users"
        db_payload = {
            "id": user_id,
            "name": u["name"],
            "phone": u["phone"],
            "email": u["email"],
            "role": u["role"]
        }
        
        db_res = requests.post(db_url, headers={
            **headers,
            "Prefer": "resolution=merge-duplicates"
        }, json=db_payload)
        
        if db_res.status_code in (200, 201, 204):
            print(f"  [OK] Public profile row verified & synced!")
        elif db_res.status_code == 409:
            print(f"  [OK] Public profile row verified & synced (via database trigger auto-sync)!")
        else:
            print(f"  [ERROR] Database profile sync failed ({db_res.status_code}): {db_res.text}")
            continue

        # 4. If role is provider, seed services and sectors
        if u["role"] == "provider":
            print("  [+] Seeding Test Provider Profile, Services, Sectors, and Schedule...")
            
            # Profile
            profile_payload = {
                "user_id": user_id,
                "availability_status": "available",
                "base_rating": 4.9,
                "punctuality_rating": 4.9,
                "quality_rating": 4.8,
                "behaviour_rating": 4.9,
                "jobs_completed": 85,
                "cancellation_rate": 0.0,
                "dispute_score": 1.0,
                "total_earnings_simulated": 0,
                "account_status": "active"
            }
            requests.post(f"{SUPABASE_URL}/rest/v1/provider_profiles", headers=headers, json=profile_payload)
            
            # Service: AC Repair (HS-04)
            service_payload = {
                "provider_id": user_id,
                "service_code": "HS-04",
                "per_job_rate_pkr": 2000,
                "is_primary": True
            }
            requests.post(f"{SUPABASE_URL}/rest/v1/provider_services", headers=headers, json=service_payload)
            
            # Sector Coverage: G-13
            sector_payload = {
                "provider_id": user_id,
                "sector_code": "G-13"
            }
            requests.post(f"{SUPABASE_URL}/rest/v1/provider_sectors", headers=headers, json=sector_payload)
            
            # Availability schedule
            for day in range(7):
                availability_payload = {
                    "provider_id": user_id,
                    "day_of_week": day,
                    "open_time": "09:00:00",
                    "close_time": "21:00:00"
                }
                requests.post(f"{SUPABASE_URL}/rest/v1/provider_availability", headers=headers, json=availability_payload)

            print("  [OK] Provider tables seeded successfully!")

    print("\n" + "=" * 60)
    print(" PURGE & SEED COMPLETE! Log in directly in the app. ")
    print("=" * 60)

if __name__ == "__main__":
    create_users()
