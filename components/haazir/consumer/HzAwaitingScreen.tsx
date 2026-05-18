import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { Colors, Shadows } from "../../constants/theme";

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
    setTimeout(() => {
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
  const { display, seconds } = useCountdown(767); // 12:47
  const isLow = seconds <= 300; // ≤ 5 min

  /* Simulate provider accepting after 3 s for demo purposes */
  useEffect(() => {
    const t = setTimeout(() => router.replace("/booking-confirmed"), 3000);
    return () => clearTimeout(t);
  }, []);

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
          <Text style={styles.heading}>Request sent to Ali Hassan</Text>
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
          <SummaryRow label="Service" value="AC Repairing" />
          <SummaryRow label="Location" value="G-13, Islamabad" />
          <SummaryRow label="Date & Time" value="Sat 18 May · 9:00 AM" last />
        </View>

        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  
  illustrationWrap: { width: 120, height: 120, alignItems: "center", justifyContent: "center", position: "relative" },
  illustrationCore: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.accentLight, alignItems: "center", justifyContent: "center", zIndex: 10 },
  
  headerTextGroup: { marginTop: 24, alignItems: "center" },
  heading: { fontSize: 20, fontWeight: "600", color: Colors.primary },
  subheading: { marginTop: 8, fontSize: 14, color: Colors.muted },

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
