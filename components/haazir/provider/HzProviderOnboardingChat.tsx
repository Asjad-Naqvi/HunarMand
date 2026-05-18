import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Keyboard, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

const StepStrip: React.FC<{ step: number; total: number; stepName: string }> = ({ step, total, stepName }) => (
  <View style={styles.stepStrip}>
    <View style={styles.stepRow}>
      <Text style={styles.stepText}>Step {step} of {total}</Text>
      <View style={styles.stepBarBg}>
        <View style={[styles.stepBarFill, { width: `${(step / total) * 100}%` }]} />
      </View>
    </View>
    <Text style={styles.stepName}>{stepName}</Text>
  </View>
);

const AgentBubble: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.agentBubbleWrapper}>
    <View style={[styles.agentBubble, Shadows.card]}>
      <Text style={styles.agentText}>{text}</Text>
    </View>
  </View>
);

const ConsumerBubble: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.consumerBubbleWrapper}>
    <View style={styles.consumerBubble}>
      <Text style={styles.consumerText}>{text}</Text>
    </View>
  </View>
);

const ServiceChip: React.FC<{ label: string; selected: boolean; onToggle: () => void }> = ({ label, selected, onToggle }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onToggle}
    style={[styles.chip, selected && styles.chipSelected]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const HOME_SERVICES = ["AC Repairing", "AC General Service", "AC Installation", "Carpenter Work", "Electrician", "Plumber"];
const CLEANING_SERVICES = ["Sofa Cleaning", "Carpet Cleaning", "Solar Panel Cleaning", "Bed Cleaning"];

const ServiceSelectionCard: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(["AC Repairing", "AC General Service"]));

  const toggle = (s: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  return (
    <View style={[styles.optionCard, Shadows.card]}>
      <Text style={styles.optionSectionTitle}>Home Services</Text>
      <View style={styles.chipGroup}>
        {HOME_SERVICES.map(s => <ServiceChip key={s} label={s} selected={selected.has(s)} onToggle={() => toggle(s)} />)}
      </View>

      <Text style={[styles.optionSectionTitle, { marginTop: 16 }]}>Cleaning Services</Text>
      <View style={styles.chipGroup}>
        {CLEANING_SERVICES.map(s => <ServiceChip key={s} label={s} selected={selected.has(s)} onToggle={() => toggle(s)} />)}
      </View>

      <View style={styles.divider} />
      <View style={styles.footerRow}>
        <Text style={styles.selectedCount}>{selected.size} services selected</Text>
        <TouchableOpacity onPress={onConfirm}>
          <Text style={styles.confirmBtnText}>Confirm →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MIN_INPUT_HEIGHT = 40;
const MAX_INPUT_HEIGHT = 120;

export const HzProviderOnboardingChat: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const [keyboardPad, setKeyboardPad] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardPad(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardPad(0)
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <Text style={styles.title}>Provider Registration</Text>
      </View>

      <StepStrip step={4} total={9} stepName="Services Offered" />

      {/* Content — paddingBottom drives keyboard avoidance manually */}
      <View style={{ flex: 1, paddingBottom: keyboardPad }}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <AgentBubble text="Shukriya, Zain! Step 4: Aap kaunsi services offer karte hain? Neeche se select karein — aap multiple select kar sakte hain." />
          <ServiceSelectionCard onConfirm={() => router.replace("/dashboard")} />
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            placeholder="Type or select an option above..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={Colors.muted}
            style={[styles.input, { height: inputHeight }]}
            multiline
            maxLength={1000}
            blurOnSubmit={false}
            textAlignVertical="top"
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height;
              setInputHeight(Math.min(Math.max(h, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT));
            }}
          />
          <TouchableOpacity activeOpacity={0.8} style={styles.sendBtn}>
            <Ionicons name="arrow-up" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },
  
  stepStrip: { height: 48, backgroundColor: Colors.accentLight, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", paddingHorizontal: 16 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepText: { fontSize: 13, fontWeight: "500", color: Colors.muted },
  stepBarBg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: "hidden" },
  stepBarFill: { height: "100%", backgroundColor: Colors.accent, borderRadius: 2 },
  stepName: { marginTop: 4, fontSize: 11, color: Colors.muted },

  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },

  agentBubbleWrapper: { alignItems: "flex-start" },
  agentBubble: { maxWidth: "80%", backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderTopLeftRadius: 4, padding: 16 },
  agentText: { fontSize: 15, lineHeight: 22, color: Colors.primary },
  
  consumerBubbleWrapper: { alignItems: "flex-end" },
  consumerBubble: { maxWidth: "80%", backgroundColor: Colors.accent, borderRadius: 18, borderTopRightRadius: 4, padding: 16 },
  consumerText: { fontSize: 15, lineHeight: 22, color: Colors.white },

  optionCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  optionSectionTitle: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  chipGroup: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, justifyContent: "center" },
  chipSelected: { backgroundColor: Colors.accent, borderWidth: 0 },
  chipText: { fontSize: 13, fontWeight: "500", color: Colors.primary },
  chipTextSelected: { color: Colors.white },

  divider: { height: 1, backgroundColor: Colors.divider, marginTop: 12 },
  footerRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectedCount: { fontSize: 12, color: Colors.muted },
  confirmBtnText: { fontSize: 13, fontWeight: "500", color: Colors.accent },

  inputBar: {
    minHeight: 56,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.primary,
    maxHeight: 120,
    paddingTop: Platform.OS === "ios" ? 8 : 4,
    paddingBottom: Platform.OS === "ios" ? 8 : 4,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
