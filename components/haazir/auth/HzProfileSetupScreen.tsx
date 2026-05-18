import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius } from "../../constants/theme";

export const HzProfileSetupScreen: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("Sana Malik");

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
          {[true, false, false].map((active, i) => (
            <View key={i} style={[styles.bar, active && styles.barActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step 1 of 3 — Your name</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>What should we call you?</Text>
        <Text style={styles.subheading}>This name appears on your bookings.</Text>

        {/* Name input */}
        <View style={styles.fieldRow}>
          <Ionicons name="person-outline" size={20} color={Colors.muted} />
          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholderTextColor={Colors.muted}
            style={styles.input}
          />
        </View>

        {/* Phone display */}
        <View style={styles.phoneRow}>
          <View>
            <Text style={styles.phoneLabel}>Phone number</Text>
            <Text style={styles.phoneValue}>+92 321 4567890</Text>
          </View>
          <Text style={styles.phoneHint}>From registration</Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <HzButton variant="primary" fullWidth onPress={() => router.push("/profile-setup-step2")}>
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
  phoneRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16 },
  phoneLabel: { fontSize: 11, fontWeight: "400", lineHeight: 15, color: Colors.muted },
  phoneValue: { fontSize: 15, fontWeight: "400", lineHeight: 22, color: Colors.muted },
  phoneHint: { fontSize: 11, fontWeight: "400", fontStyle: "italic", lineHeight: 15, color: Colors.muted, paddingBottom: 2 },
  cta: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12, backgroundColor: Colors.bg },
});
