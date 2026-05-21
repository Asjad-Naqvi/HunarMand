# HunarMand — AI-Powered Home Services Marketplace
### *ہنرمند — Skilled. Trusted. Ready.*

> **Hackathon Submission** | Challenge 2 — AI-Powered Urban Services
> **Platform:** Android (Expo / React Native) | **AI:** Groq LLaMA 3.1-8b-Instant | **DB:** Supabase (PostgreSQL)

---

## 📋 Table of Contents
1. [What is HunarMand?](#what-is-hunarmand)
2. [Architecture](#architecture)
3. [Agentic Workflow](#agentic-workflow)
4. [Data Schemas](#data-schemas)
5. [Tools & APIs](#tools--apis)
6. [Antigravity's Role](#antigravitys-role)
7. [Antigravity Reasoning Traces](#antigravity-reasoning-traces)
8. [Setup Steps](#setup-steps)
9. [Assumptions](#assumptions)
10. [Baseline Comparison](#baseline-comparison)
11. [Robustness & Edge Cases](#robustness--edge-cases)
12. [Cost & Scalability](#cost--scalability)
13. [Limitations](#limitations)
14. [Privacy Note](#privacy-note)

---

## What is HunarMand?

HunarMand is an AI-powered, mobile-first service marketplace for **Islamabad's informal economy**. It connects consumers who need home services (AC repair, plumbing, electricians, cleaning, etc.) with registered local providers — using two specialised conversational AI agents that control the **entire service lifecycle**.

**Problem:** Service discovery in Islamabad relies entirely on WhatsApp groups, phone calls, and word-of-mouth. No accountability, no pricing transparency, no structured feedback, zero recourse.

**Solution:** Two AI agents replace the entire fragmented workflow:

| Agent | Role |
|---|---|
| **Hunar (Consumer Agent)** | Understands service requests in Urdu/Roman Urdu/English, discovers and ranks providers, calculates dynamic pricing, creates bookings, handles disputes |
| **Hunar (Provider Agent)** | Onboards new service professionals, registers profiles to database, dispatches pending jobs |

> **App Evolution:** OddJobs → Haazir → **HunarMand**
> The app was initially prototyped as "OddJobs", expanded into "Haazir" during the V2 specification phase, and finally rebranded to **HunarMand** with the AI agent renamed to **Hunar** (*"skilled craftsman"* in Urdu).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Android APK)                 │
│         React Native + Expo Router (TypeScript)             │
│                                                             │
│  Consumer Screens (19)    │    Provider Screens (10)        │
│  ├─ chat.tsx              │    ├─ onboarding chat           │
│  ├─ search-results.tsx    │    ├─ dashboard                 │
│  ├─ booking-confirmation  │    └─ job notifications         │
│  ├─ awaiting.tsx          │                                 │
│  ├─ dispute-chat.tsx      │                                 │
│  └─ feedback.tsx          │                                 │
└───────────────┬─────────────────────┬───────────────────────┘
                │ HTTP / REST          │ HTTP / REST
                ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│              PYTHON FLASK BACKEND (app.py)                   │
│                                                              │
│  POST /api/agent/process  →  customer_agent / provider_agent │
│  POST /api/agent/clear    →  Reset chat session              │
│  GET  /api/agent/history  →  Retrieve conversation history   │
└──────────────────────┬───────────────────────────────────────┘
                       │ Groq SDK                   │ REST API
                       ▼                            ▼
        ┌──────────────────────┐      ┌─────────────────────────┐
        │   GROQ API           │      │   SUPABASE (PostgreSQL) │
        │ LLaMA 3.1-8b-Instant │      │                         │
        │                      │      │  users                  │
        │ Tool Calling:        │      │  provider_profiles      │
        │ search_providers     │      │  provider_services      │
        │ book_service         │      │  provider_sectors       │
        │ get_active_bookings  │      │  bookings               │
        │ cancel_booking       │      │  disputes               │
        │ file_dispute         │      │  reviews                │
        │ check_pending_jobs   │      │  advisor_cards          │
        │ register_provider    │      │  surge_flags            │
        └──────────────────────┘      └─────────────────────────┘
```

> **LLM Model Choice:** Initially used `llama-3.3-70b-versatile`. Upgraded to **`llama-3.1-8b-instant`** after the 70b model hit Groq free-tier daily token limits and occasionally emitted raw XML tool-call tags causing HTTP 400 errors. The 8b-instant model is significantly faster, has higher rate limits, and possesses robust native tool-calling capabilities.

---

## Agentic Workflow

The Consumer Agent (Hunar) operates across 8 phases for each service request:

```
Phase 1: Input Understanding
  → NLP extraction from Urdu/Roman Urdu/English free text
  → Assigns confidence scores per field (service, location, urgency, budget)
  → Generates structured clarification prompts for low-confidence fields
  → If location is missing, Hunar asks: "Which sector are you in? (e.g. G-13, F-8)"

Phase 2: Job Complexity Classification
  → classify_complexity() function with safety keyword triggers
  → Tiers: basic / intermediate / complex
  → ⚠️ Safety warnings for electrical/gas hazard keywords (Urdu + Roman Urdu)

Phase 3: Provider Discovery & Ranking
  → search_providers tool → Supabase REST query
  → Hard filters: availability_status=available, service_code match, sector match
  → Soft scoring: rating(40%) + punctuality(20%) + cancellation(20%) + dispute_score(20%)
  → Google Maps fallback seeds if 0 registered providers found

Phase 4: Dynamic Pricing
  → Base rate + distance surcharge + urgency surcharge + complexity surcharge
  → + surge adjustment - loyalty discount
  → Full itemized breakdown returned to consumer
  → "Show Hunar's Thinking" toggle reveals raw reasoning steps

Phase 5: Booking & Notification
  → book_service tool → INSERT into bookings table
  → Status: pending_provider_acceptance
  → Provider receives FCM push notification

Phase 6: Pre-Job Reminders
  → Supabase Edge Function CRON triggers FCM at 24h, 2h (provider) and 3h, 1h (consumer)

Phase 7: Service Completion
  → Provider updates status: en_route → arrived → completed

Phase 8: Retry, Decline & Dispute Logic
  → On decline/non-response: provider excluded, consumer re-initiates search
  → file_dispute tool → INSERT into disputes, UPDATE booking status → 'disputed'
  → AI classifies dispute type: DIS-01 (price) / DIS-02 (quality) / DIS-03 (behaviour) / DIS-04 (delay)
```

---

## Data Schemas

### Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Shared auth table (consumers & providers) | `id (UUID)`, `phone`, `role`, `expo_push_token` |
| `consumer_profiles` | Consumer loyalty & dispute tracking | `loyalty_tier`, `total_completed`, `dispute_flag` |
| `provider_profiles` | Provider scoring & status | `base_rating`, `punctuality_rating`, `dispute_score`, `availability_status`, `account_status` |
| `provider_services` | Services each provider offers | `provider_id`, `service_code (HS-01..CS-07)`, `per_job_rate_pkr` |
| `provider_sectors` | Geographic coverage | `provider_id`, `sector_code (G-13, F-8...)` |
| `provider_availability` | Weekly schedule | `provider_id`, `day_of_week`, `open_time`, `close_time` |
| `bookings` | Full booking lifecycle | `consumer_id`, `provider_id`, `service_code`, `status`, `final_estimate_pkr`, `price_breakdown (JSONB)` |
| `disputes` | Dispute tracking | `booking_id`, `dispute_type (DIS-01..04)`, `status`, `verdict` |
| `reviews` | Bidirectional ratings | `reviewer_role`, `overall_rating`, `punctuality_rating`, `quality_rating` |
| `advisor_cards` | AI-generated provider nudges | `card_type`, `headline`, `detail` |
| `surge_flags` | Demand surge tracking | `service_code`, `sector_code`, `is_surge_active` |

### Booking Status FSM

```
pending_provider_acceptance → confirmed → en_route → arrived → in_progress → completed
                           ↘ cancelled
                           ↘ expired   (15-min timeout)
                           ↘ disputed
```

### Dynamic Pricing Formula

```
Pre-Discount = BaseRate
             + max(0, (distance_km - 3.0) × 20)   # distance surcharge
             + BaseRate × 0.15                       # urgency (same_day only)
             + BaseRate × (0.10 | 0.20)             # complexity (intermediate | complex)
             + BaseRate × 0.10                       # surge (when is_surge_active)

Loyalty Discount = BaseRate × loyalty_pct (bronze: 5%, silver: 10%, gold: 15%)

Final Estimate = Pre-Discount − Loyalty Discount
```

---

## Tools & APIs

| Tool / API | Purpose | Provider |
|---|---|---|
| **Groq API** | LLM inference for both agents (LLaMA 3.1-8b-Instant) | Groq Cloud |
| **Supabase REST API** | Database queries (providers, bookings, disputes) | Supabase |
| **`search_providers`** | Find + rank providers by service/sector/score; calculate pricing | Custom (agent tool) |
| **`book_service`** | Create booking record in DB with status `pending_provider_acceptance` | Custom (agent tool) |
| **`get_active_bookings`** | Retrieve consumer's active bookings for cancel/dispute flows | Custom (agent tool) |
| **`cancel_booking`** | Patch booking status to `cancelled` | Custom (agent tool) |
| **`file_dispute`** | Create dispute record + update booking status to `disputed` | Custom (agent tool) |
| **`check_pending_jobs`** | Provider: find open job requests matching their skills | Custom (agent tool) |
| **`register_provider`** | Onboard new provider: users + profiles + services + sectors + availability | Custom (agent tool) |
| **Firebase FCM** | Push notifications to consumer and provider devices | Google Firebase |
| **Expo Notifications** | Expo push token management and delivery | Expo |

---

## Antigravity's Role

Antigravity (Google DeepMind's agentic coding assistant) was used throughout the development of HunarMand — from early architecture design through to the final rebrand, stress-testing, and regression fixes. Key contributions:

### Architecture & Planning
- Generated the complete 8-file product specification (`haazir-01` through `haazir-08`) from a high-level brief
- Designed the dual-agent architecture (consumer agent + provider agent) with distinct tool sets
- Designed the Supabase schema (`schema.sql` — 518 lines) including RLS policies, triggers, and functions

### Backend Development
- Implemented the `OddJobsAgent` class with per-user chat history management and Groq tool calling
- Authored all 7 database-backed tool functions (`search_providers`, `book_service`, `cancel_booking`, `file_dispute`, `get_active_bookings`, `check_pending_jobs`, `register_provider`)
- Implemented the `classify_complexity()` function with Urdu/Roman Urdu safety keyword detection
- Designed and executed the stress-test suite (`test_stress_scenarios.py`) covering 4 edge-case scenarios
- Updated agent system prompts to name the AI agent **"Hunar"** and brand all outputs to HunarMand

### Mobile Development
- Built all consumer and provider chat interfaces (19 consumer + 10 provider screens)
- Implemented full provider onboarding chat flow with real Supabase writes
- Guided Expo dependency resolution and APK build configuration
- Completed the full rebrand from Haazir → HunarMand across ~40 files

### Error Recovery & Self-Healing (documented by Antigravity)
| # | Error | Resolution |
|---|-------|------------|
| 1 | `llama3-70b-8192` model decommissioned | Upgraded to `llama-3.3-70b-versatile` |
| 2 | `.env` loaded after Groq client init | Moved `load_dotenv()` to top of `app.py` |
| 3 | `consumer_id`/`provider_id` FK violation | Self-healing DB fallback query |
| 4 | Supabase PostgREST join syntax error | Corrected to embedded select syntax |
| 5 | Groq 429 (rate limit) + raw XML tool calls | Upgraded both agents to `llama-3.1-8b-instant` |
| 6 | `git pull` overwrote profile lookup logic | Hardened 3-step fallback: UUID → phone → email |

---

## Antigravity Reasoning Traces

Detailed reasoning traces are available in the **[`traces-and-artifacts/`](./traces-and-artifacts/)** folder. This includes curated, annotated Antigravity decision logs for all five required demonstration areas:

| Requirement | Trace Location |
|-------------|---------------|
| Provider Selection | `traces-and-artifacts/ANTIGRAVITY_REASONING_TRACES.md` §1 |
| Price Estimation | `traces-and-artifacts/ANTIGRAVITY_REASONING_TRACES.md` §2 |
| Scheduling Conflicts | `traces-and-artifacts/ANTIGRAVITY_REASONING_TRACES.md` §3 |
| Confirmation Actions | `traces-and-artifacts/ANTIGRAVITY_REASONING_TRACES.md` §4 |
| Dispute Escalation | `traces-and-artifacts/ANTIGRAVITY_REASONING_TRACES.md` §5 |

The folder also contains raw conversation transcripts (JSONL), session overview logs, implementation plans, walkthroughs, and all milestone artifacts organized by development phase.

---

## Setup Steps

### Prerequisites
- Python 3.10+
- Node.js 18+
- Android phone with Expo Go app installed

### 1. Backend Setup

```powershell
cd d:\Hackathon\hidmetgo\hidmetgo-backend

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create .env in hidmetgo-backend/ with:
# GROQ_API_KEY=gsk_your_key_here
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# FLASK_ENV=development

# Start backend
python app.py
# → Server runs at http://localhost:5000
```

### 2. Mobile App Setup

```powershell
cd d:\Hackathon\hidmetgo

# Install dependencies
npm install --legacy-peer-deps

# Configure backend URL
# Edit .env in root:
# EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000

# Start Expo
npx expo start --clear

# Scan QR code with Expo Go on your phone
# (Phone and PC must be on the same WiFi / hotspot)
```

### 3. Install APK Directly
The pre-built APK is available at `HunarMand_Prototype.apk` (83 MB) in the repo root. Install directly on Android:
```
adb install HunarMand_Prototype.apk
# or transfer the file to your phone and tap to install manually
# (enable "Install from unknown sources" in Android settings if prompted)
```

---

## Assumptions

1. **Islamabad geography only:** All sector codes (G-13, F-8, etc.) and provider locations are Islamabad-specific.
2. **Simulation-first:** FCM push notifications are real (tokens stored in Supabase), but SMS/WhatsApp confirmations are logged only — not actually sent.
3. **Distance is mocked:** Distance calculation uses a fixed 4.5km mock value. Real implementation would use Google Maps Distance Matrix API.
4. **Surge pricing is mocked:** `surge_surcharge = base_rate × 0.10` is always applied as a demo. Real surge detection would use `surge_flags` table with time-windowed request counts.
5. **Loyalty tier:** Consumers start at `bronze` for hackathon demo purposes; real system derives tier from `total_completed` via Supabase trigger.
6. **Google Maps providers:** The "Pipeline B" providers shown in search results are seeded mock data — not live Google Places API calls.
7. **Authentication:** Phone + password auth is implemented via Supabase Auth. OTP not implemented.
8. **Language detection:** Agent responds in the user's language (Urdu/Roman Urdu/English) via LLM behaviour, not a separate language detection API.

---

## Baseline Comparison

| Capability | Simple Non-Agentic App | HunarMand Agentic System |
|---|---|---|
| **Service discovery** | User picks from a dropdown category list | NLP extracts service type from free-text Urdu/Roman Urdu/English input |
| **Language support** | English only | Urdu script, Roman Urdu, English, code-mixed — all handled natively |
| **Provider ranking** | Sort by distance (nearest first) | 4-factor composite score: rating (40%) + punctuality (20%) + cancellation rate (20%) + dispute score (20%) |
| **Pricing** | Fixed price per category | Dynamic: base rate + distance surcharge + urgency multiplier + complexity tier + surge flag − loyalty discount |
| **Pricing transparency** | Single number shown | Full itemized breakdown with each factor's contribution + "Show Hunar's Thinking" toggle |
| **Booking creation** | Manual form submission | Agent calls `book_service` tool, Supabase row created automatically |
| **Error handling** | Shows generic error screen | Agent retries with next provider, shows "X of 7 attempts used", suggests alternate time slots after exhausting all providers |
| **Dispute handling** | Customer sends email | Agent collects reason, classifies dispute type (DIS-01..04), writes to `disputes` table, updates booking status to `disputed` |
| **Safety awareness** | None | Detects Urdu/Roman Urdu electrical/gas hazard keywords → raises ⚠️ safety warning before proceeding |
| **Provider onboarding** | Manual form with admin review | Conversational onboarding via provider agent → all 5 DB tables populated automatically |
| **Cancellation flow** | "Cancel" button → form | Agent calls `get_active_bookings`, confirms correct booking, calls `cancel_booking` with reason logged |

**Quantitative improvement example:**
- A user typing `"mera AC G-13 mein repair karna hai urgent"` → non-agentic app: user must navigate 3 menus and manually select AC Repair + G-13 + Urgent. HunarMand agent: single message → service code `HS-04`, sector `G-13`, urgency `same_day` extracted automatically in one turn.

---

## Robustness & Edge Cases

All four stress-test scenarios were implemented and verified by running `test_stress_scenarios.py` against the live Flask backend and Supabase database.

### Scenario 1: No Registered Provider (Google Maps Fallback) ✅
**Input:** Search for plumbing services in sector `H-12 Markaz` (no providers registered).
**Hunar Behaviour:** `search_providers` returns empty `registered_providers` → Hunar falls back to Google Maps directory seeds → Returns `Islamabad Plumbing Care` (rating 4.6, PKR 1,500) and `Super Fix Techs` (rating 4.3, PKR 1,200). `"Show Hunar's Thinking"` section confirms: complexity `basic`, pricing structure displayed.
**Result:** ✅ PASS

### Scenario 2: Rescheduling After Provider Cancellation ✅
**Input:** Booking transitioned to `cancelled` → Consumer asks: *"My booking was cancelled, can you find me another plumber in G-13?"*
**Hunar Behaviour:** Detects cancellation context in conversation history → triggers `search_providers` again for `plumber` in `G-13` → returns alternative providers with updated pricing.
**Result:** ✅ PASS — No hardcoded rule; fully dynamic rescheduling.

### Scenario 3: Misspelled & Mixed-Language Input (Roman Urdu) ✅
**Input:** `"mjhy elecrician chahye G13 m leak switch thk krwane k lye"` (heavily misspelled, Roman Urdu, code-mixed).
**Hunar Behaviour:** Intent classifier maps to `Electrician` + location `G-13` + complexity `basic` → executes `search_providers` → returns electricians from Supabase → responds in Roman Urdu.
**Result:** ✅ PASS

### Scenario 4: Dispute Filing After Service Completion ✅
**Input:** *"I want to file a dispute for my booking because the provider did a terrible job, charged me way too much, and was extremely late."*
**Hunar Behaviour:** Classifies dispute as `DIS-01` (Pricing) from *"charged me way too much"* → calls `get_active_bookings` to find booking → calls `file_dispute` → booking status updated to `disputed` → dispute row inserted with `status = "under_review"`.
**Result:** ✅ PASS

### Additional Edge Cases

| # | Scenario | Behaviour |
|---|----------|-----------|
| 5 | **Safety keyword trigger** | `"bijli ka current aa raha hai switch board se"` → `⚠️ SAFETY WARNING` + complexity upgraded to `complex` |
| 6 | **Invalid consumer ID (self-healing)** | `book_service` called with stale ID → auto-fallback to valid DB consumer ID → booking succeeds |
| 7 | **Re-registration of existing provider** | `register_provider` detects existing phone → cleans stale profile → re-creates clean records |
| 8 | **Groq model decommission** | `llama3-70b-8192` deprecated mid-development → auto-identified → upgraded to `llama-3.3-70b-versatile` → then to `llama-3.1-8b-instant` |
| 9 | **Post-git-pull regression** | Profile lookup logic overwritten by pull → Antigravity re-implemented 3-step fallback (UUID → phone → email) |

---

## Cost & Scalability

### Cost Per Operation

| Component | Unit Cost | Notes |
|---|---|---|
| Groq LLaMA 3.1-8b input | $0.00005 / 1K tokens | Much cheaper than 70b |
| Groq LLaMA 3.1-8b output | $0.00008 / 1K tokens | |
| Average agent turn | ~2,000 tokens total | ~$0.0003 per turn |
| Full booking (4–6 turns) | ~$0.001–0.002 | Includes search + confirm |
| Supabase | Free tier | 500MB DB, 2GB bandwidth |
| Firebase FCM | Free | Push notifications |
| **Total cost per completed booking** | **~$0.001–0.003** | Very low |

### Latency Estimates

| Operation | Estimated Latency |
|---|---|
| Agent response (no tool) | 0.5–1.0 seconds |
| Agent response + tool call (1 DB query) | 1.0–1.8 seconds |
| Booking end-to-end (search → confirm) | 3–6 seconds total |
| FCM notification delivery | < 1 second |

> **Note:** Latency significantly improved after switching from `llama-3.3-70b-versatile` to `llama-3.1-8b-instant`.

### Scalability Discussion

**10x (1,000 concurrent users):**
- Groq handles 100+ requests/second — no bottleneck
- Flask + `gunicorn -w 4` already in `requirements.txt` — handles concurrent requests
- Supabase Pro ($25/month) for higher connection limits
- Total infra cost: ~$25–50/month for 1,000 DAU

**100x (10,000 concurrent users):**
- Deploy Flask on Railway/Render with auto-scaling (horizontal scale-out)
- Add Redis + Celery queue for agent requests to prevent rate limiting
- Supabase Team tier with read replicas
- Groq rate limits (6,000 RPM on paid tier) — need request queuing at high volume
- Total infra cost: ~$200–500/month for 10,000 DAU

---

## Limitations

1. **No real-time tracking:** Job status updates (en_route, arrived) are text-based. No live GPS map tracking of provider location.
2. **Distance is mocked:** Real distance-based pricing requires Google Maps Distance Matrix API integration (cost: $0.005/request).
3. **No payment processing:** Pricing is estimated and displayed but no actual payment gateway (Stripe, JazzCash) is integrated.
4. **FCM dependency:** Push notifications require the app to have been opened at least once on the device to register an Expo push token.
5. **15-minute timeout not automated:** Provider non-response timeout logic is designed but not implemented as a running CRON job in this hackathon build.
6. **Surge pricing is static:** The `surge_flags` table is designed but real demand aggregation and surge detection requires a background job.
7. **Single-device sessions:** Chat history is server-side in memory (dict) — not persisted across server restarts.
8. **Language detection accuracy:** Agent relies on LLM to detect and mirror language. Heavily code-mixed or dialect-heavy inputs may produce English responses.

---

## Privacy Note

- **No PII is shared externally.** All user data (name, phone, location) is stored only in Supabase (your own project instance).
- **Groq API** receives only the conversation text and service request details — no user IDs, phone numbers, or addresses are transmitted to Groq.
- **Phone numbers** in the database are used as login identifiers only. No OTP, no SMS sending.
- **Expo push tokens** are stored in Supabase and used only for FCM delivery. They are rotated on every login.
- All API keys are stored in `.env` files excluded from version control via `.gitignore`.

---

*Built with ❤️ for Islamabad — HunarMand means "Skilled and Ready"*
