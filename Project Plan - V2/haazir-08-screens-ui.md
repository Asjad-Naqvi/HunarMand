# Haazir — Product Specification
## File 08: Screen List & UI/UX Direction

---

## 1. Complete Screen Inventory

### Shared Screens
| ID | Screen Name | Description |
|---|---|---|
| S-01 | Splash Screen | App logo, wordmark, tagline. Auto-advances after 2s. |
| S-02 | Registration Screen | Phone (mandatory), password (mandatory), email (optional), name. |
| S-03 | Login Screen | Phone number + password. Link to registration. |
| S-04 | Role Selection | "I need a service" vs "I offer services" — two-option full-screen card layout. Shown only on first login after registration. |

### Consumer Screens
| ID | Screen Name | Description |
|---|---|---|
| C-01 | Consumer Profile Setup | First-time only: confirm name, add first address (label + pin), set preferred time of day. 3-step flow. |
| C-02 | Consumer Home — Chat | Primary screen. Full AI chat with Haazir Consumer Agent. Thinking toggle. Active booking banner. |
| C-03 | Provider Results | Two-tab layout: Haazir Providers / Google Maps Providers. Card lists with load more. |
| C-04 | Provider Profile | Full provider detail: ratings breakdown, services, sectors, schedule, reviews, dispute count. |
| C-05 | Booking Confirmation | Job summary + full price breakdown (with loyalty discount line) + Confirm button. |
| C-06 | Awaiting Acceptance | 15-minute countdown timer. Animated waiting state. Cancel option. Auto-expires and re-routes. |
| C-07 | Booking Confirmed | Success screen. Full booking summary including loyalty discount. Link to Active Job. |
| C-08 | Active Job | Status progress banner. Provider contact info. Report Issue link (post-completion only). |
| C-09 | Feedback / Rating | Four-dimension 1–10 rating. Optional written review. |
| C-10 | Re-initiate Search | Read-only job summary + decline/timeout counter + "Find Another Provider" button. Inline in chat. |
| C-11 | Past Bookings | Chronological booking history with status chips. Each entry tappable for full detail + price breakdown. |
| C-12 | Favourites | Saved Haazir providers list. Remove option. "Book Again" shortcut. |
| C-13 | Consumer Profile & Settings | Name, phone, email, loyalty tier badge + completed bookings count, saved addresses, preferred time, sign out. |
| C-14 | Dispute Initiation Chat | Consumer agent guides dispute filing. Structured prompts per dispute type. |
| C-15 | Dispute Status | Dispute type, date filed, status chip (Under Review / Resolved), verdict summary. |

### Provider Screens
| ID | Screen Name | Description |
|---|---|---|
| P-01 | Provider Onboarding Chat | Full registration flow via Provider Agent. 10 steps: name → phone → services → sectors → rates → schedule → pin → summary → confirm → done. |
| P-02 | Provider Dashboard | Availability toggle + stats row + AI Advisor cards + notification preview + upcoming jobs + quick links. |
| P-03 | Notification Inbox | Job request cards (Accept/Decline with 15-min countdown) + all other notifications. |
| P-04 | Job Request Card Detail | Expanded: service, complexity, sector, date/time, full price breakdown, Haazir subsidy line, consumer rating/flag, Accept/Decline. |
| P-05 | Job Detail — Active/Upcoming | Confirmed job: full address revealed, price breakdown, status update buttons (En Route → Arrived → Completed), Report Issue link. |
| P-06 | Rate Consumer | Four-dimension 1–10 rating. Optional note (visible to future providers). |
| P-07 | Past Jobs | Chronological job history. Status chips. Consumer rating given/received. Per-job earnings (with subsidy note). |
| P-08 | Provider Profile & Settings | View current profile. "Update My Profile / Skills" → reopens provider agent chat. Sign out. |
| P-09 | Provider Dispute Chat | Provider agent guides dispute filing. Structured prompts per dispute type. |
| P-10 | Provider Dispute Status | Dispute type, date, status chip, verdict summary. |

