## 目标

在 Lovable Cloud 上新建一个 Supabase Edge Function `generate-diary-image`，用「先优化 prompt → 再生成图」的两步流程替代当前 `src/lib/image.functions.ts` 里直接调 Kolors 的逻辑。

## 现状说明（重要）

- `SILICONFLOW_API_KEY` **已经在 Lovable Cloud 的 Secrets 里**（见 fetch_secrets 结果），无需重新添加。Edge Function 可直接用 `Deno.env.get("SILICONFLOW_API_KEY")` 读取。
- 当前已有一个 server function `generateImage`（TanStack `createServerFn`），它**没有鉴权**——这是当前 security 视图里那条 error 级告警的根因。改成 Edge Function 后，会顺手把鉴权问题一起解决（Supabase Edge Function 默认 verify_jwt=true）。

## 实施步骤

### 1. 新建 Edge Function

文件：`supabase/functions/generate-diary-image/index.ts`

职责：
- 校验入参 `{ diaryText: string }`（非空、≤2000 字）
- 读取 `SILICONFLOW_API_KEY`，缺失则返回 500
- **Step A**：POST `https://api.siliconflow.cn/v1/chat/completions`
  - model: `deepseek-ai/DeepSeek-V3`
  - system prompt：把日记浓缩成一句富有画面感的英文/中文绘画 prompt（限定风格：温暖、治愈、插画感，避免人物特征过具体）
  - user：`diaryText`
  - 取 `choices[0].message.content` → `optimizedPrompt`
- **Step B**：POST `https://api.siliconflow.cn/v1/images/generations`
  - model: `black-forest-labs/FLUX.1-dev`
  - prompt: `optimizedPrompt`
  - image_size: `1024x1024`
  - 取 `images[0].url` → `imageUrl`
- 统一 CORS 头（`Access-Control-Allow-Origin: *` + OPTIONS 预检），方便前端调用
- 返回 `{ imageUrl, optimizedPrompt }`；任一步失败返回 `{ error }` + 合适状态码

### 2. config.toml

默认 `verify_jwt = true`（保留默认即可，正好修复"未鉴权"安全告警）。无需改 `supabase/config.toml`。

### 3. 前端接入（替换现有逻辑）

修改 `src/components/Timeline.tsx` 里的 `AiImageButton`：
- 不再 `useServerFn(generateImage)`
- 改为 `supabase.functions.invoke("generate-diary-image", { body: { diaryText: prompt } })`
- 同时展示 `optimizedPrompt`（小字、可折叠）让用户看到 AI 是怎么理解这条日记的

### 4. 清理旧代码

删除 `src/lib/image.functions.ts`（旧的 Kolors server function），同时关闭那条 security 告警。

## 关于 Secrets 的说明

你问"怎么在 Lovable Cloud 的 Secrets 里添加 SILICONFLOW_API_KEY"——

**好消息**：这个 key 你**之前已经通过 `add_secret` 弹窗加过了**，现在 Lovable Cloud 里已经存在 `SILICONFLOW_API_KEY`，Edge Function 部署后可以直接读到，不用再加一次。

如果以后想**新增/更新**其它 secret，标准做法是：
- 让我调 `add_secret` 工具 → 你在弹窗里输入 → 安全存进 Cloud
- 或者你自己进 Cloud → Secrets 面板手动加（但用工具更稳，不会漏空格）

千万**不要**在聊天里直接贴 key 文本。

## 技术细节

- 运行时：Deno（Supabase Edge Runtime）
- 部署：保存文件后 Lovable 会自动部署，不用手动 `supabase functions deploy`
- 调用方式：前端 `supabase.functions.invoke()` 会自动带上当前用户的 JWT，Edge Function 默认验证通过才执行
- 错误处理：DeepSeek-V3 限流 → 提示"稍后再试"；FLUX 失败 → 回退提示"配图失败，但你的日记已保存"

## 不在本次范围

- 不改数据库结构（生成的图不入库，仅当次展示，与现状一致）
- 不动 `generateDailyStory` 故事生成流程
- 不切换后端到你自己的 Supabase 账号（沿用 Lovable Cloud）

确认后我开始实施。