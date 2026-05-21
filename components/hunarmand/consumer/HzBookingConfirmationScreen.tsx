import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HzButton } from "../../hunarmand/shared/HzButton";
import { Colors, Radius, Shadows } from "../../constants/theme";
import { useAuth } from "../../../lib/AuthContext";
import { supabase } from "../../../lib/supabase";

const DetailRow: React.FC<{ label: string; value: React.ReactNode; last?: boolean }> = ({ label, value, last }) => (
  <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={{ flex: 1, alignItems: "flex-end" }}>
      {typeof value === "string" ? <Text style={styles.detailValue}>{value}</Text> : value}
    </View>
  </View>
);

const PriceRow: React.FC<{
  label: string;
  value: string;
  variant?: "default" | "subtotal" | "discount" | "total";
  borderBottom?: "thin" | "thick" | "none";
}> = ({ label, value, variant = "default", borderBottom = "thin" }) => {
  const isDiscount = variant === "discount";
  const isTotal = variant === "total";
  const isSubtotal = variant === "subtotal";

  const textColor = isDiscount ? Colors.accent : Colors.primary;
  const fontWeight = isSubtotal || isTotal ? "600" : isDiscount ? "500" : "400";
  const fontSize = isTotal ? 18 : isSubtotal ? 15 : 14;

  return (
    <View
      style={[
        styles.priceRow,
        borderBottom === "thick" && { borderBottomWidth: 2 },
        borderBottom === "none" && { borderBottomWidth: 0 },
      ]}
    >
      <Text style={{ fontSize, fontWeight, color: textColor }}>{label}</Text>
      <Text style={{ fontSize, fontWeight, color: textColor }}>{value}</Text>
    </View>
  );
};

const mapServiceToCode = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  if (name.includes("plumb")) return "HS-01";
  if (name.includes("carpent")) return "HS-02";
  if (name.includes("electric") || name.includes("appliance")) return "HS-03";
  if (name.includes("ac repair") || name.includes("ac fix") || name.includes("ac repairing")) return "HS-04";
  if (name.includes("sofa")) return "CS-02";
  if (name.includes("clean")) return "CS-01";
  return "HS-04"; // Default fallback
};

