import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getCurrentUserSync } from "@/lib/auth";
import { useCrmData } from "@/hooks/useCrmData";
import { customersData, type Customer } from "@/lib/crmData";
import { supabase } from "@/supabase/client";
import { CalendarDetailPanel } from "@/components/dashboard/CalendarDetailPanel";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  MoreHorizontal,
  Bot,
  Sparkles,
  Presentation,
  Zap,
  BarChart3,
  StickyNote,
  Plus,
  Trash2,
  Check,
  X,
  Building2,
  Users,
  TrendingUp,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTeamNotes } from "@/hooks/useTeamNotes";
import { useSharedMemos } from "@/hooks/useSharedMemos";
import { usePersonalMemos } from "@/hooks/usePersonalMemos";

export const Route = createFileRoute("/")({
  component: Index,
});

// 项目阶段
const STAGES = ["意向", "方案", "须知", "合同", "交付", "尾款", "服务"];

// 项目进度数据
const PROJECTS = [
  { id: 1, name: "凯格咨询官网改版", client: "广西凯格咨询有限公司", stage: 5, status: "进行中", dueDate: "2024-03-15", desc: "企业官网全面改版升级，包含响应式设计、SEO优化、内容管理系统集成。", budget: "50万", owner: "张经理" },
  { id: 2, name: "CRM系统定制开发", client: "南宁某科技公司", stage: 4, status: "待确认", dueDate: "2024-04-01", desc: "基于客户业务需求定制开发CRM系统，实现客户管理、销售跟进、数据分析功能。", budget: "120万", owner: "李经理" },
  { id: 3, name: "企业微信集成方案", client: "柳州某制造企业", stage: 2, status: "设计中", dueDate: "2024-03-28", desc: "企业微信与内部OA系统集成，实现消息互通、审批流程、考勤打卡等功能。", budget: "80万", owner: "王经理" },
  { id: 4, name: "数据可视化大屏", client: "桂林某旅游集团", stage: 1, status: "洽谈中", dueDate: "2024-05-10", desc: "实时数据可视化展示大屏，支持多维度数据分析和动态图表展示。", budget: "60万", owner: "赵经理" },
  { id: 5, name: "移动端APP开发", client: "北海某电商公司", stage: 7, status: "维护期", dueDate: "2024-02-20", desc: "iOS和Android双平台电商APP开发，包含商品展示、购物车、支付、物流跟踪等功能。", budget: "200万", owner: "刘经理" },
];

// AI 工具集数据
const AI_TOOLS = [
  { name: "PPT智能助手", icon: Presentation, desc: "一键生成专业演示文稿" },
  { name: "项目大纲生成助手", icon: FileText, desc: "快速梳理项目结构" },
  { name: "企业规划书生成系统", icon: Briefcase, desc: "自动生成企业战略规划" },
  { name: "数据分析助手", icon: BarChart3, desc: "智能分析业务数据" },
  { name: "文案生成器", icon: Sparkles, desc: "快速生成营销文案" },
  { name: "自动化流程", icon: Zap, desc: "构建自动化工作流" },
];

// 顶部栏组件
function TopBar() {
  const today = new Date().toLocaleDateString("zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <header 
      className="flex items-center justify-between px-6 py-4 border-b border-border"
      style={{ height: "64px" }}
    >
      <div className="flex flex-col">
        <div className="text-xs text-muted-foreground">{today}</div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          项目看板
        </h1>
      </div>
    </header>
  );
}

// KPI 卡片组件
function KpiCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div 
      className="rounded-lg p-4 border border-border"
      style={{ background: "var(--surface)" }}
    >
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="opacity-50">{sub}</span>
      </div>
      <div className="text-2xl font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

