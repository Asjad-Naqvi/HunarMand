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
    res = requests.get(f"{SUPABASE_URL}/rest/v1/users", headers=headers)
    if res.ok:
        users = res.json()
        print("--- Registered Users in public.users ---")
        for u in users:
            print(f"ID: {u.get('id')} | Name: {u.get('name')} | Phone: {u.get('phone')} | Role: {u.get('role')}")
    else:
        print("Failed to fetch users:", res.text)

if __name__ == "__main__":
    run()
