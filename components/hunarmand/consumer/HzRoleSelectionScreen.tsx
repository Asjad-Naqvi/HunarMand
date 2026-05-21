import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Radius, Shadows } from "../../constants/theme";

type Role = "consumer" | "provider" | null;

export const HzRoleSelectionScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<Role>(null);

  const handleSelect = (role: "consumer" | "provider") => {
    setSelected(role);
    setTimeout(() => {
      router.push(`/register?role=${role}`);
    }, 150);
  };

  const CARDS = [
    {
      id: "consumer" as const,
      iconName: "bag-handle-outline" as const,
      title: "I need a service",
      description: "Find trusted providers for home and cleaning services in Islamabad.",
    },
    {
      id: "provider" as const,
      iconName: "construct-outline" as const,
      title: "I offer services",
      description: "Register as a provider and receive job requests from consumers.",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>H</Text>
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Let's get started</Text>
          <Text style={styles.subheading}>How will you be using HunarMand?</Text>

          {/* Cards */}
          <View style={styles.cards}>
            {CARDS.map(({ id, iconName, title, description }) => {
              const isSelected = selected === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => handleSelect(id)}
                  activeOpacity={0.8}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                    Shadows.card,
                  ]}
                >
                  <Ionicons name={iconName} size={36} color={Colors.accent} />
                  <Text style={styles.cardTitle}>{title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{description}</Text>
                  <View style={styles.chevron}>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isSelected ? Colors.accent : Colors.muted}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <Text style={styles.footer}>You can change your role later from Settings.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 120 },
  logoMark: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 14, fontWeight: "600", color: Colors.white, lineHeight: 18 },
  heading: { fontSize: 24, fontWeight: "600", lineHeight: 30, color: Colors.primary, marginTop: 16 },
  subheading: { fontSize: 14, fontWeight: "400", lineHeight: 20, color: Colors.muted, marginTop: 4 },
  cards: { marginTop: 24, gap: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 160,
    position: "relative",
  },
  cardSelected: { borderWidth: 2, borderColor: Colors.accent },
  cardTitle: { fontSize: 18, fontWeight: "600", lineHeight: 24, color: Colors.primary, marginTop: 8 },
  cardDesc: { fontSize: 13, fontWeight: "400", lineHeight: 18, color: Colors.muted, marginTop: 4, paddingRight: 28 },
  chevron: { position: "absolute", bottom: 16, right: 16 },
  footer: {
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 15,
    color: Colors.muted,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
});
