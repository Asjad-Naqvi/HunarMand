import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "consumer" | "provider";

export interface HaazirUser {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  isOnboarded?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: HaazirUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInBypass: (user: HaazirUser) => Promise<void>;
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
  const [user, setUser] = useState<HaazirUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the matching row from public.users to get name, phone, role and onboarded status
  const fetchProfile = async (authUser: User) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, phone, email, role, provider_profiles(user_id)")
      .eq("id", authUser.id)
      .single();

    if (data && !error) {
      const pProfiles = data.provider_profiles;
      const isOnboarded = pProfiles && (Array.isArray(pProfiles) ? pProfiles.length > 0 : !!pProfiles);
      
      const updatedUser: HaazirUser = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role as UserRole,
        isOnboarded: !!isOnboarded,
      };
      
      setUser(updatedUser);
      
      // Update locally stored mock user if bypass session is active
      const storedSess = await AsyncStorage.getItem("haazir_mock_session");
      if (storedSess) {
        await AsyncStorage.setItem("haazir_mock_user", JSON.stringify(updatedUser));
      }
    } else {
      // Fallback: populate what we can from the auth user object
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.name ?? null,
        phone: authUser.phone ?? null,
        email: authUser.email ?? null,
        role: (authUser.user_metadata?.role as UserRole) ?? "consumer",
        isOnboarded: false,
      });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Check if we have an active developer bypass session stored locally
        const storedSess = await AsyncStorage.getItem("haazir_mock_session");
        const storedUser = await AsyncStorage.getItem("haazir_mock_user");
        
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
      const storedSess = await AsyncStorage.getItem("haazir_mock_session");
      if (storedSess) {
        if (!s) {
          // If Supabase signed out but we are using mock auth, let's keep mock auth active
          return;
        } else {
          // If a new real user signs in, clear the mock session
          await AsyncStorage.removeItem("haazir_mock_session");
          await AsyncStorage.removeItem("haazir_mock_user");
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

  const signInBypass = async (mockUser: HaazirUser) => {
    const mockSess: Session = {
      access_token: "mock_bypass_token_" + Date.now(),
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock_bypass_refresh_token",
      user: {
        id: mockUser.id,
        email: mockUser.email || `${mockUser.phone}@haazir.app`,
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
    await AsyncStorage.setItem("haazir_mock_session", JSON.stringify(mockSess));
    await AsyncStorage.setItem("haazir_mock_user", JSON.stringify(mockUser));

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
    await AsyncStorage.removeItem("haazir_mock_session");
    await AsyncStorage.removeItem("haazir_mock_user");
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
