import { AUTH_ROLE, type AuthRole } from "@/lib/auth/role";

export function isRole(role: string | undefined, allowed: AuthRole[]): role is AuthRole {
  return !!role && allowed.includes(role as AuthRole);
}

export function rolePathPrefix(role: AuthRole): string {
  switch (role) {
    case AUTH_ROLE.CANDIDATE:
      return "/portal/candidate";
    case AUTH_ROLE.RECRUITER:
      return "/dashboard/recruiter";
    case AUTH_ROLE.CLIENT:
      return "/portal/client";
    case AUTH_ROLE.SUPER_ADMIN:
      return "/portal/admin";
    default:
      return "/";
  }
}
