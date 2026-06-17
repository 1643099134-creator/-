import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { messages } from "@/lib/auroraData";
import { ToastProvider, useToast } from "@/components/aurora/Toast";

export const Route = createFileRoute("/messages")({
  component: MessagesPageWrapper,
});

function MessagesPageWrapper() {
  return (
    <ToastProvider>
      <MessagesPage />
    </ToastProvider>
  );
}

function MessagesPage() {
  const { toast } = useToast();

  return (
    <div className="flex h-full flex-col overflow-auto p-6 scrollbar-thin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">消息</h1>
          <p className="mt-1 text-sm text-muted-foreground">近期项目沟通摘要</p>
        </div>
        <button
          className="minimal-btn minimal-btn-primary"
          onClick={() => toast("演示版：消息草稿已创建")}
        >
          <Plus size={14} />
          撰写消息
        </button>
      </div>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className="minimal-card p-4 transition-all hover:-translate-y-0.5">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{
                  background: m.unread ? "var(--foreground)" : "var(--muted)",
                  color: m.unread ? "var(--background)" : "var(--muted-foreground)",
                }}
              >
                {m.from[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold">{m.from}</span>
                  <span className="text-xs text-muted-foreground">{m.time}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
