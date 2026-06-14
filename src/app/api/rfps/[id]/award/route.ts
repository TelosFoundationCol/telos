import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { businesses, proposals, rfps } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

const schema = z.object({ proposalId: z.string().uuid() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const db = getDb();
  const [rfp] = await db.select().from(rfps).where(eq(rfps.id, id)).limit(1);
  if (!rfp) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const [prop] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, parsed.data.proposalId))
    .limit(1);
  if (!prop || prop.rfpId !== id) return NextResponse.json({ error: "bad-proposal" }, { status: 400 });

  await db
    .update(rfps)
    .set({ status: "awarded", awardedProposalId: prop.id, awardedAt: new Date() })
    .where(eq(rfps.id, id));

  await db
    .update(businesses)
    .set({ status: "in_progress", agencyId: prop.agencyId })
    .where(eq(businesses.id, rfp.businessId));

  return NextResponse.json({ ok: true });
}
