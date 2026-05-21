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

def clean_and_sync():
    wrong_id = "9bf8cfbf-ee00-49e8-84a1-7d7df2a6db78"
    correct_id = "9cfe6848-b08b-410e-88f4-4c42a1268ec9"
    
    print(f"Syncing consumer ID... Wrong: {wrong_id} -> Correct: {correct_id}")
    
    # 1. Get all bookings for both wrong and correct ids
    for uid in [wrong_id, correct_id]:
        res = requests.get(f"{SUPABASE_URL}/rest/v1/bookings?or=(consumer_id.eq.{uid},provider_id.eq.{uid})", headers=headers)
        if res.ok:
            bookings = res.json()
            booking_ids = [b['id'] for b in bookings]
            if booking_ids:
                print(f"Found bookings to purge for ID {uid}: {booking_ids}")
                # Delete disputes referencing these bookings
                for bid in booking_ids:
                    r = requests.delete(f"{SUPABASE_URL}/rest/v1/disputes?booking_id=eq.{bid}", headers=headers)
                    print(f"  Delete dispute status for booking {bid}: {r.status_code}")
                    r2 = requests.delete(f"{SUPABASE_URL}/rest/v1/reviews?booking_id=eq.{bid}", headers=headers)
                    print(f"  Delete review status for booking {bid}: {r2.status_code}")
                
                # Delete provider nonresponses referencing these bookings
                for bid in booking_ids:
                    requests.delete(f"{SUPABASE_URL}/rest/v1/provider_nonresponses?booking_id=eq.{bid}", headers=headers)
                
                # Delete booking declines
                for bid in booking_ids:
                    requests.delete(f"{SUPABASE_URL}/rest/v1/booking_declined_providers?booking_id=eq.{bid}", headers=headers)

                # Delete bookings themselves
                requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?or=(consumer_id.eq.{uid},provider_id.eq.{uid})", headers=headers)
                print(f"  Purged bookings for ID {uid}")

        # Delete any orphan reviews
        requests.delete(f"{SUPABASE_URL}/rest/v1/reviews?or=(reviewer_id.eq.{uid},reviewee_id.eq.{uid})", headers=headers)
        # Delete any disputes raised by user
        requests.delete(f"{SUPABASE_URL}/rest/v1/disputes?raised_by_id=eq.{uid}", headers=headers)

        # Delete profiles
        requests.delete(f"{SUPABASE_URL}/rest/v1/consumer_profiles?user_id=eq.{uid}", headers=headers)
        requests.delete(f"{SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.{uid}", headers=headers)
        
        # Delete user
        requests.delete(f"{SUPABASE_URL}/rest/v1/users?id=eq.{uid}", headers=headers)
        print(f"Purged user and profile for ID {uid}")

    # 2. Re-create the customer with correct ID
    print("\nInserting synchronized customer record with correct Auth ID...")
    user_payload = {
        "id": correct_id,
        "name": "Test Customer",
        "phone": "+923111234509",
        "email": "923111234509@hunarmand.app",
        "role": "consumer"
    }
    r_user = requests.post(f"{SUPABASE_URL}/rest/v1/users", headers=headers, json=user_payload)
    print("Insert user status:", r_user.status_code, r_user.text)
    
    profile_payload = {
        "user_id": correct_id,
        "loyalty_tier": "none"
    }
    r_profile = requests.post(f"{SUPABASE_URL}/rest/v1/consumer_profiles", headers=headers, json=profile_payload)
    print("Insert consumer profile status:", r_profile.status_code, r_profile.text)

if __name__ == "__main__":
    clean_and_sync()
