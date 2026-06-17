# 广西凯格咨询智能工作站 - 企业级架构重构计划

## 概述

将现有 localStorage + 硬编码数据的原型系统重构为基于 Meoo Cloud (Supabase) 的企业级前后端分离架构，包含公司资料、项目管理、AI Agent 三大核心模块。

**认证方式**: 普通登录标识 + 密码 (`authImplementationSop=basic_auth`)

---

## 第一阶段：数据库设计与云服务初始化

### 1.1 初始化云服务
```bash
meoo-cli cloud init -d "凯格咨询企业内部管理系统"
```

### 1.2 核心表结构设计

#### 用户与权限模块
| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `profiles` | 用户配置文件（共享模型） | id, username, avatar_url, created_at |
| `user_roles` | 角色关联表 | user_id, role (admin/moderator/user) |
| `menus` | 动态菜单配置 | id, parent_id, name, path, icon, sort_order, visible, permission_code |
| `role_permissions` | 角色-菜单权限关联 | role, menu_id |

#### 档案资料模块
| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `customers` | 客户档案 | id, name, industry, cycle_status, contact_person, phone, address, extra_data(JSONB) |
| `documents` | 公司文档 | id, title, category, storage_path, uploaded_by, created_at |

#### 项目管理模块
| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `projects` | 项目主表 | id, customer_id, name, stage, start_date, end_date, status, extra_data(JSONB) |
| `tasks` | 任务表 | id, project_id, assignee_id, title, description, priority, status, due_date |
| `project_milestones` | 项目里程碑 | id, project_id, name, completed_at |

#### AI Agent 模块
| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `agent_configs` | Agent 配置表 | id, name, type(dialog/flow/collab), system_prompt, model, enabled, config(JSONB) |
| `chat_sessions` | 对话会话 | id, user_id, agent_id, title, created_at |
| `chat_messages` | 对话消息 | id, session_id, role(user/assistant/system), content, metadata(JSONB) |

#### 公共模块
| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `notifications` | 通知消息 | id, user_id, type, title, content, is_read, created_at |
| `system_settings` | 系统配置 | key, value(JSONB), updated_at |

### 1.3 RLS 策略设计原则
- 所有业务表启用 RLS
- 使用 `has_role()` SECURITY DEFINER 函数避免递归
- 管理员可访问所有数据，普通用户按 user_id 过滤
- 菜单表对已认证用户开放 SELECT

---

## 第二阶段：统一认证系统迁移

### 2.1 替换 localStorage Mock Auth
- 移除 `src/lib/auth.ts` 中的硬编码账号
- 实现 Supabase Auth 用户名+密码登录（虚拟邮箱模式）
- 创建测试用户（zhangsan/lisi/wangwu，密码: 123456）

### 2.2 认证状态管理
- 新建 `src/hooks/useAuth.ts` 封装认证状态
- 监听 `onAuthStateChange` 同步 session
- 登录后自动加载用户角色和菜单权限

### 2.3 路由守卫
- 在 `__root.tsx` 添加认证检查
- 未登录重定向到 `/login`
- 根据角色动态生成侧边栏菜单

---

## 第三阶段：后端模块化 Edge Functions

### 3.1 函数目录结构
```
functions/
├── auth-profile/        # 用户信息获取/更新
├── customers/           # 客户 CRUD
├── projects/            # 项目 CRUD
├── tasks/               # 任务 CRUD
├── ai-chat/             # AI 对话代理（流式）
├── ai-agent-config/     # Agent 配置管理
└── admin-menus/         # 菜单权限管理（仅管理员）
```

### 3.2 统一响应格式
```typescript
interface ApiResponse<T> {
  code: number;      // 200=成功, 4xx=客户端错误, 5xx=服务端错误
  data?: T;
  message?: string;
  timestamp: string;
}
```

### 3.3 AI 服务层
- 加载 `meoo-llm-ai` 技能
- 部署 `ai-chat` Edge Function 作为统一 AI 代理
- 支持多模型切换（qwen3.6-plus 默认）
- 所有 Agent 共用此接口，通过 `agent_configs` 表区分行为

---

## 第四阶段：前端模块化重构

### 4.1 目录结构调整
```
src/
├── components/
│   ├── layout/          # Sidebar, Header, Layout
│   ├── dashboard/       # 首页数据看板组件
│   ├── customers/       # 客户管理组件
│   ├── projects/        # 项目管理组件
│   ├── tasks/           # 任务管理组件
│   ├── agent/           # AI Agent 组件
│   ├── admin/           # 后台管理组件（菜单/角色/用户）
│   └── ui/              # shadcn 组件（已有）
├── hooks/               # 自定义 hooks
├── lib/                 # 工具函数、API 封装
├── routes/              # TanStack Router 路由
└── types/               # TypeScript 类型定义
```

