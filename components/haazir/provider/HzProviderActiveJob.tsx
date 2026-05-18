import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

type StepState = "done" | "active" | "pending";
interface Step { label: string; state: StepState; }

// Step index progression: 0=Confirmed, 1=EnRoute, 2=Arrived, 3=InProgress, 4=Completed
const buildSteps = (activeIndex: number): Step[] => [
  { label: "Confirmed",   state: activeIndex > 0 ? "done" : activeIndex === 0 ? "active" : "pending" },
  { label: "En Route",    state: activeIndex > 1 ? "done" : activeIndex === 1 ? "active" : "pending" },
  { label: "Arrived",     state: activeIndex > 2 ? "done" : activeIndex === 2 ? "active" : "pending" },
  { label: "In Progress", state: activeIndex > 3 ? "done" : activeIndex === 3 ? "active" : "pending" },
  { label: "Completed",   state: activeIndex > 4 ? "done" : activeIndex === 4 ? "active" : "pending" },
];

const STATUS_LABELS = ["En Route to Consumer", "En Route to Consumer", "Arrived at Location", "Job In Progress", "Job Completed"];

const StepNode: React.FC<{ step: Step }> = ({ step }) => {
  const color = step.state === "done" ? Colors.success : step.state === "active" ? Colors.accent : Colors.border;
  return (
    <View style={styles.stepNode}>
      <View style={[styles.stepDot, { backgroundColor: color, borderWidth: step.state === "pending" ? 2 : 0, borderColor: Colors.border }]} />
      <Text style={[styles.stepText, { color, fontWeight: step.state === "active" ? "600" : "400" }]}>{step.label}</Text>
    </View>
  );
};

const ProgressBanner: React.FC<{ steps: Step[]; activeIndex: number }> = ({ steps, activeIndex }) => (
  <View style={styles.progressBanner}>
    <View style={styles.stepsRow}>
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <StepNode step={step} />
          {i < steps.length - 1 && (
            <View style={[styles.stepLine, { backgroundColor: steps[i].state === "done" ? Colors.success : Colors.border }]} />
          )}
        </React.Fragment>
      ))}
    </View>
    <Text style={styles.progressText}>Currently: {STATUS_LABELS[activeIndex]}</Text>
  </View>
);

const DetailRow: React.FC<{ label: string; value: string; last?: boolean; valueColor?: string; valueBold?: boolean }> = ({ label, value, last, valueColor = Colors.primary, valueBold }) => (
  <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, { color: valueColor, fontWeight: valueBold ? "600" : "400" }]}>{value}</Text>
  </View>
);

