# Haazir — Product Specification
## File 02: AI Agent Specification

---

## 1. Agent Identity

| Property | Value |
|---|---|
| Name | Haazir (both agents share this name) |
| Instances | Two: Consumer Agent + Provider Agent |
| Modality | Text only (no voice) |
| Personality | Warm, efficient, trustworthy. Speaks like a knowledgeable local assistant, not a corporate bot |
| Language | Mirrors the user's language. Responds in Urdu, Roman Urdu, English, or code-mixed as the user writes |
| Model | Gemini via Google Vertex AI |
| Thinking visibility | Hidden by default. User can toggle "Show Haazir's Thinking" to see deep reasoning steps |

---

## 2. Where Each Agent Lives

### 2.1 Consumer Agent
- Primary interface: full-screen AI chat screen (Consumer Home)
- After extracting job requirements, the agent hands off to structured UI (provider list cards, booking confirmation, job tracking, feedback)
- The agent is re-entered at any point: re-initiate search after a decline, raise a dispute, ask follow-up questions
- Handles: intent understanding, job classification, provider discovery, pricing, booking simulation, retry logic, dispute initiation

### 2.2 Provider Agent
- Used exclusively during:
  1. Initial provider registration (onboarding chat)
  2. Profile and skill update sessions (re-opened from dashboard)
  3. AI Advisor card feed on the provider dashboard (pre-generated nudges — not live chat)
  4. Provider-side dispute initiation chat
- Provider regular operations (accept/decline, status updates, dashboard, availability) use structured UI — not the agent chat

---

## 3. Consumer Agent — Full Lifecycle (8 Phases)

---

### Phase 1: Input Understanding

**Trigger:** Consumer sends any message in the chat.

**Inputs:**
- Raw text in any language/script
- Consumer's saved preferences (preferred time of day, past service history)
- Consumer's saved addresses
- Consumer's loyalty tier (for later use in Phase 4)

**Agent behaviour:**
- Tokenises and normalises input: handles Urdu script, Roman Urdu, English, misspellings, slang, code-switching
- Extracts structured intent:
  - Service type → mapped to a service code (e.g., HS-04 for AC Repairing)
  - Location → resolved from message or consumer's saved addresses
  - Urgency → same-day / next-day / scheduled / unspecified
  - Preferred time window → morning / afternoon / evening / specific time
  - Budget sensitivity → explicit mention of price constraints
  - Job complexity signals → keywords like "bilkul kaam nahi kar raha" = high severity
- Assigns a **confidence score** (0–100%) to each extracted field
- For any field with confidence below 75%, the agent generates a **structured UI confirmation prompt** — a card with labelled buttons for the user to tap (not a plain-text question)

**Thinking steps logged:**
- Raw tokens → normalised text
- Detected language and script
- Extracted fields with individual confidence scores
- Ambiguity flags and resolution strategy

**Outputs:**
- Confirmed job object: `{ service_code, location, urgency, time_window, complexity_estimate, budget_sensitive }`
- Structured clarification prompt if needed

**Failure handling:**
- Completely unintelligible input → agent responds asking the user to describe the service they need
- No location provided → agent asks consumer to select from saved addresses or drop a new pin

---

### Phase 2: Job Complexity Classification

**Trigger:** Job object confirmed.

**Agent behaviour:**
- Classifies job into one of three complexity tiers:

| Tier | Label | Example signals |
|---|---|---|
| 1 | Basic | Routine cleaning, filter replacement, minor fix |
| 2 | Intermediate | Installation, standard repair, multi-step task |
| 3 | Complex | Full replacement, fault diagnosis, specialist tools required |

- Uses both the service type default and contextual signals from the user's description
- Complexity tier influences: provider experience filter, price calculation, and estimated duration

**Thinking steps logged:**
- Service code → base complexity default
- Contextual signals from user description → complexity adjustment
- Final tier with justification

---

### Phase 3: Provider Discovery & Ranking

**Trigger:** Job object confirmed and complexity classified.

Two parallel discovery pipelines run simultaneously.

#### Pipeline A — Registered Haazir Providers
*(Full algorithm in File 05)*

