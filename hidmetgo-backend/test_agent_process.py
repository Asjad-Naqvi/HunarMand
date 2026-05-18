import requests
import json
import time
import sys
from app.hidmetgo_agent.agent import register_provider

# Force stdout to use UTF-8 to prevent charmap encoding errors on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:5000"

def reset_session():
    """Call backend clear history endpoint to start with a fresh slate"""
    try:
        requests.post(f"{BASE_URL}/api/agent/clear")
    except Exception:
        pass

def test_customer_agent_fallback():
    print("\n[TEST 1] Testing Customer Agent with Safety Warning & Google Maps Fallback...")
    reset_session()
    
    # electrician service (empty in database)
    payload = {
        "message": "I need an electrician to fix an active spark in my wiring in G-13 today",
        "mode": "customer",
        "user_id": "test_consumer_123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/agent/process", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("[SUCCESS] Customer Agent Response Received:")
            print("-" * 60)
            print(data.get("response"))
            print("-" * 60)
        else:
            print(f"[FAILED] HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")

def test_provider_onboarding():
    print("\n[TEST 2] Testing Direct Provider Onboarding to Database (Registering Ali Plumber)...")
    
    try:
        # Register Ali directly in the Supabase database
        res = register_provider(
            name="Ali Plumber",
            phone="+923129988111",
            location="G-13",
            service_types=["plumbing"],
            hours="09:00 to 18:00",
            base_rate=1200
        )
        print("[SUCCESS] Direct Database Onboarding Result:")
        print("-" * 60)
        print(json.dumps(res, indent=2))
        print("-" * 60)
    except Exception as e:
        print(f"[ERROR] Onboarding failed: {e}")

def test_customer_agent_registered():
    print("\n[TEST 3] Testing Customer Agent searching for the newly registered Plumber (Ali)...")
    reset_session()
    
    payload = {
        "message": "I need a plumber to fix a leaking tap in G-13 immediately",
        "mode": "customer",
        "user_id": "test_consumer_456"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/agent/process", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("[SUCCESS] Customer Agent Found Registered Provider:")
            print("-" * 60)
            print(data.get("response"))
            print("-" * 60)
        else:
            print(f"[FAILED] HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")

if __name__ == "__main__":
    print("Waiting 2 seconds for Flask server to fully initialize...")
    time.sleep(2)
    test_customer_agent_fallback()
    test_provider_onboarding()
    time.sleep(1) # Allow database propagation
    test_customer_agent_registered()
