import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { listAuditLogs } from "@/lib/services/audit";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await listAuditLogs(100);

  return NextResponse.json({ logs });
}
