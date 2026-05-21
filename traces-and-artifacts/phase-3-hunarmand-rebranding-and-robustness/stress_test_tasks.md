# Stress-Test Scenarios Checklist

- `[x]` 1. Write the test runner script `test_stress_scenarios.py`
  - `[x]` Implement Scenario 1: No suitable provider available (verification of Google Maps fallback)
  - `[x]` Implement Scenario 2: Reschedule after provider cancellation (booking cancellation + new search)
  - `[x]` Implement Scenario 3: Misspelled/mixed-language input parser (Roman Urdu intent matching)
  - `[x]` Implement Scenario 4: Dispute filing (verifies price/quality disputes and transitions status)
- `[x]` 2. Run the stress-test suite and log outputs
- `[x]` 3. Verify state updates in Supabase database tables (bookings/disputes)
- `[x]` 4. Update the walkthrough documentation and finalize

# Post-Pull Regression Fixes
- `[x]` 5. Fix `bookings_consumer_id_fkey` foreign key constraint error in React Native booking flow (restored Auth ID mapping phone-fallback in `AuthContext.tsx`)
