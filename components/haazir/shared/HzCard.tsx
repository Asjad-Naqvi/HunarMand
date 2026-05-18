import React from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { Colors, Radius, Shadows } from "../../constants/theme";

interface HzCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
}

export const HzCard: React.FC<HzCardProps> = ({
  children,
  onPress,
  style,
  padding = 16,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding,
    ...Shadows.card,
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
