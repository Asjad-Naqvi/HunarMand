import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Shadows } from "../../constants/theme";

/* ─── Agent bubble ─── */
const AgentBubble: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.agentBubbleWrapper}>
    <View style={[styles.agentBubble, Shadows.card]}>
      <Text style={styles.agentText}>{text}</Text>
    </View>
  </View>
);

/* ─── Consumer bubble ─── */
const ConsumerBubble: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.consumerBubbleWrapper}>
    <View style={styles.consumerBubble}>
      <Text style={styles.consumerText}>{text}</Text>
    </View>
  </View>
);

/* ─── Dispute type card ─── */
const DisputeTypeCard: React.FC = () => {
  const [selected, setSelected] = useState<"quality" | "incomplete">("quality");
  const options = [
    { id: "quality" as const,    label: "The work quality was not acceptable" },
    { id: "incomplete" as const, label: "The provider did not complete the job" },
  ];

  return (
    <View style={styles.optionCard}>
      <Text style={styles.optionTitle}>Dispute Type</Text>
      <View style={{ marginTop: 8, gap: 8 }}>
        {options.map(({ id, label }) => {
          const isSelected = selected === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSelected(id)}
              activeOpacity={0.8}
              style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
            >
              <Text style={[styles.optionBtnText, isSelected && styles.optionBtnTextSelected]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/* ─── Follow-up card ─── */
const FollowUpCard: React.FC = () => {
  const [selected, setSelected] = useState<"yes" | "no" | "refused">("yes");
  const options = [
    { id: "yes" as const,     label: "Yes" },
    { id: "no" as const,      label: "No" },
    { id: "refused" as const, label: "They refused" },
  ];

  return (
    <View style={styles.optionCard}>
      <Text style={styles.optionTitle}>Did the provider agree to fix the issue on-site?</Text>
      <View style={{ marginTop: 8, gap: 8 }}>
        {options.map(({ id, label }) => {
          const isSelected = selected === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSelected(id)}
              activeOpacity={0.8}
              style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
            >
              <Text style={[styles.optionBtnText, isSelected && styles.optionBtnTextSelected]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/* ─── Main screen ─── */
export const HzDisputeChatScreen: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Report an Issue</Text>
        <TouchableOpacity onPress={() => router.push("/(consumer)/dispute-status")} style={styles.iconBtn}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Context strip */}
      <View style={styles.contextStrip}>
        <Text style={styles.contextPrimary}>AC Repairing · Ali Hassan · Sat 18 May</Text>
        <Text style={styles.contextSecondary}>Booking #1042</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "android" ? "padding" : "height"}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <AgentBubble text="Main Haazir hoon. Aapka kaunsa masla hai? Mujhe batayein taake main aapki complaint properly file kar sakoon." />
          <DisputeTypeCard />
          <AgentBubble text="Theek hai, aapko quality se masla tha. Kya specifically galat tha? Please detail mein batayein." />
          <ConsumerBubble text="AC gas fill kiya tha lekin abhi bhi thanda nahi kar raha. Koi improvement nahi." />
          <FollowUpCard />
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            placeholder="Describe the issue..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={Colors.muted}
            style={styles.input}
          />
          <TouchableOpacity activeOpacity={0.8} style={styles.sendBtn}>
            <Ionicons name="arrow-up" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },
  
  contextStrip: { height: 48, backgroundColor: Colors.accentLight, borderBottomWidth: 1, borderBottomColor: Colors.accent, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  contextPrimary: { fontSize: 13, color: Colors.primary },
  contextSecondary: { fontSize: 12, color: Colors.muted },

  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },

  // Bubbles
  agentBubbleWrapper: { alignItems: "flex-start" },
  agentBubble: { maxWidth: "80%", backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderTopLeftRadius: 4, padding: 16 },
  agentText: { fontSize: 15, lineHeight: 22, color: Colors.primary },
  
  consumerBubbleWrapper: { alignItems: "flex-end" },
  consumerBubble: { maxWidth: "80%", backgroundColor: Colors.accent, borderRadius: 18, borderTopRightRadius: 4, padding: 16 },
  consumerText: { fontSize: 15, lineHeight: 22, color: Colors.white },

  // Cards
  optionCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  optionTitle: { fontSize: 15, fontWeight: "500", color: Colors.primary },
  optionBtn: { minHeight: 48, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 },
  optionBtnSelected: { backgroundColor: Colors.accent, borderWidth: 0 },
  optionBtnText: { fontSize: 14, fontWeight: "500", color: Colors.primary },
  optionBtnTextSelected: { color: Colors.white },

  // Input
  inputBar: { height: 56, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.primary, height: 40 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
});
