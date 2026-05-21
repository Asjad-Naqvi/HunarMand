import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../constants/theme";

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

const AVAIL_CONFIG: Record<AvailabilityStatus, { label: string; bg: string }> = {
  available: { label: "Available Today", bg: Colors.success },
  busy: { label: "Busy", bg: Colors.danger },
  scheduled: { label: "By Appointment", bg: Colors.warning },
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
    <View style={[styles.card, Shadows.card]}>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsCol}>
          {/* Top Row: Name + Badge */}
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
            <View style={[styles.badge, { backgroundColor: avail.bg }]}>
              <Text style={styles.badgeText}>{avail.label}</Text>
            </View>
          </View>

          <Text style={styles.serviceText}>{serviceType}</Text>

          {/* Rating + Location Row */}
          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={12} color={Colors.accent} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({reviewCount})</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <View style={styles.locationBox}>
              <Ionicons name="location" size={11} color={Colors.muted} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>

          {/* Bottom Row: Price + Book */}
          <View style={styles.bottomRow}>
            <Text style={styles.priceText}>{price}</Text>
            <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.8}>
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  detailsCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nameText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  badge: {
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.white,
  },
  serviceText: {
    fontSize: 13,
    color: Colors.muted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.muted,
  },
  dot: {
    color: Colors.border,
    fontSize: 12,
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: Colors.muted,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
  },
  bookBtn: {
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.white,
  },
});
