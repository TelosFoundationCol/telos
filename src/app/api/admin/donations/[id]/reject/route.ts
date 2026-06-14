import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { donations } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();
  await db
    .update(donations)
    .set({ status: "rejected", validatedAt: new Date(), validatedByUserId: session.userId })
    .where(eq(donations.id, id));
  return NextResponse.json({ ok: true });
}
