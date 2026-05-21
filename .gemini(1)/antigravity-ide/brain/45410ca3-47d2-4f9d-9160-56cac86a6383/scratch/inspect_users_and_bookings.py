import os
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=r"d:\oddconnector\hidmetgo\hidmetgo-backend\.env")

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def inspect():
    base_url = f"{SUPABASE_URL}/rest/v1"
    
    # 1. Fetch all bookings
    print("=" * 70)
    print(" ALL BOOKINGS ")
    print("=" * 70)
    res_b = requests.get(f"{base_url}/bookings?select=*", headers=headers)
    if res_b.ok:
        bookings = res_b.json()
        print(f"Total: {len(bookings)}")
        for b in bookings:
            print(f"Booking ID: {b.get('id')} | Provider ID: {b.get('provider_id')} | Service: {b.get('service_code')} | Status: {b.get('status')}")
    else:
        print("Error fetching bookings:", res_b.text)
        
    # 2. Fetch all providers and profiles
    print("\n" + "=" * 70)
    print(" PROVIDERS AND PROFILES ")
    print("=" * 70)
    res_u = requests.get(f"{base_url}/users?role=eq.provider&select=id,name,phone,provider_profiles(availability_status,account_status)", headers=headers)
    if res_u.ok:
        users = res_u.json()
        for u in users:
            print(f"User ID: {u.get('id')} | Name: {u.get('name')} | Phone: {u.get('phone')} | Profiles: {u.get('provider_profiles')}")
    else:
        print("Error fetching users:", res_u.text)

if __name__ == "__main__":
    inspect()
