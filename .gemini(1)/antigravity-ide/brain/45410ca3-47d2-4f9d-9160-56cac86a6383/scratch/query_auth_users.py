import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(dotenv_path=r"d:\oddconnector\hidmetgo\hidmetgo-backend\.env")

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def query_auth():
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    print("=" * 70)
    print(" CURRENT AUTH USERS ")
    print("=" * 70)
    try:
        res = requests.get(url, headers=headers)
        if res.ok:
            data = res.json().get("users", [])
            print(f"Total auth users: {len(data)}")
            for idx, u in enumerate(data):
                print(f"[{idx+1}] ID: {u.get('id')}")
                print(f"    Phone: {u.get('phone')}")
                print(f"    Email: {u.get('email')}")
                print("-" * 50)
        else:
            print(f"Error {res.status_code}: {res.text}")
    except Exception as e:
        print(f"Failed: {e}")
    print("=" * 70)

if __name__ == "__main__":
    query_auth()
