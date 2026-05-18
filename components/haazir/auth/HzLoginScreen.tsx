import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius } from "../../constants/theme";

export const HzLoginScreen: React.FC = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "android" ? "padding" : "height"}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>H</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>Log in with your phone number.</Text>

            <View style={styles.fields}>
              {/* Phone */}
              <View style={styles.fieldRow}>
                <Ionicons name="call-outline" size={20} color={Colors.muted} />
                <TextInput
                  placeholder="+92 3XX XXXXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.muted}
                  style={styles.input}
                />
              </View>

              {/* Password */}
              <View style={styles.fieldRow}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.muted} />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={Colors.muted}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} activeOpacity={0.7} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot */}
            <View style={styles.forgotRow}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <View style={{ marginTop: 16 }}>
              <HzButton variant="primary" fullWidth onPress={() => {
                if (role === "provider") {
                  router.replace("/dashboard");
                } else {
                  router.replace("/home");
                }
              }}>
                Log In
              </HzButton>
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New to Haazir? </Text>
              <TouchableOpacity onPress={() => router.replace(`/register?role=${role || ""}`)}>
                <Text style={styles.footerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, paddingHorizontal: 16, justifyContent: "center" },
  logoMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 16, fontWeight: "600", color: Colors.white, lineHeight: 20 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  heading: { fontSize: 24, fontWeight: "600", lineHeight: 30, color: Colors.primary },
  subheading: { fontSize: 13, fontWeight: "400", lineHeight: 18, color: Colors.muted, marginTop: 4 },
  fields: { marginTop: 24, gap: 12 },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontWeight: "400", color: Colors.primary },
  eyeBtn: { padding: 4, minWidth: 32, minHeight: 32, alignItems: "center", justifyContent: "center" },
  forgotRow: { marginTop: 8, alignItems: "flex-end" },
  forgotLink: { fontSize: 13, fontWeight: "500", lineHeight: 18, color: Colors.accent },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { fontSize: 14, fontWeight: "400", lineHeight: 20, color: Colors.muted },
  footerLink: { fontSize: 14, fontWeight: "500", lineHeight: 20, color: Colors.accent },
});
