import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  Settings,
  Moon,
  Sun,
  LogOut,
  LogIn,
  Bot,
  ExternalLink,
  Briefcase,
  FolderKanban,
  Shield,
  Menu,
  UserCog,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { useMenus } from "@/hooks/useMenus";

// 图标映射
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  LayoutDashboard,
  Users,
  Settings,
  Bot,
  Briefcase,
  FolderKanban,
  Shield,
  Menu,
  UserCog,
  CheckSquare,
  ClipboardCheck,
};

// 外部系统链接（本地化路径）
const EXTERNAL_LINKS = [
  {
    label: "凯格咨询客户管理系统",
    url: "./assets/凯格咨询客户管理系统.html",
    icon: Building2,
  },
  {
    label: "工作任务助手",
    url: "./assets/工作计划助手.html",
    icon: ClipboardCheck,
  },
];

interface SidebarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ isDark, onToggleTheme, onOpenSettings }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { profile, isAuthenticated, loading } = useAuth();
  const { menus } = useMenus(profile?.role);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    navigate({ to: "/login" });
  };

  // 获取图标组件
  const getIcon = (iconName: string | null) => {
    if (!iconName) return LayoutDashboard;
    return ICON_MAP[iconName] || LayoutDashboard;
  };

  return (
    <aside
      className="flex flex-col border-r border-border m-4 mr-0 min-h-0 minimal-card"
      style={{ width: "var(--sidebar-width)", minWidth: "var(--sidebar-width)" }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div 
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          style={{ 
            background: "var(--foreground)",
            color: "var(--background)"
          }}
        >
          凯
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight"></span>
          <span className="text-[11px] text-muted-foreground"></span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {/* 外部系统链接 */}
        <div className="mb-4">
          <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            External Systems
          </div>
          <div className="space-y-1">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-75 hover:bg-muted hover:text-foreground active:scale-[0.98]"
              >
                <link.icon size={16} strokeWidth={2} />
                <span className="flex-1">{link.label}</span>
                <ExternalLink size={12} className="opacity-50" />
              </a>
            ))}
          </div>
          <div className="my-3 border-t border-border" />
        </div>

        {/* Navigation Menu */}
        <div className="mb-4">
          <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Navigation
          </div>
          <div className="space-y-1">
            {/* 首页入口 */}
            <Link
              to="/"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                pathname === "/"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutDashboard size={16} strokeWidth={2} />
              <span className="flex-1">首页</span>
            </Link>
            {/* AI Agent 快捷入口 */}
            <Link
              to="/agent"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                pathname === "/agent"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Bot size={16} strokeWidth={2} />
              <span className="flex-1">AI 助手</span>
              <span className="flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Agent
              </span>
            </Link>
            {menus.map((menu) => {
              const Icon = getIcon(menu.icon);
              const isActive =
                menu.path === "/" ? pathname === "/" : pathname.startsWith(menu.path);
              return (
                <Link
                  key={menu.id}
                  to={menu.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={16} strokeWidth={2} />
                  <span>{menu.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-border px-3 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : profile ? (
          <div 
            className="flex items-center gap-3 rounded-lg p-2.5"
            style={{ background: "var(--muted)" }}
          >
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium"
              style={{ 
                background: "var(--foreground)",
                color: "var(--background)"
              }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile.username}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.role || "user"}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom Actions */}
      <div className="space-y-1 border-t border-border px-3 py-3">
        <button
          onClick={onToggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
        >
          {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          <span>{isDark ? "切换亮色" : "切换暗色"}</span>
        </button>
        {!loading && (isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={16} strokeWidth={2} />
            <span>退出登录</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
          >
            <LogIn size={16} strokeWidth={2} />
            <span>员工登录</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
