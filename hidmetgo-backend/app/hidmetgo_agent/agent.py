import os
import json
import requests
from groq import Groq
from dotenv import load_dotenv

# Explicitly load the backend .env regardless of working directory
_this_dir = os.path.dirname(os.path.abspath(__file__))
_backend_env = os.path.join(_this_dir, '..', '..', '.env')
load_dotenv(dotenv_path=_backend_env, override=True)

# Initialize Groq API Client
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

# Setup Supabase Config
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"  # Returns representation on inserts/updates
    }

class OddJobsAgent:
    """OddJobs AI Agent powered by Groq"""
    
    def __init__(self, model='llama-3.3-70b-versatile', name='root_agent', description='', instruction='', tools=None):
        self.name = name
        self.description = description
        self.instruction = instruction
        self.model = model
        self.tools = tools
        self.user_histories = {}

    def get_user_history(self, user_id=None):
        if not user_id:
            user_id = "anonymous"
        if not hasattr(self, 'user_histories'):
            self.user_histories = {}
        if user_id not in self.user_histories:
            self.user_histories[user_id] = [
                {"role": "system", "content": self.instruction}
            ]
        return self.user_histories[user_id]

    def clear_history(self, user_id=None):
        """Clears the chat history back to just the system instruction"""
        if not hasattr(self, 'user_histories'):
            self.user_histories = {}
        if user_id:
            self.user_histories[user_id] = [
                {"role": "system", "content": self.instruction}
            ]
        else:
            self.user_histories = {}
            # Reset anonymous as well
            self.user_histories["anonymous"] = [
                {"role": "system", "content": self.instruction}
            ]

    @property
    def chat_history(self):
        return self.get_user_history("anonymous")

    @chat_history.setter
    def chat_history(self, val):
        if not hasattr(self, 'user_histories'):
            self.user_histories = {}
        self.user_histories["anonymous"] = val

    def generate_response(self, message, user_id=None):
        """
        Generate AI response using Groq (with automatic tool execution)
        """
        self.active_user_id = user_id
        history = self.get_user_history(user_id)
        history.append({"role": "user", "content": message})
        
        try:
            # 1. Send the message and tools to Groq
            kwargs = {
                "model": self.model,
                "messages": history
            }
            if self.tools:
                kwargs["tools"] = self.tools
                kwargs["tool_choice"] = "auto"
                
            response = client.chat.completions.create(**kwargs)
            
            response_message = response.choices[0].message
            
            # 2. Check if Groq decided to use a tool
            if response_message.tool_calls:
                history.append({
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
                    try:
                        function_args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
                    except Exception:
                        function_args = {}
                    if not isinstance(function_args, dict):
                        function_args = {}
                    
                    print(f"Agent triggered tool: {function_name} with args: {function_args}")
                    
                    if function_name == "search_providers":
                        function_response = search_providers(**function_args)
                    elif function_name == "book_service":
                        function_response = book_service(**function_args)
                    elif function_name == "get_active_bookings":
                        function_response = get_active_bookings()
                    elif function_name == "cancel_booking":
                        function_response = cancel_booking(**function_args)
                    elif function_name == "file_dispute":
                        function_response = file_dispute(**function_args)
                    elif function_name == "check_pending_jobs":
                        function_response = check_pending_jobs(**function_args)
                    elif function_name == "register_provider":
                        function_response = register_provider(**function_args)
                    else:
                        function_response = {"error": "Unknown tool"}
                        
                    # Add the tool result back into the chat history
                    history.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps(function_response),
                    })
                
                # 3. Send the tool results back to Groq so it can write a final response
                second_response = client.chat.completions.create(
                    model=self.model,
                    messages=history
                )
                final_text = second_response.choices[0].message.content
                history.append({"role": "assistant", "content": final_text})
                return final_text
                
            else:
                # Normal conversational response
                history.append({"role": "assistant", "content": response_message.content})
                return response_message.content
                
        except Exception as e:
            return f"Error generating response: {str(e)}"

