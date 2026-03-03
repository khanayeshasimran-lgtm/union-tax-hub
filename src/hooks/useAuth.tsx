import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "super_admin" | "admin" | "agent" | "tax_processor" | "client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: { full_name: string; organization_id: string | null; role: AppRole | null } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<{
    full_name: string;
    organization_id: string | null;
    role: AppRole | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Single source of truth: profiles table holds BOTH role and profile info ──
  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, organization_id, role")
        .eq("id", userId)
        .single();
if (error) {
  console.error("useAuth: profile fetch failed:", error.message);
  setRole(null);
  setProfile(null);
  return;
}
      if (data) {
        setRole(data.role as AppRole);
        setProfile({
          full_name: data.full_name,
          organization_id: data.organization_id,
          role: data.role as AppRole,
        });
      }
    } catch (err) {
      console.error("useAuth: unexpected error:", err);
      setRole(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1. Get initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for login/logout/token refresh
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (_event, session) => {
    setLoading(true);

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      await fetchUserData(session.user.id);
    } else {
      setRole(null);
      setProfile(null);
    }

    setLoading(false);
  }
);
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);