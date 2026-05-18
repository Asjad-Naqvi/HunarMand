import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";
import { HzChip } from "../../haazir/shared/HzChip";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/AuthContext";

type FilterChip = "all" | "completed" | "cancelled" | "upcoming";

const STATUS_CONFIG: Record<string, { label: string; bg: string; filter: FilterChip }> = {
  pending_provider_acceptance: { label: "Pending", bg: "#f59e0b", filter: "upcoming" },
  confirmed: { label: "Confirmed", bg: "#3b82f6", filter: "upcoming" },
  en_route: { label: "En Route", bg: "#6366f1", filter: "upcoming" },
  arrived: { label: "Arrived", bg: "#8b5cf6", filter: "upcoming" },
  in_progress: { label: "In Progress", bg: "#a855f7", filter: "upcoming" },
  completed: { label: "Completed", bg: "#10b981", filter: "completed" },
  cancelled: { label: "Cancelled", bg: "#6b7280", filter: "cancelled" },
  expired: { label: "Expired", bg: "#374151", filter: "cancelled" },
  disputed: { label: "Disputed", bg: "#ef4444", filter: "completed" },
};

// Map service codes to user-friendly titles
const SERVICE_CODE_MAP: Record<string, string> = {
  "HS-04": "AC Repair & Service",
  "HS-03": "Electrician Services",
  "HS-01": "Plumbing Work",
  "HS-02": "Carpenter Services",
  "CS-01": "Carpet Cleaning",
  "CS-02": "Sofa Cleaning",
};

