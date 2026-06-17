# 项目看板 Dashboard — 增量修改计划

## 变更概述

在原有 Dashboard 计划基础上，本次追加以下需求：
1. **导航栏放大 20%**：侧边栏宽度、字体、图标统一放大
2. **新增 2 个导航按钮**：凯格咨询客户管理系统、工作任务管理助手（项目内路由页面）
3. **AgentPanel 二级菜单**：展开式面板，含 3 个外部链接按钮（PPT智能助手、项目大纲生成助手、企业规划书生成系统），URL 暂用占位符

---

## 1. 导航栏放大 20%

### 修改文件：`src/components/layout/Sidebar.tsx`（新建）

- 侧边栏宽度：从默认的 `w-64`(256px) 调整为 `w-[307px]`（256 × 1.2 ≈ 307px）
- 字体大小：所有导航项文字从 `text-sm`(14px) → `text-base`(16px)，标题从 `text-lg` → `text-xl`
- 图标尺寸：从 `size={20}` → `size={24}`
- 间距同步放大：padding/gap 等比例增加约 20%
- 过渡动画保持 smooth（200ms cubic-bezier）

### 修改文件：`src/styles.css`

- 新增 CSS 变量 `--sidebar-width: 307px` 供全局引用
- 确保暗色/亮色主题下放大后的侧边栏样式一致

## 2. 新增 2 个导航按钮 + 对应路由页面

### 新建路由文件

| 文件路径 | 说明 |
|---------|------|
| `src/routes/crm.tsx` | 凯格咨询客户管理系统页面 |
| `src/routes/tasks.tsx` | 工作任务管理助手页面 |

两个页面先提供基础框架（标题 + 功能占位提示），后续迭代完善。

### 修改文件：`src/components/layout/Sidebar.tsx`

在现有导航项（Dashboard / 项目 / 团队 / 消息）之后追加 2 个导航项：

```
导航结构：
├── Dashboard（仪表盘）     → /
├── 全部项目               → /projects
├── 团队                   → /team
├── 消息                   → /messages
├── ── 分隔线 ──
├── 凯格咨询客户管理系统    → /crm        ← 新增
└── 工作任务管理助手        → /tasks      ← 新增
```

- 使用 lucide-react 图标：CRM 用 `Users` / `Building2`，任务助手用 `ClipboardCheck` / `ListTodo`
- 当前路由高亮样式与现有导航项一致
- 字体/图标遵循 20% 放大规则

## 3. AgentPanel 二级展开式菜单

### 新建文件：`src/components/dashboard/AgentPanel.tsx`

**交互设计：**
- 一级：Agent 快速入口网格（原有功能）
- 其中一个特殊卡片"AI 工具集"点击后不跳转，而是在卡片下方**展开一个内联面板**
- 展开面板内含 3 个交互按钮，纵向排列：
  1. PPT智能助手 → `href="#"` （占位，用户稍后提供 URL）
  2. 项目大纲生成助手 → `href="#"`
  3. 企业规划书生成系统 → `href="#"`
- 每个按钮带图标 + 名称 + 简短描述
- 点击按钮在新标签页打开对应链接（`target="_blank"`）
- 展开/收起动画：height transition 300ms ease-out

**数据结构：**
```typescript
const AI_TOOLS = [
  { name: 'PPT智能助手', url: '#', icon: Presentation, desc: '一键生成专业演示文稿' },
  { name: '项目大纲生成助手', url: '#', icon: FileText, desc: '快速梳理项目结构' },
  { name: '企业规划书生成系统', url: '#', icon: Briefcase, desc: '自动生成企业战略规划' },
]
```

**视觉风格：**
- 展开面板使用 GlassCard 样式（与整体暗色玻璃拟态一致）
- 按钮 hover 时微光高亮
- 展开状态有旋转箭头指示

## 4. 实施步骤

### Step 1: 更新设计系统
- `src/styles.css`：新增 `--sidebar-width` 变量

### Step 2: 创建 Sidebar 导航组件
- `src/components/layout/Sidebar.tsx`：完整侧边栏，含放大尺寸 + 7 个导航项

### Step 3: 创建新路由页面
- `src/routes/crm.tsx`：凯格咨询客户管理系统
- `src/routes/tasks.tsx`：工作任务管理助手

### Step 4: 创建 AgentPanel 组件
- `src/components/dashboard/AgentPanel.tsx`：含二级展开菜单

### Step 5: 集成到根布局和首页
- `src/routes/__root.tsx`：引入 Sidebar 布局
- `src/routes/index.tsx`：引入 AgentPanel

### Step 6: 验证
- `pnpm run dev` 确认无构建错误
- 检查导航放大效果
- 检查新路由跳转
- 检查 AgentPanel 展开/收起交互

## 5. 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 修改 | `src/styles.css` | 新增 sidebar-width 变量 |
| 新建 | `src/components/layout/Sidebar.tsx` | 侧边栏导航（放大20% + 7项） |
| 新建 | `src/routes/crm.tsx` | 凯格咨询客户管理系统页面 |
| 新建 | `src/routes/tasks.tsx` | 工作任务管理助手页面 |
| 新建 | `src/components/dashboard/AgentPanel.tsx` | Agent面板 + 二级展开菜单 |
| 修改 | `src/routes/__root.tsx` | 集成 Sidebar 布局 |
| 修改 | `src/routes/index.tsx` | 集成 AgentPanel |
