import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, User, Lock, AlertCircle, LayoutDashboard, Eye, EyeOff, Check, X } from "lucide-react";
import { signIn, signUp } from "@/lib/auth";
import { toast } from "sonner";
import { getPendingNotifications, markAllAsRead } from "@/lib/notificationStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const DEMO_ACCOUNTS = [
  { username: "zhangsan", label: "张三 · 项目经理" },
  { username: "lisi", label: "李四 · 设计师" },
  { username: "wangwu", label: "王五 · 开发工程师" },
] as const;

// 密码强度校验
function checkPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: "弱", color: "bg-red-500" };
  if (score <= 2) return { score, label: "较弱", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "中等", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "较强", color: "bg-blue-500" };
  return { score, label: "强", color: "bg-emerald-500" };
}

/** Canvas 粒子连线动画 */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const NODE_COUNT = 50;
    const CONNECT_DIST = 140;

    const resize = () => {
      const { offsetWidth: w, offsetHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      nx: Math.random(),
      ny: Math.random(),
      vnx: (Math.random() - 0.5) * 0.0008,
      vny: (Math.random() - 0.5) * 0.0008,
      r: 1.2 + Math.random() * 1.8,
    }));

    let raf: number;
    const tick = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.nx += n.vnx;
        n.ny += n.vny;
        if (n.nx < 0 || n.nx > 1) n.vnx *= -1;
        if (n.ny < 0 || n.ny > 1) n.vny *= -1;
      }

      const pts = nodes.map((n) => ({ x: n.nx * w, y: n.ny * h, r: n.r }));

      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < CONNECT_DIST) {
            const alpha = 0.35 * (1 - d / CONNECT_DIST);
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden
    />
  );
}

/** 浮动几何装饰 */
function FloatingShapes() {
  return (
    <>
      <div className="absolute top-[15%] left-[10%] h-40 w-40 rounded-full border border-primary-foreground/10" style={{ animation: "login-float-1 8s ease-in-out infinite" }} />
      <div className="absolute top-[60%] right-[15%] h-6 w-6 rounded-full bg-primary-foreground/15" style={{ animation: "login-float-2 6s ease-in-out infinite 0.5s" }} />
      <div className="absolute bottom-[20%] left-[20%] h-20 w-20 rounded-xl border border-primary-foreground/8 rotate-12" style={{ animation: "login-float-3 10s ease-in-out infinite 1s" }} />
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary-foreground/8 blur-3xl" style={{ animation: "login-glow 7s ease-in-out infinite" }} />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-accent/15 blur-3xl" style={{ animation: "login-glow 9s ease-in-out infinite 2s" }} />
    </>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = checkPasswordStrength(password);

  // 注册时密码要求至少6位
  const isPasswordValid = !isRegister || password.length >= 6;
  const isConfirmMatch = !isRegister || password === confirmPassword;
  const canSubmit = isRegister
    ? username.trim() && isPasswordValid && isConfirmMatch
    : username.trim() && password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      if (password.length < 6) {
        setError("密码长度至少为6位");
        return;
      }
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        await signUp(username.trim(), password);
        toast.success("注册成功", { description: "正在自动登录..." });
        await signIn(username.trim(), password);
        window.location.replace("/");
      } else {
        await signIn(username.trim(), password);
        window.location.replace("/");

        // 检查并显示离线消息
        const pendingNotifications = getPendingNotifications().filter(n => !n.read);
        if (pendingNotifications.length > 0) {
          setTimeout(() => {
            pendingNotifications.forEach((notification, index) => {
              setTimeout(() => {
                toast.success(notification.title, {
                  description: notification.description,
                  duration: 5000,
                });
              }, index * 300);
            });
            markAllAsRead();
          }, 500);
        }

        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "操作失败";
      if (message.includes("Invalid login credentials")) {
        setError("用户名或密码错误");
      } else if (message.includes("Email not confirmed")) {
        setError("账号未激活，请联系管理员");
      } else if (message.includes("already registered")) {
        setError("该用户名已被注册");
      } else if (message.includes("weak_password") || message.includes("Password should be")) {
        setError("密码强度不够，请至少6位");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u: string) => {
    setUsername(u);
    setPassword("123456");
    setConfirmPassword("");
    setError("");
    setIsRegister(false);
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <style>{`
        @keyframes login-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50%      { transform: translate(20px, -30px) scale(1.08); opacity: 1; }
        }
        @keyframes login-float-2 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          50%      { transform: translate(-15px, 20px); opacity: 0.9; }
        }
        @keyframes login-float-3 {
          0%, 100% { transform: rotate(12deg) translate(0, 0); opacity: 0.5; }
          50%      { transform: rotate(20deg) translate(10px, -15px); opacity: 0.8; }
        }
        @keyframes login-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes login-text-reveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Left Decorative Panel */}
      <div className="relative hidden w-[45%] overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent opacity-95" />
        <ParticleCanvas />
        <FloatingShapes />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3 text-primary-foreground" style={{ animation: "login-text-reveal 0.6s ease-out both" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <LayoutDashboard size={22} />
            </div>
            <span className="text-lg font-semibold tracking-tight">项目看板</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-primary-foreground" style={{ animation: "login-text-reveal 0.6s ease-out 0.15s both" }}>
              高效管理<br />每一个项目
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-primary-foreground/70" style={{ animation: "login-text-reveal 0.6s ease-out 0.3s both" }}>
              集成项目管道、任务看板、日程管理与智能助手，让团队协作更流畅。
            </p>
          </div>
          <p className="text-xs text-primary-foreground/40" style={{ animation: "login-text-reveal 0.6s ease-out 0.45s both" }}>
            © 2026 凯格咨询 · 内部工作台
          </p>
        </div>
      </div>

      {/* Right Login/Register Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard size={20} />
            </div>
            <span className="text-lg font-semibold text-foreground">项目看板</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isRegister ? "创建账号" : "欢迎回来"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRegister ? "注册新员工账号以访问工作台" : "登录您的员工账号以访问工作台"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">用户名</label>
              <div className="group relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">密码</label>
              <div className="group relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "至少6位密码" : "请输入密码"}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* 密码强度指示器（仅注册模式） */}
              {isRegister && password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= passwordStrength.score ? passwordStrength.color : "bg-muted")} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">密码强度：{passwordStrength.label}</p>
                </div>
              )}
            </div>

            {/* 确认密码（仅注册模式） */}
            {isRegister && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">确认密码</label>
                <div className="group relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className={cn(
                      "h-12 w-full rounded-xl border bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-200",
                      confirmPassword && !isConfirmMatch
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : confirmPassword && isConfirmMatch
                          ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                          : "border-input focus:border-primary focus:ring-primary/20"
                    )}
                    required
                    autoComplete="new-password"
                  />
                  {confirmPassword && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {isConfirmMatch ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />}
                    </div>
                  )}
                </div>
                {confirmPassword && !isConfirmMatch && (
                  <p className="text-[10px] text-red-500">两次输入的密码不一致</p>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  {isRegister ? "注册" : "登录"}
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* 切换注册/登录 */}
          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isRegister ? "已有账号？返回登录" : "没有账号？立即注册"}
            </button>
          </div>

          {/* Demo Accounts（仅登录模式显示） */}
          {!isRegister && (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">快速体验</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => fillDemo(acc.username)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-left text-sm transition-all duration-200 hover:border-primary/30 hover:bg-muted/50"
                  >
                    <span className="font-medium text-foreground">{acc.label}</span>
                    <span className="text-xs text-muted-foreground">{acc.username}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
