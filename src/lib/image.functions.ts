import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  prompt: z.string().min(1).max(1000),
});

export const generateImage = createServerFn({ method: "POST" })
  .inputValidator((data) => Input.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      return { url: null as string | null, error: "未配置 SILICONFLOW_API_KEY" };
    }
    try {
      const res = await fetch("https://api.siliconflow.cn/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Kwai-Kolors/Kolors",
          prompt: data.prompt,
          image_size: "1024x1024",
          batch_size: 1,
          num_inference_steps: 20,
          guidance_scale: 7.5,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("SiliconFlow error", res.status, text);
        return { url: null, error: `生成失败 (${res.status})` };
      }
      const json: any = await res.json();
      const url: string | undefined =
        json?.images?.[0]?.url ?? json?.data?.[0]?.url;
      if (!url) return { url: null, error: "返回数据无图片" };
      return { url, error: null };
    } catch (e: any) {
      console.error("generateImage failed", e);
      return { url: null, error: e?.message ?? "请求失败" };
    }
  });
