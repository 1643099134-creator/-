import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Briefcase, Plane, FileText, Plus, Trash2, Pin, Edit3, Check, Tag, StickyNote, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamNotes } from "@/hooks/useTeamNotes";
import { useSharedMemos } from "@/hooks/useSharedMemos";
import { toast } from "sonner";

// 事项类型定义
type EventType = "会议" | "出差" | "方案";

interface CalendarEvent {
  id: string;
  date: number;
  title: string;
  type: EventType;
  time?: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", date: 3, title: "项目启动会", type: "会议", time: "09:00" },
  { id: "2", date: 5, title: "客户拜访", type: "出差", time: "14:00" },
  { id: "3", date: 8, title: "技术方案评审", type: "方案", time: "10:00" },
  { id: "4", date: 10, title: "周例会", type: "会议", time: "09:30" },
  { id: "5", date: 12, title: "北京出差", type: "出差", time: "全天" },
  { id: "6", date: 15, title: "需求文档评审", type: "方案", time: "14:00" },
  { id: "7", date: 18, title: "部门会议", type: "会议", time: "15:00" },
  { id: "8", date: 20, title: "上海客户拜访", type: "出差", time: "10:00" },
  { id: "9", date: 22, title: "架构设计评审", type: "方案", time: "09:00" },
  { id: "10", date: 25, title: "月度总结会", type: "会议", time: "16:00" },
  { id: "11", date: 27, title: "深圳出差", type: "出差", time: "全天" },
  { id: "12", date: 29, title: "产品方案汇报", type: "方案", time: "14:30" },
];

