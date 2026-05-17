# Haazir — Product Specification
## File 01: Product Overview & Vision

---

## 1. What Is Haazir?

Haazir is an AI-powered, mobile-first service marketplace for Islamabad's informal service economy. It connects consumers who need home and cleaning services with registered local providers and Google Maps–discovered providers through two conversational AI agents. The agents control the entire service lifecycle — from understanding a natural-language request to matching, booking, tracking, feedback, and dispute handling.

The word "Haazir" (حاضر) means "present" or "ready" in Urdu — reflecting the app's promise: the right service provider, ready when you need them.

---

## 2. Context & Problem

Service discovery in Islamabad's informal economy (plumbers, AC technicians, electricians, cleaners, etc.) relies entirely on WhatsApp groups, phone calls, and word-of-mouth referrals. This causes:

- Missed service opportunities due to poor discoverability
- Unpredictable and opaque pricing
- No accountability for quality or punctuality
- No structured feedback or reputation system
- No formal scheduling or confirmation
- Zero recourse when things go wrong

Haazir replaces this fragmented, trust-deficit system with an agentic AI layer that observes, reasons, decides, acts, evaluates, and adapts at every step.

---

## 3. Target Geography & Demographic

| Dimension | Detail |
|---|---|
| City | Islamabad (with sector-level granularity) |
| Consumer profile | Urdu/English speaking urban households, comfortable with smartphones |
| Provider profile | Local informal-economy service workers in Islamabad sectors |
| Language handling | Urdu, Roman Urdu, English, code-mixed (any combination) |
| Platform | Android only (Expo / React Native) |

---

## 4. Roles

### 4.1 Consumer
A person who needs a home or cleaning service. Interacts with the **Consumer-side Haazir agent** to describe their need, review matched providers, confirm a booking, track job status, and leave feedback.

### 4.2 Provider
A local service professional who registers on the app by chatting with the **Provider-side Haazir agent**. Once registered, they receive push notifications for job requests, manage their availability, view their dashboard, and interact with the provider agent for profile updates and AI advisory nudges.

---

## 5. The Two Agents

Haazir runs two distinct AI agents sharing the same name and persona but serving different roles and surfaces:

| Agent | Surface | Responsibilities |
|---|---|---|
| **Haazir (Consumer Agent)** | Consumer chat screen | Service request understanding, job classification, provider discovery and ranking, dynamic pricing, loyalty discount application, booking, reminders, feedback collection, dispute initiation, retry logic |
| **Haazir (Provider Agent)** | Provider onboarding chat, profile update chat, dashboard advisor feed | Provider registration, profile and skill updates, AI advisor card generation, provider-side dispute initiation |

Both agents:
- Mirror the user's language (Urdu, Roman Urdu, English, or code-mixed)
- Expose a "Show Haazir's Thinking" toggle for deep reasoning visibility
- Are powered by Gemini via Google Vertex AI

---

## 6. Service Catalogue

### Category A — Home Services
| Service | Code |
|---|---|
| AC Installation | HS-01 |
| AC Dismounting | HS-02 |
| AC General Service | HS-03 |
| AC Repairing | HS-04 |
| Carpenter Work | HS-05 |
| Electrician | HS-06 |
| Gas Geyser Installation | HS-07 |
| Gas Geyser Dismounting | HS-08 |
| Gas Geyser Repairing | HS-09 |
| Electric Geyser Installation | HS-10 |
| Electric Geyser Dismounting | HS-11 |
| Electric Geyser Repairing | HS-12 |
| Painter | HS-13 |
| Plumber | HS-14 |
| Water Tank Installation | HS-15 |

### Category B — Cleaning Services
| Service | Code |
|---|---|
| Solar Panel Cleaning | CS-01 |
| Sofa Cleaning | CS-02 |
| Plastic Water Tank Cleaning | CS-03 |
| Cement Water Tank Cleaning | CS-04 |
| Carpet Cleaning | CS-05 |
| Bed/Mattress Cleaning | CS-06 |
| Curtain Cleaning | CS-07 |

The consumer agent maps any natural-language input (including Urdu, Roman Urdu, slang, and misspellings) to one or more of the above service codes before initiating a provider search.

---

## 7. Core Principles

1. **Agent-first:** Every intelligent action is driven by a Haazir AI agent. No static rules, no hardcoded workflows.
2. **Two specialised agents:** Consumer and provider experiences are handled by purpose-built agents optimised for their respective contexts.
3. **Transparency:** Each agent's reasoning steps are always available behind a toggle — deep, not superficial.
4. **Fairness:** Dynamic pricing is transparent with full breakdowns shown to both parties. Loyalty discounts are Haazir-subsidised so providers always earn their full rate.
5. **Trust signals over proximity:** Provider ranking uses eight weighted factors. Nearest is not always best.
6. **Sequential, chosen-provider booking:** Only the consumer-selected provider receives a job notification. Requests are never broadcast to multiple providers simultaneously.
7. **Graceful degradation:** Every failure mode — no provider, API error, language ambiguity, repeated declines, non-response — has a defined agent-handled fallback.
8. **Simulation-first for hackathon:** Real infrastructure (Supabase, FCM) is used where free. Mock data replaces unavailable real data and is clearly labelled.

---

## 8. Technology Stack

| Layer | Technology |
|---|---|
| Mobile framework | Expo (React Native) |
| UI design source | Figma Make AI |
| Backend / database | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Push notifications | Firebase Cloud Messaging (FCM) via Expo Notifications + Supabase Edge Functions |
| AI agents (×2) | Google Cloud AI (Gemini via Vertex AI — free credits) |
| Maps & geocoding | Google Maps / Places API (free tier / credits) |
| Authentication | Phone number + password / Email + password (Supabase Auth) |
| Mock data | Clearly labelled synthetic datasets for providers and bookings |

---

## 9. Authentication Model

| Action | Method |
|---|---|
| Registration | Phone number (mandatory) + password (mandatory) + email (optional) |
| Login | Phone number + password |
| Applies to | Both consumer and provider roles |
| OTP verification | None — phone number is a contact field only |
| Third-party OAuth | None |

---

## 10. What Haazir Is Not

- It is **not** a simple listing app or directory.
- It is **not** a static rule-based chatbot.
- It is **not** a summarizer or FAQ bot.
- Each agent must demonstrably **observe** (parse input), **reason** (rank, classify, price), **decide** (recommend, book, escalate), **act** (notify, schedule, confirm), **evaluate** (feedback, scoring), and **adapt** (re-rank, reroute, penalise).

---

*Next: File 02 — AI Agent Specification*
