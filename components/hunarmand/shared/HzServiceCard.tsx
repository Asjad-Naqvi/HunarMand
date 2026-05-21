import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HzCard } from "./HzCard";
import { HzStarRating } from "./HzStarRating";
import { HzBadge } from "./HzBadge";
import { Colors, Radius } from "../../constants/theme";

type AvailabilityStatus = "available" | "busy" | "scheduled";

interface HzServiceCardProps {
  name: string;
  serviceType: string;
  rating: number;
  reviewCount: number;
  location: string;
  price: string;
  availability: AvailabilityStatus;
  initials: string;
  onBook?: () => void;
}

const AVAIL_CONFIG: Record<AvailabilityStatus, { label: string; variant: "success" | "danger" | "warning" }> = {
  available: { label: "Available Today", variant: "success" },
  busy:      { label: "Busy",            variant: "danger"  },
  scheduled: { label: "By Appointment", variant: "warning" },
};

export const HzServiceCard: React.FC<HzServiceCardProps> = ({
  name,
  serviceType,
  rating,
  reviewCount,
  location,
  price,
  availability,
  initials,
  onBook,
}) => {
  const avail = AVAIL_CONFIG[availability];

  return (
    <HzCard>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* Avatar */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: Radius.md,
            backgroundColor: Colors.thinking,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.primary }}>
            {initials}
          </Text>
        </View>

        {/* Details */}
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          {/* Name + availability */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", lineHeight: 22, color: Colors.primary }}>
              {name}
            </Text>
            <HzBadge label={avail.label} variant={avail.variant} />
          </View>

          {/* Service type */}
          <Text style={{ fontSize: 13, fontWeight: "400", lineHeight: 18, color: Colors.muted }}>
            {serviceType}
          </Text>

          {/* Rating + location */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
            <HzStarRating rating={rating} reviewCount={reviewCount} />
            <Text style={{ color: Colors.border, fontSize: 12 }}>•</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Ionicons name="location" size={11} color={Colors.muted} />
              <Text style={{ fontSize: 11, fontWeight: "400", lineHeight: 15, color: Colors.muted }}>
                {location}
              </Text>
            </View>
          </View>

          {/* Price + book */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", lineHeight: 24, color: Colors.primary }}>
              {price}
            </Text>
            <TouchableOpacity
              onPress={onBook}
              activeOpacity={0.75}
              style={{
                height: 36,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: Colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.white }}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </HzCard>
  );
};
