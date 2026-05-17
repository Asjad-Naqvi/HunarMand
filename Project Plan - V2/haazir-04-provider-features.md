# Haazir — Product Specification
## File 04: Provider Features & Flows

---

## 1. Provider Account

### 1.1 Authentication
- **Registration:** Phone number (mandatory) + password (mandatory) + email (optional)
- **Login:** Phone number + password
- On first login, user is asked role: "I need a service" or "I offer services" → role selection screen
- Provider role selected → provider agent onboarding chat begins

### 1.2 Profile Data Collected (via Provider Agent Onboarding Chat)

| Field | Details |
|---|---|
| Full name | Free text |
| Phone number | Confirmed from registration; stored as contact field |
| Service types | Multi-select from full service catalogue (agent presents as chip UI) |
| Service areas | Islamabad sector zones (multi-select chip UI) |
| Per-job rate (PKR) | One rate per service type offered |
| Weekly availability | Day of week + open hour + close hour |
| Location pin | Manually dropped on in-app Google Map; saved as lat/lng |

### 1.3 Instant Activation
No admin approval required. Provider profile is live and discoverable immediately after onboarding chat completes (provided account_status = `active`).

---

## 2. Provider Flow — End to End

```
Registration (phone + password)
     ↓
Role Selection: "I offer services"
     ↓
Provider Agent — Onboarding Chat (8 steps)
     ↓
Provider Dashboard
     ├─ Notification Inbox (job request cards: Accept / Decline with 15-min timer)
     ├─ Upcoming Confirmed Jobs
     ├─ AI Advisor Cards (provider agent feed)
     ├─ Dashboard Stats
     └─ Availability Toggle

FCM Push Notification: New Job Request
     ↓
Provider taps notification → Job Request Card Detail (P-04)
     ↓
     ├─ Accept (within 15 min) → Job added to Upcoming Jobs; Consumer notified
     │       ↓
     │  Job day: Mark En Route → Arrived → Completed (from P-05)
     │       ↓
     │  Rate the Consumer (P-06 — feedback screen)
     │
     ├─ Decline → Consumer notified; provider excluded from this session's results
     │
     └─ No Response (15-min timeout) → Request auto-expires
              → Consumer notified
              → Non-response logged (penalties applied per File 02, Phase 8)
```

---

## 3. Provider Agent — Onboarding Chat Sequence

The provider agent guides registration conversationally, mirroring the provider's language.

**Step 1 — Greeting & intent confirmation**
> Agent: "Assalam o Alaikum! Main Haazir hoon. Chaliye aapka provider account set up karte hain. Pehle, aapka poora naam batayein."

**Step 2 — Name**
Free text. Agent confirms: "Shukriya, [Name]!"

**Step 3 — Phone number confirmation**
Agent pre-fills from registration data and asks provider to confirm.

**Step 4 — Service types**
Full two-category service list as interactive chip selectors grouped by category (Home Services / Cleaning Services). Provider taps to select. Agent confirms selection.

**Step 5 — Service areas**
All major Islamabad sectors as multi-select chips (G-6 through G-16, F-6 through F-11, I-8 through I-10, D-12, E-7, H-8, etc.). Provider selects covered zones.

**Step 6 — Per-job rate**
For each selected service type, agent asks for the per-job rate in PKR.
> "AC Repairing ke liye aap per job kitna charge karte hain? (PKR mein)"

**Step 7 — Availability schedule**
Structured weekly schedule picker: day checkboxes (Mon–Sun) + open time and close time for each selected day.

**Step 8 — Location pin**
Agent asks provider to drop their location pin on an in-app Google Maps view.
> "Ab please apni location pin drop karein map par taake hum aapka service area aur travel distance calculate kar sakein."
Provider can search for their registered business on Google Maps or drop a manual pin on their home/workshop.

**Step 9 — Summary & confirmation**
Agent shows full profile summary card. Provider confirms or taps "Edit" on any field.

**Step 10 — Account created**
Success message. Provider taken to dashboard.

---

## 4. Provider Agent — Profile Update Chat

**Entry:** Provider taps "Update My Profile / Skills" from dashboard (P-08).

**Agent behaviour:**
- Loads current profile from Supabase
- Greets the provider and lists what can be updated: services, sectors, rates, availability, location pin
- Provider states what they want to change (free text or structured prompt)
- Agent updates only the specified fields
- Agent confirms changes and returns provider to dashboard

