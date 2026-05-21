import os
import requests
import json
import urllib.parse
from dotenv import load_dotenv

# Load environment variables
_this_dir = os.path.dirname(os.path.abspath(__file__))
# Check backend dir - since it is saved in C:\Users\..., let's absolute path to the backend
_backend_dir = r"d:\oddconnector\hidmetgo\hidmetgo-backend"
_backend_env = os.path.join(_backend_dir, ".env")
load_dotenv(dotenv_path=_backend_env, override=True)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')
BASE_URL = "http://127.0.0.1:5000"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def print_banner(title):
    print("\n" + "="*80)
    print(f" {title.upper()} ".center(80, "="))
    print("="*80)

def main():
    if not SUPABASE_URL:
        print("[ERROR] Supabase credentials not found in env.")
        return

    print_banner("HUNARMAND END-TO-END DEMO SIMULATION")
    print(f"Supabase URL: {SUPABASE_URL}")
    print("Starting simulated walk-through...")

    # =========================================================================
    # STEP 1: PURGE AND CLEANUP EXISTENCE OF ALI OR 923111234567
    # =========================================================================
    print_banner("Step 1: Database Sanitization & Provider Purging")
    phone_clean = "923111234567"
    encoded_phone = urllib.parse.quote(phone_clean)
    
    print(f"Checking for existing provider records for phone: {phone_clean}...")
    user_res = requests.get(f"{SUPABASE_URL}/rest/v1/users?phone=eq.{encoded_phone}", headers=headers)
    
    if user_res.ok and user_res.json():
        for db_user in user_res.json():
            user_id = db_user["id"]
            print(f"[!] Found colliding record. Purging dependency rows for user UUID: {user_id}")
            
            # Delete dependents
            requests.delete(f"{SUPABASE_URL}/rest/v1/disputes?raised_by_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/bookings?consumer_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/provider_availability?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/provider_sectors?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/provider_services?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.{user_id}", headers=headers)
            
            # Delete parent user record
            requests.delete(f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}", headers=headers)
            print("[SUCCESS] Stale provider deleted successfully.")
    else:
        print("[OK] No colliding provider records found. Clean slate.")

    # =========================================================================
    # STEP 2: REGISTER NEW PROVIDER "ALI" (PHONE: 923111234567, I-8, CLEANING)
    # =========================================================================
    print_banner("Step 2: Provider Onboarding (Registering Ali)")
    print("Calling provider agent registration process...")
    
    provider_payload = {
        "message": "Register provider. Name: Ali, Phone: 923111234567, Location: I-8, Service: cleaning, Base Rate: 1200, Operating Hours: 09:00 to 18:00",
        "mode": "provider",
        "user_id": "ali_provider_temp"
    }
    
    reg_response = requests.post(f"{BASE_URL}/api/agent/process", json=provider_payload)
    print(f"Onboarding Agent Response Status: {reg_response.status_code}")
    if reg_response.ok:
        print("\nAgent Confirmation Text:")
        print(reg_response.json().get("response"))
    else:
        print(f"Error during registration: {reg_response.text}")
        return

    # Verify database insertion
    print("\nVerifying Ali's record in Supabase...")
    ali_res = requests.get(f"{SUPABASE_URL}/rest/v1/users?phone=eq.{encoded_phone}&select=*,provider_profiles(*),provider_services(*),provider_sectors(*)", headers=headers)
    if ali_res.ok and ali_res.json():
        ali_data = ali_res.json()[0]
        ali_id = ali_data["id"]
        print(f"[SUCCESS] Registered Ali into users table with UUID: {ali_id}")
        print(f"Sectors Covered: {[s['sector_code'] for s in ali_data.get('provider_sectors', [])]}")
        print(f"Services Offered: {[s['service_code'] for s in ali_data.get('provider_services', [])]}")
    else:
        print("[ERROR] Ali could not be found in Supabase database after registration.")
        return

    # =========================================================================
    # STEP 3: LOGIN AS USER & SEARCH FOR CLEANING IN I-8
    # =========================================================================
    print_banner("Step 3: Consumer Search & Dynamic Pricing (I-8 Cleaning)")
    print("Querying the customer agent: 'Mujhay I-8 main cleaning services chahiyay'")
    
    consumer_search_payload = {
        "message": "Mujhay I-8 main cleaning services chahiyay",
        "mode": "customer",
        "user_id": "demo_consumer_user"
    }
    
    # Clear history for clean test
    requests.post(f"{BASE_URL}/api/agent/clear", json={"user_id": "demo_consumer_user"})
    
    search_response = requests.post(f"{BASE_URL}/api/agent/process", json=consumer_search_payload)
    print(f"Customer Agent Response Status: {search_response.status_code}")
    
    if search_response.ok:
        search_data = search_response.json()
        print("\nCustomer Agent Response:")
        print(search_data.get("response"))
        
        # Check if history contains tool results
        history = search_data.get("history", [])
        tool_results = None
        for item in history:
            if item.get("role") == "tool" and item.get("name") == "search_providers":
                tool_results = json.loads(item.get("content", "{}"))
                break
                
        if tool_results and tool_results.get("registered_providers"):
            print("\n[SUCCESS] Extracted verified database providers:")
            for p in tool_results["registered_providers"]:
                print(f"- Provider Name: {p['name']} | Rating: {p['rating']} | Phone: {p['phone']} | Final Dynamic Price: PKR {p['pricing_breakdown']['final_total']}")
        else:
            print("[WARNING] No registered providers found in history output.")
    else:
        print(f"Error during search: {search_response.text}")
        return

    # =========================================================================
    # STEP 4: CONSUMER CONFIRMS BOOKING FOR ALI
    # =========================================================================
    print_banner("Step 4: Booking Simulation (Confirming Ali)")
    print("Sending confirmation: 'Book Ali now'")
    
    booking_payload = {
        "message": f"Please book provider Ali for the cleaning service",
        "mode": "customer",
        "user_id": "demo_consumer_user"
    }
    
    book_response = requests.post(f"{BASE_URL}/api/agent/process", json=booking_payload)
    print(f"Agent Response Status: {book_response.status_code}")
    if book_response.ok:
        print("\nAgent Confirmation:")
        print(book_response.json().get("response"))
    else:
        print(f"Error during booking: {book_response.text}")
        return

    # Retrieve created booking in Supabase
    print("\nRetrieving created booking from Supabase...")
    booking_res = requests.get(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{ali_id}&order=created_at.desc&limit=1", headers=headers)
    if booking_res.ok and booking_res.json():
        active_booking = booking_res.json()[0]
        booking_id = active_booking["id"]
        print(f"[SUCCESS] Created active booking request in database!")
        print(f"Booking ID: {booking_id}")
        print(f"Status: {active_booking['status']}")
        print(f"Final Estimate: PKR {active_booking['final_estimate_pkr']}")
    else:
        print("[ERROR] No bookings found for provider Ali in Supabase.")
        return

    # =========================================================================
    # STEP 5: PROVIDER RE-LOGIN, CONFIRMS BOOKING AND ARRIVAL
    # =========================================================================
    print_banner("Step 5: Provider Status Updates ('On My Way')")
    print("Transitioning booking state in database...")
    
    # 5a. Provider accepts booking (Status transitions to confirmed)
    print("Simulating Ali confirming and accepting the booking request...")
    patch_confirm = requests.patch(f"{SUPABASE_URL}/rest/v1/bookings?id=eq.{booking_id}", headers=headers, json={"status": "confirmed"})
    if patch_confirm.status_code in (200, 204):
        print("[STATUS UPDATE] Booking transitioned to: 'confirmed'")
    else:
        print(f"[ERROR] Failed to confirm booking: {patch_confirm.text}")
        
    # 5b. Provider sends 'I'm on my way'
    print("Simulating Ali updating his status to: 'On my way'...")
    patch_way = requests.patch(f"{SUPABASE_URL}/rest/v1/bookings?id=eq.{booking_id}", headers=headers, json={"status": "provider_on_the_way"})
    if patch_way.status_code in (200, 204):
        print("[STATUS UPDATE] Booking transitioned to: 'provider_on_the_way'")
    else:
        print(f"[ERROR] Failed to update arrival status: {patch_way.text}")

    # =========================================================================
    # STEP 6: SIMULATE DISPUTE INITIATION
    # =========================================================================
    print_banner("Step 6: Dispute Simulation (Filing Complaint)")
    print("Consumer files a pricing dispute: 'He is overcharging me by PKR 1000'")
    
    dispute_payload = {
        "message": f"I want to file a dispute. This booking is overcharging me for cleaning.",
        "mode": "customer",
        "user_id": "demo_consumer_user"
    }
    
    # Clear history for dispute
    requests.post(f"{BASE_URL}/api/agent/clear", json={"user_id": "demo_consumer_user"})
    
    dispute_response = requests.post(f"{BASE_URL}/api/agent/process", json=dispute_payload)
    print(f"Customer Agent Response Status: {dispute_response.status_code}")
    if dispute_response.ok:
        print("\nAgent Dispute Confirmation:")
        print(dispute_response.json().get("response"))
    else:
        print(f"Error during dispute filing: {dispute_response.text}")
        return

    # Verify dispute creation in database
    print("\nVerifying Dispute entry in Supabase...")
    dis_res = requests.get(f"{SUPABASE_URL}/rest/v1/disputes?booking_id=eq.{booking_id}", headers=headers)
    book_chk_res = requests.get(f"{SUPABASE_URL}/rest/v1/bookings?id=eq.{booking_id}", headers=headers)
    
    if dis_res.ok and dis_res.json():
        dispute_record = dis_res.json()[0]
        print(f"[SUCCESS] Dispute created successfully!")
        print(f"Dispute ID: {dispute_record['id']}")
        print(f"Dispute Type Code: {dispute_record['dispute_type']}")
        print(f"Dispute Description: {dispute_record['description_json']}")
        print(f"Current Dispute Status: {dispute_record['status']}")
        if book_chk_res.ok and book_chk_res.json():
            print(f"Booking Status in database: {book_chk_res.json()[0]['status']}")
    else:
        print("[ERROR] Dispute record was not found in Supabase.")

    # =========================================================================
    # STEP 7: GIBBERISH INPUT HANDLING
    # =========================================================================
    print_banner("Step 7: Robustness & Gibberish Handling")
    print("Sending gibberish text: 'aksjdhaskjdh'")
    
    gibberish_payload = {
        "message": "aksjdhaskjdh",
        "mode": "customer",
        "user_id": "demo_consumer_user"
    }
    
    gib_response = requests.post(f"{BASE_URL}/api/agent/process", json=gibberish_payload)
    print(f"Response Status: {gib_response.status_code}")
    if gib_response.ok:
        print("\nAgent Response to Gibberish:")
        print(gib_response.json().get("response"))
    else:
        print(f"Error: {gib_response.text}")

    # =========================================================================
    # STEP 8: FALL-BACK TO GOOGLE MAPS DIRECTORY (I-9 CLEANING)
    # =========================================================================
    print_banner("Step 8: Google Maps Fallback Search (I-9 Cleaning)")
    print("Querying the customer agent for a sector where no providers exist: 'I need sofa cleaning in I-9'")
    
    fallback_payload = {
        "message": "I need sofa cleaning in I-9 markaz",
        "mode": "customer",
        "user_id": "demo_consumer_user"
    }
    
    requests.post(f"{BASE_URL}/api/agent/clear", json={"user_id": "demo_consumer_user"})
    
    fall_response = requests.post(f"{BASE_URL}/api/agent/process", json=fallback_payload)
    print(f"Response Status: {fall_response.status_code}")
    if fall_response.ok:
        print("\nAgent Fallback Response:")
        print(fall_response.json().get("response"))
    else:
        print(f"Error: {fall_response.text}")

    print_banner("END-TO-END DEMO SIMULATION COMPLETED")

if __name__ == "__main__":
    main()
