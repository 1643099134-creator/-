# Meoo → 本地前端迁移文档

## 概述

本项目已从依赖 Meoo Cloud 的远程前端迁移为完全本地化的 SPA 应用，无需任何外部服务即可运行。

---

## 迁移内容

### 1. 认证系统本地化

| 改动 | 说明 |
|------|------|
| `src/supabase/auth.ts` | 本地认证实现，使用 localStorage 存储用户、会话、角色、Profile |
| `src/hooks/useAuth.ts` | 改为从本地 session 读取，支持 `storage` 事件跨标签页同步 |
| `src/components/layout/Sidebar.tsx` | 增加 `loading` 等待，避免 auth 未就绪时显示错误状态 |
| `src/routes/login.tsx` | 登录成功后使用 `window.location.replace("/")` 确保路由守卫重新评估 |

**数据结构 (localStorage)**:
- `local_users_v1` — 用户列表 `[{ id, username, email, password }]`
- `local_profiles_v1` — Profile 列表 `[{ id, username, avatar_url, created_at }]`
- `local_user_roles_v1` — 角色列表 `[{ id, user_id, role }]`
- `local_session_v1` — 当前会话 `{ access_token, refresh_token, expires_at, token_type, user }`

### 2. 演示账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| `zhangsan` | `123456` | admin | 项目经理 |
| `lisi` | `123456` | moderator | 设计师 |
| `wangwu` | `123456` | user | 开发工程师 |

首次访问时自动种子化，登录页提供「快速体验」按钮一键填入。

### 3. 数据层本地化

| 模块 | 文件 | 说明 |
|------|------|------|
| 团队笔记 | `src/hooks/useTeamNotes.ts` | localStorage CRUD，按用户隔离 |
| 共享备忘 | `src/hooks/useSharedMemos.ts` | localStorage CRUD，全员可见 |
| AI 服务 | `src/lib/aiService.ts` | 本地 fallback 响应，不依赖外部 API |
| CRM 数据 | `src/hooks/useCrmData.ts` | 本地静态数据源 |
| 通知 | `src/lib/notificationStore.ts` | localStorage 通知存储 |

### 4. 路由守卫

`src/routes/__root.tsx` 中的路由守卫逻辑：

```
PUBLIC_ROUTES = ["/login"]
if (!isPublicRoute && !isAuthenticated) → 重定向到 /login
if (isPublicRoute && isAuthenticated) → 允许访问（登录页可进）
```

### 5. 构建配置

- `package.json` 名称改为 `company-admin-local`
- `tsconfig.json` 排除 `functions/` 目录（Deno 类型噪音）
- `src/supabase/client.ts` 当无 `VITE_SUPABASE_ANON_KEY` 时自动使用 Mock Supabase
- 侧边栏外部链接改为相对路径（`./assets/...`）

---

## 快速启动

```bash
# 安装依赖
pnpm install

# 开发模式（端口 3015）
pnpm dev

# 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

访问 http://127.0.0.1:3015/login，选择演示账号登录。

---

## 回滚方案

如需恢复到 Meoo 依赖版本：

```bash
# 1. 回退到迁移前的 commit
git log --oneline          # 找到迁移前的 commit hash
git checkout <commit-hash> # 暂时查看旧代码

# 2. 或者创建回滚分支
git checkout -b rollback-to-meoo <commit-hash>

# 3. 恢复后重新安装依赖
pnpm install
```

**注意**: 回滚后需要恢复以下配置：
- `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 环境变量
- Meoo Cloud 平台访问权限
- 侧边栏外部链接恢复为 Meoo 原始路径

---

## 文件变更摘要

### 新增文件
- `src/supabase/auth.ts` — 本地认证核心
- `MIGRATION.md` — 本文件

### 修改文件
- `src/hooks/useAuth.ts` — 本地 session 读取 + storage 事件监听
- `src/hooks/useTeamNotes.ts` — localStorage 实现
- `src/hooks/useSharedMemos.ts` — localStorage 实现
- `src/lib/aiService.ts` — 本地 fallback
- `src/lib/auth.ts` — 兼容转发层
- `src/routes/login.tsx` — 登录跳转修复
- `src/routes/__root.tsx` — 路由守卫
- `src/components/layout/Sidebar.tsx` — auth 加载态 + 本地路径
- `src/supabase/client.ts` — Mock Supabase fallback
- `package.json` — 项目名称
- `tsconfig.json` — 编译路径排除

### 未修改（保持兼容）
- `src/supabase/types.ts` — Supabase 类型定义保留
- `src/types/` — 数据库类型保留
- `functions/` — Edge Functions 目录保留（供未来迁移参考）
- `migrations/` — SQL 迁移文件保留（供未来迁移参考）

---

## 已知限制

1. **数据持久化**: 所有数据存储在浏览器 localStorage，清除浏览器数据会丢失
2. **多设备同步**: 不支持跨设备数据同步（本地化设计的固有限制）
3. **并发编辑**: 不支持多人同时编辑同一条笔记/备忘
4. **AI 功能**: 使用本地 mock 响应，无真实 AI 能力
5. **文件上传**: 不支持真实文件上传（Storage 已本地化）
