"use client";

import { Role } from "@prisma/client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { rolePathPrefix } from "@/lib/auth/roles";

type LoginFormProps = {
  role: Role;
};

function roleDashboard(role: Role): string {
  return rolePathPrefix(role);
}

export function LoginForm({ role }: LoginFormProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const title = useMemo(() => `${role.toLowerCase()} login`, [role]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      role,
      callbackUrl: roleDashboard(role),
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials, locked account, or role mismatch.");
      return;
    }

    router.push(roleDashboard(role));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold capitalize">{title}</h1>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="w-full" />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="w-full" />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={loading} className="w-full bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-60">
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
