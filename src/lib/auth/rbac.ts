/**
 * Role-based access helpers for route handlers and Server Components.
 * Each function returns the session or throws (caller handles).
 */
import { redirect } from "next/navigation";
import { getSession, type SessionClaims } from "./session";

export async function requireSession(redirectTo = "/auth/magic-link"): Promise<SessionClaims> {
  const session = await getSession();
  if (!session) redirect(redirectTo);
  return session;
}

export async function requireDonor(): Promise<SessionClaims> {
  return requireSession("/auth/magic-link?next=/portal/donante");
}

export async function requireAgency(): Promise<SessionClaims> {
  const session = await requireSession("/auth/magic-link?next=/portal/agencia");
  if (session.role !== "agency_member" && session.role !== "admin") {
    redirect("/");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionClaims> {
  const session = await requireSession("/auth/magic-link?next=/admin");
  if (session.role !== "admin") {
    redirect("/");
  }
  return session;
}
