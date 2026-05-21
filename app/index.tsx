import { useEffect } from "react";
import { useRouter } from "expo-router";
import { HzSplashScreen } from "../components/hunarmand/auth/HzSplashScreen";
import { useAuth } from "../lib/AuthContext";

export default function Index() {
  const router = useRouter();
  const { session, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Timeout of 4000ms to perfectly match the 4 second animation duration
    const timer = setTimeout(() => {
      if (!session) {
        router.replace("/(auth)/role-select");
      } else if (user) {
        if (user.role === "provider") {
          router.replace(user.isOnboarded ? "/(provider)/dashboard" : "/(provider)/onboarding");
        } else {
          router.replace("/(consumer)/home");
        }
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [loading, session, user, router]);

  return <HzSplashScreen />;
}
