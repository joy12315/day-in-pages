import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useDayEntries, type EntryWithPhotos } from "@/components/Timeline";
import { generateDailyStory } from "@/lib/story.functions";
import { formatDayCN, formatTime } from "@/lib/date";
import { ChevronLeft, ChevronRight, ArrowLeft, Volume2, VolumeX, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/story/$date")({ component: StoryPage });

type Story = { title: string | null; summary: string | null } | null;

function StoryPage() {
  const { date } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const generate = useServerFn(generateDailyStory);

  const [refresh, setRefresh] = useState(0);
  const { entries, loading } = useDayEntries(user?.id, date, refresh);
  const [story, setStory] = useState<Story>(null);
  const [storyLoaded, setStoryLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [muted, setMuted] = useState(false);
  const flipAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("stories").select("title, summary").eq("user_id", user.id).eq("day", date).maybeSingle()
      .then(({ data }) => { setStory(data); setStoryLoaded(true); });
  }, [user, date, refresh]);

  // Build pages: cover + each entry + summary
  const pages = useMemo(() => {
    const p: Array<{ kind: "cover" | "entry" | "summary"; entry?: EntryWithPhotos }> = [];
    p.push({ kind: "cover" });
    entries.forEach(e => p.push({ kind: "entry", entry: e }));
    if (story?.summary) p.push({ kind: "summary" });
    return p;
  }, [entries, story]);

  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);

  const playFlip = () => {
    if (muted) return;
    if (!flipAudio.current) {
      flipAudio.current = new Audio("data:audio/wav;base64,UklGRl4EAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YToEAAD//wAA//8BAP//AQABAP7//v8AAP//AQACAAAA//8AAAAAAQAAAAAA//8BAP//AAACAP3/AwD9/wMA/v8BAAAA//8BAAAA//8AAAAAAQABAP7/AgD9/wIA/v8BAAAA//8AAP//AAABAP//AAAAAAAA//8BAP//AAAAAAAAAQD//wAAAQD//wAAAQD//wEA///+/wEA/v8BAP7/AgD//wAAAAD//wEA//8AAAEA//8AAP//AAABAAAA");
    }
    flipAudio.current.currentTime = 0;
    flipAudio.current.volume = 0.4;
    flipAudio.current.play().catch(() => {});
  };

  const goto = (next: number) => {
    if (next < 0 || next >= pages.length) return;
    setDir(next > page ? 1 : -1);
    setPage(next);
    playFlip();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goto(page - 1);
      if (e.key === "ArrowRight") goto(page + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const bind = useDrag(({ swipe: [sx] }) => {
    if (sx === -1) goto(page + 1);
    if (sx === 1) goto(page - 1);
  });

  const onGenerate = async () => {
    setGenerating(true);
    try {
      await generate({ data: { date } as any }).catch(async () => {
        // input expects 'day'
        return generate({ data: { day: date } as any });
      });
      setRefresh(k => k + 1);
      toast.success("故事已编织好啦 ✨");
    } catch (e: any) {
      toast.error(e.message ?? "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !storyLoaded) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">翻开你的胶囊…</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📭</div>
        <p className="font-display text-2xl mb-2">这一天还没有记录</p>
        <Link to="/today" className="inline-block mt-4 rounded-full bg-primary px-6 py-2 text-primary-foreground">回到今日</Link>
      </div>
    );
  }

  // If no story yet, prompt generate
  if (!story?.summary) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="font-display text-3xl mb-2">还没有今日故事</h2>
        <p className="text-muted-foreground mb-6">让 AI 把你今天的 {entries.length} 颗胶囊编织成一本睡前故事书。</p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 shadow-soft hover:scale-105 transition disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? "正在为你编织今日故事…" : "生成今日故事"}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:py-8">
      {/* Toolbar */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-4">
        <button onClick={() => nav({ to: "/today" })} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />返回
        </button>
        <div className="text-sm text-muted-foreground">{page + 1} / {pages.length}</div>
        <div className="flex gap-1">
          <button onClick={() => setMuted(m => !m)} className="p-2 rounded-full hover:bg-muted">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-muted" title="打印/导出 PDF">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Book */}
      <div className="max-w-3xl mx-auto" {...bind()} style={{ touchAction: "pan-y" }}>
        <div className="relative aspect-[3/4] md:aspect-[4/3] mx-auto" style={{ perspective: 2000 }}>
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={page}
              custom={dir}
              initial={{ rotateY: dir > 0 ? 90 : -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: dir > 0 ? -90 : 90, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformStyle: "preserve-3d" }}
              className="absolute inset-0"
            >
              <PageContent p={pages[page]} story={story} date={date} pageNo={page} total={pages.length} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-4 max-w-3xl mx-auto">
          <button onClick={() => goto(page - 1)} disabled={page === 0}
            className="p-3 rounded-full bg-card shadow-soft disabled:opacity-30 hover:scale-110 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={onGenerate} disabled={generating} className="text-xs text-muted-foreground hover:text-primary">
            {generating ? "重新编织中…" : "重新生成 ✨"}
          </button>
          <button onClick={() => goto(page + 1)} disabled={page === pages.length - 1}
            className="p-3 rounded-full bg-card shadow-soft disabled:opacity-30 hover:scale-110 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PageContent({ p, story, date, pageNo, total }: {
  p: { kind: "cover" | "entry" | "summary"; entry?: EntryWithPhotos };
  story: Story; date: string; pageNo: number; total: number;
}) {
  return (
    <div className="paper w-full h-full rounded-2xl shadow-book p-8 md:p-12 flex flex-col overflow-hidden border border-paper-edge">
      {p.kind === "cover" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="font-display text-5xl md:text-6xl text-primary leading-tight">{story?.title ?? "今日小书"}</h1>
          <p className="mt-4 text-muted-foreground">{formatDayCN(date)}</p>
          <p className="mt-8 text-xs text-muted-foreground italic">— 你的时光胶囊 —</p>
        </div>
      )}
      {p.kind === "entry" && p.entry && (
        <div className="flex-1 overflow-auto">
          <div className="text-xs text-muted-foreground font-mono mb-3">{formatTime(p.entry.created_at)}</div>
          {p.entry.content && (
            <p className="font-display text-2xl md:text-3xl leading-snug mb-4 whitespace-pre-wrap">{p.entry.content}</p>
          )}
          {p.entry.photos.length > 0 && (
            <div className={`grid gap-2 ${p.entry.photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {p.entry.photos.map((ph, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-muted aspect-square shadow-soft">
                  {ph.signedUrl && <img src={ph.signedUrl} className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {p.kind === "summary" && (
        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="text-3xl mb-3">🌙</div>
          <h2 className="font-display text-3xl text-primary mb-4">今日小结</h2>
          <p className="text-base md:text-lg leading-loose whitespace-pre-wrap max-w-prose mx-auto" style={{ fontFamily: "'Long Cang', 'Caveat', cursive" }}>
            {story?.summary}
          </p>
          <p className="mt-8 text-xs text-muted-foreground">晚安 ☾</p>
        </div>
      )}
      <div className="text-[10px] text-muted-foreground/60 text-center mt-2">— {pageNo + 1} / {total} —</div>
    </div>
  );
}
