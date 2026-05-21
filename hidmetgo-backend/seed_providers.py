import os
import requests
import urllib.parse
import json
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

BASE_URL = f"{SUPABASE_URL}/rest/v1"

# ─── Seed Data ────────────────────────────────────────────────────────────────
# 5 realistic providers across Islamabad sectors with varying services
SEED_PROVIDERS = [
    {
        "name": "Ali Hassan",
        "phone": "+92 311 1234501",
        "sectors": ["G-13"],
        "services": [("HS-04", 2000), ("HS-03", 1800)],  # AC Repair, Electrician
        "base_rating": 4.8,
        "jobs_completed": 127,
        "hours": ("09:00:00", "19:00:00"),
    },
    {
        "name": "Usman Butt",
        "phone": "+92 311 1234502",
        "sectors": ["F-7"],
        "services": [("HS-01", 1500)],  # Plumber
        "base_rating": 4.6,
        "jobs_completed": 89,
        "hours": ("08:00:00", "18:00:00"),
    },
    {
        "name": "Rizwan Ahmed",
        "phone": "+92 311 1234503",
        "sectors": ["I-8"],
        "services": [("HS-03", 1800)],  # Electrician
        "base_rating": 4.9,
        "jobs_completed": 203,
        "hours": ("09:00:00", "21:00:00"),
    },
    {
        "name": "Babar Khan",
        "phone": "+92 311 1234504",
        "sectors": ["E-11"],
        "services": [("CS-02", 3000), ("CS-01", 2500)],  # Sofa Cleaning, Carpet Cleaning
        "base_rating": 4.5,
        "jobs_completed": 64,
        "hours": ("10:00:00", "18:00:00"),
    },
    {
        "name": "Tariq Mehmood",
        "phone": "+92 311 1234505",
        "sectors": ["D-12"],
        "services": [("HS-02", 4000)],  # Carpenter
        "base_rating": 4.7,
        "jobs_completed": 41,
        "hours": ("09:00:00", "18:00:00"),
    },
    {
        "name": "Zahid Mehmood",
        "phone": "+92 311 1234506",
        "sectors": ["G-13", "G-14", "G-11", "F-11"],
        "services": [("HS-01", 1600), ("HS-03", 1400)],  # Plumber, Electrician
        "base_rating": 4.9,
        "jobs_completed": 182,
        "hours": ("08:00:00", "20:00:00"),
    },
    {
        "name": "Kashif Anwar",
        "phone": "+92 311 1234507",
        "sectors": ["F-7", "F-6", "F-8", "E-11"],
        "services": [("HS-04", 2200), ("CS-02", 3200), ("CS-01", 2600)],  # AC Repair, Sofa Cleaning, Carpet Cleaning
        "base_rating": 4.7,
        "jobs_completed": 110,
        "hours": ("09:00:00", "22:00:00"),
    },
    {
        "name": "Muhammad Irfan",
        "phone": "+92 311 1234508",
        "sectors": ["I-8", "I-9", "I-10", "H-13"],
        "services": [("HS-02", 3800), ("HS-01", 1800)],  # Carpenter Work, Plumber
        "base_rating": 4.8,
        "jobs_completed": 94,
        "hours": ("08:00:00", "19:00:00"),
    },
]

def upsert_user(name, phone, role="provider"):
    """Create or skip user by phone (handles duplicate gracefully)."""
    payload = {"name": name, "phone": phone, "role": role}
    res = requests.post(f"{BASE_URL}/users", headers=headers, json=payload)
    if res.status_code not in (201, 409):
        print(f"  ⚠ User insert unexpected status {res.status_code}: {res.text}")

    # Retrieve the user ID
    encoded = urllib.parse.quote(phone)
    get_res = requests.get(f"{BASE_URL}/users?phone=eq.{encoded}&select=id", headers=headers)
    if not get_res.ok or not get_res.json():
        print(f"  ✗ Could not retrieve user ID for {name}")
        return None
    return get_res.json()[0]["id"]

