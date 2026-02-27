"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export function RegisterForm() {
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token))
      .catch(() => setError("Unable to initialize secure registration token."));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const cvFile = formData.get("cvFile");

    if (!(cvFile instanceof File) || cvFile.size === 0) {
      setLoading(false);
      setError("CV file is required.");
      return;
    }

    if (cvFile.size > MAX_CV_SIZE_BYTES) {
      setLoading(false);
      setError("CV file must be 5MB or less.");
      return;
    }

    if (!ALLOWED_CV_MIME_TYPES.has(cvFile.type)) {
      setLoading(false);
      setError("Allowed file formats are PDF, DOC, and DOCX.");
      return;
    }

    const payload = {
      code: String(formData.get("code") ?? "").toUpperCase(),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      fullName: String(formData.get("fullName") ?? "")
    };

    const registerResponse = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify(payload)
    });

    if (!registerResponse.ok) {
      const body = await registerResponse.json();
      setLoading(false);
      setError(body.error ?? "Registration failed.");
      return;
    }

    const loginResult = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      role: "CANDIDATE",
      redirect: false
    });

    if (loginResult?.error) {
      setLoading(false);
      setError("Registration completed, but automatic sign-in failed. Please log in to upload your CV securely.");
      setTimeout(() => {
        router.push("/login/candidate");
      }, 1400);
      return;
    }

    const csrfResponse = await fetch("/api/csrf");
    if (!csrfResponse.ok) {
      setLoading(false);
      setError("Registration completed, but CV upload token initialization failed.");
      return;
    }

    const { token: uploadCsrfToken } = (await csrfResponse.json()) as { token: string };

    const uploadFormData = new FormData();
    uploadFormData.append("cvFile", cvFile);

    const uploadResponse = await fetch("/api/upload/cv", {
      method: "POST",
      headers: {
        "X-CSRF-Token": uploadCsrfToken
      },
      body: uploadFormData
    });

    setLoading(false);

    if (!uploadResponse.ok) {
      const body = await uploadResponse.json();
      setError(body.error ?? "Registration completed, but CV upload failed.");
      return;
    }

    setSuccess("Registration and CV upload complete. Redirecting to candidate portal...");
    setTimeout(() => {
      router.push("/dashboard/candidate");
      router.refresh();
    }, 1200);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Candidate Registration</h1>
      <p className="text-sm text-slate-600">A valid recruiter-issued code is required.</p>
      <div className="space-y-1">
        <label htmlFor="code" className="text-sm font-medium">Access Code</label>
        <input id="code" name="code" required minLength={12} className="w-full uppercase" />
      </div>
      <div className="space-y-1">
        <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
        <input id="fullName" name="fullName" required className="w-full" />
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required className="w-full" />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required minLength={12} className="w-full" />
        <p className="text-xs text-slate-500">Minimum 12 chars with upper, lower, number, and symbol.</p>
      </div>
      <div className="space-y-1">
        <label htmlFor="cvFile" className="text-sm font-medium">CV Upload</label>
        <input
          id="cvFile"
          name="cvFile"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          className="w-full"
        />
        <p className="text-xs text-slate-500">Accepted: PDF, DOC, DOCX. Max size: 5MB.</p>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      <button disabled={loading || !csrfToken} className="w-full bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-60" type="submit">
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
