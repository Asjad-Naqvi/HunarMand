import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";
import { HzChip } from "../../haazir/shared/HzChip";

type FilterChip = "all" | "completed" | "cancelled" | "upcoming";

const StatusPill: React.FC<{ label: string; bg: string }> = ({ label, bg }) => (
  <View style={[styles.statusPill, { backgroundColor: bg }]}>
    <Text style={styles.statusPillText}>{label}</Text>
  </View>
);

interface BookingCardProps {
  service: string;
  status: { label: string; bg: string };
  extraPill?: { label: string; bg: string };
  provider?: string;
  datetime?: string;
  location: string;
  amount: string;
  cancellationReason?: string;
  showViewDetails?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ service, status, extraPill, provider, datetime, location, amount, cancellationReason, showViewDetails = true }) => (
  <TouchableOpacity activeOpacity={0.8} style={[styles.card, Shadows.card]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{service}</Text>
      <View style={styles.pillStack}>
        <StatusPill label={status.label} bg={status.bg} />
        {extraPill && <StatusPill label={extraPill.label} bg={extraPill.bg} />}
      </View>
    </View>

    {!!cancellationReason && <Text style={styles.cancelReason}>{cancellationReason}</Text>}

    {(provider || datetime) && (
      <View style={styles.providerRow}>
        {!!provider && <Text style={styles.providerText}>{provider}</Text>}
        {!!datetime && <Text style={styles.datetimeText}>{datetime}</Text>}
      </View>
    )}

    <Text style={styles.locationText}>{location}</Text>

    <View style={styles.amountRow}>
      <Text style={styles.amountText}>{amount}</Text>
      {showViewDetails && <Text style={styles.viewDetailsText}>View details →</Text>}
    </View>
  </TouchableOpacity>
);

export const HzBookingsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");

  const FILTERS: { id: FilterChip; label: string }[] = [
    { id: "all",       label: "All" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "upcoming",  label: "Upcoming" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ width: 48 }} />
        <Text style={styles.title} pointerEvents="none">My Bookings</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="options-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {FILTERS.map(({ id, label }) => (
            <HzChip
              key={id}
              label={label}
              selected={activeFilter === id}
              onPress={() => setActiveFilter(id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BookingCard
          service="AC Repairing"
          status={{ label: "Upcoming", bg: Colors.accent }}
          provider="Ali Hassan"
          datetime="Sat 18 May · 9:00 AM"
          location="G-13, Islamabad"
          amount="PKR 2,873"
        />
        <BookingCard
          service="Sofa Cleaning"
          status={{ label: "Completed", bg: Colors.success }}
          provider="Tariq Mehmood"
          datetime="Tue 7 May · 11:00 AM"
          location="F-7, Islamabad"
          amount="PKR 1,500"
        />
        <BookingCard
          service="Plumber"
          status={{ label: "Completed", bg: Colors.success }}
          extraPill={{ label: "Dispute Filed", bg: Colors.warning }}
          provider="Bilal Chaudhry"
          datetime="Mon 29 Apr · 2:00 PM"
          location="G-10, Islamabad"
          amount="PKR 800"
          showViewDetails={false}
        />
        <BookingCard
          service="Electrician"
          status={{ label: "Cancelled", bg: Colors.muted }}
          cancellationReason="Provider didn't respond"
          datetime="Sat 20 Apr · 10:00 AM"
          location="G-11, Islamabad"
          amount="PKR —"
          showViewDetails={false}
        />
      </ScrollView>

      <HzBottomNav role="consumer" activeTab="bookings" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },

  filterStrip: { height: 48, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  filterContent: { paddingHorizontal: 16, alignItems: "center", gap: 8 },

  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 4 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.primary },
  pillStack: { alignItems: "flex-end", gap: 4 },
  statusPill: { height: 22, paddingHorizontal: 8, borderRadius: 11, justifyContent: "center" },
  statusPillText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  
  cancelReason: { fontSize: 12, color: Colors.danger },
  
  providerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  providerText: { flex: 1, fontSize: 14, color: Colors.muted },
  datetimeText: { fontSize: 13, color: Colors.muted },
  locationText: { fontSize: 13, color: Colors.muted },
  
  amountRow: { marginTop: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  amountText: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  viewDetailsText: { fontSize: 13, fontWeight: "500", color: Colors.accent },
});