---

**Total screens: 29**
(4 shared + 15 consumer + 10 provider)

---

## 2. Navigation Structure

### Consumer Navigation
```
Bottom Navigation Bar (4 tabs):
├── Chat (C-02) — chat bubble icon
├── Bookings (C-11) — clock/history icon
├── Favourites (C-12) — heart icon
└── Profile (C-13) — person icon

Stack / Modal screens (no bottom nav visible):
├── C-03 Provider Results         ← pushed from chat after agent discovery
├── C-04 Provider Profile         ← pushed from results card tap
├── C-05 Booking Confirmation     ← pushed from provider profile CTA
├── C-06 Awaiting Acceptance      ← pushed from booking confirmation
├── C-07 Booking Confirmed        ← pushed from acceptance
├── C-08 Active Job               ← from chat banner or C-07 button
├── C-09 Feedback                 ← modal, triggered by FCM notification
├── C-10 Re-initiate              ← inline card in chat stream
├── C-14 Dispute Chat             ← pushed from C-08 "Report an Issue"
└── C-15 Dispute Status           ← pushed from C-11 booking detail
```

### Provider Navigation
```
Bottom Navigation Bar (3 tabs):
├── Dashboard (P-02) — home icon
├── Notifications (P-03) — bell icon (badge count for unread)
└── Profile (P-08) — person icon

Stack / Modal screens:
├── P-04 Job Request Card Detail  ← pushed from P-03 notification tap
├── P-05 Job Detail               ← pushed from P-02 upcoming jobs
├── P-06 Rate Consumer            ← modal after marking job Completed
├── P-07 Past Jobs                ← accessible from P-02 quick links or P-08
├── P-09 Provider Dispute Chat    ← pushed from P-05 "Report Issue"
└── P-10 Provider Dispute Status  ← pushed from P-07 job detail
```

---

## 3. UI/UX Design Direction

### 3.1 Visual Language

**Core aesthetic:** Modern/minimal + warm. Clean layouts with intentional whitespace. Trustworthy and local — not corporate, not loud.

**Inspiration:** InDriver's pragmatic utility-first card approach — but distinctly Haazir. No heavy greens, no aggressive chrome, no more than 3 colours visible on any single screen.

---

### 3.2 Colour Palette

| Role | Hex | Usage |
|---|---|---|
| Primary text | `#1A1A1A` | Body text, headings, primary actions |
| Accent / highlight | `#F5A623` | CTAs, active states, badges, agent thinking border, progress active step |
| Background | `#FAF8F5` | All screen backgrounds |
| Surface | `#FFFFFF` | Cards, modals, input fields |
| Muted | `#9B9B9B` | Secondary text, timestamps, caption labels |
| Success | `#4CAF84` | Confirmed state, Haazir Verified badge, availability toggle on-state |
| Warning | `#E8872A` | Dispute flag indicator, surge pricing indicator |
| Danger | `#D94F4F` | Decline button, suspend state, error messages |
| Thinking panel | `#F0EDE8` | Agent thinking blocks background |

**Dark mode swaps:**
| Light | Dark |
|---|---|
| `#FAF8F5` background | `#121212` |
| `#FFFFFF` surface | `#1E1E1E` |
| `#1A1A1A` text | `#EFEFEF` |
| `#9B9B9B` muted | `#7A7A7A` |
| `#F5A623` accent | `#F5A623` (unchanged) |
| `#F0EDE8` thinking | `#2A2A2A` |
| Card border (light: none / shadow) | `#2E2E2E` border |

Dark mode follows system setting automatically.

---

### 3.3 Typography

