import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { postulados, postuladoVotes } from "@/lib/db/schema";
import { verifyTurnstile } from "@/lib/turnstile";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sha256Hex, todayUtc } from "@/lib/utils";

const schema = z.object({
  turnstileToken: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const ip = ipFromHeaders(req.headers);

  const ts = await verifyTurnstile({ token: parsed.data.turnstileToken, ip });
  if (!ts.ok) {
    return NextResponse.json({ error: "captcha-failed" }, { status: 403 });
  }

  // Per-IP global rate limit (across all businesses)
  const ipHashShort = ip ? (await sha256Hex(`vote:${ip}`)).slice(0, 32) : "anon";
  const limit = await rateLimit({
    key: `vote-global:${ipHashShort}`,
    max: 30, // 30 votes / hour / IP — generous for a friend group, blocks abuse
    windowSeconds: 60 * 60,
  });
  if (!limit.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429 });

  const db = getDb();

  // Check postulado exists and is approved
  const [p] = await db.select().from(postulados).where(eq(postulados.id, id)).limit(1);
  if (!p) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (p.status !== "approved") {
    return NextResponse.json({ error: "not-vote-eligible" }, { status: 400 });
  }

  // Per-day-per-postulado uniqueness via unique index
  const ipHash = ip ? await sha256Hex(`postulado:${ip}`) : "anon-" + Math.random().toString(36).slice(2);
  const day = todayUtc();

  try {
    await db.insert(postuladoVotes).values({
      postuladoId: id,
      ipHash,
      voteDay: day,
    });
  } catch (e) {
    // Unique constraint violation = already voted today
    const msg = (e as Error).message ?? "";
    if (msg.includes("postulado_votes_unique_daily")) {
      return NextResponse.json({ error: "already-voted" }, { status: 409 });
    }
    throw e;
  }

  // Increment denormalized counter
  const [updated] = await db
    .update(postulados)
    .set({ votesCount: sql`${postulados.votesCount} + 1` })
    .where(eq(postulados.id, id))
    .returning({ votes: postulados.votesCount });

  return NextResponse.json({ votes: updated.votes });
}
