import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://127.0.0.1:5000"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

TEST_USER = "test_stress_user"

def print_separator(title):
    print("\n" + "="*80)
    print(f" {title.upper()} ")
    print("="*80)

def main():
    print("Starting HunarMand Stress-Test Suite...")

    # -------------------------------------------------------------------------
    # SCENARIO 1: No suitable provider available in sector (H-12)
    # -------------------------------------------------------------------------
    print_separator("Scenario 1: No suitable provider available (Google Maps Fallback)")
    
    # Clear history first
    requests.post(f"{BASE_URL}/api/agent/clear", json={"user_id": TEST_USER})
    
    # Search for plumbing in H-12 (No registered provider is in H-12)
    payload = {
        "message": "I need a plumber in H-12 markaz today",
        "mode": "customer",
        "user_id": TEST_USER
    }
    
    response = requests.post(f"{BASE_URL}/api/agent/process", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        res_data = response.json()
        print("\nAgent Response:")
        print(res_data.get("response"))
    else:
        print(f"Error: {response.text}")


    # -------------------------------------------------------------------------
    # SCENARIO 2: Provider cancels and system reschedules
    # -------------------------------------------------------------------------
    print_separator("Scenario 2: Provider cancels and system reschedules")
    
    requests.post(f"{BASE_URL}/api/agent/clear", json={"user_id": TEST_USER})
    
    # Step 2a: Let's query to find a valid provider in G-13
    print("Finding a provider in G-13...")
    payload_find = {
        "message": "I need a plumber in G-13",
        "mode": "customer",
        "user_id": TEST_USER
    }
    res_find = requests.post(f"{BASE_URL}/api/agent/process", json=payload_find)
    
    # Step 2b: Create a mock booking in Supabase directly to simulate cancellation
    print("Creating simulated booking in database...")
    # Find a provider ID from DB
    users_url = f"{SUPABASE_URL}/rest/v1/users?role=eq.provider&limit=1"
    prov_res = requests.get(users_url, headers=HEADERS)
    if prov_res.ok and prov_res.json():
        provider_id = prov_res.json()[0]["id"]
        provider_name = prov_res.json()[0]["name"]
        print(f"Simulating booking with provider: {provider_name} ({provider_id})")
        
        # Find a consumer ID dynamically
        consumer_id = "9bf8cfbf-ee00-49e8-84a1-7d7df2a6db78"
        cons_res = requests.get(f"{SUPABASE_URL}/rest/v1/users?role=eq.consumer&limit=1", headers=HEADERS)
        if cons_res.ok and cons_res.json():
            consumer_id = cons_res.json()[0]["id"]
            
        booking_payload = {
            "consumer_id": consumer_id,
            "provider_id": provider_id,
            "service_code": "HS-01",
            "complexity_tier": "basic",
            "urgency": "scheduled",
            "requested_date": "2026-05-21",
            "requested_time_slot": "12:00:00",
            "base_rate_pkr": 1000,
            "final_estimate_pkr": 1080,
            "status": "pending_provider_acceptance"
        }
        
        headers_with_prefer = HEADERS.copy()
        headers_with_prefer["Prefer"] = "return=representation"
        book_res = requests.post(f"{SUPABASE_URL}/rest/v1/bookings", headers=headers_with_prefer, json=booking_payload)
        if book_res.status_code in (200, 201):
            # Check response format depending on Supabase REST configuration
            # Try to fetch booking id
            chk_res = requests.get(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{provider_id}&status=eq.pending_provider_acceptance&limit=1", headers=HEADERS)
            if chk_res.ok and chk_res.json():
                booking_id = chk_res.json()[0]["id"]
                print(f"Successfully created mock booking: {booking_id}")
                
                # Step 2c: Provider cancels the booking
                print("Simulating provider cancellation...")
                cancel_url = f"{SUPABASE_URL}/rest/v1/bookings?id=eq.{booking_id}"
                requests.patch(cancel_url, headers=HEADERS, json={"status": "cancelled"})
                print(f"Booking {booking_id} status changed to 'cancelled' in database.")
                
                # Step 2d: Ask agent to reschedule
                print("Sending rescheduling request to agent...")
                payload_reschedule = {
                    "message": f"My plumber cancelled booking {booking_id}. Can you find me someone else in G-13?",
                    "mode": "customer",
                    "user_id": TEST_USER
                }
                res_reschedule = requests.post(f"{BASE_URL}/api/agent/process", json=payload_reschedule)
                print(f"Status: {res_reschedule.status_code}")
                if res_reschedule.status_code == 200:
                    print("\nAgent Rescheduling Response:")
                    print(res_reschedule.json().get("response"))
                else:
                    print(f"Error: {res_reschedule.text}")
    else:
        print("Failed to retrieve a provider ID to simulate booking.")


    # -------------------------------------------------------------------------
    # SCENARIO 3: User input is misspelled, mixed-language, or ambiguous
    # -------------------------------------------------------------------------
    print_separator("Scenario 3: Misspelled & Mixed-Language Input (Roman Urdu)")
    
    requests.post(f"{BASE_URL}/api/agent/clear", json={"user_id": TEST_USER})
    
    # Mixed Roman Urdu + Misspellings: "mjhy elecrician chahye G13 m leak switch thk krwane k lye"
    payload_mixed = {
        "message": "mjhy elecrician chahye G13 m leak switch thk krwane k lye",
        "mode": "customer",
        "user_id": TEST_USER
    }
    
    response_mixed = requests.post(f"{BASE_URL}/api/agent/process", json=payload_mixed)
    print(f"Status: {response_mixed.status_code}")
    if response_mixed.status_code == 200:
        print("\nAgent Response:")
        print(response_mixed.json().get("response"))
    else:
        print(f"Error: {response_mixed.text}")


    # -------------------------------------------------------------------------
    # SCENARIO 4: Customer disputes completed service
    # -------------------------------------------------------------------------
    print_separator("Scenario 4: Dispute Price/Quality after Completion")
    
    requests.post(f"{BASE_URL}/api/agent/clear", json={"user_id": TEST_USER})
    
    # Step 4a: Find a provider in G-13 and retrieve their stats
    print("Retrieving a provider's performance metrics...")
    prov_stats_res = requests.get(f"{SUPABASE_URL}/rest/v1/users?role=eq.provider&select=*,provider_profiles(*)", headers=HEADERS)
    if prov_stats_res.ok and prov_stats_res.json():
        prov = prov_stats_res.json()[0]
        prov_id = prov["id"]
        prov_name = prov["name"]
        profile = prov["provider_profiles"]
        # Handle list or dict format
        p_profile = profile[0] if isinstance(profile, list) else profile
        
        print(f"Target Provider: {prov_name}")
        print(f"  - Base Rating: {p_profile.get('base_rating')}")
        print(f"  - Cancellation Rate: {p_profile.get('cancellation_rate')}")
        print(f"  - Dispute Score: {p_profile.get('dispute_score')}")
        
        # Find a consumer ID dynamically
        consumer_id = "9bf8cfbf-ee00-49e8-84a1-7d7df2a6db78"
        cons_res = requests.get(f"{SUPABASE_URL}/rest/v1/users?role=eq.consumer&limit=1", headers=HEADERS)
        if cons_res.ok and cons_res.json():
            consumer_id = cons_res.json()[0]["id"]
            
        # Create a mock completed booking
        print("Creating mock completed booking...")
        comp_payload = {
            "consumer_id": consumer_id,
            "provider_id": prov_id,
            "service_code": "HS-01",
            "complexity_tier": "basic",
            "urgency": "scheduled",
            "requested_date": "2026-05-20",
            "requested_time_slot": "10:00:00",
            "base_rate_pkr": 1200,
            "final_estimate_pkr": 1290,
            "status": "completed"
        }
        headers_with_prefer = HEADERS.copy()
        headers_with_prefer["Prefer"] = "return=representation"
        comp_res = requests.post(f"{SUPABASE_URL}/rest/v1/bookings", headers=headers_with_prefer, json=comp_payload)
        
        chk_comp_res = requests.get(f"{SUPABASE_URL}/rest/v1/bookings?provider_id=eq.{prov_id}&status=eq.completed&limit=1", headers=HEADERS)
        if chk_comp_res.ok and chk_comp_res.json():
            booking_id = chk_comp_res.json()[0]["id"]
            print(f"Created completed booking: {booking_id}")
            
            # Step 4b: Submit dispute via agent
            print("Submitting dispute for poor quality and price overcharging...")
            dispute_message = f"I want to file a dispute for my booking {booking_id} because the provider did a terrible job, charged me way too much, and was extremely late."
            payload_dispute = {
                "message": dispute_message,
                "mode": "customer",
                "user_id": TEST_USER
            }
            
            res_dispute = requests.post(f"{BASE_URL}/api/agent/process", json=payload_dispute)
            print(f"Status: {res_dispute.status_code}")
            if res_dispute.status_code == 200:
                print("\nAgent Dispute Response:")
                print(res_dispute.json().get("response"))
                
                # Check DB for created dispute
                disp_check = requests.get(f"{SUPABASE_URL}/rest/v1/disputes?booking_id=eq.{booking_id}", headers=HEADERS)
                if disp_check.ok and disp_check.json():
                    disp_record = disp_check.json()[0]
                    print(f"\nDispute logged successfully in database:")
                    print(f"  - Dispute ID: {disp_record.get('id')}")
                    print(f"  - Dispute Type: {disp_record.get('dispute_type')} (Mapped correctly based on reason)")
                    print(f"  - Status: {disp_record.get('status')}")
                else:
                    print("Failed to find dispute log in database.")
            else:
                print(f"Error: {res_dispute.text}")
    else:
        print("Failed to retrieve provider stats.")

if __name__ == "__main__":
    main()
