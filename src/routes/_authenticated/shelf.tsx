import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shelf")({ component: ShelfPage });

function ShelfPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stories, setStories] = useState<Record<string, { title: string | null }>>({});
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  useEffect(() => {
    if (!user) return;
    supabase.from("stories").select("day, title").eq("user_id", user.id)
      .then(({ data }) => {
        const map: Record<string, { title: string | null }> = {};
        (data ?? []).forEach((s: any) => { map[s.day] = { title: s.title }; });
        setStories(map);
      });
  }, [user]);

  const { year, month, days, leadingBlanks, monthLabel } = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    return {
      year: y, month: m,
      days: Array.from({ length: last.getDate() }, (_, i) => i + 1),
      leadingBlanks: first.getDay(),
      monthLabel: `${y}年${m + 1}月`,
    };
  }, [cursor]);

  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const todayIso = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="text-center mb-6">
        <h1 className="font-display text-4xl text-primary">历史书架</h1>
        <p className="text-sm text-muted-foreground mt-1">每一本书，都是某一天的你</p>
      </div>

      <div className="bg-card rounded-3xl p-5 shadow-soft border">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor(c => new Date(c.getFullYear(), c.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="font-display text-2xl">{monthLabel}</div>
          <button onClick={() => setCursor(c => new Date(c.getFullYear(), c.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-muted">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground mb-2">
          {["日", "一", "二", "三", "四", "五", "六"].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
          {days.map(d => {
            const iso = fmt(d);
            const hasStory = !!stories[iso];
            const isToday = iso === todayIso;
            return (
              <button
                key={d}
                onClick={() => nav({ to: "/story/$date", params: { date: iso } })}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition relative
                  ${hasStory ? "bg-accent/60 hover:bg-accent shadow-soft" : "hover:bg-muted text-muted-foreground"}
                  ${isToday ? "ring-2 ring-primary" : ""}`}
                title={stories[iso]?.title ?? ""}
              >
                <span className={hasStory ? "font-semibold" : ""}>{d}</span>
                {hasStory && <span className="text-[10px] mt-0.5">📖</span>}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">点击带 📖 的日期，翻开那天的故事</p>
    </div>
  );
}
