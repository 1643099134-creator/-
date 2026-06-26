import { useState, useRef, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Send,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Square,
  Sparkles,
  FileText,
  Users,
  BarChart3,
  Lightbulb,
  ExternalLink,
  Zap,
  FileCheck,
  FileSearch,
} from "lucide-react";
import { requestLLMStream, type ChatMessage } from "@/lib/aiService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/agent")({
  component: AgentPage,
});

// ==================== 类型定义 ====================

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// ==================== 常量 ====================

const SYSTEM_PROMPT = `你是广西凯格咨询有限公司的智能助手，专注于帮助企业进行项目管理、客户分析和业务咨询。
请用专业、简洁的中文回答问题。如果用户的问题涉及具体数据，请给出合理的分析框架和建议。
回答时适当使用 Markdown 格式（如标题、列表、加粗等）来增强可读性。`;

const QUICK_PROMPTS = [
  { icon: FileText, label: "项目管理建议", prompt: "请给我一些项目管理的最佳实践建议" },
  { icon: Users, label: "客户分析框架", prompt: "请提供一个客户分析的常用框架" },
  { icon: BarChart3, label: "咨询服务方案", prompt: "如何为中小企业制定有效的咨询服务方案？" },
  { icon: Lightbulb, label: "业务优化思路", prompt: "请帮我梳理一下企业业务优化的常见思路" },
];

// ==================== 智能体工作台 ====================

interface AgentWorkstation {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  gradient: string;
  iconBg: string;
  iconColor: string;
  systemPrompt: string;
}

const AGENT_WORKSTATIONS: AgentWorkstation[] = [
  {
    id: "work",
    name: "凯格智能工作助手",
    description: "智能排程、任务分配、进度跟踪，让工作高效有序",
    icon: Zap,
    gradient: "from-blue-500/20 to-cyan-400/10",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    systemPrompt: `你是凯格智能工作助手，专注于企业日常工作的智能化管理。
你的核心能力：
- **任务管理**：帮助用户拆解任务、制定优先级、规划执行步骤
- **进度跟踪**：分析项目进度，识别瓶颈，提供优化建议
- **时间管理**：协助制定工作计划、日程安排、会议纪要
- **协作沟通**：团队协作建议、沟通模板、汇报框架

回答要求：简洁专业，给出可执行的建议，适当使用 Markdown 格式。`,
  },
  {
    id: "summary",
    name: "方案汇总助手",
    description: "整合多源信息，提炼关键洞察，生成结构化报告",
    icon: FileSearch,
    gradient: "from-emerald-500/20 to-teal-400/10",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    systemPrompt: `你是凯格方案汇总助手，擅长将零散信息整合为结构化报告。
你的核心能力：
- **信息整合**：从多个来源提取关键信息，去重归类
- **洞察提炼**：识别数据中的模式、趋势和关键发现
- **报告生成**：将汇总结果整理为清晰的结构化报告
- **对比分析**：多维度对比不同方案的优劣势

回答要求：逻辑清晰，层次分明，使用表格和列表增强可读性。`,
  },
  {
    id: "generate",
    name: "方案生成助手",
    description: "基于需求分析，生成专业咨询方案和落地方案",
    icon: FileCheck,
    gradient: "from-violet-500/20 to-purple-400/10",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
    systemPrompt: `你是凯格方案生成助手，专注于为企业生成专业的咨询方案。
你的核心能力：
- **需求分析**：深入理解客户需求，明确项目目标和范围
- **方案设计**：设计完整的解决方案，包括目标、策略、步骤
- **风险评估**：识别潜在风险，制定应对措施
- **落地规划**：制定可执行的实施计划，包含里程碑和交付物
- **预算估算**：提供合理的资源和成本估算框架

回答要求：方案结构完整（背景→目标→策略→执行→评估），内容专业实用，可直接用于客户汇报。`,
  },
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "你好！我是凯格咨询智能助手 🤖\n\n我可以帮你：\n- **项目管理** — 制定计划、跟踪进度、风险评估\n- **客户分析** — 客户画像、需求分析、满意度评估\n- **业务咨询** — 战略规划、流程优化、培训方案\n\n有什么可以帮你的吗？",
  timestamp: new Date(),
};

// ==================== Markdown 简易渲染 ====================

