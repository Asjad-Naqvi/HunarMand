import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="login"
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="home" />
      <Stack.Screen name="modes" />
      <Stack.Screen name="hire" />
      <Stack.Screen name="find-work" />
    </Stack>
  );
}
