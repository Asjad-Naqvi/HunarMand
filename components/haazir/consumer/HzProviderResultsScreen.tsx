import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, Shadows } from "../../constants/theme";

interface DisplayProvider {
  id: string;
  name: string;
  phone?: string;
  estimatedPrice: string;
  services: string;
  sectors: string;
  rating: number;
  reviewCount: number;
  onTime: string;
  availability: string;
  isRecommended?: boolean;
  pricing_breakdown?: {
    base_rate: number;
    distance_surcharge: number;
    urgency_surcharge: number;
    complexity_surcharge: number;
    surge_surcharge: number;
    loyalty_discount: number;
    final_total: number;
  };
}

interface DisplayGMapsProvider {
  name: string;
  phone: string;
  rating: number;
  reviews_count: number;
  address: string;
  distance_km: number;
  estimatedPrice: string;
  pricing_breakdown?: {
    base_rate: number;
    distance_surcharge: number;
    urgency_surcharge: number;
    complexity_surcharge: number;
    final_total: number;
  };
}

const FALLBACK_REGISTERED: DisplayProvider[] = [
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
    pricing_breakdown: {
      base_rate: 2000,
      distance_surcharge: 30,
      urgency_surcharge: 300,
      complexity_surcharge: 200,
      surge_surcharge: 370,
      loyalty_discount: 100,
      final_total: 2800,
    },
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
    pricing_breakdown: {
      base_rate: 1800,
      distance_surcharge: 0,
      urgency_surcharge: 300,
      complexity_surcharge: 100,
      surge_surcharge: 290,
      loyalty_discount: 90,
      final_total: 2400,
    },
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
    pricing_breakdown: {
      base_rate: 2200,
      distance_surcharge: 50,
      urgency_surcharge: 300,
      complexity_surcharge: 200,
      surge_surcharge: 460,
      loyalty_discount: 110,
      final_total: 3100,
    },
  },
];

const FALLBACK_MAPS: DisplayGMapsProvider[] = [
  {
    name: "Islamabad AC Repair Care",
    phone: "+92 51 889211",
    rating: 4.6,
    reviews_count: 38,
    address: "G-13 Markaz, Islamabad",
    distance_km: 1.8,
    estimatedPrice: "Est. PKR 1,500",
    pricing_breakdown: {
      base_rate: 1200,
      distance_surcharge: 0,
      urgency_surcharge: 150,
      complexity_surcharge: 150,
      final_total: 1500,
    },
  },
  {
    name: "Super Fix Techs",
    phone: "+92 333 981772",
    rating: 4.3,
    reviews_count: 21,
    address: "G-13 Sector Street 4, Islamabad",
    distance_km: 2.4,
    estimatedPrice: "Est. PKR 1,200",
    pricing_breakdown: {
      base_rate: 1000,
      distance_surcharge: 0,
      urgency_surcharge: 100,
      complexity_surcharge: 100,
      final_total: 1200,
    },
  },
  {
    name: "Islamabad Repair Experts",
    phone: "+92 345 556621",
    rating: 4.7,
    reviews_count: 52,
    address: "G-13 Sector Road, Islamabad",
    distance_km: 1.2,
    estimatedPrice: "Est. PKR 1,800",
    pricing_breakdown: {
      base_rate: 1400,
      distance_surcharge: 0,
      urgency_surcharge: 200,
      complexity_surcharge: 200,
      final_total: 1800,
    },
  },
];

const Pill: React.FC<{ label: string; bg: string; color: string }> = ({
  label,
  bg,
  color,
}) => (
  <View style={[styles.pill, { backgroundColor: bg }]}>
    <Text style={[styles.pillText, { color }]}>{label}</Text>
  </View>
);

