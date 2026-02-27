import { headers } from "next/headers";

export function getRequestMeta() {
  const h = headers();
  return {
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    userAgent: h.get("user-agent") ?? "unknown"
  };
}

export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
