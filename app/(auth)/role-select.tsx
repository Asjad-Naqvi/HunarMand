import { useRouter } from "expo-router";
import { HzRoleSelectionScreen } from "../../components/haazir/auth/HzRoleSelectionScreen";

export default function RoleSelectRoute() {
  const router = useRouter();

  const handleSelect = (role: "consumer" | "provider") => {
    // In a real app, you might save this to state.
    // We navigate to the login screen for the respective role
    router.push(`/login?role=${role}`);
  };

  return <HzRoleSelectionScreen onSelect={handleSelect} />;
}
