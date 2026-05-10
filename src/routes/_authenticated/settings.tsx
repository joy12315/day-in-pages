import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoTime, setAutoTime] = useState("22:00");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name ?? "");
        setSoundEnabled(data.sound_enabled);
        setAutoTime(data.auto_generate_at?.slice(0, 5) ?? "22:00");
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName,
      sound_enabled: soundEnabled,
      auto_generate_at: autoTime + ":00",
    }).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("已保存 ✨");
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <h1 className="font-display text-4xl text-primary text-center mb-6">设置</h1>
      <div className="bg-card rounded-3xl p-6 shadow-soft border space-y-5">
        <div>
          <label className="text-sm text-muted-foreground">昵称</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-2xl bg-muted px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">翻页音效</div>
            <div className="text-xs text-muted-foreground">读故事时播放纸张声</div>
          </div>
          <button onClick={() => setSoundEnabled(s => !s)}
            className={`w-12 h-7 rounded-full transition relative ${soundEnabled ? "bg-primary" : "bg-muted"}`}>
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition ${soundEnabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">每日自动生成故事时间</label>
          <input type="time" value={autoTime} onChange={e => setAutoTime(e.target.value)}
            className="mt-1 w-full rounded-2xl bg-muted px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring" />
          <p className="text-xs text-muted-foreground mt-1">到时若有当日记录，会自动生成今日故事</p>
        </div>
        <button onClick={save} disabled={busy}
          className="w-full rounded-2xl bg-primary py-3 text-primary-foreground font-semibold disabled:opacity-50">
          {busy ? "保存中…" : "保存"}
        </button>
      </div>
    </div>
  );
}
