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
import { useRouter } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius } from "../../constants/theme";

export const HzRegistrationScreen: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

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
            <Text style={styles.heading}>Create Account</Text>
            <Text style={styles.subheading}>Phone required · Email optional</Text>

            {/* Fields */}
            <View style={styles.fields}>
              <FieldWrapper label="Full Name" leadingIconName="person-outline">
                <TextInput
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.muted}
                  style={styles.input}
                />
              </FieldWrapper>

              <FieldWrapper label="Phone Number" leadingIconName="call-outline">
                <TextInput
                  placeholder="+92 3XX XXXXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.muted}
                  style={styles.input}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Password"
                leadingIconName="lock-closed-outline"
                trailingNode={
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} activeOpacity={0.7} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.muted} />
                  </TouchableOpacity>
                }
              >
                <TextInput
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={Colors.muted}
                  style={styles.input}
                />
              </FieldWrapper>

              <View style={{ gap: 4 }}>
                <FieldWrapper label="Email address (optional)" leadingIconName="mail-outline">
                  <TextInput
                    placeholder="Email address (optional)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={Colors.muted}
                    style={styles.input}
                  />
                </FieldWrapper>
                <Text style={styles.hint}>We use email for account recovery only.</Text>
              </View>
            </View>

            {/* CTA */}
            <View style={{ marginTop: 24 }}>
              <HzButton variant="primary" fullWidth onPress={() => router.push("/role-select")}>
                Create Account
              </HzButton>
            </View>

            {/* Footer link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.footerLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

interface FieldWrapperProps {
  label: string;
  leadingIconName: keyof typeof Ionicons.glyphMap;
  trailingNode?: React.ReactNode;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ leadingIconName, trailingNode, children }) => (
  <View style={styles.fieldRow}>
    <Ionicons name={leadingIconName} size={20} color={Colors.muted} />
    {children}
    {trailingNode}
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
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
  hint: { fontSize: 11, fontWeight: "400", lineHeight: 15, color: Colors.muted, paddingLeft: 4 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { fontSize: 14, fontWeight: "400", lineHeight: 20, color: Colors.muted },
  footerLink: { fontSize: 14, fontWeight: "500", lineHeight: 20, color: Colors.accent },
});
