import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { postulados } from "@/lib/db/schema";
import { verifyTurnstile } from "@/lib/turnstile";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sha256Hex } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(160),
  city: z.string().min(2).max(120),
  address: z.string().min(4).max(500),
  yearsOperating: z.string().or(z.number()).transform((v) => Number(v)).pipe(z.number().int().min(0).max(120)),
  category: z.enum(["marketing", "tech", "accounting", "legal", "export"]),
  youtubeUrl: z.string().url().max(500).optional().or(z.literal("")),
  story: z.string().min(20).max(3000),
  need: z.string().min(10).max(1000),
  why: z.string().max(2000).optional().default(""),
  postulantName: z.string().min(2).max(120),
  postulantEmail: z.string().email().max(255),
  postulantRelation: z.enum(["owner", "family", "customer", "friend", "other"]),
  honeypot: z.string().max(0).optional().default(""), // bots fill, humans don't
  turnstileToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // honeypot check — if filled, silently succeed-but-skip (avoid signaling to bots)
  if (data.honeypot && data.honeypot.length > 0) {
    return NextResponse.json({ id: "honeypot" }, { status: 200 });
  }

  const ip = ipFromHeaders(req.headers);
  const ts = await verifyTurnstile({ token: data.turnstileToken, ip });
  if (!ts.ok) {
    return NextResponse.json({ error: "captcha-failed", codes: ts.errorCodes }, { status: 403 });
  }

  const ipHash = ip ? (await sha256Hex(`postulate:${ip}`)).slice(0, 32) : "anon";
  const limit = await rateLimit({
    key: `postulate:${ipHash}`,
    max: 5, // 5 submissions per 12 hours per IP — enough for legit, blocks spammers
    windowSeconds: 60 * 60 * 12,
  });
  if (!limit.ok) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  const db = getDb();
  const [created] = await db
    .insert(postulados)
    .values({
      name: data.name,
      city: data.city,
      address: data.address,
      yearsOperating: data.yearsOperating,
      category: data.category,
      youtubeUrl: data.youtubeUrl || null,
      storyEs: data.story,
      needEs: data.need,
      whyEs: data.why || null,
      postulantName: data.postulantName,
      postulantEmail: data.postulantEmail.toLowerCase(),
      postulantRelation: data.postulantRelation,
      status: "pending_review",
      emoji: "🌱",
    })
    .returning({ id: postulados.id });

  return NextResponse.json({ id: created.id });
}
