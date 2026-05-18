import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzServiceCard } from "./HzServiceCard";
import { HzBottomNav } from "../shared/HzBottomNav";
import { Colors } from "../../constants/theme";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const CATEGORIES = ["All", "AC Repair", "Plumber", "Electrician", "Cleaning", "Carpenter"];

// Map service codes -> display names
const SERVICE_CODE_MAP: Record<string, string> = {
  "HS-04": "AC Repair & Service",
  "HS-03": "Electrician",
  "HS-01": "Plumber",
  "HS-02": "Carpenter Work",
  "CS-01": "Carpet Cleaning",
  "CS-02": "Sofa Cleaning",
};

// Map service codes -> category filter terms
const SERVICE_CATEGORY_MAP: Record<string, string[]> = {
  "HS-04": ["AC Repair"],
  "HS-03": ["Electrician"],
  "HS-01": ["Plumber"],
  "HS-02": ["Carpenter"],
  "CS-01": ["Cleaning"],
  "CS-02": ["Cleaning"],
};

interface ProviderRow {
  id: string;
  name: string;
  serviceType: string;
  serviceCode: string;
  rating: number;
  reviewCount: number;
  location: string;
  price: string;
  availability: "available" | "busy" | "scheduled";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPrice(rate: number): string {
  return `PKR ${rate.toLocaleString("en-PK")}`;
}

async function fetchProviders(): Promise<ProviderRow[]> {
  const url = `${SUPABASE_URL}/rest/v1/users?role=eq.provider&select=*,provider_profiles(*),provider_services(*),provider_sectors(*)`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  const data = await res.json();

  const rows: ProviderRow[] = [];

  for (const u of data) {
    const profiles = u.provider_profiles;
    const profile = Array.isArray(profiles) ? profiles[0] : profiles;
    if (!profile || profile.account_status !== "active") continue;

    const services: any[] = u.provider_services || [];
    const sectors: any[] = u.provider_sectors || [];

    if (services.length === 0 || sectors.length === 0) continue;

    // Take the first (primary) service for display
    const primaryService = services.find((s: any) => s.is_primary) || services[0];
    const sector = sectors[0]?.sector_code ?? "Islamabad";

    rows.push({
      id: u.id,
      name: u.name ?? "Unknown",
      serviceType: SERVICE_CODE_MAP[primaryService.service_code] ?? primaryService.service_code,
      serviceCode: primaryService.service_code,
      rating: parseFloat(profile.base_rating ?? 5),
      reviewCount: parseInt(profile.jobs_completed ?? 0),
      location: sector,
      price: formatPrice(primaryService.per_job_rate_pkr ?? 0),
      availability: profile.availability_status === "available" ? "available" : "busy",
    });
  }

  return rows;
}

export const HzHomeScreen: React.FC = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviders();
      setProviders(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredProviders = providers.filter(p => {
    const categoryTerms = SERVICE_CATEGORY_MAP[p.serviceCode] ?? [];
    const matchesCategory =
      activeCategory === "All" ||
      categoryTerms.some(t => t.toLowerCase() === activeCategory.toLowerCase()) ||
      p.serviceType.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesSearch =
      !searchValue ||
      p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.serviceType.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.location.toLowerCase().includes(searchValue.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.locationBtn}>
            <Ionicons name="location" size={16} color={Colors.accent} />
            <View style={styles.locationTextCol}>
              <Text style={styles.locationSub}>Your location</Text>
              <View style={styles.locationValueRow}>
                <Text style={styles.locationValue}>Islamabad</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.muted} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.greetingTitle}>Good morning 👋</Text>
        <Text style={styles.greetingSub}>What service do you need today?</Text>

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

      {/* Category Chips */}
      <View style={styles.chipStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.chip, activeCategory === cat ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, activeCategory === cat ? styles.chipTextActive : styles.chipTextInactive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main List */}
      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          {!loading && filteredProviders.length > 0 && (
            <Text style={styles.sectionCount}>{filteredProviders.length} providers</Text>
          )}
          <TouchableOpacity onPress={load} style={{ marginLeft: "auto" }}>
            <Ionicons name="refresh" size={16} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Loading providers...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Ionicons name="cloud-offline-outline" size={32} color={Colors.border} />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity onPress={load} style={styles.retryBtn}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredProviders.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="search" size={32} color={Colors.border} />
            <Text style={styles.emptyText}>No providers found. Try a different search or category.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredProviders.map(p => (
              <HzServiceCard
                key={p.id}
                name={p.name}
                initials={getInitials(p.name)}
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

  centerState: { paddingVertical: 48, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, color: Colors.muted, textAlign: "center" },
  loadingText: { fontSize: 14, color: Colors.muted, marginTop: 8 },
  retryBtn: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.accent },
  retryText: { fontSize: 13, fontWeight: "600", color: Colors.white },

  list: { gap: 0 },
});
