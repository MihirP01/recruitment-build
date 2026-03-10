export const AUTH_ROLE_VALUES = ["CANDIDATE", "CLIENT", "RECRUITER", "SUPER_ADMIN"] as const;

export type AuthRole = (typeof AUTH_ROLE_VALUES)[number];

export const AUTH_ROLE = {
  CANDIDATE: "CANDIDATE",
  CLIENT: "CLIENT",
  RECRUITER: "RECRUITER",
  SUPER_ADMIN: "SUPER_ADMIN"
} as const satisfies Record<AuthRole, AuthRole>;

export function isAuthRole(value: unknown): value is AuthRole {
  return typeof value === "string" && AUTH_ROLE_VALUES.includes(value as AuthRole);
}
