import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { agencies, users } from "@/lib/db/schema";
import { getSession, signSession, setSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  name: z.string().min(2).max(160),
  category: z.enum(["marketing", "tech", "accounting", "legal", "export"]),
  city: z.string().min(2).max(120),
  leadName: z.string().min(2).max(120),
  contactEmail: z.string().email().max(255),
  blurb: z.string().min(20).max(2000),
  certifications: z.string().max(500).optional().default(""),
  teamSize: z.number().int().positive().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();

  // If the user is already linked to an agency, block re-application.
  const [me] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (me?.agencyId) {
    return NextResponse.json({ error: "already-linked" }, { status: 409 });
  }

  const [created] = await db
    .insert(agencies)
    .values({
      name: parsed.data.name,
      category: parsed.data.category,
      city: parsed.data.city,
      leadName: parsed.data.leadName,
      contactEmail: parsed.data.contactEmail.toLowerCase(),
      blurbEs: parsed.data.blurb,
      certificationsEs: parsed.data.certifications || null,
      teamSize: parsed.data.teamSize ?? 1,
      status: "pending_verification",
    })
    .returning();

  // Link user → agency, and promote role to agency_member
  await db
    .update(users)
    .set({ agencyId: created.id, role: "agency_member" })
    .where(eq(users.id, session.userId));

  // Rotate the session JWT so the new role/agencyId is in the cookie
  const fresh = await signSession({
    userId: session.userId,
    email: session.email,
    role: "agency_member",
    agencyId: created.id,
  });
  await setSessionCookie(fresh);

  return NextResponse.json({ id: created.id });
}
