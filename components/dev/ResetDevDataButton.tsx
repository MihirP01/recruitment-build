"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetDevDataButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/dev/reset", {
        method: "POST"
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; success?: boolean };
      if (!response.ok || !body.success) {
        setError(body.error ?? "Unable to reset development data.");
        return;
      }
      setSuccess("Development CSV data reset.");
      router.refresh();
    } catch {
      setError("Unable to reset development data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-amber-200">Development Suite</p>
      <p className="mt-1 text-sm text-amber-100/90">
        Reset local CSV tenant and assessment fixtures for repeatable workflow tests.
      </p>
      <button
        type="button"
        onClick={() => {
          void handleReset();
        }}
        disabled={loading}
        className="mt-3 rounded-md border border-white/20 bg-[#0B1220] px-3 py-2 text-sm font-medium text-[#E5E7EB] transition-colors hover:bg-[#11233d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Resetting..." : "Reset Dev Data"}
      </button>
      {error ? <p className="mt-2 text-xs text-rose-200">{error}</p> : null}
      {success ? <p className="mt-2 text-xs text-emerald-300">{success}</p> : null}
    </div>
  );
}

