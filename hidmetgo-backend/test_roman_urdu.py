import requests
import json
import time
import sys

# Force stdout to use UTF-8 to prevent charmap encoding errors on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:5000"

def test_query(prompt, user_id="test_user_roman_urdu"):
    print(f"\n[TEST] Sending prompt: '{prompt}'")
    
    # First, clear history to ensure clean test context
    try:
        requests.post(f"{BASE_URL}/api/agent/clear", json={"user_id": user_id})
    except Exception as e:
        print(f"Warning: Could not clear history: {e}")
        
    payload = {
        "message": prompt,
        "mode": "customer",
        "user_id": user_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/agent/process", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("[SUCCESS] Agent Response:")
            print("-" * 60)
            print(data.get("response"))
            print("-" * 60)
            return data.get("response")
        else:
            print(f"[FAILED] HTTP {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")
        return None

if __name__ == "__main__":
    print("Testing Roman Urdu Queries on HunarMand Agent...")
    
    # 1. Test Electrician request in Roman Urdu
    test_query("Mujhay electrician chahiyay G-13 main aaj hi")
    
    time.sleep(1)
    
    # 2. Test Plumber request in Roman Urdu
    test_query("Mujhay plumber chahiyay leak faucet fix karnay k liye")
