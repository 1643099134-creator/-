import { useState } from "react";
import {
  Bot,
  ChevronDown,
  Presentation,
  FileText,
  Briefcase,
  Sparkles,
  Zap,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AI_TOOLS = [
  {
    name: "PPT智能助手",
    url: "#",
    icon: Presentation,
    desc: "一键生成专业演示文稿",
  },
  {
    name: "项目大纲生成助手",
    url: "#",
    icon: FileText,
    desc: "快速梳理项目结构",
  },
  {
    name: "企业规划书生成系统",
    url: "#",
    icon: Briefcase,
    desc: "自动生成企业战略规划",
  },
] as const;

const QUICK_AGENTS = [
  { name: "数据分析", icon: BarChart3, color: "bg-chart-1/15 text-chart-1" },
  { name: "文案生成", icon: Sparkles, color: "bg-chart-2/15 text-chart-2" },
  { name: "自动化流程", icon: Zap, color: "bg-chart-4/15 text-chart-4" },
] as const;

export function AgentPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bot size={20} className="text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Agent 面板</h2>
      </div>

      {/* Quick Agent Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_AGENTS.map((agent) => (
          <button
            key={agent.name}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-px hover:border-primary/30 hover:shadow-sm"
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                agent.color
              )}
            >
              <agent.icon size={22} />
            </div>
            <span className="text-sm font-medium text-foreground">{agent.name}</span>
          </button>
        ))}
      </div>

      {/* AI Tools Expandable Section */}
      <div className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-200 hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-base font-medium text-foreground">AI 工具集</span>
              <p className="text-xs text-muted-foreground">
                {expanded ? "收起工具列表" : "点击展开 3 个智能工具"}
              </p>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={cn(
              "text-muted-foreground transition-transform duration-300",
              expanded && "rotate-180"
            )}
          />
        </button>

        {/* Expandable Panel */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-2 border-t border-border px-5 py-4">
              {AI_TOOLS.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-transparent px-4 py-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                    <tool.icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary">
                      {tool.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    打开 →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
