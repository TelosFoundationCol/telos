/**
 * Cheap DB-backed sliding-window rate limiter. Works on serverless without
 * Redis. For the prototype's traffic, a single SQL UPSERT per call is fine.
 *
 * If volume grows, swap to Upstash Redis (free tier 10k req/day) — the API
 * surface here is small enough to do that in 20 lines.
 */
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { rateLimitBuckets } from "@/lib/db/schema";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: Date;
};

export async function rateLimit(opts: {
  key: string;
  /** Max requests inside the window */
  max: number;
  /** Window length in seconds */
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const db = getDb();
  const now = new Date();
  const windowExpires = new Date(now.getTime() + opts.windowSeconds * 1000);

  // Best-effort cleanup of expired buckets (cheap; only deletes stale rows).
  await db.delete(rateLimitBuckets).where(lt(rateLimitBuckets.expiresAt, now));

  // Try to increment an existing live bucket.
  const updated = await db
    .update(rateLimitBuckets)
    .set({ count: sql`${rateLimitBuckets.count} + 1` })
    .where(and(eq(rateLimitBuckets.key, opts.key), gt(rateLimitBuckets.expiresAt, now)))
    .returning();

  if (updated.length > 0) {
    const bucket = updated[0];
    const ok = bucket.count <= opts.max;
    return {
      ok,
      remaining: Math.max(0, opts.max - bucket.count),
      resetAt: bucket.expiresAt,
    };
  }

  // No live bucket — create one. If two requests race we may briefly have
  // two rows; the unique key constraint on `key` would reject the loser if
  // we had one. Without it, the second one overwrites — acceptable for our
  // anti-abuse use case.
  await db
    .insert(rateLimitBuckets)
    .values({ key: opts.key, count: 1, windowStart: now, expiresAt: windowExpires })
    .onConflictDoUpdate({
      target: rateLimitBuckets.key,
      set: {
        count: sql`CASE
          WHEN ${rateLimitBuckets.expiresAt} > ${now.toISOString()}::timestamptz
          THEN ${rateLimitBuckets.count} + 1
          ELSE 1 END`,
        expiresAt: sql`CASE
          WHEN ${rateLimitBuckets.expiresAt} > ${now.toISOString()}::timestamptz
          THEN ${rateLimitBuckets.expiresAt}
          ELSE ${windowExpires.toISOString()}::timestamptz END`,
      },
    });

  return { ok: true, remaining: opts.max - 1, resetAt: windowExpires };
}

/** Get the request's client IP from common headers. Returns "" if not present. */
export function ipFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("true-client-ip") ??
    ""
  );
}
