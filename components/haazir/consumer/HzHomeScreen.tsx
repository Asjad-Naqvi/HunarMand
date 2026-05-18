import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzServiceCard } from "./HzServiceCard";
import { HzBottomNav } from "../shared/HzBottomNav";
import { Colors } from "../../constants/theme";

const CATEGORIES = ["All", "AC Repair", "Plumber", "Electrician", "Cleaning", "Painter", "Carpenter"];

const PROVIDERS = [
  { id: "1", name: "Ali Hassan", initials: "AH", serviceType: "AC Repair & Service", rating: 4.8, reviewCount: 127, location: "G-10", price: "PKR 2,500", availability: "available" as const },
  { id: "2", name: "Usman Butt", initials: "UB", serviceType: "Plumber", rating: 4.6, reviewCount: 89, location: "F-7", price: "PKR 1,800", availability: "available" as const },
  { id: "3", name: "Rizwan Ahmed", initials: "RA", serviceType: "Electrician", rating: 4.9, reviewCount: 203, location: "I-8", price: "PKR 2,000", availability: "available" as const },
  { id: "4", name: "Babar Khan", initials: "BK", serviceType: "Sofa Cleaning", rating: 4.5, reviewCount: 64, location: "E-11", price: "PKR 3,500", availability: "scheduled" as const },
  { id: "5", name: "Tariq Mehmood", initials: "TM", serviceType: "Painter", rating: 4.7, reviewCount: 41, location: "D-12", price: "PKR 4,200", availability: "available" as const },
];

export const HzHomeScreen: React.FC = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchValue, setSearchValue] = useState("");

  const filteredProviders = PROVIDERS.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.serviceType.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchValue || p.name.toLowerCase().includes(searchValue.toLowerCase()) || p.serviceType.toLowerCase().includes(searchValue.toLowerCase()) || p.location.toLowerCase().includes(searchValue.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.white} />
      
      {/* Header Area */}
      <View style={styles.header}>
        {/* Location & Bell Row */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.locationBtn}>
            <Ionicons name="location" size={16} color={Colors.accent} />
            <View style={styles.locationTextCol}>
              <Text style={styles.locationSub}>Your location</Text>
              <View style={styles.locationValueRow}>
                <Text style={styles.locationValue}>G-13, Islamabad</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.muted} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <Text style={styles.greetingTitle}>Good morning, Ali 👋</Text>
        <Text style={styles.greetingSub}>What service do you need today?</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, providers…"
            placeholderTextColor={Colors.muted}
            value={searchValue}
            onChangeText={setSearchValue}
            onSubmitEditing={() => router.push("/search-results")}
          />
        </View>
      </View>

      {/* Category Chips Scroll */}
      <View style={styles.chipStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.chip, activeCategory === cat ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, activeCategory === cat ? styles.chipTextActive : styles.chipTextInactive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main List */}
      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          {filteredProviders.length > 0 && <Text style={styles.sectionCount}>{filteredProviders.length} providers</Text>}
        </View>

        {filteredProviders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={32} color={Colors.border} />
            <Text style={styles.emptyText}>No providers found. Try a different search or category.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredProviders.map(p => (
              <HzServiceCard
                key={p.id}
                name={p.name}
                initials={p.initials}
                serviceType={p.serviceType}
                rating={p.rating}
                reviewCount={p.reviewCount}
                location={p.location}
                price={p.price}
                availability={p.availability}
                onBook={() => router.push("/provider-profile")}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <HzBottomNav role="consumer" activeTab="home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  locationBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationTextCol: { flexDirection: "column" },
  locationSub: { fontSize: 11, color: Colors.muted },
  locationValueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationValue: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  bellBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  greetingTitle: { fontSize: 24, fontWeight: "700", color: Colors.primary, marginBottom: 4 },
  greetingSub: { fontSize: 14, color: Colors.muted, marginBottom: 16 },
  searchBar: { height: 48, flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: "100%", fontSize: 15, color: Colors.primary },
  
  chipStrip: { paddingVertical: 12 },
  chipScroll: { paddingHorizontal: 16, gap: 8 },
  chip: { height: 32, paddingHorizontal: 16, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  chipActive: { backgroundColor: Colors.accent },
  chipInactive: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: Colors.white },
  chipTextInactive: { color: Colors.primary },

  mainScroll: { flex: 1 },
  mainContent: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  sectionCount: { marginLeft: 8, fontSize: 11, color: Colors.muted },

  emptyState: { paddingVertical: 48, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, color: Colors.muted, textAlign: "center" },
  
  list: { gap: 0 },
});
