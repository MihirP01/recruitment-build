import { NextResponse } from "next/server";
import { getDevAccessProfiles } from "@/lib/data";
import { IS_DEV } from "@/lib/env/isDev";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { assertSameOrigin } from "@/lib/security/request";

const ALLOWED_ROLES = new Set(["admin", "client", "candidate"]);

async function resolveDevAccess(request: Request, roleInput: string | null) {
  if (!IS_DEV) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await checkRateLimitDistributed(`dev-access:${ip}`, 120, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const role = (roleInput ?? "").toLowerCase();

  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: "Unsupported role" }, { status: 400 });
  }

  const profiles = await getDevAccessProfiles();
  const profile = profiles.find((item) => item.label === role);

  if (!profile) {
    return NextResponse.json({ error: "Development profile not configured" }, { status: 404 });
  }

  return NextResponse.json({
    role: profile.role,
    email: profile.email,
    password: profile.password
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return resolveDevAccess(request, url.searchParams.get("role"));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { role?: string } | null;
  return resolveDevAccess(request, body?.role ?? null);
}
