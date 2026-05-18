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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { Colors, Radius, Shadows } from "../../constants/theme";
import { useAuth } from "../../../lib/AuthContext";

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  reasoning?: string;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

/* ─── Thinking Block ─── */
const ThinkingBlock: React.FC<{ reasoning: string }> = ({ reasoning }) => {
  const [expanded, setExpanded] = useState(false);
  const heightValue = useSharedValue(54); // Closed height

  useEffect(() => {
    heightValue.value = withTiming(expanded ? 200 : 54, { duration: 300 });
  }, [expanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
  }));

  return (
    <Animated.View style={[styles.thinkingBlock, animatedStyle]}>
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.7}
        style={styles.thinkingHeader}
      >
        <Ionicons name="sparkles" size={16} color={Colors.accent} />
        <Text style={styles.thinkingTitle}>Haazir's Onboarding Engine — Extraction</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.muted} />
      </TouchableOpacity>
      
      <ScrollView nestedScrollEnabled style={{ flex: 1, marginTop: 8 }}>
        <Text
          numberOfLines={expanded ? undefined : 2}
          style={styles.thinkingText}
        >
          {reasoning}
        </Text>
      </ScrollView>
      
      {!expanded && (
        <TouchableOpacity onPress={() => setExpanded(true)} style={{ marginTop: 4 }}>
          <Text style={styles.thinkingMore}>Show more ↓</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/* ─── Agent Bubble ─── */
const AgentBubble: React.FC<{ text: string; time?: string; reasoning?: string }> = ({
  text,
  time,
  reasoning,
}) => (
  <View style={styles.agentBubbleWrapper}>
    {reasoning ? <ThinkingBlock reasoning={reasoning} /> : null}
    <View style={[styles.agentBubble, Shadows.card]}>
      <Text style={styles.agentText}>{text}</Text>
      {time && <Text style={styles.agentTime}>{time}</Text>}
    </View>
  </View>
);

/* ─── Consumer/Provider Bubble ─── */
const ConsumerBubble: React.FC<{ text: string; time?: string }> = ({ text, time }) => (
  <View style={styles.consumerBubbleWrapper}>
    <View style={styles.consumerBubble}>
      <Text style={styles.consumerText}>{text}</Text>
      {time && <Text style={styles.consumerTime}>{time}</Text>}
    </View>
  </View>
);

export const HzProviderOnboardingChat: React.FC = () => {
  const router = useRouter();
  const { user, refreshProfile, signInBypass } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  // Clear agent session and initialize personalized welcome message on mount
  useEffect(() => {
    const clearSession = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/agent/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.warn("Failed to reset backend onboarding chat session:", err);
      }
    };
    clearSession();

    const nameStr = user?.name ? ` ${user.name}` : "";
    const phoneStr = user?.phone ? ` (${user.phone})` : "";
    setMessages([
      {
        id: "welcome",
        sender: "agent",
        text: `Assalam o Alaikum${nameStr}! Haazir Partner network mein khush aamdeed. Main aapko register karne mein madad karunga.\n\nAapka phone number${phoneStr} hai. Mujhe aapka sector coverage (e.g. G-13), service (e.g. electrician) aur per-job rate batayein taake main aapki registration mukammal kar sakoon!`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    ]);
  }, [user]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessageText = message;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Add user message to state
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userMessageText,
      time: timestamp,
    };
    setMessages(prev => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      // Post user message to backend agent endpoint with mode 'provider'
      const response = await fetch(`${BACKEND_URL}/api/agent/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          mode: "provider",
          user_id: user?.id || "test_provider_user",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponseText = data.response || "No response received.";

        // Premium parsing of the reasoning segment
        let mainText = aiResponseText;
        let reasoningText = "";

        const thinkingMarkers = [
          "Show Haazir's Thinking:",
          "**Show Haazir's Thinking:**",
          "Show Haazir's Thinking",
        ];

        let foundMarker = "";
        for (const marker of thinkingMarkers) {
          if (aiResponseText.includes(marker)) {
            foundMarker = marker;
            break;
          }
        }

        if (foundMarker) {
          const markerIndex = aiResponseText.indexOf(foundMarker);
          const preText = aiResponseText.substring(0, markerIndex).trim();
          const postText = aiResponseText.substring(markerIndex).trim();
          
          // Split postText into lines to separate list items from final paragraph
          const lines = postText.split("\n");
          const thinkingLines: string[] = [];
          const replyLines: string[] = [];
          
          let collectingThinking = true;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (i === 0) {
              thinkingLines.push(line);
              continue;
            }
            
            if (collectingThinking) {
              const isListPoint = /^\d+\./.test(trimmed) || trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed === "";
              if (!isListPoint && trimmed.length > 0 && !trimmed.toLowerCase().includes("thinking")) {
                collectingThinking = false;
                replyLines.push(line);
              } else {
                thinkingLines.push(line);
              }
            } else {
              replyLines.push(line);
            }
          }
          
          reasoningText = thinkingLines.join("\n").trim();
          const extractedReply = replyLines.join("\n").trim();
          mainText = preText ? (preText + "\n\n" + extractedReply).trim() : extractedReply;
        }

        if (reasoningText && !mainText.trim()) {
          mainText = "Onboarding registration process completed successfully!";
        }

        const agentMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: mainText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          reasoning: reasoningText || undefined,
        };
        setMessages(prev => [...prev, agentMsg]);

        // Detect if the agent confirmed successful registration
        const successKeywords = ["successfully registered", "registration mukammal", "register ho gaye", "register kar diya", "Successfully registered"];
        const lowerMain = mainText.toLowerCase();
        if (successKeywords.some(kw => lowerMain.includes(kw.toLowerCase()))) {
          setOnboardingDone(true);
          // Update the bypass session so RouteGuard won't redirect back to onboarding
          if (user) {
            await signInBypass({ ...user, isOnboarded: true });
          }
        }
      } else {
        const agentMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: `Server validation error: ${response.status}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages(prev => [...prev, agentMsg]);
      }
    } catch (err) {
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: "Main network request complete nahi kar pa raha. Please check connection.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, agentMsg]);
    } finally {
      setLoading(false);
      // Auto scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoGroup}>
          <TouchableOpacity 
            onPress={async () => {
              // Mark as onboarded so RouteGuard allows navigation to dashboard
              if (user) {
                await signInBypass({ ...user, isOnboarded: true });
              }
              router.replace("/(provider)/dashboard");
            }} 
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.logoMark}><Text style={styles.logoLetter}>H</Text></View>
          <Text style={styles.wordmark}>Partner Onboarding</Text>
        </View>
        {onboardingDone && (
          <TouchableOpacity
            onPress={async () => {
              if (user) await signInBypass({ ...user, isOnboarded: true });
              router.replace("/(provider)/dashboard");
            }}
            style={{ backgroundColor: "#4CAF50", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Dashboard →</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            m.sender === "agent" ? (
              <AgentBubble key={m.id} text={m.text} time={m.time} reasoning={m.reasoning} />
            ) : (
              <ConsumerBubble key={m.id} text={m.text} time={m.time} />
            )
          ))}
          
          {loading && (
            <View style={styles.agentBubbleWrapper}>
              <View style={[styles.agentBubble, styles.loadingBubble, Shadows.card]}>
                <ActivityIndicator color={Colors.accent} size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type your message here..."
            placeholderTextColor={Colors.muted}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!message.trim() || loading}
          >
            <Ionicons name="send" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  logoGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { marginRight: 4 },
  logoMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 16, fontWeight: "600", color: Colors.white, lineHeight: 20 },
  wordmark: { fontSize: 17, fontWeight: "700", color: Colors.primary },

  scroll: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 24, gap: 16 },

  agentBubbleWrapper: { alignItems: "flex-start", width: "100%", marginVertical: 4 },
  agentBubble: { maxWidth: "80%", backgroundColor: Colors.white, borderRadius: 16, borderTopLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: Colors.border },
  agentText: { fontSize: 15, color: Colors.primary, lineHeight: 22 },
  agentTime: { fontSize: 10, color: Colors.muted, marginTop: 4, textAlign: "right" },

  consumerBubbleWrapper: { alignItems: "flex-end", width: "100%", marginVertical: 4 },
  consumerBubble: { maxWidth: "80%", backgroundColor: Colors.accent, borderRadius: 16, borderTopRightRadius: 4, padding: 12 },
  consumerText: { fontSize: 15, color: Colors.white, lineHeight: 22 },
  consumerTime: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 4, textAlign: "right" },

  loadingBubble: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: "center", alignItems: "center" },

  thinkingBlock: {
    width: "80%",
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accentBorder || Colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  thinkingHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  thinkingTitle: { flex: 1, fontSize: 13, fontWeight: "600", color: Colors.accent },
  thinkingText: { fontSize: 12, color: Colors.primary, lineHeight: 18, marginTop: 4 },
  thinkingMore: { fontSize: 11, fontWeight: "600", color: Colors.accent, marginTop: 4 },

  inputBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, height: 40, backgroundColor: Colors.bg, borderRadius: 20, paddingHorizontal: 16, fontSize: 15, color: Colors.primary },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
