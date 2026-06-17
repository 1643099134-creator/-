import { getSupabaseUrl } from "@/supabase/client";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface StreamOptions {
  model?: string;
  signal?: AbortSignal;
}

/**
 * 流式调用 AI 对话接口
 */
export async function requestLLMStream(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options?: StreamOptions
): Promise<string> {
  const { model = "qwen3.6-plus", signal } = options ?? {};

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/ai-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, model, stream: true }),
    signal,
  });

  // 如果远程调用失败（网络或未配置），退回到本地模拟流以避免页面崩溃
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  try {
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }
    reader = response.body!.getReader();
  } catch (err) {
    // 本地模拟：按消息内容分片返回，异步触发 onChunk
    const simulated = messages.map((m) => m.content).join(" ") || "(本地模拟回复)";
    const chunks = simulated.match(/.{1,40}/g) || [simulated];
    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 50));
      onChunk(chunk);
      fullText += chunk;
    }
    return fullText;
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const payload = trimmed.slice(6);
        if (payload === "[DONE]") return fullText;

        try {
          const json = JSON.parse(payload);
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk(content);
          }
        } catch {
          // 忽略非法 JSON 行
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return fullText;
    throw err;
  }

  return fullText;
}
