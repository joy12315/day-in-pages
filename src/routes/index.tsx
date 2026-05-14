import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import leaf1 from "@/assets/leaf-1.png";
import leaf2 from "@/assets/leaf-2.png";
import mascot from "@/assets/envelope-mascot.png";
import { Sparkles, BookHeart, Stars } from "lucide-react";

const SITE_URL = "https://daystory.lovable.app";
const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f774878-96fb-4595-9d09-6089c6e0f89b/id-preview-d2a536fc--564f2cc9-0f35-4945-bec2-7bc58c8d9fca.lovable.app-1778428893994.png";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "时光胶囊 · 每日记录，AI 自动编织成你的故事书" },
      { name: "description", content: "把今天的小事悄悄装进胶囊：文字、照片随手投递，睡前 AI 自动编成一本只属于你的温暖故事书。免费、私密、3 秒上手。" },
      { property: "og:title", content: "时光胶囊 · 每日记录，AI 自动编织成你的故事书" },
      { property: "og:description", content: "把今天的小事悄悄装进胶囊：文字、照片随手投递，睡前 AI 自动编成一本只属于你的温暖故事书。" },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:title", content: "时光胶囊 · 每日记录，AI 自动编织成你的故事书" },
      { name: "twitter:description", content: "每日投递文字与照片，AI 把今天编成一本只属于你的故事书。" },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
  }),
});

function Star({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <span
      className={`absolute text-[var(--sun)] twinkle ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      ✦
    </span>
  );
}

function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/today" />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative floating leaves */}
      <img
        src={leaf1}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -top-10 -left-10 w-44 md:w-64 opacity-90 float-y"
        style={{ ["--r" as never]: "-18deg" }}
      />
      <img
        src={leaf2}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute top-24 -right-8 w-36 md:w-52 opacity-90 drift"
        style={{ ["--r" as never]: "22deg" }}
      />
      <img
        src={leaf1}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute bottom-0 -right-16 w-52 md:w-72 opacity-80 float-y"
        style={{ ["--r" as never]: "140deg", animationDelay: "1.4s" }}
      />
      <img
        src={leaf2}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -bottom-10 left-2 w-40 md:w-56 opacity-80 drift"
        style={{ ["--r" as never]: "-30deg", animationDelay: "2.1s" }}
      />

      {/* Sparkles */}
      <Star className="top-[14%] left-[18%] text-2xl" delay={0} />
      <Star className="top-[22%] right-[28%] text-xl" delay={0.6} />
      <Star className="top-[60%] left-[12%] text-lg" delay={1.2} />
      <Star className="top-[70%] right-[14%] text-2xl" delay={1.8} />
      <Star className="top-[40%] right-[8%] text-base" delay={0.9} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <img
            src={mascot}
            alt="时光胶囊吉祥物：一只圆润微笑的信封"
            width={768}
            height={768}
            className="w-40 md:w-52 h-auto drop-shadow-[0_18px_22px_oklch(0.4_0.1_152/0.25)]"
          />
          <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-[var(--sun)] twinkle" aria-hidden />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="font-display mt-6 text-6xl md:text-7xl text-[var(--leaf-deep)] tracking-tight"
        >
          时光胶囊
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.6 }}
          className="font-hand mt-3 text-3xl text-primary"
        >
          把今天，写成一本小书 ✨
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-5 max-w-md text-base md:text-lg leading-relaxed text-muted-foreground"
        >
          把今天的小事，悄悄装进胶囊。
          <br />
          睡前，AI 会把它编成一本只属于你的故事书。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-10"
        >
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-9 py-4 text-primary-foreground font-semibold text-lg shadow-pop hover:shadow-book hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span>开始记录</span>
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full"
        >
          {[
            { icon: <Sparkles className="w-6 h-6" />, title: "每日投递", desc: "文字、照片，3 秒装入胶囊", tone: "bg-[color-mix(in_oklab,var(--accent)_40%,var(--card))]" },
            { icon: <BookHeart className="w-6 h-6" />, title: "AI 编织", desc: "睡前自动写成温暖小故事", tone: "bg-[color-mix(in_oklab,var(--secondary)_55%,var(--card))]" },
            { icon: <Stars className="w-6 h-6" />, title: "翻阅书架", desc: "每天一本，慢慢长成全集", tone: "bg-[color-mix(in_oklab,var(--coral)_18%,var(--card))]" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -4, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }}
              className={`leaf-card grain rounded-3xl p-6 text-left shadow-soft ${f.tone}`}
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-card text-primary shadow-soft">
                {f.icon}
              </div>
              <div className="mt-4 font-display text-xl text-[var(--leaf-deep)]">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-12 text-xs text-muted-foreground/80">
          私密 · 免费 · 不打扰
        </p>
      </div>
    </div>
  );
}
