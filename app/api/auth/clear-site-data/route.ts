import { NextResponse } from "next/server";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { assertSameOrigin } from "@/lib/security/request";

function noStoreJson(body: Record<string, unknown>, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return noStoreJson({ error: "Invalid request origin" }, 403);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await checkRateLimitDistributed(`auth-clear-site-data:${ip}`, 120, 15 * 60 * 1000))) {
    return noStoreJson({ error: "Too many requests" }, 429);
  }

  const response = noStoreJson({ ok: true });
  response.headers.set("Clear-Site-Data", "\"cache\", \"cookies\", \"storage\"");
  return response;
}