# ==========================================
# 1. CORE ALGORITHMIC HELPERS
# ==========================================
def classify_complexity(message: str):
    """
    Classifies a customer request message into one of three complexity tiers:
    'basic', 'intermediate', 'complex'.
    Also returns safety warning triggers if applicable.
    """
    message_lower = message.lower()
    
    # Base classification
    tier = "basic"
    
    # Intermediate keywords
    intermediate_keywords = ["repair", "fix", "install", "dismount", "fitting", "geyser", "wiring", "leakage", "leak"]
    if any(k in message_lower for k in intermediate_keywords):
        tier = "intermediate"
        
    # Complex keywords
    complex_keywords = ["compressor", "pcb", "water tank", "appliance failure", "entire", "whole house", "installation"]
    if any(k in message_lower for k in complex_keywords):
        tier = "complex"
        
    # Upward adjustments & Warnings
    warnings = []
    safety_keywords = ["aag", "spark", "burning smell", "short circuit", "electricity shock", "current", "blast"]
    
    if any(k in message_lower for k in safety_keywords):
        warnings.append("⚠️ SAFETY WARNING: Possibility of electrical spark or short circuit. Please turn off your main power/gas connection immediately.")
        tier = "complex"
    elif tier == "basic" and any(k in message_lower for k in ["bilkul", "completely", "completely stopped", "completely broken"]):
        tier = "intermediate"
    elif tier == "intermediate" and any(k in message_lower for k in ["bar bar", "recurring", "frequent", "repeatedly"]):
        tier = "complex"
        
    return tier, warnings

