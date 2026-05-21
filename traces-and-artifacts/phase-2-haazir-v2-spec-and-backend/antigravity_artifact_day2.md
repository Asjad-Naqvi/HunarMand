# Project OddJobs: Day 2 Context Summary

## 🚀 Core Objective
Transforming the OddJobs prototype into a fully functional, AI-driven marketplace with dynamic pricing, smart onboarding, and live Supabase integration.

---

## 🛠️ Key Developments

### 1. Dynamic Pricing Engine (The "Heart")
Implemented a multi-variable pricing logic inside the AI agent (`agent.py`).
- **Formula:** `((Base Rate + Distance + Complexity) * Urgency Multiplier) - Discount`
- **Complexity Extraction:** AI categorizes jobs as Basic (0), Intermediate (+500), or Complex (+1500).
- **Urgency Surge:** AI detects "today/urgent" requests and applies a **1.3x multiplier**.
- **Data Source:** Pulls the provider's `base_rate` directly from the Supabase `provider_profiles` table.

### 2. Smart Onboarding Agent (The "Dispatcher")
Refactored the `provider_agent` to handle conversational registration for new businesses.
- **Tool:** `register_provider`
- **Logic:** Collects Name, Phone, Location, and Services.
- **Supabase Integration:** Multi-step insert into `users` (to get UUID) and then into `provider_profiles`.

### 3. Navigation & App Flow
Restructured the Expo router flow to follow a standard user journey:
1. `index.tsx` → `home.tsx` (Welcome)
2. `home.tsx` → `login.tsx` / `signup.tsx`
3. `auth` → `modes.tsx` (Role Selection)
4. `modes.tsx` → `chat-customer.tsx` (Hire) OR `chat-provider.tsx` (Onboard/Manage)

### 4. Full-Stack Integration
Connected the mock UI screens to the live Python/Groq backend:
- **home-search.tsx:** Now triggers the AI agent and passes results to the list.
- **provider-list.tsx:** Renders real providers from the database with dynamic prices.
- **provider-detail.tsx:** Shows an itemized breakdown (Base + Complexity + Surge) for transparency.
- **agent-traces.tsx:** Displays real-time logs of the AI's "thought process" and tool outputs.

---

## 🐞 Critical Fixes & Optimizations
- **Python Signature Fix:** Added default values to `location` and `time` in `search_providers` to prevent `TypeError` when the AI omits them.
- **Frontend State Recovery:** Restored the `query` state in the search screen after an accidental overwrite.
- **API Response Upgrade:** Updated the Flask `/api/agent/process` endpoint to return the full `chat_history`, allowing the frontend to render "Traces" and "Tool Data".

---

## 🔜 Next Steps
1. **GPS Integration:** Replace the mocked 200 RS distance fee with real coordinate-based math.
2. **Auth Linking:** Connect the frontend login/signup state to the backend agent sessions.
3. **Real-Time Booking:** Update `follow-up.tsx` to listen for job status changes via Supabase Realtime.
