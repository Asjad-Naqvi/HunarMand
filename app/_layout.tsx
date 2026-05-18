import "../global.css";
import { useEffect } from "react";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../lib/AuthContext";

SplashScreen.preventAutoHideAsync();

// ─── Route Guard ─────────────────────────────────────────────────────────────
// Redirects unauthenticated users to /role-select and
// authenticated users away from auth screens to their home

function RouteGuard() {
  const { session, user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inRoot = segments[0] === undefined || segments[0] === "index";
    // Don't redirect away if the provider is actively on the onboarding screen
    const inOnboarding = segments[1] === "onboarding";

    if (!session) {
      // Not logged in — send to role selection
      if (!inAuthGroup) {
        router.replace("/(auth)/role-select");
      }
    } else if (session && user) {
      // Logged in — send to correct home if still in auth/root screens
      if (inAuthGroup || inRoot) {
        if (user.role === "provider") {
          // New provider who hasn't completed profile setup → onboarding chat
          if (!user.isOnboarded) {
            router.replace("/(provider)/onboarding");
          } else {
            router.replace("/(provider)/dashboard");
          }
        } else {
          router.replace("/(consumer)/home");
        }
      } else if (user.role === "provider" && !user.isOnboarded && !inOnboarding) {
        // Provider is logged in but hasn't onboarded and is trying to access other screens
        router.replace("/(provider)/onboarding");
      }
    }
  }, [session, user, loading, segments]);

  return null;
}

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RouteGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(consumer)" />
          <Stack.Screen name="(provider)" />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
