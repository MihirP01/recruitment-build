import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";

export default async function AdminDashboardPage() {
  await requireRole([Role.SUPER_ADMIN]);
  redirect("/portal/admin");
}
