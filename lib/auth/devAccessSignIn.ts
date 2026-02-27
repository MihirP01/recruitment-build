"use client";

import { Role } from "@prisma/client";
import { signIn } from "next-auth/react";

export type DevAccessRole = "admin" | "client" | "candidate";

type DevAccessPayload = {
  role?: Role;
  email?: string;
  password?: string;
  error?: string;
};

export async function signInWithDevAccessRole(role: DevAccessRole): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch("/api/dev/access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role })
  });

  const payload = (await response.json().catch(() => ({}))) as DevAccessPayload;
  if (!response.ok || !payload.role || !payload.email || !payload.password) {
    return { ok: false, error: payload.error ?? "Development profile unavailable." };
  }

  const result = await signIn("credentials", {
    email: payload.email,
    password: payload.password,
    role: payload.role,
    callbackUrl: "/portal",
    redirect: false
  });

  if (result?.error) {
    return { ok: false, error: "Development sign-in failed." };
  }

  return { ok: true };
}

