import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import PortalClientShell from "@/components/portal/shared/PortalClientShell";
import { authOptions } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return <PortalClientShell session={session}>{children}</PortalClientShell>;
}
