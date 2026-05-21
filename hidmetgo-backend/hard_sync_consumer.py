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
    
    print(f"--- Hard Syncing Consumer {wrong_id} -> {correct_id} ---")
    
    # 1. Get all bookings for the wrong ID to delete their references
    bookings_res = requests.get(f"{SUPABASE_URL}/rest/v1/bookings?consumer_id=eq.{wrong_id}", headers=headers)
    booking_ids = []
    if bookings_res.ok:
        booking_ids = [b["id"] for b in bookings_res.json()]
    print(f"Found bookings to purge: {booking_ids}")
    
    # Delete child references
    for b_id in booking_ids:
        print(f"Purging references for booking {b_id}...")
        requests.delete(f"{SUPABASE_URL}/rest/v1/reviews?booking_id=eq.{b_id}", headers=headers)
        requests.delete(f"{SUPABASE_URL}/rest/v1/disputes?booking_id=eq.{b_id}", headers=headers)
        requests.delete(f"{SUPABASE_URL}/rest/v1/booking_declined_providers?booking_id=eq.{b_id}", headers=headers)
        requests.delete(f"{SUPABASE_URL}/rest/v1/provider_nonresponses?booking_id=eq.{b_id}", headers=headers)
        
    # Delete reviews directly mentioning user
    requests.delete(f"{SUPABASE_URL}/rest/v1/reviews?reviewer_id=eq.{wrong_id}", headers=headers)
    requests.delete(f"{SUPABASE_URL}/rest/v1/reviews?reviewee_id=eq.{wrong_id}", headers=headers)
    
    # Delete disputes directly mentioning user
    requests.delete(f"{SUPABASE_URL}/rest/v1/disputes?raised_by_id=eq.{wrong_id}", headers=headers)
    
    # Delete booking declined providers directly mentioning user
    requests.delete(f"{SUPABASE_URL}/rest/v1/booking_declined_providers?provider_id=eq.{wrong_id}", headers=headers)
    
    # Delete bookings
    r_book = requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?consumer_id=eq.{wrong_id}", headers=headers)
    print("Delete bookings status:", r_book.status_code)
    
    r_book2 = requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{wrong_id}", headers=headers)
    print("Delete bookings (as provider) status:", r_book2.status_code)
    
    # Delete consumer profile
    r_prof = requests.delete(f"{SUPABASE_URL}/rest/v1/consumer_profiles?user_id=eq.{wrong_id}", headers=headers)
    print("Delete consumer profile status:", r_prof.status_code)
    
    # Delete user
    r_user = requests.delete(f"{SUPABASE_URL}/rest/v1/users?id=eq.{wrong_id}", headers=headers)
    print("Delete user status:", r_user.status_code)
    
    print("\nInserting synchronized customer record with correct Auth ID...")
    user_payload = {
        "id": correct_id,
        "name": "Test Customer",
        "phone": "+923111234509",
        "email": "923111234509@hunarmand.app",
        "role": "consumer"
    }
    r_ins = requests.post(f"{SUPABASE_URL}/rest/v1/users", headers=headers, json=user_payload)
    print("Insert user status:", r_ins.status_code, r_ins.text)
    
    profile_payload = {
        "user_id": correct_id,
        "loyalty_tier": "none"
    }
    r_p_ins = requests.post(f"{SUPABASE_URL}/rest/v1/consumer_profiles", headers=headers, json=profile_payload)
    print("Insert consumer profile status:", r_p_ins.status_code, r_p_ins.text)
    
    print("\nHard Sync Complete!")

if __name__ == "__main__":
    run()
