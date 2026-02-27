"use client";

import { FormEvent, useEffect, useState } from "react";

type Assessment = {
  id: string;
  title: string;
};

export function RecruiterCodeGenerator({ assessments }: { assessments: Assessment[] }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token))
      .catch(() => setError("Could not initialize CSRF token"));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCode("");

    const formData = new FormData(event.currentTarget);
    const assessmentId = String(formData.get("assessmentId") ?? "");
    const expiresInDays = Number(formData.get("expiresInDays") ?? 7);

    const response = await fetch("/api/codes/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({ assessmentId, expiresInDays })
    });

    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Failed to generate code");
      return;
    }

    setCode(body.code);
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-base font-semibold">Generate Candidate Access Code</h3>
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
        <select name="assessmentId" required>
          <option value="">Select Assessment</option>
          {assessments.map((assessment) => (
            <option key={assessment.id} value={assessment.id}>{assessment.title}</option>
          ))}
        </select>
        <input name="expiresInDays" type="number" min={1} max={30} defaultValue={7} required />
        <button type="submit" className="bg-brand-700 text-white hover:bg-brand-900" disabled={!csrfToken}>Generate</button>
      </form>
      {code ? <p className="text-sm font-semibold text-emerald-700">Code (show once): {code}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