Hard filters → soft scoring (8 weighted factors) → ranked list of up to 10 providers.

#### Pipeline B — Google Maps Providers (Mock Data)
*(Full algorithm in File 05)*

Hard filters → soft scoring (6 weighted factors) → ranked list of up to 10 providers.

**Thinking steps logged:**
- Number of providers found before filtering
- Number removed at each hard filter step and why
- Factor-by-factor score breakdown for top 5 providers
- Reasoning for top recommendation vs. second-place provider

**Outputs:**
- Two ranked lists passed to the UI provider cards screen
- Agent summary message explaining why the top provider is recommended (shown in chat above the cards)

**Failure handling:**
- Zero registered providers pass filters → show only Google Maps list; agent explains and suggests alternate time slots or sectors
- Zero providers on both lists → agent explains and suggests broadening time window or adjacent sector

---

### Phase 4: Dynamic Pricing

**Trigger:** Consumer selects a provider (or accepts agent recommendation).

**Inputs:**
- Provider's base per-job rate (PKR)
- Distance from provider location to consumer location (km)
- Urgency level
- Job complexity tier
- Demand surge flag
- Consumer's loyalty tier

**Price formula:**
```
Pre-Discount Estimate = Base Rate
                      + Travel Adjustment
                      + Urgency Adjustment
                      + Complexity Adjustment
                      + Surge Adjustment

Loyalty Discount      = Pre-Discount Estimate × Loyalty Discount %

Final Estimate        = Pre-Discount Estimate − Loyalty Discount
```

*(Full pricing algorithm and loyalty tier table in File 05)*

**Loyalty discount:**
- Platform-wide: based on consumer's total completed bookings across all providers
- Haazir-subsidised: provider sees and earns the **discounted final amount**; the subsidised portion is logged separately to the provider's simulated earnings as a Haazir contribution
- Discount is visible to the consumer in the price breakdown card and on their profile

**Output:** Price estimate card with full line-item breakdown including loyalty discount line.

**Thinking steps logged:**
- Each adjustment factor with raw value and computed amount
- Whether surge was detected and why
- Loyalty tier identified and discount applied
- Final estimate with percentage contribution of each factor

---

### Phase 5: Booking & Provider Notification

**Trigger:** Consumer taps "Confirm Booking."

**Key rule:** Only the **consumer-selected provider** receives the job notification. Requests are never broadcast to multiple providers simultaneously. It is always one chosen provider at a time.

**Simulated actions (all logged as agent actions):**
1. Booking record created in Supabase with status `pending_provider_acceptance`
2. Real FCM push notification sent to the selected provider with full job card: service type, consumer sector, time slot, price estimate (post-discount), accept/decline buttons
3. In-app notification appears in provider's notification inbox with a 15-minute countdown timer
4. On provider acceptance: booking status updated to `confirmed`; consumer notified via FCM
5. Simulated confirmation message sent to consumer in agent chat
6. Simulated calendar entry and SMS/WhatsApp confirmation logged in Supabase (not actually sent)

**15-minute response window:**
- Provider has exactly 15 minutes from notification delivery to accept or decline
- A countdown timer is visible on the provider's job request card
- A matching "Waiting for response" state is shown to the consumer on screen C-06

**Non-response handling (timeout):**
- If no response in 15 minutes: booking auto-expires, status → `expired`
- Consumer notified via FCM: "Provider did not respond. Tap to find another."
- Re-initiate button shown in consumer chat (same flow as a decline)
- Non-response is logged against the provider (see penalty system in Phase 8)

**Thinking steps logged:**
- Booking object constructed
- FCM notification dispatched (token, payload)
- Status transition log

---

### Phase 6: Pre-Job Reminders

**Schedule:**

| Recipient | Reminder 1 | Reminder 2 |
|---|---|---|
| Provider | 24 hours before | 2 hours before |
| Consumer | 3 hours before | 1 hour before |

**Delivery:** Real FCM push notifications triggered by Supabase Edge Function CRON jobs.

---

### Phase 7: Service Progress & Completion

**Trigger:** Provider marks job as "En Route" → "Arrived" → "Completed" from their dashboard.

