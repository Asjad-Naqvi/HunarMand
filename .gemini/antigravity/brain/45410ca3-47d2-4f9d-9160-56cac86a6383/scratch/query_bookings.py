import os
import requests
import json
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

def query_bookings():
    base_url = f"{SUPABASE_URL}/rest/v1"
    url = f"{base_url}/bookings?select=id,consumer_id,provider_id,status,service_code,final_estimate_pkr,created_at"
    
    print("=" * 70)
    print(" CURRENT BOOKINGS IN DATABASE ")
    print("=" * 70)
    
    try:
        res = requests.get(url, headers=headers)
        if res.ok:
            data = res.json()
            print(f"Total bookings: {len(data)}")
            for idx, b in enumerate(data):
                print(f"[{idx+1}] ID: {b.get('id')}")
                print(f"    Consumer: {b.get('consumer_id')}")
                print(f"    Provider: {b.get('provider_id')}")
                print(f"    Status:   {b.get('status')}")
                print(f"    Service:  {b.get('service_code')}")
                print(f"    Price:    PKR {b.get('final_estimate_pkr')}")
                print("-" * 50)
        else:
            print(f"Error {res.status_code}: {res.text}")
    except Exception as e:
        print(f"Failed to query: {e}")
    print("=" * 70)

if __name__ == "__main__":
    query_bookings()
