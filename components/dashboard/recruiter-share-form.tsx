"use client";

import { FormEvent, useEffect, useState } from "react";

type Candidate = {
  id: string;
  label: string;
};

type Client = {
  id: string;
  label: string;
};

export function RecruiterShareForm({ candidates, clients }: { candidates: Candidate[]; clients: Client[] }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token))
      .catch(() => setError("Could not initialize CSRF token"));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      candidateId: String(formData.get("candidateId") ?? ""),
      clientUserId: String(formData.get("clientUserId") ?? ""),
      recruiterNotes: String(formData.get("recruiterNotes") ?? "")
    };

    const response = await fetch("/api/recruiter/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify(payload)
    });

    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Failed to share candidate");
      return;
    }

    setMessage("Candidate shared successfully.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-base font-semibold">Push Candidate To Client</h3>
      <select name="candidateId" required>
        <option value="">Select candidate</option>
        {candidates.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
        ))}
      </select>
      <select name="clientUserId" required>
        <option value="">Select client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>{client.label}</option>
        ))}
      </select>
      <textarea name="recruiterNotes" rows={4} placeholder="Internal notes for client" />
      <button type="submit" disabled={!csrfToken} className="bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-60">Share Candidate</button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
