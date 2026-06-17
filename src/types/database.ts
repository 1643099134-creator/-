/**
 * 数据库表实体类型定义
 * 与 Supabase 生成的 types.ts 保持一致，提供业务层友好类型
 */

// ==================== 用户与权限模块 ====================

export type AppRole = "admin" | "moderator" | "user";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Menu {
  id: string;
  parent_id: string | null;
  name: string;
  path: string;
  icon: string | null;
  sort_order: number;
  visible: boolean;
  permission_code: string | null;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: AppRole;
  menu_id: string;
}

// ==================== 档案资料模块 ====================

export type CustomerCycleStatus = "完成" | "服务中" | "待跟进";

export interface Customer {
  id: string;
  name: string;
  industry: string | null;
  cycle_status: CustomerCycleStatus | null;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  extra_data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  category: string | null;
  storage_path: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ==================== 项目管理模块 ====================

export type TaskPriority = "高" | "中" | "低";
export type TaskStatus = "待处理" | "进行中" | "已完成";

export interface Project {
  id: string;
  customer_id: string | null;
  name: string;
  stage: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  extra_data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  assignee_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  completed_at: string | null;
  created_at: string;
}

// ==================== AI Agent 模块 ====================

export type AgentType = "dialog" | "flow" | "collab";
export type MessageRole = "user" | "assistant" | "system";

export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  system_prompt: string | null;
  model: string;
  enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  agent_id: string | null;
  title: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ==================== 公共模块 ====================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string | null;
  is_read: boolean;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}
