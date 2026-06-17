/**
 * 公司资料 - 资料列表页面
 */
export function DocsListPage() {
  return (
    <div className="flex h-full flex-col overflow-auto p-6 scrollbar-thin">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">公司资料档案</h1>
      <p className="mt-2 text-sm text-muted-foreground">资料上传、分类管理、预览与权限分配</p>
      <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        资料管理功能开发中...
      </div>
    </div>
  );
}
