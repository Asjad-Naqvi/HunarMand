import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def run():
    print("Testing bookings insert...")
    # Consumer ID for Test Customer
    consumer_id = "92d3bf0b-11af-4e00-9aa6-b960bfbcc395"
    # Provider ID for Juan
    provider_id = "add03cbb-c88c-477e-a943-5b4e4437fc8f"
    
    payload = {
        "consumer_id": consumer_id,
        "provider_id": provider_id,
        "service_code": "HS-03",
        "complexity_tier": "basic",
        "urgency": "scheduled",
        "requested_date": "2026-05-20",
        "requested_time_slot": "10:00:00",
        "base_rate_pkr": 1200,
        "final_estimate_pkr": 1200,
        "status": "pending_provider_acceptance"
    }
    
    res = requests.post(f"{SUPABASE_URL}/rest/v1/bookings", headers=headers, json=payload)
    print("Status Code:", res.status_code)
    print("Response:", res.text)

if __name__ == "__main__":
    run()
