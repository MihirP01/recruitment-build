import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { TenantSlug, inferTenantFromEmail } from "@/lib/portal/tenant";

export type AdminPortalContext = {
  adminName: string;
  adminEmail: string;
  adminId: string;
  lastLogin: string;
  tenant: TenantSlug;
};

function deriveDisplayName(email: string) {
  const localPart = email.split("@")[0] ?? "Admin";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Admin";
  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveAdminReference(userId: string) {
  const digits = userId.replace(/\D/g, "");
  const serial = (digits.slice(-5) || "00001").padStart(5, "0");
  return `CTRL-ADM-${serial}`;
}

function formatLastLogin() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `Today ${time}`;
}

export async function getAdminPortalContext(): Promise<AdminPortalContext> {
  const session = await requireRole([Role.SUPER_ADMIN]);

  return {
    adminName: deriveDisplayName(session.user.email),
    adminEmail: session.user.email,
    adminId: deriveAdminReference(session.user.id),
    lastLogin: formatLastLogin(),
    tenant: inferTenantFromEmail(session.user.email)
  };
}
