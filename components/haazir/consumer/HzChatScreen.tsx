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
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  reasoning?: string;
  searchResults?: any;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.1.16:5000";

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
const AgentBubble: React.FC<{
  text: string;
  time?: string;
  reasoning?: string;
  thinkingOn: boolean;
  searchResults?: any;
  onViewComparison?: () => void;
  onBookProvider?: (provider: any) => void;
  onViewProfile?: (provider: any) => void;
}> = ({
  text,
  time,
  reasoning,
  thinkingOn,
  searchResults,
  onViewComparison,
  onBookProvider,
  onViewProfile,
}) => {
  // Extract top 3 recommended registered providers (retaining composite backend ranking)
  const topProviders = React.useMemo(() => {
    if (!searchResults || !searchResults.registered_providers) return [];
    return [...searchResults.registered_providers].slice(0, 3);
  }, [searchResults]);

  return (
    <View style={styles.agentBubbleWrapper}>
      {thinkingOn && reasoning ? <ThinkingBlock reasoning={reasoning} /> : null}
      <View style={[styles.agentBubble, Shadows.card]}>
        <Text style={styles.agentText}>{text}</Text>
        {time && <Text style={styles.agentTime}>{time}</Text>}
      </View>

      {searchResults && (
        <View style={[styles.inlineSearchCard, Shadows.card]}>
          <View style={styles.searchCardHeader}>
            <Ionicons name="sparkles" size={16} color={Colors.accent} />
            <Text style={styles.searchCardTitle}>Verified Matches</Text>
          </View>
          
          <Text style={styles.searchCardBody}>
            Here are the top verified options matching <Text style={{ fontStyle: "italic" }}>{searchResults.service || "your request"}</Text> in <Text style={{ fontWeight: "600" }}>{searchResults.sector_code || "your area"}</Text>:
          </Text>

          <View style={styles.cheapestList}>
            {topProviders.map((p, idx) => {
              const price = p.pricing_breakdown?.final_total?.toLocaleString() || "2,400";
              return (
                <View key={p.provider_id || idx} style={styles.cheapestItem}>
                  <TouchableOpacity
                    onPress={() => onViewProfile && onViewProfile(p)}
                    activeOpacity={0.7}
                    style={styles.cheapestInfo}
                  >
                    <Text style={styles.cheapestName}>{p.name}</Text>
                    <Text style={styles.cheapestStats}>★ {p.rating?.toFixed(1) || "5.0"} · {p.on_time || "90%"}</Text>
                  </TouchableOpacity>
                  <View style={styles.cheapestBookCol}>
                    <Text style={styles.cheapestPrice}>PKR {price}</Text>
                    <TouchableOpacity
                      onPress={() => onBookProvider && onBookProvider(p)}
                      activeOpacity={0.8}
                      style={styles.cheapestBookBtn}
                    >
                      <Text style={styles.cheapestBookBtnText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onViewComparison}
            activeOpacity={0.8}
            style={styles.searchCardBtn}
          >
            <Text style={styles.searchCardBtnText}>More Information (Compare Options)</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/* ─── Consumer bubble ─── */
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

  return {
    text: mainText,
    reasoning: reasoningText || undefined,
  };
};

/* ─── Main screen ─── */
export const HzChatScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [thinkingOn, setThinkingOn] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const WELCOME_MSG: ChatMessage = {
    id: "welcome",
    sender: "agent",
    text: "Assalam o Alaikum! Main Haazir hoon. Aapko kaunsi service chahiye? Bas batayein — Urdu mein, English mein, ya jis tarah chaahein.",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const handleClearChat = async () => {
    try {
      const storageKey = `haazir_chat_history_customer_${user?.id || "anonymous"}`;
      setMessages([WELCOME_MSG]);
      await AsyncStorage.removeItem(storageKey);
      await AsyncStorage.removeItem("latest_search_results");
      
      const userId = user?.id || "anonymous";
      await fetch(`${BACKEND_URL}/api/agent/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (err) {
      console.warn("Failed to clear chat history:", err);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const scrollRef = useRef<ScrollView>(null);

  // ── Helper: save current message list to device storage ──────────────────
  const persistMessages = async (msgs: ChatMessage[]) => {
    try {
      const storageKey = `haazir_chat_history_customer_${user?.id || "anonymous"}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch (err) {
      console.warn("Failed to persist chat history:", err);
    }
  };

  const handleViewComparison = async (results: any) => {
    if (!results) return;
    try {
      await AsyncStorage.setItem("latest_search_results", JSON.stringify(results));
      router.push("/search-results");
    } catch (err) {
      console.warn("Failed to save search results before navigation:", err);
    }
  };

  const handleBookProvider = async (provider: any) => {
    if (!provider) return;
    try {
      const bookingDetails = {
        providerId: provider.provider_id || provider.id,
        providerName: provider.name,
        providerRating: provider.rating || 5.0,
        serviceName: provider.services || "AC Repairing",
        location: provider.sectors || "G-13, Islamabad",
        pricing: provider.pricing_breakdown || {
          base_rate: 2000,
          distance_surcharge: 0,
          urgency_surcharge: 0,
          complexity_surcharge: 0,
          surge_surcharge: 0,
          loyalty_discount: 0,
          final_total: 2000
        }
      };
      await AsyncStorage.setItem("current_booking_details", JSON.stringify(bookingDetails));
      router.push("/booking-confirmation");
    } catch (err) {
      console.warn("Failed to initiate booking from chat:", err);
    }
  };

  const handleViewProfile = async (provider: any) => {
    try {
      // Normalize to DisplayProvider interface format
      const normalizedProvider = {
        id: provider.provider_id || provider.id || Math.random().toString(),
        name: provider.name,
        phone: provider.phone,
        estimatedPrice: provider.pricing_breakdown?.final_total
          ? `Est. PKR ${provider.pricing_breakdown.final_total.toLocaleString()}`
          : "Est. PKR 2,800",
        services: provider.services || "General Home Service",
        sectors: provider.sectors || "Islamabad",
        rating: provider.rating || 5.0,
        reviewCount: provider.completed_jobs || provider.reviewCount || 0,
        onTime: provider.on_time || "On time 100%",
        availability: provider.availability || "Available",
        isRecommended: !!provider.isRecommended,
        pricing_breakdown: provider.pricing_breakdown,
      };
      await AsyncStorage.setItem("selected_provider", JSON.stringify(normalizedProvider));
      router.push("/provider-profile");
    } catch (err) {
      console.warn("Failed to navigate to provider profile:", err);
    }
  };

  // ── Load history on mount: AsyncStorage first, then backend fallback ──────
  useEffect(() => {
    const initChat = async () => {
      const storageKey = `haazir_chat_history_customer_${user?.id || "anonymous"}`;

      // 1. Try to load instantly from device cache
      try {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached) {
          const cachedMsgs: ChatMessage[] = JSON.parse(cached);
          if (cachedMsgs.length > 1) {
            setMessages(cachedMsgs);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
            return; // We have local cache — no need to hit the backend
          }
        }
      } catch (err) {
        console.warn("Failed to read cached chat history:", err);
      }

      // 2. No local cache — fetch from backend (first visit)
      try {
        const userId = user?.id || "anonymous";
        const response = await fetch(
          `${BACKEND_URL}/api/agent/history?mode=customer&user_id=${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          const history = data.history || [];

          if (history.length > 1) {
            const parsedMessages: ChatMessage[] = [WELCOME_MSG];
            let idCounter = 1;
            let lastSearchResults: any = null;

            for (const item of history) {
              if (item.role === "system") continue;
              
              if (item.role === "tool" && item.name === "search_providers" && item.content) {
                try {
                  lastSearchResults = JSON.parse(item.content);
                } catch (e) {
                  console.warn("Failed to parse tool search results:", e);
                }
                continue;
              }

              if (item.role === "user" && item.content) {
                parsedMessages.push({
                  id: `history_user_${idCounter++}`,
                  sender: "user",
                  text: item.content,
                  time: "",
                });
              } else if (item.role === "assistant" && (item.content || item.tool_calls)) {
                if (item.content) {
                  const parsed = parseAgentMessage(item.content);
                  parsedMessages.push({
                    id: `history_agent_${idCounter++}`,
                    sender: "agent",
                    text: parsed.text,
                    reasoning: parsed.reasoning,
                    time: "",
                    searchResults: lastSearchResults || undefined,
                  });
                  lastSearchResults = null;
                }
              }
            }
            setMessages(parsedMessages);
            persistMessages(parsedMessages);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 150);
          }
        }
      } catch (err) {
        console.warn("Failed to load chat history from backend:", err);
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
      // Post user message to backend agent endpoint
      const response = await fetch(`${BACKEND_URL}/api/agent/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          mode: "customer",
          user_id: user?.id || "anonymous",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const history = data.history || [];
        
        if (history.length > 0) {
          const parsedMessages: ChatMessage[] = [WELCOME_MSG];
          let idCounter = 1;
          let lastSearchResults: any = null;

          for (const item of history) {
            if (item.role === "system") continue;
            
            if (item.role === "tool" && item.name === "search_providers" && item.content) {
              try {
                lastSearchResults = JSON.parse(item.content);
              } catch (e) {
                console.warn("Failed to parse tool search results:", e);
              }
              continue;
            }

            if (item.role === "user" && item.content) {
              parsedMessages.push({
                id: `history_user_${idCounter++}`,
                sender: "user",
                text: item.content,
                time: item.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              });
            } else if (item.role === "assistant" && (item.content || item.tool_calls)) {
              if (item.content) {
                const parsed = parseAgentMessage(item.content);
                parsedMessages.push({
                  id: `history_agent_${idCounter++}`,
                  sender: "agent",
                  text: parsed.text,
                  reasoning: parsed.reasoning,
                  time: item.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  searchResults: lastSearchResults || undefined,
                });
                lastSearchResults = null;
              }
            }
          }
          setMessages(parsedMessages);
          persistMessages(parsedMessages);
        } else {
          // Fallback if no history returned
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
        }
      } else {
        const agentMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: `Oops! Server error: ${response.status}`,
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
        text: "Main offline lag raha hoon. Please check connection.",
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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top app bar */}
      <View style={styles.topBar}>
        <View style={styles.logoGroup}>
          <View style={styles.logoMark}><Text style={styles.logoLetter}>H</Text></View>
          <Text style={styles.wordmark}>Haazir</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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

          <TouchableOpacity
            onPress={handleClearChat}
            activeOpacity={0.8}
            style={styles.clearChatBtn}
            title="Clear Chat"
          >
            <Ionicons name="trash-outline" size={18} color="#EA4335" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
                  searchResults={msg.searchResults}
                  onViewComparison={() => handleViewComparison(msg.searchResults)}
                  onBookProvider={handleBookProvider}
                  onViewProfile={handleViewProfile}
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
            multiline={true}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim() || loading}
            activeOpacity={0.8}
            style={[styles.sendBtn, (!message.trim() || loading) && { backgroundColor: Colors.border }]}
          >
            <Ionicons name="arrow-up" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <HzBottomNav role="consumer" activeTab="chat" />
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
  clearChatBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FDF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FDE8E8",
  },
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
  inputBar: {
    minHeight: 56,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.primary,
    minHeight: 40,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: "top",
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },

  // Inline Search Card styling
  inlineSearchCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    padding: 16,
    width: "100%",
    marginTop: 8,
    marginBottom: 4,
  },
  searchCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  searchCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  searchCardBody: {
    fontSize: 13,
    color: "#4A4A4A",
    lineHeight: 18,
    marginBottom: 10,
  },
  searchCardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  priceVal: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
  searchCardBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  searchCardBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.white,
  },
  cheapestList: {
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
    width: "100%",
  },
  cheapestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAF8F5",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    width: "100%",
  },
  cheapestInfo: {
    flex: 1,
    gap: 2,
  },
  cheapestName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  cheapestStats: {
    fontSize: 12,
    color: Colors.muted,
  },
  cheapestBookCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  cheapestPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  cheapestBookBtn: {
    backgroundColor: Colors.success,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  cheapestBookBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.white,
  },
});
