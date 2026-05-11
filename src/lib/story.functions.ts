import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAuthClientMiddleware } from "@/integrations/supabase/auth-client-middleware";

const Input = z.object({ day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

export const generateDailyStory = createServerFn({ method: "POST" })
  .middleware([supabaseAuthClientMiddleware, requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: entries, error } = await supabase
      .from("entries")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .eq("day", data.day)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    if (!entries || entries.length === 0) {
      throw new Error("今天还没有任何投递，先记录点什么吧～");
    }

    const bullets = entries
      .map((e, i) => `${i + 1}. [${new Date(e.created_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}] ${e.content || "(仅照片)"}`)
      .join("\n");

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "你是一位温暖治愈的睡前故事讲述者。根据用户今日记录的碎片，写一个温柔的标题（不超过12字）和一段150字左右的睡前小结，用第二人称'你'，语气像在给好友写一张晚安卡片，提取今日的小确幸与情绪，结尾给一句温柔的祝福。" },
          { role: "user", content: `今日 ${data.day} 的记录：\n${bullets}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "save_story",
            description: "保存今日故事的标题和小结",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "温暖的标题，不超过12字" },
                summary: { type: "string", description: "150字左右的睡前小结" },
              },
              required: ["title", "summary"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "save_story" } },
      }),
    });

    if (resp.status === 429) throw new Error("请求太频繁啦，稍后再试～");
    if (resp.status === 402) throw new Error("AI 额度已用完，请到工作区充值。");
    if (!resp.ok) throw new Error(`AI 调用失败: ${resp.status}`);

    const json = await resp.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI 返回为空，请重试。");
    const parsed = JSON.parse(args) as { title: string; summary: string };

    const { error: upErr } = await supabase
      .from("stories")
      .upsert({
        user_id: userId,
        day: data.day,
        title: parsed.title,
        summary: parsed.summary,
        status: "ready",
        generated_at: new Date().toISOString(),
      }, { onConflict: "user_id,day" });

    if (upErr) throw new Error(upErr.message);

    return { title: parsed.title, summary: parsed.summary };
  });