const PricingBreakdownView: React.FC<{ pricing: any }> = ({ pricing }) => {
  if (!pricing) return null;
  return (
    <View style={styles.breakdownContainer}>
      <Text style={styles.breakdownTitle}>Fare Breakdown</Text>
      
      <View style={styles.breakdownRow}>
        <Text style={styles.breakdownLabel}>Base rate</Text>
        <Text style={styles.breakdownVal}>PKR {pricing.base_rate?.toLocaleString()}</Text>
      </View>
      
      {pricing.distance_surcharge > 0 && (
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Distance surcharge</Text>
          <Text style={styles.breakdownVal}>+PKR {pricing.distance_surcharge?.toLocaleString()}</Text>
        </View>
      )}
      
      {pricing.urgency_surcharge > 0 && (
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Urgency surcharge</Text>
          <Text style={styles.breakdownVal}>+PKR {pricing.urgency_surcharge?.toLocaleString()}</Text>
        </View>
      )}
      
      {pricing.complexity_surcharge > 0 && (
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Complexity premium</Text>
          <Text style={styles.breakdownVal}>+PKR {pricing.complexity_surcharge?.toLocaleString()}</Text>
        </View>
      )}
      
      {pricing.surge_surcharge > 0 && (
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Surge demand premium</Text>
          <Text style={styles.breakdownVal}>+PKR {pricing.surge_surcharge?.toLocaleString()}</Text>
        </View>
      )}
      
      {pricing.loyalty_discount > 0 && (
        <View style={styles.breakdownRow}>
          <Text style={[styles.breakdownLabel, { color: Colors.success }]}>Loyalty discount</Text>
          <Text style={[styles.breakdownVal, { color: Colors.success }]}>-PKR {pricing.loyalty_discount?.toLocaleString()}</Text>
        </View>
      )}
      
      <View style={styles.breakdownDivider} />
      
      <View style={[styles.breakdownRow, { marginTop: 4 }]}>
        <Text style={[styles.breakdownLabel, { fontWeight: "700" }]}>Total fare</Text>
        <Text style={[styles.breakdownVal, { fontWeight: "700", color: Colors.accent }]}>
          PKR {pricing.final_total?.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const ProviderCard: React.FC<{
  provider: DisplayProvider;
  onViewProfile?: () => void;
  onBook?: () => void;
}> = ({ provider, onViewProfile, onBook }) => {
  const [expanded, setExpanded] = useState(false);

  return (
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

      {expanded && provider.pricing_breakdown && (
        <PricingBreakdownView pricing={provider.pricing_breakdown} />
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
          style={styles.pricingToggleBtn}
        >
          <Text style={styles.pricingToggleText}>
            {expanded ? "Hide Breakdown ↑" : "Show Breakdown ↓"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={onViewProfile} style={styles.viewProfileBtn}>
            <Text style={styles.viewProfileText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onBook} activeOpacity={0.8} style={styles.bookNowBtn}>
            <Text style={styles.bookNowBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const MapsProviderCard: React.FC<{ provider: DisplayGMapsProvider; serviceName: string }> = ({
  provider,
  serviceName,
}) => {
  const handleCall = () => {
    if (provider.phone) {
      Linking.openURL(`tel:${provider.phone}`);
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: Colors.muted }, Shadows.card]}>
      <View style={styles.namePriceRow}>
        <Text style={styles.nameText}>{provider.name}</Text>
      </View>

      <View style={{ marginTop: 4, alignSelf: "flex-start", flexDirection: "row", gap: 6 }}>
        <Pill label="📍 Google Directory" bg="#EA4335" color={Colors.white} />
        <Pill label={`${provider.distance_km} km away`} bg={Colors.border} color={Colors.primary} />
      </View>

      <Text style={styles.addressText}>{provider.address}</Text>

      <View style={{ marginTop: 8, gap: 4 }}>
        <Text style={{ fontSize: 13, color: Colors.primary }}>
          📞 Phone: {provider.phone || "Not available"}
        </Text>
        <Text style={{ fontSize: 13, color: Colors.primary }}>
          🛠️ Service: {serviceName}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>★ {provider.rating.toFixed(1)} ({provider.reviews_count} reviews)</Text>
      </View>

      <View style={styles.actionRow}>
        <View />
        <TouchableOpacity onPress={handleCall} style={styles.callBtn}>
          <Ionicons name="call" size={14} color={Colors.white} />
          <Text style={styles.callBtnText}>Call Provider</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const HzProviderResultsScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"haazir" | "maps">("haazir");
  const [loading, setLoading] = useState(true);
  
  const [queryDetails, setQueryDetails] = useState({
    service: "AC Repair",
    location: "G-13",
    complexity: "Basic",
    urgency: "Next Day",
  });
  
  const [registeredProviders, setRegisteredProviders] = useState<DisplayProvider[]>(FALLBACK_REGISTERED);
  const [mapsProviders, setMapsProviders] = useState<DisplayGMapsProvider[]>(FALLBACK_MAPS);

  useEffect(() => {
    const loadCachedResults = async () => {
      try {
        const cached = await AsyncStorage.getItem("latest_search_results");
        if (cached) {
          const parsed = JSON.parse(cached);
          
          // Set query top-bar metadata
          setQueryDetails({
            service: parsed.service?.title || parsed.service || "AC Repair",
            location: parsed.sector_code || parsed.location || "G-13",
            complexity: parsed.complexity || "Basic",
            urgency: parsed.urgency === "same_day" ? "Same Day" : "Next Day",
          });

          // Normalize registered providers list
          if (parsed.registered_providers && parsed.registered_providers.length > 0) {
            const normalized = parsed.registered_providers.map((p: any) => ({
              id: p.provider_id || p.id || Math.random().toString(),
              name: p.name,
              phone: p.phone,
              estimatedPrice: p.pricing_breakdown?.final_total
                ? `Est. PKR ${p.pricing_breakdown.final_total.toLocaleString()}`
                : "Est. PKR 2,800",
              services: p.services || "General Home Service",
              sectors: p.sectors || "Islamabad",
              rating: p.rating || 5.0,
              reviewCount: p.completed_jobs || p.reviewCount || 0,
              onTime: p.on_time || "On time 100%",
              availability: p.availability || "Available",
              isRecommended: !!p.isRecommended,
              pricing_breakdown: p.pricing_breakdown,
            }));
            setRegisteredProviders(normalized);
          } else {
            setRegisteredProviders([]);
          }

          // Normalize Google Maps fallback/seed directory list
          const mapsList = parsed.google_maps_providers || parsed.gmaps_providers;
          if (mapsList && mapsList.length > 0) {
            const normalized = mapsList.map((p: any) => ({
              name: p.name,
              phone: p.phone,
              rating: p.rating || 4.5,
              reviews_count: p.reviews_count || p.reviewCount || 10,
              address: p.address || "Islamabad",
              distance_km: p.distance_km || 2.0,
              estimatedPrice: p.pricing_breakdown?.final_total
                ? `Est. PKR ${p.pricing_breakdown.final_total.toLocaleString()}`
                : `Est. PKR ${p.estimated_rate || "1,500"}`,
              pricing_breakdown: p.pricing_breakdown,
            }));
            setMapsProviders(normalized);
          } else {
            setMapsProviders([]);
          }
        }
      } catch (err) {
        console.warn("Error loading cached search results:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCachedResults();
  }, []);

  const handleViewProfile = async (provider: DisplayProvider) => {
    try {
      await AsyncStorage.setItem("selected_provider", JSON.stringify(provider));
      router.push("/provider-profile");
    } catch (err) {
      console.warn("Failed to save selected provider:", err);
    }
  };

  const handleBookProvider = async (provider: DisplayProvider) => {
    if (!provider) return;
    try {
      const bookingDetails = {
        providerId: provider.id,
        providerName: provider.name,
        providerRating: provider.rating || 5.0,
        serviceName: queryDetails.service || provider.services || "AC Repairing",
        location: queryDetails.location || provider.sectors || "G-13, Islamabad",
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
      console.warn("Failed to initiate booking from results:", err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingScreenText}>Loading comparisons...</Text>
      </SafeAreaView>
    );
  }

  // Display exactly 2 Google Maps seeds to honor "for the time being add two service providers for each service"
  const displayedMapsProviders = mapsProviders.slice(0, 2);
  const currentResultsCount =
    activeTab === "haazir" ? registeredProviders.length : displayedMapsProviders.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.white} />
      
      {/* Dynamic top bar metadata */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {queryDetails.service} · {queryDetails.location} · {queryDetails.urgency}
        </Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="options-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Responsive tabs with dynamic totals */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("haazir")}
          style={[styles.tab, activeTab === "haazir" && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === "haazir" && styles.tabTextActive]}>
            Haazir Providers ({registeredProviders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("maps")}
          style={[styles.tab, activeTab === "maps" && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === "maps" && styles.tabTextActive]}>
            Google Maps ({displayedMapsProviders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultCount}>
          Showing {currentResultsCount} {activeTab === "haazir" ? "registered" : "Google Directory"} providers
        </Text>
        
        <View style={styles.list}>
          {activeTab === "haazir" ? (
            registeredProviders.length > 0 ? (
              registeredProviders.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onViewProfile={() => handleViewProfile(p)}
                  onBook={() => handleBookProvider(p)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.muted} />
                <Text style={styles.emptyText}>No registered Haazir providers found in this area.</Text>
              </View>
            )
          ) : (
            displayedMapsProviders.length > 0 ? (
              displayedMapsProviders.map((p, idx) => (
                <MapsProviderCard key={idx} provider={p} serviceName={queryDetails.service} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.muted} />
                <Text style={styles.emptyText}>No nearby Google Maps directories matching this service.</Text>
              </View>
            )
          )}
        </View>

        {currentResultsCount > 0 && (
          <TouchableOpacity style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>Load more providers</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg },
  loadingScreenText: { marginTop: 12, fontSize: 14, color: Colors.muted },
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
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "600", color: Colors.primary },

  tabRow: {
    height: 48,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: Colors.accent },
  tabText: { fontSize: 14, color: Colors.muted },
  tabTextActive: { fontWeight: "600", color: Colors.primary },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  resultCount: { fontSize: 11, color: Colors.muted, marginBottom: 12 },

  list: { gap: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  recommendWrapper: { alignItems: "flex-end", marginBottom: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  pillText: { fontSize: 12, fontWeight: "500" },
  namePriceRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  nameText: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  priceText: { fontSize: 18, fontWeight: "600", color: Colors.primary },
  servicesText: { marginTop: 8, fontSize: 13, color: Colors.muted },
  sectorsText: { marginTop: 4, fontSize: 12, color: Colors.muted },
  addressText: { marginTop: 8, fontSize: 13, color: Colors.muted, fontStyle: "italic" },
  statsRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  statsText: { fontSize: 13, fontWeight: "500", color: Colors.primary },
  statsDot: { color: Colors.border, fontSize: 12 },
  onTimeText: { fontSize: 13, fontWeight: "500", color: Colors.success },
  availRow: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 6 },
  availDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  availText: { fontSize: 12, color: Colors.success },
  
  actionRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 12,
  },
  buttonGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  viewProfileBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  viewProfileText: { fontSize: 13, fontWeight: "500", color: Colors.accent },
  
  bookNowBtn: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  bookNowBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.white,
  },

  pricingToggleBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  pricingToggleText: { fontSize: 13, fontWeight: "500", color: Colors.primary },

  callBtn: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  callBtnText: { fontSize: 13, fontWeight: "600", color: Colors.white },

  // Pricing breakdown visual styling
  breakdownContainer: {
    marginTop: 12,
    backgroundColor: Colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 6,
  },
  breakdownTitle: { fontSize: 12, fontWeight: "700", color: Colors.primary, marginBottom: 4 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakdownLabel: { fontSize: 12, color: "#666" },
  breakdownVal: { fontSize: 12, fontWeight: "500", color: Colors.primary },
  breakdownDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },

  emptyContainer: { padding: 40, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, color: Colors.muted, textAlign: "center" },

  loadMoreBtn: {
    marginTop: 16,
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: { fontSize: 14, color: Colors.muted },
});
