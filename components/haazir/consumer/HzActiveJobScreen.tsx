import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius, Shadows } from "../../constants/theme";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/AuthContext";

type StepState = "done" | "active" | "pending";
interface Step { label: string; state: StepState; }

const STATUS_MAP: Record<string, { index: number; label: string }> = {
  pending_provider_acceptance: { index: 0, label: "Awaiting Provider Acceptance" },
  confirmed: { index: 1, label: "Job Confirmed" },
  en_route: { index: 2, label: "En Route" },
  arrived: { index: 3, label: "Arrived at Location" },
  in_progress: { index: 4, label: "Job In Progress" },
  completed: { index: 5, label: "Job Completed" },
};

// Step index progression: 0=Awaiting, 1=Confirmed, 2=EnRoute, 3=Arrived, 4=InProgress, 5=Completed
const buildSteps = (activeIndex: number): Step[] => [
  { label: "Confirmed",   state: activeIndex > 1 ? "done" : activeIndex === 1 ? "active" : "pending" },
  { label: "En Route",    state: activeIndex > 2 ? "done" : activeIndex === 2 ? "active" : "pending" },
  { label: "Arrived",     state: activeIndex > 3 ? "done" : activeIndex === 3 ? "active" : "pending" },
  { label: "In Progress", state: activeIndex > 4 ? "done" : activeIndex === 4 ? "active" : "pending" },
  { label: "Completed",   state: activeIndex > 5 ? "done" : activeIndex === 5 ? "active" : "pending" },
];

const SERVICE_CODE_MAP: Record<string, string> = {
  "HS-04": "AC Repair & Service",
  "HS-03": "Electrician Services",
  "HS-01": "Plumbing Work",
  "HS-02": "Carpenter Services",
  "CS-01": "Carpet Cleaning",
  "CS-02": "Sofa Cleaning",
};

const stepColor = (state: StepState) => state === "done" ? Colors.success : state === "active" ? Colors.accent : Colors.border;

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

