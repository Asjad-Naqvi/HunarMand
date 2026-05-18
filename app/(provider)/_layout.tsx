import { Stack } from "expo-router";

export default function ProviderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="inbox" />
      <Stack.Screen name="past-jobs" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="active-job" />
      <Stack.Screen name="job-request" />
      <Stack.Screen name="dispute-chat" />
      <Stack.Screen name="dispute-status" />
      <Stack.Screen name="rate-consumer" />
    </Stack>
  );
}