# ==========================================
# 2. DEFINE DATABASE-BACKED TOOLS
# ==========================================
def search_providers(service: str, location: str = "", time: str = "", budget: str = "", urgency: str = "next_day", complexity: str = "basic"):
    """Searches the database for the best service providers and calculates dynamic pricing."""
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    headers = get_supabase_headers()
    
    # Run complexity classifier on service description
    inferred_complexity, safety_warnings = classify_complexity(service)
    
    # Prioritize complexity argument if explicitly set to higher value
    complexity_tiers = {"basic": 1, "intermediate": 2, "complex": 3}
    if complexity_tiers.get(inferred_complexity, 1) > complexity_tiers.get(complexity, 1):
        complexity = inferred_complexity
        
    # Mapping service names to database service codes
    service_map = {
        "ac repair": "HS-04",
        "ac fix": "HS-04",
        "plumbing": "HS-01",
        "plumber": "HS-01",
        "carpentry": "HS-02",
        "carpenter": "HS-02",
        "sofa cleaning": "CS-02",
        "cleaning": "CS-01",
        "cleaner": "CS-01",
        "electrical": "HS-03",
        "electrician": "HS-03",
        "electronics": "HS-03",
        "electronic": "HS-03",
        "appliances": "HS-03",
        "appliance": "HS-03",
    }
    
    service_code = "HS-04"  # Default fallback
    for term, code in service_map.items():
        if term in service.lower():
            service_code = code
            break
            
    # Resolve sector (location)
    sector_code = location.strip().upper() if location else "G-13"
    if "-" not in sector_code and len(sector_code) > 1:
        for char in sector_code:
            if char.isdigit():
                idx = sector_code.index(char)
                sector_code = f"{sector_code[:idx]}-{sector_code[idx:]}"
                break
                
    try:
        # Query parent users table and embed profiles, services, and sectors
        query_url = f"{base_url}/users?role=eq.provider&select=*,provider_profiles(*),provider_services(*),provider_sectors(*)"
        response = requests.get(query_url, headers=headers)
        
        if not response.ok:
            return {"error": f"Query failed: {response.text}"}
            
        users_list = response.json()
        
        registered_providers = []
        for u in users_list:
            # 1. Ensure provider profile exists
            p_profiles = u.get("provider_profiles")
            if not p_profiles:
                continue
            # Handle if postgrest returns provider_profiles as a list or a dict
            p_profile = p_profiles[0] if isinstance(p_profiles, list) else p_profiles
            if not p_profile:
                continue
                
            # 2. Check if availability status is 'available' and account_status is 'active'
            status = p_profile.get('availability_status')
            acc_status = p_profile.get('account_status')
            if status != "available" or acc_status != "active":
                continue
                
            # 3. Check if service matches service_code
            p_services = u.get("provider_services") or []
            matching_service = None
            for ps in p_services:
                if ps.get("service_code") == service_code:
                    matching_service = ps
                    break
            if not matching_service:
                continue
                
            # 4. Check if sector matches sector_code
            p_sectors = u.get("provider_sectors") or []
            covers_sector = False
            for psec in p_sectors:
                if psec.get("sector_code") == sector_code:
                    covers_sector = True
                    break
            if not covers_sector:
                continue
                
            # Composite rank scoring
            base_rating = float(p_profile.get('base_rating') or 5.0)
            punct_rating = float(p_profile.get('punctuality_rating') or 5.0)
            jobs_completed = int(p_profile.get('jobs_completed') or 0)
            cancellation_rate = float(p_profile.get('cancellation_rate') or 0.0)
            dispute_score = float(p_profile.get('dispute_score') or 1.0)
            
            rating_score = (base_rating / 5.0) * 100
            punct_score = (punct_rating / 5.0) * 100
            cancel_score = max(0, (1.0 - cancellation_rate) * 100)
            disp_score = dispute_score * 100
            
            composite_score = (rating_score * 0.40) + (punct_score * 0.20) + (cancel_score * 0.20) + (disp_score * 0.20)
            
            # Dynamic Pricing Calculations (Plan V2 Specs)
            base_rate = float(matching_service.get('per_job_rate_pkr') or 1000)
            
            # Distance surcharge
            distance_km = 4.5 # Mocked distance from user pin
            distance_surcharge = max(0.0, (distance_km - 3.0) * 20.0)
            
            # Urgency surcharge
            urg_mult = 0.15 if urgency == "same_day" else 0.0
            urgency_surcharge = base_rate * urg_mult
            
            # Complexity surcharge
            comp_map = {"basic": 0.0, "intermediate": 0.10, "complex": 0.20}
            comp_mult = comp_map.get(complexity, 0.0)
            complexity_surcharge = base_rate * comp_mult
            
            # Surge pricing (Mocked if high demand)
            surge_surcharge = base_rate * 0.10
            
            # Loyalty Discount (Subsidized bronze)
            loyalty_mult = 0.05
            loyalty_discount = base_rate * loyalty_mult
            
            subtotal = base_rate + distance_surcharge + urgency_surcharge + complexity_surcharge + surge_surcharge
            final_price = max(subtotal - loyalty_discount, 0.0)
            
            # Create services string for frontend display
            service_names = []
            service_name_map = {
                "HS-04": "AC Repairing",
                "HS-03": "Electrical Work",
                "HS-01": "Plumbing",
                "HS-02": "Carpentry",
                "CS-01": "Carpet Cleaning",
                "CS-02": "Sofa Cleaning",
            }
            for ps in p_services:
                s_name = service_name_map.get(ps.get("service_code"), ps.get("service_code"))
                if s_name and s_name not in service_names:
                    service_names.append(s_name)
            services_str = " · ".join(service_names)
            if not services_str:
                services_str = "General Home Service"

            # Create sectors string for frontend display
            sector_codes = [psec.get("sector_code") for psec in p_sectors if psec.get("sector_code")]
            sectors_str = ", ".join(sector_codes)
            if not sectors_str:
                sectors_str = "Islamabad"

            # Calculate on-time percentage based on punctuality rating
            on_time_pct = int((punct_rating / 5.0) * 100)
            on_time_str = f"On time {on_time_pct}%"

            # Formulate friendly availability text
            avail_status = p_profile.get("availability_status", "available")
            if avail_status == "available":
                avail_str = "Available tomorrow 9am - 5pm"
            elif avail_status == "busy":
                avail_str = "Busy until tomorrow 2pm"
            else:
                avail_str = "Scheduled appointments only"

            registered_providers.append({
                "provider_id": u.get("id"),
                "name": u.get("name"),
                "phone": u.get("phone"),
                "rating": base_rating,
                "completed_jobs": jobs_completed,
                "composite_score": round(composite_score, 1),
                "services": services_str,
                "sectors": sectors_str,
                "on_time": on_time_str,
                "availability": avail_str,
                "pricing_breakdown": {
                    "base_rate": base_rate,
                    "distance_surcharge": distance_surcharge,
                    "urgency_surcharge": urgency_surcharge,
                    "complexity_surcharge": complexity_surcharge,
                    "surge_surcharge": surge_surcharge,
                    "loyalty_discount": loyalty_discount,
                    "final_total": final_price
                }
            })
            
        # Sort by composite score (highest first)
        registered_providers.sort(key=lambda x: x['composite_score'], reverse=True)
        
        # Tag the first/best matched provider as Agent Recommended
        if registered_providers:
            registered_providers[0]["isRecommended"] = True
            
        # Always populate Google Maps Seeds to offer comparison lists in search-results screen
        gmaps_seeds = [
            {
                "name": f"Islamabad {service.title()} Care",
                "phone": "+92 51 889211",
                "rating": 4.6,
                "reviews_count": 38,
                "address": f"{sector_code} Markaz, Islamabad",
                "distance_km": 1.8,
                "estimated_rate": 1500
            },
            {
                "name": "Super Fix Techs",
                "phone": "+92 333 981772",
                "rating": 4.3,
                "reviews_count": 21,
                "address": f"{sector_code} Sector Street 4, Islamabad",
                "distance_km": 2.4,
                "estimated_rate": 1200
            },
            {
                "name": f"{location} Repair Experts",
                "phone": "+92 345 556621",
                "rating": 4.7,
                "reviews_count": 52,
                "address": f"{sector_code} Sector Road, Islamabad",
                "distance_km": 1.2,
                "estimated_rate": 1800
            },
            {
                "name": "Professional Home Care Pros",
                "phone": "+92 51 445588",
                "rating": 4.5,
                "reviews_count": 29,
                "address": "Blue Area, Islamabad",
                "distance_km": 5.1,
                "estimated_rate": 2000
            },
            {
                "name": "Capital Repair Hub",
                "phone": "+92 312 998855",
                "rating": 4.2,
                "reviews_count": 14,
                "address": f"{sector_code} Markaz, Islamabad",
                "distance_km": 2.0,
                "estimated_rate": 1100
            }
        ]
        gmaps_providers = []
        for seed in gmaps_seeds[:2]:  # Limit to exactly 2 providers for the time being
            base_rate = seed["estimated_rate"]
            dist_charge = max(0.0, (seed["distance_km"] - 3.0) * 20.0)
            urgency_charge = base_rate * (0.15 if urgency == "same_day" else 0.0)
            complexity_charge = base_rate * (0.10 if complexity == "intermediate" else 0.20 if complexity == "complex" else 0.0)
            total = base_rate + dist_charge + urgency_charge + complexity_charge
            
            gmaps_providers.append({
                "name": seed["name"],
                "phone": seed["phone"],
                "rating": seed["rating"],
                "reviews_count": seed["reviews_count"],
                "address": seed["address"],
                "distance_km": seed["distance_km"],
                "pricing_breakdown": {
                    "base_rate": base_rate,
                    "distance_surcharge": dist_charge,
                    "urgency_surcharge": urgency_charge,
                    "complexity_surcharge": complexity_charge,
                    "final_total": total
                }
            })
                
        return {
            "status": "success",
            "service_code": service_code,
            "sector_code": sector_code,
            "complexity": complexity,
            "safety_warnings": safety_warnings,
            "registered_providers": registered_providers,
            "google_maps_providers": gmaps_providers,
            "gmaps_providers": gmaps_providers  # Match both frontend keys
        }
        
    except Exception as e:
        return {"error": str(e)}

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
            "required": ["service"]  # Only require service, let Groq decide on others or fall back, preventing formatting errors
        }
    }
}

