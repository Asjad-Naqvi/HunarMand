import { useEffect } from "react";
import { useRouter } from "expo-router";
import { HzSplashScreen } from "../components/haazir/auth/HzSplashScreen";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to role select after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/role-select");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return <HzSplashScreen />;
}
