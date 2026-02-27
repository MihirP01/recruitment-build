const DEV_AUTH_SECRET_FALLBACK = "ctrl-dev-suite-local-secret";

export function resolveAuthSecret(): string {
  const configured = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (configured && configured.trim().length > 0) {
    return configured;
  }

  if (process.env.NODE_ENV === "development") {
    return DEV_AUTH_SECRET_FALLBACK;
  }

  throw new Error("Missing NEXTAUTH_SECRET (or AUTH_SECRET) in production.");
}

