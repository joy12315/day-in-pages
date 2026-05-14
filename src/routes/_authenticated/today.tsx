import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { EntryComposer } from "@/components/EntryComposer";
import { Timeline, useDayEntries } from "@/components/Timeline";
import { todayLocal, formatDayCN } from "@/lib/date";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/today")({ component: TodayPage });

function TodayPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const day = todayLocal();
  const { entries, loading } = useDayEntries(user?.id, day, refresh);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
      <div className="text-center mb-7">
        <h1 className="font-display text-5xl text-[var(--leaf-deep)] tracking-tight">{formatDayCN(day)}</h1>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color-mix(in_oklab,var(--accent)_45%,var(--card))] text-xs text-foreground/80 shadow-soft">
          <span className="text-[var(--sun)]">✦</span>
          今日已投递 <span className="font-semibold text-primary">{entries.length}</span> 颗胶囊
        </div>
      </div>

      <EntryComposer onPosted={() => setRefresh(k => k + 1)} />

      {!loading && <Timeline entries={entries} />}

      {entries.length > 0 && (
        <Link
          to="/story/$date" params={{ date: day }}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-20 bg-[var(--leaf-deep)] text-primary-foreground px-5 py-3 rounded-full shadow-book flex items-center gap-2 hover:scale-105 active:scale-100 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold">生成今日故事</span>
        </Link>
      )}
    </div>
  );
}