const EVENT_TYPE_CONFIG: Record<EventType, { icon: React.ElementType; color: string; bgColor: string }> = {
  "会议": { icon: CalendarIcon, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  "出差": { icon: Plane, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  "方案": { icon: FileText, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
};

// ==================== 大日历看板 ====================
function BigCalendarBoard() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const getEventsForDay = (day: number) => MOCK_EVENTS.filter(e => e.date === day);
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: "var(--muted)" }}>
            <CalendarIcon size={20} className="text-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{currentYear}年 {currentMonth + 1}月</h3>
            <p className="text-xs text-muted-foreground">事项看板 · 会议 / 出差 / 方案</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-border hover:bg-muted transition-all"><ChevronLeft size={16} /></button>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-border hover:bg-muted transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5 shrink-0">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1.5">{d}</div>
        ))}
      </div>

      {/* 日历网格 - 使用固定高度填满剩余空间 */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-0" style={{ gridTemplateRows: `repeat(${Math.ceil((daysInMonth + firstDay) / 7)}, 1fr)` }}>
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="rounded-lg" />
        ))}
        {days.map((day) => {
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={day}
              className={cn(
                "p-1.5 rounded-lg border flex flex-col gap-0.5 overflow-hidden",
                isToday ? "border-primary bg-primary/5" : "border-border"
              )}
              style={!isToday ? { background: "var(--surface)" } : {}}
            >
              <div className="flex items-center justify-between shrink-0">
                <span className={cn("text-xs font-medium", isToday ? "text-primary" : "text-foreground")}>{day}</span>
                {isToday && <span className="text-[9px] px-1 py-0.5 rounded-full bg-primary text-primary-foreground leading-none">今</span>}
              </div>
              <div className="flex-1 space-y-0.5 overflow-hidden min-h-0">
                {dayEvents.slice(0, 3).map((event) => {
                  const config = EVENT_TYPE_CONFIG[event.type];
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className={cn("flex items-center gap-1 px-1 py-0.5 rounded text-[9px] truncate", config.bgColor, config.color)}>
                      <Icon size={9} className="shrink-0" />
                      <span className="truncate">{event.title}</span>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="mt-3 pt-2 border-t border-border flex items-center gap-4 text-xs shrink-0">
        <span className="text-muted-foreground">事项类型：</span>
        {(Object.entries(EVENT_TYPE_CONFIG) as [EventType, typeof EVENT_TYPE_CONFIG[EventType]][]).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn("p-1 rounded", config.bgColor)}><Icon size={12} className={config.color} /></div>
              <span className="text-foreground">{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 完整团队便签面板 ====================
function TeamNotesFull() {
  const { notes, loading, addNote, deleteNote, togglePin, updateNote } = useTeamNotes();
  const [newNote, setNewNote] = useState("");
  const [selectedTag, setSelectedTag] = useState("通知");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");
  const listRef = useRef<HTMLDivElement>(null);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const success = await addNote(newNote.trim(), selectedTag);
    if (success) {
      setNewNote("");
      if (listRef.current) listRef.current.scrollTop = 0;
    }
  };

  const startEdit = (note: typeof notes[0]) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    const success = await updateNote(id, editContent.trim());
    if (success) { setEditingId(null); setEditContent(""); }
  };

  const tags = ["通知", "提醒", "公告", "讨论"];
  const tagColors: Record<string, string> = {
    "通知": "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30",
    "提醒": "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30",
    "公告": "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30",
    "讨论": "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30",
  };

  const filteredNotes = filterTag === "all" ? notes : notes.filter(n => n.tag === filterTag);

  if (loading) return <div className="text-xs text-muted-foreground text-center py-12">加载中...</div>;

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <StickyNote size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">团队便签</h3>
            <p className="text-xs text-muted-foreground">实时共享 · {notes.length} 条便签</p>
          </div>
        </div>
      </div>

      {/* 添加区域 */}
      <div className="mb-4 p-3 rounded-lg border border-border shrink-0" style={{ background: "var(--surface-2)" }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value.slice(0, 500))}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
          placeholder="发布团队通知... (Enter 发送, Shift+Enter 换行)"
          rows={2}
          className="w-full px-3 py-2 rounded text-sm outline-none resize-none mb-2"
          style={{ background: "var(--input)", border: "1px solid var(--border)" }}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn("px-2 py-1 rounded text-[10px] border transition-all", selectedTag === tag ? tagColors[tag] : "border-border text-muted-foreground hover:bg-muted")}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{newNote.length}/500</span>
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Plus size={14} />
              发布
            </button>
          </div>
        </div>
      </div>

      {/* 标签筛选 */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <Tag size={12} className="text-muted-foreground" />
        <button onClick={() => setFilterTag("all")} className={cn("px-2 py-1 rounded text-[10px] border transition-all", filterTag === "all" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-muted")}>全部</button>
        {tags.map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag)} className={cn("px-2 py-1 rounded text-[10px] border transition-all", filterTag === tag ? tagColors[tag] : "border-border text-muted-foreground hover:bg-muted")}>{tag}</button>
        ))}
      </div>

      {/* 便签列表 */}
      <div ref={listRef} className="flex-1 overflow-auto space-y-2 min-h-0">
        {filteredNotes.map((note) => (
          <div key={note.id} className={cn("group p-3 rounded-lg border border-border transition-all", note.pinned && "ring-1 ring-amber-400/50")} style={{ background: "var(--surface)" }}>
            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none" style={{ background: "var(--input)", border: "1px solid var(--border)" }} />
                <div className="flex items-center gap-2">
                  <button onClick={() => saveEdit(note.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-primary text-primary-foreground"><Check size={10} /> 保存</button>
                  <button onClick={() => { setEditingId(null); setEditContent(""); }} className="px-2 py-1 rounded text-[10px] text-muted-foreground hover:bg-muted">取消</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{note.content}</p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => startEdit(note)} className="p-1 rounded hover:bg-muted text-muted-foreground"><Edit3 size={12} /></button>
                    <button onClick={() => togglePin(note.id, note.pinned)} className={cn("p-1 rounded hover:bg-muted", note.pinned ? "text-amber-500" : "text-muted-foreground")}><Pin size={12} /></button>
                    <button onClick={() => deleteNote(note.id)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className={cn("px-1.5 py-0.5 rounded border", tagColors[note.tag] || "border-border")}>{note.tag}</span>
                  <span>{note.author}</span>
                  <span>·</span>
                  <span>{new Date(note.created_at).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  {note.pinned && <span className="text-amber-500 flex items-center gap-0.5"><Pin size={9} /> 已置顶</span>}
                </div>
              </>
            )}
          </div>
        ))}
        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">暂无便签</div>
        )}
      </div>
    </div>
  );
}

