import React from "react";
import { TouchableOpacity, Text, ViewStyle } from "react-native";
import { Colors, Radius } from "../../constants/theme";

interface HzChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const HzChip: React.FC<HzChipProps> = ({ label, selected = false, onPress, style }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      {
        height: 32,
        paddingHorizontal: 12,
        borderRadius: Radius.full,
        borderWidth: selected ? 0 : 1,
        borderColor: Colors.border,
        backgroundColor: selected ? Colors.accent : Colors.white,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      },
      style,
    ]}
  >
    <Text
      style={{
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
        color: selected ? Colors.white : Colors.primary,
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
