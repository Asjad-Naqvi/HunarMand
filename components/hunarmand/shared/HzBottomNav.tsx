import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type HzNavTabId = "chat" | "bookings" | "favourites" | "profile";
export type HzProviderNavTabId = "dashboard" | "inbox" | "past-jobs" | "profile";

interface ConsumerTab { id: HzNavTabId; icon: keyof typeof Ionicons.glyphMap; label: string; route: string; }
interface ProviderTab  { id: HzProviderNavTabId; icon: keyof typeof Ionicons.glyphMap; label: string; route: string; }

const CONSUMER_TABS: ConsumerTab[] = [
  { id: "chat",       icon: "chatbubble",    label: "Chat",       route: "/chat"       },
  { id: "bookings",   icon: "time",          label: "Bookings",   route: "/bookings"   },
  { id: "favourites", icon: "heart",         label: "Favourites", route: "/favourites" },
  { id: "profile",    icon: "person",        label: "Profile",    route: "/(consumer)/profile" },
];

const PROVIDER_TABS: ProviderTab[] = [
  { id: "dashboard",  icon: "home",          label: "Dashboard",  route: "/dashboard"  },
  { id: "inbox",      icon: "notifications", label: "Inbox",      route: "/inbox"      },
  { id: "past-jobs",  icon: "time",          label: "Past Jobs",  route: "/past-jobs"  },
  { id: "profile",    icon: "person",        label: "Profile",    route: "/(provider)/profile" },
];

interface HzBottomNavProps {
  role?: "consumer" | "provider";
  activeTab: string;
}

export const HzBottomNav: React.FC<HzBottomNavProps> = ({ role = "consumer", activeTab }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabs = role === "provider" ? PROVIDER_TABS : CONSUMER_TABS;

  return (
    <View
      style={{
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
        flexDirection: "row",
        paddingBottom: insets.bottom,
      }}
    >
      {tabs.map(({ id, icon, label, route }) => {
        const isActive = id === activeTab;
        const color = isActive ? Colors.accent : Colors.muted;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => router.push(route as any)}
            activeOpacity={0.75}
            style={{
              flex: 1,
              height: 64,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Ionicons name={isActive ? icon : (icon + "-outline") as any} size={24} color={color} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: isActive ? "500" : "400",
                lineHeight: 15,
                color,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
