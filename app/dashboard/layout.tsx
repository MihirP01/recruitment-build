import { DashboardShell } from "@/components/dashboard/shell";
import { requireSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <DashboardShell role={session.user.role} email={session.user.email}>
      {children}
    </DashboardShell>
  );
}
