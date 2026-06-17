import { useState, useRef, useCallback } from "react";
import { requestLLMStream, type ChatMessage } from "@/lib/aiService";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const DEFAULT_SYSTEM_PROMPT = `你是广西凯格咨询有限公司的智能助手，专注于帮助企业进行项目管理、客户分析和业务咨询。请用专业、简洁的中文回答问题。`;

export function useAgentChat(systemPrompt?: string) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是凯格咨询智能助手，有什么可以帮你的吗？",
      timestamp: new Date(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMsg.content },
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
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          );
        },
        { signal: controller.signal }
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: "抱歉，请求失败，请稍后重试。" } : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, isStreaming, systemPrompt]);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "你好！我是凯格咨询智能助手，有什么可以帮你的吗？",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, clearChat, stopStreaming };
}
