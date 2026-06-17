import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/supabase/client";
import type { Profile, AppRole, MenuTreeNode } from "@/types";

// ==================== State & Actions ====================

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: (Profile & { role: AppRole }) | null;
  menus: MenuTreeNode[];
  loading: boolean;
}

type AuthAction =
  | { type: "SET_SESSION"; payload: { session: Session | null; user: User | null } }
  | { type: "SET_PROFILE"; payload: (Profile & { role: AppRole }) | null }
  | { type: "SET_MENUS"; payload: MenuTreeNode[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

const initialState: AuthState = {
  session: null,
  user: null,
  profile: null,
  menus: [],
  loading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_SESSION":
      return { ...state, session: action.payload.session, user: action.payload.user };
    case "SET_PROFILE":
      return { ...state, profile: action.payload, loading: false };
    case "SET_MENUS":
      return { ...state, menus: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ==================== Context ====================

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  dispatch: React.Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      dispatch({ type: "SET_SESSION", payload: { session, user: session?.user ?? null } });
      if (!session?.user) {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        dispatch({ type: "SET_SESSION", payload: { session, user: session?.user ?? null } });
        if (!session?.user) {
          dispatch({ type: "SET_PROFILE", payload: null });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: !!state.session,
    isAdmin: state.profile?.role === "admin",
    dispatch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthStore must be used within AuthProvider");
  }
  return context;
}
