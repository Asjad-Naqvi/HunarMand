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
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  reasoning?: string;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.1.16:5000";

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
        <Text style={styles.thinkingTitle}>HunarMand's Onboarding Engine — Extraction</Text>
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

/* ─── Assistant Message Parser Helper ─── */
const parseAgentMessage = (aiResponseText: string) => {
  let mainText = aiResponseText;
  let reasoningText = "";

  const thinkingMarkers = [
    "Show Hunar's Thinking:",
    "**Show Hunar's Thinking:**",
    "Show Hunar's Thinking",
    "Show Hunar’s Thinking:",
    "**Show Hunar’s Thinking:**",
    "Show Hunar’s Thinking",
    "Hunar's Thinking:",
    "**Hunar's Thinking:**",
    "Hunar's Thinking",
    "Hunar’s Thinking:",
    "**Hunar’s Thinking:**",
    "Hunar’s Thinking",
  ];

  let markerIndex = -1;
  const lowerText = aiResponseText.toLowerCase();

  for (const marker of thinkingMarkers) {
    const idx = lowerText.indexOf(marker.toLowerCase());
    if (idx !== -1) {
      if (markerIndex === -1 || idx < markerIndex) {
        markerIndex = idx;
      }
    }
  }

  if (markerIndex !== -1) {
    const preText = aiResponseText.substring(0, markerIndex).trim();
    const postText = aiResponseText.substring(markerIndex).trim();
    reasoningText = postText;
    mainText = preText;
  }

  if (reasoningText && !mainText.trim()) {
    mainText = "Onboarding registration process completed successfully!";
  }

  return {
    text: mainText,
    reasoning: reasoningText || undefined,
  };
};

export const HzProviderOnboardingChat: React.FC = () => {
  const router = useRouter();
  const { user, refreshProfile, signInBypass } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  // ── Helper: save current message list to device storage ──────────────────
  const persistMessages = async (msgs: ChatMessage[]) => {
    try {
      const storageKey = `hunarmand_chat_history_provider_${user?.id || "anonymous"}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch (err) {
      console.warn("Failed to persist onboarding chat history:", err);
    }
  };

  // ── Load history on mount: AsyncStorage first, then backend fallback ──────
  useEffect(() => {
    const initChat = async () => {
      const nameStr = user?.name ? ` ${user.name}` : "";
      const phoneStr = user?.phone ? ` (${user.phone})` : "";
      const defaultWelcome: ChatMessage = {
        id: "welcome",
        sender: "agent",
        text: `Assalam o Alaikum${nameStr}! HunarMand Partner network mein khush aamdeed. Main aapko register karne mein madad karunga.\n\nAapka phone number${phoneStr} hai. Mujhe aapka sector coverage (e.g. G-13), service (e.g. electrician) aur per-job rate batayein taake main aapki registration mukammal kar sakoon!`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const storageKey = `hunarmand_chat_history_provider_${user?.id || "anonymous"}`;

      // 1. Try to load instantly from device cache
      try {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached) {
          const cachedMsgs: ChatMessage[] = JSON.parse(cached);
          if (cachedMsgs.length > 1) {
            setMessages(cachedMsgs);
            
            // Check if cached chat already had onboarding completed
            const successKeywords = ["successfully registered", "registration mukammal", "register ho gaye", "register kar diya", "Successfully registered"];
            let foundConfirmation = false;
            for (const msg of cachedMsgs) {
              if (msg.sender === "agent") {
                const lowerText = msg.text.toLowerCase();
                if (successKeywords.some(kw => lowerText.includes(kw.toLowerCase()))) {
                  foundConfirmation = true;
                }
              }
            }
            if (foundConfirmation) {
              setOnboardingDone(true);
            }

            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
            return; // We have local cache — no need to hit the backend
          }
        }
      } catch (err) {
        console.warn("Failed to read cached onboarding history:", err);
      }

      // 2. Fetch from backend (first visit or backup restore)
      try {
        const userId = user?.id || "anonymous";
        const response = await fetch(
          `${BACKEND_URL}/api/agent/history?mode=provider&user_id=${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          const history = data.history || [];
          
          if (history.length > 1) {
            const parsedMessages: ChatMessage[] = [defaultWelcome];
            let idCounter = 1;
            let foundConfirmation = false;
            for (const item of history) {
              // We skip system role messages and tool execution logs
              if (item.role === "system" || item.role === "tool") continue;
              
              if (item.role === "user" && item.content) {
                parsedMessages.push({
                  id: `history_user_${idCounter++}`,
                  sender: "user",
                  text: item.content,
                  time: "",
                });
              } else if (item.role === "assistant" && item.content) {
                const parsed = parseAgentMessage(item.content);
                parsedMessages.push({
                  id: `history_agent_${idCounter++}`,
                  sender: "agent",
                  text: parsed.text,
                  reasoning: parsed.reasoning,
                  time: "",
                });

                // Check if this historic response confirmed successful registration
                const successKeywords = ["successfully registered", "registration mukammal", "register ho gaye", "register kar diya", "Successfully registered"];
                const lowerMain = parsed.text.toLowerCase();
                if (successKeywords.some(kw => lowerMain.includes(kw.toLowerCase()))) {
                  foundConfirmation = true;
                }
              }
            }
            setMessages(parsedMessages);
            persistMessages(parsedMessages);
            if (foundConfirmation) {
              setOnboardingDone(true);
            }
            
            // Auto scroll to bottom
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({ animated: false });
            }, 150);
          } else {
            setMessages([defaultWelcome]);
          }
        } else {
          setMessages([defaultWelcome]);
        }
      } catch (err) {
        console.warn("Failed to load onboarding history:", err);
        setMessages([defaultWelcome]);
      }
    };
    initChat();
  }, [user?.id]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessageText = message;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Add user message to state and persist immediately
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userMessageText,
      time: timestamp,
    };
    setMessages(prev => {
      const updated = [...prev, userMsg];
      persistMessages(updated);
      return updated;
    });
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
          user_id: user?.id || "anonymous",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponseText = data.response || "No response received.";
        const parsed = parseAgentMessage(aiResponseText);

        const agentMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: parsed.text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          reasoning: parsed.reasoning,
        };
        
        setMessages(prev => {
          const updated = [...prev, agentMsg];
          persistMessages(updated);
          return updated;
        });

        // Detect if the agent confirmed successful registration
        const successKeywords = ["successfully registered", "registration mukammal", "register ho gaye", "register kar diya", "Successfully registered"];
        const lowerMain = parsed.text.toLowerCase();
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
        setMessages(prev => {
          const updated = [...prev, agentMsg];
          persistMessages(updated);
          return updated;
        });
      }
    } catch (err) {
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: "Main network request complete nahi kar pa raha. Please check connection.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => {
        const updated = [...prev, agentMsg];
        persistMessages(updated);
        return updated;
      });
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
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
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
            multiline={true}
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
    borderColor: Colors.accentVeryLight,
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
    minHeight: 56,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Colors.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    color: Colors.primary,
    textAlignVertical: "top",
  },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