const StatusButton: React.FC<{ label: string; variant: "primary" | "disabled" | "secondary"; onPress?: () => void }> = ({ label, variant, onPress }) => {
  const btnStyle = variant === "primary" ? styles.btnPrimary : variant === "secondary" ? styles.btnSecondary : styles.btnDisabled;
  const txtStyle = variant === "primary" ? styles.txtPrimary : variant === "secondary" ? styles.txtSecondary : styles.txtDisabled;
  return (
    <TouchableOpacity onPress={onPress} disabled={variant === "disabled"} activeOpacity={0.8} style={[styles.statusBtn, btnStyle]}>
      <Text style={txtStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

export const HzProviderActiveJob: React.FC = () => {
  const router = useRouter();
  // activeIndex: 1=EnRoute(start), 2=Arrived, 3=InProgress, 4=Completed
  const [activeIndex, setActiveIndex] = useState(1);
  const steps = buildSteps(activeIndex);

  const handleArrived = () => setActiveIndex(2);
  const handleInProgress = () => setActiveIndex(3);
  const handleCompleted = () => {
    setActiveIndex(4);
    setTimeout(() => router.replace("/(provider)/rate-consumer"), 800);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Active Job</Text>
      </View>

      <ProgressBanner steps={steps} activeIndex={activeIndex} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Address Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle}>Consumer Address</Text>
            <TouchableOpacity onPress={() => Linking.openURL("https://maps.google.com/?q=House+12+Street+4+G-13+Islamabad")}>
              <Text style={styles.linkText}>Tap for Maps</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color={Colors.accent} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLine1}>House 12, Street 4, G-13/1, Islamabad</Text>
              <Text style={styles.addressLine2}>G-13, Islamabad</Text>
            </View>
          </View>
          <Text style={styles.addressHint}>Address revealed because you accepted this job.</Text>
        </View>

        {/* Job Details */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Job Details</Text>
          <View style={styles.divider} />
          <DetailRow label="Service" value="AC Repairing" />
          <DetailRow label="Consumer" value="Sana M." />
          <DetailRow label="Scheduled" value="Sat 18 May · 9:00 AM" />
          <DetailRow label="Your Earnings" value="PKR 2,800" valueColor={Colors.success} valueBold last />
        </View>

        {/* Status Update */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Update Job Status</Text>
          <View style={styles.btnGroup}>
            {activeIndex === 1 && (
              <StatusButton label="Mark as Arrived" variant="primary" onPress={handleArrived} />
            )}
            {activeIndex === 2 && (
              <StatusButton label="Mark as In Progress" variant="primary" onPress={handleInProgress} />
            )}
            {activeIndex === 3 && (
              <StatusButton label="Mark as Completed" variant="primary" onPress={handleCompleted} />
            )}
            {activeIndex === 4 && (
              <StatusButton label="Job Completed ✓" variant="disabled" />
            )}
            <StatusButton
              label="Report Issue"
              variant="secondary"
              onPress={() => router.push("/(provider)/dispute-chat")}
            />
          </View>
        </View>

        {/* Contact */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.contactHeaderRow}>
            <Ionicons name="call" size={20} color={Colors.accent} />
            <Text style={styles.contactHeaderText}>Consumer Contact (post-accept)</Text>
          </View>
          <View style={styles.contactBottomRow}>
            <Text style={styles.contactPhone}>+92 321 4567890</Text>
            <TouchableOpacity onPress={() => Linking.openURL("tel:+923214567890")} style={styles.callBtn}>
              <Ionicons name="call" size={20} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 4, position: "relative" },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },

  progressBanner: { backgroundColor: Colors.accentLight, borderBottomWidth: 1, borderBottomColor: Colors.accent, padding: 16 },
  stepsRow: { flexDirection: "row", alignItems: "flex-start", width: "100%" },
  stepNode: { alignItems: "center", gap: 4 },
  stepDot: { width: 14, height: 14, borderRadius: 7 },
  stepText: { fontSize: 10, marginTop: 2 },
  stepLine: { flex: 1, height: 2, marginTop: 6 },
  progressText: { marginTop: 12, fontSize: 13, fontWeight: "500", color: Colors.accent },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  linkText: { fontSize: 13, fontWeight: "500", color: Colors.accent },
  
  addressRow: { marginTop: 12, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  addressLine1: { fontSize: 15, color: Colors.primary, lineHeight: 22 },
  addressLine2: { fontSize: 13, color: Colors.muted },
  addressHint: { marginTop: 12, fontSize: 11, fontStyle: "italic", color: Colors.muted },

  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 8 },
  detailRow: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 12 },
  detailLabel: { fontSize: 13, color: Colors.muted },
  detailValue: { fontSize: 14, color: Colors.primary, textAlign: "right" },

  btnGroup: { marginTop: 12, gap: 12 },
  statusBtn: { height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: Colors.accent },
  txtPrimary: { fontSize: 14, fontWeight: "600", color: Colors.white },
  btnDisabled: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  txtDisabled: { fontSize: 14, color: Colors.muted },
  btnSecondary: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.muted },
  txtSecondary: { fontSize: 14, color: Colors.muted },

  contactHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  contactHeaderText: { fontSize: 12, color: Colors.muted },
  contactBottomRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contactPhone: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accentLight, alignItems: "center", justifyContent: "center" },
});
