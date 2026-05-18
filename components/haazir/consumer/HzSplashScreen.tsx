import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/theme";

export const HzSplashScreen: React.FC = () => (
  <View style={styles.root}>
    <StatusBar style="dark" backgroundColor={Colors.bg} />
    {/* Centre group */}
    <View style={styles.center}>
      {/* Logo mark */}
      <View style={styles.logo}>
        <Text style={styles.logoLetter}>H</Text>
      </View>

      {/* Wordmark */}
      <Text style={styles.wordmark}>Haazir</Text>

      {/* Taglines */}
      <View style={styles.taglineGroup}>
        <Text style={styles.tagline}>Your service, ready when you are.</Text>
        <Text style={styles.taglineUrdu}>حاضر ہے جب آپ کو ضرورت ہو۔</Text>
      </View>
    </View>

    {/* Footer */}
    <Text style={styles.footer}>© Haazir 2025</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 44,
    fontWeight: "600",
    color: Colors.white,
    lineHeight: 52,
  },
  wordmark: {
    fontSize: 32,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 16,
    lineHeight: 38,
  },
  taglineGroup: {
    marginTop: 8,
    alignItems: "center",
    gap: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: Colors.muted,
    textAlign: "center",
  },
  taglineUrdu: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: Colors.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 15,
    color: Colors.muted,
    textAlign: "center",
  },
});
