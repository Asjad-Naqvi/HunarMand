# OddJobs Architecture & Development Log

## Overview
This document serves as a persistent context log of the recent architectural changes and feature developments implemented for the **OddJobs** home services platform. 

The primary goal of this session was to implement a **Dual-Mode AI Agent System** capable of communicating with both Customers (to hire workers) and Providers (to find work).

---

## 1. Backend AI Architecture (`agent.py`)
We successfully designed and implemented a dual-agent architecture in the Python backend:
- **`customer_agent`**: Instructed to extract service type, severity, location, time, and budget. It uses the `search_providers` tool to mock querying a database for workers.
- **`provider_agent`**: Instructed to handle worker dispatch by extracting their specialty, location, and availability. It uses the `check_pending_jobs` tool to mock checking for open customer requests.

### Migration to Groq
Midway through development, we migrated the AI provider from Google Gemini to the **Groq API**:
- **SDK Update**: Installed the official `groq` Python SDK.
- **State Management**: Implemented manual chat history management (`self.chat_history`), as Groq is stateless compared to Gemini.
- **Tool Calling**: Converted our Python function tools into strict OpenAI-compatible JSON Schemas to support Groq's function calling format.
- **Model Upgrade**: Initially used `llama3-70b-8192`, but updated to the newest **`llama-3.3-70b-versatile`** after discovering the older model was decommissioned.

---

## 2. API Routing & Environment (`app.py` & `.env`)
- **Dynamic Routing**: Updated the Flask `/api/agent/process` endpoint to accept a `mode` parameter (`"customer"` or `"provider"`). The route dynamically directs the user's message to the correct agent instance.
- **Environment Gotchas**: Encountered a Python import order issue where `Groq()` was initializing before `.env` was loaded. Fixed this by moving `load_dotenv()` to the absolute top of `app.py`.
- **.env Placement**: Moved the `.env` file from `app/hidmetgo_agent/` to the root of `hidmetgo-backend/` so Flask could detect it properly.

---

## 3. Frontend Implementation (React Native / Expo)
Built the UI for users to actually interact with these agents on the mobile app.

- **`modes.tsx`**: Updated the mode selection screen to route to the new chat interfaces instead of static list screens.
- **`chat-customer.tsx`**: Created a dynamic chat interface (green-themed) for customers. It fetches from the backend endpoint passing `mode: 'customer'`.
- **`chat-provider.tsx`**: Created a dispatch chat interface (blue-themed) for workers. It fetches from the backend endpoint passing `mode: 'provider'`.
- **Expo Fixes**: Installed `@types/react-native` and Typescript dependencies (using `--legacy-peer-deps`) so Expo could correctly bundle the new `.tsx` files. Switched to using the modern `npx expo start --clear` command.

---

## 4. Next Steps & Pending Tasks
1. **Connect Supabase**: Replace the mock `search_providers` and `check_pending_jobs` tool functions in `agent.py` with actual Python Supabase queries.
2. **Frontend Authentication**: Finalize `supabase.js` on the React Native side to pass real `user_id` tokens to the Flask backend instead of 'anonymous'.
