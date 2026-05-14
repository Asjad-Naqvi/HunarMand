import os
import json
from groq import Groq

# Initialize Groq API Client
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

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
    # TODO: Connect to your database here
    return {"status": "success", "providers": [{"name": "Provider A", "rating": 4.8, "specialty": service}]}

search_providers_tool = {
    "type": "function",
    "function": {
        "name": "search_providers",
        "description": "Searches the database for the best service providers based on user requirements.",
        "parameters": {
            "type": "object",
            "properties": {
                "service": {"type": "string", "description": "Type of service (e.g. AC repair, plumbing)"},
                "location": {"type": "string", "description": "Neighborhood or city"},
                "time": {"type": "string", "description": "Requested time preference"},
                "budget": {"type": "string", "description": "Budget sensitivity (High, Medium, Low)"}
            },
            "required": ["service", "location", "time"]
        }
    }
}

def check_pending_jobs(service_type: str, provider_location: str):
    """Checks for unassigned customer requests for a provider."""
    # TODO: Connect to your database here
    return {"status": "success", "jobs": [{"location": "G-13", "urgency": "High", "service": service_type}]}

check_pending_jobs_tool = {
    "type": "function",
    "function": {
        "name": "check_pending_jobs",
        "description": "Checks for unassigned customer requests that match a provider's skills.",
        "parameters": {
            "type": "object",
            "properties": {
                "service_type": {"type": "string", "description": "The specific service they offer"},
                "provider_location": {"type": "string", "description": "The provider's location"}
            },
            "required": ["service_type", "provider_location"]
        }
    }
}

# ==========================================
# 2. INITIALIZE THE CUSTOMER AGENT
# ==========================================
customer_instruction = """You are an intelligent customer service agent for a home services platform. Your job is to help customers book services like AC repair, plumbing, and cleaning.
You understand English, Urdu, and Roman Urdu fluently. Always reply in a helpful, polite, and reassuring tone.

When a customer makes a request, your goal is to extract the following information:
- Service Type (e.g., AC repair)
- Issue Severity (High, Medium, Low)
- Location (e.g., G-13)
- Time Preference (e.g., Tomorrow morning)
- Price Sensitivity/Budget

If any of this information is missing, ask the user politely for the missing details.
Once you have the information, you must use your available tools to search the database for the best providers. 
When recommending a provider, explain WHY you chose them."""

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

When a provider reaches out (e.g., "kya kisi ko AC theek karwana hay"), your goal is to extract:
- The specific service they are offering (e.g., AC Repair)
- Their current location
- Their availability (e.g., right now, tomorrow)

If they don't provide this information, ask them for it.
Once you have their details, use your tools to check the database for any pending customer requests that match their skills and location.
If there is a match, present the job details and ask if they accept it."""

provider_agent = OddJobsAgent(
    model='llama-3.3-70b-versatile',
    name='provider_agent',
    description='Handles requests from workers looking for jobs.',
    instruction=provider_instruction,
    tools=[check_pending_jobs_tool]
)
