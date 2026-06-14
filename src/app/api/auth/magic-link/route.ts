import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createMagicLink, magicLinkUrl } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sha256Hex } from "@/lib/utils";
import { getLang } from "@/lib/i18n/server";

const schema = z.object({
  email: z.string().email().max(255),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const ip = ipFromHeaders(req.headers);

  // Rate-limit by email to prevent magic-link spamming someone's inbox.
  const emailHash = (await sha256Hex(parsed.data.email.toLowerCase())).slice(0, 32);
  const limit = await rateLimit({
    key: `magic:${emailHash}`,
    max: 5,
    windowSeconds: 60 * 60, // 5 magic links / hour / email
  });
  if (!limit.ok) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  const { token } = await createMagicLink({ email: parsed.data.email, ip });
  const url = magicLinkUrl(token);
  const lang = await getLang();

  // Fire-and-forget — we always return OK regardless of email delivery so we
  // don't leak whether an email exists in our DB.
  sendMagicLinkEmail({ to: parsed.data.email, url, lang }).catch((err) =>
    console.error("[magic-link email]", err),
  );

  return NextResponse.json({ ok: true });
}
