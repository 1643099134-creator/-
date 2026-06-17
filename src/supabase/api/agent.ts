/**
 * AI Agent 模块 - 数据库 CRUD
 */
import { supabase } from "../client";
import type { AgentConfig, ChatSession, ChatMessage } from "@/types";

// ==================== Agent Configs ====================

export async function getAgentConfigs() {
  const { data, error } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("enabled", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AgentConfig[];
}

export async function getAllAgentConfigs() {
  const { data, error } = await supabase
    .from("agent_configs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AgentConfig[];
}

export async function createAgentConfig(config: Omit<AgentConfig, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("agent_configs")
    .insert(config)
    .select()
    .single();
  if (error) throw error;
  return data as AgentConfig;
}

export async function updateAgentConfig(id: string, updates: Partial<AgentConfig>) {
  const { data, error } = await supabase
    .from("agent_configs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as AgentConfig;
}

// ==================== Chat Sessions ====================

export async function getChatSessions(userId: string) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ChatSession[];
}

export async function createChatSession(session: Omit<ChatSession, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data as ChatSession;
}

export async function deleteChatSession(id: string) {
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
  if (error) throw error;
}

// ==================== Chat Messages ====================

export async function getChatMessages(sessionId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as ChatMessage[];
}

export async function createChatMessage(message: Omit<ChatMessage, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert(message)
    .select()
    .single();
  if (error) throw error;
  return data as ChatMessage;
}
