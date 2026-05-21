import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Shadows } from "../../constants/theme";

const DetailRow: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const SubmissionField: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <View style={[styles.submissionField, last && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
    <Text style={styles.submissionLabel}>{label}</Text>
    <Text style={styles.submissionValue}>{value}</Text>
  </View>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

type StepState = "done" | "active" | "pending";
interface TimelineStep { state: StepState; title: string; subtitle: string; }

const STEPS: TimelineStep[] = [
  { state: "done", title: "Complaint Filed", subtitle: "Sun 19 May · 10:32 AM" },
  { state: "active", title: "Under Review", subtitle: "Hunar agent is reviewing your complaint." },
  { state: "pending", title: "Verdict Issued", subtitle: "" },
];

const Timeline: React.FC = () => (
  <View style={{ flexDirection: "column" }}>
    {STEPS.map((step, i) => {
      const isDone = step.state === "done";
      const isActive = step.state === "active";
      const isPending = step.state === "pending";
      
      const dotColor = isDone ? Colors.success : isActive ? Colors.accent : "transparent";
      const dotBorder = isPending ? Colors.muted : "transparent";
      const titleColor = isActive ? Colors.accent : isPending ? Colors.muted : Colors.primary;
      const lineColor = isDone ? Colors.success : isActive ? Colors.accent : Colors.border;

      return (
        <View key={step.title} style={styles.timelineRow}>
          <View style={styles.timelineLeft}>
            <View style={[styles.timelineDot, { backgroundColor: dotColor, borderColor: dotBorder, borderWidth: isPending ? 2 : 0 }]} />
            {i < STEPS.length - 1 && <View style={[styles.timelineLine, { backgroundColor: lineColor }]} />}
          </View>
          <View style={[styles.timelineRight, i < STEPS.length - 1 && { paddingBottom: 16 }]}>
            <Text style={[styles.timelineTitle, { color: titleColor }]}>{step.title}</Text>
            {!!step.subtitle && <Text style={styles.timelineSubtitle}>{step.subtitle}</Text>}
          </View>
        </View>
      );
    })}
  </View>
);

export const HzDisputeStatusScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Dispute Status</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Status Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTopTitle}>Dispute #D-2401</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Under Review</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Type" value="Work Quality Complaint (DIS-01)" />
          <DetailRow label="Against" value="Ali Hassan · AC Technician" />
          <DetailRow label="Booking" value="AC Repairing · Sat 18 May" />
          <DetailRow label="Filed" value="Sunday, 19 May 2025 · 10:32 AM" last />

          <Text style={styles.cardHint}>Expected resolution within 24 hours.</Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <SectionHeader title="Timeline" />
          <View style={{ marginTop: 12 }}><Timeline /></View>
        </View>

        {/* Submission */}
        <View style={styles.section}>
          <SectionHeader title="Your Submission" />
          <View style={[styles.card, Shadows.card, { marginTop: 12 }]}>
            <SubmissionField label="Dispute Type" value="Work quality not acceptable" />
            <SubmissionField label="Description" value="AC gas fill kiya tha lekin thanda nahi kar raha." />
            <SubmissionField label="Provider agreed to fix on-site" value="Yes" last />
          </View>
        </View>

        {/* Verdict Preview */}
        <View style={styles.section}>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>Verdict Issued — Provider received a warning. Reputation score adjusted.</Text>
          </View>
          <Text style={styles.previewHint}>This is shown once verdict is issued.</Text>
        </View>
        
      </ScrollView>
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
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTopTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  badge: { height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: Colors.warning, justifyContent: "center" },
  badgeText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 8 },
  cardHint: { marginTop: 8, fontSize: 12, color: Colors.muted },

  detailRow: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 12 },
  detailLabel: { fontSize: 13, color: Colors.muted },
  detailValue: { fontSize: 14, color: Colors.primary, textAlign: "right" },

  section: { marginTop: 24 },
  sectionHeader: { fontSize: 16, fontWeight: "600", color: Colors.primary },

  timelineRow: { flexDirection: "row", gap: 12 },
  timelineLeft: { alignItems: "center", width: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { flex: 1, width: 2, minHeight: 24, marginVertical: 4 },
  timelineRight: { flex: 1 },
  timelineTitle: { fontSize: 14, fontWeight: "600" },
  timelineSubtitle: { marginTop: 2, fontSize: 11, color: Colors.muted },

  submissionField: { paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  submissionLabel: { fontSize: 13, color: Colors.muted },
  submissionValue: { marginTop: 2, fontSize: 14, color: Colors.primary },

  previewBox: { borderRadius: 12, backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accent, padding: 16 },
  previewText: { fontSize: 13, lineHeight: 18, color: Colors.primary },
  previewHint: { marginTop: 6, fontSize: 11, color: Colors.muted, textAlign: "center" },
});
