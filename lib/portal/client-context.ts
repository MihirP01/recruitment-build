import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { TenantSlug, inferTenantFromEmail } from "@/lib/portal/tenant";

export type ClientPortalContext = {
  clientName: string;
  clientEmail: string;
  clientId: string;
  lastLogin: string;
  tenant: TenantSlug;
};

function deriveDisplayName(email: string) {
  const localPart = email.split("@")[0] ?? "Client";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Client";
  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveClientReference(userId: string) {
  const digits = userId.replace(/\D/g, "");
  const serial = (digits.slice(-5) || "22104").padStart(5, "0");
  return `CTRL-CLT-${serial}`;
}

function formatLastLogin() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `Today ${time}`;
}

export async function getClientPortalContext(): Promise<ClientPortalContext> {
  const session = await requireRole([Role.CLIENT]);

  return {
    clientName: deriveDisplayName(session.user.email),
    clientEmail: session.user.email,
    clientId: deriveClientReference(session.user.id),
    lastLogin: formatLastLogin(),
    tenant: inferTenantFromEmail(session.user.email)
  };
}
