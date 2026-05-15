import os
import sys
import requests
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}
base_url = f"{supabase_url}/rest/v1"

# ==========================================
# SEED USERS
# ==========================================
users = [
    # Customers
    {"phone": "0311-1111111", "name": "Ahmed Khan", "role": "customer"},
    {"phone": "0322-2222222", "name": "Sara Malik", "role": "customer"},
    {"phone": "0333-3333333", "name": "Bilal Raza", "role": "customer"},

    # Providers
    {"phone": "0301-4444444", "name": "Asif Technician", "role": "provider"},
    {"phone": "0302-5555555", "name": "Mohammad Raza", "role": "provider"},
    {"phone": "0303-6666666", "name": "Salman Bros", "role": "provider"},
    {"phone": "0304-7777777", "name": "Usman Plumber", "role": "provider"},
    {"phone": "0305-8888888", "name": "Tariq Electrician", "role": "provider"},
]

print("Seeding users...")
res = requests.post(f"{base_url}/users", headers=headers, json=users)
if not res.ok:
    if "23505" in res.text:
        print("[INFO] Users already exist, skipping insertion.")
    else:
        print("Error inserting users:", res.text)
        sys.exit(1)
else:
    inserted_users = res.json()
    print(f"[SUCCESS] Inserted {len(inserted_users)} users")

all_users_res = requests.get(f"{base_url}/users?select=*", headers=headers)
all_users = all_users_res.json()
providers = [u for u in all_users if u['role'] == 'provider']
customers = [u for u in all_users if u['role'] == 'customer']

print(f"Providers: {[p['name'] for p in providers]}")

# ==========================================
# SEED PROVIDER PROFILES
# ==========================================
provider_profiles = [
    {
        "user_id": providers[0]['id'],
        "service_types": ["AC repair", "AC installation", "AC service"],
        "bio": "8 saal ka tajurba AC repair mein. Certified technician.",
        "years_experience": 8,
        "city": "Islamabad",
        "area": "G-13",
        "latitude": 33.6844,
        "longitude": 73.0479,
        "rating": 4.8,
        "total_reviews": 124,
        "on_time_score": 96.0,
        "cancellation_rate": 2.0,
        "reliability_score": 97.0,
        "is_available": True,
        "available_from": "08:00",
        "available_to": "20:00",
        "base_rate": 1800,
        "skill_level": "expert",
        "certifications": ["AC Certified", "HVAC trained"]
    },
    {
        "user_id": providers[1]['id'],
        "service_types": ["AC repair", "AC service", "fridge repair"],
        "bio": "General technician, AC aur fridge dono theek karta hoon.",
        "years_experience": 3,
        "city": "Islamabad",
        "area": "G-11",
        "latitude": 33.6938,
        "longitude": 73.0436,
        "rating": 4.1,
        "total_reviews": 45,
        "on_time_score": 78.0,
        "cancellation_rate": 12.0,
        "reliability_score": 75.0,
        "is_available": True,
        "available_from": "09:00",
        "available_to": "18:00",
        "base_rate": 1400,
        "skill_level": "intermediate",
        "certifications": []
    },
    {
        "user_id": providers[2]['id'],
        "service_types": ["AC repair", "AC installation", "fridge repair"],
        "bio": "Salman Bros — family business, 15 saal se service kar rahe hain.",
        "years_experience": 15,
        "city": "Islamabad",
        "area": "F-10",
        "latitude": 33.7077,
        "longitude": 73.0513,
        "rating": 4.6,
        "total_reviews": 230,
        "on_time_score": 85.0,
        "cancellation_rate": 18.0,
        "reliability_score": 80.0,
        "is_available": True,
        "available_from": "07:00",
        "available_to": "22:00",
        "base_rate": 2200,
        "skill_level": "expert",
        "certifications": ["AC Certified", "Fridge Specialist"]
    },
    {
        "user_id": providers[3]['id'],
        "service_types": ["plumbing", "pipe repair", "bathroom fitting"],
        "bio": "Plumbing ka kaam 10 saal se kar raha hoon.",
        "years_experience": 10,
        "city": "Islamabad",
        "area": "I-8",
        "latitude": 33.6679,
        "longitude": 73.0850,
        "rating": 4.5,
        "total_reviews": 89,
        "on_time_score": 90.0,
        "cancellation_rate": 5.0,
        "reliability_score": 92.0,
        "is_available": True,
        "available_from": "08:00",
        "available_to": "19:00",
        "base_rate": 1200,
        "skill_level": "expert",
        "certifications": ["Plumbing Certified"]
    },
    {
        "user_id": providers[4]['id'],
        "service_types": ["electrician", "wiring", "meter repair"],
        "bio": "Bijli ka kaam, wiring, meter sab kuch.",
        "years_experience": 6,
        "city": "Islamabad",
        "area": "G-9",
        "latitude": 33.7000,
        "longitude": 73.0600,
        "rating": 4.3,
        "total_reviews": 67,
        "on_time_score": 88.0,
        "cancellation_rate": 7.0,
        "reliability_score": 89.0,
        "is_available": True,
        "available_from": "09:00",
        "available_to": "21:00",
        "base_rate": 1500,
        "skill_level": "intermediate",
        "certifications": ["Electrical Safety Certified"]
    },
]

print("\nSeeding provider profiles...")
res_prof = requests.post(f"{base_url}/provider_profiles", headers=headers, json=provider_profiles)
if not res_prof.ok:
    print("Error inserting provider profiles:", res_prof.text)
else:
    print(f"[SUCCESS] Inserted {len(res_prof.json())} provider profiles")

# ==========================================
# SEED OPEN SERVICE REQUESTS
# ==========================================
service_requests = [
    {
        "customer_id": customers[0]['id'],
        "raw_message": "AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye",
        "service_type": "AC repair",
        "urgency": "high",
        "area": "G-13",
        "latitude": 33.6844,
        "longitude": 73.0479,
        "budget_sensitive": True,
        "language_detected": "roman_urdu",
        "confidence_score": 95.0,
        "status": "open"
    },
    {
        "customer_id": customers[1]['id'],
        "raw_message": "Pipe leak ho rahi hai bathroom mein, aaj fix karwana hai",
        "service_type": "plumbing",
        "urgency": "high",
        "area": "F-10",
        "latitude": 33.7077,
        "longitude": 73.0513,
        "budget_sensitive": False,
        "language_detected": "roman_urdu",
        "confidence_score": 90.0,
        "status": "open"
    },
    {
        "customer_id": customers[2]['id'],
        "raw_message": "Ghar ki wiring mein masla hai, bijli baar baar jaati hai",
        "service_type": "electrician",
        "urgency": "medium",
        "area": "G-9",
        "latitude": 33.7000,
        "longitude": 73.0600,
        "budget_sensitive": False,
        "language_detected": "roman_urdu",
        "confidence_score": 88.0,
        "status": "open"
    },
]

print("\nSeeding service requests...")
res_req = requests.post(f"{base_url}/service_requests", headers=headers, json=service_requests)
if not res_req.ok:
    print("Error inserting service requests:", res_req.text)
else:
    print(f"[SUCCESS] Inserted {len(res_req.json())} service requests")

print("\n[DONE] Database seeded successfully!")
print(f"   {len(customers)} customers")
print(f"   {len(providers)} providers")
print(f"   {len(provider_profiles)} provider profiles")
print(f"   {len(service_requests)} open service requests")