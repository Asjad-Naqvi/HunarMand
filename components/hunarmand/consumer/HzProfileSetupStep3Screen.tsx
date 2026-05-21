import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzButton } from "../../hunarmand/shared/HzButton";
import { Colors, Radius, Shadows } from "../../constants/theme";

type TimeSlot = "morning" | "afternoon" | "evening";

const OPTIONS = [
  { id: "morning" as const,   iconName: "partly-sunny-outline" as const, label: "Morning",   range: "7am – 12pm" },
  { id: "afternoon" as const, iconName: "sunny-outline" as const,        label: "Afternoon", range: "12pm – 5pm" },
  { id: "evening" as const,   iconName: "moon-outline" as const,         label: "Evening",   range: "5pm – 9pm"  },
];

export const HzProfileSetupStep3Screen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<TimeSlot>("morning");

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
          {[true, true, true].map((active, i) => (
            <View key={i} style={[styles.bar, active && styles.barActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step 3 of 3 — Preferred time</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>When do you usually need services?</Text>
        <Text style={styles.subheading}>This helps us suggest available providers.</Text>

        <View style={styles.optionsList}>
          {OPTIONS.map(({ id, iconName, label, range }) => {
            const isSelected = selected === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setSelected(id)}
                activeOpacity={0.8}
                style={[
                  styles.optionCard,
                  isSelected ? styles.optionCardSelected : null,
                  Shadows.card
                ]}
              >
                <Ionicons name={iconName} size={24} color={isSelected ? Colors.accent : Colors.muted} />
                
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionLabel}>{label}</Text>
                  <Text style={styles.optionRange}>{range}</Text>
                </View>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                ) : (
                  <Ionicons name="ellipse-outline" size={20} color={Colors.border} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>You can change this anytime from your profile.</Text>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <HzButton variant="primary" fullWidth onPress={() => router.replace("/(consumer)/chat")}>
          Go to HunarMand →
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
  optionsList: { marginTop: 24, gap: 12 },
  optionCard: {
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  optionTextContainer: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 15, fontWeight: "600", lineHeight: 20, color: Colors.primary },
  optionRange: { fontSize: 11, fontWeight: "400", lineHeight: 15, color: Colors.muted },
  hint: { marginTop: 16, fontSize: 11, fontWeight: "400", lineHeight: 15, color: Colors.muted, textAlign: "center" },
  cta: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12, backgroundColor: Colors.bg },
});