def upsert_provider_profile(user_id, base_rating, jobs_completed):
    """Upsert provider_profiles row (skip if already exists)."""
    payload = {
        "user_id": user_id,
        "availability_status": "available",
        "base_rating": base_rating,
        "punctuality_rating": base_rating,
        "quality_rating": base_rating,
        "behaviour_rating": base_rating,
        "jobs_completed": jobs_completed,
        "cancellation_rate": 0.05,
        "dispute_score": 0.95,
        "total_earnings_simulated": jobs_completed * 1500,
        "account_status": "active"
    }
    res = requests.post(f"{BASE_URL}/provider_profiles", headers={
        **headers,
        "Prefer": "resolution=ignore-duplicates,return=representation"
    }, json=payload)
    if res.status_code not in (200, 201):
        print(f"  ⚠ Profile insert status {res.status_code}: {res.text}")

def upsert_service(user_id, service_code, rate):
    """Insert provider service row (skip if already exists)."""
    payload = {
        "provider_id": user_id,
        "service_code": service_code,
        "per_job_rate_pkr": rate,
        "is_primary": True
    }
    # Use upsert with on_conflict to avoid duplicates
    res = requests.post(f"{BASE_URL}/provider_services", headers={
        **headers,
        "Prefer": "resolution=ignore-duplicates,return=representation"
    }, json=payload)
    if res.status_code not in (200, 201):
        print(f"  ⚠ Service insert status {res.status_code}: {res.text}")

def upsert_sector(user_id, sector_code):
    """Insert provider sector row (skip if already exists)."""
    payload = {"provider_id": user_id, "sector_code": sector_code}
    res = requests.post(f"{BASE_URL}/provider_sectors", headers={
        **headers,
        "Prefer": "resolution=ignore-duplicates,return=representation"
    }, json=payload)
    if res.status_code not in (200, 201):
        print(f"  ⚠ Sector insert status {res.status_code}: {res.text}")

def upsert_availability(user_id, open_time, close_time):
    """Insert weekly availability slots (Mon–Sun) for provider."""
    for day in range(7):
        payload = {
            "provider_id": user_id,
            "day_of_week": day,
            "open_time": open_time,
            "close_time": close_time
        }
        res = requests.post(f"{BASE_URL}/provider_availability", headers={
            **headers,
            "Prefer": "resolution=ignore-duplicates,return=representation"
        }, json=payload)
        if res.status_code not in (200, 201):
            # Availability table may not exist yet — skip silently
            break

def seed():
    print("=" * 65)
    print(" HUNARMAND — SEEDING DUMMY PROVIDERS INTO SUPABASE ")
    print("=" * 65)

    for p in SEED_PROVIDERS:
        sectors_display = ", ".join(p.get("sectors") or [p.get("sector", "unknown")])
        print(f"\n>> Seeding: {p['name']} ({sectors_display})...")

        # 1. Create / retrieve user
        user_id = upsert_user(p["name"], p["phone"])
        if not user_id:
            print(f"  [ERROR] Skipping {p['name']} — could not get user ID")
            continue
        print(f"  [OK] User ID: {user_id}")

        # 2. Provider profile
        upsert_provider_profile(user_id, p["base_rating"], p["jobs_completed"])
        print(f"  [OK] Profile created/updated (rating={p['base_rating']}, jobs={p['jobs_completed']})")

        # 3. Services
        for service_code, rate in p["services"]:
            upsert_service(user_id, service_code, rate)
        print(f"  [OK] Services: {[s[0] for s in p['services']]}")

        # 4. Sector coverage
        sectors = p.get("sectors") or [p["sector"]]
        for s in sectors:
            upsert_sector(user_id, s)
        print(f"  [OK] Sectors: {sectors}")

        # 5. Availability
        open_t, close_t = p["hours"]
        upsert_availability(user_id, open_t, close_t)
        print(f"  [OK] Availability: {open_t} -> {close_t}")

    print("\n" + "=" * 65)
    print(" SEEDING COMPLETE! All providers loaded into Supabase. ")
    print("=" * 65)

if __name__ == "__main__":
    seed()
