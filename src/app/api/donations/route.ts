import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { donations, users } from "@/lib/db/schema";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sha256Hex } from "@/lib/utils";
import { sendDonationReceivedEmail } from "@/lib/email/send";
import { fmtMoney } from "@/lib/utils";

const schema = z.object({
  reference: z.string().regex(/^TX-\d{4}-\d{6}$/),
  email: z.string().email().max(255),
  donorName: z.string().max(120).nullable().optional(),
  anonymous: z.boolean().default(false),
  currency: z.enum(["USD", "COP", "USDC"]),
  amountCents: z.number().int().positive().max(100_000_000_000),
  destinationKind: z.enum(["general", "business", "category"]),
  destinationBusinessId: z.string().uuid().nullable().optional(),
  destinationCategory: z.enum(["marketing", "tech", "accounting", "legal", "export"]).nullable().optional(),
  proofObjectKey: z.string().min(1).max(500),
  bankRef: z.string().max(80).nullable().optional(),
  transferDate: z.string().nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });

  const ip = ipFromHeaders(req.headers);
  const ipHash = ip ? (await sha256Hex(`donate:${ip}`)).slice(0, 32) : "anon";
  const limit = await rateLimit({ key: `donate:${ipHash}`, max: 10, windowSeconds: 60 * 60 });
  if (!limit.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429 });

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const db = getDb();

  // Upsert user (so donor can request a magic link with the same email later)
  let user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
  if (!user) {
    [user] = await db.insert(users).values({ email, name: data.donorName ?? null, role: "donor" }).returning();
  }

  const [created] = await db
    .insert(donations)
    .values({
      reference: data.reference,
      donorUserId: user.id,
      donorEmail: email,
      donorName: data.anonymous ? null : data.donorName ?? null,
      anonymous: data.anonymous,
      currency: data.currency,
      amountCents: data.amountCents,
      destinationKind: data.destinationKind,
      destinationBusinessId: data.destinationBusinessId ?? null,
      destinationCategory: data.destinationCategory ?? null,
      proofObjectKey: data.proofObjectKey,
      bankReference: data.bankRef ?? null,
      transferredAt: data.transferDate ? new Date(data.transferDate) : null,
      message: data.message ?? null,
      status: "pending_proof",
    })
    .returning();

  // Send acknowledgement email (best-effort)
  sendDonationReceivedEmail({
    to: email,
    reference: created.reference,
    amount: fmtMoney(created.amountCents, created.currency),
    donorName: created.donorName ?? undefined,
  }).catch((err) => console.error("[donation email]", err));

  return NextResponse.json({ id: created.id, reference: created.reference });
}
