import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

interface DisputeItemProps {
  service: string;
  provider: string;
  date: string;
  status: "open" | "resolved" | "reviewing";
  last?: boolean;
  onPress: () => void;
}

const STATUS_CONFIG = {
  open:      { label: "Open",      bg: Colors.warning },
  reviewing: { label: "Reviewing", bg: Colors.accent  },
  resolved:  { label: "Resolved",  bg: Colors.success },
};

const DisputeItem: React.FC<DisputeItemProps> = ({ service, provider, date, status, last, onPress }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.item, last && { borderBottomWidth: 0 }]}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.itemService}>{service}</Text>
        <Text style={styles.itemMeta}>{provider} · {date}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
          <Text style={styles.statusText}>{cfg.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
      </View>
    </TouchableOpacity>
  );
};

export const HzMyDisputesScreen: React.FC = () => {
  const router = useRouter();

  const DISPUTES = [
    { id: "1", service: "Plumbing",    provider: "Bilal Chaudhry", date: "29 Apr 2026", status: "open"      as const },
    { id: "2", service: "Electrician", provider: "Naeem Qureshi",  date: "12 Mar 2026", status: "reviewing" as const },
    { id: "3", service: "AC Repair",   provider: "Tariq Mehmood",  date: "5 Feb 2026",  status: "resolved"  as const },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">My Disputes</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Row */}
        <View style={styles.summaryRow}>
          {(["open", "reviewing", "resolved"] as const).map(s => (
            <View key={s} style={[styles.summaryCard, Shadows.card]}>
              <Text style={styles.summaryCount}>
                {DISPUTES.filter(d => d.status === s).length}
              </Text>
              <Text style={styles.summaryLabel}>{STATUS_CONFIG[s].label}</Text>
            </View>
          ))}
        </View>

        {/* Disputes List */}
        <View style={[styles.card, Shadows.card]}>
          {DISPUTES.map((d, i) => (
            <DisputeItem
              key={d.id}
              service={d.service}
              provider={d.provider}
              date={d.date}
              status={d.status}
              last={i === DISPUTES.length - 1}
              onPress={() => router.push("/(consumer)/dispute-status" as any)}
            />
          ))}
        </View>

        <Text style={styles.hint}>
          Disputes are managed by Haazir's AI agent and typically resolved within 48 hours.
        </Text>
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
  title: {
    position: "absolute",
    left: 0, right: 0,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: Colors.primary,
    zIndex: -1,
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  summaryCount: { fontSize: 22, fontWeight: "700", color: Colors.primary },
  summaryLabel: { fontSize: 12, color: Colors.muted },
  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 12,
  },
  itemLeft: { flex: 1, gap: 4 },
  itemService: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  itemMeta: { fontSize: 13, color: Colors.muted },
  statusPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  hint: { fontSize: 12, color: Colors.muted, textAlign: "center", lineHeight: 18 },
});
