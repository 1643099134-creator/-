import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";

export interface MenuItem {
  id: string;
  parent_id: string | null;
  name: string;
  path: string;
  icon: string | null;
  sort_order: number;
  visible: boolean;
  permission_code: string | null;
}

export function useMenus(userRole?: string) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenus() {
      try {
        const { data, error } = await supabase
          .from("menus")
          .select("*")
          .eq("visible", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        // 根据角色过滤菜单
        const filtered = (data || []).filter((menu: any) => {
          if (!menu.permission_code) return true; // 无权限要求，所有人可见
          if (userRole === "admin") return true; // 管理员可见所有
          return false; // 其他角色隐藏需要权限的菜单
        });

        setMenus(filtered);
      } catch (err) {
        console.error("Failed to load menus:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMenus();
  }, [userRole]);

  return { menus, loading };
}