| Style | Weight | Size | Usage |
|---|---|---|---|
| Heading | Semibold 600 | 20–24sp | Screen titles, section headers |
| Body | Regular 400 | 14–16sp | Chat messages, card text, descriptions |
| Label | Medium 500 | 12–13sp | Chips, badges, tags, status labels |
| Caption | Regular 400 | 11sp | Timestamps, footnotes, mock data disclaimers |
| Thinking | Regular 400, slight italic | 12sp | Agent thinking panel content |
| Price / number | Semibold 600 | 16–20sp | Price totals, ratings, stat tiles |

**Font family:** Inter (legible, warm, well-supported in Expo / React Native)

---

### 3.4 Spacing & Layout

- Base unit: 8dp
- Screen horizontal padding: 16dp
- Card internal padding: 16dp
- Gap between cards in a list: 12dp
- Section header top margin: 24dp
- Bottom navigation bar height: 64dp + system safe area inset

---

### 3.5 Key Component Specifications

**Chat Bubbles (Consumer Chat Screen)**
- Consumer messages: right-aligned, amber `#F5A623` fill, white text, 18dp rounded (top-left corner square)
- Agent messages: left-aligned, white card, 1dp warm grey border, dark text, 18dp rounded (top-right corner square)
- Agent thinking blocks: full-width, `#F0EDE8` / dark `#2A2A2A` background, 3dp amber left border, collapsed by default with expand chevron. Header: "Haazir's Reasoning — [Phase Name]"

**Structured Clarification Cards (in chat)**
- Full-width card, white, 1dp border
- Question text in body weight
- Answer options as full-width stacked pill buttons (outlined by default; amber fill on selection)

**Provider Cards (Results Screen)**
- White card, 12dp rounded corners, subtle elevation shadow
- Left edge accent bar: 4dp — green for Haazir Verified, grey for Google Maps
- Haazir Verified badge: green pill with ✓ icon
- Google Maps badge: grey pill with map pin icon + "From Google Maps" label
- "Agent Recommended" tag: amber pill at top of #1 card only
- Price estimate: prominent, semibold — "Est. PKR X,XXX"
- Availability: shown only when hours match the requested slot

**Booking Confirmation Price Breakdown Card**
- White card, internal divider line above Total Estimate and above Loyalty Discount line
- Each row: label left, amount right
- Total Estimate row: bold, slightly larger font
- Loyalty discount row: amber text, negative amount
- Footer in caption size: payment method + final price disclaimer

**15-Minute Countdown Timer (Awaiting Acceptance / Job Request Card)**
- Circular or pill countdown: "MM:SS remaining"
- Amber colour when > 5 min remaining
- Warning orange when ≤ 5 min remaining
- Greyed out / "Expired" when reaches 00:00

**Active Job Status Banner**
- Full-width strip at top of C-08
- Horizontal progress steps: Confirmed → En Route → Arrived → In Progress → Completed
- Active step: amber filled dot + amber label
- Completed steps: green filled dot
- Pending steps: grey outline dot
- Background tints: white (pending) → amber tint (en route / arrived) → green tint (completed)

**Availability Toggle (Provider Dashboard)**
- Width ~120dp, pill shape, large tap target
- Available: `#4CAF84` green background, white "Available ✓" label
- Unavailable: `#9B9B9B` muted background, white "Unavailable" label
- Real-time Supabase write on toggle

**Loyalty Tier Badge (Consumer Profile)**
- Pill badge next to name or in its own row
- None tier: not shown
- Bronze: `#CD7F32` background, white text — "Bronze · 5% off"
- Silver: `#A8A9AD` background, white text — "Silver · 10% off"
- Gold: `#F5A623` background, dark text — "Gold · 15% off"
- Below the badge: "X bookings completed" in caption size

**AI Advisor Cards (Provider Dashboard)**
- Horizontally scrollable strip
- Each card: ~200dp wide, white, 12dp rounded, shadow
- Card type icon + label at top (💡 Opportunity / 📊 Demand / ⭐ Rating / 📅 Schedule / ⚠ Non-Response)
- Headline: medium 14sp
- Detail: regular 12sp, muted
- Optional deep-link button at bottom (e.g., "Update Schedule")

