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

  const ALL_BOOKINGS = [
    {
      id: "1",
      status: "upcoming" as FilterChip,
      service: "AC Repairing",
      statusPill: { label: "Upcoming", bg: Colors.accent },
      provider: "Ali Hassan",
      datetime: "Sat 18 May · 9:00 AM",
      location: "G-13, Islamabad",
      amount: "PKR 2,873",
      showViewDetails: true,
    },
    {
      id: "2",
      status: "completed" as FilterChip,
      service: "Sofa Cleaning",
      statusPill: { label: "Completed", bg: Colors.success },
      provider: "Tariq Mehmood",
      datetime: "Tue 7 May · 11:00 AM",
      location: "F-7, Islamabad",
      amount: "PKR 1,500",
      showViewDetails: true,
    },
    {
      id: "3",
      status: "completed" as FilterChip,
      service: "Plumber",
      statusPill: { label: "Completed", bg: Colors.success },
      extraPill: { label: "Dispute Filed", bg: Colors.warning },
      provider: "Bilal Chaudhry",
      datetime: "Mon 29 Apr · 2:00 PM",
      location: "G-10, Islamabad",
      amount: "PKR 800",
      showViewDetails: false,
    },
    {
      id: "4",
      status: "cancelled" as FilterChip,
      service: "Electrician",
      statusPill: { label: "Cancelled", bg: Colors.muted },
      cancellationReason: "Provider didn't respond",
      datetime: "Sat 20 Apr · 10:00 AM",
      location: "G-11, Islamabad",
      amount: "PKR —",
      showViewDetails: false,
    },
  ];

  const filteredBookings = activeFilter === "all"
    ? ALL_BOOKINGS
    : ALL_BOOKINGS.filter(b => b.status === activeFilter);

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
        <Text style={styles.title}>Bookings</Text>
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
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={Colors.border} />
            <Text style={styles.emptyText}>No {activeFilter} bookings found.</Text>
          </View>
        ) : (
          filteredBookings.map(b => (
            <BookingCard
              key={b.id}
              service={b.service}
              status={b.statusPill}
              extraPill={b.extraPill}
              provider={b.provider}
              datetime={b.datetime}
              location={b.location}
              amount={b.amount}
              cancellationReason={b.cancellationReason}
              showViewDetails={b.showViewDetails}
            />
          ))
        )}
      </ScrollView>

      <HzBottomNav role="consumer" activeTab="bookings" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },

  filterStrip: { height: 48, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  filterContent: { paddingHorizontal: 16, alignItems: "center", gap: 8 },

  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },

  emptyState: { paddingVertical: 48, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, color: Colors.muted, textAlign: "center" },

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
