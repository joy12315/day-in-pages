import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import leaf1 from "@/assets/leaf-1.png";
import leaf2 from "@/assets/leaf-2.png";
import mascot from "@/assets/envelope-mascot.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "登录 · 时光胶囊" },
      { name: "description", content: "登录时光胶囊，开始记录今天的小事。" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://daystory.lovable.app/login" }],
  }),
});

function LoginPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/today" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/today` },
        });
        if (error) throw error;
        toast.success("注册成功，欢迎～");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav({ to: "/today" });
    } catch (err: any) {
      toast.error(err.message ?? "出错啦");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <img src={leaf1} alt="" aria-hidden className="pointer-events-none absolute -top-12 -left-10 w-48 opacity-80 float-y" style={{ ["--r" as never]: "-20deg" }} />
      <img src={leaf2} alt="" aria-hidden className="pointer-events-none absolute bottom-0 -right-10 w-52 opacity-80 drift" style={{ ["--r" as never]: "30deg" }} />
      <span className="absolute top-[20%] right-[18%] text-2xl text-[var(--sun)] twinkle" aria-hidden>✦</span>
      <span className="absolute bottom-[18%] left-[12%] text-xl text-[var(--sun)] twinkle" aria-hidden style={{ animationDelay: "1.2s" }}>✦</span>

      <div className="relative z-10 w-full max-w-sm leaf-card grain rounded-[28px] p-8 shadow-pop">
        <div className="text-center mb-6">
          <img src={mascot} alt="" aria-hidden className="w-20 h-20 mx-auto" />
          <h1 className="font-display text-4xl text-[var(--leaf-deep)] mt-2">时光胶囊</h1>
          <p className="font-hand text-xl text-primary mt-1">{mode === "signin" ? "欢迎回来 ☘️" : "开启你的胶囊之旅 ✨"}</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full rounded-2xl bg-card border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <input
            type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="密码（至少6位）"
            className="w-full rounded-2xl bg-card border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <button disabled={busy} className="w-full rounded-2xl bg-primary py-3 text-primary-foreground font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-pop disabled:opacity-50 transition-all">
            {busy ? "稍等…" : mode === "signin" ? "登录" : "注册"}
          </button>
        </form>
        <button
          onClick={() => setMode(m => m === "signin" ? "signup" : "signin")}
          className="w-full mt-4 text-sm text-muted-foreground hover:text-primary transition"
        >
          {mode === "signin" ? "还没有账号？注册一个" : "已有账号？去登录"}
        </button>
      </div>
    </div>
  );
}
