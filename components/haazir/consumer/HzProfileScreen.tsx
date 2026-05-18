import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HzBottomNav } from "../../haazir/shared/HzBottomNav";
import { Colors, Shadows } from "../../constants/theme";

const SectionHeader: React.FC<{ title: string; action?: string }> = ({ title, action }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && <Text style={styles.sectionAction}>{action}</Text>}
  </View>
);

const ListRow: React.FC<{ icon?: string; label: string; last?: boolean; value?: string }> = ({ icon, label, last, value }) => (
  <TouchableOpacity activeOpacity={0.7} style={[styles.listRow, last && { borderBottomWidth: 0 }]}>
    {icon && <Ionicons name={icon as any} size={20} color={Colors.muted} style={{ marginRight: 12 }} />}
    <Text style={styles.listLabel}>{label}</Text>
    {value && <Text style={styles.listValue}>{value}</Text>}
    <Ionicons name="chevron-forward" size={18} color={Colors.muted} style={{ marginLeft: 8 }} />
  </TouchableOpacity>
);

export const HzProfileScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ width: 48 }} />
        <Text style={styles.title} pointerEvents="none">Profile</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.avatar}><Ionicons name="person" size={32} color={Colors.white} /></View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>Sana Malik</Text>
            <Text style={styles.contactText}>+92 321 4567890</Text>
            <Text style={styles.contactText}>sana.malik@email.com</Text>
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

        {/* Addresses */}
        <View style={styles.section}>
          <SectionHeader title="Saved Addresses" action="+ Add" />
          <View style={styles.listContainer}>
            <ListRow icon="home-outline" label="Home · G-13, Street 4, House 12" />
            <ListRow icon="briefcase-outline" label="Office · F-7, Blue Area" last />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <SectionHeader title="Preferences" />
          <View style={styles.listContainer}>
            <ListRow icon="time-outline" label="Preferred Time" value="Morning" last />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <View style={styles.listContainer}>
            <ListRow label="My Disputes" />
            <ListRow label="Privacy & Data" />
            <ListRow label="About Haazir" last />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={() => router.replace("/login")} style={styles.signOutBtn}>
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
  topBar: { height: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  iconBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600", color: Colors.primary, zIndex: -1 },

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
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  sectionAction: { fontSize: 13, fontWeight: "500", color: Colors.accent },

  listContainer: { backgroundColor: "transparent" },
  listRow: { minHeight: 48, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: Colors.divider },
  listLabel: { flex: 1, fontSize: 14, color: Colors.primary },
  listValue: { fontSize: 14, color: Colors.muted },

  signOutBtn: { marginTop: 24, height: 48, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.danger, alignItems: "center", justifyContent: "center" },
  signOutText: { fontSize: 15, fontWeight: "500", color: Colors.danger },
  
  versionText: { marginTop: 12, fontSize: 11, color: Colors.muted, textAlign: "center" },
});
