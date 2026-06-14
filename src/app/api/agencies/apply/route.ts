import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { agencies, users } from "@/lib/db/schema";
import { getSession, setSessionCookie, signSession } from "@/lib/auth/session";
import { createMagicLink, magicLinkUrl } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sha256Hex } from "@/lib/utils";
import { getLang } from "@/lib/i18n/server";

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
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  }

  // Rate-limit by IP — agency apply isn't a hot path, but spam guard anyway.
  const ip = ipFromHeaders(req.headers);
  const ipHash = ip ? (await sha256Hex(`agency-apply:${ip}`)).slice(0, 32) : "anon";
  const limit = await rateLimit({
    key: `agency-apply:${ipHash}`,
    max: 5,
    windowSeconds: 60 * 60 * 12,
  });
  if (!limit.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429 });

  const data = parsed.data;
  const contactEmail = data.contactEmail.toLowerCase();
  const db = getDb();

  // Existing session? Link to that user. No session? Find-or-create user by contact email.
  const session = await getSession();

  if (session) {
    const [me] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (me?.agencyId) {
      return NextResponse.json({ error: "already-linked" }, { status: 409 });
    }
  }

  const [created] = await db
    .insert(agencies)
    .values({
      name: data.name,
      category: data.category,
      city: data.city,
      leadName: data.leadName,
      contactEmail,
      blurbEs: data.blurb,
      certificationsEs: data.certifications || null,
      teamSize: data.teamSize ?? 1,
      status: "pending_verification",
    })
    .returning();

  // Identify or create the user owning this application (keyed by contact email).
  let userRow = (await db.select().from(users).where(eq(users.email, contactEmail)).limit(1))[0];
  if (!userRow) {
    [userRow] = await db
      .insert(users)
      .values({ email: contactEmail, name: data.leadName, role: "agency_member", agencyId: created.id })
      .returning();
  } else {
    await db
      .update(users)
      .set({ agencyId: created.id, role: "agency_member" })
      .where(eq(users.id, userRow.id));
  }

  // If the requester is already signed in with this same email, rotate the JWT
  // so the new role/agency are immediately effective.
  if (session && session.email.toLowerCase() === contactEmail) {
    const fresh = await signSession({
      userId: userRow.id,
      email: userRow.email,
      role: "agency_member",
      agencyId: created.id,
    });
    await setSessionCookie(fresh);
    return NextResponse.json({ id: created.id, magicLinkSent: false });
  }

  // Unauthed (or signed in with a different email): send a magic link so the
  // applicant can enter their pending portal from their inbox.
  try {
    const { token } = await createMagicLink({ email: contactEmail, ip });
    const url = magicLinkUrl(token);
    const lang = await getLang();
    await sendMagicLinkEmail({ to: contactEmail, url, lang });
  } catch (err) {
    console.error("[agency-apply magic link]", err);
  }

  return NextResponse.json({ id: created.id, magicLinkSent: true, email: contactEmail });
}
