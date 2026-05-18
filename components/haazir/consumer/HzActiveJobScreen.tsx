import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius, Shadows } from "../../constants/theme";

type StepState = "done" | "active" | "pending";

interface Step {
  label: string;
  state: StepState;
}

const STEPS: Step[] = [
  { label: "Confirmed",   state: "done"    },
  { label: "En Route",    state: "active"  },
  { label: "Arrived",     state: "pending" },
  { label: "In Progress", state: "pending" },
  { label: "Completed",   state: "pending" },
];

const stepColor = (state: StepState) => state === "done" ? Colors.success : state === "active" ? Colors.accent : Colors.border;

const lineColor = (left: Step, right: Step) => {
  if (left.state === "done" && (right.state === "done" || right.state === "active")) return Colors.success;
  return Colors.border;
};

const StepNode: React.FC<{ step: Step }> = ({ step }) => {
  const color = stepColor(step.state);
  const isFilled = step.state !== "pending";
  return (
    <View style={styles.stepNode}>
      <View style={[styles.stepCircle, { borderColor: color, backgroundColor: isFilled ? color : "transparent" }]} />
      <Text style={[styles.stepLabelText, { color, fontWeight: step.state === "active" ? "600" : "400" }]}>
        {step.label}
      </Text>
    </View>
  );
};

const ProgressBanner: React.FC = () => (
  <View style={styles.progressBanner}>
    <View style={styles.stepsRow}>
      {STEPS.map((step, i) => (
        <React.Fragment key={step.label}>
          <StepNode step={step} />
          {i < STEPS.length - 1 && (
            <View style={[styles.stepLine, { backgroundColor: lineColor(STEPS[i], STEPS[i + 1]) }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  </View>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode; last?: boolean; valueColor?: string }> = ({ label, value, last, valueColor = Colors.primary }) => (
  <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    {typeof value === "string" ? (
      <Text style={[styles.detailValue, { color: valueColor }]}>{value}</Text>
    ) : (
      value
    )}
  </View>
);

export const HzActiveJobScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Active Job</Text>
      </View>

      <ProgressBanner />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Provider Card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardLabel}>Your Provider</Text>

          <View style={styles.providerRow}>
            <View style={styles.avatar}><Ionicons name="person" size={22} color={Colors.white} /></View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>Ali Hassan</Text>
              <Text style={styles.providerRole}>AC Technician</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL("tel:+923001234567")} style={styles.callBtn}>
              <Ionicons name="call" size={20} color={Colors.accent} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Estimated Arrival" value="~20 minutes" valueColor={Colors.accent} />
          <DetailRow
            label="Contact"
            value={<Text style={[styles.detailValue, { color: Colors.accent }]}>+92 300 1234567</Text>}
            last
          />
        </View>

        {/* Job Details Card */}
        <View style={[styles.card, Shadows.card, { marginTop: 16 }]}>
          <Text style={styles.cardLabel}>Job Details</Text>
          <View style={{ marginTop: 8 }}>
            <DetailRow label="Service" value="AC Repairing" />
            <DetailRow label="Location" value="G-13 · House 12, Street 4" />
            <DetailRow label="Scheduled" value="Sat, 18 May · 9:00 AM" />
            <DetailRow label="Estimate" value="PKR 2,873" last />
          </View>
        </View>

        {/* Payment reminder */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentText}>
            💵 Pay <Text style={{ fontWeight: "600" }}>PKR 2,873</Text> directly to Ali Hassan in cash upon job completion.
          </Text>
        </View>

        {/* Report issue */}
        <View style={styles.reportWrap}>
          <TouchableOpacity onPress={() => router.push("/(consumer)/dispute-chat")} style={styles.reportBtn}>
            <Text style={styles.reportText}>Report an Issue</Text>
          </TouchableOpacity>
          <Text style={styles.reportHint}>Available only after job is completed.</Text>
        </View>

        {/* Complete CTA */}
        <View style={styles.completeWrap}>
          <HzButton variant="primary" fullWidth onPress={() => router.push("/feedback")}>
            Job Done — Rate Provider →
          </HzButton>
          <Text style={styles.completeHint}>Tap once provider has marked the job complete.</Text>
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
  
  progressBanner: { height: 80, backgroundColor: Colors.accentLight, borderBottomWidth: 1, borderBottomColor: Colors.divider, paddingHorizontal: 16, justifyContent: "center" },
  stepsRow: { flexDirection: "row", alignItems: "flex-start", width: "100%" },
  stepNode: { alignItems: "center", gap: 4 },
  stepCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  stepLabelText: { fontSize: 10, lineHeight: 13, marginTop: 2 },
  stepLine: { flex: 1, height: 2, marginTop: 6 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardLabel: { fontSize: 11, color: Colors.muted },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 12 },

  providerRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  providerInfo: { flex: 1, gap: 2 },
  providerName: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  providerRole: { fontSize: 13, color: Colors.muted },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accentLight, alignItems: "center", justifyContent: "center" },

  detailRow: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  detailLabel: { fontSize: 13, color: Colors.muted },
  detailValue: { fontSize: 14, fontWeight: "500", textAlign: "right" },

  paymentBox: { marginTop: 16, borderRadius: 12, backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accent, padding: 16 },
  paymentText: { fontSize: 13, lineHeight: 18, color: Colors.primary },

  reportWrap: { marginTop: 24, alignItems: "center", gap: 4 },
  reportBtn: { paddingVertical: 10, paddingHorizontal: 24, minHeight: 48, justifyContent: "center" },
  reportText: { fontSize: 14, fontWeight: "500", color: Colors.muted },
  reportHint: { fontSize: 11, color: Colors.muted },

  completeWrap: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.divider, alignItems: "center", gap: 4 },
  completeHint: { marginTop: 4, fontSize: 11, color: Colors.muted },
});
