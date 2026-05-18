import React from "react";
import { Text, TextStyle } from "react-native";
import { Colors } from "../../constants/theme";

interface TextProps {
  children: React.ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}

export const HzHeading: React.FC<TextProps> = ({ children, style, numberOfLines }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      {
        fontSize: 22,
        fontWeight: "600",
        lineHeight: 28,
        color: Colors.primary,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

export const HzBody: React.FC<TextProps> = ({ children, style, numberOfLines }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      {
        fontSize: 15,
        fontWeight: "400",
        lineHeight: 22,
        color: Colors.primary,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

export const HzLabel: React.FC<TextProps> = ({ children, style, numberOfLines }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      {
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
        color: Colors.primary,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

export const HzCaption: React.FC<TextProps> = ({ children, style, numberOfLines }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      {
        fontSize: 11,
        fontWeight: "400",
        lineHeight: 15,
        color: Colors.muted,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

export const HzPrice: React.FC<TextProps> = ({ children, style }) => (
  <Text
    style={[
      {
        fontSize: 18,
        fontWeight: "600",
        lineHeight: 24,
        color: Colors.primary,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

export const HzThinking: React.FC<TextProps> = ({ children, style }) => (
  <Text
    style={[
      {
        fontSize: 12,
        fontWeight: "400",
        fontStyle: "italic",
        lineHeight: 18,
        color: "#555555",
      },
      style,
    ]}
  >
    {children}
  </Text>
);
