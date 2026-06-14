import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { agencies } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();
  const [updated] = await db
    .update(agencies)
    .set({ status: "active", verifiedAt: new Date() })
    .where(eq(agencies.id, id))
    .returning();
  if (!updated) return NextResponse.json({ error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
