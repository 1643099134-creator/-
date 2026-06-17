/**
 * 项目管理 - 项目看板页面
 */
export function ProjectBoardPage() {
  return (
    <div className="flex h-full flex-col overflow-auto p-6 scrollbar-thin">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">项目管理</h1>
      <p className="mt-2 text-sm text-muted-foreground">项目新增、进度看板、附件管理、成员协作</p>
      <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        项目管理功能开发中...
      </div>
    </div>
  );
}
