import os
import json
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq API Client
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

# Setup Supabase Config
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

class OddJobsAgent:
    """OddJobs AI Agent powered by Groq"""
    
    def __init__(self, model='llama-3.3-70b-versatile', name='root_agent', description='', instruction='', tools=None):
        self.name = name
        self.description = description
        self.instruction = instruction
        self.model = model
        self.tools = tools
        
        # Groq requires maintaining the chat history manually as a list
        self.chat_history = [
            {"role": "system", "content": instruction}
        ]
    
    def generate_response(self, message):
        """
        Generate AI response using Groq (with automatic tool execution)
        """
        self.chat_history.append({"role": "user", "content": message})
        
        try:
            # 1. Send the message and tools to Groq
            kwargs = {
                "model": self.model,
                "messages": self.chat_history
            }
            if self.tools:
                kwargs["tools"] = self.tools
                kwargs["tool_choice"] = "auto"
                
            response = client.chat.completions.create(**kwargs)
            
            response_message = response.choices[0].message
            
            # 2. Check if Groq decided to use a tool
            if response_message.tool_calls:
                self.chat_history.append({
                    "role": "assistant",
                    "content": response_message.content or "",
                    "tool_calls": [{
                        "id": tool.id,
                        "type": "function",
                        "function": {
                            "name": tool.function.name,
                            "arguments": tool.function.arguments
                        }
                    } for tool in response_message.tool_calls]
                })
                
                # Execute all requested tools
                for tool_call in response_message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    
                    print(f"Agent triggered tool: {function_name} with args: {function_args}")
                    
                    if function_name == "search_providers":
                        function_response = search_providers(**function_args)
                    elif function_name == "check_pending_jobs":
                        function_response = check_pending_jobs(**function_args)
                    elif function_name == "register_provider":
                        function_response = register_provider(**function_args)
                    else:
                        function_response = {"error": "Unknown tool"}
                        
                    # Add the tool result back into the chat history
                    self.chat_history.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps(function_response),
                    })
                
                # 3. Send the tool results back to Groq so it can write a final response
                second_response = client.chat.completions.create(
                    model=self.model,
                    messages=self.chat_history
                )
                final_text = second_response.choices[0].message.content
                self.chat_history.append({"role": "assistant", "content": final_text})
                return final_text
                
            else:
                # Normal conversational response
                self.chat_history.append({"role": "assistant", "content": response_message.content})
                return response_message.content
                
        except Exception as e:
            return f"Error generating response: {str(e)}"

# ==========================================
# 1. DEFINE TOOLS AND GROQ SCHEMAS
# ==========================================
def search_providers(service: str, location: str = "", time: str = "", budget: str = "", urgency: str = "next_day", complexity: str = "basic"):
    """Searches the database for the best service providers and calculates dynamic pricing."""
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    query_url = f"{base_url}/provider_profiles?select=*,users(name,phone)"
    
    try:
        response = requests.get(query_url, headers=get_supabase_headers())
        if response.ok:
            data = response.json()
            filtered = []
            for p in data:
                # Check if the requested service matches their capabilities
                services = [s.lower() for s in p.get('service_types', [])]
                if any(service.lower() in s for s in services):
                    base_rate = float(p.get("base_rate", 1000))
                    
                    # Calculate dynamic pricing
                    distance_surcharge = 200.0 # Mocked distance
                    
                    urgency_mult = 1.3 if urgency == "same_day" else 1.0
                    
                    complexity_map = {"basic": 0.0, "intermediate": 500.0, "complex": 1500.0}
                    complexity_surcharge = complexity_map.get(complexity, 0.0)
                    
                    loyalty_discount = 150.0 # Mock discount
                    
                    subtotal = (base_rate + distance_surcharge + complexity_surcharge) * urgency_mult
                    final_price = max(subtotal - loyalty_discount, 0)
                    
                    pricing_breakdown = {
                        "base_rate": base_rate,
                        "distance_surcharge": distance_surcharge,
                        "complexity_surcharge": complexity_surcharge,
                        "urgency_multiplier": urgency_mult,
                        "subtotal_before_discount": subtotal,
                        "loyalty_discount": loyalty_discount,
                        "final_total": final_price
                    }

                    filtered.append({
                        "name": p.get("users", {}).get("name"),
                        "phone": p.get("users", {}).get("phone"),
                        "rating": p.get("rating"),
                        "specialty": p.get("service_types"),
                        "city": p.get("city"),
                        "area": p.get("area"),
                        "pricing_breakdown": pricing_breakdown
                    })
            if filtered:
                return {"status": "success", "providers": filtered}
            else:
                return {"status": "success", "message": f"No providers found for {service} in our database."}
        else:
            return {"error": response.text}
    except Exception as e:
        return {"error": str(e)}

search_providers_tool = {
    "type": "function",
    "function": {
        "name": "search_providers",
        "description": "Searches the database for the best service providers and calculates dynamic pricing.",
        "parameters": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Type of service (e.g. AC repair, plumbing)"},
                "location": {"type": "string", "description": "Neighborhood or city (optional)"},
                "time": {"type": "string", "description": "Requested time preference (optional)"},
                "budget": {"type": "string", "description": "Budget sensitivity (High, Medium, Low) (optional)"},
                "urgency": {"type": "string", "description": "Urgency of the job ('same_day', 'next_day', or 'flexible')"},
                "complexity": {"type": "string", "description": "Complexity of the job ('basic', 'intermediate', or 'complex')"}
            },
            "required": ["service", "urgency", "complexity"]
        }
    }
}

