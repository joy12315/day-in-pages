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
      <div className="text-center mb-6">
        <h1 className="font-display text-4xl text-primary">{formatDayCN(day)}</h1>
        <p className="text-sm text-muted-foreground">今日已投递 {entries.length} 颗胶囊</p>
      </div>

      <EntryComposer onPosted={() => setRefresh(k => k + 1)} />

      {!loading && <Timeline entries={entries} />}

      {entries.length > 0 && (
        <Link
          to="/story/$date" params={{ date: day }}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-20 bg-accent text-foreground px-5 py-3 rounded-full shadow-book flex items-center gap-2 hover:scale-105 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold">生成今日故事</span>
        </Link>
      )}
    </div>
  );
}
