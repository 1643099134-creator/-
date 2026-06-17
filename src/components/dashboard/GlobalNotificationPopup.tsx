import { useState, useEffect, useCallback } from "react";
import { X, Bell, User, FileText, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase/client";
import { getCurrentUserSync } from "@/lib/auth";

interface NotificationItem {
  id: string;
  type: "team_note" | "shared_memo";
  title: string;
  description: string;
  author: string;
  timestamp: number;
}

export function GlobalNotificationPopup() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [visible, setVisible] = useState(true);
  const currentUser = getCurrentUserSync()?.email || "匿名";

  // 监听 team_notes 实时变更
  useEffect(() => {
    const channel = supabase
      .channel("global_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_notes" },
        (payload: any) => {
          const newNote = payload.new as any;
          if (newNote.author !== currentUser) {
            const notification: NotificationItem = {
              id: `note-${Date.now()}`,
              type: "team_note",
              title: "新团队便签",
              description: `${newNote.author} 发布了新的${newNote.tag}: ${newNote.content.slice(0, 50)}${newNote.content.length > 50 ? "..." : ""}`,
              author: newNote.author,
              timestamp: Date.now(),
            };
            setNotifications((prev) => [notification, ...prev].slice(0, 5));
            setVisible(true);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "shared_memos" },
        (payload: any) => {
          const newMemo = payload.new as any;
          if (newMemo.author !== currentUser) {
            const priorityLabel = { high: "高", medium: "中", low: "低" }[newMemo.priority as string];
            const notification: NotificationItem = {
              id: `memo-${Date.now()}`,
              type: "shared_memo",
              title: "新行动备忘录",
              description: `${newMemo.author} 添加了${priorityLabel}优先级事项: ${newMemo.content.slice(0, 50)}${newMemo.content.length > 50 ? "..." : ""}`,
              author: newMemo.author,
              timestamp: Date.now(),
            };
            setNotifications((prev) => [notification, ...prev].slice(0, 5));
            setVisible(true);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // 自动隐藏：10秒后如果没有新通知则隐藏面板
  useEffect(() => {
    if (notifications.length === 0) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      // 不自动隐藏，让用户手动关闭
    }, 10000);
    return () => clearTimeout(timer);
  }, [notifications]);

  if (!visible || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-32px)]">
      <div
        className="rounded-xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-right-10 fade-in duration-300"
        style={{ background: "var(--surface)" }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">实时消息提醒</h3>
              <p className="text-[10px] text-muted-foreground">{notifications.length} 条新消息</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={dismissAll}
              className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-all"
            >
              全部清除
            </button>
            <button
              onClick={() => setVisible(false)}
              className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="max-h-[400px] overflow-auto">
          {notifications.map((notification) => {
            const Icon = notification.type === "team_note" ? StickyNote : FileText;
            const timeAgo = getTimeAgo(notification.timestamp);

            return (
              <div
                key={notification.id}
                className="group flex items-start gap-3 p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-all animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className={cn(
                  "mt-0.5 p-1.5 rounded-lg shrink-0",
                  notification.type === "team_note"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-foreground">{notification.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notification.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <User size={10} />
                    <span>{notification.author}</span>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all text-muted-foreground shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${Math.floor(diff / 86400000)}天前`;
}
