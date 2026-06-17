import { useState, useEffect, useCallback } from "react";
// 本地化：使用 localStorage 替代远程 supabase
import { toast } from "sonner";
import { getCurrentUserSync } from "@/lib/auth";
import { addNotification } from "@/lib/notificationStore";

export interface SharedMemo {
  id: string;
  content: string;
  priority: "high" | "medium" | "low";
  color: string;
  author: string;
  created_at: string;
}

export function useSharedMemos() {
  const [memos, setMemos] = useState<SharedMemo[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUserSync()?.email || "团队成员";

  // 加载数据（从 localStorage）
  const STORAGE_KEY = "local_shared_memos_v1";
  const fetchMemos = useCallback(async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const data = JSON.parse(raw) as SharedMemo[];
      setMemos(data.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));
    } catch (err) {
      console.error("加载本地共享备忘录失败:", err);
    }
    setLoading(false);
  }, []);

  // 初始化 + 实时订阅
  useEffect(() => {
    fetchMemos();
    // 本地实现不支持实时订阅；仅读取 localStorage
    return () => {};
  }, [fetchMemos, currentUser]);

  // 添加备忘录
  const addMemo = async (content: string, priority: "high" | "medium" | "low", color: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as SharedMemo[];
      const newMemo: SharedMemo = {
        id: Date.now().toString(36),
        content,
        priority,
        color,
        author: currentUser,
        created_at: new Date().toISOString(),
      };
      const next = [newMemo, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMemos(next);
      const priorityLabel = { high: "高", medium: "中", low: "低" }[priority];
      toast.success("行动备忘录已添加", {
        description: `${currentUser} 添加了${priorityLabel}优先级事项`,
      });
      return true;
    } catch (err: any) {
      toast.error("添加失败", { description: err?.message || String(err) });
      return false;
    }
  };

  // 删除备忘录
  const deleteMemo = async (id: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as SharedMemo[];
      const next = list.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMemos(next);
      return true;
    } catch (err: any) {
      toast.error("删除失败", { description: err?.message || String(err) });
      return false;
    }
  };

  // 编辑备忘录
  const updateMemo = async (id: string, content: string, priority: "high" | "medium" | "low") => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as SharedMemo[];
      const next = list.map((m) => (m.id === id ? { ...m, content, priority } : m));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMemos(next);
      return true;
    } catch (err: any) {
      toast.error("保存失败", { description: err?.message || String(err) });
      return false;
    }
  };

  return { memos, loading, addMemo, deleteMemo, updateMemo };
}
