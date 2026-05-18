import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";

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
    <Text style={styles.jobEarnText}>Est. earn: {earn} <Text style={styles.jobEarnHint}>(Haazir subsidy incl.)</Text></Text>
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

const SectionHeader: React.FC<{ title: string; badge?: number }> = ({ title, badge }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {badge != null && (
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{badge}</Text>
      </View>
    )}
  </View>
);

const NotifRow: React.FC<{ icon: string; iconColor: string; text: string; time: string; unread?: boolean; last?: boolean }> = ({ icon, iconColor, text, time, unread, last }) => (
  <View style={[styles.notifRow, unread && { backgroundColor: Colors.accentLight }, last && { borderBottomWidth: 0 }]}>
    <Ionicons name={icon as any} size={20} color={iconColor} />
    <Text style={[styles.notifText, unread && { color: Colors.primary }]}>{text}</Text>
    <Text style={styles.notifTime}>{time}</Text>
  </View>
);

export const HzProviderInbox: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ width: 80 }} />
        <Text style={styles.title} pointerEvents="none">Inbox</Text>
        <TouchableOpacity style={styles.markReadBtn}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* New Job Requests */}
        <View style={styles.section}>
          <SectionHeader title="New Job Requests" badge={2} />
          <View style={styles.cardsList}>
            <JobRequestCard
              service="AC Repairing"
              location="G-13, Islamabad"
              datetime="Tomorrow 9:00 AM"
              earn="PKR 2,873"
              consumerRating="★ 4.7"
              countdownSeconds={683}
              onPress={() => router.push("/job-request")}
              onAccept={() => {}}
              onDecline={() => {}}
            />
            <JobRequestCard
              service="Sofa Cleaning"
              location="F-7, Islamabad"
              datetime="Mon 20 May · 11 AM"
              earn="PKR 1,500"
              consumerRating="★ 4.9"
              countdownSeconds={291}
              onPress={() => router.push("/job-request")}
              onAccept={() => {}}
              onDecline={() => {}}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <SectionHeader title="Other Notifications" />
        </View>
        <View style={styles.notifsList}>
          <NotifRow icon="notifications" iconColor={Colors.accent} text="Consumer Sana Malik left you a 4.8 rating." time="2h ago" unread />
          <NotifRow icon="information-circle-outline" iconColor={Colors.muted} text="Your availability for Sunday has been updated." time="Yesterday" />
          <NotifRow icon="bar-chart-outline" iconColor={Colors.muted} text="Haazir Advisor: High AC Repair demand in G-10 this weekend." time="2d ago" last />
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
});
