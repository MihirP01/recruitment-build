import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { TenantSlug, inferTenantFromEmail } from "@/lib/portal/tenant";

export type CandidatePortalContext = {
  candidateName: string;
  candidateEmail: string;
  candidateId: string;
  lastLogin: string;
  tenant: TenantSlug;
};

function deriveCandidateName(email: string) {
  const localPart = email.split("@")[0] ?? "Candidate";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Candidate";
  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveCandidateReference(userId: string) {
  const digits = userId.replace(/\D/g, "");
  const serial = (digits.slice(-5) || "10428").padStart(5, "0");
  return `CTRL-CND-${serial}`;
}

function formatLastLogin() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `Today ${time}`;
}

export async function getCandidatePortalContext(): Promise<CandidatePortalContext> {
  const session = await requireRole([Role.CANDIDATE]);

  return {
    candidateName: deriveCandidateName(session.user.email),
    candidateEmail: session.user.email,
    candidateId: deriveCandidateReference(session.user.id),
    lastLogin: formatLastLogin(),
    tenant: inferTenantFromEmail(session.user.email)
  };
}
