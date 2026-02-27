import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { rolePathPrefix } from "@/lib/auth/roles";

export default async function DashboardIndexPage() {
  const session = await requireSession();

  redirect(rolePathPrefix(session.user.role));
}
