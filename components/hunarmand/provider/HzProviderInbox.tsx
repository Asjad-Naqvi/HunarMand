import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../hunarmand/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";
import { useAuth } from "../../../lib/AuthContext";
import { supabase } from "../../../lib/supabase";

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return { display: `${mm}:${ss}`, seconds };
}

const CountdownPill: React.FC<{ initialSeconds: number }> = ({ initialSeconds }) => {
  const { display, seconds } = useCountdown(initialSeconds);
  const isLow = seconds <= 300;
  return (
    <View style={[styles.countdownPill, { backgroundColor: isLow ? Colors.warning : Colors.accent }]}>
      <Text style={styles.countdownText}>{display} remaining</Text>
    </View>
  );
};

interface JobRequestCardProps {
  service: string;
  location: string;
  datetime: string;
  earn: string;
  consumerRating: string;
  countdownSeconds: number;
  onAccept?: () => void;
  onDecline?: () => void;
  onPress?: () => void;
}

const JobRequestCard: React.FC<JobRequestCardProps> = ({ service, location, datetime, earn, consumerRating, countdownSeconds, onAccept, onDecline, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.jobCard, Shadows.card]}>
    <View style={styles.jobTopRow}>
      <Text style={styles.jobNewText}>New Job Request</Text>
      <CountdownPill initialSeconds={countdownSeconds} />
    </View>

    <Text style={styles.jobService}>{service}</Text>
    <Text style={styles.jobLocation}>{location} · {datetime}</Text>
    <Text style={styles.jobEarnText}>Est. earn: {earn} <Text style={styles.jobEarnHint}>(subsidy incl.)</Text></Text>
    <Text style={styles.jobRating}>Consumer Rating: {consumerRating}</Text>

    <View style={styles.divider} />

    <View style={styles.jobActionRow}>
      <TouchableOpacity onPress={onAccept} style={styles.acceptBtn}>
        <Text style={styles.acceptBtnText}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDecline} style={styles.declineBtn}>
        <Text style={styles.declineBtnText}>Decline</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

interface DisputeCardProps {
  service: string;
  consumerName: string;
  datetime: string;
  message: string;
  onResolve?: () => void;
}

