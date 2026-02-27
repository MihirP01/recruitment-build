import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { resetDevData } from "@/lib/data";
import { IS_DEV } from "@/lib/env/isDev";
import { checkRateLimitDistributed } from "@/lib/security/rate-limit-distributed";
import { assertSameOrigin } from "@/lib/security/request";

export async function POST(request: Request) {
  if (!IS_DEV) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await checkRateLimitDistributed(`dev-reset:${ip}`, 12, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many reset attempts" }, { status: 429 });
  }

  await resetDevData();
  return NextResponse.json({ success: true });
}
