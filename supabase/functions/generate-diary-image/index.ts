// Edge Function: generate-diary-image
// 1) DeepSeek-V3 把日记优化成一段绘画 prompt
// 2) FLUX.1-dev 生成图片
// 返回 { imageUrl, optimizedPrompt }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("SILICONFLOW_API_KEY");
    if (!apiKey) return json({ error: "SILICONFLOW_API_KEY 未配置" }, 500);

    const { diaryText } = await req.json().catch(() => ({}));
    if (typeof diaryText !== "string" || !diaryText.trim()) {
      return json({ error: "diaryText 不能为空" }, 400);
    }
    if (diaryText.length > 2000) {
      return json({ error: "diaryText 过长（≤2000 字）" }, 400);
    }

    // Step A: 优化 prompt
    const chatRes = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          {
            role: "system",
            content:
              "你是一位插画指导。请把用户的一段日记浓缩成一句富有画面感的英文绘画 prompt，限定风格：温暖、治愈、柔和光线、插画质感；避免出现真实人物特征、文字、logo。只输出最终的 prompt 一句话，不要任何解释或前缀。",
          },
          { role: "user", content: diaryText },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!chatRes.ok) {
      const text = await chatRes.text();
      console.error("DeepSeek error", chatRes.status, text);
      if (chatRes.status === 429) return json({ error: "请求太频繁，稍后再试" }, 429);
      return json({ error: `prompt 优化失败 (${chatRes.status})` }, 502);
    }
    const chatJson = await chatRes.json();
    const optimizedPrompt: string = chatJson?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!optimizedPrompt) return json({ error: "prompt 优化返回为空" }, 502);

    // Step B: 生成图片
    const imgRes = await fetch("https://api.siliconflow.cn/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-dev",
        prompt: optimizedPrompt,
        image_size: "1024x1024",
        batch_size: 1,
        num_inference_steps: 20,
        guidance_scale: 3.5,
      }),
    });

    if (!imgRes.ok) {
      const text = await imgRes.text();
      console.error("FLUX error", imgRes.status, text);
      if (imgRes.status === 429) return json({ error: "请求太频繁，稍后再试" }, 429);
      return json({ error: `图片生成失败 (${imgRes.status})`, optimizedPrompt }, 502);
    }
    const imgJson = await imgRes.json();
    const imageUrl: string | undefined =
      imgJson?.images?.[0]?.url ?? imgJson?.data?.[0]?.url;
    if (!imageUrl) return json({ error: "返回数据无图片", optimizedPrompt }, 502);

    return json({ imageUrl, optimizedPrompt });
  } catch (e) {
    console.error("generate-diary-image failed", e);
    return json({ error: (e as Error)?.message ?? "请求失败" }, 500);
  }
});
