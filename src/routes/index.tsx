import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Landing,
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
