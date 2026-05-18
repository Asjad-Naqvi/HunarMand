import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../constants/theme";

interface FieldWrapperProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, iconName, children, rightIcon }) => (
  <View style={styles.fieldWrapper}>
    <Ionicons name={iconName} size={20} color={Colors.muted} />
    <View style={styles.inputContainer}>{children}</View>
    {rightIcon}
  </View>
);

export const HzRegistrationScreen: React.FC = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleCreate = () => {
    if (role === "provider") {
      router.push("/onboarding");
    } else {
      router.push("/profile-setup");
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
            <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} placeholderTextColor={Colors.muted} />
          </FieldWrapper>

          <FieldWrapper label="Phone Number" iconName="call-outline">
            <TextInput style={styles.input} placeholder="+92 3XX XXXXXXX" keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholderTextColor={Colors.muted} />
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
            <TextInput style={styles.input} placeholder="Create a password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} placeholderTextColor={Colors.muted} />
          </FieldWrapper>

          <View style={styles.emailGroup}>
            <FieldWrapper label="Email address" iconName="mail-outline">
              <TextInput style={styles.input} placeholder="Email address (optional)" keyboardType="email-address" value={email} onChangeText={setEmail} placeholderTextColor={Colors.muted} />
            </FieldWrapper>
            <Text style={styles.emailHint}>We use email for account recovery only.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
          <Text style={styles.createBtnText}>Create Account</Text>
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
