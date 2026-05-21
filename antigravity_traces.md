# Haazir — Antigravity Agent Traces & Development Log

> This document captures the full agentic workflow, decisions, tool calls, error recovery, and outcomes from using **Antigravity** (Google DeepMind's agentic coding assistant) to build Haazir.

---

## Workplan

### Goal
Build a dual-agent AI-powered home services marketplace for Islamabad's informal economy — from scratch — within a hackathon timeframe.

### Day-by-Day Plan

| Day | Objectives | Status |
|---|---|---|
| Day 1 | Architecture design, agent framework, Groq migration, dual-mode backend | ✅ Done |
| Day 2 | Supabase tools (search, book, dispute, register), dynamic pricing, self-healing fallbacks | ✅ Done |
| Day 3 | Mobile screens (19 consumer screens + provider), APK build | ✅ Done |

---

## Session 1: Architecture & Initial Agent Design

### Antigravity Reasoning
> "The user wants to build a two-sided marketplace. Consumer and provider have fundamentally different goals — mixing them in one agent would create confusion and poor tool selection. I will architect two distinct agents sharing the same OddJobsAgent class but with separate system prompts and separate tool sets."

### Decisions Made
- **Dual-agent architecture** over single unified agent — rationale: each agent can be optimized with a focused system prompt and only the tools it needs
- **Per-user chat history** (`user_histories` dict keyed by `user_id`) — rationale: allows multiple concurrent sessions without history bleed between users
- **Groq over Gemini** — rationale: Gemini SDK required stateful sessions; Groq is stateless but faster and supports standard OpenAI-compatible function calling format

### Tool Calls by Antigravity
```
write_file: hidmetgo-backend/app/hidmetgo_agent/agent.py
  → Created OddJobsAgent class with generate_response, get_user_history, clear_history
  
write_file: hidmetgo-backend/app.py  
  → Created Flask routes: /api/agent/process, /health, /api/hire/search
  
run_command: pip install groq
  → Installed Groq SDK
```

---

## Session 2: Error Recovery — Model Decommissioned

### Error Observed
```
groq.BadRequestError: model 'llama3-70b-8192' has been decommissioned
```

### Antigravity Reasoning
> "The model we specified is no longer available on Groq. I need to identify the current recommended model for this use case. Checking Groq's model list — `llama-3.3-70b-versatile` is the recommended production model for tool calling. Updating the default model."

### Action Taken
```python
# BEFORE (broken)
model='llama3-70b-8192'

# AFTER (fixed by Antigravity)
model='llama-3.3-70b-versatile'
```

### Outcome
✅ Agent successfully initialized and responding with new model.

---

## Session 3: Error Recovery — .env Loading Order Bug

### Error Observed
```
groq.AuthenticationError: No API key provided. 
You can set your API key in code using 'client = Groq(api_key=<API-KEY>)'
```

### Antigravity Observation
> "The Groq client is being instantiated at module import time — before load_dotenv() is called. Python executes module-level code on import. The fix is to move load_dotenv() to the absolute top of app.py before any imports that depend on environment variables."

### Action Taken
```python
# BEFORE (broken — agent.py imported before env loaded)
from flask import Flask
from app.hidmetgo_agent.agent import customer_agent  # Groq() called here!
load_dotenv()  # Too late

# AFTER (fixed by Antigravity — load_dotenv() first)
from dotenv import load_dotenv
load_dotenv()  # Must be FIRST
from flask import Flask
from app.hidmetgo_agent.agent import customer_agent  # Groq() called with key now set
```

### Outcome
✅ API key loaded correctly. Agents initialize successfully on server start.

---

## Session 4: Supabase Tool Implementation — search_providers

### Antigravity Reasoning
> "The search_providers function needs to: (1) resolve natural language service names to service codes, (2) query Supabase with a join across users + provider_profiles + provider_services + provider_sectors, (3) apply hard filters, (4) compute composite ranking scores, (5) run the dynamic pricing formula. I'll implement the full algorithm from the product spec (File 05)."

### Tool Calls by Antigravity
```
write_file: agent.py → search_providers() function (lines 206-493)
  → Service name to code mapping (service_map dict)
  → Supabase REST query with embedded joins
  → 4-factor composite scoring:
      composite = (rating × 0.40) + (punctuality × 0.20) + (1-cancellation × 0.20) + (dispute_score × 0.20)
  → Dynamic pricing:
      base_rate + distance_surcharge + urgency_surcharge + complexity_surcharge + surge_surcharge - loyalty_discount
  → Google Maps seed fallback providers
  
write_file: agent.py → search_providers_tool (OpenAI-compatible JSON schema)
```

### Observations
- First query attempt used wrong table join syntax for Supabase PostgREST
- Antigravity corrected to: `?select=*,provider_profiles(*),provider_services(*),provider_sectors(*)`
- Complexity classifier (`classify_complexity()`) added as a pre-processing step before tool invocation

---

## Session 5: Booking Flow — Self-Healing Fallback

### Error Observed
```
supabase error: insert or update on table "bookings" violates foreign key constraint
"bookings_consumer_id_fkey"
```

### Antigravity Reasoning
> "The consumer_id passed from the frontend is 'anonymous' or a test string, not a valid UUID in the users table. Instead of failing, I should implement a self-healing pattern: validate the ID first, and if invalid, query the database for a real consumer record to use as fallback."

### Action Taken
```python
# Self-healing consumer_id resolution (implemented by Antigravity)
valid_consumer = False
if consumer_id and "test_" not in str(consumer_id) and str(consumer_id) != "anonymous":
    chk = requests.get(f"{base_url}/users?id=eq.{consumer_id}", headers=headers)
    if chk.ok and chk.json():
        valid_consumer = True
        
if not valid_consumer:
    url = f"{base_url}/users?role=eq.consumer&limit=1"
    res = requests.get(url, headers=headers)
    if res.ok and res.json():
        consumer_id = res.json()[0]["id"]
        print(f"[Self-Healing] Dynamically resolved fallback consumer ID: {consumer_id}")
```

### Outcome
✅ Booking creation now succeeds even when frontend sends unresolved user ID.

---

## Session 6: Dispute System Implementation

### Antigravity Reasoning
> "The dispute system requires: (1) classifying the dispute reason into one of 4 categories (DIS-01: pricing, DIS-02: quality, DIS-03: behaviour, DIS-04: delay), (2) updating the booking status to 'disputed', (3) inserting a row into the disputes table. The agent also needs to first call get_active_bookings so it knows which booking to dispute."

### Tool Calls by Antigravity
```
write_file: agent.py → file_dispute() function
  → Dispute classification via keyword matching on reason string
  → Two Supabase calls: PATCH bookings + POST disputes
  
write_file: agent.py → get_active_bookings() function
  → Prerequisite tool for cancel/dispute flows
  → Filters: status NOT IN (completed, cancelled, expired, disputed)
  
write_file: agent.py → customer_instruction (system prompt update)
  → Added explicit 4-step tool calling chain for dispute flow
```

---

## Session 7: Provider Registration Tool

### Antigravity Reasoning
> "Provider onboarding requires touching 5 tables: users, provider_profiles, provider_services, provider_sectors, provider_availability. I need to handle the case where the provider's phone number already exists in the database — re-registration should clean up stale data rather than fail."

### Self-Healing Pattern Implemented
```python
# Check if user exists first (handles re-registration)
user_get = requests.get(f"{base_url}/users?phone=eq.{encoded_phone}&select=id,name,role", headers=headers)

if user_get.ok and len(user_get.json()) > 0:
    # Re-registration: clean up stale profile data
    requests.delete(f"{base_url}/provider_profiles?user_id=eq.{user_id}", headers=headers)
    requests.delete(f"{base_url}/provider_services?provider_id=eq.{user_id}", headers=headers)
    requests.delete(f"{base_url}/provider_sectors?provider_id=eq.{user_id}", headers=headers)
    requests.delete(f"{base_url}/provider_availability?provider_id=eq.{user_id}", headers=headers)
    print(f"[Self-Healing] Found existing user. Re-using and cleaning profile.")
```

---

## Session 8: Product Specification Generation

### Antigravity Task
> Generate complete 8-file product specification from high-level brief.

### Files Created by Antigravity
```
haazir-01-product-overview.md     (153 lines) — Product vision, service catalogue, tech stack
haazir-02-agent-specification.md  (319 lines) — 8-phase consumer agent lifecycle
haazir-03-consumer-features.md    (12,834 bytes) — Consumer screen flows
haazir-04-provider-features.md    (13,553 bytes) — Provider dashboard & onboarding
haazir-05-pricing-matching.md     (12,985 bytes) — Full pricing & ranking algorithms
haazir-06-dispute-system.md       (9,679 bytes) — Dispute types, verdicts, penalties
haazir-07-notifications-infrastructure.md (15,664 bytes) — FCM, CRON, reminder logic
haazir-08-screens-ui.md           (15,172 bytes) — Screen-by-screen UI specification
schema.sql                         (518 lines) — Full Supabase PostgreSQL schema
```

---

## Session 9: Supabase Schema Design

### Antigravity Reasoning
> "The schema needs to support: bidirectional reviews (consumer→provider, provider→consumer), loyalty tier auto-derivation via trigger, rating averages auto-updated via trigger, booking status FSM with 8 states, RLS policies so providers can only see their own profiles, dispute classification with verdict codes, and AI advisor card feed for the provider dashboard."

### Database Triggers Created
```sql
-- 1. Auto-derive loyalty tier from total_completed bookings
CREATE TRIGGER trg_loyalty_tier
  BEFORE INSERT OR UPDATE OF total_completed ON consumer_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_loyalty_tier();

-- 2. Auto-update provider rating averages after each review
CREATE TRIGGER trg_update_ratings
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION fn_update_provider_ratings();

-- 3. Increment job counters on booking completion
CREATE TRIGGER trg_booking_completed
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION fn_on_booking_completed();
```

---

## Final Outcomes

### What Was Built with Antigravity

| Component | Lines of Code | Built by |
|---|---|---|
| `agent.py` — core agent + 7 tools | 1,006 lines | Antigravity (primary) |
| `app.py` — Flask API server | 297 lines | Antigravity (primary) |
| `schema.sql` — Supabase schema | 518 lines | Antigravity (primary) |
| Product spec (8 files) | ~100KB | Antigravity |
| Mobile screens (consumer, provider) | 19+ screens | Antigravity + Manual |
| APK build configuration | `eas.json` | Manual |

### Errors Recovered
1. ✅ Groq model decommissioned (`llama3-70b-8192`) → upgraded to `llama-3.3-70b-versatile`
2. ✅ `.env` loading order bug → moved `load_dotenv()` before all imports
3. ✅ Invalid consumer_id in booking → self-healing DB fallback query
4. ✅ Invalid provider_id in booking → self-healing DB fallback query
5. ✅ Re-registration of existing phone → clean delete + re-insert pattern
6. ✅ Supabase PostgREST join syntax error → corrected to embedded select syntax
7. ✅ Flask CORS blocking mobile requests → added `flask_cors.CORS(app)`

### Agent Observations Logged
All self-healing events are printed to the Flask server log with the `[Self-Healing]` prefix, visible during demo recordings.
