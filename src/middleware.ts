import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "telos.session";

// We can't import from "@/lib" here without bringing serverless-only deps into
// the Edge runtime. So we re-implement a minimal verify with jose only.
async function verifyEdgeSession(token: string) {
  try {
    const secret = process.env.AUTH_SECRET ?? "";
    if (!secret) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "telos",
      audience: "telos",
    });
    return {
      role: payload.role as "donor" | "agency_member" | "admin",
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPaths = ["/portal", "/admin"];
  const needsAuth = protectedPaths.some((p) => pathname.startsWith(p));

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyEdgeSession(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/magic-link";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/portal/agencia") && session.role !== "agency_member" && session.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/portal/donante";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
