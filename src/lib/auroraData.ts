// Aurora 交互功能数据层 - localStorage 持久化
// 从 ProjectBoard-Aurora-redesign.html 提取

export const STAGES = ['意向', '方案', '须知', '合同', '交付', '尾款', '服务'] as const;

export const COLORS = [
  '#4f8cff', '#ff7a3d', '#38d3ff', '#3ee7a3',
  '#7c5cff', '#ff5f73', '#ffd166', '#14b8a6'
];

export interface Project {
  name: string;
  type: string;
  owner: string;
  stage: number;
  budget: string;
  date: string;
  avatar: string;
  color: string;
  desc: string;
}

export interface Task {
  title: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'high' | 'mid' | 'low';
  due: string;
  owner: string;
}

export interface Event {
  date: string;
  time: string;
  title: string;
  type: string;
}

export interface Memo {
  text: string;
  done: boolean;
}

export interface Partner {
  name: string;
  industry: string;
  stage: number;
  avatar: string;
  desc: string;
}

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface Message {
  from: string;
  time: string;
  text: string;
  unread: boolean;
}

export interface Doc {
  name: string;
  type: string;
  date: string;
  owner: string;
}

export interface Agent {
  icon: string;
  name: string;
  desc: string;
  category: string;
}

const STORE_KEYS = {
  projects: 'pb-aurora-projects',
  events: 'pb-aurora-events',
  tasks: 'pb-aurora-tasks',
  memos: 'pb-aurora-memos',
};

const defaultProjects: Project[] = [
  { name: '智慧城市综合治理平台', type: '政务/城市治理', owner: '陈志远', stage: 5, budget: '8600 万', date: '2025.03 - 2026.09', avatar: '智', color: COLORS[0], desc: '交通调度、公共安防视频分析、政务一网通办三大子系统，涉及 12 个委办局数据对接。' },
  { name: '企业级数据中台（二期）', type: '数据平台', owner: '林雨桐', stage: 4, budget: '4200 万', date: '2025.06 - 2026.06', avatar: '数', color: COLORS[1], desc: '扩展实时流处理与 AI 特征工程能力，对接 ERP/CRM/MES 等 8 个业务系统。' },
  { name: '移动办公平台 V3.0', type: '移动办公', owner: '赵一鸣', stage: 7, budget: '3600 万', date: '2025.01 - 2026.03', avatar: '移', color: COLORS[3], desc: '跨平台移动办公套件，含即时通讯、视频会议、审批流、知识库与 AI 助手。' },
  { name: '统一 API 网关 V4', type: '云原生架构', owner: '周毅', stage: 2, budget: '1800 万', date: '2025.08 - 2026.04', avatar: 'A', color: COLORS[6], desc: '升级为 Envoy 服务网格架构，实现灰度发布、流量染色与自适应限流。' },
  { name: 'AI 政务服务一体化平台', type: '人工智能', owner: '黄思远', stage: 3, budget: '2800 万', date: '2025.10 - 2026.08', avatar: '政', color: COLORS[4], desc: '覆盖社保查询、公积金提取、企业注册等 32 项高频事项，支持语音/文字交互。' },
  { name: '银行核心系统国产化迁移', type: '金融科技', owner: '韩雪峰', stage: 4, budget: '5600 万', date: '2025.05 - 2026.09', avatar: '银', color: COLORS[5], desc: '从 Oracle+小型机迁移至国产分布式数据库+ARM 服务器，全年 7×24 交易零中断。' },
  { name: '高职院校智慧校园平台', type: '教育信息化', owner: '陈雨欣', stage: 1, budget: '1500 万', date: '2026.07 - 2027.07', avatar: '校', color: COLORS[7], desc: '统一信息门户、教务管理、在线教学、智慧后勤一体化平台。' },
  { name: '新能源汽车工厂数字孪生', type: '工业数字化', owner: '吴振宇', stage: 2, budget: '4200 万', date: '2025.11 - 2027.01', avatar: '车', color: COLORS[2], desc: '冲压/焊装/涂装/总装四车间 3D 映射、实时 OEE 监控、预测性维护。' },
];

const defaultEvents: Event[] = [
  { date: '2026-06-16', time: '10:30', title: '技术方案讨论', type: '会议' },
  { date: '2026-06-16', time: '15:00', title: '数据库选型评审', type: '评审' },
  { date: '2026-06-18', time: '11:00', title: '客户 Demo 演示', type: '会议' },
  { date: '2026-06-19', time: '18:00', title: '里程碑 v1.0 截止', type: '截止' },
  { date: '2026-06-25', time: '16:00', title: 'Sprint 回顾', type: '会议' },
  { date: '2026-07-02', time: '10:00', title: '版本发布 v1.0', type: '截止' },
];

const defaultTasks: Task[] = [
  { title: '整理本周项目周报', status: 'todo', priority: 'high', due: '06/18', owner: '陈明远' },
  { title: 'UI 设计评审准备', status: 'doing', priority: 'mid', due: '06/16', owner: '赵一鸣' },
  { title: '客户 Demo 演示排练', status: 'doing', priority: 'high', due: '06/17', owner: '吴振宇' },
  { title: '合同条款确认', status: 'todo', priority: 'mid', due: '06/20', owner: '林雨桐' },
  { title: '移动办公验收文档归档', status: 'done', priority: 'low', due: '06/14', owner: '韩雪峰' },
  { title: 'Q3 需求池梳理', status: 'todo', priority: 'low', due: '06/26', owner: '陈雨欣' },
];

