import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Radius, Shadows } from "../../constants/theme";

/* ─── Thinking block ─── */
const ThinkingBlock: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const heightValue = useSharedValue(54); // Closed height approx

  useEffect(() => {
    heightValue.value = withTiming(expanded ? 120 : 54, { duration: 300 });
  }, [expanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
  }));

  const fullText = "Parsing consumer input... Detected: AC not working → HS-04 (AC Repairing). Severity signals: 'bilkul kaam nahi kar raha' → +1 complexity tier → Intermediate → Complex. Requested slot: tomorrow morning. Location: G-13...";

  return (
    <Animated.View style={[styles.thinkingBlock, animatedStyle]}>
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.7}
        style={styles.thinkingHeader}
      >
        <Ionicons name="sparkles" size={16} color={Colors.accent} />
        <Text style={styles.thinkingTitle}>Haazir's Reasoning — Intent Extraction</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.muted} />
      </TouchableOpacity>
      
      <Text
        numberOfLines={expanded ? undefined : 2}
        style={styles.thinkingText}
      >
        {fullText}
      </Text>
      
      {!expanded && (
        <TouchableOpacity onPress={() => setExpanded(true)} style={{ marginTop: 4 }}>
          <Text style={styles.thinkingMore}>Show more ↓</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/* ─── Clarification card ─── */
const ClarificationCard: React.FC = () => {
  const [selected, setSelected] = useState<"residential" | "commercial">("residential");

  return (
    <View style={[styles.clarificationCard, Shadows.card]}>
      <Text style={styles.clarificationTitle}>Is this for residential or commercial use?</Text>
      <View style={{ marginTop: 12, gap: 8 }}>
        {[
          { id: "residential" as const, label: "Ghar (Residential)" },
          { id: "commercial" as const,  label: "Office / Commercial" },
        ].map(({ id, label }) => {
          const isSelected = selected === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSelected(id)}
              activeOpacity={0.8}
              style={[styles.clarificationOption, isSelected && styles.clarificationOptionSelected]}
            >
              <Text style={[styles.clarificationLabel, isSelected && styles.clarificationLabelSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/* ─── Agent bubble ─── */
const AgentBubble: React.FC<{ text: string; time?: string }> = ({ text, time }) => (
  <View style={styles.agentBubbleWrapper}>
    <View style={styles.agentBubble}>
      <Text style={styles.agentText}>{text}</Text>
      {time && <Text style={styles.agentTime}>{time}</Text>}
    </View>
  </View>
);

/* ─── Consumer bubble ─── */
const ConsumerBubble: React.FC<{ text: string; time?: string }> = ({ text, time }) => (
  <View style={styles.consumerBubbleWrapper}>
    <View style={styles.consumerBubble}>
      <Text style={styles.consumerText}>{text}</Text>
      {time && <Text style={styles.consumerTime}>{time}</Text>}
    </View>
  </View>
);

/* ─── Re-initiate search card ─── */
const ReinitiateCard: React.FC = () => {
  const router = useRouter();
  
  return (
    <View style={[styles.reinitiateCard, Shadows.card]}>
      <View style={{ alignSelf: "flex-start" }}>
        <Text style={styles.reinitiateBadge}>Provider Declined</Text>
      </View>
      <Text style={styles.reinitiateTitle}>Looking for another provider?</Text>
      
      <View style={{ marginTop: 12 }}>
        {[
          { label: "Service",    value: "AC Repairing"         },
          { label: "Location",   value: "G-13, Islamabad"       },
          { label: "Date & Time", value: "Sat 18 May · 9:00 AM" },
        ].map(({ label, value }, i, arr) => (
          <View key={label} style={[styles.reinitiateRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={styles.reinitiateRowLabel}>{label}</Text>
            <Text style={styles.reinitiateRowValue}>{value}</Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.reinitiateHint}>Usman Butt declined this request. He has been excluded from this search.</Text>
      
      <TouchableOpacity
        onPress={() => router.push("/search-results")}
        activeOpacity={0.8}
        style={styles.reinitiateBtn}
      >
        <Text style={styles.reinitiateBtnText}>Find Another Provider</Text>
      </TouchableOpacity>
      
      <TouchableOpacity activeOpacity={0.7} style={styles.reinitiateCancel}>
        <Text style={styles.reinitiateCancelText}>Cancel and start a new search</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ─── Main screen ─── */
export const HzChatScreen: React.FC = () => {
  const router = useRouter();
  const [thinkingOn, setThinkingOn] = useState(false);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top app bar */}
      <View style={styles.topBar}>
        <View style={styles.logoGroup}>
          <View style={styles.logoMark}><Text style={styles.logoLetter}>H</Text></View>
          <Text style={styles.wordmark}>Haazir</Text>
        </View>

        <TouchableOpacity
          onPress={() => setThinkingOn(v => !v)}
          activeOpacity={0.8}
          style={[styles.thinkingToggle, thinkingOn && styles.thinkingToggleOn]}
        >
          {thinkingOn && <Ionicons name="sparkles" size={12} color={Colors.accent} />}
          <Text style={[styles.thinkingToggleText, thinkingOn && styles.thinkingToggleTextOn]}>
            {thinkingOn ? "Thinking On" : "Thinking Off"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active booking banner */}
      <View style={styles.activeBanner}>
        <Text style={styles.activeBannerText}>Active Job · AC Repair · Ali Hassan</Text>
        <TouchableOpacity onPress={() => router.push("/(consumer)/active-job")} activeOpacity={0.7}>
          <Text style={styles.activeBannerLink}>View →</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "android" ? "padding" : "height"}>
        {/* Chat scroll area */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <AgentBubble text="Assalam o Alaikum! Main Haazir hoon. Aapko kaunsi service chahiye? Bas batayein — Urdu mein, English mein, ya jis tarah chaahein." time="2:14 PM" />
          <ConsumerBubble text="AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye" time="2:15 PM" />
          {thinkingOn && <ThinkingBlock />}
          <AgentBubble text="Samajh gaya! Lagta hai aapka AC completely band hai. Main aapke liye G-13 mein best AC technician dhundh raha hoon. Ek cheez confirm karein:" />
          <ClarificationCard />
          <ConsumerBubble text="Ghar ke liye hai." time="2:16 PM" />
          <AgentBubble text="G-13 mein AC technician mil gaya — Usman Butt. Booking request bhej diya hai." time="2:16 PM" />
          <ReinitiateCard />
        </ScrollView>

        {/* Chat input bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Message Haazir..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={Colors.muted}
            style={styles.input}
          />
          <TouchableOpacity activeOpacity={0.8} style={styles.sendBtn}>
            <Ionicons name="arrow-up" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <HzBottomNav role="consumer" activeTab="chat" />
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
  },
  logoGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 16, fontWeight: "600", color: Colors.white, lineHeight: 20 },
  wordmark: { fontSize: 17, fontWeight: "600", color: Colors.primary },
  thinkingToggle: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 6 },
  thinkingToggleOn: { backgroundColor: Colors.accentVeryLight, borderWidth: 1, borderColor: Colors.accent },
  thinkingToggleText: { fontSize: 12, fontWeight: "500", color: Colors.muted },
  thinkingToggleTextOn: { color: Colors.accent },
  activeBanner: { height: 48, backgroundColor: Colors.accentLight, borderLeftWidth: 4, borderLeftColor: Colors.accent, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  activeBannerText: { fontSize: 13, fontWeight: "500", color: Colors.primary },
  activeBannerLink: { fontSize: 13, fontWeight: "500", color: Colors.accent },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, gap: 16 },
  
  // Thinking block
  thinkingBlock: { backgroundColor: Colors.thinking, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: Colors.accent, padding: 16, overflow: "hidden" },
  thinkingHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  thinkingTitle: { flex: 1, fontSize: 12, fontWeight: "600", color: Colors.primary },
  thinkingText: { marginTop: 8, fontSize: 12, fontStyle: "italic", lineHeight: 18, color: "#555555" },
  thinkingMore: { fontSize: 12, fontWeight: "500", color: Colors.accent },

  // Bubbles
  agentBubbleWrapper: { alignItems: "flex-start" },
  agentBubble: { maxWidth: "80%", backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderTopLeftRadius: 4, padding: 16, ...Shadows.card },
  agentText: { fontSize: 15, fontWeight: "400", lineHeight: 22, color: Colors.primary },
  agentTime: { marginTop: 4, fontSize: 11, color: Colors.muted, textAlign: "right" },
  consumerBubbleWrapper: { alignItems: "flex-end" },
  consumerBubble: { maxWidth: "80%", backgroundColor: Colors.accent, borderRadius: 18, borderTopRightRadius: 4, padding: 16 },
  consumerText: { fontSize: 15, fontWeight: "400", lineHeight: 22, color: Colors.white },
  consumerTime: { marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.7)", textAlign: "right" },

  // Clarification
  clarificationCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  clarificationTitle: { fontSize: 15, fontWeight: "500", lineHeight: 22, color: Colors.primary },
  clarificationOption: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  clarificationOptionSelected: { backgroundColor: Colors.accent, borderWidth: 0 },
  clarificationLabel: { fontSize: 14, fontWeight: "500", color: Colors.primary },
  clarificationLabelSelected: { color: Colors.white },

  // Reinitiate
  reinitiateCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  reinitiateBadge: { backgroundColor: Colors.warning, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: "500", color: Colors.white },
  reinitiateTitle: { marginTop: 12, fontSize: 16, fontWeight: "600", color: Colors.primary },
  reinitiateRow: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  reinitiateRowLabel: { fontSize: 13, color: Colors.muted },
  reinitiateRowValue: { fontSize: 14, color: Colors.primary },
  reinitiateHint: { marginTop: 12, fontSize: 12, fontStyle: "italic", color: Colors.muted },
  reinitiateBtn: { marginTop: 16, height: 48, borderRadius: 12, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  reinitiateBtnText: { fontSize: 14, fontWeight: "600", color: Colors.white },
  reinitiateCancel: { marginTop: 8, alignItems: "center", paddingVertical: 8 },
  reinitiateCancelText: { fontSize: 13, color: Colors.muted },

  // Input bar
  inputBar: { height: 56, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 },
  input: { flex: 1, fontSize: 15, color: Colors.primary, height: 40 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
});
