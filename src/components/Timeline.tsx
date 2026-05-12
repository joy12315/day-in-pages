import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/date";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type EntryWithPhotos = {
  id: string;
  content: string;
  created_at: string;
  photos: { storage_path: string; signedUrl?: string }[];
};

export function useDayEntries(userId: string | undefined, day: string, refreshKey: number) {
  const [entries, setEntries] = useState<EntryWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancel = false;
    setLoading(true);
    (async () => {
      const { data: es } = await supabase
        .from("entries")
        .select("id, content, created_at, entry_photos(storage_path, sort_order)")
        .eq("user_id", userId)
        .eq("day", day)
        .order("created_at", { ascending: true });

      const list: EntryWithPhotos[] = [];
      for (const e of es ?? []) {
        const photos = ((e as any).entry_photos ?? [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order);
        const withUrls = await Promise.all(photos.map(async (p: any) => {
          const { data } = await supabase.storage.from("capsule-photos")
            .createSignedUrl(p.storage_path, 3600);
          return { storage_path: p.storage_path, signedUrl: data?.signedUrl };
        }));
        list.push({ id: e.id, content: e.content, created_at: e.created_at, photos: withUrls });
      }
      if (!cancel) { setEntries(list); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [userId, day, refreshKey]);

  return { entries, loading };
}

function AiImageButton({ prompt }: { prompt: string }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [optimized, setOptimized] = useState<string | null>(null);

  const onClick = async () => {
    if (!prompt.trim()) {
      toast.error("这条日记没有文字，无法配图");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-diary-image", {
        body: { diaryText: prompt },
      });
      if (error || !data?.imageUrl) {
        toast.error(data?.error ?? error?.message ?? "生成失败");
      } else {
        setUrl(data.imageUrl);
        setOptimized(data.optimizedPrompt ?? null);
        toast.success("配图完成 ✨");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "生成失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-accent text-foreground hover:opacity-90 disabled:opacity-50 transition shadow-soft"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {busy ? "正在配图…" : "✨ AI 配图"}
      </button>
      {url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 rounded-xl overflow-hidden bg-muted"
        >
          <img src={url} alt="AI 生成的配图" className="w-full h-auto" />
          {optimized && (
            <div className="px-3 py-2 text-[11px] text-muted-foreground border-t bg-card">
              <span className="opacity-70">prompt：</span>{optimized}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export function Timeline({ entries }: { entries: EntryWithPhotos[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-6xl mb-4">🌱</div>
        <p className="font-display text-2xl">今天还是一张空白纸</p>
        <p className="text-sm mt-1">快投递第一颗胶囊吧～</p>
      </div>
    );
  }
  return (
    <div className="relative pl-6 mt-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
      <div className="space-y-5">
        {entries.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative"
          >
            <div className="absolute -left-[19px] top-3 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
            <div className="bg-card rounded-2xl p-4 shadow-soft border">
              <div className="text-xs text-muted-foreground font-mono mb-1">{formatTime(e.created_at)}</div>
              {e.content && <p className="whitespace-pre-wrap leading-relaxed">{e.content}</p>}
              {e.photos.length > 0 && (
                <div className={`grid gap-2 mt-3 ${e.photos.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
                  {e.photos.map((p, j) => (
                    <div key={j} className="aspect-square rounded-xl overflow-hidden bg-muted">
                      {p.signedUrl && <img src={p.signedUrl} className="w-full h-full object-cover" />}
                    </div>
                  ))}
                </div>
              )}
              {e.content && <AiImageButton prompt={e.content} />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
