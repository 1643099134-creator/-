import { useState, useEffect, useCallback } from "react";
// 本地化：使用 localStorage 替代远程 supabase
import { toast } from "sonner";
import { getCurrentUserSync } from "@/lib/auth";
import { addNotification } from "@/lib/notificationStore";

export interface TeamNote {
  id: string;
  content: string;
  author: string;
  tag: string;
  pinned: boolean;
  created_at: string;
}

export function useTeamNotes() {
  const [notes, setNotes] = useState<TeamNote[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUserSync()?.email || "匿名";

  const STORAGE_KEY = "local_team_notes_v1";
  // 加载数据（从 localStorage）
  const fetchNotes = useCallback(async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const data = JSON.parse(raw) as TeamNote[];
      setNotes(data.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));
    } catch (err) {
      console.error("加载本地团队便签失败:", err);
    }
    setLoading(false);
  }, []);

  // 初始化 + 实时订阅
  useEffect(() => {
    fetchNotes();
    // 本地实现不支持实时订阅
    return () => {};
  }, [fetchNotes, currentUser]);

  // 添加便签
  const addNote = async (content: string, tag: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as TeamNote[];
      const newNote: TeamNote = {
        id: Date.now().toString(36),
        content,
        author: currentUser,
        tag,
        pinned: false,
        created_at: new Date().toISOString(),
      };
      const next = [newNote, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotes(next);
      toast.success("团队便签已发布", {
        description: `${currentUser} 发布了新的${tag}`,
      });
      return true;
    } catch (err: any) {
      toast.error("发布失败", { description: err?.message || String(err) });
      return false;
    }
  };

  // 删除便签
  const deleteNote = async (id: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as TeamNote[];
      const next = list.filter((n) => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotes(next);
      return true;
    } catch (err: any) {
      toast.error("删除失败", { description: err?.message || String(err) });
      return false;
    }
  };

  // 切换置顶
  const togglePin = async (id: string, currentPinned: boolean) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as TeamNote[];
      const next = list.map((n) => (n.id === id ? { ...n, pinned: !currentPinned } : n));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotes(next);
      return true;
    } catch (err: any) {
      toast.error("操作失败", { description: err?.message || String(err) });
      return false;
    }
  };

  // 编辑便签
  const updateNote = async (id: string, content: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const list = JSON.parse(raw) as TeamNote[];
      const next = list.map((n) => (n.id === id ? { ...n, content } : n));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotes(next);
      return true;
    } catch (err: any) {
      toast.error("保存失败", { description: err?.message || String(err) });
      return false;
    }
  };

  return { notes, loading, addNote, deleteNote, togglePin, updateNote };
}
