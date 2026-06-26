/**
 * AI Agent - 可复用的对话组件
 * 用于在其他页面中嵌入 AI 对话功能
 */
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { requestLLMStream, type ChatMessage } from "@/lib/aiService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface AgentChatProps {
  /** 自定义系统提示词 */
  systemPrompt?: string;
  /** 使用的模型 */
  model?: string;
  /** 是否显示标题栏 */
  showHeader?: boolean;
  /** 最大高度 */
  maxHeight?: string;
  /** 占位文本 */
  placeholder?: string;
}

export function AgentChatPage({
  systemPrompt = "你是广西凯格咨询有限公司的智能助手，专注于帮助企业进行项目管理、客户分析和业务咨询。请用专业、简洁的中文回答问题。",
  model = "qwen3.6-plus",
  showHeader = true,
  maxHeight = "100%",
  placeholder = "输入你的问题... (Enter 发送, Shift+Enter 换行)",
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是凯格咨询智能助手，有什么可以帮你的吗？",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
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
        { model, signal: controller.signal }
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
    }
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
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "你好！我是凯格咨询智能助手，有什么可以帮你的吗？",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ maxHeight }}>
      {showHeader && (
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Agent 助手</h1>
              <p className="text-xs text-muted-foreground">基于 {model} 模型</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 size={14} className="mr-2" />
            清空对话
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content ||
                  (isStreaming && msg.id === messages[messages.length - 1]?.id ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                    </span>
                  ) : (
                    ""
                  ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-border bg-background focus-within:border-primary/50 transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[52px] resize-none rounded-2xl border-0 bg-transparent px-4 py-3 pr-20 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isStreaming}
            />
            <div className="absolute bottom-2 right-2">
              <Button
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming}
              >
                {isStreaming ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send size={14} />
                )}
              </Button>
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
