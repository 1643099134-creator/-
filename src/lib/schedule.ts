// 员工日程模块 — localStorage 按员工ID存储

export interface ScheduleItem {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  type: "meeting" | "task" | "review" | "deadline";
  description?: string;
}

const SCHEDULE_KEY_PREFIX = "dashboard_schedule_";

// 为每个员工生成今天的演示日程
function generateDemoSchedule(employeeId: string): ScheduleItem[] {
  const today = new Date().toISOString().slice(0, 10);
  const demos: Record<string, ScheduleItem[]> = {
    "emp-001": [
      { id: "s1", employeeId, date: today, time: "09:00", title: "晨会同步", type: "meeting", description: "团队每日站会，同步昨日进展与今日计划" },
      { id: "s2", employeeId, date: today, time: "10:30", title: "客户方案评审", type: "review", description: "审核凯格咨询项目二期方案" },
      { id: "s3", employeeId, date: today, time: "14:00", title: "项目进度汇报", type: "task", description: "整理本周项目管道数据，准备周报" },
      { id: "s4", employeeId, date: today, time: "16:00", title: "合同条款确认", type: "deadline", description: "与新客户确认合同细节，截止今日" },
    ],
    "emp-002": [
      { id: "s5", employeeId, date: today, time: "09:30", title: "设计稿评审", type: "review", description: "评审 Dashboard 新版 UI 设计稿" },
      { id: "s6", employeeId, date: today, time: "11:00", title: "用户调研整理", type: "task", description: "汇总上周用户访谈记录" },
      { id: "s7", employeeId, date: today, time: "14:30", title: "设计系统更新", type: "task", description: "更新组件库中的按钮和卡片样式" },
    ],
    "emp-003": [
      { id: "s8", employeeId, date: today, time: "09:00", title: "代码审查", type: "review", description: "Review PR #142 和 #145" },
      { id: "s9", employeeId, date: today, time: "10:00", title: "API 接口开发", type: "task", description: "完成日程模块的 CRUD 接口" },
      { id: "s10", employeeId, date: today, time: "15:00", title: "技术分享会", type: "meeting", description: "分享 React Server Components 实践经验" },
      { id: "s11", employeeId, date: today, time: "17:00", title: "Bug 修复截止", type: "deadline", description: "修复 #389 日历渲染异常问题" },
    ],
  };
  return demos[employeeId] || [];
}

export function getTodaySchedule(employeeId: string): ScheduleItem[] {
  const key = SCHEDULE_KEY_PREFIX + employeeId;
  const raw = localStorage.getItem(key);
  if (!raw) {
    const demo = generateDemoSchedule(employeeId);
    localStorage.setItem(key, JSON.stringify(demo));
    return demo;
  }
  const all: ScheduleItem[] = JSON.parse(raw);
  const today = new Date().toISOString().slice(0, 10);
  return all.filter((item) => item.date === today).sort((a, b) => a.time.localeCompare(b.time));
}

export function addScheduleItem(item: Omit<ScheduleItem, "id">): ScheduleItem {
  const key = SCHEDULE_KEY_PREFIX + item.employeeId;
  const raw = localStorage.getItem(key);
  const all: ScheduleItem[] = raw ? JSON.parse(raw) : [];
  const newItem: ScheduleItem = { ...item, id: `s-${Date.now()}` };
  all.push(newItem);
  localStorage.setItem(key, JSON.stringify(all));
  return newItem;
}

export function deleteScheduleItem(employeeId: string, itemId: string): void {
  const key = SCHEDULE_KEY_PREFIX + employeeId;
  const raw = localStorage.getItem(key);
  if (!raw) return;
  const all: ScheduleItem[] = JSON.parse(raw);
  const filtered = all.filter((item) => item.id !== itemId);
  localStorage.setItem(key, JSON.stringify(filtered));
}
