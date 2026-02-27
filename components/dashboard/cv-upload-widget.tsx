"use client";

import { FormEvent, useEffect, useState } from "react";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export function CandidateCvUploadWidget({ hasUploadedCv }: { hasUploadedCv: boolean }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token))
      .catch(() => setError("Unable to initialize secure upload token."));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("cvFile");

    if (!(file instanceof File) || file.size === 0) {
      setLoading(false);
      setError("Please choose a CV file.");
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setLoading(false);
      setError("File must be 5MB or smaller.");
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      setLoading(false);
      setError("Allowed formats: PDF, DOC, DOCX.");
      return;
    }

    const uploadForm = new FormData();
    uploadForm.append("cvFile", file);

    const response = await fetch("/api/upload/cv", {
      method: "POST",
      headers: {
        "X-CSRF-Token": csrfToken
      },
      body: uploadForm
    });

    setLoading(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "CV upload failed.");
      return;
    }

    setMessage("CV uploaded securely.");
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold">CV Upload</h2>
      <p className="mt-1 text-sm text-slate-600">
        {hasUploadedCv ? "A CV is currently on file. Uploading again replaces the stored version." : "No CV on file yet."}
      </p>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          id="candidate-cv"
          name="cvFile"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          className="w-full"
        />
        <button type="submit" disabled={!csrfToken || loading} className="bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-60">
          {loading ? "Uploading..." : "Upload CV"}
        </button>
      </form>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