**Status updates shown to consumer:** Text-based status banner on the active job screen (no live map tracking).

**On job completion:**
- Booking status → `completed`
- Consumer notified to go to the feedback screen
- Provider notified to rate the consumer

---

### Phase 8: Decline, Non-Response & Retry Logic

**On each provider decline or non-response:**
- The provider is flagged in the session and excluded from all future searches in this booking session
- Consumer receives an FCM notification
- Consumer returns to chat; sees job summary card + "Find Another Provider" button (no re-typing required)
- Consumer agent re-runs Phase 3 with the excluded provider list
- A decline counter is shown subtly: "X of 7 attempts used"

**Non-response penalty system (tracked by provider agent, applied by Supabase):**
- 2 non-responses within any 7-day window → provider's reliability score penalised (DisputeScore mechanism)
- 5 non-responses within any 30-day window → provider temporarily hidden from all search results for 48 hours (account_status = `search_hidden`)
- Non-response is treated identically to a decline from the consumer's perspective

**After 7 total declines/non-responses/timeouts in one session:**
- Agent does not search further
- Agent presents two alternatives:
  1. **Alternative time slots:** "Most providers for AC Repairing are available on weekday mornings. Would you like to reschedule?"
  2. **Related service suggestion:** "If your issue is electrical in nature, an Electrician (HS-06) may also be able to help."

---

## 4. Provider Agent — Onboarding Chat

**Trigger:** New user selects "I offer services" on the role selection screen.

**Chat collects in sequence:**
1. Full name
2. Phone number (confirmation of the number used to register)
3. Service types offered (agent presents category list as structured UI chips; provider selects one or more)
4. Islamabad sector zones covered (agent presents sector list as multi-select chips)
5. Per-job rate in PKR (per service type if multiple services offered)
6. Weekly availability schedule (structured UI: day picker + open/close hour selectors)
7. Google Maps business pin (agent asks provider to drop a pin on an in-app map; manually dropped location saved as lat/lng)

**On completion:**
- Provider profile created instantly in Supabase (no admin approval required)
- Provider agent sends a welcome message confirming their profile summary
- Provider taken to their dashboard

**Profile Update Sessions:**
- Provider taps "Update My Profile / Skills" from dashboard
- Re-enters provider agent chat
- Agent loads current profile and asks what they want to change
- Only changed fields are updated

---

## 5. Provider Agent — AI Advisor Card Feed

The provider agent periodically generates advisory cards shown on the provider's dashboard. These are pre-generated nudges — not a live chat.

**Card types:**

| Card Type | Example |
|---|---|
| Gap opportunity | "You have no bookings Tuesday 2–5 PM. 3 pending requests in G-13 match your AC service." |
| Demand forecast | "AC service requests in I-8 and G-11 are up this week. Consider expanding your service area." |
| Rating alert | "Your punctuality score dropped to 6.2. Arriving on time for your next 3 jobs will improve your ranking." |
| Availability reminder | "You haven't updated your schedule in 2 weeks. Make sure your availability is current." |
| Non-response warning | "You have 2 unanswered job requests this week. Repeated non-responses will affect your ranking." |

Cards are generated daily by the provider agent using Supabase profile data and the simulated demand dataset.

---

## 6. Agent Thinking — UI Specification

**Toggle label:** "Show Haazir's Thinking"
**Default state:** Off
**Available on:** Consumer chat screen, Provider onboarding/update chat screen

**When toggled on, each agent action shows an expandable thinking block beneath it containing:**
- Phase name (e.g., "Phase 3: Provider Discovery")
- Step-by-step reasoning in plain language (matching the user's language)
- Specific numbers: how many providers were found, filtered, scored
- Decision justification: why provider A over provider B
- Any flags raised: low confidence, surge detected, complexity tier upgraded, non-response penalty applied, loyalty tier identified

**Format:** Collapsible card with a thinking icon. Styled differently from chat bubbles — slightly inset, muted background (`#F0EDE8` / dark mode `#2A2A2A`), left border 3dp amber, monospace-light font for scores and numbers.

---

*Next: File 03 — Consumer Features & Flows*
