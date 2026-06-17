import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crm")({
  component: CrmPage,
});

// 本地化：将外部文档引用改为本地 assets 路径（请将对应文件放入 ./assets/）
const CRM_URL = "./assets/凯格咨询客户管理系统.html";

function CrmPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          凯格咨询客户管理系统
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          客户关系管理与业务跟踪
        </p>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <iframe
          src={CRM_URL}
          className="h-full w-full border-0"
          title="凯格咨询客户管理系统"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
