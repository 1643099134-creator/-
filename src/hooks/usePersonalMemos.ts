import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getCurrentUserSync } from "@/lib/auth";

export interface PersonalMemo {
  id: string;
  content: string;
  completed: boolean;
  author: string;
  created_at: string;
}

export function usePersonalMemos() {
  const [memos, setMemos] = useState<PersonalMemo[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUserSync()?.email || "匿名";
  const STORAGE_KEY = "local_personal_memos_v1";

  // 排序：未完成优先，再按时间倒序
  const sortMemos = (list: PersonalMemo[]) =>
    [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.created_at < b.created_at ? 1 : -1;
    });

  // 加载数据
  const fetchMemos = useCallback(async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const data = JSON.parse(raw) as PersonalMemo[];
      setMemos(sortMemos(data));
    } catch (err) {
      console.error("加载本地行动备忘录失败:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemos();
    return () => {};
  }, [fetchMemos, currentUser]);

  // 添加备忘录
  const addMemo = async (content: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as PersonalMemo[];
      const newMemo: PersonalMemo = {
        id: Date.now().toString(36),
        content,
        completed: false,
        author: currentUser,
        created_at: new Date().toISOString(),
      };
      const next = [newMemo, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMemos(sortMemos(next));
      toast.success("备忘录已添加");
      return true;
    } catch (err: any) {
      toast.error("添加失败", { description: err?.message || String(err) });
      return false;
    }
  };

  // 切换完成状态
  const toggleMemo = async (id: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as PersonalMemo[];
      const next = list.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMemos(sortMemos(next));
      return true;
    } catch (err: any) {
      toast.error("操作失败", { description: err?.message || String(err) });
      return false;
    }
  };

  // 删除备忘录
  const deleteMemo = async (id: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as PersonalMemo[];
      const next = list.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMemos(sortMemos(next));
      toast.success("已删除");
      return true;
    } catch (err: any) {
      toast.error("删除失败", { description: err?.message || String(err) });
      return false;
    }
  };

  return { memos, loading, addMemo, toggleMemo, deleteMemo };
}
