import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../hunarmand/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/AuthContext";

const Pill: React.FC<{ label: string; bg: string }> = ({ label, bg }) => (
  <View style={[styles.pill, { backgroundColor: bg }]}>
    <Text style={styles.pillText}>{label}</Text>
  </View>
);

interface JobCardProps {
  service: string;
  statusPills: { label: string; bg: string }[];
  meta: string;
  earned: string;
  earnedNote?: string;
  ratingLine: string;
  warning?: string;
}

const JobCard: React.FC<JobCardProps> = ({ service, statusPills, meta, earned, earnedNote, ratingLine, warning }) => (
  <View style={[styles.card, Shadows.card]}>
    <View style={styles.cardTopRow}>
      <Text style={styles.serviceText}>{service}</Text>
      <View style={styles.pillsWrap}>
        {statusPills.map(p => <Pill key={p.label} label={p.label} bg={p.bg} />)}
      </View>
    </View>

    <Text style={styles.metaText}>{meta}</Text>

    <View style={styles.earnedRow}>
      <Text style={[styles.earnedText, { color: earned === "PKR 0" ? Colors.muted : Colors.success }]}>Earned: {earned}</Text>
      {!!earnedNote && <Text style={styles.earnedNoteText}>{earnedNote}</Text>}
    </View>

    <Text style={styles.ratingLineText}>{ratingLine}</Text>

    {!!warning && <Text style={styles.warningText}>{warning}</Text>}
  </View>
);

const SummaryTile: React.FC<{ value: string; label: string; last?: boolean }> = ({ value, label, last }) => (
  <View style={[styles.summaryTile, last && { borderRightWidth: 0 }]}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const SERVICE_CODE_MAP: Record<string, string> = {
  "HS-04": "AC Repair & Service",
  "HS-03": "Electrician Services",
  "HS-01": "Plumbing Work",
  "HS-02": "Carpenter Services",
  "CS-01": "Carpet Cleaning",
  "CS-02": "Sofa Cleaning",
};

const MOCK_JOBS = [
  {
    id: "mock-1",
    status: "completed",
    service_code: "HS-04",
    final_estimate_pkr: 2800,
    requested_date: "2026-05-18",
    requested_time_slot: "09:00:00",
    consumer: { name: "Sana M." }
  },
  {
    id: "mock-2",
    status: "completed",
    service_code: "CS-02",
    final_estimate_pkr: 1500,
    requested_date: "2026-05-13",
    requested_time_slot: "11:00:00",
    consumer: { name: "Raza K." }
  },
  {
    id: "mock-3",
    status: "completed",
    service_code: "HS-03",
    final_estimate_pkr: 1200,
    requested_date: "2026-05-09",
    requested_time_slot: "14:00:00",
    consumer: { name: "Ahmed B." }
  }
];

export const HzProviderPastJobs: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [dbJobs, setDbJobs] = useState<any[]>([]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      // 1. Fetch provider profiles stats
      const { data: profData } = await supabase
        .from("provider_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (profData) {
        setProfile(profData);
      }

      // 2. Fetch completed/cancelled bookings
      const { data: bookingsData } = await supabase
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
        .in("status", ["completed", "cancelled"])
        .order("created_at", { ascending: false });

      if (bookingsData) {
        setDbJobs(bookingsData);
      }
    } catch (err: any) {
      console.warn("Failed to load past jobs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={Colors.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // Calculate stats dynamically
  const completedCount = dbJobs.filter(j => j.status === "completed").length;
  const totalJobs = completedCount + (profile?.jobs_completed ?? 42);
  
  const totalEarnedDb = dbJobs.filter(j => j.status === "completed").reduce((sum, j) => sum + (j.final_estimate_pkr || 0), 0);
  const totalEarnedVal = totalEarnedDb + (profile?.total_earnings_simulated ?? 102400);

  const avgRating = profile?.base_rating ? `★ ${parseFloat(profile.base_rating).toFixed(1)}` : "★ 4.8";

  // Format requested date beautifully
  const formatMeta = (job: any) => {
    const name = job.consumer?.name || "Client";
    const dateStr = job.requested_date || "";
    const timeStr = job.requested_time_slot || "";
    return `${name} · G-13 Sector · ${dateStr} · ${timeStr}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <Text style={styles.title}>Past Jobs</Text>
      </View>

      <View style={styles.summaryStrip}>
        <View style={styles.summaryRow}>
          <SummaryTile value={String(totalJobs)} label="Total Jobs" />
          <SummaryTile value={avgRating} label="Avg Rating" />
          <SummaryTile value={`PKR ${totalEarnedVal.toLocaleString("en-PK")} *`} label="Earned" last />
        </View>
        <Text style={styles.summaryHint}>* Live database sync enabled.</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Render database dynamic past jobs first */}
        {dbJobs.map(job => (
          <JobCard
            key={job.id}
            service={SERVICE_CODE_MAP[job.service_code] || job.service_code}
            statusPills={
              job.status === "completed" 
                ? [{ label: "Completed", bg: Colors.success }]
                : [{ label: "Declined / Cancelled", bg: Colors.muted }]
            }
            meta={formatMeta(job)}
            earned={job.status === "completed" ? `PKR ${job.final_estimate_pkr.toLocaleString("en-PK")}` : "PKR 0"}
            ratingLine={
              job.status === "completed" 
                ? "Consumer rated you: ★ 5.0 · You rated consumer: ★ 10" 
                : "Booking cancelled prior to service dispatch."
            }
          />
        ))}

        {/* Fallback mock list to keep screen rich */}
        {MOCK_JOBS.map(job => (
          <JobCard
            key={job.id}
            service={SERVICE_CODE_MAP[job.service_code] || job.service_code}
            statusPills={[{ label: "Completed", bg: Colors.success }]}
            meta={`${job.consumer.name} · G-13 · ${job.requested_date} · ${job.requested_time_slot.slice(0, 5)}`}
            earned={`PKR ${job.final_estimate_pkr.toLocaleString("en-PK")}`}
            ratingLine="Consumer rated you: ★ 4.8 · You rated consumer: ★ 8.5"
          />
        ))}
      </ScrollView>

      <HzBottomNav role="provider" activeTab="past-jobs" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },

  summaryStrip: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  summaryRow: { flexDirection: "row", alignItems: "stretch" },
  summaryTile: { flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: Colors.divider, paddingVertical: 4 },
  summaryValue: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  summaryLabel: { fontSize: 12, color: Colors.muted },
  summaryHint: { marginTop: 4, fontSize: 11, fontStyle: "italic", color: Colors.muted, textAlign: "right" },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24, gap: 12 },

  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  serviceText: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.primary },
  pillsWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 4 },
  pill: { height: 22, paddingHorizontal: 8, borderRadius: 11, justifyContent: "center" },
  pillText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  
  metaText: { marginTop: 8, fontSize: 14, color: Colors.muted },
  
  earnedRow: { marginTop: 8, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  earnedText: { fontSize: 14, fontWeight: "500" },
  earnedNoteText: { fontSize: 12, color: Colors.muted },

  ratingLineText: { marginTop: 8, fontSize: 13, color: Colors.muted },
  warningText: { marginTop: 4, fontSize: 12, color: Colors.danger },
});
