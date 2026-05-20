import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius, Shadows } from "../../constants/theme";
import { supabase } from "../../../lib/supabase";

const SERVICE_CODE_MAP: Record<string, string> = {
  "HS-01": "Plumbing Work",
  "HS-02": "Carpenter Services",
  "HS-03": "Electrician Services",
  "HS-04": "AC Repair & Service",
  "CS-01": "Carpet Cleaning",
  "CS-02": "Sofa Cleaning",
};

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
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const id = await AsyncStorage.getItem("current_booking_id");
        if (id) {
          const { data, error } = await supabase
            .from("bookings")
            .select("*, provider:users!provider_id(name, phone)")
            .eq("id", id)
            .single();

          if (error) throw error;
          if (data) {
            setBooking(data);
          }
        } else {
          Alert.alert("Error", "No active booking ID found.");
          router.replace("/(consumer)/home");
        }
      } catch (err: any) {
        console.warn("Failed to load confirmed booking details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Loading confirmation details...</Text>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Text style={styles.loadingText}>No booking details available.</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.replace("/chat")}>
          <Text style={styles.backLinkText}>Go back to Chat</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const providerName = booking.provider?.name || "Provider";
  const rawPhone = booking.provider?.phone || "";
  // Format phone number nicely
  const phoneDisplay = rawPhone ? `+${rawPhone}` : "+92 300 1234567";
  const serviceName = SERVICE_CODE_MAP[booking.service_code] || "Home Service";
  const locationStr = "G-13, Islamabad";
  
  const baseRate = booking.base_rate_pkr || 2000;
  const finalTotal = booking.final_estimate_pkr || 2000;
  const discount = baseRate - finalTotal;

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
          <Text style={styles.subheading}>{providerName} has accepted your request.</Text>
        </View>

        {/* Booking details card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Your Booking</Text>
          <View style={styles.divider} />

          <DetailRow label="Service" value={serviceName} />
          <DetailRow
            label="Provider"
            value={<Text style={styles.detailValue}>{providerName} <Text style={{ color: Colors.success, fontWeight: "500" }}>✓ Verified</Text></Text>}
          />
          <DetailRow
            label="Contact"
            value={<Text style={[styles.detailValue, { color: Colors.accent }]}>{phoneDisplay}</Text>}
          />
          <DetailRow label="Location" value={locationStr} />
          <DetailRow label="Date & Time" value="Today (ASAP)" last />

          <View style={[styles.divider, { height: 2, marginTop: 16 }]} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimate</Text>
            <Text style={styles.totalValue}>PKR {finalTotal.toLocaleString()}</Text>
          </View>
          {discount > 0 && (
            <Text style={styles.discountText}>Loyalty discount applied (− PKR {discount.toLocaleString()})</Text>
          )}
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
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.muted },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 48, alignItems: "center" },

  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center" },
  
  headerGroup: { marginTop: 24, alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "600", color: Colors.primary },
  subheading: { marginTop: 8, fontSize: 14, color: Colors.muted, textAlign: "center" },

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
