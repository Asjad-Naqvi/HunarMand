import os
import requests
from dotenv import load_dotenv

# Use absolute path to backend env file
load_dotenv(dotenv_path=r"d:\oddconnector\hidmetgo\hidmetgo-backend\.env")

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def clean_database():
    base_url = f"{SUPABASE_URL}/rest/v1"
    print("=" * 70)
    print(" WIPING ALL BOOKINGS & DISPUTES TO ALIGN UUIDs ")
    print("=" * 70)
    
    # 1. Delete all disputes
    print("[1] Deleting all disputes...")
    res = requests.delete(f"{base_url}/disputes?booking_id=not.is.null", headers=headers)
    print(f"    Status: {res.status_code}")
    
    # 2. Delete all bookings
    print("[2] Deleting all bookings...")
    res = requests.delete(f"{base_url}/bookings?id=not.is.null", headers=headers)
    print(f"    Status: {res.status_code}")
    
    # 3. Delete all consumer profiles & provider details
    print("[3] Deleting all sub-table dependencies...")
    requests.delete(f"{base_url}/provider_availability?provider_id=not.is.null", headers=headers)
    requests.delete(f"{base_url}/provider_sectors?provider_id=not.is.null", headers=headers)
    requests.delete(f"{base_url}/provider_services?id=not.is.null", headers=headers)
    requests.delete(f"{base_url}/provider_profiles?user_id=not.is.null", headers=headers)
    requests.delete(f"{base_url}/consumer_profiles?user_id=not.is.null", headers=headers)
    requests.delete(f"{base_url}/consumer_addresses?id=not.is.null", headers=headers)
    requests.delete(f"{base_url}/consumer_favourites?consumer_id=not.is.null", headers=headers)
    
    # 4. Delete all users from public.users to clear any mismatching IDs
    print("[4] Clearing all public profiles...")
    res = requests.delete(f"{base_url}/users?id=not.is.null", headers=headers)
    print(f"    Status: {res.status_code}")

    print("=" * 70)
    print(" CLEAN SLATE ESTABLISHED! ")
    print("=" * 70)

if __name__ == "__main__":
    clean_database()
