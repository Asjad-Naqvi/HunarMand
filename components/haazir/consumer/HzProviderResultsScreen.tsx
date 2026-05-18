import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

interface Provider {
  id: string;
  name: string;
  estimatedPrice: string;
  services: string;
  sectors: string;
  rating: number;
  reviewCount: number;
  onTime: string;
  availability: string;
  isRecommended?: boolean;
}

const PROVIDERS: Provider[] = [
  {
    id: "1",
    name: "Ali Hassan",
    estimatedPrice: "Est. PKR 2,800",
    services: "AC Repairing · AC Installation",
    sectors: "G-10, G-11, G-13, G-14",
    rating: 4.8,
    reviewCount: 32,
    onTime: "On time 94%",
    availability: "Available tomorrow 8am – 1pm",
    isRecommended: true,
  },
  {
    id: "2",
    name: "Usman Butt",
    estimatedPrice: "Est. PKR 2,400",
    services: "AC Repairing",
    sectors: "G-13, F-7, F-8",
    rating: 4.5,
    reviewCount: 18,
    onTime: "On time 88%",
    availability: "Available tomorrow 9am – 5pm",
  },
  {
    id: "3",
    name: "Rizwan Ahmed",
    estimatedPrice: "Est. PKR 3,100",
    services: "AC Repairing · AC General Service",
    sectors: "G-9, G-10, G-13",
    rating: 4.6,
    reviewCount: 44,
    onTime: "On time 91%",
    availability: "Available tomorrow 7am – 12pm",
  },
];

const Pill: React.FC<{ label: string; bg: string; color: string }> = ({ label, bg, color }) => (
  <View style={[styles.pill, { backgroundColor: bg }]}>
    <Text style={[styles.pillText, { color }]}>{label}</Text>
  </View>
);

const ProviderCard: React.FC<{ provider: Provider; onViewProfile?: () => void }> = ({ provider, onViewProfile }) => (
  <View style={[styles.card, Shadows.card]}>
    {provider.isRecommended && (
      <View style={styles.recommendWrapper}>
        <Pill label="⭐ Agent Recommended" bg={Colors.accent} color={Colors.white} />
      </View>
    )}

    <View style={styles.namePriceRow}>
      <Text style={styles.nameText}>{provider.name}</Text>
      <Text style={styles.priceText}>{provider.estimatedPrice}</Text>
    </View>

    <View style={{ marginTop: 4, alignSelf: "flex-start" }}>
      <Pill label="✓ Haazir Verified" bg={Colors.success} color={Colors.white} />
    </View>

    <Text style={styles.servicesText}>{provider.services}</Text>
    <Text style={styles.sectorsText}>{provider.sectors}</Text>

    <View style={styles.statsRow}>
      <Text style={styles.statsText}>★ {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)</Text>
      <Text style={styles.statsDot}>·</Text>
      <Text style={styles.onTimeText}>{provider.onTime}</Text>
    </View>

    <View style={styles.availRow}>
      <View style={styles.availDot} />
      <Text style={styles.availText}>{provider.availability}</Text>
    </View>

    <TouchableOpacity onPress={onViewProfile} style={styles.viewProfileBtn}>
      <Text style={styles.viewProfileText}>View Profile →</Text>
    </TouchableOpacity>
  </View>
);

export const HzProviderResultsScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"haazir" | "maps">("haazir");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.white} />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>AC Repair · G-13 · Tomorrow 9am</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="options-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setActiveTab("haazir")} style={[styles.tab, activeTab === "haazir" && styles.tabActive]}>
          <Text style={[styles.tabText, activeTab === "haazir" && styles.tabTextActive]}>Haazir Providers (3)</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("maps")} style={[styles.tab, activeTab === "maps" && styles.tabActive]}>
          <Text style={[styles.tabText, activeTab === "maps" && styles.tabTextActive]}>Google Maps (5)</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultCount}>Showing {PROVIDERS.length} registered providers</Text>
        
        <View style={styles.list}>
          {PROVIDERS.map((p) => (
            <ProviderCard key={p.id} provider={p} onViewProfile={() => router.push("/provider-profile")} />
          ))}
        </View>

        <TouchableOpacity style={styles.loadMoreBtn}>
          <Text style={styles.loadMoreText}>Load more providers</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "600", color: Colors.primary },

  tabRow: { height: 48, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", paddingHorizontal: 16 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: Colors.accent },
  tabText: { fontSize: 14, color: Colors.muted },
  tabTextActive: { fontWeight: "600", color: Colors.primary },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  resultCount: { fontSize: 11, color: Colors.muted, marginBottom: 12 },

  list: { gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: Colors.success, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  recommendWrapper: { alignItems: "flex-end", marginBottom: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  pillText: { fontSize: 12, fontWeight: "500" },
  namePriceRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  nameText: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  priceText: { fontSize: 18, fontWeight: "600", color: Colors.primary },
  servicesText: { marginTop: 8, fontSize: 13, color: Colors.muted },
  sectorsText: { marginTop: 4, fontSize: 12, color: Colors.muted },
  statsRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  statsText: { fontSize: 13, fontWeight: "500", color: Colors.primary },
  statsDot: { color: Colors.border, fontSize: 12 },
  onTimeText: { fontSize: 13, fontWeight: "500", color: Colors.success },
  availRow: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 6 },
  availDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  availText: { fontSize: 12, color: Colors.success },
  viewProfileBtn: { marginTop: 12, alignSelf: "flex-end", paddingVertical: 4 },
  viewProfileText: { fontSize: 13, fontWeight: "500", color: Colors.accent },

  loadMoreBtn: { marginTop: 16, width: "100%", height: 48, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  loadMoreText: { fontSize: 14, color: Colors.muted },
});
