import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
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

const FALLBACK_PROVIDER: DisplayProvider = {
  id: "1",
  name: "Ali Hassan",
  estimatedPrice: "Est. PKR 2,800",
  services: "AC Repairing · AC Installation",
  sectors: "G-10, G-11, G-13, G-14",
  rating: 4.8,
  reviewCount: 32,
  onTime: "On time 94%",
  availability: "Available tomorrow 8am – 1pm",
  pricing_breakdown: {
    base_rate: 2000,
    distance_surcharge: 30,
    urgency_surcharge: 300,
    complexity_surcharge: 200,
    surge_surcharge: 370,
    loyalty_discount: 100,
    final_total: 2800,
  },
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const Divider: React.FC = () => <View style={styles.divider} />;

const ServiceChip: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.serviceChip}>
    <Text style={styles.serviceChipText}>{label}</Text>
  </View>
);

const AreaChip: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.areaChip}>
    <Text style={styles.areaChipText}>{label}</Text>
  </View>
);

const SCHEDULE: { day: string; hours: string | null }[] = [
  { day: "Monday", hours: "8:00 AM – 5:00 PM" },
  { day: "Tuesday", hours: "8:00 AM – 5:00 PM" },
  { day: "Wednesday", hours: null },
  { day: "Thursday", hours: "8:00 AM – 5:00 PM" },
  { day: "Friday", hours: "8:00 AM – 2:00 PM" },
  { day: "Saturday", hours: "9:00 AM – 3:00 PM" },
  { day: "Sunday", hours: null },
];

const REVIEWS: { reviewer: string; date: string; text: string }[] = [
  { reviewer: "Asma Tariq", date: "3 days ago", text: "AC nay pehli baar mein theek kar diya. Bohat professional tha. Zaroor book karuungi." },
  { reviewer: "Hamza Malik", date: "1 week ago", text: "On time, neat work, and reasonable price. Highly recommend for G-13 area." },
];

