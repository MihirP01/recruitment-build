"use client";

import { useEffect, useState } from "react";

export function CvViewButton({ candidateId }: { candidateId: string }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token))
      .catch(() => setError("Unable to initialize secure view token."));
  }, []);

  async function onViewCv() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/cv/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({ candidateId })
    });

    setLoading(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Unable to view CV");
      return;
    }

    const body = (await response.json()) as { url: string };
    window.open(body.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onViewCv}
        disabled={!csrfToken || loading}
        className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        {loading ? "Opening..." : "View CV"}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
