import React from "react";
import { View, Text, TextInput, ViewStyle } from "react-native";
import { Colors, Radius } from "../../constants/theme";

interface HzInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  disabled?: boolean;
  style?: ViewStyle;
  multiline?: boolean;
}

export const HzInput: React.FC<HzInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  leadingIcon,
  trailingIcon,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  disabled,
  style,
  multiline,
}) => (
  <View style={[{ gap: 6 }, style]}>
    {label && (
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          lineHeight: 18,
          color: Colors.primary,
        }}
      >
        {label}
      </Text>
    )}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: multiline ? undefined : 56,
        minHeight: multiline ? 56 : undefined,
        borderRadius: Radius.md,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 16,
        gap: 10,
      }}
    >
      {leadingIcon && (
        <View style={{ flexShrink: 0 }}>{leadingIcon}</View>
      )}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
        multiline={multiline}
        placeholderTextColor={Colors.muted}
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "400",
          color: Colors.primary,
          paddingVertical: multiline ? 12 : 0,
        }}
      />
      {trailingIcon && (
        <View style={{ flexShrink: 0 }}>{trailingIcon}</View>
      )}
    </View>
  </View>
);