def book_service(provider_id: str, service_code: str, final_estimate_pkr: int, location: str = "G-13"):
    """
    Creates a new pending booking request in the database.
    """
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    headers = get_supabase_headers()
    
    # Retrieve active user id from agent singleton
    consumer_id = getattr(customer_agent, "active_user_id", None)
    
    # Resolve valid consumer UUID dynamically
    valid_consumer = False
    if consumer_id and "test_" not in str(consumer_id) and str(consumer_id) != "anonymous":
        # Check if this ID exists in the database
        chk = requests.get(f"{base_url}/users?id=eq.{consumer_id}", headers=headers)
        if chk.ok and chk.json():
            valid_consumer = True
            
    if not valid_consumer:
        # Query database for the first customer user
        url = f"{base_url}/users?role=eq.consumer&limit=1"
        res = requests.get(url, headers=headers)
        if res.ok and res.json():
            consumer_id = res.json()[0]["id"]
            print(f"[Self-Healing] Dynamically resolved fallback consumer ID: {consumer_id}")
        else:
            consumer_id = "052df9a0-9683-423c-a2c8-12cae456a840" # ultimate static fallback

    # Ensure provider_id is valid
    valid_provider = False
    if provider_id:
        chk = requests.get(f"{base_url}/users?id=eq.{provider_id}", headers=headers)
        if chk.ok and chk.json():
            valid_provider = True
            
    if not valid_provider:
        # Fallback to the first available provider
        url = f"{base_url}/users?role=eq.provider&limit=1"
        res = requests.get(url, headers=headers)
        if res.ok and res.json():
            provider_id = res.json()[0]["id"]
            print(f"[Self-Healing] Dynamically resolved fallback provider ID: {provider_id}")
        
    payload = {
        "consumer_id": consumer_id,
        "provider_id": provider_id,
        "service_code": service_code,
        "complexity_tier": "basic",
        "urgency": "scheduled",
        "requested_date": "2026-05-19",
        "requested_time_slot": "10:00:00",
        "base_rate_pkr": int(final_estimate_pkr),
        "final_estimate_pkr": int(final_estimate_pkr),
        "status": "pending_provider_acceptance"
    }
    
    res = requests.post(f"{base_url}/bookings", headers=headers, json=payload)
    if res.status_code in (200, 201, 204):
        return {"status": "success", "message": "Successfully created booking request in database!"}
    else:
        return {"error": f"Failed to create booking: {res.text}"}

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

