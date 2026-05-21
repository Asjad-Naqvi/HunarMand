import React from "react";
import { View, Text } from "react-native";
import { Colors, Radius } from "../../constants/theme";

type BadgeVariant = "success" | "warning" | "danger" | "neutral";

interface HzBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  success: { bg: "rgba(76, 175, 132, 0.12)", color: Colors.success },
  warning: { bg: "rgba(232, 135, 42, 0.12)", color: Colors.warning },
  danger:  { bg: "rgba(217, 79, 79, 0.12)",  color: Colors.danger },
  neutral: { bg: Colors.thinking,             color: "#555555" },
};

export const HzBadge: React.FC<HzBadgeProps> = ({ label, variant = "neutral" }) => {
  const s = STYLES[variant];
  return (
    <View
      style={{
        height: 24,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: s.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          lineHeight: 15,
          color: s.color,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
