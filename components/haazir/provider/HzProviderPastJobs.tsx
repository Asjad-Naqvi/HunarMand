import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";

const Pill: React.FC<{ label: string; bg: string }> = ({ label, bg }) => (
  <View style={[styles.pill, { backgroundColor: bg }]}>
    <Text style={styles.pillText}>{label}</Text>
  </View>
);

interface JobCardProps {
  service: string;
  statusPills: { label: string; bg: string }[];
  meta: string;
  earned: string;
  earnedNote?: string;
  ratingLine: string;
  warning?: string;
}

const JobCard: React.FC<JobCardProps> = ({ service, statusPills, meta, earned, earnedNote, ratingLine, warning }) => (
  <View style={[styles.card, Shadows.card]}>
    <View style={styles.cardTopRow}>
      <Text style={styles.serviceText}>{service}</Text>
      <View style={styles.pillsWrap}>
        {statusPills.map(p => <Pill key={p.label} label={p.label} bg={p.bg} />)}
      </View>
    </View>

    <Text style={styles.metaText}>{meta}</Text>

    <View style={styles.earnedRow}>
      <Text style={[styles.earnedText, { color: earned === "PKR 0" ? Colors.muted : Colors.success }]}>Earned: {earned}</Text>
      {!!earnedNote && <Text style={styles.earnedNoteText}>{earnedNote}</Text>}
    </View>

    <Text style={styles.ratingLineText}>{ratingLine}</Text>

    {!!warning && <Text style={styles.warningText}>{warning}</Text>}
  </View>
);

const SummaryTile: React.FC<{ value: string; label: string; last?: boolean }> = ({ value, label, last }) => (
  <View style={[styles.summaryTile, last && { borderRightWidth: 0 }]}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

export const HzProviderPastJobs: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <Text style={styles.title}>Past Jobs</Text>
      </View>

      <View style={styles.summaryStrip}>
        <View style={styles.summaryRow}>
          <SummaryTile value="42" label="Total Jobs" />
          <SummaryTile value="★ 4.8" label="Avg Rating" />
          <SummaryTile value="PKR 1,02,400 *" label="Earned" last />
        </View>
        <Text style={styles.summaryHint}>* Simulated earnings.</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <JobCard
          service="AC Repairing"
          statusPills={[{ label: "Completed", bg: Colors.success }]}
          meta="Sana M. · G-13 · Sat 18 May · 9 AM"
          earned="PKR 2,800"
          earnedNote="(+ PKR 151 Haazir subsidy)"
          ratingLine="Consumer rated you: ★ 4.8 · You rated consumer: ★ 8.5"
        />
        <JobCard
          service="Sofa Cleaning"
          statusPills={[{ label: "Completed", bg: Colors.success }]}
          meta="Raza K. · F-7 · Mon 13 May · 11 AM"
          earned="PKR 1,500"
          ratingLine="Consumer rated you: ★ 4.6 · You rated consumer: ★ 9.0"
        />
        <JobCard
          service="AC General Service"
          statusPills={[
            { label: "Completed", bg: Colors.success },
            { label: "Dispute Filed", bg: Colors.warning },
          ]}
          meta="Ahmed B. · G-10 · Thu 9 May · 2 PM"
          earned="PKR 1,200"
          ratingLine="Consumer rating: Withheld (dispute)"
        />
        <JobCard
          service="Electrician"
          statusPills={[{ label: "Cancelled (No Response)", bg: Colors.muted }]}
          meta="Unknown · G-11 · Mon 6 May · 10 AM"
          earned="PKR 0"
          ratingLine=""
          warning="⚠ Non-response logged."
        />
      </ScrollView>

      <HzBottomNav role="provider" activeTab="past-jobs" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },

  summaryStrip: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  summaryRow: { flexDirection: "row", alignItems: "stretch" },
  summaryTile: { flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: Colors.divider, paddingVertical: 4 },
  summaryValue: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  summaryLabel: { fontSize: 12, color: Colors.muted },
  summaryHint: { marginTop: 4, fontSize: 11, fontStyle: "italic", color: Colors.muted, textAlign: "right" },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24, gap: 12 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  serviceText: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.primary },
  pillsWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 4 },
  pill: { height: 22, paddingHorizontal: 8, borderRadius: 11, justifyContent: "center" },
  pillText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  
  metaText: { marginTop: 8, fontSize: 14, color: Colors.muted },
  
  earnedRow: { marginTop: 8, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  earnedText: { fontSize: 14, fontWeight: "500" },
  earnedNoteText: { fontSize: 12, color: Colors.muted },

  ratingLineText: { marginTop: 8, fontSize: 13, color: Colors.muted },
  warningText: { marginTop: 4, fontSize: 12, color: Colors.danger },
});
