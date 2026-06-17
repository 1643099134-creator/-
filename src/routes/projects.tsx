import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import {
  loadProjects,
  saveProjects,
  STAGES,
  COLORS,
  pct,
  type Project,
} from "@/lib/auroraData";
import { StageLine } from "@/components/aurora/StageLine";
import { Modal } from "@/components/aurora/Modal";
import { ToastProvider, useToast } from "@/components/aurora/Toast";

export const Route = createFileRoute("/projects")({
  component: ProjectsPageWrapper,
});

function ProjectsPageWrapper() {
  return (
    <ToastProvider>
      <ProjectsPage />
    </ToastProvider>
  );
}

function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", type: "", owner: "", stage: 1, budget: "", date: "", desc: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        (filter === "all" || p.stage === Number(filter)) &&
        (p.name.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q))
    );
  }, [projects, search, filter]);

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast("请填写项目名称");
      return;
    }
    const newProject: Project = {
      name: form.name.trim(),
      type: form.type.trim() || "未分类",
      owner: form.owner.trim() || "未指定",
      stage: form.stage,
      budget: form.budget.trim() || "-",
      date: form.date.trim() || "-",
      avatar: form.name[0],
      color: COLORS[projects.length % COLORS.length],
      desc: form.desc.trim() || "暂无描述",
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveProjects(updated);
    setModalOpen(false);
    setForm({ name: "", type: "", owner: "", stage: 1, budget: "", date: "", desc: "" });
    toast("项目已创建");
  };

  const detail = detailIdx !== null ? projects[detailIdx] : null;

  return (
    <div className="flex h-full flex-col overflow-auto p-6 scrollbar-thin">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">全部项目</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            支持搜索、阶段筛选和快速查看详情
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="minimal-btn minimal-btn-primary"
        >
          <Plus size={14} />
          新建项目
        </button>
      </div>

      {/* Filters */}
      <div className="minimal-card mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-[320px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="minimal-input pl-9"
              placeholder="搜索项目 / 类型 / 负责人"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`minimal-btn text-xs ${filter === "all" ? "minimal-btn-primary" : ""}`}
              onClick={() => setFilter("all")}
            >
              全部
            </button>
            {STAGES.map((s, i) => (
              <button
                key={s}
                className={`minimal-btn text-xs ${filter === String(i + 1) ? "minimal-btn-primary" : ""}`}
                onClick={() => setFilter(String(i + 1))}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="minimal-card overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">项目</th>
              <th className="px-4 py-3 font-medium">阶段</th>
              <th className="px-4 py-3 font-medium">预算</th>
              <th className="px-4 py-3 font-medium">负责人</th>
              <th className="px-4 py-3 font-medium">周期</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const realIdx = projects.indexOf(p);
              return (
                <tr
                  key={i}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="minimal-tag">{STAGES[p.stage - 1]} · {pct(p.stage)}%</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.budget}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-3">
                    <button
                      className="minimal-btn text-xs"
                      onClick={() => setDetailIdx(realIdx)}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  暂无匹配项目
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Project Modal */}
      <Modal
        open={modalOpen}
        title="新建项目"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="minimal-btn" onClick={() => setModalOpen(false)}>取消</button>
            <button className="minimal-btn minimal-btn-primary" onClick={handleSubmit}>创建项目</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">项目名称</label>
            <input
              className="minimal-input"
              placeholder="例如：智慧园区一体化平台"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">项目类型</label>
              <input
                className="minimal-input"
                placeholder="行业 / 方向"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">负责人</label>
              <input
                className="minimal-input"
                placeholder="负责人姓名"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">阶段</label>
              <select
                className="minimal-input"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: Number(e.target.value) })}
              >
                {STAGES.map((s, i) => (
                  <option key={s} value={i + 1}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">预算</label>
              <input
                className="minimal-input"
                placeholder="例如：3200 万"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">周期</label>
            <input
              className="minimal-input"
              placeholder="2026.06 - 2027.02"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">描述</label>
            <textarea
              className="minimal-input min-h-[80px] resize-none"
              placeholder="写一句项目简介"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={!!detail}
        title={detail?.name || ""}
        onClose={() => setDetailIdx(null)}
        footer={
          <>
            <button className="minimal-btn" onClick={() => setDetailIdx(null)}>关闭</button>
            <button className="minimal-btn minimal-btn-primary" onClick={() => toast("演示版：已生成下一步行动建议")}>
              生成下一步建议
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                style={{ background: detail.color }}
              >
                {detail.avatar}
              </div>
              <div>
                <div className="text-xl font-bold">{detail.name}</div>
                <div className="text-sm text-muted-foreground">
                  {detail.type} · 负责人 {detail.owner}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{detail.desc}</p>
            <div className="flex flex-wrap gap-2">
              <span className="minimal-tag">当前阶段：{STAGES[detail.stage - 1]}</span>
              <span className="minimal-tag">预算 {detail.budget}</span>
              <span className="minimal-tag">周期 {detail.date}</span>
            </div>
            <StageLine stage={detail.stage} />
            <div className="minimal-progress">
              <span className="minimal-progress-bar" style={{ width: `${pct(detail.stage)}%` }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
