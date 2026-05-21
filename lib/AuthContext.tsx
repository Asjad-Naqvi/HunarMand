import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "consumer" | "provider";

export interface HunarMandUser {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  isOnboarded?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: HunarMandUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInBypass: (user: HunarMandUser) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signInBypass: async () => {},
  refreshProfile: async () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<HunarMandUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the matching row from public.users to get name, phone, role and onboarded status
  const fetchProfile = async (authUser: User) => {
    // 1. Try finding by ID
    let { data, error } = await supabase
      .from("users")
      .select("id, name, phone, email, role, provider_profiles(user_id)")
      .eq("id", authUser.id)
      .maybeSingle();

    // 2. If not found, try phone fallback
    if ((!data || error) && (authUser.phone || authUser.user_metadata?.phone)) {
      const userPhone = authUser.phone || authUser.user_metadata?.phone;
      const cleanPhone = userPhone.replace(/\D/g, "");
      const last10 = cleanPhone.slice(-10);
      
      const phoneVariations = [
        cleanPhone,
        `+${cleanPhone}`,
        `0${last10}`,
        `+92${last10}`,
        `92${last10}`
      ].filter((v, i, self) => v.length >= 7 && self.indexOf(v) === i);

      console.log(`[AuthContext] No user found by ID ${authUser.id}. Trying phone fallback variations:`, phoneVariations);
      
      const { data: phoneData, error: phoneError } = await supabase
        .from("users")
        .select("id, name, phone, email, role, provider_profiles(user_id)")
        .in("phone", phoneVariations)
        .maybeSingle();

      if (phoneData && !phoneError) {
        console.log(`[AuthContext] Resolved user by phone fallback: ${phoneData.id}`);
        data = phoneData;
        error = null;
      }
    }

    // 3. If still not found, try email fallback
    if ((!data || error) && (authUser.email || authUser.user_metadata?.email)) {
      const userEmail = authUser.email || authUser.user_metadata?.email;
      const emailPrefix = userEmail.split("@")[0].toLowerCase();
      
      const emailVariations = [
        userEmail.toLowerCase(),
        `${emailPrefix}@hunarmand.app`,
        `${emailPrefix}@haazir.app`
      ].filter((v, i, self) => self.indexOf(v) === i);

      console.log(`[AuthContext] Trying email fallback variations:`, emailVariations);
      
      const { data: emailData, error: emailError } = await supabase
        .from("users")
        .select("id, name, phone, email, role, provider_profiles(user_id)")
        .in("email", emailVariations)
        .maybeSingle();

      if (emailData && !emailError) {
        console.log(`[AuthContext] Resolved user by email fallback: ${emailData.id}`);
        data = emailData;
        error = null;
      }
    }

    if (data && !error) {
      const pProfiles = data.provider_profiles;
      const isOnboarded = pProfiles && (Array.isArray(pProfiles) ? pProfiles.length > 0 : !!pProfiles);
      
      const updatedUser: HunarMandUser = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role as UserRole,
        isOnboarded: !!isOnboarded,
      };
      
      setUser(updatedUser);
      console.log("[AuthContext] Resolved user profile:", updatedUser);
      
      // Update locally stored mock user if bypass session is active
      const storedSess = await AsyncStorage.getItem("hunarmand_mock_session");
      if (storedSess) {
        await AsyncStorage.setItem("hunarmand_mock_user", JSON.stringify(updatedUser));
      }
    } else {
      // Fallback: populate what we can from the auth user object
      const fallbackUser: HunarMandUser = {
        id: authUser.id,
        name: authUser.user_metadata?.name ?? null,
        phone: authUser.phone ?? authUser.user_metadata?.phone ?? null,
        email: authUser.email ?? null,
        role: (authUser.user_metadata?.role as UserRole) ?? "consumer",
        isOnboarded: false,
      };
      console.log("[AuthContext] Profile not found in public.users, using auth fallback:", fallbackUser);
      setUser(fallbackUser);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Check if we have an active developer bypass session stored locally
        const storedSess = await AsyncStorage.getItem("hunarmand_mock_session");
        const storedUser = await AsyncStorage.getItem("hunarmand_mock_user");
        
        if (storedSess && storedUser) {
          setSession(JSON.parse(storedSess));
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Error reading local mock session:", err);
      }

      // 2. Fallback to standard Supabase auth
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        if (s?.user) {
          fetchProfile(s.user).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
    };

    initializeAuth();

    // Subscribe to auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      // If we have a local mock session active, do not overwrite with null
      const storedSess = await AsyncStorage.getItem("hunarmand_mock_session");
      if (storedSess) {
        if (!s) {
          // If Supabase signed out but we are using mock auth, let's keep mock auth active
          return;
        } else {
          // If a new real user signs in, clear the mock session
          await AsyncStorage.removeItem("hunarmand_mock_session");
          await AsyncStorage.removeItem("hunarmand_mock_user");
        }
      }

      setSession(s);
      if (s?.user) {
        fetchProfile(s.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInBypass = async (mockUser: HunarMandUser) => {
    const mockSess: Session = {
      access_token: "mock_bypass_token_" + Date.now(),
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock_bypass_refresh_token",
      user: {
        id: mockUser.id,
        email: mockUser.email || `${mockUser.phone}@hunarmand.app`,
        app_metadata: {},
        user_metadata: {
          name: mockUser.name,
          phone: mockUser.phone,
          role: mockUser.role,
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as any,
    };

    // Save to AsyncStorage for persistent bypass login
    await AsyncStorage.setItem("hunarmand_mock_session", JSON.stringify(mockSess));
    await AsyncStorage.setItem("hunarmand_mock_user", JSON.stringify(mockUser));

    setSession(mockSess);
    setUser(mockUser);
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem("hunarmand_mock_session");
    await AsyncStorage.removeItem("hunarmand_mock_user");
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, signInBypass, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useAuth = () => useContext(AuthContext);
