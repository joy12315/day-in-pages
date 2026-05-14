## SEO 优化方案

当前公开页面只有 `/`（落地页）和 `/login`，其余路由都在登录后。优化重点是这两个页面 + 站点级基础设施。

### 1. 完善根路由元数据（`src/routes/__root.tsx`）
- 保留现有 title/description 作为站点默认值
- 新增：`og:site_name`、`og:locale=zh_CN`、`twitter:card=summary_large_image`、`theme-color`
- 新增 JSON-LD：`WebApplication` schema（含名称、描述、应用类别、运行环境、价格 0）
- 添加 `<html lang="zh-CN">`（已存在，确认）
- 移除根级 canonical（避免与子路由重复）

### 2. 落地页独立 head（`src/routes/index.tsx`）
- 独立 title：`时光胶囊 · 把今天写成一本温暖的故事书`
- 独立 description：突出"每日记录 + AI 生成故事书"卖点（<160 字符）
- og:title / og:description / og:url / og:type=website
- canonical 指向 `https://daystory.lovable.app/`
- 单 H1（当前 `<h1>时光胶囊</h1>` 已是单 H1，保留）

### 3. 登录页独立 head（`src/routes/login.tsx`）
- title：`登录 · 时光胶囊`
- description：简短登录说明
- canonical 指向 `/login`
- 添加 `noindex`（登录页通常不应被索引）

### 4. 新建 `public/robots.txt`
```
User-agent: *
Allow: /
Disallow: /today
Disallow: /shelf
Disallow: /settings
Disallow: /story/

Sitemap: https://daystory.lovable.app/sitemap.xml
```

### 5. 新建 `src/routes/sitemap[.]xml.ts`
- 仅包含公开可索引 URL：`/`
- 标准 XML sitemap 格式，BASE_URL = `https://daystory.lovable.app`

### 6. AI 助手友好性
- JSON-LD 结构化数据让 ChatGPT/Perplexity/Google AI 能正确理解产品
- description 使用清晰自然语言描述功能（"AI 把每日记录编织成睡前故事书"）
- 保持语义化 HTML（已有 h1/p 结构良好）

### 7. 社交分享
- 现有 og:image 已配置（落地页预览图），保留
- 新增 twitter:card=summary_large_image（已有，确认）
- 补全 og:url（动态指向当前页）

### 不在范围
- 不动后端、Edge Function、业务逻辑
- 不改 UI 视觉
- 不为登录后页面加 SEO（这些页面 noindex 即可）

### 技术细节
- 所有 head() 使用 TanStack Start 的 `meta` / `links` / `scripts` 数组写法
- canonical 只在叶子路由设置（避免根路由的 links 数组与子路由重复拼接）
- sitemap 路由文件名使用 `sitemap[.]xml.ts` 转义点号
