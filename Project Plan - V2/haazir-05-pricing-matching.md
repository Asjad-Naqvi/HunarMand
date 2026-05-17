# Haazir — Product Specification
## File 05: Pricing, Matching & Algorithms

---

## 1. Overview

The Haazir consumer agent uses three interconnected algorithms:
1. **Job Complexity Classifier** — classifies the job before both matching and pricing
2. **Provider Matching & Ranking** — scored multi-factor ranking for registered and Google Maps providers
3. **Dynamic Pricing Engine** — generates a price estimate from the provider's base rate adjusted by contextual factors, then applies a consumer loyalty discount

These algorithms form the core of Haazir's reasoning layer. The consumer agent's thinking steps expose all computations in detail when the thinking toggle is enabled.

---

## 2. Job Complexity Classifier

### 2.1 Input
- Service code (e.g., HS-04 = AC Repairing)
- Consumer's natural-language description (parsed keywords and severity signals)

### 2.2 Complexity Tier Defaults by Service Code

| Service | Default Tier |
|---|---|
| AC General Service | Basic |
| All Cleaning Services (CS-01 through CS-07) | Basic |
| Plumber (minor), Electrician (minor) | Basic |
| AC Repairing, Gas/Electric Geyser Repairing | Intermediate |
| Carpenter Work, Painter | Intermediate |
| Electrician (fault diagnosis), Plumber (pipeline work) | Intermediate |
| AC Installation, AC Dismounting | Intermediate |
| Gas/Electric Geyser Installation, Dismounting | Intermediate |
| Water Tank Installation | Complex |
| AC Repairing (compressor/PCB fault) | Complex |

### 2.3 Complexity Upward Adjustment Signals

| Signal | Adjustment |
|---|---|
| "bilkul kaam nahi kar raha" / "completely stopped" | +1 tier |
| "bar bar problem" / "recurring issue" | +1 tier |
| "aag / spark / leakage / burning smell" | +1 tier + safety warning in chat |
| "purana / old" + major appliance | +1 tier |
| "naya lagwana hai" / "new installation" | Set to at least Intermediate |
| "sirf cleaning / safai" | Force Basic (override) |

Tier is capped at Complex. Final tier feeds into both matching and pricing.

---

## 3. Registered Provider Matching & Ranking Algorithm

### 3.1 Hard Filters (all must pass; sequential)

| Filter | Logic |
|---|---|
| Service match | Provider offers the matched service code |
| Sector coverage | Consumer's sector is in provider's service area list |
| Availability | Provider's schedule includes the requested day and time; not set to Unavailable or search_hidden; no confirmed booking overlaps the requested slot (including 30-min travel buffer) |
| Active status | Account is active — not suspended, not blacklisted |
| Session exclusion | Provider has not declined or failed to respond to this booking request in the current session |

### 3.2 Soft Scoring (weighted sum → composite 0–100)

```
Score = (Rating           × 0.20)
      + (OnTimeScore       × 0.18)
      + (ReviewRecency     × 0.12)
      + (SpecMatch         × 0.15)
      + (ProximityScore    × 0.15)
      + (CancellationScore × 0.10)
      + (DisputeScore      × 0.10)
```

#### Factor Definitions

**Rating (0–10 → 0–1)**
Platform average overall rating / 10.

**OnTimeScore (0–1)**
Average punctuality sub-rating / 10.

**ReviewRecencyScore (0–1)**
Weighted average of review recency:
- Reviews in last 30 days: weight 1.0
- 30–90 days: weight 0.6
- 90+ days: weight 0.3
- No reviews: 0.5 (neutral)

**SpecialisationMatchScore (0–1)**
- 1.0 = service code is provider's primary/only specialisation
- 0.75 = service offered among several others
- 0.5 = secondary/adjacent match
- Complexity bonus: if job is Complex and provider has 3+ completed jobs for that service code → +0.1 (capped at 1.0)

**ProximityScore (0–1)**
Based on Haversine distance from provider's pin to consumer's location:
- 0–2 km: 1.0
- 2–5 km: linear decay from 1.0 to 0.6
- 5–10 km: linear decay from 0.6 to 0.3
- 10+ km: 0.1

**CancellationScore (0–1)**
- 0% cancellation rate: 1.0
- 10% rate: 0.7
- 20% rate: 0.4
- 30%+ rate: 0.1

