import Link from "next/link";
import { Role } from "@prisma/client";
import { SignOutButton } from "@/components/auth/signout-button";

type NavItem = {
  href: string;
  label: string;
};

function navByRole(role: Role): NavItem[] {
  if (role === Role.CANDIDATE) {
    return [{ href: "/dashboard/candidate", label: "Assessment" }];
  }
  if (role === Role.RECRUITER) {
    return [
      { href: "/dashboard/recruiter", label: "Overview" },
      { href: "/dashboard/recruiter/codes", label: "Access Codes" },
      { href: "/dashboard/recruiter/candidates", label: "Candidates" },
      { href: "/dashboard/recruiter/clients", label: "Clients" }
    ];
  }
  if (role === Role.CLIENT) {
    return [{ href: "/dashboard/client", label: "Shared Candidates" }];
  }
  return [{ href: "/dashboard/admin", label: "Audit" }];
}

export function DashboardShell({
  role,
  email,
  children
}: {
  role: Role;
  email: string;
  children: React.ReactNode;
}) {
  const navItems = navByRole(role);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">CTRL (Control Room Talent, Recruitment and Logic)</p>
            <h1 className="text-lg font-semibold text-slate-900">{role.replace("_", " ")} Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-600">{email}</p>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="rounded-xl border border-slate-200 bg-white p-6">{children}</section>
      </div>
    </div>
  );
}
