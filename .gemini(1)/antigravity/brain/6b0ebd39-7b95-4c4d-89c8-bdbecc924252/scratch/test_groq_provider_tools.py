import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment
dotenv_path = r"d:\oddconnector\hidmetgo\hidmetgo-backend\.env"
load_dotenv(dotenv_path=dotenv_path)

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

check_pending_jobs_tool = {
    "type": "function",
    "function": {
        "name": "check_pending_jobs",
        "description": "Checks for unassigned customer requests that match a provider's skills.",
        "parameters": {
            "type": "object",
            "properties": {
                "service_type": {"type": "string", "description": "The specific service they offer (e.g. AC repair, plumbing)"},
                "provider_location": {"type": "string", "description": "The provider's location (optional)"}
            },
            "required": ["service_type"]
        }
    }
}

register_provider_tool = {
    "type": "function",
    "function": {
        "name": "register_provider",
        "description": "Registers a new business owner or service provider into the database.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Name of the business or provider"},
                "phone": {"type": "string", "description": "Phone number"},
                "location": {"type": "string", "description": "Islamabad sector area (e.g. G-13, F-8)"},
                "service_types": {"type": "array", "items": {"type": "string"}, "description": "List of services they offer"},
                "hours": {"type": "string", "description": "Operating hours (e.g. '09:00 to 18:00')"},
                "base_rate": {"type": "number", "description": "Starting hourly base rate in PKR"}
            },
            "required": ["name", "phone", "location", "service_types"]
        }
    }
}

tools = [check_pending_jobs_tool, register_provider_tool]

try:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an onboarding agent."},
            {"role": "user", "content": "My name is Zahid, my phone is 03001234567, location is G-13, and I do plumbing."}
        ],
        tools=tools,
        tool_choice="auto"
    )
    print("SUCCESS:", response)
except Exception as e:
    print("ERROR:", e)