def get_active_bookings():
    """
    Retrieves all active, non-completed and non-cancelled bookings for the active consumer.
    """
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    headers = get_supabase_headers()
    
    # Retrieve active user id
    consumer_id = getattr(customer_agent, "active_user_id", None) or "052df9a0-9683-423c-a2c8-12cae456a840"
    if not consumer_id or "test_" in str(consumer_id) or str(consumer_id) == "anonymous":
        consumer_id = "052df9a0-9683-423c-a2c8-12cae456a840"
        
    # Query non-completed/non-cancelled bookings
    url = f"{base_url}/bookings?consumer_id=eq.{consumer_id}&status=not.in.(completed,cancelled,expired,disputed)&select=*,provider:users!provider_id(name)"
    res = requests.get(url, headers=headers)
    if res.ok:
        return {"status": "success", "bookings": res.json()}
    else:
        return {"error": f"Failed to fetch bookings: {res.text}"}

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

def cancel_booking(booking_id: str, reason: str):
    """
    Cancels an active booking in the database.
    """
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    headers = get_supabase_headers()
    
    payload = {"status": "cancelled"}
    url = f"{base_url}/bookings?id=eq.{booking_id}"
    res = requests.patch(url, headers=headers, json=payload)
    if res.status_code in (200, 204):
        print(f"[Simulation Log] Booking {booking_id} cancelled. Reason: {reason}")
        return {"status": "success", "message": f"Successfully cancelled booking. Reason: {reason}"}
    else:
        return {"error": f"Failed to cancel booking: {res.text}"}

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

