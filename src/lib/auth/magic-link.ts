/**
 * Magic-link tokens. Single-use, 15-minute TTL.
 *
 * Flow:
 *   1. POST /api/auth/magic-link { email }
 *      → upsert user, generate 256-bit token, store SHA-256(token) in DB
 *      → email user a link: /auth/verify?token=<raw>
 *   2. GET /auth/verify?token=...
 *      → look up by SHA-256(token), check expiry+used, mark used,
 *        sign session JWT, set cookie, redirect.
 */
import { eq, and, gt, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import { magicLinkTokens, users } from "@/lib/db/schema";
import { sha256Hex } from "@/lib/utils";
import { getEnv } from "@/lib/env";

const TOKEN_TTL_MINUTES = 15;

/**
 * Create a magic-link token for an email — but ONLY if the email corresponds
 * to an existing user OR is on the admin allowlist. Returns null otherwise,
 * so the route handler can skip sending and avoid spamming uninvolved inboxes
 * (and Resend quota).
 *
 * Users are created upstream by the flows that legitimately bring someone in:
 *   - /api/donations         (donor flow creates the user before this is called)
 *   - /api/agencies/apply    (agency flow creates the user before this is called)
 *   - ADMIN_EMAILS bootstrap (first admin sign-in creates the user here)
 *
 * Note for callers: route handlers should always return the same "ok" JSON
 * regardless of whether a link was created, so the email's existence in our
 * DB is never leaked.
 */
export async function createMagicLink(opts: {
  email: string;
  ip?: string;
}): Promise<{ token: string; userId: string; isNewUser: boolean } | null> {
  const env = getEnv();
  const adminEmails = env.ADMIN_EMAILS
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = opts.email.trim().toLowerCase();
  const db = getDb();

  let user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
  let isNewUser = false;

  if (!user) {
    // Only admin allowlist emails get auto-provisioned. Everyone else has to
    // come in through donate / agency-apply (which create the user record).
    if (!adminEmails.includes(email)) return null;
    const [created] = await db.insert(users).values({ email, role: "admin" }).returning();
    user = created;
    isNewUser = true;
  } else if (adminEmails.includes(email) && user.role !== "admin") {
    // Existing user upgraded to admin if their email is now on the allowlist.
    await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
    user.role = "admin";
  }

  const token = nanoid(48);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await db.insert(magicLinkTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
    requestedIp: opts.ip?.slice(0, 64),
  });

  return { token, userId: user.id, isNewUser };
}

export async function consumeMagicLink(rawToken: string) {
  const db = getDb();
  const tokenHash = await sha256Hex(rawToken);
  const now = new Date();

  const row = (
    await db
      .select({
        token: magicLinkTokens,
        user: users,
      })
      .from(magicLinkTokens)
      .innerJoin(users, eq(users.id, magicLinkTokens.userId))
      .where(
        and(
          eq(magicLinkTokens.tokenHash, tokenHash),
          gt(magicLinkTokens.expiresAt, now),
          isNull(magicLinkTokens.usedAt),
        ),
      )
      .limit(1)
  )[0];

  if (!row) return null;

  // Mark used
  await db
    .update(magicLinkTokens)
    .set({ usedAt: now })
    .where(eq(magicLinkTokens.id, row.token.id));

  // Bump last sign-in
  await db.update(users).set({ lastSignInAt: now }).where(eq(users.id, row.user.id));

  return row.user;
}

export function magicLinkUrl(rawToken: string): string {
  const base = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${base}/auth/verify?token=${rawToken}`;
}
