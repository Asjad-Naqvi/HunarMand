import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../constants/theme";

type Role = "consumer" | "provider" | null;

interface RoleCardProps {
  id: "consumer" | "provider";
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ iconName, title, description, isSelected, onSelect }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onSelect}
    style={[
      styles.card,
      Shadows.card,
      isSelected ? styles.cardSelected : styles.cardUnselected
    ]}
  >
    <Ionicons name={iconName} size={36} color={Colors.accent} />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDesc} numberOfLines={2}>{description}</Text>
    
    <View style={styles.chevron}>
      <Ionicons name="chevron-forward" size={20} color={isSelected ? Colors.accent : Colors.muted} />
    </View>
  </TouchableOpacity>
);

interface HzRoleSelectionScreenProps {
  onSelect?: (role: "consumer" | "provider") => void;
}

export const HzRoleSelectionScreen: React.FC<HzRoleSelectionScreenProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<Role>(null);

  const handleSelect = (id: "consumer" | "provider") => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>H</Text>
        </View>

        <Text style={styles.heading}>Let's get started</Text>
        <Text style={styles.subheading}>How will you be using HunarMand?</Text>

        <View style={styles.cardsWrap}>
          <RoleCard
            id="consumer"
            iconName="bag-outline"
            title="I need a service"
            description="Find trusted providers for home and cleaning services in Islamabad."
            isSelected={selected === "consumer"}
            onSelect={() => handleSelect("consumer")}
          />
          <RoleCard
            id="provider"
            iconName="build-outline"
            title="I offer services"
            description="Register as a provider and receive job requests from consumers."
            isSelected={selected === "provider"}
            onSelect={() => handleSelect("provider")}
          />
        </View>
      </ScrollView>

      <Text style={styles.footerHint}>You can change your role later from Settings.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 120, paddingTop: 24 },

  logoMark: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 14, fontWeight: "600", color: Colors.white },
  
  heading: { marginTop: 16, fontSize: 24, fontWeight: "600", color: Colors.primary },
  subheading: { marginTop: 4, fontSize: 14, color: Colors.muted },

  cardsWrap: { marginTop: 24, gap: 12 },
  card: { height: 160, backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, padding: 16, position: "relative" },
  cardUnselected: { borderColor: Colors.border },
  cardSelected: { borderColor: Colors.accent, borderWidth: 2 },
  cardTitle: { marginTop: 8, fontSize: 18, fontWeight: "600", color: Colors.primary },
  cardDesc: { marginTop: 4, fontSize: 13, color: Colors.muted, paddingRight: 28 },
  chevron: { position: "absolute", bottom: 16, right: 16 },

  footerHint: { position: "absolute", bottom: 48, left: 0, right: 0, textAlign: "center", fontSize: 11, color: Colors.muted, paddingHorizontal: 16 },
});
