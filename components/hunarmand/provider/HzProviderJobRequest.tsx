import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return { display: `${mm}:${ss}`, minutes: Math.floor(seconds / 60), secs: seconds % 60, seconds };
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; last?: boolean; valueColor?: string; valueBold?: boolean }> = ({ label, value, last, valueColor = Colors.primary, valueBold }) => (
  <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    {typeof value === "string" ? (
      <Text style={[styles.detailValue, { color: valueColor, fontWeight: valueBold ? "600" : "400" }]}>{value}</Text>
    ) : (
      value
    )}
  </View>
);

const CardHeading: React.FC<{ title: string }> = ({ title }) => (
  <View>
    <Text style={styles.cardHeading}>{title}</Text>
    <View style={styles.divider} />
  </View>
);

export const HzProviderJobRequest: React.FC = () => {
  const router = useRouter();
  const { display, minutes, secs, seconds } = useCountdown(683);
  const isLow = seconds <= 300;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Job Request</Text>
        <View style={[styles.countdownPill, { backgroundColor: isLow ? Colors.warning : Colors.accent }]}>
          <Text style={styles.countdownText}>{display} remaining</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Job Details */}
        <View style={[styles.card, Shadows.card]}>
          <CardHeading title="Job Details" />
          <DetailRow label="Service" value="AC Repairing" />
          <DetailRow
            label="Complexity"
            value={
              <View style={styles.complexityRow}>
                <Text style={styles.detailValue}>Complex</Text>
                <View style={styles.complexityDot} />
              </View>
            }
          />
          <DetailRow label="Sector" value="G-13, Islamabad" />
          <DetailRow label="Date" value="Saturday, 18 May 2025" />
          <DetailRow label="Time" value="9:00 AM" />
          <DetailRow label="Consumer Rating" value="★ 4.7 (12 bookings)" last />
        </View>

        {/* Earnings */}
        <View style={[styles.card, Shadows.card]}>
          <CardHeading title="Your Earnings" />
          <DetailRow label="Your Base Rate" value="PKR 2,800" />
          <DetailRow label="Complexity Adjustment" value="+ PKR 0" />
          <DetailRow label="Your Earnings" value="PKR 2,800" valueBold last />
          <View style={styles.thickDivider} />
          <View style={styles.subsidyRow}>
            <Text style={styles.subsidyLabel}>HunarMand Subsidy (covers consumer discount)</Text>
            <Text style={styles.subsidyValue}>+ PKR 151</Text>
          </View>
          <Text style={styles.earningsHint}>Your total payout: PKR 2,800. Consumer pays PKR 2,873.</Text>
        </View>

        {/* Consumer Info */}
        <View style={[styles.card, Shadows.card]}>
          <CardHeading title="Consumer Info" />
          <DetailRow label="Name" value="Sana M." />
          <DetailRow label="Flags / Disputes" value="None" valueColor={Colors.success} last />
          <Text style={styles.consumerHint}>Full address revealed only after you accept.</Text>
        </View>

        {/* Reminder Banner */}
        <View style={styles.reminderBanner}>
          <Ionicons name="time-outline" size={20} color={Colors.accent} style={{ marginTop: 2 }} />
          <Text style={styles.reminderText}>
            You have {minutes} minute{minutes !== 1 ? "s" : ""} {secs} second{secs !== 1 ? "s" : ""} to respond. Auto-declines if no action.
          </Text>
        </View>

      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => router.replace("/(provider)/active-job")}>
          <Text style={styles.acceptBtnText}>Accept Job</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineBtn} onPress={() => router.back()}>
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },
  countdownPill: { height: 26, paddingHorizontal: 10, borderRadius: 13, justifyContent: "center", marginRight: 12 },
  countdownText: { fontSize: 12, fontWeight: "500", color: Colors.white },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24, gap: 16 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardHeading: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 8 },
  
  detailRow: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 12 },
  detailLabel: { fontSize: 13, color: Colors.muted },
  detailValue: { fontSize: 14, color: Colors.primary, textAlign: "right" },
  complexityRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  complexityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },

  thickDivider: { height: 2, backgroundColor: Colors.divider, marginVertical: 8 },
  subsidyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  subsidyLabel: { flex: 1, fontSize: 13, color: Colors.muted },
  subsidyValue: { fontSize: 14, fontWeight: "500", color: Colors.success },
  earningsHint: { marginTop: 4, fontSize: 12, fontStyle: "italic", color: Colors.muted },

  consumerHint: { marginTop: 8, fontSize: 12, fontStyle: "italic", color: Colors.muted },

  reminderBanner: { backgroundColor: Colors.accentLight, borderRadius: 12, borderWidth: 1, borderColor: Colors.accent, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  reminderText: { flex: 1, fontSize: 13, lineHeight: 18, color: Colors.primary },

  actionBar: { height: 80, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 },
  acceptBtn: { flex: 2, height: 56, borderRadius: 12, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  acceptBtnText: { fontSize: 16, fontWeight: "600", color: Colors.white },
  declineBtn: { flex: 1, height: 56, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.danger, alignItems: "center", justifyContent: "center" },
  declineBtnText: { fontSize: 15, fontWeight: "500", color: Colors.danger },
});
