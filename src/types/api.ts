/**
 * 统一接口返回格式
 */
export interface ApiResponse<T = unknown> {
  code: number;
  data?: T;
  message?: string;
  timestamp: string;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 分页响应数据
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * AI 对话消息（前端使用）
 */
export interface ChatMessagePayload {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * AI 流式请求选项
 */
export interface StreamOptions {
  model?: string;
  signal?: AbortSignal;
}

/**
 * 菜单树节点（带子菜单）
 */
export interface MenuTreeNode {
  id: string;
  parent_id: string | null;
  name: string;
  path: string;
  icon: string | null;
  sort_order: number;
  visible: boolean;
  permission_code: string | null;
  children?: MenuTreeNode[];
}
