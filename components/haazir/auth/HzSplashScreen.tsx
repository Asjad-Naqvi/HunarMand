import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/theme";

export const HzSplashScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      
      <View style={styles.content}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>H</Text>
        </View>

        <Text style={styles.wordmark}>Haazir</Text>

        <View style={styles.taglineGroup}>
          <Text style={styles.taglineEn}>Your service, ready when you are.</Text>
          <Text style={styles.taglineUr}>حاضر ہے جب آپ کو ضرورت ہو۔</Text>
        </View>
      </View>

      <Text style={styles.footer}>© Haazir 2025</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg, position: "relative", alignItems: "center", justifyContent: "center" },
  content: { alignItems: "center" },
  logoMark: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 44, fontWeight: "600", color: Colors.white, lineHeight: 52 },
  wordmark: { marginTop: 16, fontSize: 32, fontWeight: "600", color: Colors.primary },
  taglineGroup: { marginTop: 8, alignItems: "center", gap: 4 },
  taglineEn: { fontSize: 14, color: Colors.muted, textAlign: "center" },
  taglineUr: { fontSize: 14, color: Colors.muted, textAlign: "center" },
  footer: { position: "absolute", bottom: 32, left: 0, right: 0, fontSize: 11, color: Colors.muted, textAlign: "center" },
});
