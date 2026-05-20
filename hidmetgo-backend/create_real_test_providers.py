import os
import requests
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

PASSWORD = "password123"

PROVIDERS_TO_SEED = [
    # Consumers
    {
        "name": "Test Customer",
        "phone": "+923111234509",
        "email": "923111234509@haazir.app",
        "role": "consumer",
    },
    # Plumbing
    {
        "name": "Zahid Plumbing",
        "phone": "+923001111111",
        "email": "zahidplumbing@haazir.app",
        "role": "provider",
        "services": [("HS-01", 1200)], # Plumbing
        "sectors": ["G-13"],
    },
    {
        "name": "Usman Plumbing",
        "phone": "+923002222222",
        "email": "usmanplumbing@haazir.app",
        "role": "provider",
        "services": [("HS-01", 1400)], # Plumbing
        "sectors": ["G-13"],
    },
    # Electricians
    {
        "name": "Rizwan Electrician",
        "phone": "+923003333333",
        "email": "rizwanelectrician@haazir.app",
        "role": "provider",
        "services": [("HS-03", 1500)], # Electrician / Electronics
        "sectors": ["G-13"],
    },
    {
        "name": "Ali Electrician",
        "phone": "+923004444444",
        "email": "alielectrician@haazir.app",
        "role": "provider",
        "services": [("HS-03", 1300)], # Electrician / Electronics
        "sectors": ["G-13"],
    },
    # Cleaners
    {
        "name": "Babar Cleaning",
        "phone": "+923005555555",
        "email": "babarcleaning@haazir.app",
        "role": "provider",
        "services": [("CS-01", 2000), ("CS-02", 2500)], # Carpet, Sofa
        "sectors": ["G-13"],
    },
    {
        "name": "Kashif Cleaning",
        "phone": "+923006666666",
        "email": "kashifcleaning@haazir.app",
        "role": "provider",
        "services": [("CS-01", 1800), ("CS-02", 2200)], # Carpet, Sofa
        "sectors": ["G-13"],
    },
    # Original Test Provider
    {
        "name": "Test Provider",
        "phone": "+923111234510",
        "email": "923111234510@haazir.app",
        "role": "provider",
        "services": [("HS-04", 2000)], # AC Repair
        "sectors": ["G-13"],
    }
]

def purge_colliding_user(phone, email):
    phone_clean = phone.replace("+", "").replace(" ", "")
    
    # Check REST API for existing user record
    encoded_phone = urllib.parse.quote(phone_clean)
    db_res = requests.get(f"{SUPABASE_URL}/rest/v1/users?phone=eq.{encoded_phone}", headers=headers)
    if db_res.ok and db_res.json():
        for db_user in db_res.json():
            user_id = db_user["id"]
            print(f"[!] Purging database collision for {phone}: {user_id}")
            requests.delete(f"{SUPABASE_URL}/rest/v1/provider_availability?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/provider_sectors?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/provider_services?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?consumer_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}", headers=headers)

    # Check Auth admin API
    auth_users_res = requests.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers)
    if auth_users_res.ok:
        auth_users = auth_users_res.json().get("users", [])
        for ext in auth_users:
            ext_phone_clean = (ext.get("phone") or "").replace("+", "").replace(" ", "")
            ext_email = ext.get("email") or ""
            ext_id = ext.get("id")
            if ext_email == email or ext_phone_clean == phone_clean:
                print(f"[!] Purging Auth collision for {phone}: {ext_id}")
                # Delete sub-tables again just in case
                requests.delete(f"{SUPABASE_URL}/rest/v1/provider_availability?provider_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/provider_sectors?provider_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/provider_services?provider_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?consumer_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/rest/v1/users?id=eq.{ext_id}", headers=headers)
                requests.delete(f"{SUPABASE_URL}/auth/v1/admin/users/{ext_id}", headers=headers)

