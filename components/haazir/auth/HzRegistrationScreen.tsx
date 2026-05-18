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
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { HzButton } from "../../haazir/shared/HzButton";
import { Colors, Radius } from "../../constants/theme";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/AuthContext";

interface FieldWrapperProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ iconName, children, rightIcon }) => (
  <View style={{ height: 56, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 }}>
    <Ionicons name={iconName} size={20} color={Colors.muted} />
    <View style={{ flex: 1, height: "100%" }}>{children}</View>
    {rightIcon}
  </View>
);

export const HzRegistrationScreen: React.FC = () => {
  const { signInBypass } = useAuth();
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!fullName.trim()) return Alert.alert("Missing Field", "Please enter your full name.");
    if (!phone.trim()) return Alert.alert("Missing Field", "Please enter your phone number.");
    if (password.length < 6) return Alert.alert("Weak Password", "Password must be at least 6 characters.");

    setLoading(true);

    try {
      const phoneClean = phone.replace(/\D/g, "");
      
      let signUpSuccess = false;
      let authUser = null;

      // Clean up conflicting phone record first to prevent DB upsert constraint errors
      try {
        await supabase.from("users").delete().eq("phone", phoneClean);
      } catch (delErr) {
        console.warn("Pre-register conflicting user cleanup error:", delErr);
      }

      // If they are registering a provider (testing role), use the direct developer bypass instantly!
      // This completely skips standard Supabase Auth and avoids all API rate limit blockages.
      if (role !== "provider") {
        try {
          const authEmail = email.trim() || `${phoneClean}@haazir.app`;
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: authEmail,
            password,
            options: {
              data: {
                name: fullName.trim(),
                phone: phoneClean,
                role: role || "consumer",
              },
            },
          });

          if (authError) {
            // If we are rate limited or any auth issue, trigger direct local DB bypass
            if (authError.message.includes("rate limit") || authError.status === 429) {
              console.warn("Supabase Auth rate limit hit, falling back to local DB bypass...");
            } else {
              Alert.alert("Registration Failed", authError.message);
              return;
            }
          } else if (authData?.user) {
            authUser = authData.user;
            signUpSuccess = true;
          }
        } catch (err: any) {
          console.warn("Supabase auth signUp error, falling back to bypass:", err);
        }
      }

      if (signUpSuccess && authUser) {
        // Real signup succeeded - Upsert user profile
        await supabase.from("users").upsert({
          id: authUser.id,
          name: fullName.trim(),
          phone: phoneClean,
          email: email.trim() || null,
          role: (role as "consumer" | "provider") || "consumer",
        }, { onConflict: "id" });

        // For providers via real auth, also establish bypass session with isOnboarded flag
        if (role === "provider") {
          await signInBypass({
            id: authUser.id,
            name: fullName.trim(),
            phone: phoneClean,
            email: email.trim() || null,
            role: "provider",
            isOnboarded: false,
          });
        }
      } else {
        // Bypassed local signup: Upsert user directly into public.users based on unique phone
        const { data: dbRow, error: dbErr } = await supabase
          .from("users")
          .upsert({
            name: fullName.trim(),
            phone: phoneClean,
            email: email.trim() || null,
            role: (role as "consumer" | "provider") || "consumer",
          }, { onConflict: "phone" })
          .select("id")
          .single();

        if (dbErr || !dbRow) {
          Alert.alert("Registration Failed", dbErr?.message || "Failed to create user record.");
          return;
        }

        // Establish the local developer bypass session with isOnboarded: false
        await signInBypass({
          id: dbRow.id,
          name: fullName.trim(),
          phone: phoneClean,
          email: email.trim() || null,
          role: (role as "consumer" | "provider") || "consumer",
          isOnboarded: false,
        });
      }

      // Route to appropriate home / onboarding chat
      if (role === "provider") {
        router.push("/(provider)/onboarding");
      } else {
        router.push("/(consumer)/home");
      }
    } catch (err: any) {
      Alert.alert("Unexpected Error", err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />

      <View style={styles.topBar}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>H</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subheading}>Phone required · Email optional</Text>

        <View style={styles.formGroup}>
          <FieldWrapper label="Full Name" iconName="person-outline">
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={Colors.muted}
            />
          </FieldWrapper>

          <FieldWrapper label="Phone Number" iconName="call-outline">
            <TextInput
              style={styles.input}
              placeholder="+92 3XX XXXXXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor={Colors.muted}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Password"
            iconName="lock-closed-outline"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.muted} />
              </TouchableOpacity>
            }
          >
            <TextInput
              style={styles.input}
              placeholder="Create a password (min 6 chars)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={Colors.muted}
            />
          </FieldWrapper>

          <View style={styles.emailGroup}>
            <FieldWrapper label="Email address" iconName="mail-outline">
              <TextInput
                style={styles.input}
                placeholder="Email address (optional)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={Colors.muted}
              />
            </FieldWrapper>
            <Text style={styles.emailHint}>We use email for account recovery only.</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.createBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push(`/login?role=${role || ""}`)}>
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  topBar: { height: 56, paddingHorizontal: 16, justifyContent: "center" },
  logoMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 16, fontWeight: "600", color: Colors.white },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 24, fontWeight: "600", color: Colors.primary },
  subheading: { marginTop: 4, fontSize: 13, color: Colors.muted },
  formGroup: { marginTop: 24, gap: 12 },
  fieldWrapper: { height: 56, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 },
  inputContainer: { flex: 1, height: "100%" },
  input: { flex: 1, fontSize: 15, color: Colors.primary },
  eyeBtn: { padding: 4 },
  emailGroup: { gap: 4 },
  emailHint: { fontSize: 11, color: Colors.muted, paddingLeft: 4 },
  createBtn: { marginTop: 24, height: 56, borderRadius: 12, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center" },
  createBtnText: { fontSize: 15, fontWeight: "600", color: Colors.white },
  footerRow: { marginTop: 16, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14, color: Colors.muted },
  loginText: { fontSize: 14, fontWeight: "500", color: Colors.accent },
});
