import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, CalendarDays, Home, LogOut, Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({ component: AuthLayout });

function AuthLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中…</div>;
  }

  const links = [
    { to: "/today", label: "今日", icon: Home },
    { to: "/shelf", label: "书架", icon: CalendarDays },
    { to: "/settings", label: "设置", icon: Settings },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      {/* Desktop top nav */}
      <header className="hidden md:flex fixed top-0 inset-x-0 z-30 h-16 items-center justify-between px-8 bg-background/80 backdrop-blur border-b">
        <Link to="/today" className="flex items-center gap-2">
          <span className="text-2xl">📮</span>
          <span className="font-display text-2xl text-primary">时光胶囊</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(l => {
            const active = loc.pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <l.icon className="w-4 h-4" />{l.label}
              </Link>
            );
          })}
          <button
            onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}
            className="ml-2 p-2 rounded-full hover:bg-muted text-muted-foreground"
            title="退出"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </nav>
      </header>

      <main>{<Outlet />}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-background/90 backdrop-blur border-t flex items-center justify-around">
        {links.map(l => {
          const active = loc.pathname.startsWith(l.to);
          return (
            <Link key={l.to} to={l.to}
              className={`flex flex-col items-center gap-0.5 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
              <l.icon className="w-5 h-5" />{l.label}
            </Link>
          );
        })}
        <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}
          className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground">
          <LogOut className="w-5 h-5" />退出
        </button>
      </nav>
    </div>
  );
}
