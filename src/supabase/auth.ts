/**
 * 本地化认证模拟：使用 localStorage 存储用户与会话，适用于离线/私有化场景。
 */
import type { Session, User } from "@supabase/supabase-js";
import type { Profile, AppRole } from "@/types";

export interface UserProfile extends Profile {
  role: AppRole;
}

const USERS_KEY = "local_users_v1";
const PROFILES_KEY = "local_profiles_v1";
const ROLES_KEY = "local_user_roles_v1";
const SESSION_KEY = "local_session_v1";

const DEMO_USERS = [
  { username: "zhangsan", password: "123456", role: "admin" as const },
  { username: "lisi", password: "123456", role: "moderator" as const },
  { username: "wangwu", password: "123456", role: "user" as const },
];

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function persistSession(user: any) {
  const session = {
    access_token: `local-${user.id}-${Date.now()}`,
    refresh_token: `local-${user.id}-${Date.now()}`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    token_type: "bearer",
    user,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function seedDemoAccounts() {
  const users = DEMO_USERS.map((item, index) => ({
    id: `demo-${index + 1}`,
    username: item.username,
    email: `${item.username}@local`,
    password: item.password,
  }));

  saveUsers(users);

  const profiles = users.map((user) => ({
    id: user.id,
    username: user.username,
    avatar_url: null,
    created_at: new Date().toISOString(),
  }));

  const roles = users.map((user, index) => ({
    id: `role-${index + 1}`,
    user_id: user.id,
    role: DEMO_USERS[index].role,
  }));

  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}

function saveUsers(u: any[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

export async function signUp(username: string, password: string) {
  const users = loadUsers();
  if (users.find((u: any) => u.username === username)) {
    throw new Error("用户已存在");
  }
  const id = Date.now().toString(36);
  const user = { id, username, email: `${username}@local`, password };
  users.push(user);
  saveUsers(users);
  persistSession(user);
  return { data: { user }, error: null };
}

export async function signIn(username: string, password: string) {
  seedDemoAccounts();
  const users = loadUsers();
  const user = users.find((u: any) => u.username === username && u.password === password);
  if (!user) throw new Error("用户名或密码错误");
  persistSession(user);
  return { data: { user }, error: null };
}

export async function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<Session | null> {
  const s = readSession();
  return s?.user ? ({ user: s.user } as Session) : null;
}

export async function getCurrentUser(): Promise<User | null> {
  const s = readSession();
  return s?.user ?? null;
}

// 同步版本：获取当前用户（用于非异步上下文）
export function getCurrentUserSync(): User | null {
  const s = readSession();
  return s?.user ?? null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
    const p = profiles.find((x: any) => x.id === userId);
    const roles = JSON.parse(localStorage.getItem(ROLES_KEY) || "[]");
    const roleEntry = roles.find((r: any) => r.user_id === userId);
    if (!p) return null;
    return { ...p, role: roleEntry?.role || "user" };
  } catch {
    return null;
  }
}

export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  try {
    const roles = JSON.parse(localStorage.getItem(ROLES_KEY) || "[]");
    return roles.some((r: any) => r.user_id === userId && r.role === role);
  } catch {
    return false;
  }
}
