import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "../../constants/theme";

interface NotificationItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  last?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ icon, iconBg, title, body, time, unread, last }) => (
  <View style={[styles.item, last && { borderBottomWidth: 0 }, unread && styles.itemUnread]}>
    <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={18} color={Colors.white} />
    </View>
    <View style={styles.itemBody}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemText}>{body}</Text>
      <Text style={styles.itemTime}>{time}</Text>
    </View>
    {unread && <View style={styles.unreadDot} />}
  </View>
);

export const HzNotificationsScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} pointerEvents="none">Notifications</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today */}
        <Text style={styles.sectionLabel}>Today</Text>
        <View style={[styles.card, Shadows.card]}>
          <NotificationItem
            icon="checkmark-circle"
            iconBg={Colors.success}
            title="Booking Confirmed"
            body="Ali Hassan has accepted your AC Repair request for Sat 18 May · 9:00 AM."
            time="2:18 PM"
            unread
          />
          <NotificationItem
            icon="chatbubble-ellipses"
            iconBg={Colors.accent}
            title="Message from HunarMand"
            body="Your request for AC Repairing in G-13 has been sent to 3 nearby providers."
            time="2:14 PM"
            unread
            last
          />
        </View>

        {/* Yesterday */}
        <Text style={styles.sectionLabel}>Yesterday</Text>
        <View style={[styles.card, Shadows.card]}>
          <NotificationItem
            icon="close-circle"
            iconBg={Colors.danger}
            title="Provider Declined"
            body="Usman Butt declined your AC Repair request. HunarMand is looking for another match."
            time="11:42 AM"
          />
          <NotificationItem
            icon="star"
            iconBg="#F59E0B"
            title="Rate Your Experience"
            body="How was your Sofa Cleaning with Tariq Mehmood? Leave a review."
            time="9:30 AM"
            last
          />
        </View>

        {/* Older */}
        <Text style={styles.sectionLabel}>Older</Text>
        <View style={[styles.card, Shadows.card]}>
          <NotificationItem
            icon="receipt"
            iconBg={Colors.muted}
            title="Booking Completed"
            body="Your Plumbing session with Bilal Chaudhry on 29 Apr has been marked complete."
            time="Apr 29"
            last
          />
        </View>
      </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  backBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: Colors.primary,
    zIndex: -1,
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: Colors.muted, marginTop: 8, marginBottom: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemUnread: { backgroundColor: Colors.accentVeryLight },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 2 },
  itemBody: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  itemText: { fontSize: 13, color: Colors.muted, lineHeight: 18 },
  itemTime: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginTop: 6 },
});
