/**
 * Cloudflare Turnstile server-side verification.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
import { getEnv } from "@/lib/env";

const ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(opts: {
  token: string;
  ip?: string;
}): Promise<{ ok: boolean; errorCodes?: string[] }> {
  if (!opts.token) return { ok: false, errorCodes: ["missing-input-response"] };
  const env = getEnv();

  const body = new URLSearchParams();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", opts.token);
  if (opts.ip) body.set("remoteip", opts.ip);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    // Don't cache verification calls
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as
    | { success: boolean; "error-codes"?: string[] }
    | null;
  if (!data) return { ok: false, errorCodes: ["bad-response"] };
  return { ok: !!data.success, errorCodes: data["error-codes"] };
}
