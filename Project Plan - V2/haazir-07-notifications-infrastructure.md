# Haazir — Product Specification
## File 07: Notifications & Infrastructure

---

## 1. Notification Architecture

### Stack
```
Supabase (database event / CRON trigger)
        ↓
Supabase Edge Function (Deno/TypeScript)
        ↓
Firebase Cloud Messaging HTTP v1 API
        ↓
Expo Push Notification Service
        ↓
Android Device (system push notification)
```

### How It Works
1. An event occurs in Supabase (new booking, decline, job completed, dispute filed, timer expired, etc.)
2. A Supabase Edge Function fires — either via a Database Webhook (for real-time events) or a scheduled CRON job (for time-based events)
3. The Edge Function calls the FCM HTTP v1 API with the notification payload
4. FCM delivers the notification to the recipient's Android device via Expo's notification infrastructure
5. If the app is in the foreground, an in-app notification banner is also shown

### Setup Requirements
- Firebase project linked to Expo app (`google-services.json`)
- FCM server key stored as a Supabase secret (never exposed to client)
- Each user's Expo push token stored in Supabase `users` table on every login
- Supabase Edge Functions in TypeScript (Deno runtime)
- Database webhooks configured for key booking status transitions

---

## 2. Authentication System

### Registration Flow
```
User opens app
     ↓
Registration Screen
     ├─ Phone number (mandatory)
     ├─ Password (mandatory)
     └─ Email (optional)
     ↓
Supabase Auth: createUser (phone + password as primary credentials)
     ↓
Row inserted in public.users
     ↓
Role Selection Screen
     ↓
     ├─ Consumer → Profile Setup → Consumer Home
     └─ Provider → Provider Agent Onboarding Chat → Dashboard
```

### Login Flow
```
Login Screen
     ├─ Phone number
     └─ Password
     ↓
Supabase Auth: signInWithPassword (phone as identifier)
     ↓
Check public.users.role
     ↓
     ├─ consumer → Consumer Home (C-05)
     └─ provider → Provider Dashboard (P-01)
```

### Notes
- Phone number is stored as a contact field only — no OTP is sent
- Email is optional — stored for potential password reset; not used for login
- Both roles use the same auth table; role is determined by `public.users.role`
- Password reset: if email was provided, Supabase sends reset email; otherwise no self-serve reset in v1

---

## 3. Full Notification Catalogue

### Consumer Notifications

| ID | Trigger | Delivery method | Title | Body |
|---|---|---|---|---|
| CN-01 | Provider accepts booking | DB Webhook → FCM | Booking Confirmed! | "[Name] accepted your [Service] booking for [Date] at [Time]." |
| CN-02 | Provider declines booking | DB Webhook → FCM | Booking Declined | "Your booking request was declined. Tap to find another provider." |
| CN-03 | Provider no response (15-min timeout) | CRON → FCM | No Response | "[Name] didn't respond in time. Tap to find another provider." |
| CN-04 | Booking auto-expired | CRON → FCM | Request Expired | "Your booking request expired. Tap to search again." |
| CN-05 | Reminder — 3 hours before job | CRON → FCM | Job in 3 Hours | "Your [Service] is in 3 hours. [Provider] is scheduled for [Time]." |
| CN-06 | Reminder — 1 hour before job | CRON → FCM | Job in 1 Hour | "[Provider Name] is scheduled to arrive in about an hour." |
| CN-07 | Provider marks En Route | DB Webhook → FCM | Provider On The Way | "[Provider Name] is on their way to your location." |
| CN-08 | Job marked Completed | DB Webhook → FCM | Job Complete | "Your [Service] is done. Leave a review for [Provider Name]." |
| CN-09 | Dispute verdict issued | CRON → FCM | Dispute Update | "Your dispute for [Service] on [Date] has been reviewed. Tap to see the outcome." |

### Provider Notifications

