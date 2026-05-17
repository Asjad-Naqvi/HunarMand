# Haazir — Product Specification
## File 06: Dispute System

---

## 1. Overview

The Haazir dispute system allows both consumers and providers to raise formal complaints after a job is marked as complete. Disputes are handled by the respective Haazir agent — the consumer agent handles consumer-initiated disputes, and the provider agent handles provider-initiated disputes. Both agents collect structured information, log the dispute, and deliver a simulated verdict that updates reputation scores and account statuses accordingly.

There is no human admin review in v1. All arbitration is simulated by the agent.

---

## 2. Who Can Raise a Dispute

| Role | Can raise | Handled by | Timing window |
|---|---|---|---|
| Consumer | Yes | Consumer Agent | Within 48 hours of job completion |
| Provider | Yes | Provider Agent | Within 48 hours of job completion |

After 48 hours, the booking is locked and no dispute can be filed.

---

## 3. Dispute Types

### Consumer-Initiated
| Type | Code | Description |
|---|---|---|
| Work quality complaint | DIS-01 | Service was performed poorly or incorrectly |
| Job not completed / abandoned midway | DIS-02 | Provider left before finishing |

### Provider-Initiated
| Type | Code | Description |
|---|---|---|
| Consumer no-show | DIS-03 | Consumer was not present at the scheduled time/location |
| Consumer refused to pay | DIS-04 | Consumer refused to pay the agreed amount |

---

## 4. Consumer Dispute Initiation Flow

**Entry point:** "Report an Issue" link on Active Job Screen (C-11), active only after job status = Completed.

**Step 1 — Dispute type selection**
Consumer agent presents a structured UI prompt:
- "The work quality was not acceptable" → DIS-01
- "The provider did not complete the job" → DIS-02

**Step 2 — Agent collects structured details**

For **DIS-01 (Work Quality Complaint):**
- "What specifically was wrong with the work? Please describe."
- "Did the provider agree to fix the issue on-site?" [Yes / No / They refused]
- "Do you have any photos or documentation?" (text description logged; photo upload not required for v1)

For **DIS-02 (Job Not Completed):**
- "At what point did the provider stop or leave?"
- "Did the provider give a reason?" [Yes — reason: ___] [No, they just left]
- "Did you pay any amount before they left?" [Yes — PKR ___] [No]

**Step 3 — Summary confirmation**
Consumer agent summarises the dispute. Consumer confirms before submission.

**Step 4 — Dispute logged**
- Dispute record created in Supabase: status = `under_review`
- Booking status updated to `disputed`
- Consumer agent message: "Your dispute has been logged. We are reviewing the details. You will be notified of the outcome within 24 hours."
- FCM push notification sent to provider: dispute has been filed against them

---

## 5. Provider Dispute Initiation Flow

**Entry point:** "Report Issue" link on Job Detail Screen (P-04), active only after job status = Completed.

**Step 1 — Dispute type selection**
Provider agent presents a structured UI prompt:
- "The consumer was not present" → DIS-03
- "The consumer refused to pay" → DIS-04

**Step 2 — Agent collects structured details**

For **DIS-03 (Consumer No-Show):**
- "What time did you arrive at the location?"
- "How long did you wait before leaving?" [< 15 min / 15–30 min / 30+ min]
- "Did you attempt to contact the consumer?" [Yes, called / Yes, messaged / No]

For **DIS-04 (Consumer Refused to Pay):**
- "What amount was the consumer supposed to pay?" (pre-filled with price estimate)
- "Did the consumer give a reason for refusing?" [Yes: ___] [No reason given]
- "Was any partial amount paid?" [Yes — PKR ___] [No]

**Step 3 — Confirmation + log**
Provider agent confirms details, logs dispute, updates booking status, sends FCM notification to consumer.

---

## 6. Dispute Review Simulation

After a dispute is filed, a background review runs. For demo purposes this resolves within a simulated 24-hour window (can be accelerated for demo purposes via a manual trigger or reduced CRON interval).

### 6.1 Agent Review Inputs

| Data point | Source |
|---|---|
| Dispute type and structured description | Dispute record |
| Provider's reliability (on-time) score | provider_profiles |
| Provider's historical dispute count and verdicts | disputes table |
| Provider's cancellation rate | provider_profiles |
| Consumer's historical dispute count | consumer_profiles |
| Consumer's consumer_rating_avg | consumer_profiles |
| Consumer's dispute flag | consumer_profiles |
| Job complexity tier | bookings |
| Time between job completion and dispute filing | timestamps |
| Non-response history (provider) | provider_nonresponses |

### 6.2 Decision Matrix