def file_dispute(booking_id: str, reason: str):
    """
    Files a dispute for a booking in the database.
    """
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    headers = get_supabase_headers()
    
    # Retrieve active user id
    consumer_id = getattr(customer_agent, "active_user_id", None) or "052df9a0-9683-423c-a2c8-12cae456a840"
    if not consumer_id or "test_" in str(consumer_id) or str(consumer_id) == "anonymous":
        consumer_id = "052df9a0-9683-423c-a2c8-12cae456a840"
        
    # Map dispute reasons to standard DIS-01..04 codes
    # DIS-01: Pricing, DIS-02: Quality, DIS-03: Behaviour, DIS-04: Delay
    dis_code = "DIS-02"
    reason_lower = reason.lower()
    if "price" in reason_lower or "money" in reason_lower or "charge" in reason_lower or "overcharge" in reason_lower:
        dis_code = "DIS-01"
    elif "behavior" in reason_lower or "attitude" in reason_lower or "misbehave" in reason_lower or "rude" in reason_lower:
        dis_code = "DIS-03"
    elif "delay" in reason_lower or "late" in reason_lower or "time" in reason_lower:
        dis_code = "DIS-04"
        
    # 1. Update booking status to disputed
    requests.patch(f"{base_url}/bookings?id=eq.{booking_id}", headers=headers, json={"status": "disputed"})
    
    # 2. Insert row into disputes
    payload = {
        "booking_id": booking_id,
        "raised_by_id": consumer_id,
        "raised_by_role": "consumer",
        "dispute_type": dis_code,
        "description_json": {"reason": reason},
        "status": "under_review"
    }
    
    res = requests.post(f"{base_url}/disputes", headers=headers, json=payload)
    if res.status_code in (200, 201, 204):
        return {"status": "success", "message": f"Successfully filed dispute {dis_code} for booking!"}
    else:
        return {"error": f"Failed to file dispute: {res.text}"}

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

def check_pending_jobs(service_type: str, provider_location: str = ""):
    """Checks the database for open, unassigned customer requests matching the provider's skills."""
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    headers = get_supabase_headers()
    
    service_map = {
        "ac repair": "HS-04",
        "ac fix": "HS-04",
        "plumbing": "HS-01",
        "plumber": "HS-01",
        "carpentry": "HS-02",
        "carpenter": "HS-02",
        "sofa cleaning": "CS-02",
        "cleaning": "CS-01",
        "cleaner": "CS-01",
        "electrical": "HS-03",
        "electrician": "HS-03",
        "electronics": "HS-03",
        "electronic": "HS-03",
        "appliances": "HS-03",
        "appliance": "HS-03",
    }
    
    service_code = "HS-04"
    for term, code in service_map.items():
        if term in service_type.lower():
            service_code = code
            break
            
    try:
        # Query bookings with pending status and matching service code
        query_url = f"{base_url}/bookings?status=eq.pending_provider_acceptance&service_code=eq.{service_code}&select=*,consumer:users(name,phone)"
        response = requests.get(query_url, headers=headers)
        
        if not response.ok:
            return {"error": f"Pending query failed: {response.text}"}
            
        bookings = response.json()
        
        filtered_jobs = []
        for b in bookings:
            consumer_info = b.get('consumer') or {}
            filtered_jobs.append({
                "booking_id": b.get("id"),
                "consumer_name": consumer_info.get("name"),
                "consumer_phone": consumer_info.get("phone"),
                "service_code": b.get("service_code"),
                "complexity": b.get("complexity_tier"),
                "final_price_pkr": b.get("final_estimate_pkr"),
                "urgency": b.get("urgency")
            })
            
        if filtered_jobs:
            return {"status": "success", "jobs": filtered_jobs}
        else:
            return {"status": "success", "message": f"No open jobs found matching {service_type}."}
            
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
                "service_type": {"type": "string", "description": "The specific service they offer (e.g. AC repair, plumbing)"},
                "provider_location": {"type": "string", "description": "The provider's location (optional)"}
            },
            "required": ["service_type"]
        }
    }
}

