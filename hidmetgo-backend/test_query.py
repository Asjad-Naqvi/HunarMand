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
    "Content-Type": "application/json"
}

def test_query():
    print("=" * 70)
    print(" TESTING PROVIDER NESTED REST QUERY ")
    print("=" * 70)
    
    base_url = f"{SUPABASE_URL}/rest/v1"
    
    # Query parent users table and embed profiles, services, and sectors
    query_url = f"{base_url}/users?role=eq.provider&select=*,provider_profiles(*),provider_services(*),provider_sectors(*)"
    
    try:
        response = requests.get(query_url, headers=headers)
        if response.ok:
            data = response.json()
            print(f"[SUCCESS] Got {len(data)} provider profiles!")
            print(f"Profiles data:\n{json.dumps(data, indent=2)}")
        else:
            print(f"[FAILED] HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[ERROR] Query failed: {e}")
        
    print("=" * 70)

if __name__ == "__main__":
    test_query()
