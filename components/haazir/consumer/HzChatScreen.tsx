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
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
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

/* ─── Thinking block ─── */
const ThinkingBlock: React.FC<{ reasoning: string }> = ({ reasoning }) => {
  const [expanded, setExpanded] = useState(false);
  const heightValue = useSharedValue(54); // Closed height approx

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
        <Text style={styles.thinkingTitle}>Haazir's Reasoning — Intent Extraction</Text>
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

/* ─── Agent bubble ─── */
const AgentBubble: React.FC<{ text: string; time?: string; reasoning?: string; thinkingOn: boolean }> = ({
  text,
  time,
  reasoning,
  thinkingOn,
}) => (
  <View style={styles.agentBubbleWrapper}>
    {thinkingOn && reasoning ? <ThinkingBlock reasoning={reasoning} /> : null}
    <View style={[styles.agentBubble, Shadows.card]}>
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

/* ─── Main screen ─── */
export const HzChatScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [thinkingOn, setThinkingOn] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "Assalam o Alaikum! Main Haazir hoon. Aapko kaunsi service chahiye? Bas batayein — Urdu mein, English mein, ya jis tarah chaahein.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  // Clear agent session on screen mount to guarantee fresh context
  useEffect(() => {
    const clearSession = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/agent/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.warn("Failed to reset backend chat session:", err);
      }
    };
    clearSession();
  }, []);

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
      // Post user message to backend agent endpoint
      const response = await fetch(`${BACKEND_URL}/api/agent/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          mode: "customer",
          user_id: user?.id || "test_consumer_user",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponseText = data.response || "No response received.";

        // Premium parsing of the "Show Haazir's Thinking" reasoning segment
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
          mainText = "Process complete. Please let me know how you would like to proceed!";
        }

        const agentMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: mainText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          reasoning: reasoningText || undefined,
        };
        setMessages(prev => [...prev, agentMsg]);
      } else {
        const agentMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: `Oops! Server error: ${response.status}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages(prev => [...prev, agentMsg]);
      }
    } catch (err) {
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: "Main offline lag raha hoon. Please check target connection.",
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Chat scroll area */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => {
            if (msg.sender === "agent") {
              return (
                <AgentBubble
                  key={msg.id}
                  text={msg.text}
                  time={msg.time}
                  reasoning={msg.reasoning}
                  thinkingOn={thinkingOn}
                />
              );
            } else {
              return (
                <ConsumerBubble
                  key={msg.id}
                  text={msg.text}
                  time={msg.time}
                />
              );
            }
          })}

          {loading && (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color={Colors.accent} />
              <Text style={styles.loadingText}>Haazir is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Chat input bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Message Haazir..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={Colors.muted}
            onSubmitEditing={handleSend}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.sendBtn, loading && { backgroundColor: Colors.border }]}
          >
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
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, gap: 16 },
  
  // Thinking block
  thinkingBlock: { backgroundColor: Colors.thinking, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: Colors.accent, padding: 16, overflow: "hidden", marginBottom: 8 },
  thinkingHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  thinkingTitle: { flex: 1, fontSize: 12, fontWeight: "600", color: Colors.primary },
  thinkingText: { fontSize: 12, fontStyle: "italic", lineHeight: 18, color: "#555555" },
  thinkingMore: { fontSize: 12, fontWeight: "500", color: Colors.accent },

  // Bubbles
  agentBubbleWrapper: { alignItems: "flex-start", width: "100%", marginVertical: 4 },
  agentBubble: { maxWidth: "80%", backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderTopLeftRadius: 4, padding: 16, ...Shadows.card },
  agentText: { fontSize: 15, fontWeight: "400", lineHeight: 22, color: Colors.primary },
  agentTime: { marginTop: 4, fontSize: 11, color: Colors.muted, textAlign: "right" },
  consumerBubbleWrapper: { alignItems: "flex-end", width: "100%", marginVertical: 4 },
  consumerBubble: { maxWidth: "80%", backgroundColor: Colors.accent, borderRadius: 18, borderTopRightRadius: 4, padding: 16 },
  consumerText: { fontSize: 15, fontWeight: "400", lineHeight: 22, color: Colors.white },
  consumerTime: { marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.7)", textAlign: "right" },

  // Loading indicator
  loadingWrapper: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 12, marginVertical: 8 },
  loadingText: { fontSize: 13, color: Colors.muted },

  // Input bar
  inputBar: { height: 56, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 },
  input: { flex: 1, fontSize: 15, color: Colors.primary, height: 40 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
});
