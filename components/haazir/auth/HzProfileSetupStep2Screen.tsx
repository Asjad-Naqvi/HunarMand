import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius, Shadows } from "../../constants/theme";

export const HzProfileSetupStep2Screen: React.FC = () => {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [pinDropped, setPinDropped] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Profile Setup</Text>
      </View>

      {/* Step indicator */}
      <View style={styles.stepContainer}>
        <View style={styles.progressRow}>
          {[true, true, false].map((active, i) => (
            <View key={i} style={[styles.bar, active && styles.barActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step 2 of 3 — Add your address</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Where do you need services?</Text>
        <Text style={styles.subheading}>Add at least one address. You can add more later.</Text>

        {/* Address label input */}
        <View style={styles.fieldRow}>
          <Ionicons name="pricetag-outline" size={20} color={Colors.muted} />
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="Address label (e.g. Home, Office)"
            placeholderTextColor={Colors.muted}
            style={styles.input}
          />
        </View>

        {/* Address text input */}
        <View style={styles.fieldRow}>
          <Ionicons name="map-outline" size={20} color={Colors.muted} />
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Street address (e.g. G-13, Street 4, House 12)"
            placeholderTextColor={Colors.muted}
            style={styles.input}
          />
        </View>

        {/* Map placeholder */}
        <TouchableOpacity
          onPress={() => setPinDropped(true)}
          activeOpacity={0.8}
          style={[styles.mapBox, pinDropped && styles.mapBoxActive]}
        >
          {/* Map grid lines for visual texture (approximated with borders) */}
          <View style={styles.mapGrid} pointerEvents="none">
            {[25, 50, 75].map(pct => <View key={`h${pct}`} style={[styles.gridLineH, { top: `${pct}%` }]} />)}
            {[20, 40, 60, 80].map(pct => <View key={`v${pct}`} style={[styles.gridLineV, { left: `${pct}%` }]} />)}
          </View>

          <Ionicons 
            name={pinDropped ? "location" : "location-outline"} 
            size={32} 
            color={pinDropped ? Colors.accent : Colors.muted} 
          />
          <Text style={styles.mapText}>
            {pinDropped
              ? `Pin dropped — ${address || "G-13, Islamabad"}`
              : "Tap to drop a pin on the map"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Your pin will auto-detect the Islamabad sector.</Text>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <HzButton variant="primary" fullWidth onPress={() => router.push("/profile-setup-step3")}>
          Next →
        </HzButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 4, position: "relative" },
  backBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", lineHeight: 22, color: Colors.primary },
  stepContainer: { paddingHorizontal: 16 },
  progressRow: { flexDirection: "row", gap: 8 },
  bar: { flex: 1, height: 4, borderRadius: 12, backgroundColor: Colors.border },
  barActive: { backgroundColor: Colors.accent },
  stepLabel: { marginTop: 8, fontSize: 11, fontWeight: "400", lineHeight: 15, color: Colors.muted },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 },
  heading: { fontSize: 22, fontWeight: "600", lineHeight: 28, color: Colors.primary },
  subheading: { fontSize: 14, fontWeight: "400", lineHeight: 20, color: Colors.muted, marginTop: 4 },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 24,
  },
  input: { flex: 1, fontSize: 15, fontWeight: "400", color: Colors.primary },
  mapBox: {
    marginTop: 16,
    width: "100%",
    height: 160,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
  },
  mapBoxActive: {
    // optional active styling if needed, currently same
  },
  mapGrid: { position: "absolute", inset: 0, opacity: 0.25 },
  gridLineH: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: Colors.muted },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: Colors.muted },
  mapText: { fontSize: 14, fontWeight: "400", lineHeight: 20, color: Colors.muted, textAlign: "center", paddingHorizontal: 24, zIndex: 1 },
  hint: { marginTop: 8, fontSize: 11, fontWeight: "400", lineHeight: 15, color: Colors.muted },
  cta: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12, backgroundColor: Colors.bg },
});
