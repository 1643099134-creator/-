import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Navigate,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { GlobalNotificationPopup } from "@/components/dashboard/GlobalNotificationPopup";

// 获取去掉 basepath 前缀的路径
function useCleanPathname() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // 去掉 basepath 前缀 '/-' 或直接取 '/'
  return pathname.replace(/^\/-/, '') || '/';
}

function NotFoundComponent() {
  const pathname = useCleanPathname();
  if (pathname === "/") return null;
  return <Navigate to="/" replace />;
}

function ErrorComponent({ error }: { error: Error; reset: () => void }) {
  console.error(error);
  const pathname = useCleanPathname();
  if (pathname === "/") return null;
  return <Navigate to="/" replace />;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// 不需要登录即可访问的路由
const PUBLIC_ROUTES = ["/login"];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const rawPathname = useRouterState({ select: (s) => s.location.pathname });
  // 去掉 basepath 前缀以匹配路由
  const pathname = rawPathname.replace(/^\/-/, '') || '/';
  const [isDark, setIsDark] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  // Apply theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // 加载中显示空白（或可添加 loading spinner）
  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex h-screen items-center justify-center bg-background">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    );
  }

  // 路由守卫：非公开页面未登录时跳转 /login
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
  if (!isPublicRoute && !isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Navigate to="/login" replace />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    );
  }

  // 登录页不显示侧边栏
  if (isPublicRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div 
        className="flex h-screen overflow-hidden"
        style={{ 
          background: "var(--background)",
          color: "var(--foreground)",
          gap: "16px",
          padding: "16px"
        }}
      >
        <Sidebar
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <main 
          className="flex-1 overflow-hidden minimal-card flex flex-col"
        >
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
      <GlobalNotificationPopup />
    </QueryClientProvider>
  );
}
