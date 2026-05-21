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

def query_all():
    base_url = f"{SUPABASE_URL}/rest/v1"
    url = f"{base_url}/users"
    res = requests.get(url, headers=headers)
    if res.ok:
        for u in res.json():
            print(f"ID: {u.get('id')} | Name: {u.get('name')} | Phone: {u.get('phone')} | Role: {u.get('role')}")
    else:
        print("Error:", res.text)

if __name__ == "__main__":
    query_all()
