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
    print("Fetching Auth Users...")
    res = requests.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers)
    if res.ok:
        users = res.json().get("users", [])
        print("--- Registered Auth Users ---")
        for u in users:
            print(f"ID: {u.get('id')} | Email: {u.get('email')} | Phone: {u.get('phone')}")
    else:
        print("Failed to fetch auth users:", res.text)

if __name__ == "__main__":
    run()
