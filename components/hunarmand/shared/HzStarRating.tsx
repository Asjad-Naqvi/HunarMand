import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";

interface HzStarRatingProps {
  rating: number;
  reviewCount?: number;
}

export const HzStarRating: React.FC<HzStarRatingProps> = ({ rating, reviewCount }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
    <Ionicons name="star" size={12} color={Colors.accent} />
    <Text
      style={{
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
        color: Colors.primary,
      }}
    >
      {rating.toFixed(1)}
    </Text>
    {reviewCount !== undefined && (
      <Text
        style={{
          fontSize: 11,
          fontWeight: "400",
          lineHeight: 15,
          color: Colors.muted,
        }}
      >
        ({reviewCount})
      </Text>
    )}
  </View>
);
