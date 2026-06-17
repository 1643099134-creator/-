import { createFileRoute } from "@tanstack/react-router";
import { resetAllData } from "@/lib/auroraData";
import { ToastProvider, useToast } from "@/components/aurora/Toast";

export const Route = createFileRoute("/settings")({
  component: SettingsPageWrapper,
});

function SettingsPageWrapper() {
  return (
    <ToastProvider>
      <SettingsPage />
    </ToastProvider>
  );
}

function SettingsPage() {
  const { toast } = useToast();

  const handleReset = () => {
    if (!confirm("确定清除本地演示数据并恢复默认吗？")) return;
    resetAllData();
    toast("数据已重置，页面将刷新");
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="flex h-full flex-col overflow-auto p-6 scrollbar-thin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">应用配置与数据管理</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <div className="minimal-card flex items-center justify-between p-5">
            <div>
              <div className="font-bold">外观主题</div>
              <div className="text-xs text-muted-foreground">深色 / 浅色模式，通过侧边栏切换</div>
            </div>
            <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              使用侧边栏切换
            </div>
          </div>

          <div className="minimal-card flex items-center justify-between p-5">
            <div>
              <div className="font-bold">重置演示数据</div>
              <div className="text-xs text-muted-foreground">清除本地新增项目、任务和备忘录</div>
            </div>
            <button className="minimal-btn" onClick={handleReset}>
              重置
            </button>
          </div>

          <div className="minimal-card flex items-center justify-between p-5">
            <div>
              <div className="font-bold">数据存储</div>
              <div className="text-xs text-muted-foreground">所有数据保存在浏览器 localStorage 中</div>
            </div>
            <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              本地存储
            </div>
          </div>
        </div>

        <div className="minimal-card p-5">
          <div className="font-bold">设计说明</div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            这一版采用极简黑白灰工作台风格：高对比度、低饱和卡片、首屏 KPI、阶段生命线、右侧行动区。
            所有交互功能从 Aurora 设计稿提取，包括项目 CRUD、任务看板、日历日程、备忘录、全局搜索等。
          </p>
        </div>
      </div>
    </div>
  );
}
