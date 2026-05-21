import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

const DetailRow: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const TimelineStep: React.FC<{ state: "done" | "active" | "pending"; label: string; labelColor?: string; sub: string; isLast?: boolean }> = ({ state, label, labelColor, sub, isLast }) => {
  const dotColor = state === "done" ? Colors.success : state === "active" ? Colors.accent : "transparent";
  const dotBorder = state === "pending" ? 2 : 0;
  const lineColor = state === "done" ? Colors.success : Colors.border;

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeftCol}>
        <View style={[styles.timelineDot, { backgroundColor: dotColor, borderWidth: dotBorder, borderColor: Colors.border }]} />
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: lineColor }]} />}
      </View>
      <View style={[styles.timelineRightCol, isLast && { paddingBottom: 0 }]}>
        <Text style={[styles.timelineLabel, { color: labelColor ?? Colors.primary }]}>{label}</Text>
        {!!sub && <Text style={styles.timelineSub}>{sub}</Text>}
      </View>
    </View>
  );
};

const SubmissionField: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <View style={[styles.submissionField, last && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
    <Text style={styles.submissionLabel}>{label}</Text>
    <Text style={styles.submissionValue}>{value}</Text>
  </View>
);

export const HzProviderDisputeStatus: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace("/dashboard")} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Dispute Status</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Status Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.statusHeaderRow}>
            <Text style={styles.statusTitle}>Dispute #D-2402</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Under Review</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Type" value="Consumer No-Show (DIS-03)" />
          <DetailRow label="Against" value="Sana Malik · Consumer" />
          <DetailRow label="Booking" value="AC Repairing · Sat 18 May" />
          <DetailRow label="Filed" value="Sat, 18 May 2025 · 12:15 PM" last />

          <Text style={styles.statusHint}>Expected resolution within 24 hours.</Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={{ marginTop: 12 }}>
            <TimelineStep state="done" label="Complaint Filed" sub="Sat 18 May · 12:15 PM" />
            <TimelineStep state="active" label="Under Review" labelColor={Colors.accent} sub="Hunar agent is reviewing both parties." />
            <TimelineStep state="pending" label="Verdict Issued" labelColor={Colors.muted} sub="" isLast />
          </View>
        </View>

        {/* Submission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Submission</Text>
          <View style={[styles.submissionCard, Shadows.card]}>
            <SubmissionField label="Type" value="Consumer no-show (DIS-03)" />
            <SubmissionField label="Details" value="Waited 30 minutes. Called consumer twice — no answer." />
            <SubmissionField label="Contact attempt" value="Yes, called twice" last />
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>Once resolved, the verdict will appear here. A consumer no-show flag will be added to their record if the complaint is upheld.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 4 },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  statusHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  statusTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  statusPill: { height: 22, paddingHorizontal: 10, borderRadius: 11, backgroundColor: Colors.warning, justifyContent: "center" },
  statusPillText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 8 },
  statusHint: { marginTop: 8, fontSize: 12, color: Colors.muted },

  detailRow: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 8 },
  detailLabel: { fontSize: 14, color: Colors.muted },
  detailValue: { fontSize: 14, color: Colors.primary, textAlign: "right" },

  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },

  timelineRow: { flexDirection: "row", gap: 12 },
  timelineLeftCol: { alignItems: "center" },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  timelineLine: { width: 2, flex: 1, minHeight: 24, marginTop: 4 },
  timelineRightCol: { flex: 1, paddingBottom: 16 },
  timelineLabel: { fontSize: 14, fontWeight: "600" },
  timelineSub: { marginTop: 2, fontSize: 11, color: Colors.muted },

  submissionCard: { marginTop: 12, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  submissionField: { paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  submissionLabel: { fontSize: 13, color: Colors.muted },
  submissionValue: { marginTop: 2, fontSize: 14, color: Colors.primary },

  infoBanner: { marginTop: 24, backgroundColor: Colors.accentLight, borderRadius: 12, borderWidth: 1, borderColor: Colors.accent, padding: 16 },
  infoBannerText: { fontSize: 13, lineHeight: 18, color: Colors.primary },
});
