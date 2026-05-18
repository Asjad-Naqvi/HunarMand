import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

const AgentBubble: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.agentBubbleWrapper}>
    <View style={[styles.agentBubble, Shadows.card]}>
      <Text style={styles.agentText}>{text}</Text>
    </View>
  </View>
);

const ProviderBubble: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.providerBubbleWrapper}>
    <View style={styles.providerBubble}>
      <Text style={styles.providerText}>{text}</Text>
    </View>
  </View>
);

const OptionButton: React.FC<{ label: string; selected: boolean; onSelect: () => void }> = ({ label, selected, onSelect }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onSelect}
    style={[styles.optionBtn, selected && styles.optionBtnSelected]}
  >
    <Text style={[styles.optionBtnText, selected && styles.optionBtnTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const DisputeTypeCard: React.FC = () => {
  const [selected, setSelected] = useState<"absent" | "payment">("absent");
  return (
    <View style={[styles.card, Shadows.card]}>
      <Text style={styles.cardTitle}>Select your dispute type:</Text>
      <View style={styles.optionsWrap}>
        <OptionButton
          label="Consumer was not present at the scheduled time"
          selected={selected === "absent"}
          onSelect={() => setSelected("absent")}
        />
        <OptionButton
          label="Consumer refused to pay the agreed amount"
          selected={selected === "payment"}
          onSelect={() => setSelected("payment")}
        />
      </View>
    </View>
  );
};

const ContactCard: React.FC = () => {
  const [selected, setSelected] = useState<"called" | "messaged" | "no">("called");
  const options: { id: "called" | "messaged" | "no"; label: string }[] = [
    { id: "called", label: "Yes, called twice" },
    { id: "messaged", label: "Yes, messaged" },
    { id: "no", label: "No" },
  ];
  return (
    <View style={[styles.card, Shadows.card]}>
      <Text style={styles.cardTitle}>Did you attempt to contact the consumer?</Text>
      <View style={styles.optionsWrap}>
        {options.map(({ id, label }) => (
          <OptionButton key={id} label={label} selected={selected === id} onSelect={() => setSelected(id as any)} />
        ))}
      </View>
    </View>
  );
};

export const HzProviderDisputeChat: React.FC = () => {
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
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Job Context Strip */}
      <View style={styles.contextStrip}>
        <Text style={styles.contextText}>AC Repairing · Sana Malik · Sat 18 May</Text>
        <Text style={styles.contextSub}>Booking #1042</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "android" ? "padding" : "height"}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <AgentBubble text="Zain bhai, kya masla hua? Main aapki complaint properly file karta hoon. Neeche se issue select karein." />
          <DisputeTypeCard />
          <ProviderBubble text="Consumer waqt par nahi tha. Mein 30 minute wait kiya, koi nahi aya." />
          <AgentBubble text="Theek hai. Kya aapne consumer ko call/message kiya waqt par pahunchne se pehle?" />
          <ContactCard />
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Add more detail..."
            placeholderTextColor={Colors.muted}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => router.replace("/(provider)/dispute-status")} activeOpacity={0.8}>
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
  contextText: { fontSize: 13, color: Colors.primary },
  contextSub: { fontSize: 12, color: Colors.muted },

  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },

  agentBubbleWrapper: { alignItems: "flex-start" },
  agentBubble: { maxWidth: "80%", backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderTopLeftRadius: 4, padding: 16 },
  agentText: { fontSize: 15, lineHeight: 22, color: Colors.primary },
  
  providerBubbleWrapper: { alignItems: "flex-end" },
  providerBubble: { maxWidth: "80%", backgroundColor: Colors.accent, borderRadius: 18, borderTopRightRadius: 4, padding: 16 },
  providerText: { fontSize: 15, lineHeight: 22, color: Colors.white },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: "500", color: Colors.primary },
  optionsWrap: { marginTop: 8, gap: 8 },
  optionBtn: { width: "100%", minHeight: 48, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 },
  optionBtnSelected: { backgroundColor: Colors.accent, borderWidth: 0 },
  optionBtnText: { fontSize: 14, fontWeight: "500", color: Colors.primary },
  optionBtnTextSelected: { color: Colors.white },

  inputBar: { height: 56, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 },
  input: { flex: 1, height: 40, fontSize: 15, color: Colors.primary },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
});
