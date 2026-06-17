import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  loadTasks,
  saveTasks,
  type Task,
} from "@/lib/auroraData";
import { Modal } from "@/components/aurora/Modal";
import { ToastProvider, useToast } from "@/components/aurora/Toast";

export const Route = createFileRoute("/tasks")({
  component: TasksPageWrapper,
});

function TasksPageWrapper() {
  return (
    <ToastProvider>
      <TasksPage />
    </ToastProvider>
  );
}

const COLS: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "待处理" },
  { key: "doing", label: "进行中" },
  { key: "done", label: "已完成" },
];

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const map = {
    high: { label: "高", cls: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30" },
    mid: { label: "中", cls: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/30 dark:border-yellow-900/30" },
    low: { label: "低", cls: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-900/30" },
  };
  const m = map[priority];
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}

function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", status: "todo" as Task["status"], priority: "mid" as Task["priority"],
    owner: "", due: "",
  });

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast("请填写任务标题");
      return;
    }
    const newTask: Task = {
      title: form.title.trim(),
      status: form.status,
      priority: form.priority,
      owner: form.owner.trim() || "未指定",
      due: form.due.trim() || "-",
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setModalOpen(false);
    setForm({ title: "", status: "todo", priority: "mid", owner: "", due: "" });
    toast("任务已创建");
  };

  return (
    <div className="flex h-full flex-col overflow-auto p-6 scrollbar-thin">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">任务管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">按状态分组，本地保存</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="minimal-btn minimal-btn-primary"
        >
          <Plus size={14} />
          新建任务
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLS.map(({ key, label }) => {
          const colTasks = tasks.filter((t) => t.status === key);
          return (
            <div key={key} className="minimal-card-subtle min-h-[300px] p-4">
              <div className="mb-3 flex items-center justify-between font-bold">
                <span>{label}</span>
                <span className="minimal-tag">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task, i) => (
                  <div key={i} className="minimal-card p-3 transition-all hover:-translate-y-0.5">
                    <div className="text-[13px] font-semibold">{task.title}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {task.owner} · {task.due}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                    暂无任务
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      <Modal
        open={modalOpen}
        title="新建任务"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="minimal-btn" onClick={() => setModalOpen(false)}>取消</button>
            <button className="minimal-btn minimal-btn-primary" onClick={handleSubmit}>保存任务</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">任务标题</label>
            <input
              className="minimal-input"
              placeholder="任务内容"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">状态</label>
              <select
                className="minimal-input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Task["status"] })}
              >
                <option value="todo">待处理</option>
                <option value="doing">进行中</option>
                <option value="done">已完成</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">优先级</label>
              <select
                className="minimal-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })}
              >
                <option value="high">高</option>
                <option value="mid">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">负责人</label>
              <input
                className="minimal-input"
                placeholder="负责人"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">截止</label>
              <input
                className="minimal-input"
                placeholder="06/30"
                value={form.due}
                onChange={(e) => setForm({ ...form, due: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