// ==================== 完整共享备忘录面板 ====================
function SharedMemosFull() {
  const { memos, loading, addMemo, deleteMemo, updateMemo } = useSharedMemos();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newColor, setNewColor] = useState("#fef3c7");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPriority, setEditPriority] = useState<"high" | "medium" | "low">("medium");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleAddMemo = async () => {
    if (!newContent.trim() || newContent.length > 300) return;
    const success = await addMemo(newContent.trim(), newPriority, newColor);
    if (success) {
      setNewContent(""); setNewPriority("medium"); setIsAdding(false);
      if (listRef.current) listRef.current.scrollTop = 0;
    }
  };

  const startEdit = (memo: typeof memos[0]) => {
    setEditingId(memo.id); setEditContent(memo.content); setEditPriority(memo.priority);
  };

  const saveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    const success = await updateMemo(id, editContent.trim(), editPriority);
    if (success) { setEditingId(null); setEditContent(""); }
  };

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...memos].sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const filtered = filterPriority === "all" ? sorted : sorted.filter(m => m.priority === filterPriority);

  const priorityConfig = {
    high: { label: "高", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", border: "border-l-red-500" },
    medium: { label: "中", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-l-amber-500" },
    low: { label: "低", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-l-blue-500" },
  };

  const colors = ["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#f3e8ff", "#ffedd5"];

  if (loading) return <div className="text-xs text-muted-foreground text-center py-12">加载中...</div>;

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">共享行动备忘录</h3>
            <p className="text-xs text-muted-foreground">实时共享 · {memos.length} 条事项</p>
          </div>
        </div>
        {!isAdding && (
          <button onClick={() => { setIsAdding(true); setTimeout(() => inputRef.current?.focus(), 100); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
            <Plus size={14} /> 添加
          </button>
        )}
      </div>

      {/* 添加区域 */}
      {isAdding && (
        <div className="mb-4 p-3 rounded-lg border border-border shrink-0 animate-in fade-in slide-in-from-top-2 duration-200" style={{ background: "var(--surface-2)" }}>
          <textarea ref={inputRef} value={newContent} onChange={(e) => setNewContent(e.target.value.slice(0, 300))} placeholder="输入备忘录内容..." rows={2} className="w-full px-3 py-2 rounded text-sm outline-none resize-none mb-2" style={{ background: "var(--input)", border: "1px solid var(--border)" }} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {(["high", "medium", "low"] as const).map(p => (
                  <button key={p} onClick={() => setNewPriority(p)} className={cn("px-2 py-1 rounded text-[10px] border transition-all", newPriority === p ? priorityConfig[p].bg + " " + priorityConfig[p].color : "border-border text-muted-foreground hover:bg-muted")}>
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {colors.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} className={cn("w-5 h-5 rounded-full border-2 transition-all", newColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-105")} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{newContent.length}/300</span>
              <button onClick={() => setIsAdding(false)} className="px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-muted">取消</button>
              <button onClick={handleAddMemo} disabled={!newContent.trim()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50">
                <Plus size={14} /> 添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 优先级筛选 */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <span className="text-[10px] text-muted-foreground">筛选：</span>
        <button onClick={() => setFilterPriority("all")} className={cn("px-2 py-1 rounded text-[10px] border transition-all", filterPriority === "all" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-muted")}>全部</button>
        {(["high", "medium", "low"] as const).map(p => (
          <button key={p} onClick={() => setFilterPriority(p)} className={cn("px-2 py-1 rounded text-[10px] border transition-all", filterPriority === p ? priorityConfig[p].bg + " " + priorityConfig[p].color : "border-border text-muted-foreground hover:bg-muted")}>
            {priorityConfig[p].label}优先级
          </button>
        ))}
      </div>

      {/* 备忘录列表 */}
      <div ref={listRef} className="flex-1 overflow-auto space-y-2 min-h-0">
        {filtered.map((memo) => {
          const config = priorityConfig[memo.priority as keyof typeof priorityConfig];
          return (
            <div key={memo.id} className={cn("group p-3 rounded-lg border border-border border-l-4 transition-all", config.border)} style={{ background: memo.color || "var(--surface)" }}>
              {editingId === memo.id ? (
                <div className="space-y-2">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none" style={{ background: "var(--input)", border: "1px solid var(--border)" }} />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {(["high", "medium", "low"] as const).map(p => (
                        <button key={p} onClick={() => setEditPriority(p)} className={cn("px-2 py-1 rounded text-[10px] border transition-all", editPriority === p ? priorityConfig[p].bg + " " + priorityConfig[p].color : "border-border text-muted-foreground hover:bg-muted")}>
                          {priorityConfig[p].label}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => saveEdit(memo.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-primary text-primary-foreground"><Check size={10} /> 保存</button>
                    <button onClick={() => { setEditingId(null); setEditContent(""); }} className="px-2 py-1 rounded text-[10px] text-muted-foreground hover:bg-muted">取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{memo.content}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => startEdit(memo)} className="p-1 rounded hover:bg-muted/50 text-muted-foreground"><Edit3 size={12} /></button>
                      <button onClick={() => deleteMemo(memo.id)} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className={cn("px-1.5 py-0.5 rounded border", config.bg, config.color)}>{config.label}优先级</span>
                    <span>{memo.author}</span>
                    <span>·</span>
                    <span>{new Date(memo.created_at).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">暂无备忘录</div>
        )}
      </div>
    </div>
  );
}

// ==================== 个人行动备忘录 ====================
function PersonalMemosFull() {
  const [memos, setMemos] = useState([
    { id: "1", content: "整理本周项目周报", completed: false },
    { id: "2", content: "客户 Demo 演示排练", completed: false },
    { id: "3", content: "合作商合同条款确认", completed: true },
    { id: "4", content: "更新项目进度报告", completed: false },
  ]);
  const [newMemo, setNewMemo] = useState("");

  const addMemo = () => {
    if (!newMemo.trim()) return;
    setMemos([{ id: Date.now().toString(), content: newMemo, completed: false }, ...memos]);
    setNewMemo("");
    toast.success("备忘录已添加");
  };

  const toggleMemo = (id: string) => {
    setMemos(memos.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const deleteMemo = (id: string) => {
    setMemos(memos.filter(m => m.id !== id));
    toast.success("已删除");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Briefcase size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">行动备忘录</h3>
            <p className="text-xs text-muted-foreground">个人待办 · {memos.filter(m => !m.completed).length} 项未完成</p>
          </div>
        </div>
      </div>

      {/* 添加区域 */}
      <div className="mb-4 p-3 rounded-lg border border-border shrink-0" style={{ background: "var(--surface-2)" }}>
        <div className="flex items-center gap-2">
          <input
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addMemo(); }}
            placeholder="添加新的待办事项..."
            className="flex-1 px-3 py-2 rounded text-sm outline-none"
            style={{ background: "var(--input)", border: "1px solid var(--border)" }}
          />
          <button onClick={addMemo} disabled={!newMemo.trim()} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50">
            <Plus size={14} /> 添加
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-auto space-y-2 min-h-0">
        {memos.map((memo) => (
          <div key={memo.id} className="group flex items-center gap-3 p-3 rounded-lg border border-border transition-all hover:bg-muted/30" style={{ background: "var(--surface)" }}>
            <button onClick={() => toggleMemo(memo.id)} className={cn("w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all", memo.completed ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary")}>
              {memo.completed && <Check size={12} className="text-primary-foreground" />}
            </button>
            <span className={cn("text-sm flex-1", memo.completed ? "line-through text-muted-foreground" : "text-foreground")}>{memo.content}</span>
            <button onClick={() => deleteMemo(memo.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {memos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">暂无待办事项</div>
        )}
      </div>
    </div>
  );
}

// ==================== 主面板 ====================
interface CalendarDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarDetailPanel({ isOpen, onClose }: CalendarDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"calendar" | "notes" | "memos" | "personal">("calendar");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) { document.addEventListener("keydown", handleEsc); return () => document.removeEventListener("keydown", handleEsc); }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { key: "calendar" as const, label: "日历看板", icon: CalendarIcon },
    { key: "notes" as const, label: "团队便签", icon: StickyNote },
    { key: "memos" as const, label: "共享备忘录", icon: AlertCircle },
    { key: "personal" as const, label: "行动备忘录", icon: Briefcase },
  ];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[90vh] rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ background: "var(--surface)" }}>
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><CalendarIcon size={24} className="text-primary" /></div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">日程管理中心</h2>
              <p className="text-sm text-muted-foreground">统一管理您的日程、备忘录和团队便签</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        {/* Tab 导航 */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-border bg-muted/30 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === tab.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                <Icon size={16} />{tab.label}
              </button>
            );
          })}
        </div>

        {/* 内容区域 - 填满剩余空间 */}
        <div className="flex-1 overflow-hidden p-6 min-h-0">
          {activeTab === "calendar" && <BigCalendarBoard />}
          {activeTab === "notes" && <TeamNotesFull />}
          {activeTab === "memos" && <SharedMemosFull />}
          {activeTab === "personal" && <PersonalMemosFull />}
        </div>
      </div>
    </div>
  );
}
