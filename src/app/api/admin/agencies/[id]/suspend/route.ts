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
  await db.update(agencies).set({ status: "suspended" }).where(eq(agencies.id, id));
  return NextResponse.json({ ok: true });
}