### 4.2 拆分 index.tsx (1644行)
将现有大文件拆分为独立组件：
- `DataDashboard.tsx` → `components/dashboard/DataDashboard.tsx`
- `CustomerLifecyclePanel.tsx` → `components/customers/CustomerLifecyclePanel.tsx`
- `PipelineCard.tsx` → `components/projects/PipelineCard.tsx`
- `TeamNotesPanel.tsx` → `components/collaboration/TeamNotesPanel.tsx`
- `SharedMemosPanel.tsx` → `components/collaboration/SharedMemosPanel.tsx`

### 4.3 新增页面路由
| 路由 | 说明 |
|------|------|
| `/` | 首页数据看板 |
| `/customers` | 客户档案管理 |
| `/projects` | 项目管理 |
| `/tasks` | 任务管理 |
| `/agent` | AI Agent 助手 |
| `/team` | 团队协作 |
| `/admin/menus` | 菜单管理（管理员） |
| `/admin/users` | 用户管理（管理员） |
| `/admin/roles` | 角色权限管理（管理员） |
| `/settings` | 个人设置 |

---

## 第五阶段：动态菜单与权限系统

### 5.1 菜单数据结构
```typescript
interface MenuItem {
  id: string;
  parent_id: string | null;
  name: string;
  path: string;
  icon: string;
  sort_order: number;
  visible: boolean;
  permission_code: string | null;
  children?: MenuItem[];
}
```

### 5.2 后台管理界面
- 可视化菜单编辑器（树形拖拽排序）
- 角色权限分配面板（勾选菜单项）
- 用户角色管理（批量分配）

### 5.3 前端动态渲染
- 登录后从 API 获取当前用户菜单树
- Sidebar 根据菜单数据动态生成导航项
- 路由守卫校验 permission_code

---

## 第六阶段：AI Agent 模块实现

### 6.1 对话助手
- 聊天界面组件（支持 Markdown 渲染）
- 流式响应显示
- 会话历史管理

### 6.2 业务流程 Agent
- 预设 Agent 配置（客户分析、项目建议、报告生成）
- 上下文注入（自动带入当前客户/项目数据）

### 6.3 多 Agent 协作（扩展）
- Agent 编排配置界面
- 任务分发与结果汇总

---

## 第七阶段：数据迁移

### 7.1 客户数据迁移
- 将 `crmData.ts` 中 41 条记录导入 `customers` 表
- 保留原有字段映射

### 7.2 团队便签/备忘录迁移
- 现有 `team_notes` / `shared_memos` 表保持不变
- 补充 RLS 策略（按 user_id 过滤）

### 7.3 离线通知迁移
- `notificationStore.ts` 改为优先读取云端 `notifications` 表
- 本地缓存作为降级方案

---

## 实施顺序与依赖关系

```
Phase 1 (DB) ──────────────────────────────────────┐
    │                                               │
Phase 2 (Auth) ←── Phase 1                         │
    │                                               │
Phase 3 (Edge Functions) ←── Phase 1, Phase 2      │
    │                                               │
Phase 4 (Frontend Refactor) ←── Phase 2, Phase 3   │
    │                                               │
Phase 5 (Dynamic Menus) ←── Phase 3, Phase 4       │
    │                                               │
Phase 6 (AI Agent) ←── Phase 3                     │
    │                                               │
Phase 7 (Data Migration) ←── Phase 1               │
                                                    │
验证: pnpm run dev 绿灯 ◄──────────────────────────┘
```

---

## 关键约束

1. **模块隔离**: 各模块代码独立目录，禁止跨模块直接引用
2. **接口版本**: Edge Function 路径预留 `/v1/` 前缀
3. **扩展字段**: 主业务表使用 `extra_data JSONB` 预留扩展
4. **不改动线上接口**: 新增功能独立开发，已有 team_notes/shared_memos 保持兼容
5. **低耦合**: 新增 Agent 仅需插入 `agent_configs` 记录，无需改代码

---

## 预期产出

- 完整的企业级数据库 Schema
- 7+ Edge Functions 覆盖核心业务
- 模块化前端架构（单文件 < 300 行）
- 动态菜单 + 角色权限后台管理
- AI Agent 对话助手可用
- 原有功能平滑迁移，无破坏性变更