const DisputeCard: React.FC<DisputeCardProps> = ({ service, consumerName, datetime, message, onResolve }) => (
  <View style={[styles.jobCard, Shadows.card, { borderLeftColor: "#ef4444" }]}>
    <View style={styles.jobTopRow}>
      <Text style={[styles.jobNewText, { color: "#ef4444" }]}>⚠️ Customer Dispute</Text>
    </View>

    <Text style={styles.jobService}>{service}</Text>
    <Text style={styles.jobLocation}>Customer: {consumerName} · {datetime}</Text>
    
    <View style={{ backgroundColor: "#fef2f2", borderRadius: 8, padding: 10, marginVertical: 8, borderWidth: 1, borderColor: "#fee2e2" }}>
      <Text style={{ fontSize: 13, color: "#991b1b", fontStyle: "italic", lineHeight: 18 }}>
        💬 Customer's Message: "{message}"
      </Text>
    </View>

    <View style={styles.jobActionRow}>
      <TouchableOpacity onPress={onResolve} style={[styles.acceptBtn, { backgroundColor: "#10b981" }]}>
        <Text style={styles.acceptBtnText}>Resolve Dispute ✓</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const SectionHeader: React.FC<{ title: string; badge?: number }> = ({ title, badge }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {badge != null && badge > 0 && (
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{badge}</Text>
      </View>
    )}
  </View>
);

const NotifRow: React.FC<{ icon: string; iconColor: string; text: string; time: string; unread?: boolean; last?: boolean; onPress?: () => void }> = ({ icon, iconColor, text, time, unread, last, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[styles.notifRow, unread && { backgroundColor: Colors.accentLight }, last && { borderBottomWidth: 0 }]}
  >
    <Ionicons name={icon as any} size={20} color={iconColor} />
    <Text style={[styles.notifText, unread && { color: Colors.primary, fontWeight: "500" }]}>{text}</Text>
    <View style={{ alignItems: "flex-end", gap: 4 }}>
      <Text style={styles.notifTime}>{time}</Text>
      {unread && <View style={styles.unreadDot} />}
    </View>
  </TouchableOpacity>
);

interface Notif {
  id: string;
  icon: string;
  iconColor: string;
  text: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFS: Notif[] = [
  { id: "1", icon: "notifications",        iconColor: Colors.accent, text: "Welcome to HunarMand! Start receiving job dispatches instantly.", time: "Today", unread: true  },
];

const SERVICE_CODE_MAP: Record<string, string> = {
  "HS-04": "AC Repair & Service",
  "HS-03": "Electrician Services",
  "HS-01": "Plumbing Work",
  "HS-02": "Carpenter Services",
  "CS-01": "Carpet Cleaning",
  "CS-02": "Sofa Cleaning",
};

export const HzProviderInbox: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [jobRequests, setJobRequests] = useState<any[]>([]);
  const [disputedJobs, setDisputedJobs] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
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
          consumer:users!consumer_id(name),
          disputes!booking_id(description_json, status)
        `)
        .eq("provider_id", user.id)
        .in("status", ["pending_provider_acceptance", "disputed"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const requests = (data || []).filter(b => b.status === "pending_provider_acceptance");
      const disputes = (data || []).filter(b => b.status === "disputed");

      setJobRequests(requests);
      setDisputedJobs(disputes);
    } catch (err: any) {
      console.warn("Failed to load inbox requests:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, nextStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: nextStatus })
        .eq("id", bookingId);

      if (error) throw error;
      
      Alert.alert(
        nextStatus === "confirmed" ? "Job Accepted ✓" : "Job Declined ❌",
        nextStatus === "confirmed" 
          ? "The job is confirmed. Go to the Active Job tab to track progress!" 
          : "You declined the request.",
        [{ text: "OK", onPress: () => {
          fetchInbox();
          if (nextStatus === "confirmed") {
            router.push("/(provider)/active-job" as any);
          }
        }}]
      );
    } catch (err: any) {
      Alert.alert("Action Failed", err.message);
    }
  };

  // Resolve Customer Dispute
  const handleResolveDispute = async (bookingId: string) => {
    try {
      setLoading(true);
      
      // 1. Update dispute status to resolved
      const { error: disputeErr } = await supabase
        .from("disputes")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("booking_id", bookingId);

      if (disputeErr) throw disputeErr;

      // 2. Update booking status to completed
      const { error: bookingErr } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      if (bookingErr) throw bookingErr;

      Alert.alert("Dispute Resolved ✓", "You have successfully resolved the customer's dispute. The job is marked as completed!");
      fetchInbox();
    } catch (err: any) {
      Alert.alert("Failed to resolve dispute", err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const unreadCount = notifs.filter(n => n.unread).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={Colors.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ width: 80 }} />
        <Text style={styles.title} pointerEvents="none">Inbox</Text>
        <TouchableOpacity style={styles.markReadBtn} onPress={markAllRead} disabled={unreadCount === 0}>
          <Text style={[styles.markReadText, unreadCount === 0 && { color: Colors.muted }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* New Job Requests */}
        <View style={styles.section}>
          <SectionHeader title="New Job Dispatches" badge={jobRequests.length} />
          <View style={styles.cardsList}>
            {jobRequests.length > 0 ? (
              jobRequests.map(job => (
                <JobRequestCard
                  key={job.id}
                  service={SERVICE_CODE_MAP[job.service_code] || job.service_code}
                  location="G-13, Islamabad"
                  datetime={`${job.requested_date} · ${job.requested_time_slot}`}
                  earn={`PKR ${job.final_estimate_pkr}`}
                  consumerRating="★ 5.0"
                  countdownSeconds={900}
                  onPress={() => router.push("/(provider)/active-job")}
                  onAccept={() => handleUpdateStatus(job.id, "confirmed")}
                  onDecline={() => handleUpdateStatus(job.id, "cancelled")}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="mail-open-outline" size={32} color={Colors.border} />
                <Text style={styles.emptyText}>No pending dispatches right now.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Customer Disputes Section */}
        <View style={styles.section}>
          <SectionHeader title="Active Customer Disputes" badge={disputedJobs.length} />
          <View style={styles.cardsList}>
            {disputedJobs.length > 0 ? (
              disputedJobs.map(job => {
                const disputeMsg = job.disputes && job.disputes.length > 0 
                  ? job.disputes[0].description_json?.message || "Service quality complaint"
                  : "Service quality complaint";

                return (
                  <DisputeCard
                    key={job.id}
                    service={SERVICE_CODE_MAP[job.service_code] || job.service_code}
                    consumerName={job.consumer?.name || "Customer"}
                    datetime={`${job.requested_date} · ${job.requested_time_slot}`}
                    message={disputeMsg}
                    onResolve={() => handleResolveDispute(job.id)}
                  />
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="shield-checkmark-outline" size={32} color={Colors.border} />
                <Text style={styles.emptyText}>Excellent! No active customer disputes.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <SectionHeader title="Other Alerts" />
        </View>
        <View style={styles.notifsList}>
          {notifs.map((n, i) => (
            <NotifRow
              key={n.id}
              icon={n.icon}
              iconColor={n.iconColor}
              text={n.text}
              time={n.time}
              unread={n.unread}
              last={i === notifs.length - 1}
              onPress={() => markRead(n.id)}
            />
          ))}
        </View>

      </ScrollView>

      <HzBottomNav role="provider" activeTab="inbox" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },
  markReadBtn: { padding: 4 },
  markReadText: { fontSize: 13, fontWeight: "500", color: Colors.accent },

  scroll: { flex: 1 },
  content: { paddingBottom: 24 },

  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  sectionBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  sectionBadgeText: { fontSize: 11, fontWeight: "600", color: Colors.white },

  cardsList: { marginTop: 12, gap: 12 },
  jobCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 4, borderLeftColor: Colors.accent, padding: 16 },
  jobTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  jobNewText: { fontSize: 15, fontWeight: "600", color: Colors.accent },
  countdownPill: { height: 22, paddingHorizontal: 8, borderRadius: 11, justifyContent: "center" },
  countdownText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  jobService: { marginTop: 8, fontSize: 16, fontWeight: "600", color: Colors.primary },
  jobLocation: { marginTop: 4, fontSize: 14, color: Colors.muted },
  jobEarnText: { marginTop: 4, fontSize: 14, fontWeight: "500", color: Colors.success },
  jobEarnHint: { fontSize: 12, fontWeight: "400", color: Colors.muted },
  jobRating: { marginTop: 4, fontSize: 12, color: Colors.muted },
  
  divider: { height: 1, backgroundColor: Colors.divider, marginTop: 12, marginBottom: 12 },
  
  jobActionRow: { flexDirection: "row", gap: 12 },
  acceptBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  acceptBtnText: { fontSize: 14, fontWeight: "600", color: Colors.white },
  declineBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.danger, alignItems: "center", justifyContent: "center" },
  declineBtnText: { fontSize: 14, fontWeight: "500", color: Colors.danger },

  notifsList: { marginTop: 12 },
  notifRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, paddingHorizontal: 16, paddingVertical: 8 },
  notifText: { flex: 1, fontSize: 14, color: Colors.muted },
  notifTime: { fontSize: 11, color: Colors.muted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },

  emptyCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 24, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 13, color: Colors.muted },
});
