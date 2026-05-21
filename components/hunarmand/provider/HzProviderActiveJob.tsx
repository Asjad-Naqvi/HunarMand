import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/AuthContext";

type StepState = "done" | "active" | "pending";
interface Step { label: string; state: StepState; }

const STATUS_MAP: Record<string, { index: number; label: string }> = {
  pending_provider_acceptance: { index: 0, label: "Awaiting Your Acceptance" },
  confirmed: { index: 1, label: "Job Confirmed" },
  en_route: { index: 2, label: "En Route to Consumer" },
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

const StepNode: React.FC<{ step: Step }> = ({ step }) => {
  const color = step.state === "done" ? Colors.success : step.state === "active" ? Colors.accent : Colors.border;
  return (
    <View style={styles.stepNode}>
      <View style={[styles.stepDot, { backgroundColor: color, borderWidth: step.state === "pending" ? 2 : 0, borderColor: Colors.border }]} />
      <Text style={[styles.stepText, { color, fontWeight: step.state === "active" ? "600" : "400" }]}>{step.label}</Text>
    </View>
  );
};

const ProgressBanner: React.FC<{ steps: Step[]; statusLabel: string }> = ({ steps, statusLabel }) => (
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
    <Text style={styles.progressText}>Currently: {statusLabel}</Text>
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
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          consumer:users!consumer_id(name, phone)
        `)
        .eq("provider_id", user.id)
        .not("status", "in", "(completed,cancelled,expired)")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      setBooking(data && data.length > 0 ? data[0] : null);
    } catch (err: any) {
      console.warn("Failed to load active job:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJob();
  }, [user]);

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!booking) return;
    try {
      console.log(`Updating booking ${booking.id} to status: ${nextStatus}`);
      const { error } = await supabase
        .from("bookings")
        .update({ status: nextStatus })
        .eq("id", booking.id);

      if (error) throw error;

      let alertTitle = "Status Updated";
      let alertMsg = `Your job status is now: ${nextStatus}.`;

      if (nextStatus === "confirmed") {
        alertTitle = "Job Accepted ✓";
        alertMsg = "You have accepted this job. Tap 'Start Travel' when you are ready to head out!";
      } else if (nextStatus === "en_route") {
        alertTitle = "En Route 🚗";
        alertMsg = "You are on your way to the consumer's location. Drive safely!";
      } else if (nextStatus === "arrived") {
        alertTitle = "Arrived at Location 📍";
        alertMsg = "You have arrived at the destination. Tap 'Start Work' when you begin the service!";
      } else if (nextStatus === "in_progress") {
        alertTitle = "Job in Progress 🛠️";
        alertMsg = "You have started the service. Tap 'Mark as Completed' once the job is fully done!";
      }

      if (nextStatus === "completed") {
        Alert.alert("Job Finished! 🎉", "You completed the service. Let's rate your experience!", [
          { text: "Rate Client", onPress: () => router.replace("/(provider)/rate-consumer") }
        ]);
      } else {
        Alert.alert(alertTitle, alertMsg, [
          { text: "OK", onPress: fetchActiveJob }
        ]);
      }
    } catch (err: any) {
      console.error("Failed to update status:", err.message);
      Alert.alert("Update Failed", err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={Colors.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // If no active booking, render clean empty state
  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="dark" backgroundColor={Colors.bg} />
        <View style={styles.topBar}>
          <Text style={styles.title}>Active Dispatch</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>You do not have any active service sessions assigned at this time.</Text>
          <TouchableOpacity onPress={fetchActiveJob} style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>🔄 Check for new jobs</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeConfig = STATUS_MAP[booking.status] || { index: 0, label: "Pending" };
  const steps = buildSteps(activeConfig.index);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Active Job Tracking</Text>
      </View>

      <ProgressBanner steps={steps} statusLabel={activeConfig.label} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Address Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle}>Consumer Address</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`https://maps.google.com/?q=Sector+G-13+Islamabad`)}>
              <Text style={styles.linkText}>Tap for Directions</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color={Colors.accent} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLine1}>Sector G-13, Islamabad</Text>
              <Text style={styles.addressLine2}>Client pin matches sector coverage map.</Text>
            </View>
          </View>
          <Text style={styles.addressHint}>Exact client contact is revealed post-booking.</Text>
        </View>

        {/* Job Details */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Job Specification</Text>
          <View style={styles.divider} />
          <DetailRow label="Service Type" value={SERVICE_CODE_MAP[booking.service_code] || booking.service_code} />
          <DetailRow label="Customer Name" value={booking.consumer?.name || "Client"} />
          <DetailRow label="Request Timing" value={`${booking.requested_date} · ${booking.requested_time_slot}`} />
          <DetailRow label="Your Earnings" value={`PKR ${booking.final_estimate_pkr}`} valueColor={Colors.success} valueBold last />
        </View>

        {/* Status Update Controls */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Update Job Status</Text>
          <View style={styles.btnGroup}>
            {booking.status === "pending_provider_acceptance" && (
              <View style={{ gap: 12 }}>
                <StatusButton label="Accept Job Booking" variant="primary" onPress={() => handleUpdateStatus("confirmed")} />
                <StatusButton label="Decline Job Booking" variant="secondary" onPress={() => handleUpdateStatus("cancelled")} />
              </View>
            )}
            {booking.status === "confirmed" && (
              <StatusButton label="Start Travel (En Route)" variant="primary" onPress={() => handleUpdateStatus("en_route")} />
            )}
            {booking.status === "en_route" && (
              <StatusButton label="Mark as Arrived" variant="primary" onPress={() => handleUpdateStatus("arrived")} />
            )}
            {booking.status === "arrived" && (
              <StatusButton label="Start Work (In Progress)" variant="primary" onPress={() => handleUpdateStatus("in_progress")} />
            )}
            {booking.status === "in_progress" && (
              <StatusButton label="Mark as Completed" variant="primary" onPress={() => handleUpdateStatus("completed")} />
            )}
            {booking.status === "completed" && (
              <StatusButton label="Job Completed ✓" variant="disabled" />
            )}
            <StatusButton
              label="Report Dispute / Issue"
              variant="secondary"
              onPress={() => router.push("/(provider)/dispute-chat")}
            />
          </View>
        </View>

        {/* Contact Client Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.contactHeaderRow}>
            <Ionicons name="call" size={20} color={Colors.accent} />
            <Text style={styles.contactHeaderText}>Consumer Direct Contact</Text>
          </View>
          <View style={styles.contactBottomRow}>
            <Text style={styles.contactPhone}>{booking.consumer?.phone || "+92 311 1234509"}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${booking.consumer?.phone}`)} style={styles.callBtn}>
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

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 12, marginTop: 64 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.muted, textAlign: "center", paddingHorizontal: 16, lineHeight: 20 },
  refreshBtn: { marginTop: 12, height: 44, paddingHorizontal: 20, borderRadius: 22, backgroundColor: Colors.accentLight, justifyContent: "center", alignItems: "center" },
  refreshBtnText: { fontSize: 14, fontWeight: "600", color: Colors.accent },
});
