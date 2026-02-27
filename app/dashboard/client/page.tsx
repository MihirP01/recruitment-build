import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";

export default async function ClientDashboardPage() {
  await requireRole([Role.CLIENT]);
  redirect("/portal/client");
}
