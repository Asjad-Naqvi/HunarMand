import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="role-select" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="profile-setup-step2" />
      <Stack.Screen name="profile-setup-step3" />
    </Stack>
  );
}
