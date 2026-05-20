import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { Colors, Shadows } from "../../constants/theme";
import { supabase } from "../../../lib/supabase";

const SERVICE_CODE_MAP: Record<string, string> = {
  "HS-01": "Plumbing Work",
  "HS-02": "Carpenter Services",
  "HS-03": "Electrician Services",
  "HS-04": "AC Repair & Service",
  "CS-01": "Carpet Cleaning",
  "CS-02": "Sofa Cleaning",
};

/* ── Countdown hook ── */
function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return { display: `${mm}:${ss}`, seconds };
}

/* ── Pulse rings (Reanimated) ── */
const PulseRing: React.FC<{ delay: number; size: number }> = ({ delay, size }) => {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const t = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.92, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: Colors.accent,
          borderStyle: "dashed",
        },
        animatedStyle,
      ]}
    />
  );
};

const WaitingIllustration: React.FC = () => (
  <View style={styles.illustrationWrap}>
    <PulseRing delay={0} size={140} />
    <PulseRing delay={400} size={160} />
    <PulseRing delay={800} size={180} />
    
    <View style={styles.illustrationCore}>
      <Ionicons name="notifications" size={56} color={Colors.accent} />
    </View>
  </View>
);

/* ── Summary row ── */
const SummaryRow: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <View style={[styles.summaryRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

/* ── Main screen ── */
export const HzAwaitingScreen: React.FC = () => {
  const router = useRouter();
  const { display, seconds } = useCountdown(900); // 15 mins
  const isLow = seconds <= 300; // ≤ 5 min
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBooking = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, provider:users!provider_id(name, phone)")
        .eq("id", bookingId)
        .single();
      
      if (error) throw error;
      if (data) {
        setBooking(data);
        
        // Dynamic status routing
        if (data.status === "confirmed") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          router.replace("/booking-confirmed");
        } else if (data.status === "cancelled" || data.status === "expired") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          Alert.alert("Request Declined", "The provider has declined or missed this job request.");
          router.back();
        }
      }
    } catch (err) {
      console.warn("Error fetching awaited booking details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let bookingId = "";
    const initAwaiting = async () => {
      try {
        const id = await AsyncStorage.getItem("current_booking_id");
        if (id) {
          bookingId = id;
          await fetchBooking(id);

          // Poll every 3 seconds
          pollIntervalRef.current = setInterval(() => {
            fetchBooking(bookingId);
          }, 3000);
        } else {
          Alert.alert("Error", "No active booking ID found.");
          router.back();
        }
      } catch (err) {
        console.warn("Failed to initialize awaiting screen:", err);
        setLoading(false);
      }
    };

    initAwaiting();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleCancelRequest = async () => {
    if (!booking?.id) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", booking.id);
      
      if (error) throw error;
      
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      Alert.alert("Request Cancelled", "Your booking request has been cancelled.");
      router.back();
    } catch (err: any) {
      Alert.alert("Cancellation Failed", err.message);
      setLoading(false);
    }
  };

  if (loading && !booking) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Connecting to provider...</Text>
      </SafeAreaView>
    );
  }

  const providerName = booking?.provider?.name || "Provider";
  const serviceName = SERVICE_CODE_MAP[booking?.service_code] || "Home Service";
  const locationStr = "G-13, Islamabad";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top app bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Waiting for Confirmation</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <WaitingIllustration />

        <View style={styles.headerTextGroup}>
          <Text style={styles.heading}>Request sent to {providerName}</Text>
          <Text style={styles.subheading}>Waiting for him to accept your booking.</Text>
        </View>

        <View style={styles.timerGroup}>
          <View style={[styles.timerBadge, isLow && { backgroundColor: Colors.warning }]}>
            <Ionicons name="time" size={20} color={Colors.white} />
            <Text style={styles.timerText}>{display} remaining</Text>
          </View>
          <Text style={styles.timerHint}>Auto-cancels if no response</Text>
        </View>

        <View style={[styles.card, Shadows.card]}>
          <SummaryRow label="Service" value={serviceName} />
          <SummaryRow label="Location" value={locationStr} />
          <SummaryRow label="Date & Time" value="Today (ASAP)" last />
        </View>

        <TouchableOpacity onPress={handleCancelRequest} activeOpacity={0.7} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.muted },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  
  illustrationWrap: { width: 120, height: 120, alignItems: "center", justifyContent: "center", position: "relative" },
  illustrationCore: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.accentLight, alignItems: "center", justifyContent: "center", zIndex: 10 },
  
  headerTextGroup: { marginTop: 24, alignItems: "center" },
  heading: { fontSize: 20, fontWeight: "600", color: Colors.primary, textAlign: "center" },
  subheading: { marginTop: 8, fontSize: 14, color: Colors.muted, textAlign: "center" },

  timerGroup: { marginTop: 24, alignItems: "center", gap: 8 },
  timerBadge: { height: 52, borderRadius: 26, backgroundColor: Colors.accent, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 8 },
  timerText: { fontSize: 17, fontWeight: "600", color: Colors.white },
  timerHint: { fontSize: 11, color: Colors.muted },

  card: { marginTop: 24, width: "100%", backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  summaryRow: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  summaryLabel: { fontSize: 13, color: Colors.muted },
  summaryValue: { fontSize: 14, color: Colors.primary },

  cancelBtn: { marginTop: 24, height: 48, justifyContent: "center", paddingHorizontal: 24 },
  cancelBtnText: { fontSize: 14, fontWeight: "500", color: Colors.danger },
});