interface BookingCardProps {
  id: string;
  service: string;
  status: string;
  providerName?: string;
  datetime?: string;
  location: string;
  amount: string;
  onUpdateStatus: (id: string, nextStatus: string) => void;
  onFileDisputeTrigger: (id: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  id,
  service,
  status,
  providerName,
  datetime,
  location,
  amount,
  onUpdateStatus,
  onFileDisputeTrigger,
}) => {
  const config = STATUS_CONFIG[status] || { label: status, bg: Colors.muted, filter: "upcoming" };

  return (
    <View style={[styles.card, Shadows.card]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{service}</Text>
        <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
          <Text style={styles.statusPillText}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.providerRow}>
        <Text style={styles.providerText}>Partner: {providerName || "Finding Partner..."}</Text>
        {!!datetime && <Text style={styles.datetimeText}>{datetime}</Text>}
      </View>

      <Text style={styles.locationText}>📍 {location}</Text>
      <Text style={styles.amountText}>{amount}</Text>

      {/* Dynamic Controls for consumer (Cannot manually progress provider status!) */}
      <View style={styles.actionsContainer}>
        {/* Customer can cancel a booking ONLY if it is still pending or confirmed */}
        {(status === "pending_provider_acceptance" || status === "confirmed") && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#ef4444", width: "100%" }]}
            onPress={() => onUpdateStatus(id, "cancelled")}
          >
            <Text style={styles.actionBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}

        {/* Customer can file a dispute on completed or active service sessions */}
        {(status === "completed" || status === "in_progress") && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#ef4444", width: "100%" }]}
            onPress={() => onFileDisputeTrigger(id)}
          >
            <Text style={styles.actionBtnText}>File Dispute ⚠️</Text>
          </TouchableOpacity>
        )}

        {/* If disputed, show pending message */}
        {status === "disputed" && (
          <View style={{ width: "100%", alignItems: "center", paddingVertical: 4 }}>
            <Text style={{ fontSize: 13, color: Colors.warning, fontStyle: "italic", fontWeight: "600" }}>
              ⚠️ Dispute filed. Waiting for provider to resolve.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const HzBookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Dispute Modal States
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [disputeMessage, setDisputeMessage] = useState("");

  const fetchBookings = async () => {
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
          provider:users!provider_id(name)
        `)
        .eq("consumer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      console.warn("Failed to fetch bookings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Simulate quick bookings
  const handleQuickBook = async (serviceCode: string, rate: number) => {
    if (!user?.id) return Alert.alert("Authentication Required", "Please log in to simulate bookings.");
    setSeeding(true);

    try {
      // 1. Get a random provider from seeded public.users who offers services
      const { data: providers, error: pError } = await supabase
        .from("users")
        .select("id, name")
        .eq("role", "provider")
        .limit(3);

      if (pError || !providers || providers.length === 0) {
        throw new Error("No seeded providers found to assign.");
      }

      const randomProvider = providers[Math.floor(Math.random() * providers.length)];

      // 2. Insert new booking in table
      const { error: bError } = await supabase.from("bookings").insert({
        consumer_id: user.id,
        provider_id: randomProvider.id,
        service_code: serviceCode,
        complexity_tier: "basic",
        urgency: "scheduled",
        requested_date: new Date().toISOString().split("T")[0],
        requested_time_slot: "14:00:00",
        base_rate_pkr: rate,
        final_estimate_pkr: rate,
        status: "pending_provider_acceptance",
      });

      if (bError) throw bError;

      Alert.alert("Success", `Created a pending job request for ${SERVICE_CODE_MAP[serviceCode]}!`);
      fetchBookings();
    } catch (err: any) {
      Alert.alert("Simulation Error", err.message);
    } finally {
      setSeeding(false);
    }
  };

  // State machine transition helper
  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw error;
      fetchBookings();
    } catch (err: any) {
      Alert.alert("Update Failed", err.message);
    }
  };

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
      fetchBookings();
    } catch (err: any) {
      Alert.alert("Failed to file dispute", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === "all") return true;
    const config = STATUS_CONFIG[b.status] || { filter: "upcoming" };
    return config.filter === activeFilter;
  });

  const FILTERS: { id: FilterChip; label: string }[] = [
    { id: "all", label: "All" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "upcoming", label: "Active/Upcoming" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Bookings Simulator</Text>
      </View>

      {/* Simulation Seeds Panel */}
      <View style={[styles.simulatorPanel, Shadows.card]}>
        <View style={styles.simHeader}>
          <Ionicons name="construct" size={16} color={Colors.accent} />
          <Text style={styles.simTitle}>Haazir Lifecycle Simulation Engine</Text>
        </View>
        <Text style={styles.simSubtitle}>Tap to request a new job with a random partner instantly:</Text>
        
        <View style={styles.seedRow}>
          <TouchableOpacity
            disabled={seeding}
            style={[styles.seedBtn, { borderColor: Colors.accent }]}
            onPress={() => handleQuickBook("HS-01", 1600)}
          >
            {seeding ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <Text style={styles.seedBtnText}>💧 Book Plumber</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={seeding}
            style={[styles.seedBtn, { borderColor: Colors.accent }]}
            onPress={() => handleQuickBook("HS-04", 2200)}
          >
            {seeding ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <Text style={styles.seedBtnText}>❄️ Book AC Tech</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {FILTERS.map(({ id, label }) => (
            <HzChip
              key={id}
              label={label}
              selected={activeFilter === id}
              onPress={() => setActiveFilter(id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 32 }} />
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={Colors.border} />
            <Text style={styles.emptyText}>No {activeFilter} bookings found.</Text>
          </View>
        ) : (
          filteredBookings.map((b) => (
            <BookingCard
              key={b.id}
              id={b.id}
              service={SERVICE_CODE_MAP[b.service_code] || b.service_code}
              status={b.status}
              providerName={b.provider?.name}
              datetime={`${b.requested_date} · ${b.requested_time_slot}`}
              location="Sector G-13, Islamabad"
              amount={`PKR ${b.final_estimate_pkr}`}
              onUpdateStatus={handleUpdateStatus}
              onFileDisputeTrigger={(id) => {
                setSelectedBookingId(id);
                setDisputeModalVisible(true);
              }}
            />
          ))
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
                  await handleFileDisputeSubmit(selectedBookingId!, disputeMessage);
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

      <HzBottomNav role="consumer" activeTab="bookings" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "700", color: Colors.primary },

  simulatorPanel: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.accentLight,
    margin: 12,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  simHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  simTitle: { fontSize: 14, fontWeight: "600", color: Colors.accent },
  simSubtitle: { fontSize: 12, color: Colors.muted },
  seedRow: { flexDirection: "row", gap: 10 },
  seedBtn: { flex: 1, height: 38, borderRadius: 8, borderWidth: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.accentLight },
  seedBtnText: { fontSize: 12, fontWeight: "600", color: Colors.accent },

  filterStrip: { height: 48, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  filterContent: { paddingHorizontal: 16, alignItems: "center", gap: 8 },

  scroll: { flex: 1 },
  content: { padding: 12, gap: 12, paddingBottom: 32 },

  emptyState: { paddingVertical: 48, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, color: Colors.muted, textAlign: "center" },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 4 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.primary },
  
  statusPill: { height: 22, paddingHorizontal: 8, borderRadius: 11, justifyContent: "center" },
  statusPillText: { fontSize: 11, fontWeight: "600", color: Colors.white },
  
  providerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 },
  providerText: { flex: 1, fontSize: 13, color: Colors.muted, fontWeight: "500" },
  datetimeText: { fontSize: 12, color: Colors.muted },
  locationText: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  amountText: { fontSize: 14, fontWeight: "700", color: Colors.accent, marginTop: 4 },

  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },

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