def register_provider(name: str, phone: str, location: str, service_types: list, hours: str = "09:00 to 18:00", base_rate: int = 1000):
    """Registers a new provider in the database, setting up profiles, services, sectors, and schedule."""
    if not SUPABASE_URL:
        return {"error": "Supabase credentials not configured"}
        
    base_url = f"{SUPABASE_URL}/rest/v1"
    headers = get_supabase_headers()
    
    try:
        # Normalize phone number to only digits to prevent formatting mismatches
        phone = "".join(c for c in phone if c.isdigit())
        
        import urllib.parse
        encoded_phone = urllib.parse.quote(phone)
        
        # 1. Check if user already exists in the database
        user_get = requests.get(f"{base_url}/users?phone=eq.{encoded_phone}&select=id,name,role", headers=headers)
        
        if user_get.ok and len(user_get.json()) > 0:
            # User exists!
            user_id = user_get.json()[0]['id']
            # Update user's name or role if necessary
            requests.patch(f"{base_url}/users?id=eq.{user_id}", headers=headers, json={"name": name, "role": "provider"})
            # To ensure clean re-registration, delete stale provider_profiles, provider_services, provider_sectors, provider_availability
            requests.delete(f"{base_url}/provider_profiles?user_id=eq.{user_id}", headers=headers)
            requests.delete(f"{base_url}/provider_services?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{base_url}/provider_sectors?provider_id=eq.{user_id}", headers=headers)
            requests.delete(f"{base_url}/provider_availability?provider_id=eq.{user_id}", headers=headers)
            print(f"[Self-Healing] Found existing user {user_id}. Re-using and cleaning profile for provider registration.")
        else:
            # Create user if they don't exist
            user_payload = {"name": name, "phone": phone, "role": "provider"}
            requests.post(f"{base_url}/users", headers=headers, json=user_payload)
            
            # Retrieve user ID
            user_get = requests.get(f"{base_url}/users?phone=eq.{encoded_phone}&select=id", headers=headers)
            if not user_get.ok or len(user_get.json()) == 0:
                return {"error": f"Failed to register/retrieve user: {user_get.text}"}
            user_id = user_get.json()[0]['id']
        
        # 2. Create provider profile
        profile_payload = {
            "user_id": user_id,
            "availability_status": "available",
            "base_rating": 5.0,
            "punctuality_rating": 5.0,
            "quality_rating": 5.0,
            "behaviour_rating": 5.0,
            "jobs_completed": 0,
            "cancellation_rate": 0.0,
            "dispute_score": 1.0,
            "total_earnings_simulated": 0,
            "account_status": "active"
        }
        requests.post(f"{base_url}/provider_profiles", headers=headers, json=profile_payload)
        
        # 3. Create provider services
        service_map = {
            "ac repair": "HS-04",
            "ac fix": "HS-04",
            "plumbing": "HS-01",
            "plumber": "HS-01",
            "carpentry": "HS-02",
            "carpenter": "HS-02",
            "sofa cleaning": "CS-02",
            "cleaning": "CS-01",
            "cleaner": "CS-01",
            "electrical": "HS-03",
            "electrician": "HS-03",
            "electronics": "HS-03",
            "electronic": "HS-03",
            "appliances": "HS-03",
            "appliance": "HS-03",
        }
        
        for idx, s in enumerate(service_types):
            s_code = service_map.get(s.lower(), "HS-04")
            service_payload = {
                "provider_id": user_id,
                "service_code": s_code,
                "per_job_rate_pkr": base_rate,
                "is_primary": (idx == 0)
            }
            requests.post(f"{base_url}/provider_services", headers=headers, json=service_payload)
            
        # 4. Create provider sector coverage
        sector_code = location.strip().upper()
        if "-" not in sector_code and len(sector_code) > 1:
            for char in sector_code:
                if char.isdigit():
                    idx = sector_code.index(char)
                    sector_code = f"{sector_code[:idx]}-{sector_code[idx:]}"
                    break
                    
        sector_payload = {
            "provider_id": user_id,
            "sector_code": sector_code
        }
        requests.post(f"{base_url}/provider_sectors", headers=headers, json=sector_payload)
        
        # 5. Create provider availability schedule (Days 0-6)
        open_time = "09:00:00"
        close_time = "18:00:00"
        if "to" in hours.lower():
            parts = hours.lower().split("to")
            open_time = f"{parts[0].strip()}:00" if len(parts[0].strip()) == 5 else parts[0].strip()
            close_time = f"{parts[1].strip()}:00" if len(parts[1].strip()) == 5 else parts[1].strip()
            
        for day in range(7):
            availability_payload = {
                "provider_id": user_id,
                "day_of_week": day,
                "open_time": open_time,
                "close_time": close_time
            }
            requests.post(f"{base_url}/provider_availability", headers=headers, json=availability_payload)
            
        return {"status": "success", "message": f"Successfully registered business {name} in {sector_code}."}
        
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
                "location": {"type": "string", "description": "Islamabad sector area (e.g. G-13, F-8)"},
                "service_types": {"type": "array", "items": {"type": "string"}, "description": "List of services they offer"},
                "hours": {"type": "string", "description": "Operating hours (e.g. '09:00 to 18:00')"},
                "base_rate": {"type": "number", "description": "Starting hourly base rate in PKR"}
            },
            "required": ["name", "phone", "location", "service_types"]
        }
    }
}

