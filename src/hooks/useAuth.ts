import { useState, useEffect } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getUserProfile, type UserProfile, getSession, getCurrentUser, getCurrentUserSync } from "@/lib/auth";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const syncAuth = async () => {
      try {
        const session = await getSession();
        const user = await getCurrentUser();
        if (!mounted) return;
        setState((prev) => ({ ...prev, session, user }));
        if (user && (user as any).id) {
          await loadProfile((user as any).id);
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        if (mounted) setState((prev) => ({ ...prev, loading: false }));
      }
    };

    syncAuth();

    const handleStorage = () => syncAuth();
    window.addEventListener("storage", handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  async function loadProfile(userId: string) {
    try {
      const profile = await getUserProfile(userId);
      setState((prev) => ({ ...prev, profile, loading: false }));
    } catch (err) {
      console.error("Failed to load profile:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }

  return {
    ...state,
    isAuthenticated: !!(state.user || state.session),
    isAdmin: state.profile?.role === "admin",
  };
}
