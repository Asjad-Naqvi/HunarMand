import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";

const StatTile: React.FC<{ value: string; label: string; last?: boolean }> = ({ value, label, last }) => (
  <View style={[styles.statTile, last && { borderRightWidth: 0 }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const Chip: React.FC<{ label: string; variant: "amber" | "outlined" }> = ({ label, variant }) => (
  <View style={[styles.chip, variant === "amber" ? styles.chipAmber : styles.chipOutlined]}>
    <Text style={[styles.chipText, variant === "amber" ? styles.chipTextAmber : styles.chipTextOutlined]}>{label}</Text>
  </View>
);

const ScheduleRow: React.FC<{ day: string; hours: string; last?: boolean }> = ({ day, hours, last }) => (
  <View style={[styles.scheduleRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.scheduleDay}>{day}</Text>
    <Text style={[styles.scheduleHours, hours === "Unavailable" && { color: Colors.muted }]}>{hours}</Text>
  </View>
);

const AccountRow: React.FC<{ label: string; last?: boolean }> = ({ label, last }) => (
  <TouchableOpacity style={[styles.accountRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.accountLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
  </TouchableOpacity>
);

export const HzProviderProfile: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.topBar}>
        <Text style={styles.title} pointerEvents="none">My Profile</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={[styles.headerCard, Shadows.card]}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.white} />
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.nameText}>Zain Ul Abideen</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Haazir Verified</Text>
            </View>
            <Text style={styles.phoneText}>+92 300 9876543</Text>
            <Text style={styles.memberText}>Member since March 2025</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <StatTile value="42 Jobs" label="Completed" />
            <StatTile value="★ 4.8" label="Rating" />
            <StatTile value="94%" label="On Time" last />
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <SectionHeader title="Services Offered" />
          <View style={styles.chipsWrap}>
            {["AC Repairing", "AC General Service", "AC Installation"].map(s => <Chip key={s} label={s} variant="amber" />)}
          </View>
        </View>

        {/* Areas */}
        <View style={styles.section}>
          <SectionHeader title="Service Areas" />
          <View style={styles.chipsWrap}>
            {["G-10", "G-11", "G-13", "G-14", "F-7"].map(a => <Chip key={a} label={a} variant="outlined" />)}
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <SectionHeader title="My Schedule" />
          <View style={{ marginTop: 12 }}>
            {[
              { day: "Monday", hours: "8:00 AM – 5:00 PM" },
              { day: "Tuesday", hours: "8:00 AM – 5:00 PM" },
              { day: "Wednesday", hours: "8:00 AM – 5:00 PM" },
              { day: "Thursday", hours: "8:00 AM – 5:00 PM" },
              { day: "Friday", hours: "8:00 AM – 5:00 PM" },
              { day: "Saturday", hours: "9:00 AM – 2:00 PM" },
              { day: "Sunday", hours: "Unavailable" },
            ].map((d, i, a) => <ScheduleRow key={d.day} day={d.day} hours={d.hours} last={i === a.length - 1} />)}
          </View>
        </View>

        {/* Update */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => router.push("/onboarding")} style={styles.updateBtn}>
            <Text style={styles.updateBtnText}>Update My Profile / Skills →</Text>
          </TouchableOpacity>
          <Text style={styles.updateHint}>Opens the Haazir registration chat to update any field.</Text>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <View style={{ marginTop: 12 }}>
            <AccountRow label="Privacy & Data" />
            <AccountRow label="About Haazir" last />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={() => router.replace("/role-select")}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Haazir v1.0.0 — Hackathon Build</Text>

      </ScrollView>

      <HzBottomNav role="provider" activeTab="profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  headerCard: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16, alignItems: "center" },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  infoCol: { marginTop: 12, alignItems: "center", gap: 4 },
  nameText: { fontSize: 20, fontWeight: "600", color: Colors.primary },
  verifiedBadge: { height: 22, paddingHorizontal: 10, borderRadius: 11, backgroundColor: Colors.success, justifyContent: "center" },
  verifiedText: { fontSize: 12, fontWeight: "500", color: Colors.white },
  phoneText: { fontSize: 14, color: Colors.muted },
  memberText: { fontSize: 12, color: Colors.muted },
  divider: { width: "100%", height: 1, backgroundColor: Colors.divider, marginVertical: 12 },
  statsRow: { flexDirection: "row", width: "100%", alignItems: "stretch" },
  statTile: { flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: Colors.divider },
  statValue: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.muted },

  section: { marginTop: 24 },
  sectionHeader: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  chipsWrap: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { height: 32, paddingHorizontal: 12, borderRadius: 16, justifyContent: "center" },
  chipAmber: { backgroundColor: Colors.accent },
  chipOutlined: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontSize: 13, fontWeight: "500" },
  chipTextAmber: { color: Colors.white },
  chipTextOutlined: { color: Colors.primary },

  scheduleRow: { height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  scheduleDay: { fontSize: 14, color: Colors.muted },
  scheduleHours: { fontSize: 14, color: Colors.primary },

  updateBtn: { width: "100%", height: 56, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  updateBtnText: { fontSize: 15, fontWeight: "500", color: Colors.accent },
  updateHint: { marginTop: 8, fontSize: 11, color: Colors.muted, textAlign: "center" },

  accountRow: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  accountLabel: { fontSize: 14, color: Colors.primary },

  signOutBtn: { marginTop: 24, width: "100%", height: 48, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.danger, alignItems: "center", justifyContent: "center" },
  signOutText: { fontSize: 15, fontWeight: "500", color: Colors.danger },

  versionText: { marginTop: 12, fontSize: 11, color: Colors.muted, textAlign: "center" },
});
