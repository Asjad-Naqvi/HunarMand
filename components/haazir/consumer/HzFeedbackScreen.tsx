import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius } from "../../constants/theme";

interface RatingDimensionProps {
  label: string;
  score: number;
  onChange: (score: number) => void;
}

const RatingDimension: React.FC<RatingDimensionProps> = ({ label, score, onChange }) => {
  return (
    <View>
      <Text style={styles.dimLabel}>{label}</Text>
      <View style={styles.circlesRow}>
        {Array.from({ length: 10 }, (_, i) => {
          const value = i + 1;
          const isFilled = value <= score;
          const isSelected = value === score;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => onChange(value)}
              activeOpacity={0.8}
              style={[
                styles.circle,
                isFilled ? styles.circleFilled : styles.circleEmpty,
                isSelected && styles.circleSelected,
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.scoreText}>{score} / 10</Text>
    </View>
  );
};

export const HzFeedbackScreen: React.FC = () => {
  const router = useRouter();
  const [scores, setScores] = useState({ quality: 7, punctuality: 8, communication: 7, value: 6 });
  const [review, setReview] = useState("");

  const setScore = (key: keyof typeof scores) => (val: number) => setScores(prev => ({ ...prev, [key]: val }));
  const average = (scores.quality + scores.punctuality + scores.communication + scores.value) / 4;

  const DIMENSIONS: { key: keyof typeof scores; label: string }[] = [
    { key: "quality",       label: "Quality of Work" },
    { key: "punctuality",   label: "Punctuality"     },
    { key: "communication", label: "Communication"   },
    { key: "value",         label: "Value for Money" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <View style={{ width: 48 }} />
        <Text style={styles.title}>Rate Your Experience</Text>
        <TouchableOpacity onPress={() => router.replace("/home")} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "android" ? "padding" : "height"}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerGroup}>
            <Text style={styles.heading}>How was your experience?</Text>
            <Text style={styles.subheading}>with Ali Hassan · AC Repairing · G-13</Text>
          </View>

          <View style={styles.dimsContainer}>
            {DIMENSIONS.map(({ key, label }) => (
              <RatingDimension key={key} label={label} score={scores[key]} onChange={setScore(key)} />
            ))}
          </View>

          <Text style={styles.overallText}>
            Your overall score: <Text style={{ color: Colors.accent }}>{average.toFixed(1)}</Text> / 10
          </Text>

          <View style={styles.reviewSection}>
            <Text style={styles.reviewLabel}>Leave a review (optional)</Text>
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder="Share your experience to help other consumers..."
              placeholderTextColor={Colors.muted}
              multiline
              textAlignVertical="top"
              style={styles.reviewInput}
            />
            <Text style={styles.reviewHint}>Reviews are visible on Ali Hassan's profile.</Text>
          </View>

          <View style={styles.ctaWrap}>
            <HzButton variant="primary" fullWidth onPress={() => router.replace("/home")}>
              Submit Rating
            </HzButton>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  skipText: { fontSize: 14, color: Colors.muted },
  
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 },

  headerGroup: { alignItems: "center" },
  heading: { fontSize: 22, fontWeight: "600", color: Colors.primary },
  subheading: { marginTop: 8, fontSize: 14, color: Colors.muted },

  dimsContainer: { marginTop: 24, gap: 20 },
  dimLabel: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  circlesRow: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  circle: { width: 28, height: 28, borderRadius: 14 },
  circleEmpty: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: Colors.border },
  circleFilled: { backgroundColor: Colors.accent, borderWidth: 0 },
  circleSelected: { transform: [{ scale: 1.15 }] },
  scoreText: { marginTop: 4, fontSize: 12, color: Colors.muted, textAlign: "right" },

  overallText: { marginTop: 24, fontSize: 16, fontWeight: "600", color: Colors.primary, textAlign: "center" },

  reviewSection: { marginTop: 24 },
  reviewLabel: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  reviewInput: { marginTop: 8, height: 120, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, padding: 16, fontSize: 14, color: Colors.primary },
  reviewHint: { marginTop: 8, fontSize: 11, color: Colors.muted },

  ctaWrap: { marginTop: 24 },
});
