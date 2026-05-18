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

export const HzBookingConfirmedScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ height: 24 }} />

        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={48} color={Colors.white} />
        </View>

        {/* Heading */}
        <View style={styles.headerGroup}>
          <Text style={styles.heading}>Booking Confirmed!</Text>
          <Text style={styles.subheading}>Ali Hassan has accepted your request.</Text>
        </View>

        {/* Booking details card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Your Booking</Text>
          <View style={styles.divider} />

          <DetailRow label="Service" value="AC Repairing" />
          <DetailRow
            label="Provider"
            value={<Text style={styles.detailValue}>Ali Hassan <Text style={{ color: Colors.success, fontWeight: "500" }}>✓ Verified</Text></Text>}
          />
          <DetailRow
            label="Contact"
            value={<Text style={[styles.detailValue, { color: Colors.accent }]}>+92 300 1234567</Text>}
          />
          <DetailRow label="Location" value="G-13, Islamabad" />
          <DetailRow label="Date & Time" value="Sat, 18 May 2025 · 9:00 AM" last />

          <View style={[styles.divider, { height: 2, marginTop: 16 }]} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimate</Text>
            <Text style={styles.totalValue}>PKR 2,873</Text>
          </View>
          <Text style={styles.discountText}>Bronze loyalty discount applied (− PKR 151)</Text>
        </View>

        {/* Reminder note */}
        <View style={styles.infoBox}>
          <Ionicons name="notifications" size={20} color={Colors.accent} style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>You'll receive a reminder 3 hours and 1 hour before the job.</Text>
        </View>

        {/* Primary CTA */}
        <View style={styles.ctaWrap}>
          <HzButton variant="primary" fullWidth onPress={() => router.push("/(consumer)/active-job")}>
            View Active Job
          </HzButton>
        </View>

        {/* Secondary link */}
        <TouchableOpacity onPress={() => router.replace("/chat")} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to Chat</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 48, alignItems: "center" },

  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center" },
  
  headerGroup: { marginTop: 24, alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "600", color: Colors.primary },
  subheading: { marginTop: 8, fontSize: 14, color: Colors.muted },

  card: { marginTop: 24, width: "100%", backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 8 },

  detailRow: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  detailLabel: { fontSize: 13, color: Colors.muted },
  detailValue: { fontSize: 14, color: Colors.primary, textAlign: "right" },

  totalRow: { marginTop: 12, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  totalLabel: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  totalValue: { fontSize: 18, fontWeight: "600", color: Colors.primary },
  discountText: { marginTop: 4, fontSize: 12, color: Colors.accent, textAlign: "right" },

  infoBox: { marginTop: 16, width: "100%", borderRadius: 12, backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accent, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, color: Colors.primary },

  ctaWrap: { marginTop: 24, width: "100%" },
  backLink: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 24, minHeight: 48 },
  backLinkText: { fontSize: 14, fontWeight: "500", color: Colors.accent },
});
