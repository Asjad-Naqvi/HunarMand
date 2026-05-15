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
def search_providers(service: str, location: str, time: str, budget: str = ""):
    """Searches the database for the best service providers."""
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
                    filtered.append({
                        "name": p.get("users", {}).get("name"),
                        "phone": p.get("users", {}).get("phone"),
                        "rating": p.get("rating"),
                        "specialty": p.get("service_types"),
                        "city": p.get("city"),
                        "area": p.get("area"),
                        "base_rate": p.get("base_rate")
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
        "description": "Searches the database for the best service providers based on user requirements.",
        "parameters": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Type of service (e.g. AC repair, plumbing)"},
                "location": {"type": "string", "description": "Neighborhood or city (optional)"},
                "time": {"type": "string", "description": "Requested time preference (optional)"},
                "budget": {"type": "string", "description": "Budget sensitivity (High, Medium, Low) (optional)"}
            },
            "required": ["service"]
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

# ==========================================
# 2. INITIALIZE THE CUSTOMER AGENT
# ==========================================
customer_instruction = """You are an intelligent customer service agent for a home services platform. Your job is to help customers book services like AC repair, plumbing, and cleaning.
You understand English, Urdu, and Roman Urdu fluently. Always reply in a helpful, polite, and reassuring tone.

When a customer makes a request (e.g., "I want an ac fixed"), your primary goal is to IMMEDIATELY use your tools to search the database for providers matching that service type. Do not force them to answer multiple questions first.

1. If you find providers: Present them to the customer, explaining why they are a good fit. You may optionally ask for their location to narrow down the options if needed.
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
provider_instruction = """You are an intelligent dispatch agent for a home services platform. Your job is to communicate with service providers (electricians, plumbers, AC technicians) who are looking for work.
You understand English, Urdu, and Roman Urdu fluently. Speak to providers in a professional, clear, and encouraging tone.

When a provider reaches out (e.g., "I am an ac service provider"), your primary goal is to IMMEDIATELY use your tools to check the database for any pending customer requests that match their service type. Do not interrogate them with multiple questions first.

1. If there are matching jobs: Present the job details to the provider and ask if they want to accept it.
2. If there are no jobs: Tell them "Sorry, no customer found for now."

Keep your responses conversational and fast."""

provider_agent = OddJobsAgent(
    model='llama-3.3-70b-versatile',
    name='provider_agent',
    description='Handles requests from workers looking for jobs.',
    instruction=provider_instruction,
    tools=[check_pending_jobs_tool]
)