| Scenario | Likely Verdict |
|---|---|
| DIS-01: Provider has high quality rating, no past disputes; consumer filed 30+ hours after completion | VRD-01 (Dismissed) |
| DIS-01: Provider has 2+ past quality complaints and low work quality sub-rating | VRD-02 (Warning) |
| DIS-01: Provider has 3+ confirmed disputes in 30 days | VRD-03 (Suspended) |
| DIS-02: Provider has high cancellation rate; dispute filed within 2 hours of job time | VRD-02 (Warning) |
| DIS-02: Provider has clean record with no history of abandonment | VRD-01 (Dismissed) |
| DIS-03: Provider has clean on-time record; consumer has 1+ prior no-show flag | VRD-01 (Dismissed) + VRD-05 (Consumer Flagged) |
| DIS-04: Consumer has prior refusal dispute flag | VRD-05 (Consumer Flagged) |
| DIS-04: Consumer has clean record | VRD-04 (Marked Disputed — neutral) |

### 6.3 Possible Verdicts

| Verdict | Code | Impact |
|---|---|---|
| Dispute Dismissed — Provider Cleared | VRD-01 | No score change for provider. Consumer's dispute_count incremented. Booking shows "Dispute Dismissed". |
| Warning Issued to Provider | VRD-02 | Provider DisputeScore penalised (−0.3). Booking marked as Disputed in provider's history. Provider notified. |
| Provider Temporarily Suspended | VRD-03 | Provider account_status = `suspended` for 7 days. Filtered out of all searches. Provider notified with reason and reactivation date. |
| Booking Marked Disputed (Neutral) | VRD-04 | No score change for either party. Booking logged as disputed. Used for ambiguous cases. |
| Consumer Flagged | VRD-05 | consumer_profiles.dispute_flag = true. Visible to future providers on their job request card as ⚠ warning. Consumer notified. |

---

## 7. Dispute Status Flow

```
Dispute Filed
     ↓
status: under_review
     ↓
Agent review simulation (24-hour window / accelerated for demo)
     ↓
Verdict issued
     ↓
status: resolved
     ├─ VRD-01: Dismissed — Provider Cleared
     ├─ VRD-02: Warning to Provider
     ├─ VRD-03: Provider Suspended (7 days)
     ├─ VRD-04: Booking Marked Disputed (Neutral)
     └─ VRD-05: Consumer Flagged
```

---

## 8. Score Impact Timing

- Provider's DisputeScore and account_status are updated **only after the verdict is issued** — not while the dispute is under review
- During the review period, the provider's ranking score remains unchanged
- Consumer-visible dispute history (count only) updates immediately on filing, but is clearly labelled "Under Review" until verdict

---

## 9. What Each Party Sees

### Consumer's View of Provider
On provider profile screen (C-07):
- "X past disputes (Y resolved / dismissed, Z warnings)"
- No open/in-progress dispute shown (only after verdict)
- No dispute description details shown

### Provider's View of Consumer
On job request card (P-03):
- Consumer's average consumer rating (numeric)
- ⚠ "This consumer has a dispute flag on their profile" (if VRD-05 has ever been issued)
- No dispute description details shown

---

## 10. No Refund Policy

There is no in-app refund or compensation mechanism. Payment is cash on delivery (physical). The dispute system's purpose is purely reputational: protecting future consumers and providers through score adjustments, warnings, and suspensions.

---

## 11. Dispute Thinking Steps (When Toggle is On)

When the "Show Haazir's Thinking" toggle is active during dispute initiation or status review, the agent exposes:
- What data was reviewed (provider's history, rating sub-scores, timing of dispute, consumer's record)
- Which decision matrix criteria applied
- Why the specific verdict was selected
- Confidence level: e.g., "High confidence — provider has 3 prior confirmed disputes in 30 days"
- Score impact calculation for the affected party

---

## 12. Post-Verdict Notifications

**To consumer:**

| Verdict | Notification text |
|---|---|
| VRD-01 | "After review, your dispute for [Service] on [Date] was dismissed. The provider's record was found to be in good standing." |
| VRD-02 | "Your dispute was reviewed. The provider has received a formal warning and their record has been updated." |
| VRD-03 | "Your dispute was reviewed. The provider has been temporarily suspended from the platform." |
| VRD-05 | "After review of the dispute raised against you, a note has been added to your profile." |

**To provider:**

| Verdict | Notification text |
|---|---|
| VRD-01 | "The dispute raised against you for [Service] on [Date] has been dismissed. No action has been taken." |
| VRD-02 | "A formal warning has been issued for the dispute on [Date]. Your reliability score has been updated." |
| VRD-03 | "Your account has been temporarily suspended for 7 days due to repeated disputes. You will be reactivated on [Date]." |
| VRD-05 | "Your dispute against the consumer has been reviewed and noted. A flag has been added to their profile." |

---

*Next: File 07 — Notifications & Infrastructure*
