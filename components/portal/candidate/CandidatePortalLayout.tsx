import { ReactNode } from "react";
import PortalShell from "@/components/portal/shared/PortalShell";
import { TenantSlug } from "@/lib/portal/tenant";

export type CandidatePortalNavId =
  | "dashboard"
  | "assessments"
  | "messages"
  | "instructions"
  | "support"
  | "account"
  | "security";

type CandidatePortalLayoutProps = {
  candidateName: string;
  candidateEmail: string;
  candidateId: string;
  lastLogin: string;
  tenant: TenantSlug;
  activeNav: CandidatePortalNavId;
  sectionTitle: string;
  sectionDescription: string;
  children: ReactNode;
};

const navItems = [
  { id: "dashboard", label: "Dashboard", href: "/portal/candidate", icon: "layout-dashboard" },
  { id: "assessments", label: "My Assessments", href: "/portal/candidate/assessments", icon: "clipboard-list" },
  { id: "messages", label: "Messages", href: "/portal/candidate/messages", icon: "message-square" },
  { id: "instructions", label: "Instructions", href: "/portal/candidate/instructions", icon: "file-text" },
  { id: "support", label: "Support", href: "/portal/candidate/support", icon: "life-buoy" },
  { id: "account", label: "Account", href: "/portal/candidate/account", icon: "user-cog" },
  { id: "security", label: "Security & Consent", href: "/portal/candidate/security", icon: "lock-keyhole" }
] as const;

export default function CandidatePortalLayout({
  candidateName,
  candidateEmail,
  candidateId,
  lastLogin,
  tenant,
  activeNav,
  sectionTitle,
  sectionDescription,
  children
}: CandidatePortalLayoutProps) {
  return (
    <PortalShell
      role="candidate"
      tenant={tenant}
      portalLabel="Candidate Portal"
      sectionTitle={sectionTitle}
      sectionDescription={sectionDescription}
      userName={candidateName}
      userEmail={candidateEmail}
      referenceLabel="Candidate ID"
      referenceValue={candidateId}
      lastLogin={lastLogin}
      navItems={[...navItems]}
      activeNav={activeNav}
    >
      {children}
    </PortalShell>
  );
}