export const HzBookingConfirmationScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const cached = await AsyncStorage.getItem("current_booking_details");
        if (cached) {
          setBookingDetails(JSON.parse(cached));
        } else {
          Alert.alert("No Booking Details", "Please select a provider to book.");
          router.back();
        }
      } catch (err) {
        console.warn("Failed to load booking details from storage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, []);

  const handleConfirmBooking = async () => {
    if (!bookingDetails) return;
    if (!user?.id) {
      Alert.alert("Authentication Required", "Please log in as a customer to book a service.");
      return;
    }

    try {
      setSubmitting(true);
      const serviceCode = mapServiceToCode(bookingDetails.serviceName);
      
      const payload = {
        consumer_id: user.id,
        provider_id: bookingDetails.providerId,
        service_code: serviceCode,
        complexity_tier: "basic",
        urgency: "scheduled",
        requested_date: new Date().toISOString().split("T")[0],
        requested_time_slot: "10:00:00",
        base_rate_pkr: bookingDetails.pricing?.base_rate || bookingDetails.pricing?.final_total || 2000,
        final_estimate_pkr: bookingDetails.pricing?.final_total || 2000,
        status: "pending_provider_acceptance"
      };

      const { data, error } = await supabase
        .from("bookings")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from booking insert.");

      // Save booking ID to AsyncStorage for awaiting/confirmed screens
      await AsyncStorage.setItem("current_booking_id", data.id);
      
      router.push("/awaiting");
    } catch (err: any) {
      Alert.alert("Booking Failed", err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  const { providerName, providerRating, serviceName, location, pricing } = bookingDetails;
  
  const baseRate = pricing?.base_rate || 2000;
  const distanceSurcharge = pricing?.distance_surcharge || 0;
  const urgencySurcharge = pricing?.urgency_surcharge || 0;
  const complexitySurcharge = pricing?.complexity_surcharge || 0;
  const surgeSurcharge = pricing?.surge_surcharge || 0;
  const loyaltyDiscount = pricing?.loyalty_discount || 0;
  const subtotal = baseRate + distanceSurcharge + urgencySurcharge + complexitySurcharge + surgeSurcharge;
  const finalTotal = pricing?.final_total || subtotal - loyaltyDiscount;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} disabled={submitting}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Confirm Booking</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Job Summary */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          <View style={styles.divider} />
          <DetailRow label="Service" value={serviceName} />
          <DetailRow
            label="Provider"
            value={<Text style={styles.detailValue}>{providerName} <Text style={{ color: Colors.success, fontWeight: "500" }}>✓ Verified</Text></Text>}
          />
          <DetailRow label="Location" value={location} />
          <DetailRow label="Date & Time" value="Today (ASAP)" last />
        </View>

        {/* Price Breakdown */}
        <View style={[styles.card, Shadows.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          <View style={styles.divider} />
          
          <PriceRow label="Base Rate" value={`PKR ${baseRate.toLocaleString()}`} />
          {distanceSurcharge > 0 && <PriceRow label="Distance Surcharge" value={`PKR ${distanceSurcharge.toLocaleString()}`} />}
          {urgencySurcharge > 0 && <PriceRow label="Urgency Surcharge" value={`PKR ${urgencySurcharge.toLocaleString()}`} />}
          {complexitySurcharge > 0 && <PriceRow label="Complexity Premium" value={`PKR ${complexitySurcharge.toLocaleString()}`} />}
          {surgeSurcharge > 0 && <PriceRow label="Surge Demand Premium" value={`PKR ${surgeSurcharge.toLocaleString()}`} />}
          <PriceRow label="Subtotal" value={`PKR ${subtotal.toLocaleString()}`} variant="subtotal" borderBottom="thick" />
          {loyaltyDiscount > 0 && <PriceRow label="Loyalty Discount" value={`− PKR ${loyaltyDiscount.toLocaleString()}`} variant="discount" borderBottom="thick" />}
          <PriceRow label="Total Estimate" value={`PKR ${finalTotal.toLocaleString()}`} variant="total" borderBottom="none" />

          <Text style={styles.priceHint}>Payment is made directly to provider in cash. Final amount may vary slightly.</Text>
        </View>

        {/* Provider Mini Card */}
        <View style={[styles.card, Shadows.card, { marginTop: 16 }]}>
          <View style={styles.providerRow}>
            <View style={styles.avatar}><Ionicons name="person" size={20} color={Colors.white} /></View>
            <Text style={styles.providerName}>{providerName}</Text>
            <Text style={styles.providerRating}>★ {providerRating?.toFixed(1) || "5.0"}</Text>
          </View>
          <Text style={styles.providerHint}>Your request will be sent to {providerName} only. He has 15 minutes to respond.</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.accent} style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>{providerName} will be notified immediately. You cannot cancel after he accepts.</Text>
        </View>

      </ScrollView>

      {/* Pinned Bottom CTA */}
      <View style={styles.bottomCta}>
        <HzButton variant="primary" fullWidth onPress={handleConfirmBooking} loading={submitting}>
          Confirm & Notify Provider
        </HzButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.muted },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 4, position: "relative" },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 8 },

  detailRow: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  detailLabel: { fontSize: 13, color: Colors.muted },
  detailValue: { fontSize: 14, color: Colors.primary, textAlign: "right" },

  priceRow: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  priceHint: { marginTop: 8, fontSize: 11, color: Colors.muted },

  providerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  providerName: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.primary },
  providerRating: { fontSize: 13, color: Colors.muted },
  providerHint: { marginTop: 8, fontSize: 13, color: Colors.muted },

  infoBox: { marginTop: 16, borderRadius: 12, backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accent, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, color: Colors.primary },

  bottomCta: { height: 72, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider, paddingHorizontal: 16, justifyContent: "center" },
});
