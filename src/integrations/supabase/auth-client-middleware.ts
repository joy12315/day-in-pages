import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

// Attach Supabase access token as Bearer header on every server-fn call
export const supabaseAuthClientMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  });
