import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def test_direct_registration():
    print("=" * 70)
    print(" DEBGGING REGISTER PROVIDER DRECTLY ")
    print("=" * 70)
    
    base_url = f"{SUPABASE_URL}/rest/v1"
    
    name = "Ali Plumber"
    phone = "+923129988111"
    location = "G-13"
    service_types = ["plumbing"]
    hours = "09:00 to 18:00"
    base_rate = 1200
    
    # 1. Create or select user
    user_payload = {"name": name, "phone": phone, "role": "provider"}
    print("\n1. Posting to /users...")
    u_res = requests.post(f"{base_url}/users", headers=headers, json=user_payload)
    print(f"Status: {u_res.status_code}")
    print(f"Response: {u_res.text}")
    
    # Retrieve user ID with URL encoded phone to protect the '+' symbol
    import urllib.parse
    encoded_phone = urllib.parse.quote(phone)
    print("\n2. Retrieving user ID...")
    user_get = requests.get(f"{base_url}/users?phone=eq.{encoded_phone}&select=id", headers=headers)
    print(f"Status: {user_get.status_code}")
    print(f"Response: {user_get.text}")
    user_id = user_get.json()[0]['id']
    print(f"User ID: {user_id}")
    
    # 2. Create provider profile
    profile_payload = {
        "user_id": user_id,
        "availability_status": "available",
        "base_rating": 5.0,
        "punctuality_rating": 5.0,
        "quality_rating": 5.0,
        "behaviour_rating": 5.0,
        "jobs_completed": 0,
        "cancellation_rate": 0.0,
        "dispute_score": 1.0,
        "total_earnings_simulated": 0,
        "account_status": "active"
    }
    print("\n3. Posting to /provider_profiles...")
    p_res = requests.post(f"{base_url}/provider_profiles", headers=headers, json=profile_payload)
    print(f"Status: {p_res.status_code}")
    print(f"Response: {p_res.text}")
    
    # 3. Create provider services
    service_payload = {
        "provider_id": user_id,
        "service_code": "HS-01",
        "per_job_rate_pkr": base_rate,
        "is_primary": True
    }
    print("\n4. Posting to /provider_services...")
    s_res = requests.post(f"{base_url}/provider_services", headers=headers, json=service_payload)
    print(f"Status: {s_res.status_code}")
    print(f"Response: {s_res.text}")
    
    # 4. Create provider sector
    sector_payload = {
        "provider_id": user_id,
        "sector_code": "G-13"
    }
    print("\n5. Posting to /provider_sectors...")
    sec_res = requests.post(f"{base_url}/provider_sectors", headers=headers, json=sector_payload)
    print(f"Status: {sec_res.status_code}")
    print(f"Response: {sec_res.text}")
    
    print("=" * 70)

if __name__ == "__main__":
    test_direct_registration()
