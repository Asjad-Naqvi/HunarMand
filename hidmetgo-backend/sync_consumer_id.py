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

def run():
    wrong_id = "92d3bf0b-11af-4e00-9aa6-b960bfbcc395"
    correct_id = "9bf8cfbf-ee00-49e8-84a1-7d7df2a6db78"
    
    print(f"Purging old incorrect customer ID references ({wrong_id})...")
    # Delete from consumer_profiles
    r1 = requests.delete(f"{SUPABASE_URL}/rest/v1/consumer_profiles?user_id=eq.{wrong_id}", headers=headers)
    print("Delete consumer profile status:", r1.status_code)
    
    # Delete from bookings
    r2 = requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?consumer_id=eq.{wrong_id}", headers=headers)
    print("Delete bookings status:", r2.status_code)
    
    # Delete from users
    r3 = requests.delete(f"{SUPABASE_URL}/rest/v1/users?id=eq.{wrong_id}", headers=headers)
    print("Delete user status:", r3.status_code)
    
    print(f"\nInserting synchronized customer record with correct Auth ID ({correct_id})...")
    # Insert in users
    user_payload = {
        "id": correct_id,
        "name": "Test Customer",
        "phone": "+923111234509",
        "email": "923111234509@haazir.app",
        "role": "consumer"
    }
    r4 = requests.post(f"{SUPABASE_URL}/rest/v1/users", headers=headers, json=user_payload)
    print("Insert user status:", r4.status_code, r4.text)
    
    # Insert in consumer_profiles
    profile_payload = {
        "user_id": correct_id,
        "loyalty_tier": "none"
    }
    r5 = requests.post(f"{SUPABASE_URL}/rest/v1/consumer_profiles", headers=headers, json=profile_payload)
    print("Insert consumer profile status:", r5.status_code, r5.text)
    
    print("\nSynchronization complete!")

if __name__ == "__main__":
    run()
