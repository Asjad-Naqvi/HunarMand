import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Colors, Radius } from "../../constants/theme";

type Variant = "primary" | "secondary" | "danger";

interface HzButtonProps {
  variant?: Variant;
  fullWidth?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  loading?: boolean;
}

const VARIANT_STYLES: Record<Variant, { bg: string; textColor: string; borderWidth: number; borderColor: string }> = {
  primary: { bg: Colors.accent, textColor: Colors.white, borderWidth: 0, borderColor: "transparent" },
  secondary: { bg: Colors.white, textColor: Colors.primary, borderWidth: 1, borderColor: Colors.border },
  danger: { bg: Colors.danger, textColor: Colors.white, borderWidth: 0, borderColor: "transparent" },
};

export const HzButton: React.FC<HzButtonProps> = ({
  variant = "primary",
  fullWidth = false,
  children,
  onPress,
  disabled,
  style,
  loading,
}) => {
  const v = VARIANT_STYLES[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        {
          height: 56,
          borderRadius: Radius.md,
          backgroundColor: v.bg,
          borderWidth: v.borderWidth,
          borderColor: v.borderColor,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? "stretch" : "auto",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            lineHeight: 24,
            color: v.textColor,
          }}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};
