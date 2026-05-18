import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";
import { useAuth } from "../../../lib/AuthContext";

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

interface ListRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
  value?: string;
  onPress?: () => void;
}

const ListRow: React.FC<ListRowProps> = ({ icon, label, last, value, onPress }) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    style={[styles.listRow, last && { borderBottomWidth: 0 }]}
  >
    {icon && <Ionicons name={icon} size={20} color={Colors.muted} style={{ marginRight: 12 }} />}
    <Text style={styles.listLabel}>{label}</Text>
    {value && <Text style={styles.listValue}>{value}</Text>}
    <Ionicons name="chevron-forward" size={18} color={Colors.muted} style={{ marginLeft: 8 }} />
  </TouchableOpacity>
);

export const HzProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await signOut(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />

      {/* Top Bar — title only, no settings icon */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.avatar}><Ionicons name="person" size={32} color={Colors.white} /></View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{user?.name ?? "User"}</Text>
            {user?.phone ? <Text style={styles.contactText}>{user.phone}</Text> : null}
            {user?.email ? <Text style={styles.contactText}>{user.email}</Text> : null}
          </View>
          <View style={styles.badgesRow}>
            <View style={styles.bronzeBadge}>
              <Text style={styles.bronzeText}>Bronze · 5% off</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>8 bookings completed</Text>
            </View>
          </View>
        </View>

        {/* Addresses — no "+ Add" button */}
        <View style={styles.section}>
          <SectionHeader title="Saved Addresses" />
          <View style={styles.listContainer}>
            <ListRow icon="home-outline" label="Home · G-13, Street 4, House 12" />
            <ListRow icon="briefcase-outline" label="Office · F-7, Blue Area" last />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <SectionHeader title="Preferences" />
          <View style={styles.listContainer}>
            <ListRow
              icon="time-outline"
              label="Preferred Time"
              value="Morning"
              onPress={() => router.push("/(consumer)/time-preference" as any)}
              last
            />
          </View>
        </View>

        {/* Account — no Privacy row */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <View style={styles.listContainer}>
            <ListRow
              label="My Disputes"
              icon="alert-circle-outline"
              onPress={() => router.push("/(consumer)/my-disputes" as any)}
            />
            <ListRow
              label="About Haazir"
              icon="information-circle-outline"
              onPress={() => router.push("/(consumer)/about" as any)}
              last
            />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Haazir v1.0.0 — Hackathon Build</Text>
      </ScrollView>

      <HzBottomNav role="consumer" activeTab="profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    height: 56,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primary },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16, alignItems: "center" },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  profileInfo: { marginTop: 12, alignItems: "center", gap: 4 },
  nameText: { fontSize: 20, fontWeight: "600", color: Colors.primary },
  contactText: { fontSize: 14, color: Colors.muted },
  badgesRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  bronzeBadge: { height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#CD7F32", justifyContent: "center" },
  bronzeText: { fontSize: 13, fontWeight: "500", color: Colors.white },
  countBadge: { height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, justifyContent: "center" },
  countText: { fontSize: 12, color: Colors.muted },
  section: { marginTop: 24 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  listContainer: { backgroundColor: "transparent" },
  listRow: { minHeight: 48, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  listLabel: { flex: 1, fontSize: 14, color: Colors.primary },
  listValue: { fontSize: 14, color: Colors.muted },
  signOutBtn: { marginTop: 24, height: 48, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.danger, alignItems: "center", justifyContent: "center" },
  signOutText: { fontSize: 15, fontWeight: "500", color: Colors.danger },
  versionText: { marginTop: 12, fontSize: 11, color: Colors.muted, textAlign: "center" },
});