const ProgressBanner: React.FC<{ steps: Step[] }> = ({ steps }) => (
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
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dispute Modal States
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState("");

  const fetchActiveJob = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          service_code,
          final_estimate_pkr,
          requested_date,
          requested_time_slot,
          provider:users!provider_id(name, phone)
        `)
        .eq("consumer_id", user.id)
        .not("status", "in", "(completed,expired)")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      setBooking(data && data.length > 0 ? data[0] : null);
    } catch (err: any) {
      console.warn("Failed to fetch customer active job:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJob();
    
    // Set up a polling interval to refresh status automatically for dynamic tracking
    const interval = setInterval(fetchActiveJob, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // File Dispute Submit
  const handleFileDisputeSubmit = async (bookingId: string, message: string) => {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id) throw new Error("User session expired.");

      // 1. Insert row into disputes table
      const { error: disputeError } = await supabase
        .from("disputes")
        .insert({
          booking_id: bookingId,
          raised_by_id: currentUser.id,
          raised_by_role: "consumer",
          dispute_type: "DIS-01",
          description_json: { message: message },
          status: "under_review"
        });

      if (disputeError) throw disputeError;

      // 2. Update booking status to disputed
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "disputed" })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      Alert.alert("Dispute Filed ⚠️", "Your dispute has been logged successfully and forwarded to the provider.");
      fetchActiveJob();
    } catch (err: any) {
      Alert.alert("Failed to file dispute", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={Colors.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // If the booking is disputed, show gorgeous dispute status screen
  if (booking && booking.status === "disputed") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="dark" backgroundColor={Colors.bg} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Booking Disputed</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={[styles.emptyState, { marginTop: 48, paddingHorizontal: 24 }]}>
          <Ionicons name="warning-outline" size={64} color={Colors.warning} />
          <Text style={styles.emptyTitle}>⚠️ Booking Under Dispute</Text>
          <Text style={styles.emptySubtitle}>
            You have filed a dispute for this session. Your provider has been notified to review and resolve this dispute. We will automatically notify you once it's resolved.
          </Text>
          <TouchableOpacity onPress={fetchActiveJob} style={[styles.refreshBtn, { backgroundColor: Colors.warning, borderColor: Colors.warning }]}>
            <Text style={[styles.refreshBtnText, { color: Colors.white }]}>🔄 Check for Resolution</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If the booking is cancelled, show gorgeous descriptive cancellation page
  if (booking && booking.status === "cancelled") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="dark" backgroundColor={Colors.bg} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Job Cancelled</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={[styles.emptyState, { marginTop: 48 }]}>
          <Ionicons name="close-circle-outline" size={64} color={Colors.warning} />
          <Text style={styles.emptyTitle}>Job Cancelled</Text>
          <Text style={styles.emptySubtitle}>
            This service session has been cancelled. If this was a mistake, or if you require another booking, you can find a new partner.
          </Text>
          <TouchableOpacity onPress={() => router.push("/home")} style={[styles.refreshBtn, { backgroundColor: Colors.accent }]}>
            <Text style={[styles.refreshBtnText, { color: Colors.white }]}>Find Another Provider</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no active booking, show clean empty state
  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="dark" backgroundColor={Colors.bg} />
        <View style={styles.topBar}>
          <Text style={styles.title}>Active Booking</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>No active sessions</Text>
          <Text style={styles.emptySubtitle}>You do not have any active home services running right now.</Text>
          <TouchableOpacity onPress={fetchActiveJob} style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>🔄 Check for updates</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeConfig = STATUS_MAP[booking.status] || { index: 0, label: "Confirmed" };
  const steps = buildSteps(activeConfig.index);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Active Job Tracking</Text>
        <TouchableOpacity onPress={fetchActiveJob} style={styles.syncBtn}>
          <Ionicons name="refresh" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ProgressBanner steps={steps} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Provider Card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardLabel}>Your Provider</Text>

          <View style={styles.providerRow}>
            <View style={styles.avatar}><Ionicons name="person" size={22} color={Colors.white} /></View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{booking.provider?.name || "Finding Partner..."}</Text>
              <Text style={styles.providerRole}>{SERVICE_CODE_MAP[booking.service_code] || booking.service_code} Expert</Text>
            </View>
            {booking.provider?.phone && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${booking.provider.phone}`)} style={styles.callBtn}>
                <Ionicons name="call" size={20} color={Colors.accent} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          <DetailRow label="Current Status" value={activeConfig.label} valueColor={Colors.accent} />
          {booking.provider?.phone && (
            <DetailRow
              label="Contact Number"
              value={<Text style={[styles.detailValue, { color: Colors.accent }]}>{booking.provider.phone}</Text>}
              last
            />
          )}
        </View>

        {/* Job Details Card */}
        <View style={[styles.card, Shadows.card, { marginTop: 16 }]}>
          <Text style={styles.cardLabel}>Job Details</Text>
          <View style={{ marginTop: 8 }}>
            <DetailRow label="Service Type" value={SERVICE_CODE_MAP[booking.service_code] || booking.service_code} />
            <DetailRow label="Location" value="G-13 Sector, Islamabad" />
            <DetailRow label="Scheduled Slot" value={`${booking.requested_date} · ${booking.requested_time_slot}`} />
            <DetailRow label="Total Estimate" value={`PKR ${booking.final_estimate_pkr}`} last />
          </View>
        </View>

        {/* Payment reminder */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentText}>
            💵 Pay <Text style={{ fontWeight: "600" }}>PKR {booking.final_estimate_pkr}</Text> directly to {booking.provider?.name || "your provider"} in cash upon completion.
          </Text>
        </View>

        {/* Report issue */}
        <View style={styles.reportWrap}>
          <TouchableOpacity onPress={() => setDisputeModalVisible(true)} style={styles.reportBtn}>
            <Text style={styles.reportText}>Report an Issue / Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.reportHint}>Available directly for active bookings.</Text>
        </View>

        {/* Complete CTA */}
        {booking.status === "completed" ? (
          <View style={styles.completeWrap}>
            <HzButton variant="primary" fullWidth onPress={() => router.push("/feedback")}>
              Job Completed — Rate Provider →
            </HzButton>
            <Text style={styles.completeHint}>Rate the service partner to release completion metrics.</Text>
          </View>
        ) : (
          <View style={styles.completeWrap}>
            <ActivityIndicator color={Colors.accent} style={{ marginBottom: 4 }} />
            <Text style={styles.waitingText}>Waiting for partner to finish service...</Text>
          </View>
        )}

      </ScrollView>

      {/* Dispute Modal Sheet */}
      <Modal
        visible={disputeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDisputeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, Shadows.card]}>
            <Text style={styles.modalTitle}>⚠️ File a Dispute</Text>
            <Text style={styles.modalSubtitle}>
              Please describe the issue with this service session. This dispute will be forwarded to your provider for immediate review and resolution.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Write your issue details here..."
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={4}
              value={disputeMessage}
              onChangeText={setDisputeMessage}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => {
                  setDisputeModalVisible(false);
                  setDisputeMessage("");
                }}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!disputeMessage.trim()) {
                    Alert.alert("Error", "Please provide a description of your issue.");
                    return;
                  }
                  setDisputeModalVisible(false);
                  await handleFileDisputeSubmit(booking.id, disputeMessage);
                  setDisputeMessage("");
                }}
                style={styles.modalSubmitBtn}
              >
                <Text style={styles.modalSubmitBtnText}>Submit Dispute</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4, position: "relative" },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  syncBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },
  
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
  waitingText: { fontSize: 12, color: Colors.muted, fontStyle: "italic" },

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 12, marginTop: 64 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.muted, textAlign: "center", paddingHorizontal: 16, lineHeight: 20 },
  refreshBtn: { marginTop: 12, height: 44, paddingHorizontal: 20, borderRadius: 22, backgroundColor: Colors.accentLight, justifyContent: "center", alignItems: "center" },
  refreshBtnText: { fontSize: 14, fontWeight: "600", color: Colors.accent },

  // Modal Sheet Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.primary,
    height: 100,
    textAlignVertical: "top",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  modalSubmitBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
});