const defaultMemos: Memo[] = [
  { text: '整理本周项目周报', done: false },
  { text: '客户 Demo 演示排练', done: false },
  { text: '合作商合同条款确认', done: true },
];

export const partners: Partner[] = [
  { name: '腾讯云计算（北京）有限责任公司', industry: '云计算', stage: 5, avatar: '腾', desc: '混合云联合解决方案，整合 TDSQL、CBS、CDN，面向金融与政务行业客户联合交付。' },
  { name: '华为云计算技术有限公司', industry: '企业服务', stage: 4, avatar: '华', desc: '围绕华为云 Stack 拓展政务云与智慧园区市场，集成 GaussDB 与鲲鹏生态适配。' },
  { name: '阿里云计算有限公司', industry: '云计算', stage: 5, avatar: '阿', desc: '基于 DataWorks、MaxCompute、PAI 构建数据智能联合方案，面向零售快消行业。' },
  { name: '百度智能云', industry: '人工智能', stage: 3, avatar: '百', desc: '文心大模型与千帆平台联合解决方案，覆盖智能客服、合同审查、知识管理。' },
  { name: '金蝶国际软件集团', industry: 'ERP/SaaS', stage: 2, avatar: '金', desc: '财务中台集成方案：智能费控、电子会计档案、税务云直连。' },
  { name: '浪潮电子信息产业股份有限公司', industry: 'IT基础设施', stage: 4, avatar: '浪', desc: '训练/推理算力租赁与模型部署一体化，面向高校科研与中小 AI 企业市场。' },
];

export const teamMembers: TeamMember[] = [
  { name: '陈明远', role: '项目经理', email: 'chen.my@example.com', avatar: '陈' },
  { name: '林雨桐', role: '数据平台负责人', email: 'lin.yt@example.com', avatar: '林' },
  { name: '赵一鸣', role: '移动端负责人', email: 'zhao.ym@example.com', avatar: '赵' },
  { name: '吴振宇', role: '解决方案架构师', email: 'wu.zy@example.com', avatar: '吴' },
  { name: '韩雪峰', role: '交付经理', email: 'han.xf@example.com', avatar: '韩' },
  { name: '陈雨欣', role: '客户成功', email: 'chen.yx@example.com', avatar: '雨' },
];

export const messages: Message[] = [
  { from: '林雨桐', time: '09:18', text: '数据中台合同法务意见已回传，下午可以同步最终修订点。', unread: true },
  { from: '赵一鸣', time: '昨日', text: '移动办公验收清单已补齐，等待客户盖章确认。', unread: true },
  { from: '吴振宇', time: '周一', text: '数字孪生方案已根据客户反馈调整，新增能耗优化章节。', unread: false },
];

export const docs: Doc[] = [
  { name: '智慧城市项目周报', type: 'PDF', date: '2026-06-14', owner: '陈志远' },
  { name: '数据中台二期方案', type: 'DOCX', date: '2026-06-12', owner: '林雨桐' },
  { name: '移动办公验收清单', type: 'XLSX', date: '2026-06-10', owner: '赵一鸣' },
  { name: 'API 网关技术选型', type: 'MD', date: '2026-06-08', owner: '周毅' },
];

export const agents: Agent[] = [
  { icon: '💻', name: 'Code Reviewer', desc: '代码审查与优化建议', category: '开发工具' },
  { icon: '🧩', name: 'API Builder', desc: '从模型生成接口骨架', category: '开发工具' },
  { icon: '📝', name: '会议纪要', desc: '自动提取决策和待办', category: '效率办公' },
  { icon: '📬', name: '邮件助手', desc: '商务邮件撰写与跟进', category: '效率办公' },
  { icon: '🎨', name: 'UI Designer', desc: '从需求生成界面方案', category: '创意设计' },
  { icon: '📊', name: '报表生成', desc: '自动生成经营分析报表', category: '数据分析' },
  { icon: '🧹', name: '数据清洗', desc: '异常值/缺失值智能处理', category: '数据分析' },
  { icon: '🔮', name: '趋势预测', desc: '销售与资源趋势预测', category: '数据分析' },
];

// localStorage helpers
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function save(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch { /* ignore */ }
}

export function loadProjects(): Project[] {
  return load(STORE_KEYS.projects, defaultProjects);
}

export function saveProjects(projects: Project[]) {
  save(STORE_KEYS.projects, projects);
}

export function loadEvents(): Event[] {
  return load(STORE_KEYS.events, defaultEvents);
}

export function saveEvents(events: Event[]) {
  save(STORE_KEYS.events, events);
}

export function loadTasks(): Task[] {
  return load(STORE_KEYS.tasks, defaultTasks);
}

export function saveTasks(tasks: Task[]) {
  save(STORE_KEYS.tasks, tasks);
}

export function loadMemos(): Memo[] {
  return load(STORE_KEYS.memos, defaultMemos);
}

export function saveMemos(memos: Memo[]) {
  save(STORE_KEYS.memos, memos);
}

export function resetAllData() {
  Object.values(STORE_KEYS).forEach(k => localStorage.removeItem(k));
}

export function pct(stage: number): number {
  return Math.round((stage / STAGES.length) * 100);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
