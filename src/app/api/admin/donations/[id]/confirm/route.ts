import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { donations, ledger } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { sendDonationConfirmedEmail } from "@/lib/email/send";
import { fmtMoney } from "@/lib/utils";
import { getEnv } from "@/lib/env";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();
  const [d] = await db.select().from(donations).where(eq(donations.id, id)).limit(1);
  if (!d) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (d.status !== "pending_proof") {
    return NextResponse.json({ error: "wrong-state" }, { status: 400 });
  }

  await db
    .update(donations)
    .set({
      status: "confirmed",
      validatedAt: new Date(),
      validatedByUserId: session.userId,
    })
    .where(eq(donations.id, id));

  // Add to public ledger
  await db.insert(ledger).values({
    kind: "donation",
    fromName: d.anonymous
      ? `Anónimo (${d.donorCountry ?? "—"})`
      : d.donorName ?? d.donorEmail,
    toName:
      d.destinationKind === "general"
        ? "Telos · Fondo general"
        : d.destinationKind === "business"
          ? "Telos · Negocio específico"
          : `Telos · ${d.destinationCategory}`,
    purposeEs: "Donación confirmada",
    purposeEn: "Confirmed donation",
    amountCents: d.amountCents,
    currency: d.currency,
    referenceHash: d.reference.replace("TX-2026-", "TX-").slice(0, 12),
    sourceTable: "donations",
    sourceId: d.id,
    occurredAt: d.transferredAt ?? d.submittedAt,
  });

  // Send confirmation email
  sendDonationConfirmedEmail({
    to: d.donorEmail,
    reference: d.reference,
    amount: fmtMoney(d.amountCents, d.currency),
    donorName: d.donorName ?? undefined,
    ledgerUrl: `${getEnv().NEXT_PUBLIC_APP_URL}/transparencia`,
  }).catch((err) => console.error("[confirm email]", err));

  return NextResponse.json({ ok: true });
}
