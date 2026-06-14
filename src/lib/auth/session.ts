/**
 * Session JWTs. Signed with AUTH_SECRET, stored in an HttpOnly cookie.
 * No refresh tokens — 30-day expiry, sign in again with magic link to extend.
 */
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

const SESSION_COOKIE = "telos.session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionClaims = {
  userId: string;
  email: string;
  role: "donor" | "agency_member" | "admin";
  agencyId?: string | null;
};

function secretKey() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("telos")
    .setAudience("telos")
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: "telos",
      audience: "telos",
    });
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: payload.role as SessionClaims["role"],
      agencyId: (payload.agencyId as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionClaims | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const COOKIE_NAME = SESSION_COOKIE;
