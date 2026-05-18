import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius, Shadows } from "../../constants/theme";

const DetailRow: React.FC<{ label: string; value: React.ReactNode; last?: boolean }> = ({ label, value, last }) => (
  <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={{ flex: 1, alignItems: "flex-end" }}>
      {typeof value === "string" ? <Text style={styles.detailValue}>{value}</Text> : value}
    </View>
  </View>
);

const PriceRow: React.FC<{
  label: string;
  value: string;
  variant?: "default" | "subtotal" | "discount" | "total";
  borderBottom?: "thin" | "thick" | "none";
}> = ({ label, value, variant = "default", borderBottom = "thin" }) => {
  const isDiscount = variant === "discount";
  const isTotal = variant === "total";
  const isSubtotal = variant === "subtotal";

  const textColor = isDiscount ? Colors.accent : Colors.primary;
  const fontWeight = isSubtotal || isTotal ? "600" : isDiscount ? "500" : "400";
  const fontSize = isTotal ? 18 : isSubtotal ? 15 : 14;

  return (
    <View
      style={[
        styles.priceRow,
        borderBottom === "thick" && { borderBottomWidth: 2 },
        borderBottom === "none" && { borderBottomWidth: 0 },
      ]}
    >
      <Text style={{ fontSize, fontWeight, color: textColor }}>{label}</Text>
      <Text style={{ fontSize, fontWeight, color: textColor }}>{value}</Text>
    </View>
  );
};

export const HzBookingConfirmationScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Confirm Booking</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Job Summary */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          <View style={styles.divider} />
          <DetailRow label="Service" value="AC Repairing" />
          <DetailRow
            label="Provider"
            value={<Text style={styles.detailValue}>Ali Hassan <Text style={{ color: Colors.success, fontWeight: "500" }}>✓ Verified</Text></Text>}
          />
          <DetailRow label="Location" value="G-13, Islamabad" />
          <DetailRow label="Date & Time" value="Sat, 18 May 2025 · 9:00 AM" last />
        </View>

        {/* Price Breakdown */}
        <View style={[styles.card, Shadows.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          <View style={styles.divider} />
          
          <PriceRow label="Base Rate (Complex job)" value="PKR 2,800" />
          <PriceRow label="Urgency Factor (×1.0)" value="PKR 0" />
          <PriceRow label="Platform Fee (8%)" value="PKR 224" />
          <PriceRow label="Subtotal" value="PKR 3,024" variant="subtotal" borderBottom="thick" />
          <PriceRow label="Loyalty Discount (Bronze · 5%)" value="− PKR 151" variant="discount" borderBottom="thick" />
          <PriceRow label="Total Estimate" value="PKR 2,873" variant="total" borderBottom="none" />

          <Text style={styles.priceHint}>Payment is made directly to provider in cash. Final amount may vary slightly.</Text>
        </View>

        {/* Provider Mini Card */}
        <View style={[styles.card, Shadows.card, { marginTop: 16 }]}>
          <View style={styles.providerRow}>
            <View style={styles.avatar}><Ionicons name="person" size={20} color={Colors.white} /></View>
            <Text style={styles.providerName}>Ali Hassan</Text>
            <Text style={styles.providerRating}>★ 4.8</Text>
          </View>
          <Text style={styles.providerHint}>Your request will be sent to Ali Hassan only. He has 15 minutes to respond.</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.accent} style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>Ali Hassan will be notified immediately. You cannot cancel after he accepts.</Text>
        </View>

      </ScrollView>

      {/* Pinned Bottom CTA */}
      <View style={styles.bottomCta}>
        <HzButton variant="primary" fullWidth onPress={() => router.push("/awaiting")}>
          Confirm & Notify Provider
        </HzButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 4, position: "relative" },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 8 },

  detailRow: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  detailLabel: { fontSize: 13, color: Colors.muted },
  detailValue: { fontSize: 14, color: Colors.primary, textAlign: "right" },

  priceRow: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  priceHint: { marginTop: 8, fontSize: 11, color: Colors.muted },

  providerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  providerName: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.primary },
  providerRating: { fontSize: 13, color: Colors.muted },
  providerHint: { marginTop: 8, fontSize: 13, color: Colors.muted },

  infoBox: { marginTop: 16, borderRadius: 12, backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accent, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, color: Colors.primary },

  bottomCta: { height: 72, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider, paddingHorizontal: 16, justifyContent: "center" },
});
