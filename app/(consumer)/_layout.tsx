import { Stack } from "expo-router";

export default function ConsumerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="search-results" />
      <Stack.Screen name="provider-profile" />
      <Stack.Screen name="booking-confirmation" />
      <Stack.Screen name="awaiting" />
      <Stack.Screen name="booking-confirmed" />
      <Stack.Screen name="active-job" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="dispute-chat" />
      <Stack.Screen name="dispute-status" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="favourites" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="time-preference" />
      <Stack.Screen name="my-disputes" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