def check_pending_jobs(service_type: str, provider_location: str):
    """Checks for unassigned customer requests for a provider."""
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    query_url = f"{base_url}/service_requests?status=eq.open&select=*"
    
    try:
        response = requests.get(query_url, headers=get_supabase_headers())
        if response.ok:
            data = response.json()
            filtered = []
            for req in data:
                if service_type.lower() in req.get('service_type', '').lower():
                    filtered.append({
                        "raw_message": req.get("raw_message"),
                        "service_type": req.get("service_type"),
                        "area": req.get("area"),
                        "urgency": req.get("urgency"),
                        "budget_sensitive": req.get("budget_sensitive")
                    })
            if filtered:
                return {"status": "success", "jobs": filtered}
            else:
                return {"status": "success", "message": f"No open jobs found for {service_type}."}
        else:
            return {"error": response.text}
    except Exception as e:
        return {"error": str(e)}

check_pending_jobs_tool = {
    "type": "function",
    "function": {
        "name": "check_pending_jobs",
        "description": "Checks for unassigned customer requests that match a provider's skills.",
        "parameters": {
            "type": "object",
            "properties": {
                "service_type": {"type": "string", "description": "The specific service they offer"},
                "provider_location": {"type": "string", "description": "The provider's location (optional)"}
            },
            "required": ["service_type"]
        }
    }
}

def register_provider(name: str, phone: str, location: str, service_types: list, hours: str = "09:00 to 18:00", base_rate: int = 1000):
    """Registers a new provider in the database."""
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    headers = get_supabase_headers()
    
    try:
        user_payload = {"name": name, "phone": phone, "role": "provider"}
        user_res = requests.post(f"{base_url}/users", headers=headers, json=user_payload)
        
        user_get = requests.get(f"{base_url}/users?phone=eq.{phone}&select=id", headers=headers)
        if not user_get.ok or len(user_get.json()) == 0:
            return {"error": f"Failed to get or create user: {user_res.text}"}
        user_id = user_get.json()[0]['id']
        
        available_from = "09:00"
        available_to = "18:00"
        if "to" in hours.lower():
            parts = hours.lower().split("to")
            available_from = parts[0].strip()
            available_to = parts[1].strip()
            
        profile_payload = {
            "user_id": user_id,
            "service_types": service_types,
            "city": "Islamabad",
            "area": location,
            "available_from": available_from,
            "available_to": available_to,
            "base_rate": base_rate,
            "is_available": True,
            "rating": 5.0,
            "total_reviews": 0,
            "bio": f"Newly registered provider specializing in {', '.join(service_types)}."
        }
        
        prof_res = requests.post(f"{base_url}/provider_profiles", headers=headers, json=profile_payload)
        if prof_res.ok or "23505" in prof_res.text:
            return {"status": "success", "message": f"Successfully onboarded business owner {name}."}
        else:
            return {"error": f"Failed to create profile: {prof_res.text}"}
    except Exception as e:
        return {"error": str(e)}

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
                "location": {"type": "string", "description": "Neighborhood or city (e.g. G-13)"},
                "service_types": {"type": "array", "items": {"type": "string"}, "description": "List of services they offer"},
                "hours": {"type": "string", "description": "Operating hours (e.g. '09:00 to 18:00')"},
                "base_rate": {"type": "number", "description": "Starting price or hourly rate in RS"}
            },
            "required": ["name", "phone", "location", "service_types"]
        }
    }
}

# ==========================================
# 2. INITIALIZE THE CUSTOMER AGENT
# ==========================================
customer_instruction = """You are an intelligent customer service agent for a home services platform. Your job is to help customers book services like AC repair, plumbing, and cleaning.
You understand English, Urdu, and Roman Urdu fluently. Always reply in a helpful, polite, and reassuring tone.

When a customer makes a request (e.g., "I want an ac fixed today"), your primary goal is to IMMEDIATELY use your tools to search the database for providers matching that service type. Extract the urgency (same_day, next_day) and complexity (basic, intermediate, complex) from their request to pass to the tool.

1. If you find providers: Present them to the customer. You MUST show the full dynamic pricing breakdown (Base rate + distance surcharge + urgency multiplier + job complexity - loyalty discount) for the top provider as calculated by the tool. Always show the full breakdown clearly, not just the final number.
2. If you don't find any providers: Tell them "Sorry, no service provider found for now."

Keep your responses conversational and fast."""

customer_agent = OddJobsAgent(
    model='llama-3.3-70b-versatile',
    name='customer_agent',
    description='Handles requests from people looking to hire workers.',
    instruction=customer_instruction,
    tools=[search_providers_tool]
)

# ==========================================
# 3. INITIALIZE THE PROVIDER AGENT
# ==========================================
provider_instruction = """You are a smart onboarding and dispatch agent for business owners.

When a new business owner or provider connects, warmly welcome them and ask for their information to onboard them onto the platform:
- Full Name or Business Name
- Phone number
- Location / City Area
- Types of services they provide
- Operating hours
- Starting base rate

Have a natural conversation. Do not ask everything at once. Once you have enough details, MUST use the `register_provider` tool to save them to the database.

If they are already registered or just asking for work (e.g., "I am an ac provider looking for jobs"), use the `check_pending_jobs` tool to check the database for any pending customer requests that match their service type. Be professional and helpful."""

provider_agent = OddJobsAgent(
    model='llama-3.3-70b-versatile',
    name='provider_agent',
    description='Handles onboarding and job dispatch for business owners.',
    instruction=provider_instruction,
    tools=[check_pending_jobs_tool, register_provider_tool]
)