function renderMarkdown(text: string): string {
  let html = text
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-sm text-slate-100"><code>$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">$1</code>')
    // 标题
    .replace(/^### (.+)$/gm, '<h3 class="mt-3 mb-1 text-base font-semibold text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-4 mb-1 text-lg font-bold text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mt-4 mb-2 text-xl font-bold text-foreground">$1</h1>')
    // 加粗 & 斜体
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 无序列表
    .replace(/^[•\-] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote class="my-1 border-l-2 border-primary/40 pl-3 text-muted-foreground italic">$1</blockquote>')
    // 分割线
    .replace(/^---$/gm, '<hr class="my-3 border-border" />')
    // 换行
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, "<br />");

  return `<p class="mb-2">${html}</p>`;
}

// ==================== 子组件 ====================

/** 消息气泡 */
function MessageBubble({
  msg,
  isLast,
  isStreaming,
  onCopy,
  copiedId,
}: {
  msg: Message;
  isLast: boolean;
  isStreaming: boolean;
  onCopy: (id: string, content: string) => void;
  copiedId: string | null;
}) {
  const isUser = msg.role === "user";
  const isTyping = isLast && isStreaming && msg.role === "assistant" && !msg.content;

  return (
    <div className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* 头像 */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* 消息内容 */}
      <div className="flex max-w-[80%] flex-col gap-1">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {isTyping ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
            </span>
          ) : msg.role === "assistant" ? (
            <div
              className="prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          ) : (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          )}
        </div>

        {/* 操作按钮 */}
        {!isUser && msg.content && !isTyping && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onCopy(msg.id, msg.content)}
              className="flex h-6 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {copiedId === msg.id ? (
                <><Check size={12} /> 已复制</>
              ) : (
                <><Copy size={12} /> 复制</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** 快捷提问卡片 */
function QuickPrompts({ onSelect, visible }: { onSelect: (prompt: string) => void; visible: boolean }) {
  if (!visible) return null;

  const handleOpenAgent = (ws: AgentWorkstation) => {
    // 仅传递 agent ID，系统提示词在目标页面通过 ID 查找
    const url = `${window.location.origin}/agent?agent=${ws.id}`;
    window.open(url, "_blank");
  };

  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Sparkles size={28} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">凯格咨询 AI 助手</h2>
        <p className="mt-1 text-sm text-muted-foreground">智能对话 · 业务分析 · 决策辅助</p>
      </div>

      {/* 智能体工作台 */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 px-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            智能体工作台
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {AGENT_WORKSTATIONS.map((ws) => {
            const Icon = ws.icon;
            return (
              <button
                key={ws.id}
                onClick={() => handleOpenAgent(ws)}
                className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-gradient-to-br ${ws.gradient} p-5 text-center transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${ws.iconBg} transition-transform group-hover:scale-110`}>
                  <Icon size={24} className={ws.iconColor} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{ws.name}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{ws.description}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/60 transition-colors group-hover:text-primary">
                  <span>打开工作台</span>
                  <ExternalLink size={10} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 快捷提问 */}
      <div>
        <div className="mb-3 flex items-center gap-2 px-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            快捷提问
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => onSelect(item.prompt)}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <item.icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.prompt}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 主页面 ====================

/** 从 URL 参数获取当前智能体配置 */
function useAgentConfig(): { agentName: string; agentIcon: React.ComponentType<{ size?: number; strokeWidth?: number }>; agentDesc: string; systemPrompt: string; isAgentMode: boolean } {
  const params = new URLSearchParams(window.location.search);
  const agentId = params.get("agent");

  if (agentId) {
    const workstation = AGENT_WORKSTATIONS.find((ws) => ws.id === agentId);
    if (workstation) {
      return {
        agentName: workstation.name,
        agentIcon: workstation.icon,
        agentDesc: workstation.description,
        systemPrompt: workstation.systemPrompt,
        isAgentMode: true,
      };
    }
  }

  return {
    agentName: "AI Agent 助手",
    agentIcon: Bot,
    agentDesc: "qwen3.6-plus · 流式对话",
    systemPrompt: SYSTEM_PROMPT,
    isAgentMode: false,
  };
}

function AgentPage() {
  const { agentName, agentIcon: AgentIcon, agentDesc, systemPrompt: activePrompt, isAgentMode } = useAgentConfig();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const showWelcome = messages.length === 1;

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 自动聚焦输入框
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text || input).trim();
      if (!content || isStreaming) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsStreaming(true);

      const apiMessages: ChatMessage[] = [
        { role: "system", content: activePrompt },
        ...messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content },
      ];

      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await requestLLMStream(
          apiMessages,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk } : m
              )
            );
          },
          { model: "qwen3.6-plus", signal: controller.signal }
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "抱歉，请求失败，请稍后重试。" }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        textareaRef.current?.focus();
      }
    },
    [input, isStreaming, messages, activePrompt]
  );

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages([WELCOME_MESSAGE]);
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ${
            isAgentMode
              ? "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground"
              : "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground"
          }`}>
            <AgentIcon size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">{agentName}</h1>
            <p className="text-[11px] text-muted-foreground">{agentDesc}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-foreground">
          <Trash2 size={14} className="mr-1.5" />
          新对话
        </Button>
      </div>

      {/* Messages or Welcome */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {showWelcome && !isAgentMode ? (
          <div className="flex h-full flex-col items-center justify-center">
            <QuickPrompts onSelect={handleSend} visible={showWelcome} />
          </div>
        ) : (
          <div className="p-6">
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isLast={i === messages.length - 1}
                  isStreaming={isStreaming}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 p-4 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-border bg-background shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
              className="min-h-[52px] max-h-[160px] resize-none rounded-2xl border-0 bg-transparent px-4 py-3 pr-24 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isStreaming}
              rows={1}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              {isStreaming ? (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-xl"
                  onClick={handleStop}
                  title="停止生成"
                >
                  <Square size={14} fill="currentColor" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                >
                  <Send size={14} />
                </Button>
              )}
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI 生成内容仅供参考，重要决策请人工确认
          </p>
        </div>
      </div>
    </div>
  );
}
