import { Role } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { resolveAuthSecret } from "@/lib/auth/secret";
import { checkRateLimit } from "@/lib/security/rate-limit";

function generateNonce() {
  const raw = crypto.randomUUID();
  if (typeof btoa === "function") {
    return btoa(raw).replace(/=+$/g, "");
  }
  return raw.replace(/-/g, "");
}

function buildContentSecurityPolicy(nonce: string) {
  const scriptSrc =
    process.env.NODE_ENV === "development"
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const connectSrc =
    process.env.NODE_ENV === "development" ? "connect-src 'self' ws: wss: http: https:" : "connect-src 'self' https:";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    connectSrc,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");
}

const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store"
};

const AUTH_SECRET = resolveAuthSecret();
const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-ctrl-auth.session-token"
    : "ctrl-auth.session-token";
const FALLBACK_SESSION_COOKIE_NAMES = [
  SESSION_COOKIE_NAME,
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token"
];

function withHeaders(response: NextResponse, contentSecurityPolicy: string): NextResponse {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

function roleHomePath(role: Role): string {
  if (role === Role.CANDIDATE) return "/portal/candidate";
  if (role === Role.CLIENT) return "/portal/client";
  if (role === Role.SUPER_ADMIN) return "/portal/admin";
  if (role === Role.RECRUITER) return "/dashboard/recruiter";
  return "/";
}

function routeRequiresRoles(pathname: string): Role[] | null {
  if (
    pathname.startsWith("/portal/candidate") ||
    pathname.startsWith("/dashboard/candidate") ||
    pathname.startsWith("/api/assessments") ||
    pathname.startsWith("/api/assessment") ||
    pathname.startsWith("/api/upload/cv")
  ) {
    return [Role.CANDIDATE];
  }
  if (
    pathname.startsWith("/portal/recruiter") ||
    pathname.startsWith("/dashboard/recruiter") ||
    pathname.startsWith("/api/codes/generate") ||
    pathname.startsWith("/api/recruiter/share")
  ) {
    return [Role.RECRUITER];
  }
  if (pathname.startsWith("/portal/client") || pathname.startsWith("/dashboard/client")) {
    return [Role.CLIENT];
  }
  if (pathname.startsWith("/api/cv/view")) {
    return [Role.RECRUITER, Role.CLIENT];
  }
  if (pathname.startsWith("/portal/admin") || pathname.startsWith("/dashboard/admin") || pathname.startsWith("/api/audit")) {
    return [Role.SUPER_ADMIN];
  }
  return null;
}

function getEffectiveRoleFromRequest(tokenRole?: string | null): Role | null {
  if (tokenRole && Object.values(Role).includes(tokenRole as Role)) {
    return tokenRole as Role;
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = generateNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  if (process.env.NODE_ENV === "production") {
    const proto = request.headers.get("x-forwarded-proto");
    if (proto && proto !== "https") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.protocol = "https:";
      return withHeaders(NextResponse.redirect(redirectUrl), contentSecurityPolicy);
    }
  }

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/codes/validate") ||
    pathname.startsWith("/api/upload/cv") ||
    pathname.startsWith("/api/cv/view")
  ) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (
      (pathname.startsWith("/login") && !checkRateLimit(`mw-login:${ip}`, 80, 15 * 60 * 1000)) ||
      (pathname.startsWith("/register") && !checkRateLimit(`mw-register:${ip}`, 40, 15 * 60 * 1000)) ||
      (pathname.startsWith("/api/codes/validate") && !checkRateLimit(`mw-code:${ip}`, 40, 10 * 60 * 1000)) ||
      (pathname.startsWith("/api/upload/cv") && !checkRateLimit(`mw-cv-upload:${ip}`, 30, 15 * 60 * 1000)) ||
      (pathname.startsWith("/api/cv/view") && !checkRateLimit(`mw-cv-view:${ip}`, 100, 15 * 60 * 1000))
    ) {
      return withHeaders(NextResponse.json({ error: "Too many requests" }, { status: 429 }), contentSecurityPolicy);
    }
  }

  const requiredRoles = routeRequiresRoles(pathname);

  if (!requiredRoles) {
    return withHeaders(NextResponse.next({ request: { headers: requestHeaders } }), contentSecurityPolicy);
  }

  let token = null;
  for (const cookieName of FALLBACK_SESSION_COOKIE_NAMES) {
    token = await getToken({
      req: request,
      secret: AUTH_SECRET,
      cookieName
    });
    if (token) {
      break;
    }
  }
  const effectiveRole = getEffectiveRoleFromRequest(token?.role as string | undefined);

  if (!effectiveRole) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return withHeaders(NextResponse.redirect(url), contentSecurityPolicy);
  }

  if (!requiredRoles.includes(effectiveRole)) {
    if (pathname.startsWith("/api/")) {
      return withHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }), contentSecurityPolicy);
    }

    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(effectiveRole);
    url.search = "";
    return withHeaders(NextResponse.redirect(url), contentSecurityPolicy);
  }

  return withHeaders(NextResponse.next({ request: { headers: requestHeaders } }), contentSecurityPolicy);
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/dashboard/:path*",
    "/login/:path*",
    "/register",
    "/api/register",
    "/api/auth/clear-site-data",
    "/api/session/:path*",
    "/api/dev/:path*",
    "/api/codes/:path*",
    "/api/upload/:path*",
    "/api/cv/:path*",
    "/api/recruiter/:path*",
    "/api/assessment/:path*",
    "/api/assessments/:path*",
    "/api/audit/:path*"
  ]
};