const ReviewCard: React.FC<{ reviewer: string; date: string; text: string }> = ({ reviewer, date, text }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={[styles.reviewCard, Shadows.card]}>
      <View style={styles.reviewHeader}>
        <Text style={styles.starsText}>★★★★★</Text>
        <Text style={styles.reviewMeta}>{reviewer} · {date}</Text>
      </View>
      <Text style={styles.reviewText} numberOfLines={expanded ? undefined : 3}>{text}</Text>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={styles.reviewExpandText}>{expanded ? "Show less ↑" : "Read more ↓"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const HzProviderProfileScreen: React.FC = () => {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [provider, setProvider] = useState<DisplayProvider>(FALLBACK_PROVIDER);

  const servicesList = typeof provider.services === "string" && provider.services
    ? provider.services.split(/\s*·\s*|,\s*/)
    : ["General Home Service"];

  const sectorsList = typeof provider.sectors === "string" && provider.sectors
    ? provider.sectors.split(/\s*·\s*|,\s*/)
    : ["Islamabad"];

  useEffect(() => {
    const fetchSelectedProvider = async () => {
      try {
        const cached = await AsyncStorage.getItem("selected_provider");
        if (cached) {
          setProvider(JSON.parse(cached));
        }
      } catch (err) {
        console.warn("Failed to load selected provider:", err);
      }
    };
    fetchSelectedProvider();
  }, []);

  const handleBookProvider = async () => {
    try {
      let service = servicesList[0] || "AC Repairing";
      let location = provider.sectors || "G-13, Islamabad";
      
      const cached = await AsyncStorage.getItem("latest_search_results");
      if (cached) {
        const parsed = JSON.parse(cached);
        service = parsed.service?.title || parsed.service || service;
        location = parsed.sector_code || parsed.location || location;
      }
      
      const bookingDetails = {
        providerId: provider.id,
        providerName: provider.name,
        providerRating: provider.rating || 5.0,
        serviceName: service,
        location: location,
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
      console.warn("Failed to initiate booking from profile:", err);
    }
  };

  const baseRating = provider.rating || 5.0;
  const scale = baseRating / 4.8;
  const qualityOfWork = Math.min(5.0, Math.max(1.0, 4.9 * scale));
  const punctuality = Math.min(5.0, Math.max(1.0, 4.7 * scale));
  const communication = Math.min(5.0, Math.max(1.0, 4.8 * scale));
  const valueForMoney = Math.min(5.0, Math.max(1.0, 4.6 * scale));

  const primaryService = servicesList[0] || "Service";

  const getDynamicReviews = () => {
    const isACService = primaryService.toLowerCase().includes("ac");
    return REVIEWS.map(r => {
      if (!isACService && r.text.includes("AC")) {
        return {
          ...r,
          text: r.text.replace("AC", primaryService),
        };
      }
      return r;
    });
  };

  const dynamicRatings = [
    { label: `Quality of ${primaryService}`, score: qualityOfWork },
    { label: "Punctuality", score: punctuality },
    { label: "Communication", score: communication },
    { label: "Value for Money", score: valueForMoney },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.white} />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Provider Profile</Text>
        <TouchableOpacity onPress={() => setSaved(!saved)} style={styles.iconBtn}>
          <Ionicons name={saved ? "heart" : "heart-outline"} size={24} color={saved ? Colors.danger : Colors.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={[styles.profileCard, Shadows.card]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={Colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{provider.name}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Haazir Verified</Text>
              </View>
            </View>
          </View>

          <Divider />

          <View style={styles.statsRow}>
            {[
              { value: provider.rating ? provider.rating.toFixed(1) : "5.0", label: "Rating" },
              { value: provider.reviewCount !== undefined ? provider.reviewCount.toString() : "0", label: "Reviews" },
              { value: provider.onTime || "100%", label: "On Time" },
            ].map((s, i, a) => (
              <React.Fragment key={s.label}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < a.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>

          <Divider />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginVertical: 2 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }} />
            <Text style={{ fontSize: 13, color: Colors.success, fontWeight: "600" }}>{provider.availability || "Available"}</Text>
          </View>
          <Text style={[styles.memberText, { marginTop: 4 }]}>Member since January 2025</Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <SectionHeader title="Services Offered" />
          <View style={styles.chipRow}>
            {servicesList.map(s => <ServiceChip key={s} label={s} />)}
          </View>
        </View>

        {/* Areas */}
        <View style={styles.section}>
          <SectionHeader title="Service Areas" />
          <View style={styles.chipRow}>
            {sectorsList.map(a => <AreaChip key={a} label={a} />)}
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <SectionHeader title="Weekly Schedule" />
          <View style={{ marginTop: 8 }}>
            {SCHEDULE.map(({ day, hours }) => (
              <View key={day} style={styles.scheduleRow}>
                <Text style={styles.scheduleText}>{day}</Text>
                <Text style={[styles.scheduleText, !hours && { color: Colors.muted }]}>{hours ?? "Unavailable"}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ratings */}
        <View style={styles.section}>
          <SectionHeader title="Rating Breakdown" />
          <View style={{ marginTop: 8 }}>
            {dynamicRatings.map(({ label, score }) => (
              <View key={label} style={styles.scheduleRow}>
                <Text style={styles.scheduleText}>{label}</Text>
                <Text style={styles.ratingScore}>{score.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <SectionHeader title="Recent Reviews" />
          <View style={{ marginTop: 8, gap: 12 }}>
            {(!provider.reviewCount || provider.reviewCount === 0) ? (
              <View style={[styles.reviewCard, Shadows.card, { alignItems: "center", paddingVertical: 24, gap: 8 }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.muted} />
                <Text style={{ fontSize: 14, color: Colors.muted, textAlign: "center", fontStyle: "italic", fontWeight: "500" }}>
                  No reviews yet. Be the first to book and rate this provider!
                </Text>
              </View>
            ) : (
              getDynamicReviews().map(r => <ReviewCard key={r.reviewer} {...r} />)
            )}
          </View>
        </View>

        <Text style={styles.disputeText}>0 formal disputes</Text>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookProvider} activeOpacity={0.8}>
          <Text style={styles.bookBtnText}>Book {provider.name} — {provider.estimatedPrice}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  profileCard: { marginTop: 16, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  profileInfo: { gap: 4 },
  profileName: { fontSize: 20, fontWeight: "600", color: Colors.primary },
  verifiedBadge: { alignSelf: "flex-start", paddingHorizontal: 10, height: 22, borderRadius: 20, backgroundColor: Colors.success, justifyContent: "center" },
  verifiedText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 12 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statBox: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontWeight: "600", color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.muted },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.divider },
  memberText: { fontSize: 11, color: Colors.muted, textAlign: "center" },

  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  chipRow: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  serviceChip: { paddingHorizontal: 8, height: 28, borderRadius: 16, backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accent, justifyContent: "center" },
  serviceChipText: { fontSize: 13, color: Colors.accent },
  areaChip: { paddingHorizontal: 8, height: 28, borderRadius: 16, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, justifyContent: "center" },
  areaChipText: { fontSize: 13, color: Colors.primary },

  scheduleRow: { height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  scheduleText: { fontSize: 14, color: Colors.primary },
  ratingScore: { fontSize: 15, fontWeight: "600", color: Colors.primary },

  reviewCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  reviewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  starsText: { fontSize: 13, fontWeight: "500", color: Colors.accent },
  reviewMeta: { fontSize: 11, color: Colors.muted },
  reviewText: { marginTop: 8, fontSize: 14, color: Colors.primary, lineHeight: 20 },
  reviewExpandText: { marginTop: 4, fontSize: 12, fontWeight: "500", color: Colors.accent },

  disputeText: { marginTop: 24, fontSize: 12, color: Colors.success },

  footer: { height: 72, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider, paddingHorizontal: 16, justifyContent: "center" },
  bookBtn: { height: 48, borderRadius: 12, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  bookBtnText: { fontSize: 15, fontWeight: "600", color: Colors.white },
});
