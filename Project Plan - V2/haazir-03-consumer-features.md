# Haazir — Product Specification
## File 03: Consumer Features & Flows

---

## 1. Consumer Account

### 1.1 Authentication
- **Registration:** Phone number (mandatory) + password (mandatory) + email (optional)
- **Login:** Phone number + password
- On successful registration, consumer is taken through a short profile setup flow (structured form — not agent chat)
- Returning users go directly to the consumer home (chat) screen

### 1.2 Profile Data Collected

| Field | Details |
|---|---|
| Name | Entered during profile setup |
| Phone number | Used for registration and login; stored as contact field (no OTP) |
| Email | Optional; collected at registration |
| Password | Hashed via Supabase Auth |
| Saved addresses | Multiple, each with a custom label (e.g., Home, Office, Parents' House) and a Google Maps pin (lat/lng) |
| Preferred time of day | Morning / Afternoon / Evening — used by consumer agent as a soft matching preference |
| Saved (favourite) providers | List of Haazir-registered providers saved by the consumer |
| Service history | Auto-populated from completed bookings |
| Loyalty tier | Derived from total completed bookings; shown on profile and in price breakdowns |

### 1.3 Loyalty Tiers (Platform-Wide)

| Tier | Completed Bookings | Discount on Final Estimate |
|---|---|---|
| None | 0–2 | 0% |
| Bronze | 3–7 | 5% |
| Silver | 8–14 | 10% |
| Gold | 15+ | 15% |

- Discount is **Haazir-subsidised**: the provider receives the discounted amount and the subsidised portion is logged separately to the provider's simulated earnings as a Haazir contribution
- Loyalty tier and current discount % are visible on the consumer's profile screen
- Loyalty discount appears as a line item in every price breakdown card

### 1.4 Saved Addresses
- Consumer can add any number of saved addresses
- Each address has: custom label, Google Maps pin (lat/lng), display name
- When the consumer agent asks for location, it presents saved addresses as tappable chips before asking the consumer to drop a new pin

---

## 2. Consumer Flow — End to End

```
Registration / Login (phone + password)
     ↓
Profile Setup (first time only)
     ↓
Consumer Home — Chat Screen (Haazir Consumer Agent)
     ↓
Agent: Understand request → clarify if needed (structured UI prompts)
     ↓
Agent: Classify complexity → run provider discovery (both pipelines)
     ↓
Provider Results Screen (two-tab card list)
     ↓
Consumer selects provider
     ↓
Agent: Calculates price (with loyalty discount applied)
     ↓
Booking Confirmation Screen (full price breakdown)
     ↓
Agent: Sends FCM push notification to selected provider only
     ↓
Awaiting Provider Acceptance Screen (15-min countdown)
     ↓
     ├─ Provider Accepts → Booking Confirmed Screen
     │        ↓
     │   Pre-job reminders (FCM: 3h + 1h before for consumer)
     │        ↓
     │   Active Job Screen (status updates: En Route → Arrived → Completed)
     │        ↓
     │   Job Completed → Feedback Screen
     │
     ├─ Provider Declines → FCM notification to consumer
     │        → Back to Chat (re-initiate button + job summary)
     │
     └─ Provider No Response (15-min timeout) → FCM notification to consumer
              → Back to Chat (re-initiate button + job summary)
              → Non-response logged against provider
              ↓ (after 7 total declines/timeouts)
         Agent suggests alternate slots or related service types
```

---

## 3. Screen-by-Screen: Consumer Side

### Screen C-01: Splash / Launch Screen
- App logo + "Haazir" wordmark
- Tagline in English and Urdu
- Transitions to Login/Register after 2 seconds

### Screen C-02: Registration Screen
- Fields: Full name, phone number (mandatory), email (optional), password, confirm password
- "Already have an account? Log in" link
- Submit → profile setup flow (first time)

### Screen C-03: Login Screen
- Fields: Phone number, password
- "Forgot password?" link (reset via email if email was provided, otherwise contact support)
- "Don't have an account? Register" link
- On success → role check → Consumer Home or Provider Dashboard

### Screen C-04: Profile Setup (first-time only)
- Step 1: Confirm name
- Step 2: Add first saved address (label + map pin)
- Step 3: Set preferred time of day (chip selector: Morning / Afternoon / Evening)
- Progress indicator at top (3 steps)

### Screen C-05: Consumer Home — Chat Screen
The primary screen. Consumer spends most of their time here.

**Elements:**
- Top bar: Haazir logo/name + profile avatar (tappable → C-13 profile screen)
- "Show Haazir's Thinking" toggle (top right)
- Chat message area (scrollable, newest at bottom)
- Agent messages: left-aligned, AI assistant bubble style
- Consumer messages: right-aligned
- Structured clarification prompts: full-width cards with labelled buttons
- Text input bar at bottom with send button
- Microphone button: visible but inactive (future feature — v1 disabled)
- **Active booking banner** (shown when a booking is in progress): slim strip at top — "Active Booking: [Service] on [Date]" → tappable → C-10

### Screen C-06: Provider Results Screen
Reached after consumer agent completes discovery. Agent's summary recommendation message appears in chat; this screen is navigated to immediately after.

**Layout:**
- Tab bar: [Haazir Providers] [Google Maps Providers]
- Each tab: vertical scrollable list of provider cards
- "Load More" button at bottom (if > 10 results exist)

**Haazir Provider Card:**
| Element | Detail |
|---|---|
| Provider name | |
| Haazir Verified badge | Green pill with checkmark |
| Overall rating | ★ X.X / 10 in amber |
| Price estimate | "Est. PKR X,XXX" (dynamic, post-loyalty-discount) |
| Distance | "X.X km away" |
| Availability | "Available [Day], [Time]" — only shown if hours match |
| Top specialisation tag | e.g., "AC Specialist" |
| Agent Recommended tag | Amber pill — top card only |

Tapping card → C-07 Provider Profile Screen

**Google Maps Provider Card:**
| Element | Detail |
|---|---|
| Business name | |
| "From Google Maps" label | Muted grey badge |
| Google rating | X.X ★ (X reviews) |
| Distance | |
| Open/Closed status | |
| "Call" button | Tap-to-call only — no in-app booking |
| Simulated data label | Caption: "Data is simulated for demo" |

### Screen C-07: Provider Profile Screen
Full detail view of a Haazir-registered provider.

**Sections:**
1. Header: name, avatar initials, Haazir Verified badge, overall rating
2. Services offered: chip tags of all service codes
3. Service areas: Islamabad sectors listed
4. Ratings breakdown (all out of 10): Overall, Punctuality, Work Quality, Behaviour
5. Price: base per-job rate (before dynamic adjustments)
6. Availability: weekly schedule grid
7. Reviews: text reviews (visible here only, not on cards)
8. Stats: Jobs completed, Member since, Cancellation rate
9. Dispute history: "X past disputes (Y resolved, Z dismissed)"
10. Consumer's own past rating for this provider (if booked before)
11. "Select This Provider" CTA button

### Screen C-08: Booking Confirmation Screen

**Elements:**
- Condensed provider card (name, badge, rating)
- Service details: type, complexity tier, location, date/time slot
- Price breakdown card:
  ```
  Base rate                  PKR X,XXX
  Travel adjustment          PKR   XXX
  Urgency adjustment         PKR   XXX  (or "—")
  Complexity adjustment      PKR   XXX  (or "—")
  Surge adjustment           PKR   XXX  (or "—")
  ─────────────────────────────────────
  Pre-discount total         PKR X,XXX
  [Tier] Loyalty Discount   −PKR   XXX  (or "—" if None tier)
  ─────────────────────────────────────
  Total Estimate             PKR X,XXX
  ```
  Footer: "Final price confirmed on-site. Payment: Cash on Delivery."
- "Confirm Booking" button (primary)
- "Go Back" link

### Screen C-09: Awaiting Provider Acceptance Screen

**Elements:**
- Animated waiting indicator (subtle pulse on provider avatar)
- "Waiting for [Provider Name] to accept your booking…"
- Countdown timer: "Provider has XX:XX to respond"
- Job summary (service, time, location, price)
- "Cancel Request" option with confirmation modal
- On 15-minute timeout: screen auto-updates to expired state → FCM notification sent → re-initiate option shown

### Screen C-10: Booking Confirmed Screen

**Elements:**
- Large success checkmark
- Full booking summary (provider, service, time, location, total estimate, loyalty discount applied, payment method)
- Simulated confirmation note: "Confirmation logged. Reminder set."
- "View Active Booking" button → C-11

### Screen C-11: Active Job Screen

**Elements:**
- Job status progress banner (step dots): Confirmed → En Route → Arrived → In Progress → Completed
- Active step highlighted in amber
- Provider info: name, rating, phone number (tap-to-call)
- Job details: service, address, time, price estimate
- Reminder history: which reminders were sent and when
- "Report an Issue" link → C-14 Dispute Chat (active only after status = Completed)

### Screen C-12: Feedback Screen
Triggered by FCM notification after job completion.

**Elements:**
- Provider name and service summary
- Four separate 1–10 rating dimensions: Overall, Punctuality, Work Quality, Behaviour
- Optional written review (free text)
- "Submit" button
- Ratings update provider's scores in Supabase and feed into future matching

### Screen C-13: Re-initiate Search Screen (Post-Decline / Post-Timeout)
Appears inline in the consumer chat after a decline or timeout notification.

**Elements:**
- Original job summary card (read-only): service, location, time, complexity, price estimate
- Agent message: "Your request was declined / didn't receive a response. Here's what you had:"
- "Find Another Provider" button (triggers consumer agent Phase 3 with excluded provider list)
- Decline/timeout counter: "X of 7 attempts used" (shown subtly)

### Screen C-14: Past Bookings Screen
Accessible from bottom navigation.

**Elements:**
- Chronological list of past bookings
- Each entry: service name, provider name, date, status chip (Completed / Cancelled / Disputed / Expired), price
- Tappable → booking detail view with full price breakdown

### Screen C-15: Favourites Screen
Accessible from bottom navigation.

**Elements:**
- List of saved Haazir-registered providers
- Each entry: condensed provider card with remove-from-favourites option
- "Book Again" button → pre-populates consumer agent chat context

### Screen C-16: Consumer Profile Screen
Accessible from chat top bar avatar.

**Elements:**
- Name, phone number, email (if provided)
- **Loyalty tier badge** with current tier name and discount %: e.g., "Silver — 10% Loyalty Discount"
- Total completed bookings count (drives tier)
- Saved addresses (add, edit, remove — each with label and map pin)
- Preferred time of day setting
- Sign out button
- App version / about

### Screen C-17: Dispute Initiation Chat
Reached from "Report an Issue" on C-11.

**Elements:**
- Consumer agent guides dispute filing
- Dispute type selection (structured UI prompt): "Work quality was not acceptable" / "Provider did not complete the job"
- Agent collects structured answers per dispute type (see File 06)
- Dispute confirmation and submission

### Screen C-18: Dispute Status Screen
Accessible from C-14 past bookings detail.

**Elements:**
- Dispute type, date filed
- Status chip: Under Review / Resolved
- Verdict summary (once resolved)
- Booking reference

---

## 4. Consumer Notification Types

| ID | Trigger | Text (example) |
|---|---|---|
| CN-01 | Provider accepts booking | "[Name] accepted your [Service] booking for [Date] at [Time]." |
| CN-02 | Provider declines booking | "Your booking request was declined. Tap to find another provider." |
| CN-03 | Provider no response (15-min timeout) | "[Name] didn't respond in time. Tap to find another provider." |
| CN-04 | Booking auto-expired | "Your booking request expired with no response. Tap to search again." |
| CN-05 | Reminder — 3 hours before | "Your [Service] is in 3 hours. [Provider Name] is scheduled for [Time]." |
| CN-06 | Reminder — 1 hour before | "[Provider Name] is scheduled to arrive in about an hour." |
| CN-07 | Provider marks En Route | "[Provider Name] is on their way to your location." |
| CN-08 | Job marked Completed | "Your [Service] is done. Leave a review for [Provider Name]." |
| CN-09 | Dispute verdict issued | "Your dispute for [Service] on [Date] has been reviewed. Tap to see the outcome." |

---

*Next: File 04 — Provider Features & Flows*