---

## 5. Provider Dashboard — Screen Specifications

### Screen P-01: Provider Dashboard (Home)

The provider's main screen. Structured UI — no live agent chat.

**Layout sections (top to bottom):**

**A — Header**
- Provider name + avatar initials
- Haazir Verified badge
- Availability toggle: [Available ✓] / [Unavailable] — large, prominent
  - Available: green background, white text
  - Unavailable: muted grey background, white text
  - Toggle updates `availability_status` in Supabase in real time
  - When Unavailable: provider is hidden from all consumer searches

**B — Stats Row**
Four stat tiles in a horizontal scrollable row:
| Stat | Display |
|---|---|
| Average Rating | X.X / 10 |
| Jobs Completed | XXX |
| Total Earnings | PKR XX,XXX *(simulated — includes Haazir loyalty subsidy contributions)* |
| Cancellation Rate | X% |

**C — AI Advisor Cards (Provider Agent Feed)**
Horizontally scrollable card strip. Each card generated by the provider agent daily.
- Card types: Gap Opportunity, Demand Forecast, Rating Alert, Availability Reminder, Non-Response Warning
- Card design: 200dp wide, icon + type label, headline (medium 14sp), detail (regular 12sp), optional deep-link button
- Read-only — no live chat interaction

**D — Notification Inbox Preview**
Most recent unread job request card shown inline. "See All Notifications" link → P-02.

**E — Upcoming Confirmed Jobs**
Sorted by date (nearest first). Each entry:
- Service type, consumer first name + sector, date/time, price estimate
- Status chip: Confirmed / En Route / Arrived / In Progress
- "Mark Status" button → status update flow (P-05)

**F — Quick Links**
- View Past Jobs → P-07
- Update My Profile / Skills → re-opens provider agent chat

---

### Screen P-02: Notification Inbox

Full list of all notifications, most recent first.

**Job Request Card (most important notification type):**
- Distinct styling — prominent, elevated card
- Contents:
  - Service type and complexity tier
  - Consumer location: sector only (not full address until accepted)
  - Requested date and time slot
  - Price estimate (post-loyalty-discount — what provider will earn)
  - Haazir subsidy note: "Includes PKR XXX Haazir loyalty contribution" (if loyalty discount applied)
  - Consumer's average consumer rating (from past provider ratings)
  - Consumer dispute flag: ⚠ "This consumer has a dispute flag" (if VRD-05 issued)
  - **[Accept]** button (green, primary)
  - **[Decline]** button (outlined, secondary)
- Countdown timer: "Expires in MM:SS" (15-minute window)
- On accept: card converts to confirmed booking; consumer notified
- On decline: card archived; consumer notified; provider excluded from this session's results
- On expiry: card auto-archives; consumer notified; non-response logged against provider

**Other notification types in inbox:**
- Booking reminders (24h and 2h before job)
- Consumer rating received
- Dispute status updates (opened, resolved)
- Provider agent advisor alerts
- Non-response warning: "You have X unanswered requests this week"

---

### Screen P-03: Job Request Card Detail (Expanded)

Reached by tapping a job request card in the notification inbox.

**Elements:**
- Full service details: type, complexity tier
- Consumer location: sector only
- Requested date and time
- Full price breakdown (same structure as consumer confirmation screen, showing post-discount amount)
- Haazir subsidy line (if applicable): "Haazir Loyalty Contribution: +PKR XXX"
- Consumer rating and flag (if applicable)
- [Accept] and [Decline] buttons with countdown timer
- On acceptance: full consumer address revealed in the confirmed job detail screen (P-05)

---

### Screen P-04: Job Detail Screen (Upcoming / Active Job)

Reached from dashboard upcoming jobs list.

**Elements:**
- Service type, complexity tier
- Consumer first name + full address (revealed after acceptance)
- Scheduled date and time
- Full price breakdown (with Haazir subsidy line if applicable)
- Status update buttons (sequential):
  - [Mark as En Route] → [Mark as Arrived] → [Mark as Completed]
  - Each status update triggers a consumer FCM notification
- "Report Issue" link → P-09 Provider Dispute Chat (active only after Completed)

---

### Screen P-05: Rate Consumer Screen

Triggered after provider marks job as Completed.

**Elements:**
- Consumer first name
- Four rating dimensions (1–10 each): Overall, Cooperativeness, Punctuality (was consumer home on time), Payment Behaviour
- Optional written note (visible to future providers on their job request card)
- "Submit Rating" button
- Rating updates consumer's consumer_rating_avg in Supabase

