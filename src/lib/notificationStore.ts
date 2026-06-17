// 离线消息存储和提醒管理

export interface PendingNotification {
  id: string;
  type: "team_note" | "shared_memo";
  title: string;
  description: string;
  author: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = "kaige_pending_notifications";

// 获取所有待处理通知
export function getPendingNotifications(): PendingNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

// 添加新通知
export function addNotification(notification: Omit<PendingNotification, "id" | "timestamp" | "read">): void {
  const notifications = getPendingNotifications();
  const newNotification: PendingNotification = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    timestamp: Date.now(),
    read: false,
  };
  notifications.unshift(newNotification);
  // 最多保留50条
  if (notifications.length > 50) {
    notifications.length = 50;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

// 标记所有为已读
export function markAllAsRead(): void {
  const notifications = getPendingNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// 清除所有通知
export function clearAllNotifications(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 获取未读通知数量
export function getUnreadCount(): number {
  return getPendingNotifications().filter(n => !n.read).length;
}
