import { Role } from "@prisma/client";

export function isRole(role: string | undefined, allowed: Role[]): role is Role {
  return !!role && allowed.includes(role as Role);
}

export function rolePathPrefix(role: Role): string {
  switch (role) {
    case Role.CANDIDATE:
      return "/portal/candidate";
    case Role.RECRUITER:
      return "/dashboard/recruiter";
    case Role.CLIENT:
      return "/portal/client";
    case Role.SUPER_ADMIN:
      return "/portal/admin";
    default:
      return "/";
  }
}
