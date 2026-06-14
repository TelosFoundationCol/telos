import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { agencies, proposals, rfps } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

const schema = z.object({
  scope: z.string().min(20).max(5000),
  costCents: z.number().int().positive().max(100_000_000_000),
  weeks: z.number().int().positive().max(260),
  team: z.number().int().positive().max(200),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.role !== "agency_member" && session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!session.agencyId) return NextResponse.json({ error: "no-agency" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const db = getDb();
  const [rfp] = await db.select().from(rfps).where(eq(rfps.id, id)).limit(1);
  if (!rfp) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (rfp.status !== "open") return NextResponse.json({ error: "rfp-closed" }, { status: 400 });
  if (new Date(rfp.deadline).getTime() < Date.now()) {
    return NextResponse.json({ error: "deadline-passed" }, { status: 400 });
  }

  const [agency] = await db.select().from(agencies).where(eq(agencies.id, session.agencyId)).limit(1);
  if (!agency || agency.status !== "active") {
    return NextResponse.json({ error: "agency-not-active" }, { status: 403 });
  }
  // Category eligibility
  const cats = rfp.categories as string[];
  if (!cats.includes(agency.category)) {
    return NextResponse.json({ error: "category-not-eligible" }, { status: 403 });
  }

  // Duplicate guard (unique constraint also enforces)
  const existing = (
    await db
      .select({ id: proposals.id })
      .from(proposals)
      .where(and(eq(proposals.rfpId, id), eq(proposals.agencyId, agency.id)))
      .limit(1)
  )[0];
  if (existing) return NextResponse.json({ error: "already-bid" }, { status: 409 });

  const [created] = await db
    .insert(proposals)
    .values({
      rfpId: id,
      agencyId: agency.id,
      scopeEs: parsed.data.scope,
      costCents: parsed.data.costCents,
      weeks: parsed.data.weeks,
      teamSize: parsed.data.team,
    })
    .returning();

  return NextResponse.json({ id: created.id });
}
