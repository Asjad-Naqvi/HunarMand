import sys
import os

# Add backend and agent directories to path
this_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = r"d:\oddconnector\hidmetgo\hidmetgo-backend"
sys.path.append(backend_dir)
sys.path.append(os.path.join(backend_dir, "app"))

from app.hidmetgo_agent.agent import register_provider

def run():
    print("Registering 'Ali Electronics' under service type 'electronics'...")
    res = register_provider(
        name="Ali Electronics",
        phone="+92 300 1234567",
        location="G-13",
        service_types=["electronics"],
        hours="09:00 to 18:00",
        base_rate=1500
    )
    print("Registration response:", res)

if __name__ == "__main__":
    run()
