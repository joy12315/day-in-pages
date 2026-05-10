# 个人时光胶囊 · 实施方案

一个温暖治愈的"每日记录 + 睡前故事书"网页应用。白天投递碎片（文字+照片），晚上 AI 把当日内容编织成一本可翻阅的电子绘本，长期沉淀为一座"日历书架"。

## 总体架构

- **前端**：React + TanStack Router + Tailwind v4 + Framer Motion
- **后端**：Lovable Cloud（Postgres + Storage + Auth）
- **AI**：Lovable AI Gateway（`google/gemini-3-flash-preview` 生成温暖小结）
- **导出**：浏览器端 `jspdf` + `html2canvas` 生成 PDF
- **音效**：本地 mp3（翻页 / 投递）通过 `<audio>` 播放，可静音

## 路由结构

```
/                  欢迎页 + 引导登录
/login             邮箱密码 + Google 登录
/_authenticated/
  today            今日投递 + 时间线（默认主页）
  shelf            历史书架（日历视图）
  story/$date      某日故事书（翻页阅读）
  settings         偏好设置（音效、自动生成时间）
```

## 数据模型（Lovable Cloud）

```
profiles(id, display_name, auto_generate_at time, sound_enabled bool)
entries(id, user_id, created_at, content text, day date)
entry_photos(id, entry_id, storage_path, sort_order)
stories(id, user_id, day date unique, summary text, generated_at, status)
```

- Storage bucket：`capsule-photos`（私有，RLS 限定 owner）
- 所有表启用 RLS，按 `auth.uid() = user_id` 过滤
- `day` 字段按用户本地时区计算，避免跨时区混乱

## 核心页面与交互

### 1. 今日页 `/today`
- 顶部固定导航：Logo · 今日 · 书架 · 设置
- **投递卡片**（吸顶）：自适应高度 textarea + 多图上传（拖拽 / 点击）+ 圆形"投递"按钮
- 投递成功 → Framer Motion 让卡片"嗖"地缩成小胶囊飞入下方时间线
- **今日时间线**：竖向时间轴，每条卡片显示时间戳 · 文字 · 缩略图网格
- 空状态：手绘风插画 + "今天发生了什么有趣的事？"
- 底部浮动按钮："✨ 生成今日故事"

### 2. 故事书 `/story/$date`
- 居中书本容器（移动端全屏，桌面端 16:10 卡片 + 米色背景）
- 翻页：Framer Motion 3D `rotateY` + `transformPerspective`，配合 `book-flip.mp3`
- 页面结构：
  - 封面：日期 + AI 生成标题
  - 内容页：每条投递一页（时间戳 + 文字 + 照片，照片自适应排版）
  - 尾页"今日小结"：AI 生成的温暖总结段落
- 控制：左右箭头按钮 · 键盘 ← / → · 移动端 swipe（`@use-gesture/react`）
- 工具栏：返回 · 静音切换 · 导出 PDF · 分享

### 3. 历史书架 `/shelf`
- 月历视图：有故事的日期显示小书脊缩略图，hover 展开标题
- 顶部月份切换 + "跳到今天"
- 点击日期 → 跳转 `/story/$date`；当日无故事则提示"还没有故事，去记录吧"

### 4. 设置 `/settings`
- 翻页音效开关 / 投递音效开关
- 自动生成时间（HH:MM，本地时区）
- 数据导出（全部 PDF 打包）

## AI 故事生成

`createServerFn` `generateDailyStory({ day })`：
1. `requireSupabaseAuth` 中间件取 userId
2. 拉当日所有 entries（按时间正序）
3. 调用 Lovable AI Gateway，输入投递文字摘要，输出 JSON：`{ title, summary }`，使用 tool calling 保证结构化
4. 写入 `stories` 表（upsert by `user_id + day`）
5. 前端 `useMutation` 触发，加载态显示"正在为你编织今日故事..."（缝纫针脚动画）

## 定时自动生成

- 每用户在 `profiles.auto_generate_at` 配置时间（默认 22:00）
- pg_cron 每 10 分钟扫描一次：找到本地时间已过设定时间且当日 story 不存在的用户，调用公开 API `/api/public/cron/generate-stories`（HMAC 签名校验）
- 该 API 复用 `generateDailyStory` 逻辑，遍历命中用户

## 设计系统（`src/styles.css`）

奶油米色温暖治愈调，全部 oklch token：

```
--background: oklch(0.97 0.02 80)        /* 米白 */
--foreground: oklch(0.30 0.04 60)        /* 深棕 */
--primary:    oklch(0.72 0.13 55)        /* 暖橘 */
--accent:     oklch(0.85 0.08 90)        /* 奶油黄 */
--card:       oklch(0.99 0.01 80)
--muted:      oklch(0.92 0.03 80)
--paper:      oklch(0.96 0.025 85)       /* 书页底色 */
--shadow-soft: 0 8px 24px -8px oklch(0.5 0.05 60 / 0.15)
--radius: 1rem
```

字体：标题 `Caveat`（手写）+ 正文 `Nunito`（圆润无衬线），通过 Google Fonts `<link>` 引入。

## 移动端优先

- 投递区在小屏吸底，桌面端居中卡片宽 720px
- 故事书在小屏占满视口，桌面端固定 900×600 居中
- 时间线移动端单列，桌面端单列居中（保持沉浸感）

## 依赖新增

`framer-motion` · `@use-gesture/react` · `jspdf` · `html2canvas` · `date-fns` · `react-day-picker`（已包含可复用）

## 实施步骤

1. 启用 Lovable Cloud + Lovable AI
2. 创建数据库 schema + RLS + storage bucket
3. 设计 token + 字体 + 全局样式
4. 鉴权骨架（登录页 + `_authenticated` 布局 + 顶部导航）
5. 今日页：投递组件 + 时间线 + 飞入动画
6. AI 服务函数 + 故事页（翻页动画 + 手势 + 键盘 + 音效）
7. 书架日历视图
8. PDF 导出 + 设置页
9. pg_cron 定时任务 + 公开 cron 端点
10. QA：移动端、空状态、错误态（402/429 提示）

## 用户交付物

- 完整可运行应用
- 默认 demo 数据可选（首次登录引导）
- 后续可扩展：分享公开链接、好友共读、语音投递