// CRM统计卡片组件
function CrmStatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div 
      className="rounded-lg p-3 border border-border"
      style={{ background: "var(--surface)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div 
          className="flex h-6 w-6 items-center justify-center rounded"
          style={{ background: "var(--muted)" }}
        >
          <Icon size={12} />
        </div>
      </div>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

// CRM数据汇总面板
function CrmSummaryPanel() {
  const { stats, isLoading, lastUpdated, refreshData } = useCrmData();
  const formatTime = (date: Date) => date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div 
      className="rounded-lg border border-border p-4 mb-4"
      style={{ background: "var(--surface)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="flex h-7 w-7 items-center justify-center rounded"
            style={{ background: "var(--muted)" }}
          >
            <Building2 size={14} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground">客户管理系统数据汇总</h2>
            <p className="text-[10px] text-muted-foreground">
              上次更新: {formatTime(lastUpdated)}
              {isLoading && " (更新中...)"}
            </p>
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw size={12} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <CrmStatCard label="总客户数" value={stats.totalCustomers} icon={Users} />
        <CrmStatCard label="已完成项目" value={stats.completedProjects} icon={CheckCircle2} />
        <CrmStatCard label="待跟进" value={stats.pendingFollowUp} icon={TrendingUp} />
        <CrmStatCard label="服务中" value={stats.inService} icon={Briefcase} />
      </div>

      <div className="border-t border-border pt-3">
        <h3 className="mb-2 text-xs text-muted-foreground">行业分布</h3>
        <div className="flex flex-wrap gap-1.5">
          {stats.industryDistribution.slice(0, 5).map((item) => (
            <div
              key={item.industry}
              className="flex items-center gap-1 rounded px-2 py-1 text-[10px] border border-border"
              style={{ background: "var(--muted)" }}
            >
              <span className="text-foreground">{item.industry}</span>
              <span className="text-muted-foreground">{item.count}家</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
        <span>每10分钟自动更新</span>
      </div>
    </div>
  );
}

// 数据直观图
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 行业颜色配置
const INDUSTRY_COLORS: Record<string, string> = {
  "银行业": "#3b82f6",      // 蓝色
  "央国企": "#8b5cf6",      // 紫色
  "私企": "#f59e0b",        // 橙色
  "连锁企业": "#ec4899",    // 粉色
};

function DataDashboard() {
  const { stats, isLoading, lastUpdated } = useCrmData();

  // 客户周期分布数据
  const cycleData = [
    { name: "已完成", value: stats.completedProjects, color: "#22c55e" },
    { name: "服务中", value: stats.inService, color: "#3b82f6" },
    { name: "待跟进", value: stats.pendingFollowUp, color: "#f59e0b" },
  ];

  // 行业分布数据（取前5），带颜色
  const industryData = stats.industryDistribution.slice(0, 5).map(item => ({
    name: item.industry,
    count: item.count,
    color: INDUSTRY_COLORS[item.industry] || "#64748b",
  }));

  const formatTime = (date: Date) => date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  return (
    <section
      className="rounded-lg border border-border p-5 mb-4"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 size={20} />
            数据直观图
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            凯格咨询客户管理系统实时数据 · 更新于 {formatTime(lastUpdated)}
            {isLoading && " (更新中...)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            自动同步中
          </div>
        </div>
      </div>

      {/* KPI 指标卡 */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg p-3 border border-border" style={{ background: "var(--surface)" }}>
          <div className="text-xs text-muted-foreground mb-1">总客户数</div>
          <div className="text-2xl font-bold text-foreground">{stats.totalCustomers}</div>
        </div>
        <div className="rounded-lg p-3 border border-border" style={{ background: "var(--surface)" }}>
          <div className="text-xs text-muted-foreground mb-1">已完成项目</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.completedProjects}</div>
        </div>
        <div className="rounded-lg p-3 border border-border" style={{ background: "var(--surface)" }}>
          <div className="text-xs text-muted-foreground mb-1">服务中</div>
          <div className="text-2xl font-bold text-blue-600">{stats.inService}</div>
        </div>
        <div className="rounded-lg p-3 border border-border" style={{ background: "var(--surface)" }}>
          <div className="text-xs text-muted-foreground mb-1">待跟进</div>
          <div className="text-2xl font-bold text-amber-600">{stats.pendingFollowUp}</div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 客户周期分布饼图 */}
        <div className="rounded-lg border border-border p-4" style={{ background: "var(--surface)" }}>
          <div className="text-sm font-medium text-foreground mb-3">客户周期分布</div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cycleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 行业分布柱状图 */}
        <div className="rounded-lg border border-border p-4" style={{ background: "var(--surface)" }}>
          <div className="text-sm font-medium text-foreground mb-3">行业分布 TOP5</div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

// 客户生命周期筛选面板
type CycleFilter = "all" | "完成" | "服务中" | "待跟进";

// 将数据库记录转换为本地 Customer 格式
const mapDbCustomerToLocal = (c: any): Customer => ({
  时间: c.extra_data?.时间 || "2024及之前培训",
  行业: c.industry || "",
  客户名称: c.name || "",
  培训内容: c.extra_data?.培训内容 || "",
  服务时间: c.extra_data?.服务时间 || "",
  客户周期: (c.cycle_status as "完成" | "服务中" | "待跟进") || "待跟进",
  后续跟进: c.extra_data?.后续跟进 || "",
  渠道: c.extra_data?.渠道 || "",
  企业对接人: c.contact_person || "",
  负责人: c.extra_data?.负责人 || "",
  项目开展时间: c.extra_data?.项目开展时间 || "",
  机构端备注: c.extra_data?.机构端备注 || "",
});

function CustomerLifecyclePanel() {
  const { customers: localData, isLoading, lastUpdated, refreshData } = useCrmData();
  const [filter, setFilter] = useState<CycleFilter>("all");

  // 统计数据
  const stats = {
    all: localData.length,
    完成: localData.filter(c => c.客户周期 === "完成").length,
    服务中: localData.filter(c => c.客户周期 === "服务中").length,
    待跟进: localData.filter(c => c.客户周期 === "待跟进").length,
  };

  // 过滤后的数据
  const filteredData = filter === "all"
    ? localData
    : localData.filter(c => c.客户周期 === filter);

  const filters: { key: CycleFilter; label: string; color: string }[] = [
    { key: "all", label: "全部", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" },
    { key: "完成", label: "完成", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
    { key: "服务中", label: "服务中", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    { key: "待跟进", label: "待跟进", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  ];

  return (
    <div className="rounded-lg border border-border p-4 flex flex-col" style={{ background: "var(--surface)", height: "400px" }}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <div className="font-medium text-sm">项目生命线</div>
          <div className="text-xs text-muted-foreground">
            凯格咨询客户管理系统 · 共 {filteredData.length} 条记录
            {isLoading && " (更新中...)"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 手动刷新按钮 */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground border border-border hover:bg-muted transition-all disabled:opacity-50"
            title="手动刷新数据"
          >
            <RefreshCw size={10} className={cn(isLoading && "animate-spin")} />
            刷新
          </button>
          <span className="text-[10px] text-muted-foreground">
            更新于 {lastUpdated.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {/* 筛选按钮组 */}
          <div className="flex items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  filter === f.key
                    ? f.color + " ring-1 ring-offset-1 ring-foreground/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-70">{stats[f.key]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-md border border-border scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">行业</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">客户名称</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">培训内容</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">客户周期</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">企业对接人</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.length > 0 ? (
              filteredData.map((customer, index) => (
                <tr key={index} className="hover:bg-muted/50 transition-colors animate-fade-in">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      customer.行业 === "银行业" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                      customer.行业 === "央国企" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                      customer.行业 === "私企" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" :
                      "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
                    }`}>
                      {customer.行业}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-foreground font-medium whitespace-nowrap">{customer.客户名称}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate" title={customer.培训内容}>
                    {customer.培训内容 ? customer.培训内容.replace(/\n/g, " | ") : "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      customer.客户周期 === "完成" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                      customer.客户周期 === "服务中" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}>
                      {customer.客户周期}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap">{customer.企业对接人 || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground text-sm">
                  暂无{filter === "all" ? "" : filter + "状态的"}客户记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 项目生命线
function PipelineCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const pct = Math.round((project.stage / STAGES.length) * 100);

  return (
    <article
      className="rounded-lg border border-border p-4 transition-all duration-150 hover:border-foreground/30 cursor-pointer"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-sm font-bold"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          {project.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-foreground">{project.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{project.desc}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-foreground/30">
              {STAGES[project.stage - 1]} · {pct}%
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              {project.client}
            </span>
          </div>
          {/* Stage line */}
          <div className="stage-line mt-3">
            {STAGES.map((s, i) => (
              <div key={s} className={`stage ${i + 1 < project.stage ? 'stage-done' : i + 1 === project.stage ? 'stage-active' : ''}`}>
                <div className="stage-dot" />
                <div className="stage-label">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

// 任务看板 - 深度完善版
interface BoardTask {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  priority: "high" | "mid" | "low";
  due: string;
  owner: string;
}

const BOARD_TASKS_KEY = "kaige-board-tasks";

function loadBoardTasks(): BoardTask[] {
  try {
    const raw = localStorage.getItem(BOARD_TASKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [
    { id: "1", title: "整理本周项目周报", status: "todo", priority: "high", due: "06/18", owner: "陈明远" },
    { id: "2", title: "UI 设计评审准备", status: "doing", priority: "mid", due: "06/16", owner: "赵一鸣" },
    { id: "3", title: "客户 Demo 演示排练", status: "doing", priority: "high", due: "06/17", owner: "吴振宇" },
    { id: "4", title: "合同条款确认", status: "todo", priority: "mid", due: "06/20", owner: "林雨桐" },
    { id: "5", title: "移动办公验收文档归档", status: "done", priority: "low", due: "06/14", owner: "韩雪峰" },
    { id: "6", title: "Q3 需求池梳理", status: "todo", priority: "low", due: "06/26", owner: "陈雨欣" },
  ];
}

function saveBoardTasks(tasks: BoardTask[]) {
  try { localStorage.setItem(BOARD_TASKS_KEY, JSON.stringify(tasks)); } catch { /* ignore */ }
}

function isOverdue(due: string): boolean {
  const now = new Date();
  const [m, d] = due.split("/").map(Number);
  const dueDate = new Date(now.getFullYear(), m - 1, d);
  return dueDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isDueSoon(due: string): boolean {
  const now = new Date();
  const [m, d] = due.split("/").map(Number);
  const dueDate = new Date(now.getFullYear(), m - 1, d);
  const diff = (dueDate.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000;
  return diff >= 0 && diff <= 2;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30",
  mid: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30",
  low: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-900/30",
};

const STATUS_FLOW: Record<string, { prev?: string; next?: string }> = {
  todo: { next: "doing" },
  doing: { prev: "todo", next: "done" },
  done: { prev: "doing" },
};

function TaskBoard({ onOpenFull }: { onOpenFull?: () => void }) {
  const [tasks, setTasks] = useState<BoardTask[]>(loadBoardTasks);
  const [newTitle, setNewTitle] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newPriority, setNewPriority] = useState<BoardTask["priority"]>("mid");

  const persist = (updated: BoardTask[]) => {
    setTasks(updated);
    saveBoardTasks(updated);
  };

  const moveTask = (id: string, direction: "prev" | "next") => {
    persist(tasks.map(t => {
      if (t.id !== id) return t;
      const flow = STATUS_FLOW[t.status];
      const target = direction === "next" ? flow.next : flow.prev;
      return target ? { ...t, status: target as BoardTask["status"] } : t;
    }));
  };

  const deleteTask = (id: string) => {
    persist(tasks.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: BoardTask = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      status: "todo",
      priority: newPriority,
      due: (() => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate() + 3).padStart(2, "0")}`; })(),
      owner: getCurrentUserSync()?.email || "我",
    };
    persist([...tasks, task]);
    setNewTitle("");
    setShowAdd(false);
  };

  const cols = [
    { key: "todo" as const, label: "待处理", dot: "bg-muted-foreground" },
    { key: "doing" as const, label: "进行中", dot: "bg-blue-500" },
    { key: "done" as const, label: "已完成", dot: "bg-emerald-500" },
  ];

  const total = tasks.length;
  const doneCount = tasks.filter(t => t.status === "done").length;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* 进度概览 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 minimal-progress">
          <span className="minimal-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {doneCount}/{total} 完成 ({progressPct}%)
        </span>
      </div>

      {/* 快速添加 */}
      {showAdd ? (
        <div className="flex items-center gap-2 rounded-lg border border-border p-2" style={{ background: "var(--surface-2)" }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="输入任务标题..."
            className="flex-1 h-7 px-2 rounded text-xs outline-none"
            style={{ background: "var(--input)", border: "1px solid var(--border)" }}
            autoFocus
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as BoardTask["priority"])}
            className="h-7 px-1.5 rounded text-[10px] outline-none border border-border"
            style={{ background: "var(--input)" }}
          >
            <option value="high">高</option>
            <option value="mid">中</option>
            <option value="low">低</option>
          </select>
          <button onClick={addTask} className="h-7 px-2 rounded text-background text-xs font-medium transition-all hover:opacity-90" style={{ background: "var(--foreground)" }}>
            <Check size={12} />
          </button>
          <button onClick={() => setShowAdd(false)} className="h-7 px-2 rounded text-muted-foreground text-xs hover:text-foreground transition-colors">
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
        >
          <Plus size={12} />
          快速添加任务
        </button>
      )}

      {/* 三列看板 */}
      <div className="grid grid-cols-3 gap-3">
        {cols.map(({ key, label, dot }) => {
          const colTasks = tasks.filter(t => t.status === key);
          return (
            <div
              key={key}
              className="rounded-lg border border-border p-3 min-h-[200px]"
              style={{ background: "var(--surface-2)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {colTasks.map(task => {
                  const overdue = task.status !== "done" && isOverdue(task.due);
                  const soon = task.status !== "done" && !overdue && isDueSoon(task.due);
                  const flow = STATUS_FLOW[task.status];
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "group relative rounded-md border p-2.5 transition-all duration-150",
                        overdue
                          ? "border-red-300 dark:border-red-900/50"
                          : "border-border hover:border-foreground/30"
                      )}
                      style={{ background: "var(--surface)" }}
                    >
                      <div className="text-xs font-medium text-foreground pr-5">{task.title}</div>
                      <div className="flex justify-between items-center mt-1.5 text-[10px] text-muted-foreground">
                        <span className={cn(overdue && "text-red-500 font-medium", soon && "text-amber-500 font-medium")}>
                          {task.owner} · {task.due}{overdue && " ⚠"}
                        </span>
                        <span className={cn("px-1.5 py-0.5 rounded-full border text-[9px] font-medium", PRIORITY_STYLES[task.priority])}>
                          {task.priority === "high" ? "高" : task.priority === "mid" ? "中" : "低"}
                        </span>
                      </div>

                      {/* 操作按钮 - hover 显示 */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {flow.prev && (
                          <button
                            onClick={() => moveTask(task.id, "prev")}
                            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="移到上一列"
                          >
                            <ChevronLeft size={11} />
                          </button>
                        )}
                        {flow.next && (
                          <button
                            onClick={() => moveTask(task.id, "next")}
                            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="移到下一列"
                          >
                            <ChevronRight size={11} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="rounded-md border border-dashed border-border py-6 text-center text-[10px] text-muted-foreground">
                    暂无任务
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 日历组件
function Calendar() {
  const [expanded, setExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // 每月有事项的日期（模拟数据）
  const taskDaysByMonth: Record<number, number[]> = {
    0: [6, 15, 20],
    1: [5, 18, 25],
    2: [3, 10, 18, 28],
    3: [7, 12, 20],
    4: [6, 14, 22, 30],
    5: [3, 5, 8, 10, 12, 15, 18, 20, 22, 25, 27, 29],
    6: [4, 11, 19, 28],
    7: [5, 13, 21],
    8: [2, 10, 18, 30],
    9: [8, 16, 24],
    10: [4, 12, 20, 28],
    11: [5, 12, 20, 30],
  };
  const taskDays = taskDaysByMonth[currentMonth] || [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null);
  };

  // 模拟每日详细日程数据（按月份）
  const dailyEventsByMonth: Record<number, Record<number, { time: string; title: string; type: string }[]>> = {
    5: {
      3: [{ time: "09:00", title: "项目启动会", type: "会议" }],
      5: [{ time: "14:00", title: "客户拜访", type: "出差" }],
      8: [{ time: "10:00", title: "技术方案评审", type: "评审" }],
      10: [{ time: "09:30", title: "周例会", type: "会议" }],
      12: [{ time: "全天", title: "北京出差", type: "出差" }],
      15: [{ time: "14:00", title: "需求文档评审", type: "评审" }],
      18: [
        { time: "15:00", title: "部门会议", type: "会议" },
        { time: "16:30", title: "代码审查", type: "评审" },
      ],
      20: [{ time: "10:00", title: "上海客户拜访", type: "出差" }],
      22: [{ time: "09:00", title: "架构设计评审", type: "评审" }],
      25: [{ time: "16:00", title: "月度总结会", type: "会议" }],
      27: [{ time: "全天", title: "深圳出差", type: "出差" }],
      29: [{ time: "14:30", title: "产品方案汇报", type: "评审" }],
    },
  };
  const dailyEvents = dailyEventsByMonth[currentMonth] || {};

  const events = selectedDate && dailyEvents[selectedDate]
    ? dailyEvents[selectedDate]
    : [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="font-medium text-base">{currentYear}年 {currentMonth + 1}月</div>
          <div className="text-xs text-muted-foreground">日程密度视图</div>
        </div>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-all">
            <ChevronLeft size={14} />
          </button>
          <button onClick={nextMonth} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-all">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["日", "一", "二", "三", "四", "五", "六"].map(d => (
          <div key={d} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          const hasTask = taskDays.includes(day);
          const isSelected = selectedDate === day;
          const hasEvents = dailyEvents[day]?.length > 0;
          return (
            <button
              key={day}
              onClick={() => {
                setSelectedDate(day);
                if (!expanded) setExpanded(true);
              }}
              className={cn(
                "aspect-square rounded flex flex-col items-center justify-center text-xs transition-all",
                isToday
                  ? "text-background font-medium"
                  : isSelected
                    ? "border border-foreground text-foreground"
                    : hasTask || hasEvents
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground hover:bg-muted",
              )}
              style={isToday ? { background: "var(--foreground)" } : {}}
            >
              <span>{day}</span>
              {(hasTask || hasEvents) && !isToday && (
                <span className="mt-0.5 w-1 h-1 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* 选中日期的事项展示 */}
      {selectedDate && events.length > 0 && (
        <div className="mt-2 p-2 rounded-lg border border-border" style={{ background: "var(--surface)" }}>
          <div className="text-[10px] font-medium text-muted-foreground mb-1.5">{currentMonth + 1}月{selectedDate}日 日程</div>
          <div className="space-y-1">
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="text-muted-foreground shrink-0 w-10">{ev.time}</span>
                <span className="text-foreground truncate">{ev.title}</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-primary shrink-0">{ev.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedDate && events.length === 0 && (
        <div className="mt-2 p-2 rounded-lg border border-border text-center text-[11px] text-muted-foreground" style={{ background: "var(--surface)" }}>
          {currentMonth + 1}月{selectedDate}日 暂无日程
        </div>
      )}

      {/* 详情按钮 - 打开大型面板 */}
      <button
        onClick={() => setShowDetailPanel(true)}
        className="w-full mt-3 py-2.5 text-xs font-medium text-primary hover:text-primary-foreground bg-primary/5 hover:bg-primary border border-primary/20 hover:border-primary rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <CalendarIcon size={14} />
        <span>打开日程管理中心</span>
      </button>

      {/* 日历详情面板 */}
      <CalendarDetailPanel isOpen={showDetailPanel} onClose={() => setShowDetailPanel(false)} />
    </div>
  );
}

// 行动备忘录（共享数据版本）
function MemoPanel() {
  const { memos, loading, addMemo, toggleMemo, deleteMemo } = usePersonalMemos();
  const [newMemo, setNewMemo] = useState("");

  const handleAddMemo = () => {
    if (!newMemo.trim()) return;
    addMemo(newMemo.trim());
    setNewMemo("");
  };

  const handleToggleMemo = (id: string) => {
    toggleMemo(id);
  };

  const handleDeleteMemo = (id: string) => {
    deleteMemo(id);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-xs text-muted-foreground text-center py-6">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <div className="font-medium text-sm">行动备忘录</div>
        <div className="text-xs text-muted-foreground">个人待办 · {memos.filter(m => !m.completed).length} 项未完成</div>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddMemo()}
          placeholder="输入新事项..."
          className="flex-1 h-8 px-3 rounded text-xs outline-none transition-all"
          style={{ 
            background: "var(--input)",
            border: "1px solid var(--border)"
          }}
        />
        <button 
          onClick={handleAddMemo}
          className="h-8 px-3 rounded text-background font-medium text-xs transition-all hover:opacity-90"
          style={{ background: "var(--foreground)" }}
        >
          添加
        </button>
      </div>
      <div className="space-y-2 max-h-[240px] overflow-auto">
        {memos.map((memo) => (
          <div 
            key={memo.id}
            className={cn(
              "flex items-start gap-2 rounded border border-border p-2 transition-all",
              memo.completed && "opacity-50"
            )}
            style={{ background: "var(--surface-2)" }}
          >
            <input
              type="checkbox"
              checked={memo.completed}
              onChange={() => handleToggleMemo(memo.id)}
              className="mt-0.5 w-3.5 h-3.5 rounded border-border cursor-pointer"
            />
            <div 
              className="flex-1 text-xs leading-relaxed" 
              style={memo.completed ? { textDecoration: "line-through" } : {}}
            >
              {memo.content}
            </div>
            <button 
              onClick={() => handleDeleteMemo(memo.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 团队便签 - Supabase + Realtime 版本
const NOTE_TAGS = ["通知", "提醒", "公告", "讨论"];

function TeamNotes() {
  const { notes, loading, addNote, deleteNote, togglePin, updateNote } = useTeamNotes();
  const [newNote, setNewNote] = useState("");
  const [selectedTag, setSelectedTag] = useState("通知");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [justPublished, setJustPublished] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const success = await addNote(newNote.trim(), selectedTag);
    if (success) {
      setNewNote("");
      setJustPublished(true);
      setTimeout(() => setJustPublished(false), 1200);
      if (listRef.current) listRef.current.scrollTop = 0;
    }
  };

  const startEdit = (note: typeof notes[0]) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    const success = await updateNote(id, editContent.trim());
    if (success) {
      setEditingId(null);
      setEditContent("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  };

  const tagColors: Record<string, string> = {
    "通知": "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30",
    "提醒": "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30",
    "公告": "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30",
    "讨论": "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30",
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-xs text-muted-foreground text-center py-6">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium text-sm flex items-center gap-2">
            团队便签
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
              {notes.length}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">团队共享信息板 · 实时同步</div>
        </div>
      </div>

      {/* 输入区 */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value.slice(0, 500))}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
            placeholder="发布团队通知... (Enter 发送, Shift+Enter 换行)"
            rows={2}
            className={cn(
              "w-full px-3 py-2 rounded text-xs outline-none transition-all resize-none",
              justPublished && "ring-2 ring-emerald-500/40"
            )}
            style={{ background: "var(--input)", border: "1px solid var(--border)" }}
          />
          <div className={cn(
            "absolute bottom-2 right-2 text-[10px] transition-colors",
            newNote.length > 450 ? "text-red-500" : "text-muted-foreground/50"
          )}>
            {newNote.length}/500
          </div>
        </div>
        <div className="flex items-center gap-1">
          {NOTE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border transition-all",
                selectedTag === tag
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              {tag}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-muted-foreground/50">Enter 发送</span>
        </div>
      </div>

      {/* 便签列表 */}
      <div ref={listRef} className="space-y-2 max-h-[280px] overflow-auto scrollbar-thin pr-1">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "group rounded-lg border p-3 transition-all",
              note.pinned
                ? "border-foreground/30 shadow-sm"
                : "border-border hover:border-foreground/20"
            )}
            style={{ background: note.pinned ? "var(--surface-2)" : "var(--surface)" }}
          >
            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none"
                  style={{ background: "var(--input)", border: "1px solid var(--border)" }}
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button onClick={cancelEdit} className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors">取消</button>
                  <button onClick={() => saveEdit(note.id)} className="text-[10px] px-2 py-1 rounded text-background transition-all hover:opacity-90" style={{ background: "var(--foreground)" }}>保存</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {note.pinned && (
                        <span className="text-[10px] text-foreground" title="已置顶">📌</span>
                      )}
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", tagColors[note.tag] || "border-border text-muted-foreground")}>
                        {note.tag}
                      </span>
                    </div>
                    <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
                      {note.content}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-medium text-foreground/70">{note.author}</span>
                    <span>{formatTime(note.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePin(note.id, note.pinned)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={note.pinned ? "取消置顶" : "置顶"}
                    >
                      {note.pinned ? <Check size={11} /> : <span className="text-[11px]">📌</span>}
                    </button>
                    <button
                      onClick={() => startEdit(note)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="编辑"
                    >
                      <FileText size={11} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {notes.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
            暂无团队便签，发布第一条吧
          </div>
        )}
      </div>
    </div>
  );
}

// 共享行动备忘录 - Supabase + Realtime 版本
const MEMO_COLORS = [
  { bg: "#fef3c7", name: "黄" },
  { bg: "#dbeafe", name: "蓝" },
  { bg: "#d1fae5", name: "绿" },
  { bg: "#fce7f3", name: "粉" },
  { bg: "#f3e8ff", name: "紫" },
];
const PRIORITY_CONFIG = {
  high: { label: "高", color: "#ef4444", border: "#fca5a5" },
  medium: { label: "中", color: "#f59e0b", border: "#fcd34d" },
  low: { label: "低", color: "#10b981", border: "#6ee7b7" },
};

function SharedActionMemos() {
  const { memos, loading, addMemo, deleteMemo, updateMemo } = useSharedMemos();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newColor, setNewColor] = useState("#fef3c7");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPriority, setEditPriority] = useState<"high" | "medium" | "low">("medium");
  const [justAdded, setJustAdded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleAddMemo = async () => {
    if (!newContent.trim() || newContent.length > 300) return;
    const success = await addMemo(newContent.trim(), newPriority, newColor);
    if (success) {
      setNewContent("");
      setNewPriority("medium");
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
      if (listRef.current) listRef.current.scrollTop = 0;
    }
  };

  const startEdit = (memo: typeof memos[0]) => {
    setEditingId(memo.id);
    setEditContent(memo.content);
    setEditPriority(memo.priority);
  };

  const saveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    const success = await updateMemo(id, editContent.trim(), editPriority);
    if (success) {
      setEditingId(null);
      setEditContent("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  };

  // 按优先级排序：高 > 中 > 低，同优先级按时间倒序
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...memos].sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleAddClick = () => {
    setIsAdding(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-xs text-muted-foreground text-center py-6">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium text-sm flex items-center gap-2">
            共享行动备忘录
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
              {memos.length}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">团队共享 · 实时同步</div>
        </div>
        {!isAdding && (
          <button
            onClick={handleAddClick}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              justAdded ? "ring-2 ring-emerald-500/40" : ""
            )}
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            <Plus size={14} />
            <span>添加</span>
          </button>
        )}
      </div>

      {/* 添加表单 - 点击按钮后展开 */}
      {isAdding && (
        <div className="mb-3 p-3 rounded-lg border border-border space-y-2" style={{ background: "var(--surface)" }}>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value.slice(0, 300))}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddMemo(); } }}
              placeholder="输入行动事项... (Enter 发送)"
              rows={2}
              className="w-full px-3 py-2 rounded text-xs outline-none resize-none"
              style={{ background: "var(--input)", border: "1px solid var(--border)" }}
            />
            <div className={cn(
              "absolute bottom-2 right-2 text-[10px] transition-colors",
              newContent.length > 270 ? "text-red-500" : "text-muted-foreground/50"
            )}>
              {newContent.length}/300
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* 优先级选择 */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">优先级:</span>
                {(["high", "medium", "low"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className="text-[10px] px-2 py-0.5 rounded border transition-all"
                    style={{
                      background: newPriority === p ? PRIORITY_CONFIG[p].color : "transparent",
                      borderColor: newPriority === p ? PRIORITY_CONFIG[p].color : PRIORITY_CONFIG[p].border,
                      color: newPriority === p ? "#fff" : PRIORITY_CONFIG[p].color,
                    }}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
              {/* 颜色选择 */}
              <div className="flex gap-1 ml-2">
                {MEMO_COLORS.map((c) => (
                  <button
                    key={c.bg}
                    onClick={() => setNewColor(c.bg)}
                    className="w-4 h-4 rounded-full border transition-all"
                    style={{
                      background: c.bg,
                      borderColor: newColor === c.bg ? "var(--foreground)" : "var(--border)",
                      transform: newColor === c.bg ? "scale(1.15)" : "scale(1)",
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/50">Enter 发送</span>
              <button
                onClick={() => setIsAdding(false)}
                className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 备忘录列表 */}
      <div ref={listRef} className="space-y-2 max-h-[220px] overflow-auto scrollbar-thin pr-1">
        {sorted.map((memo) => {
          const pConfig = PRIORITY_CONFIG[memo.priority];
          return (
            <div
              key={memo.id}
              className="group rounded-lg p-2.5 transition-all relative border-l-[3px]"
              style={{ background: memo.color, borderLeftColor: pConfig.color }}
            >
              {editingId === memo.id ? (
                <div className="space-y-1.5">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none bg-white/60 dark:bg-black/20"
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">优先级:</span>
                      {(["high", "medium", "low"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setEditPriority(p)}
                          className="text-[10px] px-1.5 py-0.5 rounded border transition-all"
                          style={{
                            background: editPriority === p ? PRIORITY_CONFIG[p].color : "transparent",
                            borderColor: editPriority === p ? PRIORITY_CONFIG[p].color : PRIORITY_CONFIG[p].border,
                            color: editPriority === p ? "#fff" : PRIORITY_CONFIG[p].color,
                          }}
                        >
                          {PRIORITY_CONFIG[p].label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={cancelEdit} className="text-[10px] px-2 py-0.5 rounded border border-border/50 text-foreground/70 hover:text-foreground transition-colors">取消</button>
                      <button onClick={() => saveEdit(memo.id)} className="text-[10px] px-2 py-0.5 rounded text-white transition-all hover:opacity-90" style={{ background: "var(--foreground)" }}>保存</button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span
                      className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5"
                      style={{ background: pConfig.color, color: "#fff" }}
                    >
                      {pConfig.label}
                    </span>
                    <div className="text-xs leading-relaxed text-foreground pr-8 whitespace-pre-wrap break-words flex-1">{memo.content}</div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-foreground/50">{formatTimeAgo(memo.created_at)}</span>
                      <span className="text-[10px] text-foreground/40">· {memo.author}</span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(memo)}
                        className="p-0.5 rounded hover:bg-black/10 text-foreground/50 hover:text-foreground transition-colors"
                        title="编辑"
                      >
                        <FileText size={11} />
                      </button>
                      <button
                        onClick={() => deleteMemo(memo.id)}
                        className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-foreground/50 hover:text-red-500 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
            暂无备忘录，点击添加按钮创建
          </div>
        )}
      </div>
    </div>
  );
}

// AI 工具
function AITools() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {AI_TOOLS.slice(0, 4).map((tool) => (
        <button
          key={tool.name}
          className="group flex items-start gap-2 rounded border border-border p-3 text-left transition-all duration-150 hover:border-foreground/30"
          style={{ background: "var(--surface-2)" }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded transition-all"
            style={{ background: "var(--muted)" }}
          >
            <tool.icon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">{tool.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{tool.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// 详细日历组件（完整版）
function FullCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  const taskDays = [3, 5, 8, 10, 12, 15, 18, 20, 22, 25, 27, 29];

  const dailyEvents: Record<number, { time: string; title: string; type: string }[]> = {
    16: [
      { time: "10:30", title: "技术方案讨论", type: "会议" },
      { time: "15:00", title: "数据库选型评审", type: "评审" },
    ],
    18: [
      { time: "09:00", title: "周例会", type: "会议" },
      { time: "14:00", title: "客户需求沟通", type: "会议" },
      { time: "16:30", title: "代码审查", type: "评审" },
    ],
    20: [
      { time: "10:00", title: "产品评审", type: "评审" },
      { time: "15:00", title: "团队建设", type: "活动" },
    ],
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-base">{year}年 {month + 1}月</div>
        <div className="flex gap-1">
          <button className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-all">
            <ChevronLeft size={14} />
          </button>
          <button className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-all">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["日", "一", "二", "三", "四", "五", "六"].map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const isToday = day === today.getDate();
          const hasTask = taskDays.includes(day) || dailyEvents[day];
          return (
            <button
              key={day}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all border",
                isToday
                  ? "text-background font-medium border-transparent"
                  : hasTask
                    ? "text-foreground border-border hover:border-foreground/30"
                    : "text-muted-foreground border-transparent hover:border-border",
              )}
              style={isToday ? { background: "var(--foreground)" } : {}}
            >
              <span>{day}</span>
              {hasTask && !isToday && (
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* 今日日程列表 */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="font-medium text-sm mb-3">今日日程</div>
        <div className="space-y-2">
          {(dailyEvents[16] || []).map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-border"
              style={{ background: "var(--surface-2)" }}
            >
              <div className="text-xs font-mono text-muted-foreground w-12">{e.time}</div>
              <div className="flex-1">
                <div className="text-sm font-medium">{e.title}</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded border border-border">
                {e.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 主页面
function Index() {
  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <div className="flex-1 overflow-auto p-5 scrollbar-thin">
        <div className="grid grid-cols-[1fr_320px] gap-5">
          {/* 左侧主内容 */}
          <div className="space-y-5">
            <DataDashboard />

            {/* 项目生命线 - 客户数据看板 */}
            <CustomerLifecyclePanel />

            {/* 任务行动板 */}
            <div className="rounded-lg border border-border p-4" style={{ background: "var(--surface)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    任务行动板
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
                      {(() => { try { const r = localStorage.getItem("kaige-board-tasks"); return r ? JSON.parse(r).length : 6; } catch { return 6; } })()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">本周最需要推进的任务 · 本地持久化</div>
                </div>
                <Link to="/tasks" className="h-8 px-3 rounded border border-border text-xs font-medium hover:bg-muted transition-all inline-flex items-center gap-1.5">
                  管理任务
                  <ChevronRight size={12} />
                </Link>
              </div>
              <TaskBoard />
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-4">
            {/* 日历 */}
            <div className="rounded-lg border border-border" style={{ background: "var(--surface)" }}>
              <Calendar />
            </div>

            {/* 团队便签 */}
            <div className="rounded-lg border border-border" style={{ background: "var(--surface)" }}>
              <TeamNotes />
            </div>

            {/* 个人便签 */}
            <div className="rounded-lg border border-border" style={{ background: "var(--surface)" }}>
              <SharedActionMemos />
            </div>

            {/* 备忘录 */}
            <div className="rounded-lg border border-border" style={{ background: "var(--surface)" }}>
              <MemoPanel />
            </div>

            {/* AI 工具 */}
            <div className="rounded-lg border border-border p-4" style={{ background: "var(--surface)" }}>
              <div className="font-medium text-sm mb-3">智能工具快捷入口</div>
              <AITools />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
