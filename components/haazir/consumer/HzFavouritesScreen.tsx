import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";

interface FavouriteCardProps {
  name: string;
  service: string;
  area: string;
  rating: string;
  reviewCount: number;
}

const FavouriteCard: React.FC<FavouriteCardProps> = ({ name, service, area, rating, reviewCount }) => {
  const router = useRouter();
  const [saved, setSaved] = useState(true);

  return (
    <View style={[styles.card, Shadows.card]}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}><Ionicons name="person" size={22} color={Colors.white} /></View>
        <View style={styles.infoCol}>
          <Text style={styles.nameText}>{name}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Haazir Verified</Text>
          </View>
          <Text style={styles.metaText}>{service} · {area}</Text>
          <Text style={styles.metaText}>★ {rating} · {reviewCount} reviews</Text>
        </View>
        <TouchableOpacity onPress={() => setSaved(!saved)} style={styles.heartBtn}>
          <Ionicons name={saved ? "heart" : "heart-outline"} size={24} color={saved ? Colors.danger : Colors.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.accent, borderWidth: 0 }]}
          onPress={() => router.push("/(consumer)/booking-confirmation" as any)}
        >
          <Text style={[styles.actionBtnText, { color: Colors.white }]}>Book Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push("/(consumer)/provider-profile" as any)}
        >
          <Text style={styles.actionBtnText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const HzFavouritesScreen: React.FC = () => {
  const PROVIDERS = [
    { name: "Ali Hassan",      service: "AC Repairing",  area: "G-13", rating: "4.8", reviewCount: 32 },
    { name: "Usman Butt",      service: "AC Repairing",  area: "F-7",  rating: "4.5", reviewCount: 18 },
    { name: "Tariq Mehmood",   service: "Sofa Cleaning", area: "G-10", rating: "4.7", reviewCount: 27 },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Favourites</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Providers</Text>
          <Text style={styles.sectionCount}>{PROVIDERS.length} saved</Text>
        </View>

        <View style={styles.cardsList}>
          {PROVIDERS.map(p => <FavouriteCard key={p.name} {...p} />)}
        </View>
      </ScrollView>

      <HzBottomNav role="consumer" activeTab="favourites" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },

  scroll: { flex: 1 },
  content: { padding: 16 },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  sectionCount: { fontSize: 12, color: Colors.muted },

  cardsList: { marginTop: 12, gap: 12 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  infoCol: { flex: 1, gap: 4 },
  nameText: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  verifiedBadge: { alignSelf: "flex-start", backgroundColor: Colors.success, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  verifiedText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  metaText: { fontSize: 13, color: Colors.muted },
  heartBtn: { padding: 4 },

  divider: { height: 1, backgroundColor: Colors.divider, marginTop: 12, marginBottom: 8 },
  
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, height: 40, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  actionBtnText: { fontSize: 13, fontWeight: "500", color: Colors.primary },
});
