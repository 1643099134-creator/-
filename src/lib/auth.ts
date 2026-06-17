/**
 * 认证模块 - 向后兼容转发层
 * 实际实现已迁移至 src/supabase/auth.ts
 * 此文件保留以避免现有引用断裂，新代码请直接使用 @/supabase/auth
 */
export {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  getCurrentUserSync,
  getUserProfile,
  hasRole,
  type UserProfile,
} from "@/supabase/auth";
