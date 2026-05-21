import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment
dotenv_path = r"d:\oddconnector\hidmetgo\hidmetgo-backend\.env"
load_dotenv(dotenv_path=dotenv_path)

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

search_providers_tool = {
    "type": "function",
    "function": {
        "name": "search_providers",
        "description": "Searches the database for registered service providers and calculates itemized dynamic pricing.",
        "parameters": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Type of service or custom job description (e.g. AC repair, plumbing)"},
                "location": {"type": "string", "description": "Sector or city area in Islamabad (e.g. G-13, F-8)"},
                "time": {"type": "string", "description": "Requested time preference (optional)"},
                "budget": {"type": "string", "description": "Budget sensitivity (optional)"},
                "urgency": {"type": "string", "description": "Urgency of the job ('same_day' or 'next_day')"},
                "complexity": {"type": "string", "description": "Initial complexity level ('basic', 'intermediate', or 'complex')"}
            },
            "required": ["service", "urgency", "complexity"]
        }
    }
}

book_service_tool = {
    "type": "function",
    "function": {
        "name": "book_service",
        "description": "Creates/confirms a real booking in the database for the user with the specified provider and price.",
        "parameters": {
            "type": "object",
            "properties": {
                "provider_id": {"type": "string", "description": "The unique UUID of the matched provider (from search results)"},
                "service_code": {"type": "string", "description": "The service code (e.g. HS-01, HS-04)"},
                "final_estimate_pkr": {"type": "number", "description": "The exact final total rate to be charged in PKR"},
                "location": {"type": "string", "description": "The consumer's sector location (optional)"}
            },
            "required": ["provider_id", "service_code", "final_estimate_pkr"]
        }
    }
}

get_active_bookings_tool = {
    "type": "function",
    "function": {
        "name": "get_active_bookings",
        "description": "Retrieves the list of active bookings for the logged-in customer so the user can select one to cancel or dispute.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    }
}

cancel_booking_tool = {
    "type": "function",
    "function": {
        "name": "cancel_booking",
        "description": "Cancels an active booking in the database with the provided reason.",
        "parameters": {
            "type": "object",
            "properties": {
                "booking_id": {"type": "string", "description": "The unique UUID of the booking to cancel"},
                "reason": {"type": "string", "description": "The customer's reason for canceling the booking (e.g. 'changed mind', 'delay')"}
            },
            "required": ["booking_id", "reason"]
        }
    }
}

file_dispute_tool = {
    "type": "function",
    "function": {
        "name": "file_dispute",
        "description": "Files a customer dispute for a booking in the database, changing booking status to disputed.",
        "parameters": {
            "type": "object",
            "properties": {
                "booking_id": {"type": "string", "description": "The unique UUID of the booking to dispute"},
                "reason": {"type": "string", "description": "The customer's descriptive reason for the dispute (e.g. overcharged, poor quality)"}
            },
            "required": ["booking_id", "reason"]
        }
    }
}

tools = [search_providers_tool, book_service_tool, get_active_bookings_tool, cancel_booking_tool, file_dispute_tool]

customer_instruction = """You are an intelligent customer service agent for the Haazir home services platform. Your job is to help customers book services like AC repair, plumbing, and cleaning, as well as manage active jobs (cancellations and disputes).

---
CRITICAL TOOL INSTRUCTIONS:
1. When a user makes a request (e.g. "I want my AC fixed today in G-13"), invoke the `search_providers` tool.
2. When the user confirms they want to proceed and book a specific provider (e.g. "book Zahid Mehmood" or "confirm booking" or "yes go ahead"), invoke the `book_service` tool.
3. When the user wants to cancel a booking or file a dispute (e.g. "cancel my booking", "dispute this job", "booking canceled"), invoke `get_active_bookings` to fetch the list of their active bookings in the database.
4. Once you have the list of active bookings:
   - If there is exactly one active booking, or if the user confirms which booking they want to cancel/dispute, ask for the reason of cancellation or dispute if they haven't provided one.
   - Once they provide a reason, invoke the `cancel_booking` or `file_dispute` tool to commit the database update.

---
REASONING TRANSPARENCY (ONLY AFTER TOOL RETURNS):
Once the tool results are returned, in your final response to the user, you MUST explicitly include a "Show Haazir's Thinking" section detailing:
1. Message Language detection.
2. Job Complexity Classification (chosen tier: basic, intermediate, complex and why).
3. Any active Safety Warnings triggered.
4. Composite matching criteria used.
5. Exact dynamic pricing breakdown calculated (itemized: Base rate + distance + urgency + complexity - loyalty discount).

If no registered provider matches, state "No registered provider found in this sector. Fall-back to Google Maps recommendations:" and list the Google Maps fallback providers."""

try:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": customer_instruction},
            {"role": "user", "content": "I need a plumber to fix a leaking tap in G-13 immediately"}
        ],
        tools=tools,
        tool_choice="auto"
    )
    print("SUCCESS:", response)
except Exception as e:
    print("ERROR:", e)