| ID | Trigger | Delivery method | Title | Body |
|---|---|---|---|---|
| PN-01 | New job request (consumer confirms booking) | DB Webhook → FCM | New Job Request | "[Service] in [Sector], [Date] at [Time]. Est. PKR [Amount]. 15 min to respond." |
| PN-02 | Job request expired — provider non-response | CRON → FCM | Request Expired | "A job request expired because you didn't respond. Please respond within 15 minutes in future." |
| PN-03 | Job request cancelled by consumer | DB Webhook → FCM | Request Cancelled | "A job request you received was cancelled by the consumer." |
| PN-04 | Reminder — 24 hours before job | CRON → FCM | Job Tomorrow | "Reminder: [Service] job tomorrow at [Time] in [Sector]." |
| PN-05 | Reminder — 2 hours before job | CRON → FCM | Job in 2 Hours | "Your [Service] job starts in 2 hours. Address: [Full Address]. PKR [Amount]." |
| PN-06 | Consumer submits rating | DB Webhook → FCM | New Rating | "A consumer rated your work [X]/10. Tap to see their feedback." |
| PN-07 | Dispute filed against provider | DB Webhook → FCM | Dispute Raised | "A consumer has raised a dispute for your job on [Date]. Details inside." |
| PN-08 | Dispute dismissed — provider cleared | CRON → FCM | Dispute Dismissed | "The dispute against you on [Date] has been dismissed. No action taken." |
| PN-09 | Dispute — warning issued | CRON → FCM | Warning Issued | "A formal warning has been issued for the dispute on [Date]. Tap to review." |
| PN-10 | Dispute — suspended | CRON → FCM | Account Suspended | "Your account has been suspended for 7 days. Reactivates on [Date]." |
| PN-11 | Provider-initiated dispute resolved | CRON → FCM | Dispute Resolved | "Your dispute against the consumer has been noted. A flag has been added to their profile." |
| PN-12 | Non-response warning (2 in 7 days) | CRON → FCM | Response Warning | "You have 2 unanswered job requests this week. This affects your ranking." |
| PN-13 | Search-hidden activated (5 in 30 days) | CRON → FCM | Temporarily Hidden | "Due to repeated non-responses, you've been hidden from search for 48 hours." |
| PN-14 | Search-hidden lifted | CRON → FCM | Visibility Restored | "Your profile is visible in search results again. Please respond to future requests promptly." |

---

## 4. Scheduled Edge Functions (CRON Jobs)

| Job | Schedule | Action |
|---|---|---|
| Booking 15-min expiry check | Every 2 minutes | Find bookings in `pending_provider_acceptance` older than 15 min; status → `expired`; send CN-03 + CN-04; log non-response against provider |
| Consumer reminder — 3 hours | Every 15 minutes | Find bookings starting in 3:00–3:15 hrs; send CN-05 if not already sent |
| Consumer reminder — 1 hour | Every 15 minutes | Find bookings starting in 1:00–1:15 hrs; send CN-06 if not already sent |
| Provider reminder — 24 hours | Daily at 8 AM | Find bookings starting in 24–25 hours; send PN-04 if not already sent |
| Provider reminder — 2 hours | Every 15 minutes | Find bookings starting in 2:00–2:15 hrs; send PN-05 if not already sent |
| Dispute auto-resolve | Daily at midnight | Find disputes in `under_review` older than 24 hours; run agent verdict logic; update status; send verdict notifications |
| Surge flag recalculation | Every 30 minutes | For each service_code × sector combination: count bookings created in last 2 hours; set surge_flags.is_surge_active accordingly |
| AI Advisor card generation | Daily at 6 AM | For each active provider: run provider agent advisor logic; write new cards to `advisor_cards` table |
| Non-response penalty check | Daily at 1 AM | Count non-responses per provider in last 7 days and 30 days; apply DisputeScore penalty and search_hidden status where thresholds met; send PN-12/PN-13/PN-14 |
| Suspension expiry check | Every hour | Find providers with account_status = `suspended` or `search_hidden` where expiry has passed; restore status; send PN-14 or equivalent |

---

## 5. Supabase Database Schema (Core Tables)

### users
```
id                  uuid, PK
phone               text, unique, not null
email               text, unique, nullable
password_hash       (managed by Supabase Auth)
name                text
role                enum: consumer | provider
expo_push_token     text, nullable
created_at          timestamp
```

### consumer_profiles
```
user_id             uuid, FK → users, PK
preferred_time      enum: morning | afternoon | evening
consumer_rating_avg float (average of provider-given ratings)
dispute_flag        boolean, default false
total_completed     int, default 0
loyalty_tier        enum: none | bronze | silver | gold (derived from total_completed)
```

### consumer_addresses
```
id                  uuid, PK
user_id             uuid, FK → users
label               text (e.g., "Home", "Office")
display_name        text
lat                 float
lng                 float
created_at          timestamp
```

### consumer_favourites
```
consumer_id         uuid, FK → users
provider_id         uuid, FK → users
saved_at            timestamp
PRIMARY KEY (consumer_id, provider_id)
```

### provider_profiles
```
user_id             uuid, FK → users, PK
location_lat        float
location_lng        float
availability_status enum: available | unavailable | search_hidden | suspended | blacklisted
base_rating         float
punctuality_rating  float
quality_rating      float
behaviour_rating    float
jobs_completed      int, default 0
cancellation_rate   float, default 0
dispute_score       float, default 1.0
total_earnings_simulated  int (PKR, includes Haazir loyalty subsidy contributions)
account_status      enum: active | suspended | search_hidden | blacklisted
suspension_until    timestamp, nullable
member_since        timestamp
```

### provider_services
```
id                  uuid, PK
provider_id         uuid, FK → users
service_code        text (e.g., HS-04)
per_job_rate_pkr    int
is_primary          boolean
```

### provider_sectors
```
provider_id         uuid, FK → users
sector_code         text (e.g., G-13)
PRIMARY KEY (provider_id, sector_code)
```

### provider_availability
```
provider_id         uuid, FK → users
day_of_week         int (0 = Mon … 6 = Sun)
open_time           time
close_time          time
PRIMARY KEY (provider_id, day_of_week)
```

