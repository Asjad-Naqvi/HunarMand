import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../hunarmand/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";
import { useAuth } from "../../../lib/AuthContext";
import { supabase } from "../../../lib/supabase";

const SERVICE_CODE_MAP: Record<string, string> = {
  "HS-04": "AC Repair & Service",
  "HS-03": "Electrician Services",
  "HS-01": "Plumbing Work",
  "HS-02": "Carpenter Services",
  "CS-01": "Carpet Cleaning",
  "CS-02": "Sofa Cleaning",
};

const STATUS_MAP: Record<string, { label: string }> = {
  pending_provider_acceptance: { label: "Awaiting Acceptance" },
  confirmed: { label: "Job Confirmed" },
  en_route: { label: "En Route" },
  arrived: { label: "Arrived" },
  in_progress: { label: "In Progress" },
};

const ActiveJobBanner: React.FC<{ booking: any; onPress: () => void }> = ({ booking, onPress }) => {
  if (!booking) return null;
  const serviceName = SERVICE_CODE_MAP[booking.service_code] || booking.service_code;
  const statusLabel = STATUS_MAP[booking.status]?.label || booking.status;
  const consumerName = booking.consumer?.name || "Customer";
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.activeJobBanner}>
      <View style={styles.activeJobLeft}>
        <View style={styles.activeJobDot} />
        <View>
          <Text style={styles.activeJobLabel}>Active Job In Progress</Text>
          <Text style={styles.activeJobSub}>{serviceName} · {statusLabel} · {consumerName}</Text>
        </View>
      </View>
      <Text style={styles.activeJobCta}>Open →</Text>
    </TouchableOpacity>
  );
};

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

const JobCard: React.FC<{ service: string; timePill: string; location: string; estimate: string; onPress?: () => void }> = ({ service, timePill, location, estimate, onPress }) => (
  <View style={[styles.card, Shadows.card]}>
    <View style={styles.jobTopRow}>
      <Text style={styles.jobService}>{service}</Text>
      <View style={[styles.jobPill, { backgroundColor: timePill === "Pending" ? Colors.warning : Colors.success }]}>
        <Text style={styles.jobPillText}>{timePill}</Text>
      </View>
    </View>
    <Text style={styles.jobLocation}>{location}</Text>
    <View style={styles.jobBottomRow}>
      <Text style={styles.jobEstimate}>{estimate}</Text>
      <TouchableOpacity onPress={onPress}>
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
  const { user } = useAuth();
  const [activeJob, setActiveJob] = useState<any>(null);
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          service_code,
          final_estimate_pkr,
          requested_date,
          requested_time_slot,
          consumer:users!consumer_id(name)
        `)
        .eq("provider_id", user.id)
        .not("status", "in", "(completed,cancelled,expired)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const active = (data || []).find(b => ["en_route", "arrived", "in_progress"].includes(b.status));
      const upcoming = (data || []).filter(b => ["confirmed", "pending_provider_acceptance"].includes(b.status));

      setActiveJob(active || null);
      setUpcomingJobs(upcoming);
    } catch (err: any) {
      console.warn("Failed to load dashboard bookings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <View style={styles.logoWrap}>
          <Image source={require("../../../assets/hunarmand_icon.png")} style={{ width: 110, height: 36, resizeMode: "contain" }} />
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => router.push("/inbox")}>
          <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          {upcomingJobs.filter(b => b.status === "pending_provider_acceptance").length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {upcomingJobs.filter(b => b.status === "pending_provider_acceptance").length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeJob && (
        <ActiveJobBanner 
          booking={activeJob} 
          onPress={() => router.push("/(provider)/active-job")} 
        />
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <AvailabilityToggle />

        <View style={styles.section}><StatsCard /></View>

        <View style={styles.section}>
          <SectionHeader title="HunarMand Advisor" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.advisorScroll}>
            <AdvisorCard emoji="💡" type="Opportunity" typeColor={Colors.warning} body="High demand for AC Repair in G-10 this weekend" linkLabel="Expand service areas" />
            <AdvisorCard emoji="⭐" type="Rating" typeColor={Colors.warning} body="Your punctuality score dropped to 88%. Aim to arrive 10 min early." />
            <AdvisorCard emoji="⚠" type="Non-Response" typeColor={Colors.danger} body="You missed 2 job requests this week. 5 more and your visibility will reduce." linkLabel="View missed requests" />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Upcoming Jobs" />
          {loading ? (
            <ActivityIndicator size="small" color={Colors.accent} style={{ marginTop: 24 }} />
          ) : upcomingJobs.length === 0 ? (
            <View style={[styles.card, Shadows.card, { alignItems: "center", paddingVertical: 24, marginTop: 12 }]}>
              <Ionicons name="calendar-outline" size={32} color={Colors.muted} />
              <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 8 }}>No upcoming jobs at the moment.</Text>
            </View>
          ) : (
            <View style={styles.jobList}>
              {upcomingJobs.map((job) => {
                const serviceName = SERVICE_CODE_MAP[job.service_code] || job.service_code;
                const timeStr = `${job.requested_date} · ${job.requested_time_slot || "ASAP"}`;
                const estimateStr = `Est. PKR ${job.final_estimate_pkr || "1,000"}`;
                const locationStr = `Customer: ${job.consumer?.name || "Customer"}`;
                return (
                  <JobCard 
                    key={job.id}
                    service={serviceName} 
                    timePill={job.status === "pending_provider_acceptance" ? "Pending" : "Confirmed"} 
                    location={locationStr} 
                    estimate={estimateStr}
                    onPress={() => router.push(job.status === "pending_provider_acceptance" ? "/inbox" : "/(provider)/active-job")}
                  />
                );
              })}
            </View>
          )}
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

  activeJobBanner: { margin: 12, marginBottom: 0, borderRadius: 12, backgroundColor: Colors.accentLight, borderWidth: 1.5, borderColor: Colors.accent, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10 },
  activeJobLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  activeJobDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  activeJobLabel: { fontSize: 13, fontWeight: "600", color: Colors.accent },
  activeJobSub: { fontSize: 12, color: Colors.primary, marginTop: 1 },
  activeJobCta: { fontSize: 13, fontWeight: "600", color: Colors.accent },

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
