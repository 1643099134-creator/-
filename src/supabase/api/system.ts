/**
 * 后台管理模块 - 用户、角色、菜单权限 CRUD
 */
import { supabase } from "../client";
import type { Profile, UserRole, Menu, RolePermission, AppRole } from "@/types";

// ==================== Profiles ====================

export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

// ==================== User Roles ====================

export async function getUserRoles(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data as UserRole[];
}

export async function assignUserRole(userId: string, role: AppRole) {
  const { data, error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role })
    .select()
    .single();
  if (error) throw error;
  return data as UserRole;
}

export async function removeUserRole(userId: string, role: AppRole) {
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", role);
  if (error) throw error;
}

// ==================== Menus ====================

export async function getMenus() {
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Menu[];
}

export async function getAllMenus() {
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Menu[];
}

export async function createMenu(menu: Omit<Menu, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("menus")
    .insert(menu)
    .select()
    .single();
  if (error) throw error;
  return data as Menu;
}

export async function updateMenu(id: string, updates: Partial<Menu>) {
  const { data, error } = await supabase
    .from("menus")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Menu;
}

export async function deleteMenu(id: string) {
  const { error } = await supabase.from("menus").delete().eq("id", id);
  if (error) throw error;
}

// ==================== Role Permissions ====================

export async function getRolePermissions(role: AppRole) {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("*")
    .eq("role", role);
  if (error) throw error;
  return data as RolePermission[];
}

export async function setRolePermissions(role: AppRole, menuIds: string[]) {
  // 先删除旧权限
  await supabase.from("role_permissions").delete().eq("role", role);
  // 批量插入新权限
  if (menuIds.length > 0) {
    const records = menuIds.map((menu_id) => ({ role, menu_id }));
    const { error } = await supabase.from("role_permissions").insert(records);
    if (error) throw error;
  }
}