def create_and_seed_user(u):
    print(f"\n[+] Seeding: {u['name']} ({u['phone']}) - Role: {u['role']}")
    
    # 1. Purge collisions
    purge_colliding_user(u["phone"], u["email"])
    
    # 2. Create user in Auth
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
    auth_payload = {
        "email": u["email"],
        "password": PASSWORD,
        "phone": u["phone"],
        "email_confirm": True,
        "phone_confirm": True,
        "user_metadata": {
            "name": u["name"],
            "phone": u["phone"],
            "role": u["role"]
        }
    }
    
    auth_res = requests.post(auth_url, headers=headers, json=auth_payload)
    if not auth_res.ok:
        print(f"  [ERROR] Auth creation failed: {auth_res.text}")
        return
        
    user_id = auth_res.json()["id"]
    print(f"  [OK] Auth user created! ID: {user_id}")
    
    # 3. Create user in public.users
    db_payload = {
        "id": user_id,
        "name": u["name"],
        "phone": u["phone"],
        "email": u["email"],
        "role": u["role"]
    }
    db_res = requests.post(f"{SUPABASE_URL}/rest/v1/users", headers={
        **headers,
        "Prefer": "resolution=merge-duplicates"
    }, json=db_payload)
    
    if not db_res.ok and db_res.status_code != 409:
        print(f"  [ERROR] Sync to public.users failed: {db_res.text}")
        return
    print(f"  [OK] Synced to public.users!")
    
    # 4. If consumer, create consumer profile
    if u["role"] == "consumer":
        consumer_payload = {
            "user_id": user_id,
            "loyalty_tier": "none"
        }
        requests.post(f"{SUPABASE_URL}/rest/v1/consumer_profiles", headers=headers, json=consumer_payload)
        print(f"  [OK] Consumer profile created!")
        return

    # 5. If provider, seed provider tables
    profile_payload = {
        "user_id": user_id,
        "availability_status": "available",
        "base_rating": 4.8,
        "punctuality_rating": 4.9,
        "quality_rating": 4.8,
        "behaviour_rating": 4.8,
        "jobs_completed": 15,
        "cancellation_rate": 0.0,
        "dispute_score": 1.0,
        "total_earnings_simulated": 22500,
        "account_status": "active"
    }
    profile_res = requests.post(f"{SUPABASE_URL}/rest/v1/provider_profiles", headers=headers, json=profile_payload)
    if not profile_res.ok:
        print(f"  [ERROR] provider_profiles insert failed: {profile_res.text}")
    else:
        print(f"  [OK] Provider profile created!")
        
    # Services
    for idx, (service_code, rate) in enumerate(u.get("services", [])):
        service_payload = {
            "provider_id": user_id,
            "service_code": service_code,
            "per_job_rate_pkr": rate,
            "is_primary": (idx == 0)
        }
        requests.post(f"{SUPABASE_URL}/rest/v1/provider_services", headers=headers, json=service_payload)
    print(f"  [OK] Services seeded: {u.get('services')}")
    
    # Sectors
    for sector in u.get("sectors", []):
        sector_payload = {
            "provider_id": user_id,
            "sector_code": sector
        }
        requests.post(f"{SUPABASE_URL}/rest/v1/provider_sectors", headers=headers, json=sector_payload)
    print(f"  [OK] Sectors seeded: {u.get('sectors')}")
    
    # Availability Schedule (Mon-Sun)
    for day in range(7):
        avail_payload = {
            "provider_id": user_id,
            "day_of_week": day,
            "open_time": "09:00:00",
            "close_time": "18:00:00"
        }
        requests.post(f"{SUPABASE_URL}/rest/v1/provider_availability", headers=headers, json=avail_payload)
    print(f"  [OK] Availability schedule seeded!")

def run():
    print("=" * 70)
    print(" REGISTERING AND SEEDING DUAL AUTH & DB TEST USERS ")
    print("=" * 70)
    for u in PROVIDERS_TO_SEED:
        create_and_seed_user(u)
    print("\n" + "=" * 70)
    print(" ALL TEST USERS FULLY REGISTERED WITH PASSWORD: password123 ")
    print("=" * 70)

if __name__ == "__main__":
    run()