# ==========================================
# 3. INITIALIZE THE CUSTOMER SERVICE AGENT
# ==========================================
customer_instruction = """You are an intelligent customer service agent for the Haazir home services platform. Your job is to help customers book services like AC repair, plumbing, and cleaning, as well as manage active jobs (cancellations and disputes).

---
CRITICAL TOOL INSTRUCTIONS:
1. When a user makes a request (e.g. "I want my AC fixed today in G-13"), invoke the `search_providers` tool.
2. When the user confirms they want to proceed and book a specific provider (e.g. "book Zahid Mehmood" or "confirm booking" or "yes go ahead"), invoke the `book_service` tool.
3. When the user wants to cancel a booking or file a dispute (e.g. "cancel my booking", "dispute this job", "booking canceled"), you MUST first invoke `get_active_bookings` to fetch the list of their active bookings in the database.
4. Once you have the list of active bookings:
   - If there is exactly one active booking, or if the user confirms which booking they want to cancel/dispute, you MUST ask for the reason of cancellation or dispute if they haven't provided one.
   - Once they provide a reason, invoke the `cancel_booking` or `file_dispute` tool to commit the database update!

---
RESPONSE FORMATTING INSTRUCTION:
When presenting matched service providers to the user, you MUST only mention the top 3 recommended options in your text response. Instruct the user that they can see a full side-by-side comparison (including Google Maps directories) by clicking the "More Information" button. Keep your reply highly concise.

---
REASONING TRANSPARENCY (ONLY AFTER TOOL RETURNS):
Once the tool results are returned, in your final response to the user, you MUST explicitly include a "Show Haazir's Thinking" section detailing:
1. Message Language detection.
2. Job Complexity Classification (chosen tier: basic, intermediate, complex and why).
3. Any active Safety Warnings triggered.
4. Composite matching criteria used.
5. Exact dynamic pricing breakdown calculated (itemized: Base rate + distance + urgency + complexity - loyalty discount).

If no registered provider matches, state "No registered provider found in this sector. Fall-back to Google Maps recommendations:" and list the Google Maps fallback providers."""

customer_agent = OddJobsAgent(
    model='llama-3.3-70b-versatile',
    name='customer_agent',
    description='Handles requests from people looking to hire workers.',
    instruction=customer_instruction,
    tools=[search_providers_tool, book_service_tool, get_active_bookings_tool, cancel_booking_tool, file_dispute_tool]
)

# ==========================================
# 4. INITIALIZE THE PROVIDER SERVICE AGENT
# ==========================================
provider_instruction = """You are a smart onboarding and dispatch agent for business owners on the Haazir platform.

---
CRITICAL TOOL INSTRUCTION:
1. When a new provider gives their information (name, phone, sector location, service types, hours, base rate), invoke the `register_provider` tool.
2. If they are already registered or just asking for work, call the `check_pending_jobs` tool.

Once the tool completes successfully, write a professional and encouraging message confirming the database operation details to the provider."""

provider_agent = OddJobsAgent(
    model='llama-3.3-70b-versatile',
    name='provider_agent',
    description='Handles onboarding and job dispatch for business owners.',
    instruction=provider_instruction,
    tools=[check_pending_jobs_tool, register_provider_tool]
)
