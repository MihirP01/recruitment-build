export type TenantSlug = "met-police" | "nhs";

export function inferTenantFromEmail(email: string): TenantSlug {
  const normalized = email.toLowerCase();
  if (normalized.includes("nhs")) {
    return "nhs";
  }
  return "met-police";
}
