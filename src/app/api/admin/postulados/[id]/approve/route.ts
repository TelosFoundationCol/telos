import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { agencies, businesses, postulados, rfps } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { broadcastRfpOpenedEmail } from "@/lib/email/send";
import { fmtCop } from "@/lib/utils";
import { getEnv } from "@/lib/env";

const DEFAULT_BUDGET_MIN_COP = 1_500_000;
const DEFAULT_BUDGET_MAX_COP = 5_000_000;
const RFP_WINDOW_DAYS = 7;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();

  const [p] = await db.select().from(postulados).where(eq(postulados.id, id)).limit(1);
  if (!p) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (p.status !== "pending_review") {
    return NextResponse.json({ error: "wrong-state" }, { status: 400 });
  }

  await db
    .update(postulados)
    .set({ status: "approved", approvedAt: new Date() })
    .where(eq(postulados.id, id));

  // Promote to a Business so we can open an RFP
  const [biz] = await db
    .insert(businesses)
    .values({
      postuladoId: p.id,
      name: p.name,
      ownerName: p.postulantRelation === "owner" ? p.postulantName : null,
      city: p.city,
      yearsOperating: p.yearsOperating,
      category: p.category,
      emoji: p.emoji ?? "🌱",
      storyEs: p.storyEs,
      storyEn: p.storyEn,
      needEs: p.needEs,
      needEn: p.needEn,
      status: "in_rfp",
      goalCents: DEFAULT_BUDGET_MAX_COP,
      raisedCents: 0,
      donorsCount: 0,
      milestones: [],
    })
    .returning();

  // Open an RFP with the postulado's category as the eligible bid pool
  const deadline = new Date(Date.now() + RFP_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(rfps).values({
    businessId: biz.id,
    categories: [p.category],
    status: "open",
    budgetMinCents: DEFAULT_BUDGET_MIN_COP,
    budgetMaxCents: DEFAULT_BUDGET_MAX_COP,
    deadline,
  });

  // Broadcast RFP-opened email to all active agencies in the category
  const eligible = await db
    .select({ name: agencies.name, email: agencies.contactEmail })
    .from(agencies)
    .where(and(eq(agencies.status, "active"), eq(agencies.category, p.category)));

  broadcastRfpOpenedEmail(
    eligible.map((a) => ({ to: a.email, agencyName: a.name })),
    {
      smbName: p.name,
      smbCity: p.city,
      need: p.needEs,
      budget: `${fmtCop(DEFAULT_BUDGET_MIN_COP)}–${fmtCop(DEFAULT_BUDGET_MAX_COP)}`,
      deadlineDays: RFP_WINDOW_DAYS,
      rfpUrl: `${getEnv().NEXT_PUBLIC_APP_URL}/portal/agencia`,
    },
  ).catch((err) => console.error("[rfp broadcast]", err));

  return NextResponse.json({ ok: true, businessId: biz.id, agencies: eligible.length });
}
