# Implementation Plan — Stress-Testing Edge-Case Scenarios

This plan details the design and implementation of automated tests to stress-test the **HunarMand** system (AI Agent and database layer) under four recommended edge-case scenarios.

---

## User Review Required

> [!IMPORTANT]
> **Test Execution against Sandbox**: The stress tests will make real API calls to the local Flask backend (running on `http://127.0.0.1:5000`) and the Supabase development database. We will use a dedicated test user ID (`test_stress_user`) for all agent conversation history to avoid polluting real user histories.
>
> **Dispute & Booking Creation**: The dispute test scenario requires a real or simulated completed booking to dispute. The test script will dynamically create a mock booking, transition it to "completed", and then execute the dispute filing test.

---

## Proposed Changes

We will create a new automated Python script [test_stress_scenarios.py](file:///d:/oddconnector/hidmetgo/hidmetgo-backend/test_stress_scenarios.py) inside the `hidmetgo-backend` directory to run all four stress tests in sequence and verify system behaviors.

### [Component] Backend Testing Suite

#### [NEW] [test_stress_scenarios.py](file:///d:/oddconnector/hidmetgo/hidmetgo-backend/test_stress_scenarios.py)
This script will implement four automated test blocks:

1. **Scenario 1: No suitable provider available**
   * **Goal**: Search for a service (e.g. `sofa cleaning`) in a sector where no active provider exists (e.g., `F-6`).
   * **Verification**: Verify that `search_providers` returns an empty `registered_providers` list, and that the AI Agent correctly falls back to listing Google Maps recommendation seeds in the final response.

2. **Scenario 2: Provider cancels and system reschedules**
   * **Goal**: Select a booking, mark it cancelled, and ask the agent to find another provider.
   * **Verification**: Verify that the agent handles the cancellation, triggers the `search_providers` tool again, and proposes new alternative providers to the customer.

3. **Scenario 3: Misspelled, mixed-language, or ambiguous input**
   * **Goal**: Send a heavily misspelled, mixed-language Roman Urdu query (e.g., `"mjhy elecrician chahye G13 m leak switch thk krwane k lye"`).
   * **Verification**: Verify that the AI agent successfully extracts the service (`electrician`) and location (`G-13`), triggers `search_providers`, and returns active electricians.

4. **Scenario 4: Customer disputes completed service**
   * **Goal**: Simulates a customer disputing pricing/quality of a finished booking. The matched provider has a high rating but negative metrics (represented in DB via high cancellation or dispute score).
   * **Verification**: Verify that the AI Agent calls the `file_dispute` tool, which transitions the booking status to `disputed` and logs a dispute record in the database with appropriate type mapping (`DIS-01` for price, `DIS-02` for quality).

---

## Verification Plan

### Automated Tests
- Run the newly created script from the virtual environment:
  `venv\Scripts\python test_stress_scenarios.py`
- Review console output logs and assertion checks verifying that the response codes are `200` and the expected response messages are produced.

### Manual Verification
- View the Supabase database tables (`bookings`, `disputes`) using check scripts or SQL to verify that states (`disputed`, `cancelled`) are updated correctly.
