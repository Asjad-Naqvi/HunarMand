import os
import sys

# Ensure backend path is available
backend_dir = r"d:\\oddconnector\\hidmetgo\\hidmetgo-backend"
sys.path.append(backend_dir)
sys.path.append(os.path.join(backend_dir, "app"))

from app.hidmetgo_agent.agent import register_provider, search_providers, book_service

def run_demo():
    # 1. Register new provider 'amir'
    print("Registering provider 'amir'...")
    reg_res = register_provider(
        name="amir",
        phone="+92 311 1234567",
        location="H-13",
        service_types=["carpet cleaning"],
        hours="09:00 to 18:00",
        base_rate=1500
    )
    print("Registration response:", reg_res)

    # 2. Search for carpet cleaning providers at H-13
    print("\nSearching for carpet cleaning providers at H-13...")
    search_res = search_providers(
        service="carpet cleaning",
        location="H-13"
    )
    if search_res.get("error"):
        print("Search error:", search_res["error"]) 
        return
    providers = search_res.get("registered_providers", [])
    if not providers:
        print("No providers found.")
        return
    # Choose first provider (should be amir)
    chosen = providers[0]
    provider_id = chosen["provider_id"]
    service_code = search_res.get("service_code", "CS-01")
    final_price = chosen.get("pricing_breakdown", {}).get("final_total")
    print("Chosen provider:")
    print(f"  ID: {provider_id}")
    print(f"  Name: {chosen.get('name')}")
    print(f"  Phone: {chosen.get('phone')}")
    print(f"  Service Code: {service_code}")
    print(f"  Final Price: {final_price}")

    # 3. Book the service
    print("\nBooking the service...")
    booking_res = book_service(
        provider_id=provider_id,
        service_code=service_code,
        final_estimate_pkr=final_price,
        location="H-13"
    )
    print("Booking response:", booking_res)

if __name__ == "__main__":
    run_demo()
