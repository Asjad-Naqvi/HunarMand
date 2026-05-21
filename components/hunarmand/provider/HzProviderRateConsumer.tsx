import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/theme";

const RatingDimension: React.FC<{ label: string; score: number; onChange: (s: number) => void }> = ({ label, score, onChange }) => (
  <View style={styles.dimensionWrapper}>
    <Text style={styles.dimensionLabel}>{label}</Text>
    <View style={styles.radioGroup}>
      {Array.from({ length: 10 }, (_, i) => {
        const val = i + 1;
        const isFilled = val <= score;
        const isSelected = val === score;
        return (
          <TouchableOpacity
            key={val}
            activeOpacity={0.8}
            onPress={() => onChange(val)}
            style={[
              styles.radioBtn,
              {
                backgroundColor: isFilled ? Colors.accent : "transparent",
                borderWidth: isFilled ? 0 : 1.5,
                borderColor: Colors.border,
                transform: [{ scale: isSelected ? 1.15 : 1 }],
              }
            ]}
          />
        );
      })}
    </View>
    <Text style={styles.dimensionScore}>{score} / 10</Text>
  </View>
);

export const HzProviderRateConsumer: React.FC = () => {
  const router = useRouter();
  const [scores, setScores] = useState({ punctuality: 9, behaviour: 8, instructions: 7, payment: 10 });
  const [note, setNote] = useState("");

  const setScore = (k: keyof typeof scores) => (val: number) => setScores(p => ({ ...p, [k]: val }));
  const average = (scores.punctuality + scores.behaviour + scores.instructions + scores.payment) / 4;

  const DIMENSIONS: { key: keyof typeof scores; label: string }[] = [
    { key: "punctuality", label: "Punctuality (Was consumer on-time?)" },
    { key: "behaviour", label: "Behaviour / Conduct" },
    { key: "instructions", label: "Clear Instructions" },
    { key: "payment", label: "Payment Promptness" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title} pointerEvents="none">Rate This Consumer</Text>
        <TouchableOpacity onPress={() => router.push("/dashboard")} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "android" ? "padding" : "height"}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerBlock}>
            <Text style={styles.headerTitle}>How was Sana?</Text>
            <Text style={styles.headerSubtitle}>Rate the consumer for future providers.</Text>
            <Text style={styles.headerHint}>These notes are visible to future providers (not the consumer).</Text>
          </View>

          <View style={styles.dimensionsContainer}>
            {DIMENSIONS.map(({ key, label }) => (
              <RatingDimension key={key} label={label} score={scores[key]} onChange={setScore(key)} />
            ))}
          </View>

          <Text style={styles.averageScore}>
            Consumer score: <Text style={styles.averageValue}>{average.toFixed(1)}</Text> / 10
          </Text>

          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Leave a note for other providers (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Consumer is punctual and pays on time."
              placeholderTextColor={Colors.muted}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.noteHint}>Note is private — only visible to future HunarMand providers.</Text>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={() => router.push("/dashboard")}>
            <Text style={styles.submitText}>Submit Rating</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  headerSpacer: { width: 32 },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },
  skipBtn: { paddingVertical: 8, minHeight: 44, justifyContent: "center" },
  skipText: { fontSize: 14, color: Colors.muted },

  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 24, paddingBottom: 32 },

  headerBlock: { alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "600", color: Colors.primary },
  headerSubtitle: { marginTop: 8, fontSize: 14, color: Colors.muted },
  headerHint: { marginTop: 4, fontSize: 12, fontStyle: "italic", color: Colors.muted, textAlign: "center" },

  dimensionsContainer: { marginTop: 24, gap: 20 },
  dimensionWrapper: {},
  dimensionLabel: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  radioGroup: { marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  radioBtn: { width: 28, height: 28, borderRadius: 14 },
  dimensionScore: { marginTop: 4, fontSize: 12, color: Colors.muted, textAlign: "right" },

  averageScore: { marginTop: 16, fontSize: 16, fontWeight: "600", color: Colors.primary, textAlign: "center" },
  averageValue: { color: Colors.accent },

  noteSection: { marginTop: 24 },
  noteLabel: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  noteInput: { marginTop: 4, width: "100%", height: 100, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, padding: 16, fontSize: 14, color: Colors.primary },
  noteHint: { marginTop: 4, fontSize: 11, color: Colors.muted },

  submitBtn: { marginTop: 24, width: "100%", height: 72, borderRadius: 12, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 16, fontWeight: "600", color: Colors.white },
});
