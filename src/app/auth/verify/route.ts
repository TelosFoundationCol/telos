import { NextResponse, type NextRequest } from "next/server";
import { consumeMagicLink } from "@/lib/auth/magic-link";
import { setSessionCookie, signSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const token = url.searchParams.get("token");
  const next = url.searchParams.get("next") ?? "/portal/donante";

  if (!token) {
    return NextResponse.redirect(new URL("/auth/magic-link?error=invalid", url.origin));
  }

  const user = await consumeMagicLink(token);
  if (!user) {
    return NextResponse.redirect(new URL("/auth/magic-link?error=expired", url.origin));
  }

  const jwt = await signSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    agencyId: user.agencyId ?? null,
  });
  await setSessionCookie(jwt);

  // Route to the right place based on role
  let target = next;
  if (user.role === "admin" && next === "/portal/donante") target = "/admin";
  if (user.role === "agency_member" && next === "/portal/donante") target = "/portal/agencia";

  return NextResponse.redirect(new URL(target, url.origin));
}