---

### Screen P-06: Past Jobs Screen

Chronological list of all jobs with status chips.

**Each entry:**
- Service type, date, sector
- Consumer rating received (if given)
- Provider's rating given to consumer
- Amount earned (PKR — simulated, includes Haazir subsidy if applicable)
- Status: Completed / Cancelled / Disputed / Expired

---

### Screen P-07: Provider Profile & Settings Screen

**Elements:**
- Current profile summary: name, phone, email (if provided), services, areas, rates, schedule, location pin (map preview)
- "Update My Profile / Skills" → re-opens provider agent chat
- Sign out button

---

### Screen P-08: Provider Dispute Chat

Reached from "Report Issue" on P-04 (after job Completed status).

**Elements:**
- Provider agent guides dispute filing
- Dispute type selection (structured prompt): "Consumer was not present" / "Consumer refused to pay"
- Agent collects structured answers per dispute type (see File 06)
- Dispute confirmation and submission

---

### Screen P-09: Provider Dispute Status Screen

**Elements:**
- Dispute type, date filed
- Status chip: Under Review / Resolved
- Verdict summary (once resolved)
- Booking reference

---

## 6. Provider Availability System

### Manual Availability Toggle
- Dashboard toggle: Available / Unavailable
- When Unavailable: provider filtered out of all consumer searches regardless of schedule
- Used for sick days, vacations, emergencies

### Weekly Schedule
- Set during onboarding; editable via provider agent chat
- Defines bookable hours; system prevents double-booking
- Estimated job durations: Basic = 1 hour, Intermediate = 2 hours, Complex = 3 hours
- Travel buffer: 30 minutes added between jobs for scheduling overlap checks

### Search-Hidden Status
- Triggered automatically by non-response penalty system (5 non-responses in 30 days)
- Duration: 48 hours
- Provider is notified via FCM when hidden and when restored
- Different from Unavailable (manual) — this is system-enforced

---

## 7. Provider Earnings — Simulated Model

- Provider's per-job earnings = **final estimate shown to consumer** (post-loyalty-discount)
- If a loyalty discount was applied, the Haazir loyalty subsidy amount is added to the provider's simulated earnings separately: `earnings = discounted_amount + haazir_subsidy`
- This means the provider's total_earnings_simulated always reflects their full pre-discount rate, with the subsidy contribution tracked transparently
- All earnings figures are clearly labelled as simulated in the UI

---

## 8. Provider Notification Catalogue

| ID | Trigger | Text (example) |
|---|---|---|
| PN-01 | New job request | "New job: AC Repair in G-13, [Date] at [Time]. Est. PKR X,XXX. 15 minutes to respond." |
| PN-02 | Job request expired (timeout) | "A job request has expired. Please respond to future requests within 15 minutes." |
| PN-03 | Job request cancelled by consumer | "A job request you received was cancelled by the consumer." |
| PN-04 | Reminder — 24 hours before job | "Reminder: [Service] job tomorrow at [Time] in [Sector]." |
| PN-05 | Reminder — 2 hours before job | "Your [Service] job starts in 2 hours. Address: [Full Address]. PKR X,XXX." |
| PN-06 | Consumer rating received | "A consumer rated your work [X]/10. Tap to see feedback." |
| PN-07 | Dispute filed against provider | "A dispute has been raised for your job on [Date]. Details inside." |
| PN-08 | Dispute dismissed — provider cleared | "The dispute against you on [Date] has been dismissed. No action taken." |
| PN-09 | Dispute — warning issued | "A formal warning has been issued for the dispute on [Date]. Tap to review." |
| PN-10 | Dispute — suspended | "Your account has been suspended for 7 days due to repeated disputes. Reactivates on [Date]." |
| PN-11 | Provider dispute resolved in their favour | "Your dispute against the consumer has been noted. A flag has been added to their profile." |
| PN-12 | Non-response warning | "You have 2 unanswered job requests this week. Repeated non-responses will affect your ranking." |
| PN-13 | Search-hidden activated | "Due to repeated non-responses, you have been hidden from search results for 48 hours." |
| PN-14 | Search-hidden lifted | "Your profile is now visible in search results again. Please respond to future requests promptly." |

---

*Next: File 05 — Pricing, Matching & Algorithms*