**DisputeScore (0–1)**
- 0 confirmed disputes: 1.0
- 1 dispute dismissed (provider cleared): 0.9
- 1 confirmed dispute with warning: 0.7
- 2+ confirmed disputes: 0.4
- Non-response penalty applied (from timeout history): −0.05 per non-response event (cumulative, minimum 0.1)
- Currently suspended: removed in hard filter step

### 3.3 Tiebreaker
If two providers score within 2 points: prefer the provider with more total completed jobs.

### 3.4 Budget-Sensitive Preference
If consumer's job object has `budget_sensitive = true`: among providers scoring within 5 points of each other, prefer the provider with the lower base rate. Price breakdown notes: "Budget-sensitive booking — lowest available rate prioritised."

### 3.5 Output
- Sorted list of up to 10 providers (score visible in thinking panel only — not on consumer-facing cards)
- Load more: up to 10 additional providers on tap
- Agent summary message: natural-language explanation of why #1 was recommended over #2

---

## 4. Google Maps Provider Ranking Algorithm

### 4.1 Source
Mock dataset labelled as synthetic, stored in Supabase table `gmaps_providers_mock`, structured to match Google Places API response format.

### 4.2 Hard Filters

| Filter | Logic |
|---|---|
| Category match | Consumer agent semantically reasons whether the business category matches the requested service. Category match confidence must be ≥ 0.5 |
| Open status | Business is currently marked as open |
| Contact info | Phone number is present in the mock data |

### 4.3 Soft Scoring

```
Score = (GoogleRating      × 0.25)
      + (ReviewCountScore  × 0.20)
      + (SentimentScore    × 0.20)
      + (ProximityScore    × 0.20)
      + (ContactScore      × 0.10)
      + (CategoryMatch     × 0.05)
```

**GoogleRating:** raw rating / 5 (normalised to 0–1)

**ReviewCountScore:** log10(review_count + 1) / log10(max_reviews + 1)

**SentimentScore:** Simulated score in mock data (0.0 = very negative, 1.0 = very positive)

**ProximityScore:** Same Haversine formula as registered provider algorithm

**ContactScore:** 1.0 if phone number present, 0.0 if not

**CategoryMatchScore:** Agent's semantic confidence score (0.5–1.0 only; below 0.5 filtered in hard filter step)

### 4.4 Output
- Sorted list of up to 10 businesses (load more available)
- Each card: name, Google rating, review count, distance, open status, call button
- All cards clearly labelled: "Data is simulated for demo purposes"

---

## 5. Dynamic Pricing Engine

### 5.1 Inputs
| Input | Source |
|---|---|
| `base_rate` | Provider's registered per-job rate for this service type (PKR) |
| `distance_km` | Haversine distance from provider's pin to consumer's location |
| `urgency` | From job object: same_day / next_day / scheduled |
| `complexity_tier` | From classifier: Basic / Intermediate / Complex |
| `surge_flag` | Boolean: true if 3+ active requests for same service code in same sector within last 2 hours |
| `loyalty_tier` | From consumer's profile: None / Bronze / Silver / Gold |

### 5.2 Full Price Formula

```
Pre-Discount Estimate = base_rate
                      + travel_adjustment
                      + urgency_adjustment
                      + complexity_adjustment
                      + surge_adjustment

Loyalty Discount      = Pre-Discount Estimate × loyalty_discount_pct

Final Estimate        = Pre-Discount Estimate − Loyalty Discount
```

### 5.3 Adjustment Components

**Travel Adjustment**
- First 3 km: PKR 0 (free)
- Beyond 3 km: PKR 20 per additional km
- Formula: `max(0, (distance_km − 3)) × 20`

**Urgency Adjustment**
| Urgency | Adjustment |
|---|---|
| Same-day | +15% of base_rate |
| Next-day | +0% |
| Scheduled (2+ days out) | +0% |

**Complexity Adjustment**
| Tier | Adjustment |
|---|---|
| Basic | +0% |
| Intermediate | +10% of base_rate |
| Complex | +20% of base_rate |

**Surge Adjustment**
| Condition | Adjustment |
|---|---|
| Surge detected | +10% of base_rate |
| No surge | +0% |

### 5.4 Consumer Loyalty Discount Tiers

