import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-primary">404</h1>
        <p className="mt-4 text-muted-foreground">这一页还没有被记录…</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-2 text-primary-foreground">回到首页</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">出了点小状况</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-primary px-6 py-2 text-primary-foreground"
        >
          再试一次
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "时光胶囊 · 把今天写成一本书" },
      { name: "description", content: "每日投递文字与照片，AI 把今天编织成一本温暖的睡前故事书。" },
      { property: "og:title", content: "时光胶囊 · 把今天写成一本书" },
      { property: "og:description", content: "每日投递文字与照片，AI 把今天编织成一本温暖的睡前故事书。" },
      { name: "twitter:title", content: "时光胶囊 · 把今天写成一本书" },
      { name: "twitter:description", content: "每日投递文字与照片，AI 把今天编织成一本温暖的睡前故事书。" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f774878-96fb-4595-9d09-6089c6e0f89b/id-preview-d2a536fc--564f2cc9-0f35-4945-bec2-7bc58c8d9fca.lovable.app-1778428893994.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f774878-96fb-4595-9d09-6089c6e0f89b/id-preview-d2a536fc--564f2cc9-0f35-4945-bec2-7bc58c8d9fca.lovable.app-1778428893994.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "时光胶囊" },
      { property: "og:locale", content: "zh_CN" },
      { name: "theme-color", content: "#f5f0e1" },
      { name: "application-name", content: "时光胶囊" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Quicksand:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Long+Cang&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "时光胶囊",
          alternateName: "DayStory",
          url: "https://daystory.lovable.app",
          description: "每日投递文字与照片，AI 把今天编织成一本温暖的睡前故事书。私密的个人日记应用，自动生成专属于你的回忆故事书。",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          inLanguage: "zh-CN",
          offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
