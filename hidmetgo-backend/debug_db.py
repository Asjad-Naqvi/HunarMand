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
    print("=== SUPABASE AUTH USERS ===")
    res = requests.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers)
    if res.ok:
        users = res.json().get("users", [])
        for u in users:
            print(f"Auth ID: {u.get('id')} | Email: {u.get('email')} | Phone: {u.get('phone')}")
    else:
        print("Failed to fetch auth users:", res.text)
        
    print("\n=== PUBLIC.USERS ===")
    res2 = requests.get(f"{SUPABASE_URL}/rest/v1/users", headers=headers)
    if res2.ok:
        for u in res2.json():
            print(f"DB ID: {u.get('id')} | Name: {u.get('name')} | Phone: {u.get('phone')} | Role: {u.get('role')}")
    else:
        print("Failed to fetch public users:", res2.text)

    print("\n=== PUBLIC.CONSUMER_PROFILES ===")
    res3 = requests.get(f"{SUPABASE_URL}/rest/v1/consumer_profiles", headers=headers)
    if res3.ok:
        for p in res3.json():
            print(f"Profile User ID: {p.get('user_id')} | Loyalty: {p.get('loyalty_tier')} | Completed: {p.get('total_completed')}")
    else:
        print("Failed to fetch consumer profiles:", res3.text)

if __name__ == "__main__":
    run()
