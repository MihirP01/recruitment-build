import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";

export default async function CandidateDashboardPage() {
  await requireRole([Role.CANDIDATE]);
  redirect("/portal/candidate");
}
