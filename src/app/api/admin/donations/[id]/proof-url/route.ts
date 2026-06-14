import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { donations } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { presignRead } from "@/lib/storage/r2";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();
  const [d] = await db.select().from(donations).where(eq(donations.id, id)).limit(1);
  if (!d) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (!d.proofObjectKey) return NextResponse.json({ error: "no-proof" }, { status: 404 });
  try {
    const url = await presignRead(d.proofObjectKey, 60 * 10);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[proof-url]", err);
    return NextResponse.json({ error: "presign-failed" }, { status: 500 });
  }
}
