/**
 * 档案资料模块 - 数据库 CRUD
 */
import { supabase } from "../client";
import type { Customer, Document } from "@/types";

// ==================== Customers ====================

export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Customer[];
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Customer | null;
}

export async function createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>) {
  const { data, error } = await supabase
    .from("customers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

// ==================== Documents ====================

export async function getDocuments() {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Document[];
}

export async function createDocument(doc: Omit<Document, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("documents")
    .insert(doc)
    .select()
    .single();
  if (error) throw error;
  return data as Document;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}
