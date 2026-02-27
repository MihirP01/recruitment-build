"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithDevAccessRole } from "@/lib/auth/devAccessSignIn";

type DevButtonRole = "admin" | "client" | "candidate";

const BUTTONS: Array<{ key: DevButtonRole; label: string }> = [
  { key: "admin", label: "Login as Admin" },
  { key: "client", label: "Login as Client" },
  { key: "candidate", label: "Login as Candidate" }
];

export default function DevelopmentAccessPanel() {
  const [loadingRole, setLoadingRole] = useState<DevButtonRole | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDevSignIn = async (roleKey: DevButtonRole) => {
    setError("");
    setLoadingRole(roleKey);

    try {
      const result = await signInWithDevAccessRole(roleKey);
      if (!result.ok) {
        setError(result.error ?? "Development sign-in failed.");
        return;
      }

      router.push("/portal");
      router.refresh();
    } catch {
      setError("Development sign-in request failed.");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <section className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-amber-200">Development Access</p>
      <p className="mt-2 text-sm text-amber-100/90">
        Development simulation signs in through the credentials provider with local CSV-backed users.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {BUTTONS.map((button) => (
          <button
            key={button.key}
            type="button"
            onClick={() => {
              void handleDevSignIn(button.key);
            }}
            disabled={loadingRole !== null}
            className="rounded-md border border-white/20 bg-[#0B1220] px-4 py-2 text-sm font-medium text-[#E5E7EB] transition-colors hover:bg-[#11233d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingRole === button.key ? "Signing in..." : button.label}
          </button>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
    </section>
  );
}
