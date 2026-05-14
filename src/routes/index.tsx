import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

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

function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/today" />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl mb-4">📮</div>
      <h1 className="font-display text-6xl md:text-7xl text-primary">时光胶囊</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        把今天的小事，悄悄装进胶囊。<br />
        睡前，AI 会把它编成一本只属于你的故事书。
      </p>
      <div className="mt-10 flex gap-3">
        <Link to="/login" className="rounded-full bg-primary px-8 py-3 text-primary-foreground shadow-soft hover:opacity-90 transition">
          开始记录
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg text-sm text-muted-foreground">
        <div><div className="text-3xl mb-1">✏️</div>每日投递</div>
        <div><div className="text-3xl mb-1">📖</div>翻页故事</div>
        <div><div className="text-3xl mb-1">📅</div>历史书架</div>
      </div>
    </div>
  );
}
