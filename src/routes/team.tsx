import { createFileRoute } from "@tanstack/react-router";
import { teamMembers, COLORS } from "@/lib/auroraData";

export const Route = createFileRoute("/team")({
  component: TeamPage,
});

function TeamPage() {
  return (
    <div className="flex h-full flex-col overflow-auto p-6 scrollbar-thin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">团队</h1>
        <p className="mt-1 text-sm text-muted-foreground">项目交付与客户成功团队</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((m, i) => (
          <div key={i} className="minimal-card p-5 transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {m.avatar}
              </div>
              <div>
                <div className="font-bold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.role}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{m.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
