## 整体风格升级方案 — 童趣插画绘本风

参考你上传的插画（饱和绿叶、小星星点缀、圆润手绘角色、纸面颗粒质感），把整站从现在「奶油暖纸」升级到一套**温柔童话绘本**风：森林绿主调 + 暖橙暖黄点缀 + 颗粒纸纹 + 圆润大字 + 微动效。整体仍保留「私密、温暖、向内」的产品气质，不做营销感。

### 1. 设计令牌（`src/styles.css`）
重写 `:root` 颜色与阴影：
- `--background`：奶白偏暖（米色，oklch ~0.97 0.02 85）
- `--foreground`：深森林墨绿（oklch ~0.28 0.05 150）
- `--primary`：森林绿（oklch ~0.55 0.12 155），`--primary-foreground` 米白
- `--accent`：暖黄星光色（oklch ~0.85 0.15 90）
- `--secondary`：薄荷淡绿
- `--card`：米白带极轻绿调
- 新增 `--coral`（暖珊瑚）、`--leaf-deep`（深叶绿）作语义点缀
- `--shadow-soft`：低饱和墨绿透明阴影；`--shadow-book`：更深层叠
- `--radius` 提到 1.25rem，增加圆润感

字体替换：
- `--font-display`：`"Fraunces"` 或 `"Caveat"` + 备用，用于落地大标题（保留 Caveat 作手写副字）
- `--font-sans`：`"Quicksand"` 或保留 `Nunito`（两者都圆润），更新 `@import` 字体链

新增 utility：
- `.grain`：SVG noise 颗粒纹（`background-image: url("data:image/svg+xml,...")`），叠加在卡片/banner 上
- `.leaf-bg`：在 `body::before` 用 SVG 叶子图案做极淡水印
- `.sparkle`：极小星星浮动 keyframes
- `.float-y`：缓慢上下浮动（4-6s）

### 2. 落地页 `src/routes/index.tsx`
重做为绘本封面感：
- 背景：奶白 + `.grain` + 左右两侧 4-6 片 SVG 叶子（`absolute`、不同旋转/透明度、`float-y` 动画）+ 散落小星星
- 主视觉：把 📮 emoji 换成自定义 SVG 信封 +「胶囊」组合插画（用 `imagegen` 生成一张透明 PNG，圆润手绘风）
- H1 用 display 字体，颜色 `--leaf-deep`，下方用手写副标
- CTA 按钮：圆角胶囊形、森林绿主色、悬浮微弹（scale 1.03 + 阴影加深），配 hover sparkle
- 三个卡片改为带圆角描边的小插画卡（"投递 / 编织 / 翻阅"），emoji 换成 SVG 简笔图标，hover 时整卡微浮

### 3. 全局导航 `src/routes/_authenticated.tsx`
- 桌面 header：背景 `bg-card/80 backdrop-blur` + 底部叶子描边分隔
- Logo：📮 emoji 换成圆形森林绿头像（小信封 SVG），品牌字 Fraunces
- nav 项 active 态：胶囊背景 + 一颗小星星点缀
- 移动端底栏：高度 64、圆顶背景、active icon 弹跳过渡

### 4. 今日页 `src/routes/_authenticated/today.tsx`
- 顶部日期：display 字 + 旁边手绘叶子小图
- 「已投递 X 颗胶囊」用胶囊形 chip
- 浮动 CTA「生成今日故事」：背景换 `--accent` 暖黄 + 星星 icon + 轻微脉冲

### 5. EntryComposer / Timeline 卡片
- `EntryComposer`：卡片加 `.grain` 颗粒、圆角 2rem、内边框点缀小星星水印；按钮「投递」用主绿色 + 信封 icon、hover 时小幅旋转 5°
- 投递动画：保留飞出，加一串 ✨ 跟随
- `Timeline` 时间轴：竖线改为虚线绿；节点 dot 替成小叶子 SVG；卡片左侧加 4px 主色描边
- AI 配图按钮：保持暖色，改成圆角胶囊 + 闪烁 sparkle

### 6. Login / Story / Shelf / Settings
- 统一接入新令牌，无需逐页重写
- Login 页加同款叶子背景 + 居中绘本式卡片
- Story `story.$date.tsx`：保留现有翻页，纸面换 `.grain`，封面字体改 display

### 7. 微动效（framer-motion，已装）
- 落地页元素逐项 fade-up，stagger 80ms
- 叶子/星星：`animate={{ y: [0,-8,0], rotate: [0,3,0] }}` 6s 循环
- 卡片 hover：`whileHover={{ y: -4 }}`
- 按钮：`whileTap={{ scale: 0.96 }}`

### 8. 资源生成
用 `imagegen` 生成 4 张透明 PNG 放进 `src/assets/`：
- `leaf-1.png`、`leaf-2.png`：手绘叶子（饱和绿、白色叶脉、纸面质感）
- `envelope-mascot.png`：圆润信封 + 小星星，作落地页主视觉
- `og-cover.jpg`：1200×630 落地页 OG 图（绿叶环绕 + 标题）

### 不在范围
- 不改后端、不改路由结构、不改业务逻辑
- 不动 Edge Function
- 不引入新依赖（Fraunces/Quicksand 通过 Google Fonts CSS 引入）

### 执行顺序
1. 生成 4 张插画素材
2. 改 `styles.css`（令牌 + 字体 + grain/leaf utility）
3. 改 `__root.tsx` 字体链接 + theme-color
4. 重做 `index.tsx` 落地页
5. 升级 `_authenticated.tsx` 导航
6. 微调 `today.tsx` / `EntryComposer` / `Timeline`
7. 检查 login / story / shelf / settings 视觉一致

完成后整体观感：像一本会呼吸的小绘本，安静、温柔、有手作感，符合「时光胶囊」气质。
