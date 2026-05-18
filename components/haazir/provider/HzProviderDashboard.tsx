import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";

const AvailabilityToggle: React.FC = () => {
  const [available, setAvailable] = useState(true);
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={styles.sectionTitle}>Your Status</Text>
        <TouchableOpacity
          onPress={() => setAvailable(!available)}
          activeOpacity={0.8}
          style={[styles.toggleBtn, { backgroundColor: available ? Colors.success : Colors.muted }]}
        >
          <Text style={styles.toggleText}>{available ? "Available ✓" : "Unavailable"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.toggleHint, { color: available ? Colors.success : Colors.muted }]}>
        {available ? "You are visible to consumers" : "You are hidden from consumers"}
      </Text>
    </View>
  );
};

const StatTile: React.FC<{ value: string; label: string; borderRight?: boolean; borderBottom?: boolean }> = ({ value, label, borderRight, borderBottom }) => (
  <View style={[styles.statTile, borderRight && { borderRightWidth: 1 }, borderBottom && { borderBottomWidth: 1 }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StatsCard: React.FC = () => (
  <View style={[styles.card, Shadows.card]}>
    <Text style={styles.cardHeaderHint}>This Month</Text>
    <View style={styles.statsGrid}>
      <StatTile value="18" label="Jobs" borderRight borderBottom />
      <StatTile value="★ 4.8" label="Rating" borderBottom />
      <StatTile value="94%" label="On Time" borderRight />
      <StatTile value="PKR 42,000 *" label="Earned" />
    </View>
    <Text style={styles.statsFooterHint}>* Simulated earnings for demo purposes.</Text>
  </View>
);

const AdvisorCard: React.FC<{ emoji: string; type: string; typeColor: string; body: string; linkLabel?: string; linkColor?: string }> = ({ emoji, type, typeColor, body, linkLabel, linkColor }) => (
  <View style={[styles.advisorCard, Shadows.card]}>
    <Text style={[styles.advisorType, { color: typeColor }]}>{emoji} {type}</Text>
    <Text style={styles.advisorBody} numberOfLines={3}>{body}</Text>
    {linkLabel && (
      <TouchableOpacity>
        <Text style={[styles.advisorLink, { color: linkColor || typeColor }]}>{linkLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const JobCard: React.FC<{ service: string; timePill: string; location: string; estimate: string }> = ({ service, timePill, location, estimate }) => (
  <View style={[styles.card, Shadows.card]}>
    <View style={styles.jobTopRow}>
      <Text style={styles.jobService}>{service}</Text>
      <View style={styles.jobPill}>
        <Text style={styles.jobPillText}>{timePill}</Text>
      </View>
    </View>
    <Text style={styles.jobLocation}>{location}</Text>
    <View style={styles.jobBottomRow}>
      <Text style={styles.jobEstimate}>{estimate}</Text>
      <TouchableOpacity>
        <Text style={styles.jobViewText}>View →</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const QuickLinkRow: React.FC<{ label: string; last?: boolean; onPress?: () => void }> = ({ label, last, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.quickLinkRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.quickLinkLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
  </TouchableOpacity>
);

export const HzProviderDashboard: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}><Text style={styles.logoChar}>H</Text></View>
          <Text style={styles.logoText}>Haazir</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => router.push("/inbox")}>
          <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <AvailabilityToggle />

        <View style={styles.section}><StatsCard /></View>

        <View style={styles.section}>
          <SectionHeader title="Haazir Advisor" action="See all" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.advisorScroll}>
            <AdvisorCard emoji="💡" type="Opportunity" typeColor={Colors.warning} body="High demand for AC Repair in G-10 this weekend" linkLabel="Expand service areas" />
            <AdvisorCard emoji="⭐" type="Rating" typeColor={Colors.warning} body="Your punctuality score dropped to 88%. Aim to arrive 10 min early." />
            <AdvisorCard emoji="⚠" type="Non-Response" typeColor={Colors.danger} body="You missed 2 job requests this week. 5 more and your visibility will reduce." linkLabel="View missed requests" />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Upcoming Jobs" action="View all" />
          <View style={styles.jobList}>
            <JobCard service="AC Repairing" timePill="Tomorrow · 9 AM" location="G-13 · House 12, Street 4" estimate="Est. PKR 2,873" />
            <JobCard service="Sofa Cleaning" timePill="Mon 20 May · 11 AM" location="F-7 · Apartment 3B" estimate="Est. PKR 1,500" />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick Links" />
          <View style={{ marginTop: 8 }}>
            <QuickLinkRow label="Past Jobs" onPress={() => router.push("/past-jobs")} />
            <QuickLinkRow label="Update My Profile / Skills" onPress={() => router.push("/(provider)/profile")} last />
          </View>
        </View>

      </ScrollView>

      <HzBottomNav role="provider" activeTab="dashboard" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoChar: { fontSize: 16, fontWeight: "600", color: Colors.white },
  logoText: { fontSize: 17, fontWeight: "600", color: Colors.primary },
  bellBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", position: "relative" },
  badge: { position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 10, fontWeight: "600", color: Colors.white },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  section: { marginTop: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  sectionAction: { fontSize: 13, fontWeight: "500", color: Colors.accent },

  toggleBtn: { width: 128, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  toggleText: { fontSize: 14, fontWeight: "500", color: Colors.white },
  toggleHint: { marginTop: 4, fontSize: 12, textAlign: "right" },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardHeaderHint: { fontSize: 11, color: Colors.muted },
  statsGrid: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderColor: Colors.divider, borderRadius: 8, overflow: "hidden" },
  statTile: { width: "50%", padding: 12, alignItems: "center", borderColor: Colors.divider },
  statValue: { fontSize: 20, fontWeight: "600", color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.muted },
  statsFooterHint: { marginTop: 8, fontSize: 11, fontStyle: "italic", color: Colors.muted, textAlign: "right" },

  advisorScroll: { marginTop: 12, gap: 8, paddingBottom: 8 },
  advisorCard: { width: 200, minHeight: 120, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 8 },
  advisorType: { fontSize: 13, fontWeight: "500" },
  advisorBody: { flex: 1, fontSize: 13, fontWeight: "500", color: Colors.primary, lineHeight: 18 },
  advisorLink: { fontSize: 12, fontWeight: "500" },

  jobList: { marginTop: 12, gap: 12 },
  jobTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  jobService: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  jobPill: { height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: Colors.warning, justifyContent: "center" },
  jobPillText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  jobLocation: { marginTop: 8, fontSize: 13, color: Colors.muted },
  jobBottomRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  jobEstimate: { fontSize: 14, fontWeight: "500", color: Colors.primary },
  jobViewText: { fontSize: 13, fontWeight: "500", color: Colors.accent },

  quickLinkRow: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  quickLinkLabel: { fontSize: 14, color: Colors.primary },
});