| Tier | Total Completed Bookings | Discount % (applied to Pre-Discount Estimate) |
|---|---|---|
| None | 0–2 | 0% |
| Bronze | 3–7 | 5% |
| Silver | 8–14 | 10% |
| Gold | 15+ | 15% |

**Key rules:**
- Discount applies to the **full pre-discount estimate** (after all other adjustments)
- Discount **stacks** with all other adjustments — there is no cap
- Discount is **Haazir-subsidised**: the provider receives the post-discount amount as their job earnings; the subsidised portion is separately added to the provider's `total_earnings_simulated` as a Haazir loyalty contribution
- Loyalty tier and discount % visible on consumer's profile screen
- Loyalty discount line always appears in the price breakdown card (shows "—" if None tier)

### 5.5 Worked Example

```
Service:             AC Repairing (HS-04)
Provider base rate:  PKR 2,000
Distance:            6 km
Urgency:             Same-day
Complexity:          Intermediate (upgraded from description)
Surge:               Detected (3 active requests in G-13 this hour)
Consumer tier:       Silver (9 completed bookings)

Travel adjustment:       (6 − 3) × 20           = PKR    60
Urgency adjustment:      2,000 × 0.15            = PKR   300
Complexity adjustment:   2,000 × 0.10            = PKR   200
Surge adjustment:        2,000 × 0.10            = PKR   200

Pre-Discount Total:      2,000 + 60 + 300 + 200 + 200 = PKR 2,760

Silver Loyalty Discount: 2,760 × 0.10            = PKR   276

Final Estimate:          2,760 − 276             = PKR 2,484

Provider earns:          PKR 2,484
Haazir logs subsidy:     PKR 276  → added to provider's simulated earnings
```

### 5.6 Price Breakdown Display (Consumer-Facing)

```
Price Breakdown
───────────────────────────────────────────
Base rate (AC Repairing)        PKR 2,000
Travel (6 km, first 3 km free)  PKR    60
Same-day urgency (+15%)         PKR   300
Job complexity (+10%)           PKR   200
High demand surge (+10%)        PKR   200
───────────────────────────────────────────
Pre-discount total              PKR 2,760
Silver Loyalty Discount (−10%)  PKR  −276
───────────────────────────────────────────
Total Estimate                  PKR 2,484
───────────────────────────────────────────
Payment: Cash on Delivery
Final price confirmed on-site by provider.
```

### 5.7 Price Breakdown Display (Provider-Facing — on job request card)

```
Price Breakdown
───────────────────────────────────────────
Base rate (AC Repairing)        PKR 2,000
Travel adjustment               PKR    60
Urgency adjustment              PKR   300
Complexity adjustment           PKR   200
Surge adjustment                PKR   200
Loyalty discount (consumer)    −PKR   276
───────────────────────────────────────────
You will receive                PKR 2,484
Haazir loyalty contribution    +PKR   276  ← added to your earnings
───────────────────────────────────────────
Your total earnings (simulated) PKR 2,760
```

---

## 6. Double-Booking Prevention

1. Query Supabase for all confirmed bookings for the provider
2. Check if the requested time slot overlaps any existing booking
3. Estimated durations: Basic = 1 hour, Intermediate = 2 hours, Complex = 3 hours
4. Travel buffer: +30 minutes appended to each booking's duration for overlap checking
5. If overlap → provider removed in hard filter step (not shown to consumer)

---

## 7. Surge Detection

**Surge flag = true when:**
3 or more booking requests for the same service code have been created in the same Islamabad sector in the last 2 hours.

**Data source:** Supabase `surge_flags` table, recalculated every 30 minutes by a Supabase Edge Function CRON job.

**Shown to consumer:**
- Price breakdown line: "High demand surge (+10%)"
- Agent message in chat: "AC service is in high demand in G-13 right now, so a small surge fee applies."

---

## 8. Provider Non-Response Penalty Algorithm

Tracked in Supabase. Applied by background Edge Functions.

| Condition | Penalty |
|---|---|
| 2 non-responses within any 7-day window | DisputeScore −0.05 per event (reliability penalty) |
| 5 non-responses within any 30-day window | account_status → `search_hidden` for 48 hours |
| Each non-response event | Logged in `provider_nonresponses` table with timestamp |

Provider is notified via FCM at each threshold (see File 04, PN-12 through PN-14).

---

*Next: File 06 — Dispute System*
