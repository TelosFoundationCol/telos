import { z } from "zod";

/**
 * Typed, validated env access. Throws at boot if any required var is missing.
 * Use `env.X` everywhere instead of `process.env.X` so missing config fails fast.
 */
const schema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars (run: openssl rand -base64 32)"),

  RESEND_API_KEY: z.string().startsWith("re_"),
  RESEND_FROM: z.string().min(3),

  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_URL: z.string().url().optional().or(z.literal("")),

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),

  NEXT_PUBLIC_APP_URL: z.string().url(),

  ADMIN_EMAILS: z.string().default(""),
});

type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment. See .env.example for required vars.");
  }
  cached = parsed.data;
  return cached;
}

/** Public env values safe to send to the browser. */
export const publicEnv = {
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
