import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { todayLocal } from "@/lib/date";
import { ImagePlus, Send, X } from "lucide-react";
import { toast } from "sonner";

export function EntryComposer({ onPosted }: { onPosted: () => void }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [flying, setFlying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).slice(0, 9 - files.length);
    setFiles(f => [...f, ...arr]);
  };

  const submit = async () => {
    if (!user) return;
    if (!text.trim() && files.length === 0) {
      toast.error("写点什么或加张照片吧～");
      return;
    }
    setBusy(true);
    try {
      const day = todayLocal();
      const { data: entry, error } = await supabase
        .from("entries")
        .insert({ user_id: user.id, content: text.trim(), day })
        .select()
        .single();
      if (error) throw error;

      // upload photos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${entry.id}/${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("capsule-photos")
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        await supabase.from("entry_photos").insert({
          entry_id: entry.id,
          user_id: user.id,
          storage_path: path,
          sort_order: i,
        });
      }
      setFlying(true);
      setTimeout(() => setFlying(false), 700);
      setText("");
      setFiles([]);
      toast.success("胶囊已投递 ✨");
      onPosted();
    } catch (e: any) {
      toast.error(e.message ?? "投递失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <motion.div
        layout
        className="leaf-card grain bg-card rounded-[28px] p-5 shadow-soft"
        animate={flying ? { scale: 0.3, x: 100, y: 200, opacity: 0 } : { scale: 1, x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeIn" }}
        onAnimationComplete={() => { if (flying) setFlying(false); }}
      >
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="今天发生了什么有趣的事？"
          rows={3}
          className="w-full bg-transparent outline-none resize-none text-lg leading-relaxed placeholder:text-muted-foreground"
        />
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {files.map((f, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                <button onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition px-3 py-2 rounded-full hover:bg-muted"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-sm">添加照片</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => addFiles(e.target.files)} />
          <button
            onClick={submit}
            disabled={busy}
            className="group flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full shadow-soft hover:shadow-pop hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all font-semibold"
          >
            <Send className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>{busy ? "投递中…" : "投递"}</span>
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {flying && (
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 0.2, x: 100, y: 250, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center text-5xl"
          >
            📮
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