### provider_nonresponses
```
id                  uuid, PK
provider_id         uuid, FK → users
booking_id          uuid, FK → bookings
expired_at          timestamp
penalty_applied     boolean, default false
```

### bookings
```
id                          uuid, PK
consumer_id                 uuid, FK → users
provider_id                 uuid, FK → users, nullable
service_code                text
complexity_tier             enum: basic | intermediate | complex
consumer_address_id         uuid, FK → consumer_addresses
requested_date              date
requested_time_slot         time
urgency                     enum: same_day | next_day | scheduled
budget_sensitive            boolean
base_rate_pkr               int
price_breakdown             jsonb
pre_discount_estimate_pkr   int
loyalty_discount_pkr        int, default 0
loyalty_tier_applied        enum: none | bronze | silver | gold
final_estimate_pkr          int
haazir_subsidy_pkr          int, default 0
status                      enum: pending_provider_acceptance | confirmed | en_route | arrived | in_progress | completed | cancelled | expired | disputed
reminder_consumer_3h_sent   boolean, default false
reminder_consumer_1h_sent   boolean, default false
reminder_provider_24h_sent  boolean, default false
reminder_provider_2h_sent   boolean, default false
created_at                  timestamp
confirmed_at                timestamp, nullable
completed_at                timestamp, nullable
```

### booking_declined_providers
```
booking_id          uuid, FK → bookings
provider_id         uuid, FK → users
reason              enum: declined | timeout
declined_at         timestamp
PRIMARY KEY (booking_id, provider_id)
```

### reviews
```
id                          uuid, PK
booking_id                  uuid, FK → bookings
reviewer_id                 uuid, FK → users
reviewee_id                 uuid, FK → users
reviewer_role               enum: consumer | provider
overall_rating              int (1–10)
punctuality_rating          int (1–10)
quality_rating              int (1–10)    -- consumer reviewing provider
behaviour_rating            int (1–10)    -- consumer reviewing provider
cooperativeness_rating      int (1–10)    -- provider reviewing consumer
payment_rating              int (1–10)    -- provider reviewing consumer
review_text                 text, nullable
created_at                  timestamp
```

### disputes
```
id                  uuid, PK
booking_id          uuid, FK → bookings
raised_by_id        uuid, FK → users
raised_by_role      enum: consumer | provider
dispute_type        enum: DIS-01 | DIS-02 | DIS-03 | DIS-04
description_json    jsonb (structured answers from agent chat)
status              enum: under_review | resolved
verdict             enum: VRD-01 | VRD-02 | VRD-03 | VRD-04 | VRD-05, nullable
verdict_reasoning   text (agent's simulated reasoning)
resolved_at         timestamp, nullable
created_at          timestamp
```

### advisor_cards
```
id                  uuid, PK
provider_id         uuid, FK → users
card_type           enum: gap_opportunity | demand_forecast | rating_alert | availability_reminder | nonresponse_warning
headline            text
detail              text
deep_link_action    text, nullable
generated_at        timestamp
is_read             boolean, default false
```

### surge_flags
```
service_code        text
sector_code         text
is_surge_active     boolean
request_count       int
window_start        timestamp
last_updated        timestamp
PRIMARY KEY (service_code, sector_code)
```

### gmaps_providers_mock
```
id                  uuid, PK
business_name       text
category            text
lat                 float
lng                 float
sector_code         text
google_rating       float
review_count        int
sentiment_score     float
phone               text, nullable
is_open             boolean
is_simulated        boolean, default true
```

---

## 6. Google Maps / Places Integration

### For Registered Provider Distance Calculation
- Provider location stored as lat/lng from their onboarding pin drop
- Distance calculated using the Haversine formula in Supabase or in the app — no Places API call needed

### For Google Maps Provider List
- v1 (Hackathon): mock dataset in `gmaps_providers_mock` table — structured to match Places API response format
- Labelled as simulated in all UI surfaces

### Geocoding & Sector Assignment
- Consumer and provider drop pins directly on Google Maps SDK → lat/lng returned directly
- Sector assignment: Supabase lookup table maps lat/lng bounding boxes to Islamabad sector codes

---

## 7. Mock Data Strategy

All mock data is:
- Stored in Supabase (not hardcoded in the app)
- Clearly labelled in the UI wherever surfaced
- Realistic for Islamabad: real sector names, PKR price ranges, provider names in Urdu/English

**Required mock datasets:**
1. `gmaps_providers_mock` — 30–40 Google Maps business entries across all service categories in Islamabad sectors
2. Pre-seeded Haazir provider accounts — 20–30 providers with full profiles, ratings, booking histories, and varied dispute histories
3. Simulated demand/surge data — pre-populated surge flags for demo scenarios
4. Sample dispute records — 3–5 pre-resolved disputes to demonstrate dispute history display and verdict types
5. Sample consumer accounts — 2–3 accounts at different loyalty tiers (None, Silver, Gold) for demo

---

*Next: File 08 — Screen List & UI/UX Direction*
