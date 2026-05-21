import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

type TimeSlot = "morning" | "afternoon" | "evening";

const OPTIONS: { id: TimeSlot; iconName: keyof typeof Ionicons.glyphMap; label: string; range: string }[] = [
  { id: "morning", iconName: "partly-sunny-outline", label: "Morning", range: "7am – 12pm" },
  { id: "afternoon", iconName: "sunny-outline", label: "Afternoon", range: "12pm – 5pm" },
  { id: "evening", iconName: "moon-outline", label: "Evening", range: "5pm – 9pm" },
];

export const HzProfileSetupStep3Screen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<TimeSlot>("morning");

  const handleFinish = () => {
    // Hardcoded transition to consumer app for now
    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Profile Setup</Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          {[true, true, true].map((_, i) => (
            <View key={i} style={styles.progressLineFilled} />
          ))}
        </View>
        <Text style={styles.progressText}>Step 3 of 3 — Preferred time</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>When do you usually need services?</Text>
        <Text style={styles.subheading}>This helps us suggest available providers.</Text>

        <View style={styles.optionsWrap}>
          {OPTIONS.map(({ id, iconName, label, range }) => {
            const isSelected = selected === id;
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.8}
                onPress={() => setSelected(id)}
                style={[styles.optionCard, Shadows.card, isSelected ? styles.optionCardSelected : styles.optionCardUnselected]}
              >
                <Ionicons name={iconName} size={24} color={isSelected ? Colors.accent : Colors.muted} />
                
                <View style={styles.optionTextCol}>
                  <Text style={styles.optionLabel}>{label}</Text>
                  <Text style={styles.optionRange}>{range}</Text>
                </View>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
                ) : (
                  <Ionicons name="radio-button-off" size={24} color={Colors.border} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>You can change this anytime from your profile.</Text>

        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} activeOpacity={0.8}>
          <Text style={styles.finishBtnText}>Go to HunarMand →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 4 },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },

  progressWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  progressRow: { flexDirection: "row", gap: 8 },
  progressLineFilled: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.accent },
  progressText: { marginTop: 8, fontSize: 11, color: Colors.muted },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, paddingTop: 24 },

  heading: { fontSize: 22, fontWeight: "600", color: Colors.primary },
  subheading: { marginTop: 4, fontSize: 14, color: Colors.muted },

  optionsWrap: { marginTop: 24, gap: 12 },
  optionCard: { height: 64, borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 },
  optionCardUnselected: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  optionCardSelected: { backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accent },
  optionTextCol: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  optionRange: { fontSize: 11, color: Colors.muted },

  hint: { marginTop: 16, fontSize: 11, color: Colors.muted, textAlign: "center" },

  finishBtn: { marginTop: 32, height: 56, borderRadius: 12, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  finishBtnText: { fontSize: 15, fontWeight: "600", color: Colors.white },
});
