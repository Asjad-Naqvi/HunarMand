import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

export const HzAboutScreen: React.FC = () => {
  const router = useRouter();

  const HOW_IT_WORKS = [
    {
      step: "1",
      icon: "chatbubble-ellipses-outline" as const,
      title: "Describe Your Need",
      body: "Chat with HunarMand in plain language — Urdu, English, or whatever is comfortable. Say what you need, where, and when.",
    },
    {
      step: "2",
      icon: "sparkles-outline" as const,
      title: "AI Understands & Matches",
      body: "HunarMand's AI agent parses your request, extracts the service type, location, time, and complexity, then matches you with the best verified provider nearby.",
    },
    {
      step: "3",
      icon: "person-circle-outline" as const,
      title: "Provider Accepts",
      body: "The matched provider receives a job card and accepts or declines. If they decline, HunarMand automatically finds you the next best match — no waiting.",
    },
    {
      step: "4",
      icon: "shield-checkmark-outline" as const,
      title: "Job Done. Protected.",
      body: "Once the job is complete, you rate the provider. If anything goes wrong, the AI-powered dispute agent steps in to mediate fairly and quickly.",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">About HunarMand</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>H</Text>
          </View>
          <Text style={styles.heroTitle}>HunarMand</Text>
          <Text style={styles.heroTagline}>Pakistan's first AI-powered home services platform</Text>
        </View>

        {/* What is HunarMand */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>What is HunarMand?</Text>
          <Text style={styles.cardBody}>
            HunarMand (حاضر) means "present" — and that is exactly what we do. We connect you instantly with trusted,
            verified home service providers across Islamabad using a conversational AI agent.{"\n\n"}
            No forms, no browsing, no haggling. Just describe your problem in plain language and HunarMand handles the rest.
          </Text>
        </View>

        {/* How It Works */}
        <Text style={styles.sectionLabel}>How It Works</Text>
        {HOW_IT_WORKS.map(({ step, icon, title, body }) => (
          <View key={step} style={[styles.stepCard, Shadows.card]}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{step}</Text>
            </View>
            <View style={styles.stepRight}>
              <View style={styles.stepTitleRow}>
                <Ionicons name={icon} size={18} color={Colors.accent} />
                <Text style={styles.stepTitle}>{title}</Text>
              </View>
              <Text style={styles.stepBody}>{body}</Text>
            </View>
          </View>
        ))}

        {/* AI Agent Note */}
        <View style={[styles.agentCard, Shadows.card]}>
          <Ionicons name="sparkles" size={20} color={Colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.agentTitle}>Powered by AI Agents</Text>
            <Text style={styles.agentBody}>
              HunarMand uses multiple specialised AI agents — one for booking, one for disputes, and one for provider dispatch.
              Each agent runs on Google Gemini and makes decisions that are fair, fast, and transparent.
            </Text>
          </View>
        </View>

        <Text style={styles.version}>HunarMand v1.0.0 — Hackathon Build</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    height: 56,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  backBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  hero: { alignItems: "center", paddingVertical: 24, gap: 10 },
  logoMark: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 28, fontWeight: "700", color: Colors.white },
  heroTitle: { fontSize: 28, fontWeight: "700", color: Colors.primary },
  heroTagline: { fontSize: 14, color: Colors.muted, textAlign: "center", paddingHorizontal: 24 },
  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  cardBody: { fontSize: 14, color: Colors.muted, lineHeight: 22 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: Colors.muted, marginTop: 4 },
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    gap: 14,
  },
  stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center", marginTop: 2 },
  stepNumber: { fontSize: 13, fontWeight: "700", color: Colors.white },
  stepRight: { flex: 1, gap: 6 },
  stepTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  stepBody: { fontSize: 13, color: Colors.muted, lineHeight: 20 },
  agentCard: {
    backgroundColor: Colors.accentVeryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  agentTitle: { fontSize: 14, fontWeight: "600", color: Colors.primary, marginBottom: 4 },
  agentBody: { fontSize: 13, color: Colors.muted, lineHeight: 20 },
  version: { fontSize: 11, color: Colors.muted, textAlign: "center" },
});