**Stats Row (Provider Dashboard)**
- Four equal-width tiles in a horizontal row
- Each tile: number in large semibold, label in caption below
- Total Earnings tile: small "simulated" label in caption beneath the amount

---

### 3.6 Figma Make AI — Handoff Notes

1. **Define design system first** — give Figma Make the full colour token set, type scale, and spacing unit as a design system before generating any screens
2. **Generate one screen at a time** — start with C-02 (Chat Screen) as it is the most complex and establishes all shared patterns
3. **Specify all component states** — for every button/card prompt: default, pressed, disabled, loading
4. **Label with screen IDs** — use the IDs (C-02, P-02, etc.) in Figma component names for clean Expo developer handoff
5. **No gradients** — surfaces are flat; depth via shadow and spacing only
6. **Use realistic mock content** — Islamabad sector names, PKR amounts, Urdu/English mixed names, actual service type names in all mockup screens
7. **Two agent chat styles** — Consumer chat (C-02) and Provider onboarding chat (P-01) share the same bubble component but differ in context; generate both

---

### 3.7 Accessibility

- Minimum touch target: 48dp × 48dp on all interactive elements
- All text meets WCAG AA contrast (4.5:1 minimum)
- All interactive elements have visible pressed/focused states
- Bottom nav labels always visible (no icon-only navigation)
- Countdown timers include a text label (not colour alone)
- Loyalty tier badges not communicated by colour alone — always include text label

---

## 4. Onboarding UX Notes

### Consumer First-Time Experience
1. Register → Role Selection → Profile Setup (3 short steps)
2. Land on chat screen
3. Agent sends a welcome message setting the conversational tone:
   > "Assalam o Alaikum! Main Haazir hoon. Aapko kaunsi service chahiye? Bas batayein — Urdu mein, English mein, ya jis tarah chaahein."
4. Consumer types naturally from step one

### Provider First-Time Experience
1. Register → Role Selection → immediately into provider agent onboarding chat
2. Slim step indicator at top of onboarding chat: "Step X of 9"
3. Everything collected conversationally — no standalone form screens
4. Agent welcome after completion:
   > "Mubarak ho! Aapka Haazir provider account ready hai. Ab aap dashboard se apni availability manage kar sakte hain."

---

## 5. Hackathon Demo Path

Recommended sequence for judges:

| Step | Action | What it demonstrates |
|---|---|---|
| 1 | Open app as Consumer (pre-logged-in) | Auth + role routing |
| 2 | Type: *"AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye, budget zyada nahi hai"* | Multilingual understanding, intent extraction |
| 3 | Enable "Show Haazir's Thinking" | Deep reasoning visibility, phase-by-phase agent steps |
| 4 | View Provider Results | Two-tab layout, Haazir Verified vs Google Maps, ranking explanation |
| 5 | Select provider, view price breakdown | Dynamic pricing, loyalty discount line item, full transparency |
| 6 | Confirm booking — switch to Provider view | FCM push notification arriving in real time, 15-min countdown |
| 7 | Provider accepts | Consumer receives CN-01, booking confirmed screen |
| 8 | Provider marks En Route → Completed | Consumer status banner updates, completion notification |
| 9 | Consumer submits 4-dimension rating | Feedback loop, score update |
| 10 | Simulate a dispute | Consumer agent collects structured complaint → "Under Review" → verdict issued |
| 11 | Show Provider Dashboard | AI Advisor cards, stats, Haazir subsidy in earnings, non-response warning card |

This path demonstrates all required agentic properties: **observe → reason → decide → act → evaluate → adapt**.

---

*End of specification.*
*Files: 01 Overview · 02 Agent · 03 Consumer · 04 Provider · 05 Pricing & Matching · 06 Disputes · 07 Infrastructure · 08 Screens & UI*
